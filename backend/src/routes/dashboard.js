const express = require("express");

const asyncHandler = require("../utils/asyncHandler");
const { requireAuth } = require("../middleware/auth");

const Resume = require("../models/resume");
const ResumeVersion = require("../models/ResumeVersion");
const Analysis = require("../models/Analysis");

const router = express.Router();

router.use(requireAuth);

router.get(
    "/",
    asyncHandler(async (req, res) => {
        const userId = req.user._id;

        // --------------------------------------------------
        // 1. GET USER RESUMES
        // --------------------------------------------------

        const resumes = await Resume.find({ userId })
            .sort({ updatedAt: -1 })
            .lean();

        const resumeIds = resumes.map((r) => r._id);

        // --------------------------------------------------
        // 2. BASIC COUNTS
        // --------------------------------------------------

        const [rewriteCount, analysisCount] = await Promise.all([
            ResumeVersion.countDocuments({
                resumeId: { $in: resumeIds },
                sourceType: "rewrite",
            }),

            Analysis.countDocuments({
                userId,
            }),
        ]);

        // --------------------------------------------------
        // 3. LATEST RESUME
        // --------------------------------------------------

        const latestResumeMeta = resumes[0] || null;

        let latestResume = null;
        let scoreSeries = [];
        let versionStack = [];

        if (latestResumeMeta) {
            const versions = await ResumeVersion.find({
                resumeId: latestResumeMeta._id,
            })
                .sort({ versionNumber: 1 })
                .lean();

            // Get latest analysis IDs attached to versions
            const analysisIds = versions
                .map((v) => v.latestAnalysisId)
                .filter(Boolean);

            const analyses = analysisIds.length
                ? await Analysis.find({
                    _id: { $in: analysisIds },
                })
                    .select(
                        "_id atsScore versionId createdAt"
                    )
                    .lean()
                : [];

            // Map versionId -> ATS score
            const scoreByVersion = new Map(
                analyses.map((a) => [
                    a.versionId.toString(),
                    a.atsScore,
                ])
            );

            // Add scores to versions
            const versionsWithScores = versions.map((v) => ({
                id: v._id,
                label: v.label,
                versionNumber: v.versionNumber,
                sourceType: v.sourceType,
                createdAt: v.createdAt,

                score:
                    scoreByVersion.get(
                        v._id.toString()
                    ) ?? null,
            }));

            // --------------------------------------------------
            // SCORE SERIES
            // --------------------------------------------------

            scoreSeries = versionsWithScores
                .filter((v) => v.score !== null)
                .map((v) => ({
                    label: v.label,
                    score: v.score,
                    versionId: v.id,
                    at: v.createdAt,
                }));

            // --------------------------------------------------
            // LAST 3 VERSIONS
            // --------------------------------------------------

            const last3 = versionsWithScores.slice(-3);

            versionStack = last3.map((v, i, arr) => {
                const prev = arr[i - 1];

                const currentScore =
                    typeof v?.score === "number"
                        ? v.score
                        : 0;

                const previousScore =
                    typeof prev?.score === "number"
                        ? prev.score
                        : 0;

                const delta = prev
                    ? currentScore - previousScore
                    : 0;

                return {
                    id: v?.id,
                    label: v?.label || "",
                    title:
                        v?.sourceType === "upload"
                            ? "Upload"
                            : v?.sourceType === "rewrite"
                                ? "Rewrite pass"
                                : v?.label || "",
                    score: currentScore,
                    delta,
                };
            });

            // --------------------------------------------------
            // LATEST RESUME OBJECT
            // --------------------------------------------------

            latestResume = {
                id: latestResumeMeta._id,
                title: latestResumeMeta.title,

                latestVersionNumber:
                    latestResumeMeta.latestVersionNumber,

                updatedAt: latestResumeMeta.updatedAt,

                currentVersionId:
                    latestResumeMeta.currentVersionId,
            };
        }

        // --------------------------------------------------
        // 4. GET ALL ANALYSES
        // IMPORTANT:
        // This must happen BEFORE KPI calculations.
        // --------------------------------------------------

        const allAnalyses = await Analysis.find({
            userId,
        })
            .select(
                "atsScore keywordsPresent keywordsMissing issues createdAt resumeId versionId"
            )
            .sort({ createdAt: 1 })
            .lean();

        // --------------------------------------------------
        // 5. LATEST / PREVIOUS ANALYSIS
        // --------------------------------------------------

        const latestAnalysis =
            allAnalyses[allAnalyses.length - 1] || null;

        const prevAnalysis =
            allAnalyses[allAnalyses.length - 2] || null;

        // --------------------------------------------------
        // 6. SPARKLINE DATA
        // --------------------------------------------------

        // FIX:
        // atsScore comes from Analysis, NOT Resume
        const scoreSpark = allAnalyses
            .slice(-10)
            .map((a) => ({
                v: a.atsScore,
            }));

        const versionsSpark = resumes
            .slice(0, 10)
            .reverse()
            .map((r) => ({
                v: r.latestVersionNumber || 1,
            }));

        const keywordsSpark = allAnalyses
            .slice(-10)
            .map((a) => ({
                v: (a.keywordsPresent || []).length,
            }));

        const issuesSpark = allAnalyses
            .slice(-10)
            .map((a) => ({
                v: (a.issues || []).length,
            }));

        // --------------------------------------------------
        // 7. KPI DATA
        // --------------------------------------------------

        const kpi = {
            // ATS SCORE
            atsScore: {
                value:
                    latestAnalysis?.atsScore ?? null,

                delta:
                    latestAnalysis && prevAnalysis
                        ? latestAnalysis.atsScore -
                        prevAnalysis.atsScore
                        : null,

                spark: scoreSpark,
            },

            // TOTAL VERSIONS
            versions: {
                value: resumes.reduce(
                    (sum, r) =>
                        sum +
                        (r.latestVersionNumber || 1),
                    0
                ),

                delta: null,

                spark: versionsSpark,
            },

            // ISSUES IDENTIFIED
            issuesIdentified: {
                value: latestAnalysis
                    ? (
                        latestAnalysis.issues || []
                    ).length
                    : null,

                delta:
                    latestAnalysis && prevAnalysis
                        ? (
                            latestAnalysis.issues ||
                            []
                        ).length -
                        (
                            prevAnalysis.issues ||
                            []
                        ).length
                        : null,

                spark: issuesSpark,
            },

            // KEYWORDS MATCHED
            keywordsMatched: {
                value: latestAnalysis
                    ? (
                        latestAnalysis.keywordsPresent ||
                        []
                    ).length
                    : null,

                total: latestAnalysis
                    ? (
                        latestAnalysis.keywordsPresent ||
                        []
                    ).length +
                    (
                        latestAnalysis.keywordsMissing ||
                        []
                    ).length
                    : null,

                delta:
                    latestAnalysis && prevAnalysis
                        ? (
                            latestAnalysis.keywordsPresent ||
                            []
                        ).length -
                        (
                            prevAnalysis.keywordsPresent ||
                            []
                        ).length
                        : null,

                spark: keywordsSpark,
            },
        };

        // --------------------------------------------------
        // 8. RESUME MAP
        // --------------------------------------------------

        const resumeMap = new Map(
            resumes.map((r) => [
                r._id.toString(),
                r,
            ])
        );

        // --------------------------------------------------
        // 9. RECENT VERSIONS + ANALYSES
        // --------------------------------------------------

        const [
            recentVersions,
            recentAnalyses,
        ] = await Promise.all([
            ResumeVersion.find({
                resumeId: { $in: resumeIds },
            })
                .sort({ createdAt: -1 })
                .limit(10)
                .select(
                    "resumeId label versionNumber sourceType createdAt"
                )
                .lean(),

            Analysis.find({
                userId,
            })
                .sort({ createdAt: -1 })
                .limit(10)
                .select(
                    "resumeId versionId atsScore createdAt"
                )
                .lean(),
        ]);

        // --------------------------------------------------
        // 10. ACTIVITY EVENTS
        // --------------------------------------------------

        const events = [];

        // Upload events
        for (const r of resumes.slice(0, 10)) {
            events.push({
                id: `r-${r._id}`,
                type: "upload",

                title: `${r.title} uploaded`,

                subtitle:
                    "Parsed and version V1 created",

                label: "V1",

                at: r.createdAt,

                resumeId: r._id,
            });
        }

        // Rewrite events
        for (const v of recentVersions) {
            if (v.sourceType !== "rewrite") {
                continue;
            }

            const resume = resumeMap.get(
                v.resumeId.toString()
            );

            events.push({
                id: `v-${v._id}`,

                type: "rewrite",

                title: `${v.label} created for ${resume?.title || "resume"
                    }`,

                subtitle: "Rewrites applied",

                label: `${v.label} created`,

                at: v.createdAt,

                resumeId: v.resumeId,
            });
        }

        // Analysis events
        for (const a of recentAnalyses) {
            const resume = resumeMap.get(
                a.resumeId.toString()
            );

            events.push({
                id: `a-${a._id}`,

                type: "analyze",

                title: `Analysis complete on ${resume?.title || "resume"
                    }`,

                subtitle: `ATS score ${a.atsScore} / 100`,

                label: `Score ${a.atsScore}`,

                at: a.createdAt,

                resumeId: a.resumeId,
            });
        }

        // --------------------------------------------------
        // 11. SORT ACTIVITY
        // --------------------------------------------------

        const activity = events
            .sort(
                (a, b) =>
                    new Date(b.at) -
                    new Date(a.at)
            )
            .slice(0, 8);

        // --------------------------------------------------
        // 12. FINAL RESPONSE
        // --------------------------------------------------

        res.json({
            totals: {
                resumes: resumes.length,
                rewrites: rewriteCount,
                analyses: analysisCount,
                exports: 0,
            },

            latestResume,

            scoreSeries,

            versionStack,

            kpi,

            activity,
        });
    })
);

module.exports = router;