# Study Nexus - Python FastAPI Backend & System Architecture

Study Nexus is an AI-powered academic command center designed to optimize cognitive retention, dynamic task scheduling, and active recall to achieve A+ grades across university coursework.

---

## 1. Project Directory Structure

```text
study-nexus/
├── backend/
│   ├── main.py                     # FastAPI application entry point, CORS, and lifecycle events
│   ├── database.py                 # SQLAlchemy DB engine, session maker, and session dependency
│   ├── models.py                   # SQLAlchemy ORM models and Pydantic request/response schemas
│   ├── requirements.txt            # Python dependencies (FastAPI, pdfplumber, python-pptx, etc.)
│   ├── services/
│   │   ├── parser.py               # PDF and PPTX structural text extraction service
│   │   └── agents.py               # AI Study Agents (Strategy, Technique, Flashcard, Quiz, Adaptive Load)
│   └── routers/
│       ├── files.py                # Document upload, extraction, and management endpoints
│       ├── agents.py               # AI Generation endpoints (/api/ai/strategy, /techniques, /quiz, etc.)
│       ├── schedule.py             # Courses, Tasks, and Calendar schedule CRUD
│       └── spotify.py              # Spotify OAuth 2.0 PKCE and Web Playback SDK helper routes
├── src/
│   ├── App.tsx                     # Main React application shell & cyber navigation
│   ├── components/                 # High-end Obsidian UI components
│   │   ├── Navbar.tsx              # HUD header, A+ gauge, Spotify mini-player & Pomodoro status
│   │   ├── DashboardOverview.tsx   # Master dashboard with GPA targets, exams, cognitive load
│   │   ├── DocumentManager.tsx     # PDF/PPTX uploader, section viewer, slide analyzer
│   │   ├── AIStudyAgentHub.tsx     # A+ Course Strategy, Feynman analogies & Active Recall
│   │   ├── FlashcardViewer.tsx     # 3D Flip cards, Leitner 5-box spacing & mastery tracker
│   │   ├── QuizInterface.tsx       # Timed exam diagnostic quiz with option rationales & grading
│   │   ├── AdaptiveSchedule.tsx    # Intelligent calendar & adaptive task list with dynamic feedback
│   │   ├── SpotifyPlayerWidget.tsx # Embedded Spotify focus music player & OAuth 2.0 interface
│   │   ├── PomodoroTimer.tsx       # Integrated 25/5 focus timer with audio cues and task binding
│   │   └── BackendArchitectureModal.tsx # In-app code explorer & FastAPI interactive inspector
│   ├── data/
│   │   └── initialData.ts          # Seed data for courses, documents, quizzes, and focus playlists
│   ├── types.ts                    # Global TypeScript interfaces
│   └── index.css                   # Obsidian Cyber-Dark styling & card-flip animations
├── server.ts                       # Node.js + Express development & production server
└── .env.example                    # Environment variable template
```

---

## 2. Environment Setup & Configuration

Create a `.env` file in the root directory (or in `/backend/`):

```bash
# ===============================================
# Study Nexus Configuration
# ===============================================

# 1. AI API Keys (Choose one or multiple):
# Google Gemini (Default high-speed agent engine)
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"

# OpenAI (Alternative agent model)
OPENAI_API_KEY="sk-proj-YourOpenAIApiKeyHere"

# Ollama Local Model (For local offline LLMs like llama3:8b or mistral)
OLLAMA_BASE_URL="http://localhost:11434"

# 2. Database Connection URI:
# SQLite (Local file-based - zero configuration required):
DATABASE_URL="sqlite:///./study_nexus.db"

# PostgreSQL (Production relational database):
# DATABASE_URL="postgresql://nexus_user:secure_pass@localhost:5432/study_nexus_db"

# 3. Spotify Web Playback SDK / OAuth 2.0 Credentials:
# Obtain these at https://developer.spotify.com/dashboard
SPOTIFY_CLIENT_ID="your_spotify_client_id_here"
SPOTIFY_CLIENT_SECRET="your_spotify_client_secret_here"
SPOTIFY_REDIRECT_URI="http://localhost:3000/api/spotify/callback"
```

---

## 3. How to Run the Python FastAPI Backend

### Step 1: Create and activate a Python virtual environment
```bash
python3 -m venv venv
# Linux / macOS:
source venv/bin/activate
# Windows:
.\venv\Scripts\activate
```

### Step 2: Install Python dependencies
```bash
pip install -r backend/requirements.txt
```

### Step 3: Run the FastAPI backend with Uvicorn
```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

- Interactive Swagger API Documentation: `http://localhost:8000/docs`
- ReDoc Documentation: `http://localhost:8000/redoc`

---

## 4. How to Run the Frontend & Full-Stack Development Server

The repository is pre-configured with a full-stack Node/Express + Vite server that can also run standalone on Port 3000:

```bash
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`.

---

## 5. Key Architecture Highlights

1. **Document Parsing**:
   - `pdfplumber` / `PyPDF2` automatically extracts text, page breaks, and chapter anchors from PDFs.
   - `python-pptx` parses slide titles, bullet hierarchies, and speaker notes from PowerPoint decks.
2. **AI Study Agents**:
   - **CourseStrategyAgent**: Produces phased study masterplans tailored to syllabus weightings.
   - **TechniqueAgent**: Synthesizes Feynman analogies, active recall prompts, and Pomodoro blocks.
   - **FlashcardAgent & QuizAgent**: Extracts atomic memory units and generates diagnostic quizzes with rich distractors.
   - **AdaptiveScheduleAgent**: Calculates dynamic cognitive backlog reduction whenever tasks are completed.
3. **Spotify Focus Mode**:
   - Offers seamless OAuth 2.0 Web Playback SDK authentication.
   - Embeds pre-curated study tracks (Lofi Cyber Nexus, Obsidian Synthwave, 10Hz Alpha Waves, Classical Mozart).
