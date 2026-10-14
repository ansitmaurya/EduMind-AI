# EduMind AI — Phase 2 Progress Tracker

**Official Title:** AI-Enabled Learning Platform for Competency Assessment, Personalized Training and Quiz Generation  
**Theme:** Smart Education (Smart India Hackathon)  
**Current Phase:** Phase 2 — Step 7 Complete (Genuine User Registration, Secure Authentication & Full-Stack Data Separation)  
**Last Updated:** October 13, 2026  

---

## 1. Project Overview & Multi-Step Architecture

EduMind AI is an AI-enabled academic learning companion designed to help learners identify knowledge gaps, generate structured assessments from their learning materials, and receive personalized study recommendations grounded in their own uploaded notes.

### Summary of Completed Phases & Steps:
- **Phase 1 Prototype:** Responsive UI featuring Landing Page (`/`), Student Login (`/login`), Dashboard (`/dashboard`), Subject Curricula (`/subjects`), Quiz practice modules (`/quizzes`), and AI doubt assistant (`/assistant`).
- **Phase 2 Step 1 (Backend Foundation):** FastAPI service with asynchronous lifespan management, SQLite persistence engine (`edumind.db`), declarative SQLAlchemy models, Pydantic schemas, and live diagnostic health checking.
- **Phase 2 Step 2 (Document Upload & Extraction):** Robust document ingestion pipeline (`/api/materials/upload`) supporting PDF, DOCX, and TXT formats with text validation, length checks, metadata tagging, and document management UI (`/materials`).
- **Phase 2 Step 3 (Quiz & MCQ Generation):** Dual-mode assessment generator (`/api/quizzes/generate`) with automatic failover between AI providers (Gemini / OpenAI) and a local offline NLP Knowledge Engine.
- **Phase 2 Step 4 (Quiz Attempts & Evaluation):** Secure quiz attempt lifecycle (`/api/quizzes/{id}/attempts`, `/api/attempts/{id}/submit`, `/api/attempts/{id}/result`). Strictly protects correct answers prior to submission, performs server-side scoring, prevents duplicate submissions, and logs persistent history.
- **Phase 2 Step 5 (Competency Gap Analysis & Recommendations):** Quantitative competency gap analysis engine (`/api/competencies`) identifying weak topics (< 50% accuracy) from submitted attempts, coupled with a personalized recommendations engine (`/api/recommendations`) that maps weaknesses back to uploaded library notes.
- **Phase 2 Step 6 (Final Integration & Hardening):** Full end-to-end 12-step verification, production `.gitignore` configuration, environment template separation (`.env.example`), health endpoint enhancement for cloud load balancers (`/health` & `/api/health`), removal of placeholder stats, and automated E2E test suite.
- **Phase 2 Step 7 (Genuine Authentication & User Data Separation):** Complete user authentication system with secure registration (`/api/auth/register`), login (`/api/auth/login`), profile (`/api/auth/me`), and logout (`/api/auth/logout`). Implements salted bcrypt hashing, signed JWT Bearer tokens, protected private endpoints with HTTP 401/403 authorization, backward-compatible SQLite migration, and frontend session management with `ProtectedRoute`.

---

## 2. Phase 2 Step 7: Genuine Authentication & Data Separation Architecture

### A. Authentication Architecture
- **Password Hashing:** Industry-standard **bcrypt** algorithm with 12 salt rounds via direct `bcrypt.hashpw` / `bcrypt.checkpw`. Passwords are never stored in plaintext and never logged.
- **Session Tokens:** Cryptographically signed **JSON Web Tokens (JWT)** generated using `python-jose` with `HS256` signature algorithm. Includes claims: `sub` (user ID), `email`, and `exp` (1440 minutes / 24 hours).
- **Transport Security:** Client includes standard `Authorization: Bearer <token>` headers on all authenticated API requests. Handled automatically by the unified frontend API client (`src/services/api.js`).
- **Session Invalidation:** Logout endpoint (`POST /api/auth/logout`) and client-side cleanup completely remove stored tokens and reset authentication contexts.
- **Account Enumeration Defense:** Failed login attempts with incorrect passwords or non-existent accounts return the exact same generic error: `"Invalid email or password."` (HTTP 401 Unauthorized), preventing attacker reconnaissance.

### B. Database Changes & Safe Migration Strategy
- **New `users` Table:**
  - `id` (Integer Primary Key, Auto-increment)
  - `email` (String 255, Unique, Index, Normalized Lowercase)
  - `full_name` (String 255)
  - `hashed_password` (String 255, Bcrypt Hash)
  - `is_active` (Boolean, Default True)
  - `created_at` / `updated_at` (UTC Timestamps)
