# 🚀 ATSense — AI Resume Intelligence Platform

> **Analyze. Optimize. Get Hired.**

ATSense is an AI-powered resume analysis platform that helps job seekers understand how their resume performs against **Applicant Tracking Systems (ATS)** and specific job descriptions.

It analyzes your resume, calculates an **ATS compatibility score**, identifies missing keywords, highlights weaknesses, and provides actionable AI-powered recommendations to improve your chances of getting shortlisted.

---

## ✨ Features

### 📄 Resume Analysis

* Upload your resume and extract its content automatically.
* Analyze resume structure, sections, skills, experience, and education.
* Detect potential ATS readability issues.

### 🎯 ATS Score

* Get an overall **ATS compatibility score**.
* Evaluate resume quality based on important ATS factors.
* Identify areas that are reducing your score.

### 🤖 AI-Powered Feedback

* AI-generated resume improvement suggestions.
* Identify weak or unclear sections.
* Get recommendations for improving resume content.
* Generate more impactful resume bullet points.

### 🔎 Job Description Matching

* Paste a target job description.
* Compare your resume against the job requirements.
* Identify matching and missing keywords.
* Analyze skill compatibility.

### 🧠 Keyword Analysis

* Detect important technical and soft skills.
* Identify missing job-specific keywords.
* Highlight keywords already present in the resume.
* Improve keyword relevance without unnecessary keyword stuffing.

### 📊 Resume Insights

* Resume score breakdown.
* Skill match percentage.
* Keyword analysis.
* Section-level feedback.
* Actionable improvement suggestions.

### 💻 Modern Dashboard

* Clean and responsive interface.
* Interactive score visualization.
* Resume analysis history.
* Easy-to-understand insights.

---

# 🛠️ Tech Stack

## Frontend

* **React.js**
* **JavaScript**
* **HTML5**
* **CSS3**
* **Tailwind CSS**
* **Axios**
* **React Router**

## Backend

* **Node.js**
* **Express.js**
* **MongoDB**
* **Mongoose**
* **JWT Authentication**
* **Multer**

## AI & Processing

* **Generative AI / LLM API**
* Resume text extraction
* Natural Language Processing
* Keyword matching
* Job-description analysis
* AI-powered recommendations

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │      ATSense UI      │
                    │       React.js       │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │    Express Server    │
                    │      Node.js         │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
       │   MongoDB   │  │ Resume      │  │     AI      │
       │   Database  │  │ Processing  │  │   Engine    │
       └─────────────┘  └─────────────┘  └─────────────┘
                               │                │
                               └───────┬────────┘
                                       ▼
                              ┌─────────────────┐
                              │ Resume Analysis │
                              │   & ATS Score   │
                              └─────────────────┘
```

---

# 📂 Project Structure

```text
ATSense/
│
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── hooks/
│       ├── services/
│       ├── utils/
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── uploads/
│   ├── app.js
│   └── server.js
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

# ⚙️ How ATSense Works

### 1️⃣ Upload Resume

The user uploads a resume in a supported format.

```text
Resume
  ↓
File Upload
  ↓
Text Extraction
```

### 2️⃣ Enter Job Description

The user provides the job description for the role they are targeting.

```text
Job Description
       ↓
Requirement Extraction
       ↓
Skills + Keywords
```

### 3️⃣ AI Analysis

ATSense compares the resume with the job requirements.

```text
Resume
   +
Job Description
   ↓
AI Analysis Engine
   ↓
┌──────────────────────────┐
│ Skills Match             │
│ Keyword Match            │
│ Experience Relevance     │
│ Resume Structure         │
│ ATS Compatibility        │
└──────────────────────────┘
```

### 4️⃣ ATS Score

The platform generates an overall compatibility score.

```text
              ATS SCORE
                 │
        ┌────────┴────────┐
        │                 │
   Resume Quality     Job Matching
        │                 │
        └────────┬────────┘
                 ▼
          Final ATS Score
```

