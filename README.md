# EduMind AI

**AI-Enabled Learning Platform for Competency Assessment, Personalized Training and Quiz Generation**

EduMind AI is a full-stack educational companion built for the **Smart Education** theme of the **Smart India Hackathon**. It helps students bridge the gap between syllabus study materials and effective exam preparation by providing automated question generation, secure quiz assessments, competency gap analysis, and personalized learning recommendations grounded in their own uploaded notes.

---

## Table of Contents

1. [What EduMind AI Does](#what-edumind-ai-does)
2. [Main Features](#main-features)
3. [Technology Stack](#technology-stack)
4. [Project Folder Structure](#project-folder-structure)
5. [Prerequisites](#prerequisites)
6. [Installation & Setup](#installation--setup)
7. [Environment Configuration](#environment-configuration)
8. [Starting Backend and Frontend](#starting-backend-and-frontend)
9. [Running Tests & Build Verification](#running-tests--build-verification)
10. [API Reference](#api-reference)
11. [Deployment & Database Persistence](#deployment--database-persistence)
12. [Current Limitations & Roadmap](#current-limitations--roadmap)

---

## What EduMind AI Does

Traditional exam preparation often leaves students guessing which syllabus concepts they have mastered and where their critical knowledge gaps lie. **EduMind AI** provides a complete end-to-end workflow:

1. **User Authentication & Data Isolation:** Students register secure accounts with bcrypt password hashing and log in to receive cryptographically signed JWT sessions.
2. **Uploads Learning Materials:** Students upload syllabi, lecture slides, or textbook summaries (PDF, DOCX, TXT) saved privately to their personal document library.
3. **Extracts Knowledge Content:** Text is extracted, validated, and persisted with metadata in SQLite.
4. **Generates Tailored Quizzes:** AI models or an offline NLP Knowledge Engine generate multiple-choice assessments from the uploaded material.
5. **Conducts Secure Assessments:** Students attempt quizzes with server-side timer tracking and strict protection of correct answers.
6. **Evaluates & Explains Results:** Submissions are scored immediately on the server, preventing duplicate attempts, and detailed explanations are provided for every question.
7. **Maps Competency Gaps:** The system tracks performance across topics to identify strengths and weaknesses.
8. **Recommends Personalized Next Steps:** For any identified gaps, EduMind AI suggests specific sections from the student's uploaded notes to review before retaking practice quizzes.

---

## Main Features

- 🔐 **Genuine User Authentication & Data Separation:** Real registration (`/api/auth/register`) and login (`/api/auth/login`) with salted **bcrypt** password hashing (12 rounds) and signed **JWT** Bearer tokens (`python-jose`). User A cannot view, modify, or delete User B's private learning materials or quizzes.
- 📄 **Multi-Format Document Upload:** Ingest PDF, DOCX, and TXT documents up to 10 MB with automated text extraction and character counting.
- ⚡ **Dual-Mode Quiz Generator:** Generates MCQs using Gemini / OpenAI when API keys are configured, or seamlessly falls back to an internal offline NLP Knowledge Engine without paid dependencies.
- 🔒 **Secure Quiz Attempt Lifecycle:** Correct answers and explanations remain hidden on the server until final submission; duplicate submissions are blocked with HTTP 400.
- 📊 **Server-Side Scoring & History:** Calculates overall score percentage, correct/incorrect/unanswered counts, and stores chronological attempt history in SQLite.
- 🎯 **Quantitative Competency Gap Analysis:** Categorizes topics into **Mastered** ($\ge 75\%$), **Developing** ($50\% - 74\%$), **Needs Improvement** ($< 50\%$), and **Insufficient Data** ($< 3$ questions evaluated).
- 💡 **Personalized Study Recommendations:** Highlights weak topics with HIGH or MEDIUM priority badges and links directly to matching uploaded documents in the library.
- 🤖 **Interactive AI Doubt Assistant:** In-browser conversational interface to break down difficult concepts and explain tricky questions.
- 📱 **Modern & Responsive UI:** Clean glassmorphism aesthetic built with React, Lucide icons, and modern responsive layouts for both laptop and mobile screens.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 6, React Router DOM 7, Lucide React, Vanilla CSS Design System |
| **Backend API** | FastAPI 0.115+, Uvicorn (ASGI), Python 3.10+ |
| **Authentication & Security** | `bcrypt` (12-round salted hashing), `python-jose` (cryptographic JWT tokens), FastAPI HTTP Bearer dependencies |
| **Database** | SQLite with SQLAlchemy 2.0 ORM |
| **Document Processing** | `pypdf` 5.3+, `python-docx` 1.1+ |
| **Testing** | `pytest` 8.3+, `fastapi.testclient`, `httpx` |
| **Environment** | `python-dotenv` |

---

## Project Folder Structure

```text
EduMind-AI/
├── .env.example                     # Root frontend environment template
├── .gitignore                        # Git exclusion rules (env, db, uploads, node_modules)
├── index.html                       # HTML5 entry point
├── package.json                     # Frontend dependencies & scripts
├── vite.config.js                   # Vite bundler configuration & proxy
├── PHASE2_PROGRESS.md               # Step-by-step progress tracking
├── README.md                        # Platform documentation (this file)
│
├── backend/                         # FastAPI Phase 2 Backend
│   ├── .env.example                 # Backend environment template
│   ├── edumind.db                   # SQLite database (persisted)
│   ├── main.py                      # FastAPI application entry point & lifespan
│   ├── requirements.txt             # Python dependencies
│   ├── app/
│   │   ├── config.py                # Pydantic/dataclass application settings & JWT secrets
│   │   ├── database.py              # SQLite engine, session management & schema migrations
│   │   ├── models/                  # SQLAlchemy ORM models
│   │   │   ├── user.py              # User model (email, full_name, hashed_password)
│   │   │   ├── material.py          # LearningMaterial model (with user_id)
│   │   │   ├── quiz.py              # Quiz, QuizQuestion models (with user_id)
│   │   │   ├── attempt.py           # QuizAttempt, LearnerResponse models
│   │   │   └── competency.py        # CompetencyResult, PersonalizedRecommendation
│   │   ├── schemas/                 # Pydantic request/response schemas
│   │   │   ├── auth.py              # User registration, login, token schemas
│   │   │   ├── health.py            # Diagnostic health check schema
│   │   │   ├── material.py          # Document upload & listing schemas
│   │   │   ├── quiz.py              # Quiz generation & attempt schemas
│   │   │   └── competency.py        # Competency analysis & recommendation schemas
│   │   ├── routers/                 # FastAPI API route controllers
│   │   │   ├── auth.py              # /api/auth (register, login, me, logout)
│   │   │   ├── health.py            # /api/health & /health
│   │   │   ├── materials.py         # /api/materials/* (protected by JWT)
│   │   │   ├── quizzes.py           # /api/quizzes/* (protected by JWT)
│   │   │   ├── attempts.py          # /api/attempts/* (protected by JWT)
│   │   │   └── competency.py        # /api/competencies, /api/recommendations (protected by JWT)
│   │   └── services/                # Core business logic engines
│   │       ├── auth_service.py      # Bcrypt hashing, token creation, get_current_user
│   │       ├── document_processor.py # PDF/DOCX/TXT text extraction
│   │       ├── quiz_generator.py    # AI provider + local NLP fallback generator
│   │       └── competency_analyzer.py # Gap evaluation & note-matching engine
│   ├── tests/                       # Automated pytest suite
│   │   ├── test_auth.py             # 10 security, auth & cross-user access tests
│   │   ├── test_health.py           # Health endpoint and DB table verification
│   │   ├── test_materials.py        # Document upload & extraction tests
│   │   ├── test_quiz_generator.py   # Quiz generation and validation tests
│   │   ├── test_attempts.py         # Answer protection, scoring & duplicate checks
│   │   ├── test_competencies.py     # Competency analysis & recommendation tests
│   │   └── test_full_workflow.py    # 12-step end-to-end user workflow test
│   └── uploads/                     # Storage directory for uploaded documents
│       └── .gitkeep                 # Preserves folder in git
│
└── src/                             # React Frontend Source
    ├── App.jsx                      # Client router configuration with ProtectedRoute
    ├── main.jsx                     # React root mount
    ├── context/
    │   └── AuthContext.jsx          # AuthProvider, useAuth hook & ProtectedRoute component
    ├── components/                  # Reusable UI components
    │   ├── Navbar.jsx               # Top navigation bar (dynamic auth/logout links)
    │   ├── Footer.jsx               # Platform footer
    │   ├── DashboardLayout.jsx      # Sidebar & app layout wrapper with user info
    │   ├── LearningMaterialsManager.jsx # Document upload & preview UI
    │   ├── QuizGeneratorSection.jsx # Quiz generation controls
    │   ├── AiChatModal.jsx          # Quick doubt modal
    │   └── SubjectCard.jsx          # Curriculum subject display card
    ├── pages/                       # Application pages
    │   ├── Landing.jsx              # Public landing page (/)
    │   ├── Login.jsx                # Student login page (/login) with demo shortcut
    │   ├── SignUp.jsx               # Student registration page (/signup)
    │   ├── Dashboard.jsx            # Learner dashboard (/dashboard) [Protected]
    │   ├── MaterialsPage.jsx        # Document library (/materials) [Protected]
    │   ├── QuizzesPage.jsx          # Smart quiz hub (/quizzes) [Protected]
    │   ├── ProgressPage.jsx         # Competency gap hub (/progress) [Protected]
    │   ├── SubjectsPage.jsx         # Subject curricula tracks (/subjects) [Protected]
    │   ├── AiAssistantPage.jsx      # Full-page AI study assistant (/assistant) [Protected]
    │   ├── ProfilePage.jsx          # Student profile view (/profile) [Protected]
    │   └── SettingsPage.jsx         # User preferences (/settings) [Protected]
    ├── services/
    │   └── api.js                   # Unified backend API client (with JWT injection)
    └── styles/
        └── index.css                # Custom design system CSS & Auth stylesheet
```

---

## Prerequisites

Before running EduMind AI locally, ensure you have:

1. **Python:** Version 3.10 or higher (`python --version` or `py --version`).
2. **Node.js:** Version 18.0 or higher (`node --version`).
3. **npm:** Version 9.0 or higher (`npm --version`).

---

## Installation & Setup

### 1. Clone or Open the Repository
```bash
cd EduMind-AI
```

### 2. Set Up Backend Dependencies
```bash
cd backend
py -m pip install -r requirements.txt
cd ..
```
*(On macOS/Linux, replace `py` with `python3`)*

### 3. Set Up Frontend Dependencies
```bash
npm install
```

---

## Environment Configuration

EduMind AI works out of the box using default local configuration, but environment templates are provided for customization:

### Backend Configuration (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:
```bash
cp backend/.env.example backend/.env
```
Default values:
```env
APP_ENV=development
APP_HOST=127.0.0.1
APP_PORT=8000
DATABASE_URL=sqlite:///./edumind.db
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173
MAX_UPLOAD_SIZE_BYTES=10485760

# Authentication & JWT Security Settings
SECRET_KEY=edumind-super-secret-jwt-signing-key-production-change-me
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Optional AI API keys (leave blank to use the built-in offline NLP engine)
# GEMINI_API_KEY=your_gemini_key_here
# OPENAI_API_KEY=your_openai_key_here
```

### Frontend Configuration (`.env`)
If your backend runs on a different port or domain, copy `.env.example` to `.env` in the root:
```bash
cp .env.example .env
```
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

---

## Starting Backend and Frontend

### 1. Start the FastAPI Backend
From the repository root:
```bash
py -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
- Interactive API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Alternative API Documentation: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

### 2. Start the Vite Frontend
In a separate terminal from the repository root:
```bash
npm run dev
```
Open your browser and navigate to:
- Application URL: [http://localhost:3000](http://localhost:3000)

### Quick Demo Access:
On the login screen (`/login`), click **"Sign In as Demo Student (Alex)"** to instantly log in using the pre-seeded evaluation account (`alex@example.com` / `student123`).

---

## Running Tests & Build Verification

### Backend Automated Test Suite
Run the 46 automated tests covering authentication security, cross-user isolation, answer protection, scoring, and the 12-step end-to-end workflow:
```bash
py -m pytest backend/tests -v
```
**Results:** `46 passed, 100% pass rate in 30.63s`

### Frontend Production Build
Validate that all React components, auth contexts, icons, and CSS modules build cleanly without errors:
```bash
npm run build
```
To preview the compiled production bundle:
```bash
npm run preview
```

---

## API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new student with bcrypt password hashing | No |
| `POST` | `/api/auth/login` | Authenticate credentials & issue signed JWT | No |
| `GET` | `/api/auth/me` | Fetch currently authenticated user profile | **Yes (Bearer)** |
| `POST` | `/api/auth/logout` | Invalidate current session and log out user | **Yes (Bearer)** |
| `GET` | `/` | Platform metadata and health pointers | No |
| `GET` | `/health` | Direct root health check (for cloud load balancers) | No |
| `GET` | `/api/health` | Comprehensive backend & database diagnostic check | No |
| `POST` | `/api/materials/upload` | Upload & extract text from PDF, DOCX, or TXT file | **Yes (Bearer)** |
| `GET` | `/api/materials` | List authenticated user's learning materials | **Yes (Bearer)** |
| `GET` | `/api/materials/{id}` | Get document metadata by ID (verifies ownership) | **Yes (Bearer)** |
| `GET` | `/api/materials/{id}/content` | Get extracted text content (verifies ownership) | **Yes (Bearer)** |
| `DELETE` | `/api/materials/{id}` | Delete a document and disk file (verifies ownership) | **Yes (Bearer)** |
| `POST` | `/api/quizzes/generate` | Generate an MCQ assessment from material text | **Yes (Bearer)** |
| `GET` | `/api/quizzes` | List authenticated user's generated quizzes | **Yes (Bearer)** |
| `GET` | `/api/quizzes/{id}` | Retrieve full quiz structure and questions | **Yes (Bearer)** |
| `POST` | `/api/quizzes/{id}/attempts` | Start a quiz attempt (correct answers protected) | **Yes (Bearer)** |
| `POST` | `/api/attempts/{id}/submit` | Submit answers for scoring (duplicate prevention) | **Yes (Bearer)** |
| `GET` | `/api/attempts/{id}/result` | Retrieve evaluation results with explanations | **Yes (Bearer)** |
| `GET` | `/api/attempts` | Retrieve chronological attempt history | **Yes (Bearer)** |
| `GET` | `/api/competencies` | Retrieve topic-level competency gap analysis | **Yes (Bearer)** |
| `GET` | `/api/recommendations` | Retrieve personalized recommendations mapped to notes | **Yes (Bearer)** |

---

## Deployment & Database Persistence

### Database Persistence Requirements
EduMind AI uses SQLite stored at `backend/edumind.db`.
- **Local Development:** Data persists automatically in the file system.
- **Docker / Container Deployments:** Mount a persistent volume to the directory containing `backend/edumind.db` and `backend/uploads/` (e.g., `-v /var/data/edumind:/app/backend/data`).
- **Cloud Hosts (Render, Railway, Fly.io):** Attach a persistent volume or set `DATABASE_URL` to point to a persistent storage path or PostgreSQL instance.

### Production Build & Launch Commands
1. **Frontend Production Build:** `npm run build` (outputs optimized bundle to `dist/`)
2. **Backend Startup:** `uvicorn backend.main:app --host 0.0.0.0 --port 8000`

---

## Current Limitations & Roadmap

1. **Password Recovery:** Real password recovery via SMTP email tokens is intentionally not faked; will be integrated when an institutional mail service or SendGrid/Resend API is connected.
2. **External AI Integration:** Quiz generation automatically leverages Gemini or OpenAI when keys are supplied, but gracefully defaults to an internal offline NLP engine if no external API key is provided.
3. **Supported Formats:** Currently extracts text from `.pdf`, `.docx`, and `.txt`. Scanned image-only PDFs requiring OCR are not yet supported without Tesseract.