- **Safe Schema Alterations (`ALTER TABLE`):**
  - Added `user_id` column to `learning_materials` (Nullable Integer, Foreign Key to `users.id`).
  - Added `user_id` column to `quizzes` (Nullable Integer, Foreign Key to `users.id`).
  - Executed non-destructively in `backend/app/database.py` during `init_db()` using SQLite `PRAGMA table_info` checks without deleting or resetting the existing database.
- **Legacy Data Migration & Demo Account:**
  - Pre-seeded permanent demo student account: `alex@example.com` / `student123`.
  - All existing default student records (`student_default` in `quiz_attempts`, `learner_responses`, `competency_results`, `personalized_recommendations`) are seamlessly mapped to Alex.
  - New students register with fresh accounts and maintain 100% isolated materials, quizzes, and competency profiles.

### C. Route Authorization & Cross-User Data Isolation
Private backend endpoints enforce user ownership using the FastAPI `get_current_user` dependency:
1. **Unauthenticated Access:** Accessing `/api/materials`, `/api/quizzes`, `/api/attempts`, `/api/competencies`, or `/api/recommendations` without a valid Bearer token returns **HTTP 401 Unauthorized**.
2. **Cross-User Protection:** If User B attempts to view, fetch content, or delete private materials/quizzes/attempts belonging to User A, the backend responds with **HTTP 403 Forbidden** (`"You do not have permission to access this resource."`).
3. **Library Filtering:** Querying `/api/materials` or `/api/quizzes` filters records by `user_id == current_user.id` so private materials never appear in another student's library.

### D. Frontend Navigation & Security Integration
- **`src/context/AuthContext.jsx`:** React Context provider managing `user`, `token`, `isAuthenticated`, `login`, `register`, and `logout`. Automatically synchronizes state with `localStorage` and handles `401 Unauthorized` session expiry events.
- **`ProtectedRoute` Wrapper:** Guards `/dashboard`, `/materials`, `/assistant`, `/quizzes`, `/subjects`, `/progress`, `/profile`, and `/settings`. Redirects unauthenticated visitors to `/login` while preserving navigation intent.
- **`Login.jsx`:** Genuine login form with validation, backend authentication, loading states, error alerts, and a 1-click **"Sign In as Demo Student (Alex)"** button for hackathon evaluators. Removed non-functional forgot password links.
- **`SignUp.jsx`:** Complete registration form featuring Full Name, Email, Degree & Branch, Semester, Password, and Confirm Password. Frontend and backend enforce minimum 8-character passwords and password match verification.
- **`DashboardLayout.jsx` & `Navbar.jsx`:** Displays the authenticated student's name (`Good Morning, <Name>`), custom avatar initial, and a working session Logout button.

---

## 3. Implemented API Endpoints

| Method | Endpoint | Description | Auth Required | Status Code |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new account with bcrypt password hashing | No | `201 Created` / `400` / `422` |
| `POST` | `/api/auth/login` | Authenticate credentials & issue signed JWT | No | `200 OK` / `401 Unauthorized` |
| `GET` | `/api/auth/me` | Fetch currently authenticated user profile | **Yes (Bearer)** | `200 OK` / `401 Unauthorized` |
| `POST` | `/api/auth/logout` | Invalidate current session and log out user | **Yes (Bearer)** | `200 OK` / `401 Unauthorized` |
| `GET` | `/` | Root application metadata & documentation links | No | `200 OK` |
| `GET` | `/health` | Container & cloud load balancer health check | No | `200 OK` |
| `GET` | `/api/health` | Backend and database operational health check | No | `200 OK` / `503` |
| `POST` | `/api/materials/upload` | Upload & extract text from PDF, DOCX, or TXT | **Yes (Bearer)** | `201 Created` / `400` / `401` |
| `GET` | `/api/materials` | Lists authenticated user's learning materials | **Yes (Bearer)** | `200 OK` / `401` |
| `GET` | `/api/materials/{id}` | Retrieves document metadata (verifies ownership) | **Yes (Bearer)** | `200 OK` / `403` / `404` |
| `GET` | `/api/materials/{id}/content` | Retrieves full extracted text (verifies ownership) | **Yes (Bearer)** | `200 OK` / `403` / `404` |
| `DELETE` | `/api/materials/{id}` | Deletes document record & file (verifies ownership) | **Yes (Bearer)** | `200 OK` / `403` / `404` |
| `POST` | `/api/quizzes/generate` | Generates MCQ assessment from material text | **Yes (Bearer)** | `201 Created` / `403` / `404` |
| `GET` | `/api/quizzes` | Lists authenticated user's generated quizzes | **Yes (Bearer)** | `200 OK` / `401` |
| `GET` | `/api/quizzes/{id}` | Retrieves full quiz structure and questions | **Yes (Bearer)** | `200 OK` / `403` / `404` |
| `POST` | `/api/quizzes/{id}/attempts` | Starts attempt with protected answers & explanations | **Yes (Bearer)** | `201 Created` / `403` / `404` |
| `POST` | `/api/attempts/{id}/submit` | Submits answers; scores attempt; blocks duplicate | **Yes (Bearer)** | `200 OK` / `400` / `403` / `404` |
| `GET` | `/api/attempts/{id}/result` | Retrieves completed evaluation results with explanations | **Yes (Bearer)** | `200 OK` / `403` / `404` |
| `GET` | `/api/attempts` | Retrieves chronological user attempt history | **Yes (Bearer)** | `200 OK` / `401` |
| `GET` | `/api/competencies` | Topic-level competency gap analysis for user | **Yes (Bearer)** | `200 OK` / `401` / `403` |
| `GET` | `/api/recommendations` | Personalized recommendations mapped to user notes | **Yes (Bearer)** | `200 OK` / `401` / `403` |

