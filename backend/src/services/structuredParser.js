const { GoogleGenAI, Type } = require("@google/genai");
const z = require("zod");

const env = require("../config/env");
const ApiError = require("../utils/ApiError");

const ai = env.geminiApiKey
    ? new GoogleGenAI({ apiKey: env.geminiApiKey })
    : null;

// --------------------------------------------------
// GEMINI RESPONSE SCHEMA
// --------------------------------------------------

const linkSchema = {
    type: Type.OBJECT,
    required: ["label", "url"],
    properties: {
        label: { type: Type.STRING },
        url: { type: Type.STRING },
    },
};

const responseSchema = {
    type: Type.OBJECT,

    required: [
        "basics",
        "summary",
        "experience",
        "education",
        "skills",
        "projects",
        "certifications",
        "languages",
        "interests",
    ],

    properties: {
        basics: {
            type: Type.OBJECT,
            required: [
                "name",
                "title",
                "location",
                "email",
                "phone",
                "links",
            ],
            properties: {
                name: { type: Type.STRING },
                title: { type: Type.STRING },
                location: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                links: {
                    type: Type.ARRAY,
                    items: linkSchema,
                },
            },
        },

        summary: {
            type: Type.STRING,
        },

        experience: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                required: [
                    "company",
                    "role",
                    "period",
                    "bullets",
                ],
                properties: {
                    company: { type: Type.STRING },
                    role: { type: Type.STRING },
                    location: { type: Type.STRING },
                    period: { type: Type.STRING },
                    bullets: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                    },
                },
            },
        },

        education: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                required: [
                    "degree",
                    "school",
                    "period",
                ],
                properties: {
                    degree: { type: Type.STRING },
                    school: { type: Type.STRING },
                    location: { type: Type.STRING },
                    period: { type: Type.STRING },
                    details: { type: Type.STRING },
                },
            },
        },

        skills: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
            },
        },

        projects: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                required: [
                    "name",
                    "description",
                ],
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    tech: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                    },
                    links: {
                        type: Type.ARRAY,
                        items: linkSchema,
                    },
                },
            },
        },

        certifications: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                required: ["name"],
                properties: {
                    name: { type: Type.STRING },
                    issuer: { type: Type.STRING },
                    year: { type: Type.STRING },
                },
            },
        },

        languages: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
            },
        },

        interests: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
            },
        },
    },
};

// --------------------------------------------------
// ZOD VALIDATOR
// --------------------------------------------------

const validator = z.object({
    basics: z.object({
        name: z.string().default(""),
        title: z.string().default(""),
        location: z.string().default(""),
        email: z.string().default(""),
        phone: z.string().default(""),

        links: z
            .array(
                z.object({
                    label: z.string(),
                    url: z.string(),
                })
            )
            .default([]),
    }),

    summary: z.string().default(""),

    experience: z
        .array(
            z.object({
                company: z.string().default(""),
                role: z.string().default(""),
                location: z.string().default(""),
                period: z.string().default(""),
                bullets: z.array(z.string()).default([]),
            })
        )
        .default([]),

    education: z
        .array(
            z.object({
                degree: z.string().default(""),
                school: z.string().default(""),
                location: z.string().default(""),
                period: z.string().default(""),
                details: z.string().default(""),
            })
        )
        .default([]),

    skills: z.array(z.string()).default([]),

    projects: z
        .array(
            z.object({
                name: z.string().default(""),
                description: z.string().default(""),
                tech: z.array(z.string()).default([]),

                links: z
                    .array(
                        z.object({
                            label: z.string(),
                            url: z.string(),
                        })
                    )
                    .default([]),
            })
        )
        .default([]),

    certifications: z
        .array(
            z.object({
                name: z.string().default(""),
                issuer: z.string().default(""),
                year: z.string().default(""),
            })
        )
        .default([]),

    languages: z.array(z.string()).default([]),

    interests: z.array(z.string()).default([]),
});

// --------------------------------------------------
// PROMPT
// --------------------------------------------------

function buildPrompt(rawText) {
    return [
        "You are a resume parser.",
        "The input is text extracted from a PDF.",
        "The text may be jumbled because of PDF layout.",
        "",
        "Extract the resume into the exact JSON structure provided.",
        "",
        "Extract:",
        "- basics: name, professional title, location, email, phone and links",
        "- summary: professional summary",
        "- experience: jobs, company, role, period, location and bullets",
        "- education: degree, school, period, location and details",
        "- skills: all technical skills as a flat array",
        "- projects: project name, description, technologies and links",
        "- certifications: certification name, issuer and year",
        "- languages",
        "- interests",
        "",
        "IMPORTANT RULES:",
        "- Extract information from the resume text.",
        "- Do NOT invent information.",
        "- Do NOT leave a field empty if the information is clearly present.",
        "- Preserve names, emails, phone numbers and URLs exactly.",
        "- Extract ALL skills that are clearly listed.",
        "- Extract ALL projects that are clearly listed.",
        "- Extract ALL work experience.",
        "- Extract ALL education entries.",
        "- If a field is not present, use an empty string or empty array.",
        "- Return ONLY valid JSON.",
        "",
        "RESUME TEXT:",
        "--------------------",
        rawText,
        "--------------------",
    ].join("\n");
}

// --------------------------------------------------
// PARSE RESUME
// --------------------------------------------------

async function parseResume(rawText) {

    // 1. Check extracted text
    if (!rawText || !rawText.trim()) {
        throw ApiError.badRequest(
            "No text could be extracted from the uploaded PDF"
        );
    }

    // 2. Check Gemini configuration
    if (!ai) {
        throw ApiError.internal(
            "Gemini API is not configured. Please check GEMINI_API_KEY in your .env file."
        );
    }

    console.log("Gemini configured: true");
    console.log("Gemini model:", env.geminiModel);
    console.log("Resume text length:", rawText.length);

    const prompt = buildPrompt(rawText);

    for (let attempt = 1; attempt <= 2; attempt++) {

        try {

            console.log(
                `Parsing resume with Gemini... Attempt ${attempt}`
            );

            const result = await ai.models.generateContent({
                model: env.geminiModel,

                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: prompt,
                            },
                        ],
                    },
                ],

                config: {
                    responseMimeType: "application/json",
                    responseSchema,
                    temperature: 0.1,
                },
            });

            const text =
                typeof result.text === "function"
                    ? result.text()
                    : result.text;

            if (!text) {
                throw new Error(
                    "Gemini returned an empty response"
                );
            }

            console.log(
                "Gemini response received successfully"
            );

            const parsed = JSON.parse(text);

            const validated = validator.parse(parsed);

            console.log(
                "Resume successfully parsed and validated"
            );

            console.dir(validated, {
                depth: null,
            });

            return validated;

        } catch (err) {

            console.error(
                `Resume parsing attempt ${attempt} failed:`
            );

            console.error(err);

            if (attempt === 2) {
                throw ApiError.internal(
                    `Resume parsing failed: ${err.message}`
                );
            }
        }
    }
}

module.exports = {
    parseResume,
};