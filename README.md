# JobPilot AI — Agentic AI Job Hunter SaaS

**JobPilot AI** is a production-oriented, full-stack Agentic AI Job Hunter that discovers job opportunities from multiple federated sources, matches them against a user's verified resume, prioritizes applications, generates truthful tailored application materials, and tracks the entire job-search process across an interactive Kanban pipeline.

---

## 1. System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js Frontend (App Router)                   │
│   • Dashboard Overview   • Multi-Source Discovery   • AI Matches       │
│   • Applications Kanban  • Resume Studio (RAG)      • AI Assistant     │
│   • Analytics (Recharts) • Search Automation        • Settings         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST / SSE
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FastAPI AI Backend                              │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                 LangGraph Multi-Agent Engine                   │   │
│   │   [Search Planner] ──► [Discovery] ──► [Deduplication]         │   │
│   │         ▲                                    │                 │   │
│   │         │                                    ▼                 │   │
│   │   [Persistence]    ◄── [Ranking]   ◄── [Resume Matcher]        │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│   • Provider Adapters (Greenhouse, Lever, Wellfound, Indeed, LinkedIn) │
│   • Truthful RAG Resume Pipeline & Cover Letter Generator              │
│   • Career Assistant Multi-Tool Execution Engine                       │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
       ┌────────────────────────┐       ┌────────────────────────┐
       │ PostgreSQL + pgvector  │       │ Redis Background Queue │
       │ (or SQLite in Zero-Dev)│       │ (Scheduled AI Scouts)  │
       └────────────────────────┘       └────────────────────────┘
