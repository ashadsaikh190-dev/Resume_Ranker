# Automated Resume Screener & Skill-Matcher

> A full-stack **MERN** (MongoDB, Express.js, React.js, Node.js) application that automates resume screening by uploading PDF resumes, extracting text, accepting job descriptions, and ranking candidates based on keyword-match percentage.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Functional Requirements Implemented](#functional-requirements-implemented)
4. [System Architecture](#system-architecture)
5. [Project Structure](#project-structure)
6. [Data Flow](#data-flow)
7. [Database Models](#database-models)
8. [API Endpoints](#api-endpoints)
9. [Frontend Pages & Components](#frontend-pages--components)
10. [Matching Algorithm](#matching-algorithm)
11. [Error Handling](#error-handling)
12. [Setup & Installation](#setup--installation)
13. [How to Use](#how-to-use)

---

## Project Overview

In a traditional hiring process, recruiters manually read through hundreds of resumes to find matching candidates for a job position. This is time-consuming and error-prone.

**Automated Resume Screener** solves this by:

1. Allowing batch upload of PDF resumes (up to 100 at a time).
2. Automatically extracting text from each PDF using `pdf-parse`.
3. Accepting job descriptions with title and detailed requirements.
4. Comparing each resume's content against the job description using keyword matching.
5. Ranking all candidates by match percentage on a Dashboard.

---

## Tech Stack

| Layer        | Technology     | Purpose                              |
|--------------|---------------|--------------------------------------|
| **Frontend** | React.js 19   | Single-Page Application (SPA) UI     |
| **Bundler**  | Vite           | Fast dev server & production builds  |
| **Routing**  | React Router 7 | Client-side page navigation          |
| **HTTP**     | Axios          | API calls from frontend to backend   |
| **Backend**  | Node.js        | JavaScript runtime for the server    |
| **Framework**| Express.js 4   | REST API framework                   |
| **Database** | MongoDB        | NoSQL document database              |
| **ODM**      | Mongoose 8     | MongoDB object modeling for Node.js  |
| **Upload**   | Multer         | Multipart/form-data file handling    |
| **PDF**      | pdf-parse      | PDF text extraction                  |
| **Logging**  | Morgan         | HTTP request logger                  |

---

## Functional Requirements Implemented

| FR   | Feature                  | Description                                                    |
|------|--------------------------|----------------------------------------------------------------|
| FR-1 | Resume Upload            | Upload multiple PDF resumes with drag & drop support           |
| FR-2 | Job Description Input    | Enter and save job title + description to MongoDB              |
| FR-3 | Resume Parsing           | Extract plain text from uploaded PDFs using `pdf-parse`        |
| FR-4 | Resume-Job Matching      | Compare resume text against job description, rank by match %   |

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT (React.js)                        │
│                      http://localhost:5173                       │
│                                                                  │
│   ┌──────────┐    ┌──────────────┐    ┌───────────────┐         │
│   │  Upload   │    │     Job      │    │   Dashboard   │         │
│   │  Resumes  │    │ Description  │    │  (Matching)   │         │
│   │   Page    │    │    Page      │    │    Page       │         │
│   └────┬─────┘    └──────┬───────┘    └──────┬────────┘         │
│        │                 │                    │                   │
│   ┌────┴─────────────────┴────────────────────┴────────┐        │
│   │              Axios API Service Layer                │        │
│   │   (resumeService.js / jobService.js / matchService) │        │
│   └────────────────────────┬───────────────────────────┘        │
└────────────────────────────┼────────────────────────────────────┘
                             │  HTTP (REST API)
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                       SERVER (Express.js)                        │
│                      http://localhost:5000                        │
│                                                                  │
│   ┌──────────────────────────────────────────────────────┐      │
│   │                    Routes Layer                       │      │
│   │   /api/resumes/upload  │  /api/jobs  │  /api/match   │      │
│   └───────────┬────────────┴──────┬──────┴───────┬───────┘      │
│               │                   │              │               │
│   ┌───────────┴───────────────────┴──────────────┴───────┐      │
│   │                 Controllers Layer                     │      │
│   │   resumeController  │  jobController  │  matchController│   │
│   └───────────┬─────────┴────────┬────────┴──────┬───────┘      │
│               │                  │               │               │
│   ┌───────────┴──────────────────┴───────────────┴───────┐      │
│   │                  Services Layer                       │      │
│   │           pdfService  │  matchingService              │      │
│   └───────────┬───────────┴──────────────────────────────┘      │
│               │                                                  │
│   ┌───────────┴──────────────────────────────────────────┐      │
│   │                   Models Layer                        │      │
│   │              Resume  │  JobDescription                │      │
│   └───────────┬──────────┴───────────────────────────────┘      │
└───────────────┼──────────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────────────┐
│                     MongoDB Database                             │
│              Database: resume-screener                           │
│                                                                  │
│       ┌──────────────┐         ┌────────────────────┐           │
│       │   resumes    │         │  jobdescriptions    │           │
│       │  collection  │         │    collection       │           │
│       └──────────────┘         └────────────────────┘           │
└──────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
antigand/
├── README.md                          # This file
├── package.json                       # Root — runs both servers with `concurrently`
│
├── server/                            # ──── BACKEND ────
│   ├── package.json                   # Server dependencies
│   ├── .env                           # Environment variables (MONGO_URI, PORT)
│   ├── uploads/                       # Uploaded PDF files stored here
│   └── src/
│       ├── server.js                  # Entry point — loads env, connects DB, starts server
│       ├── app.js                     # Express app — CORS, middleware, routes
│       │
│       ├── config/
│       │   └── db.js                  # connectDB() — Mongoose connection to MongoDB
│       │
│       ├── models/
│       │   ├── Resume.js              # Resume schema (name, file, text, etc.)
│       │   └── JobDescription.js      # Job schema (title, description)
│       │
│       ├── middleware/
│       │   ├── uploadMiddleware.js     # Multer config (PDF-only, 10MB limit, 100 files)
│       │   └── errorMiddleware.js      # Global error handler
│       │
│       ├── controllers/
│       │   ├── resumeController.js     # Upload + extract text logic
│       │   ├── jobController.js        # CRUD for job descriptions
│       │   └── matchController.js      # Matching + ranking logic
│       │
│       ├── routes/
│       │   ├── resumeRoutes.js         # POST /api/resumes/upload
│       │   ├── jobRoutes.js            # POST/GET /api/jobs
│       │   └── matchRoutes.js          # GET /api/match/:jobId, /api/match/stats
│       │
│       └── services/
│           ├── pdfService.js           # pdf-parse text extraction
│           └── matchingService.js      # Keyword matching algorithm
│
├── client/                            # ──── FRONTEND ────
│   ├── package.json                   # Client dependencies
│   ├── .env                           # VITE_API_URL
│   ├── index.html                     # HTML entry point
│   └── src/
│       ├── main.jsx                   # React DOM render
│       ├── App.jsx                    # Router + Sidebar layout
│       ├── index.css                  # Global design system (dark theme)
│       │
│       ├── pages/
│       │   ├── UploadResumes.jsx      # Upload page wrapper
│       │   ├── JobDescription.jsx     # Job description page wrapper
│       │   ├── Dashboard.jsx          # Matching results + ranking page
│       │   └── Dashboard.css          # Dashboard styles
│       │
│       ├── components/
│       │   ├── ResumeUpload.jsx       # Drag & drop + file list + upload logic
│       │   ├── ResumeUpload.css       # Upload component styles
│       │   ├── JobDescriptionForm.jsx # Title + description form
│       │   ├── JobDescriptionForm.css # Form styles
│       │   ├── LoadingSpinner.jsx     # Animated spinner
│       │   ├── LoadingSpinner.css     # Spinner styles
│       │   ├── ProgressBar.jsx        # Upload progress bar
│       │   └── ProgressBar.css        # Progress bar styles
│       │
│       └── services/
│           ├── api.js                 # Axios instance (base URL config)
│           ├── resumeService.js       # uploadResumes() with progress
│           ├── jobService.js          # createJob(), getJobs(), getJobById()
│           └── matchService.js        # matchResumesToJob(), getDashboardStats()
```

---

## Data Flow

### Flow 1: Resume Upload (FR-1 + FR-3)

```
User selects PDF files in browser
        │
        ▼
React ResumeUpload component
        │  (validates: only .pdf allowed)
        ▼
Axios POST /api/resumes/upload
        │  (multipart/form-data with progress tracking)
        ▼
Express receives request
        │
        ▼
Multer Middleware
        │  ✓ Validates MIME type (application/pdf)
        │  ✓ Validates file extension (.pdf)
        │  ✓ Checks file size (max 10 MB)
        │  ✓ Stores file to server/uploads/
        │
        ▼
Resume Controller
        │  1. Creates Resume document in MongoDB (metadata)
        │  2. Calls pdfService.extractTextFromPDF()
        │  3. Updates Resume document with extracted text
        │
        ▼
MongoDB stores:
  {
    candidateName: "Rahul_Resume",
    originalFileName: "Rahul_Resume.pdf",
    filePath: "server/uploads/resumes-17...-123.pdf",
    fileSize: 125000,
    mimeType: "application/pdf",
    extractedText: "Rahul Kumar\nSoftware Engineer\nSkills: React, Node.js..."
  }
        │
        ▼
Response → { success: true, resumes: [...] }
        │
        ▼
React shows success message ✓
```

### Flow 2: Job Description (FR-2)

```
User fills in Job Title + Description
        │
        ▼
React JobDescriptionForm component
        │  (validates: title required, description required & min 20 chars)
        ▼
Axios POST /api/jobs
        │  (JSON body)
        ▼
Job Controller
        │  ✓ Validates required fields
        │  ✓ Trims whitespace
        │  ✓ Creates JobDescription document
        │
        ▼
MongoDB stores:
  {
    title: "MERN Stack Developer",
    description: "Looking for a developer with React, Node.js...",
    createdAt: "2026-08-22T..."
  }
        │
        ▼
Response → { success: true, job: {...} }
```

### Flow 3: Matching & Ranking (Dashboard)

```
User selects a Job Description on Dashboard
        │
        ▼
Axios GET /api/match/:jobId
        │
        ▼
Match Controller
        │  1. Fetches the Job Description from MongoDB
        │  2. Fetches ALL Resumes with extracted text
        │  3. For EACH resume → calls matchingService.calculateMatch()
        │  4. Sorts results by matchPercentage (descending)
        │  5. Assigns ranks (1, 2, 3, ...)
        │
        ▼
Matching Service (for each resume):
        │  1. Tokenize job text → lowercase words
        │  2. Tokenize resume text → lowercase words
        │  3. Remove stop-words (the, a, is, are, etc.)
        │  4. Count how many job keywords appear in the resume
        │  5. matchPercentage = (matched / total) × 100
        │
        ▼
Response:
  {
    results: [
      { rank: 1, candidateName: "Rahul", matchPercentage: 78, ... },
      { rank: 2, candidateName: "Ankit", matchPercentage: 52, ... },
      { rank: 3, candidateName: "Priya", matchPercentage: 35, ... }
    ]
  }
        │
        ▼
React Dashboard renders ranked table:
  🥇 Rahul  — 78% match  ████████░░  (green)
  🥈 Ankit  — 52% match  █████░░░░░  (orange)
  🥉 Priya  — 35% match  ███░░░░░░░  (red)
```

---

## Database Models

### Resume Model (`server/src/models/Resume.js`)

| Field            | Type     | Description                                    |
|------------------|----------|------------------------------------------------|
| `candidateName`  | String   | Extracted from filename (e.g., "Rahul_Resume") |
| `originalFileName` | String | Original uploaded file name                    |
| `filePath`       | String   | Path to stored PDF on server disk              |
| `fileSize`       | Number   | File size in bytes                             |
| `mimeType`       | String   | Always "application/pdf"                       |
| `extractedText`  | String   | Plain text extracted from PDF via pdf-parse     |
| `uploadedBy`     | String   | Defaults to "anonymous"                        |
| `createdAt`      | Date     | Auto-generated timestamp                       |

### JobDescription Model (`server/src/models/JobDescription.js`)

| Field         | Type     | Description                       |
|---------------|----------|-----------------------------------|
| `title`       | String   | Job title (required)              |
| `description` | String   | Full job description (required)   |
| `createdBy`   | String   | Defaults to "anonymous"           |
| `createdAt`   | Date     | Auto-generated timestamp          |
| `updatedAt`   | Date     | Auto-updated timestamp            |

---

## API Endpoints

### Resume Endpoints

| Method | Endpoint               | Description                           | Request Body           |
|--------|------------------------|---------------------------------------|------------------------|
| POST   | `/api/resumes/upload`  | Upload multiple PDF resumes           | `multipart/form-data`  |

**Success Response (201):**
```json
{
  "success": true,
  "message": "Resumes uploaded successfully",
  "resumes": [
    { "id": "64f...", "originalFileName": "resume1.pdf", "extractedText": true }
  ]
}
```

### Job Description Endpoints

| Method | Endpoint          | Description                    | Request Body          |
|--------|-------------------|--------------------------------|-----------------------|
| POST   | `/api/jobs`       | Create a new job description   | `{ title, description }` |
| GET    | `/api/jobs`       | Get all job descriptions       | —                     |
| GET    | `/api/jobs/:id`   | Get one job description by ID  | —                     |

### Matching Endpoints

| Method | Endpoint             | Description                              |
|--------|----------------------|------------------------------------------|
| GET    | `/api/match/:jobId`  | Match all resumes against a job, ranked  |
| GET    | `/api/match/stats`   | Dashboard summary statistics             |

---

## Frontend Pages & Components

### Pages

| Page                | Route        | Description                                        |
|---------------------|--------------|----------------------------------------------------|
| Upload Resumes      | `/upload`    | Drag & drop PDF upload with file list and progress |
| Job Description     | `/jobs`      | Form to enter and save job title + description     |
| Dashboard           | `/dashboard` | Select a job, run matching, see ranked results     |

### Components

| Component            | Used In          | Description                                    |
|----------------------|------------------|------------------------------------------------|
| `ResumeUpload`       | UploadResumes    | Drag-drop zone, file validation, upload logic  |
| `JobDescriptionForm` | JobDescription   | Title input, textarea, save/clear buttons      |
| `LoadingSpinner`     | Multiple pages   | Animated spinning indicator                    |
| `ProgressBar`        | ResumeUpload     | Gradient progress bar for upload tracking      |

### Service Layer (Frontend)

| Service              | Methods                                  |
|----------------------|------------------------------------------|
| `api.js`             | Axios instance with `VITE_API_URL`       |
| `resumeService.js`   | `uploadResumes(files, onProgress)`       |
| `jobService.js`      | `createJob()`, `getJobs()`, `getJobById()` |
| `matchService.js`    | `matchResumesToJob()`, `getDashboardStats()` |

---

## Matching Algorithm

The matching algorithm in `matchingService.js` works as follows:

```
Step 1: TOKENIZE
  "Looking for React developer with Node.js experience"
  → ["looking", "for", "react", "developer", "with", "node.js", "experience"]

Step 2: REMOVE STOP-WORDS
  → ["react", "developer", "node.js", "experience"]
  (removed: "looking", "for", "with")

Step 3: COMPARE WITH RESUME TOKENS
  Resume text tokens: ["rahul", "software", "engineer", "react", "node.js", "mongodb", ...]
  
  Matched: ["react", "node.js"]  →  2 out of 4 job keywords

Step 4: CALCULATE PERCENTAGE
  matchPercentage = (2 / 4) × 100 = 50%

Step 5: RANK
  All resumes sorted by matchPercentage (highest first)
  → Rank 1, Rank 2, Rank 3, ...
```

### Score Color Coding

| Match %   | Color  | Badge |
|-----------|--------|-------|
| 70–100%   | 🟢 Green  | High match  |
| 40–69%    | 🟡 Orange | Medium match |
| 0–39%     | 🔴 Red    | Low match   |

---

## Error Handling

| Scenario                    | Where Handled          | User Message                            |
|-----------------------------|------------------------|-----------------------------------------|
| No files selected           | resumeController       | "No files selected..."                  |
| Non-PDF file uploaded       | uploadMiddleware       | "Only PDF files are allowed."           |
| File exceeds 10 MB          | errorMiddleware        | "File too large. Maximum is 10 MB."     |
| Too many files (>100)       | errorMiddleware        | "Too many files. Maximum is 100."       |
| Corrupted/unreadable PDF    | pdfService             | Logs warning, continues (text = empty)  |
| Missing job title           | jobController          | "Job title is required."                |
| Empty job description       | jobController          | "Job description is required."          |
| Job not found               | jobController/matchCtrl| "Job description not found."            |
| MongoDB connection failure  | db.js                  | Process exits with error message        |
| Network error (frontend)    | Axios catch blocks     | "Network Error" / server message        |

---

## Setup & Installation

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** running locally or a MongoDB Atlas connection string

### Step 1: Install Dependencies

```bash
# From the root directory (antigand/)

# Install root dependencies (concurrently)
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 2: Configure Environment Variables

**Server** (`server/.env`):
```env
MONGO_URI=mongodb://localhost:27017/resume-screener
PORT=5000
CLIENT_URL=http://localhost:5173
```

**Client** (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Start the Application

**Option A — Single command (from root):**
```bash
npm run dev
```
This starts both backend and frontend simultaneously.

**Option B — Separate terminals:**
```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

### Step 4: Open in Browser

```
http://localhost:5173
```

---

## How to Use

### 1. Upload Resumes

- Navigate to **Upload Resumes** in the sidebar
- Drag & drop PDF files or click **Choose Files**
- Review the file list (name + size shown)
- Remove any unwanted files with the ✕ button
- Click **Upload Resumes**
- Wait for the progress bar to complete
- ✓ Success message appears — files are stored and text is extracted

### 2. Add a Job Description

- Navigate to **Job Description** in the sidebar
- Enter a **Job Title** (e.g., "MERN Stack Developer")
- Enter the full **Job Description** with required skills
- Click **Save Job Description**
- ✓ Success message confirms it's saved to MongoDB

### 3. View Dashboard & Rankings

- Navigate to **Dashboard** in the sidebar
- View summary stats (total resumes, parsed, job descriptions)
- Select a job description from the dropdown
- Click **Match Resumes**
- See the ranked table with:
  - 🥇🥈🥉 rank badges for top 3
  - Match percentage with colored progress bars
  - Keywords matched count
  - Score ring for each candidate

---

## Key Design Decisions

| Decision                      | Rationale                                           |
|-------------------------------|-----------------------------------------------------|
| Multer disk storage           | Files persisted on server for re-processing later   |
| PDF-only validation (MIME+ext)| Both checks prevent spoofed file types              |
| Text extraction on upload     | Immediate processing avoids a separate batch step   |
| Keyword overlap matching      | Simple, effective, and explainable algorithm         |
| Stop-word removal             | Improves match quality by ignoring common words     |
| Centralized Axios instance    | Single config point, easy to change base URL        |
| Component ↔ Page separation   | Reusable components, clean page wrappers            |
| Dark theme UI                 | Modern, professional appearance                     |

---

*Built with ❤️ using the MERN Stack*