### 5️⃣ Optimization

The user receives actionable recommendations to improve the resume.

---

# 📊 Example Analysis

```text
╔════════════════════════════════════╗
║          ATSense Analysis           ║
╠════════════════════════════════════╣
║                                    ║
║          ATS SCORE: 82/100         ║
║                                    ║
║  Keyword Match       ████████░░ 82%║
║  Skills Match        █████████░ 90%║
║  Experience          ████████░░ 80%║
║  Formatting          █████████░ 92%║
║  Job Relevance       ███████░░░ 72%║
║                                    ║
╠════════════════════════════════════╣
║ Missing Keywords:                  ║
║ • REST API                         ║
║ • Docker                           ║
║ • CI/CD                            ║
║                                    ║
║ Recommendations:                   ║
║ • Add measurable achievements      ║
║ • Improve project descriptions     ║
║ • Include relevant technical skills║
╚════════════════════════════════════╝
```

---

# 🔐 Authentication

ATSense uses secure authentication to protect user data.

* User registration
* User login
* JWT-based authentication
* Protected API routes
* Secure password handling
* User-specific resume history

---

# 🔌 API Overview

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Resume

```http
POST   /api/resume/upload
GET    /api/resume
GET    /api/resume/:id
DELETE /api/resume/:id
```

### Analysis

```http
POST /api/analysis/analyze
GET  /api/analysis/:id
```

### Job Matching

```http
POST /api/job/match
GET  /api/job/:id
```

> API routes can be modified according to the final backend implementation.

---

# 🚀 Getting Started

## Prerequisites

Make sure you have installed:

* Node.js
* npm
* MongoDB
* Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/yourusername/atsense.git

cd atsense
```

---

## 2. Install Dependencies

### Frontend

```bash
cd client
npm install
```

### Backend

```bash
cd ../server
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

AI_API_KEY=your_ai_api_key
```

---

## 4. Start Backend

```bash
cd server
npm run dev
```

---

## 5. Start Frontend

Open another terminal:

```bash
cd client
npm run dev
```

The application will then be available locally through the URL shown by your frontend development server.

---

# 🔮 Future Enhancements

* 📄 AI Resume Builder
* ✍️ AI-powered bullet point rewriting
* 🎨 Multiple professional resume templates
* 📥 Resume PDF export
* 🔗 LinkedIn profile analysis
* 💼 Job recommendation engine
* 📈 Resume version tracking
* 🧠 Personalized career recommendations
* 📊 Recruiter-style resume evaluation
* 🌐 Chrome extension for job portals
* 📧 Job application tracking
* 🗣️ AI interview preparation
* 🎤 AI mock interviews

---

# 🎯 Use Cases

ATSense can help:

* 👨‍🎓 Students preparing for placements
* 💼 Freshers applying for jobs
* 👨‍💻 Software developers targeting technical roles
* 🔄 Professionals switching careers
* 📈 Candidates optimizing resumes for specific job descriptions
* 🎯 Anyone looking to improve their resume's ATS compatibility

---

# ⚠️ Disclaimer

ATSense provides an **estimated ATS compatibility score** based on resume structure, keywords, job-description matching, and AI-generated analysis.

Actual ATS systems vary between companies and recruiting platforms, so the score should be treated as a **guideline rather than a guarantee of getting shortlisted**.

---

# 🤝 Contributing

Contributions are welcome!

```bash
# Fork the repository

# Create a new branch
git checkout -b feature/new-feature

# Commit your changes
git commit -m "Add new feature"

# Push your branch
git push origin feature/new-feature
```

Then open a Pull Request.

---

# 📜 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Author

**Shivansh Saxena**

Full Stack Developer | AI/ML Enthusiast

---

## ⭐ Support

If you find **ATSense** useful, consider giving the repository a ⭐ on GitHub.

> **ATSense — Analyze. Optimize. Get Hired. 🚀**