```

---

## 2. Directory Structure

```
job-hunter/
├── frontend/                     # Next.js 16 + React 19 + TypeScript + Tailwind CSS
│   ├── app/
│   │   ├── layout.tsx            # Global metadata and AppShell provider
│   │   ├── page.tsx              # Overview Dashboard (KPIs, Recharts trajectory, best matches)
│   │   ├── discover/page.tsx     # Multi-source job discovery & filtering (cards & table view)
│   │   ├── matches/page.tsx      # AI Semantic & Deterministic Matching score breakdown
│   │   ├── applications/page.tsx # Kanban application tracker & event history
│   │   ├── resume-studio/page.tsx# Resume editor, truthful bullet tailoring, cover letter
│   │   ├── career-assistant/page.tsx # Conversational AI Assistant with tool call inspector
│   │   ├── analytics/page.tsx    # Conversion analytics, match distribution, top skills
│   │   ├── automation/page.tsx   # Search scheduler configuration & run logs
│   │   └── settings/page.tsx     # AI provider endpoints, adapter toggles, data isolation
│   ├── components/
│   │   ├── AppShell.tsx          # Persistent sidebar and header shell
│   │   ├── Sidebar.tsx           # Persistent desktop sidebar & mobile drawer menu
│   │   ├── Header.tsx            # Top header with Live FastAPI / Mock Data toggle
│   │   ├── JobDetailModal.tsx    # Full job details, match analysis, cover letter generator
│   │   └── OnboardingModal.tsx   # 3-step candidate profile & search preferences wizard
│   ├── lib/
│   │   └── api-client.ts         # Typed API client with live FastAPI / mock fallback adapter
│   └── types/
│       └── index.ts              # Domain TypeScript types
├── backend/                      # Python FastAPI + LangChain + LangGraph
│   ├── app/
│   │   ├── main.py               # FastAPI entrypoint, CORS, health check
│   │   ├── config.py             # Pydantic Settings & environment variables
│   │   ├── database.py           # SQLAlchemy engine & session maker (Postgres / SQLite)
│   │   ├── models/
│   │   │   └── models.py         # SQLAlchemy ORM models (User, Resume, Job, Application, etc.)
│   │   ├── schemas/
│   │   │   └── schemas.py        # Pydantic validation schemas
│   │   ├── providers/
│   │   │   ├── base.py           # BaseJobProvider abstract interface & NormalizedJob
│   │   │   └── adapters.py       # Greenhouse, Lever, Wellfound, LinkedIn, Indeed, etc.
│   │   ├── agents/
│   │   │   ├── state.py          # LangGraph TypedDict state
│   │   │   ├── nodes.py          # Specialized agent nodes (Planner, Discovery, Dedup, Matcher)
│   │   │   └── graph.py          # StateGraph definition and execution workflow
│   │   ├── tools/
│   │   │   └── career_tools.py   # AI Assistant tools (compare_jobs, cover_letter, outreach)
│   │   ├── rag/
│   │   │   └── resume_rag.py     # Resume extraction & truthful bullet tailoring
│   │   └── api/
│   │       └── v1/
│   │           └── endpoints.py  # All REST routes matching Requirement 12
│   ├── tests/
│   │   └── test_api_and_agents.py # Pytest unit tests for endpoints, dedup, and matching
│   └── requirements.txt          # Python dependencies
├── docker-compose.yml            # Multi-container orchestration (Postgres, Redis, Backend, Frontend)
├── .env.example                  # Environment variable reference
└── README.md
```

---

## 3. Local Development Instructions

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.11+)

### Option A: Run Directly with Local Tools

#### 1. Start the FastAPI Backend
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The FastAPI backend will start at `http://127.0.0.1:8000`.
- Health Check: `http://127.0.0.1:8000/health`
- Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`

#### 2. Start the Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

> **Zero-Dependency Note**: The application includes a dual-mode API client. If the Python backend is not running, the frontend seamlessly operates in Client Mock Mode with full fidelity, toggleable via the header indicator!

---

### Option B: Run with Docker Compose

To spin up the complete production-grade stack including PostgreSQL with pgvector, Redis, FastAPI, and Next.js:

```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/docs`
- PostgreSQL pgvector: `localhost:5432`
- Redis: `localhost:6379`

---

## 4. LangGraph Multi-Agent Workflow

The autonomous job hunting loop runs as a state machine:

1. **Search Planner Agent**: Analyzes user preferences (target roles, locations, compensation threshold) and generates tailored boolean query vectors for each source.
2. **Job Discovery Agent**: Queries provider adapters in parallel, capturing source provenance, retrieval timestamps, and normalizing into `NormalizedJob`.
3. **Job Deduplication Agent**: Computes canonical hashes of `(company + title)` to eliminate redundant cross-posted listings.
4. **Resume Parsing Agent**: Extracts factual competencies, years of experience, and project evidence from PDF/DOCX resumes without hallucination.
5. **Job Matching Agent**: Computes composite 0–100 match scores using deterministic skill coverage combined with semantic embedding similarity. Explains strengths, missing qualifications, and generates targeted interview prep topics.
6. **Application Preparation Agent**: Prepares truthful tailored resume bullet points and generates custom cover letters.
7. **Application Tracking Agent**: Coordinates status movements across Kanban columns and triggers celebration effects upon receiving an Offer.
8. **Career Assistant Agent**: Context-aware RAG assistant supporting tool calling (`search_jobs`, `compare_jobs`, `create_recruiter_message_draft`, etc.).

---

## 5. Running Tests

Run the backend pytest suite covering normalization, deduplication, deterministic matching, and API lifecycles:

```bash
cd backend
python -m pytest tests/ -v
```

All 8 tests will execute and pass:
- `test_health_check`
- `test_get_profile`
- `test_list_jobs`
- `test_job_search_filter`
- `test_application_lifecycle`
- `test_analytics_overview`
- `test_job_deduplication`
- `test_job_matching_logic`

---

## 6. Provider Integration Policies & Ethics

JobPilot AI interfaces only with authorized APIs, permitted company public job boards (e.g. Greenhouse and Lever board endpoints), partner XML feeds, or standard link-out workflows.
- It **never** bypasses CAPTCHAs or violates platform terms of service.
- If a provider (such as LinkedIn) requires recruiter credentials, it provides a structured search link-out workflow with query builder parameters.
- Applications and recruiter outreach messages are prepared as drafts requiring explicit candidate review and consent before external submission.