---

## 4. Verification & Automated Test Results

Automated test suite executed via `py -m pytest backend/tests -v`:
- **Total Tests:** 46 tests
- **Passed:** 46 passed (100% pass rate) in 30.63 seconds
- **Test Modules Covered:**
  - `backend/tests/test_auth.py`: 10 comprehensive security & authentication tests
    - Registration success with bcrypt password hashing
    - Duplicate email rejection (HTTP 400)
    - Input validation errors (password mismatch, short password, bad email format)
    - Successful login issuing JWT Bearer token
    - Demo user seed login (`alex@example.com` / `student123`)
    - Login rejection with incorrect password (generic HTTP 401)
    - Login rejection for unregistered account (generic HTTP 401)
    - Protected endpoints deny unauthenticated access (HTTP 401)
    - Authenticated access to `/api/auth/me` and `/api/auth/logout`
    - Cross-user access denial security test (Alice vs Bob: HTTP 403 on private materials, content, deletion, and library isolation)
  - `backend/tests/test_attempts.py`: Answer protection, scoring, duplicate submission prevention, input validation, history (9 tests)
  - `backend/tests/test_competencies.py`: Competency gaps, thresholds, insufficient data handling, matching note recommendations (5 tests)
  - `backend/tests/test_full_workflow.py`: Complete 12-step end-to-end user workflow test (1 test)
  - `backend/tests/test_health.py`: Root metadata, `/api/health`, `/health`, and DB schema verification (4 tests)
  - `backend/tests/test_materials.py`: PDF, DOCX, TXT uploads, rejection of invalid/corrupt files, listing, detail, content, deletion (11 tests)
  - `backend/tests/test_quiz_generator.py`: Quiz generation, fallback engine, input validation, listing, question retrieval (6 tests)
- **Frontend Production Build:** `cmd /c npm run build` completed with 0 errors (`✓ 1611 modules transformed`, output in `dist/`).
- **Live Integration:** Both frontend dev server (`http://localhost:3000`) and FastAPI backend server (`http://127.0.0.1:8000`) verified operational with persistent SQLite database (`backend/edumind.db`).

---

## 5. Deployment Preparation & Environment Configuration

### Backend Configuration (`backend/.env`):
```env
APP_ENV=development
APP_HOST=127.0.0.1
APP_PORT=8000
DATABASE_URL=sqlite:///./edumind.db
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
MAX_UPLOAD_SIZE_BYTES=10485760

# Authentication Security Settings
SECRET_KEY=edumind-super-secret-jwt-signing-key-production-change-me
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Optional AI API keys (leave blank to use the built-in offline NLP engine)
# GEMINI_API_KEY=your_gemini_key_here
# OPENAI_API_KEY=your_openai_key_here
```

### Exact Startup Commands:
1. **Backend Server:**
   ```bash
   py -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
   ```
2. **Frontend Development Server:**
   ```bash
   npm run dev
   ```
3. **Frontend Production Build:**
   ```bash
   npm run build
   ```
4. **Backend Automated Tests:**
   ```bash
   py -m pytest backend/tests -v
   ```

---

## 6. Current Limitations & Roadmap

- **Password Reset:** Real password reset via SMTP email recovery is intentionally not faked; will be integrated when an active university mail server or SendGrid/Resend API is attached.
- **Offline Recommendation Engine:** Recommendations use deterministic keyword, title, and syllabus code alignment to ensure 100% offline functionality without requiring paid external APIs.
