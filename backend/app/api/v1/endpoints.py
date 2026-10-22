import uuid
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Query, Depends
from app.schemas.schemas import (
    UserProfileResponse, UserPreferenceBase, UserPreferenceUpdate,
    ResumeUploadResponse, ResumeDataResponse, ResumeTailorRequest, ResumeTailorResponse,
    CoverLetterGenerateRequest, CoverLetterGenerateResponse,
    JobSchema, JobSearchRequest, JobSearchResponse, JobMatchSchema,
    ApplicationCreate, ApplicationUpdate, ApplicationResponse, FollowUpRequest,
    AutomationConfig, AutomationResponse, AutomationRunResponse,
    AgentChatRequest, AgentChatResponse, AgentToolCall,
    AgentWorkflowRunRequest, AgentWorkflowRunResponse,
    AnalyticsOverview
)
from app.providers.adapters import provider_registry
from app.agents.graph import run_job_hunter_workflow
from app.tools.career_tools import career_tools
from app.rag.resume_rag import resume_pipeline

router = APIRouter()

# In-Memory Seed State for Instant Out-of-the-Box Operation
mock_profile = {
    "id": "usr-alex-1001",
    "email": "alex.morgan@example.com",
    "full_name": "Alex Morgan",
    "is_active": True,
    "created_at": datetime.utcnow() - timedelta(days=30),
    "preference": {
        "target_roles": ["Senior Full Stack Engineer", "Staff AI Systems Engineer", "AI Platform Lead"],
        "preferred_locations": ["San Francisco, CA", "Remote (US/Global)", "Bengaluru, India"],
        "remote_preference": "remote",
        "min_salary": 160000,
        "salary_currency": "USD",
        "experience_level": "Senior",
        "skills": ["TypeScript", "Next.js", "Python", "FastAPI", "PostgreSQL", "LangChain", "LangGraph", "Redis", "Tailwind CSS"],
        "preferred_companies": ["Stripe", "Figma", "Anthropic", "OpenAI", "Scale AI", "Vercel", "Linear"],
        "employment_type": "full-time",
        "notice_period": "30 days",
        "search_frequency": "daily"
    }
}

mock_resume = {
    "id": "res-master-01",
    "file_name": "Alex_Morgan_Staff_FullStack_AI_Resume.pdf",
    "raw_text": "Alex Morgan - Senior Full Stack & AI Systems Engineer. 6+ years experience building distributed microservices with Python, FastAPI, Next.js, and LangChain...",
    "parsed_data": resume_pipeline.parse_resume_structure(""),
    "created_at": datetime.utcnow() - timedelta(days=15)
}

mock_jobs: List[dict] = [
    {
        "id": "gh-stripe-4921",
        "title": "Staff AI Platform Engineer",
        "company": "Stripe",
        "company_logo": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop",
        "location": "San Francisco, CA (Remote Option)",
        "work_mode": "remote",
        "salary_min": 210000,
        "salary_max": 290000,
        "salary_currency": "USD",
        "experience_level": "Staff / Lead",
        "job_type": "full-time",
        "description": "We are building the next generation AI infrastructure at Stripe to empower payment automation and fraud intelligence. Looking for engineers experienced in LangChain, Python, distributed systems, and real-time inference.",
        "requirements": ["7+ years experience with Python & Distributed Systems", "Experience with LLM inference, LangChain, or LangGraph", "Production experience with PostgreSQL and Redis"],
        "nice_to_have": ["Experience with pgvector or semantic search", "Payments domain experience"],
        "skills": ["Python", "FastAPI", "LangChain", "PostgreSQL", "Redis", "Distributed Systems"],
        "source_code": "greenhouse",
        "source_url": "https://stripe.com/jobs",
        "posted_at": datetime.utcnow() - timedelta(hours=4),
        "is_saved": True,
        "is_dismissed": False,
        "match": {
            "overall_score": 96,
            "skills_score": 98,
            "experience_score": 94,
            "matched_skills": ["Python", "FastAPI", "LangChain", "PostgreSQL", "Redis"],
            "missing_skills": ["Distributed Systems"],
            "match_reasons": ["Direct match with target stack (FastAPI, LangChain, PostgreSQL)", "Top-tier compensation above target", "Remote flexibility matches your profile"],
            "concerns": ["Requires deep high-concurrency systems experience"],
            "interview_topics": ["Distributed Redis locking & cache invalidation", "Designing safe agentic fallback strategies", "High-throughput asynchronous Python architecture"]
        }
    },
    {
        "id": "gh-figma-8312",
        "title": "Senior Full Stack Engineer - AI Experiences",
        "company": "Figma",
        "company_logo": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=100&h=100&fit=crop",
        "location": "Remote - US / Canada",
        "work_mode": "remote",
        "salary_min": 175000,
        "salary_max": 245000,
        "salary_currency": "USD",
        "experience_level": "Senior",
        "job_type": "full-time",
        "description": "Help shape the future of collaborative design by integrating generative AI capabilities directly into the Figma canvas. You will architect intuitive Next.js frontend interfaces and fast backend APIs.",
        "requirements": ["5+ years building production web apps with TypeScript and React", "Strong understanding of Next.js App Router and state management", "Experience working with Python backends or Node.js services"],
        "nice_to_have": ["Knowledge of WebGL / Canvas rendering", "LLM evaluation techniques"],
        "skills": ["TypeScript", "Next.js", "React", "Tailwind CSS", "Python", "REST APIs"],
        "source_code": "greenhouse",
        "source_url": "https://figma.com/careers",
        "posted_at": datetime.utcnow() - timedelta(hours=18),
        "is_saved": False,
        "is_dismissed": False,
        "match": {
            "overall_score": 94,
            "skills_score": 96,
            "experience_score": 92,
            "matched_skills": ["TypeScript", "Next.js", "React", "Tailwind CSS", "Python"],
            "missing_skills": ["Canvas Rendering"],
            "match_reasons": ["Exceptional frontend architecture alignment", "Fully remote role", "Matches preferred company list"],
            "concerns": ["Heavy visual design and creative canvas focus"],
            "interview_topics": ["State management in high-frequency interactive canvas apps", "Next.js App Router SSR and performance patterns", "API contract design between React and Python"]
        }
    },
    {
        "id": "lever-anthropic-104",
        "title": "AI Applications Full Stack Engineer",
        "company": "Anthropic",
        "company_logo": "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=100&h=100&fit=crop",
        "location": "San Francisco, CA / Hybrid",
        "work_mode": "hybrid",
        "salary_min": 200000,
        "salary_max": 280000,
        "salary_currency": "USD",
        "experience_level": "Senior",
        "job_type": "full-time",
        "description": "Build internal tools, red-teaming consoles, and user-facing AI applications powering Claude. You will bridge complex AI agent workflows with sleek, highly responsive frontend interfaces.",
        "requirements": ["Deep knowledge of TypeScript, React, and Python", "Familiarity with agentic workflows, function calling, and RAG pipelines", "High focus on reliability, security, and developer UX"],
        "nice_to_have": ["LangGraph or AutoGen experience", "FastAPI and PostgreSQL"],
        "skills": ["TypeScript", "React", "Python", "FastAPI", "LangGraph", "RAG", "PostgreSQL"],
        "source_code": "lever",
        "source_url": "https://anthropic.com/careers",
        "posted_at": datetime.utcnow() - timedelta(days=1),
        "is_saved": True,
        "is_dismissed": False,
        "match": {
            "overall_score": 92,
            "skills_score": 95,
            "experience_score": 88,
            "matched_skills": ["TypeScript", "React", "Python", "FastAPI", "LangGraph", "PostgreSQL"],
            "missing_skills": ["Red-Teaming"],
            "match_reasons": ["State-of-the-art AI lab with highest tier compensation", "Exact match for LangGraph & agent workflows"],
            "concerns": ["Hybrid work policy (SF office 2 days/week)"],
            "interview_topics": ["Safe prompt execution & injection prevention", "LangGraph conditional routing and state checkpoints", "Real-time SSE token streaming to React interfaces"]
        }
    },
    {
        "id": "wf-langchain-33",
        "title": "Lead AI Engineer - Multi-Agent Workflows",
        "company": "Autonomous AI (YC W24)",
        "company_logo": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&h=100&fit=crop",
        "location": "Remote (Global)",
        "work_mode": "remote",
        "salary_min": 160000,
        "salary_max": 220000,
        "salary_currency": "USD",
        "experience_level": "Lead",
        "job_type": "full-time",
        "description": "We are crafting agentic workflows for enterprise sales. You will build LangGraph state machines, multi-step search planners, and dynamic resume matching engines.",
        "requirements": ["Demonstrated experience building autonomous agents with LangGraph or CrewAI", "Production Python / FastAPI mastery", "Comfortable with rapid startup iteration"],
        "nice_to_have": ["Equity-driven mindset", "Experience with Next.js dashboards"],
        "skills": ["LangGraph", "LangChain", "Python", "FastAPI", "TypeScript", "Next.js"],
        "source_code": "wellfound",
        "source_url": "https://wellfound.com/jobs",
        "posted_at": datetime.utcnow() - timedelta(hours=8),
        "is_saved": False,
        "is_dismissed": False,
        "match": {
            "overall_score": 89,
            "skills_score": 92,
            "experience_score": 85,
            "matched_skills": ["LangGraph", "LangChain", "Python", "FastAPI", "TypeScript", "Next.js"],
            "missing_skills": ["Enterprise CRM Integrations"],
            "match_reasons": ["Perfect overlap with your agentic AI engineering background", "High equity upside (1.0% - 2.5%)"],
            "concerns": ["Early-stage YC startup workload pace"],
            "interview_topics": ["Designing fault-tolerant agent retries", "Managing cyclic graphs vs DAGs", "Prompt optimization and latency reduction"]
        }
    },
    {
        "id": "ind-uber-412",
        "title": "Senior Backend Systems Engineer",
        "company": "Uber",
        "company_logo": "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&h=100&fit=crop",
        "location": "San Francisco, CA / Seattle, WA",
        "work_mode": "hybrid",
        "salary_min": 170000,
        "salary_max": 235000,
        "salary_currency": "USD",
        "experience_level": "Senior",
        "job_type": "full-time",
        "description": "Join Uber's Marketplace engineering team to build low-latency matching and dispatch algorithms. Work with high-concurrency systems handling millions of transactions.",
        "requirements": ["5+ years experience in high throughput backend engineering", "Strong fundamentals in concurrency, caching, and data modeling", "Experience with Redis, Kafka, and PostgreSQL"],
        "nice_to_have": ["Go or Python experience", "Geospatial indexing"],
        "skills": ["Python", "PostgreSQL", "Redis", "Distributed Systems", "Microservices"],
        "source_code": "indeed",
        "source_url": "https://www.indeed.com/viewjob?jk=uber-marketplace-engineer",
        "posted_at": datetime.utcnow() - timedelta(days=3),
        "is_saved": False,
        "is_dismissed": False,
        "match": {
            "overall_score": 84,
            "skills_score": 85,
            "experience_score": 83,
            "matched_skills": ["Python", "PostgreSQL", "Redis"],
            "missing_skills": ["Kafka", "Geospatial Indexing"],
            "match_reasons": ["Strong backend fundamentals match", "Proven brand & engineering pedigree"],
            "concerns": ["Less generative AI focus; primarily core backend distribution"],
            "interview_topics": ["Concurrency models in Python vs Go", "PostgreSQL query tuning & indexing strategies"]
        }
    }
]

mock_applications: List[dict] = [
    {
        "id": "app-001",
        "user_id": "usr-alex-1001",
        "job_id": "gh-stripe-4921",
        "company": "Stripe",
        "role_title": "Staff AI Platform Engineer",
        "source_url": "https://stripe.com/jobs",
        "stage": "Interview",
        "applied_at": datetime.utcnow() - timedelta(days=6),
        "salary_offered": "$235,000 + Equity",
        "recruiter_name": "Elena Rostova",
        "recruiter_email": "elena.r@stripe.com",
        "interview_date": datetime.utcnow() + timedelta(days=2, hours=3),
        "follow_up_date": datetime.utcnow() + timedelta(days=3),
        "notes": "Completed Technical Screening with Staff Architect. Round 2 is Systems Architecture focusing on LangGraph orchestration and Redis cache consistency.",
        "cover_letter": "I am thrilled to apply for the Staff AI Platform Engineer position at Stripe...",
        "created_at": datetime.utcnow() - timedelta(days=6),
        "updated_at": datetime.utcnow() - timedelta(hours=12),
        "events": [
            {"id": "ev-1", "from_stage": None, "to_stage": "Saved", "note": "Discovered via Greenhouse Agent", "created_at": datetime.utcnow() - timedelta(days=7)},
            {"id": "ev-2", "from_stage": "Saved", "to_stage": "Applied", "note": "Applied via company portal with tailored resume", "created_at": datetime.utcnow() - timedelta(days=6)},
            {"id": "ev-3", "from_stage": "Applied", "to_stage": "Assessment", "note": "Completed take-home AI system evaluation (Passed)", "created_at": datetime.utcnow() - timedelta(days=4)},
            {"id": "ev-4", "from_stage": "Assessment", "to_stage": "Interview", "note": "Recruiter confirmed Round 2 Systems Interview", "created_at": datetime.utcnow() - timedelta(hours=12)}
        ]
    },
    {
        "id": "app-002",
        "user_id": "usr-alex-1001",
        "job_id": "lever-anthropic-104",
        "company": "Anthropic",
        "role_title": "AI Applications Full Stack Engineer",
        "source_url": "https://anthropic.com/careers",
        "stage": "Applied",
        "applied_at": datetime.utcnow() - timedelta(days=2),
        "salary_offered": None,
        "recruiter_name": "Marcus Vance",
        "recruiter_email": "mvance@anthropic.com",
        "interview_date": None,
        "follow_up_date": datetime.utcnow() + timedelta(days=5),
        "notes": "Application submitted with tailored cover letter emphasizing RAG evaluation and streaming UI.",
        "cover_letter": "To the Anthropic Hiring Team: As a builder of multi-agent workflows...",
        "created_at": datetime.utcnow() - timedelta(days=3),
        "updated_at": datetime.utcnow() - timedelta(days=2),
        "events": [
            {"id": "ev-5", "from_stage": None, "to_stage": "Saved", "note": "Found via Lever adapter", "created_at": datetime.utcnow() - timedelta(days=3)},
            {"id": "ev-6", "from_stage": "Saved", "to_stage": "Applied", "note": "Submitted application", "created_at": datetime.utcnow() - timedelta(days=2)}
        ]
    },
    {
        "id": "app-003",
        "user_id": "usr-alex-1001",
        "job_id": "gh-figma-8312",
        "company": "Figma",
        "role_title": "Senior Full Stack Engineer - AI Experiences",
        "source_url": "https://figma.com/careers",
        "stage": "Shortlisted",
        "applied_at": None,
        "salary_offered": None,
        "recruiter_name": None,
        "recruiter_email": None,
        "interview_date": None,
        "follow_up_date": None,
        "notes": "Resume tailored. Reviewing before-and-after bullets in Resume Studio before final application submission.",
        "cover_letter": None,
        "created_at": datetime.utcnow() - timedelta(days=1),
        "updated_at": datetime.utcnow() - timedelta(days=1),
        "events": [
            {"id": "ev-7", "from_stage": None, "to_stage": "Saved", "note": "Bookmarked from daily scout", "created_at": datetime.utcnow() - timedelta(days=1)},
            {"id": "ev-8", "from_stage": "Saved", "to_stage": "Shortlisted", "note": "Moved to Shortlist for priority review", "created_at": datetime.utcnow() - timedelta(hours=6)}
        ]
    },
    {
        "id": "app-004",
        "user_id": "usr-alex-1001",
        "job_id": "wf-langchain-33",
        "company": "Autonomous AI (YC W24)",
        "role_title": "Lead AI Engineer - Multi-Agent Workflows",
        "source_url": "https://wellfound.com/jobs",
        "stage": "Offer",
        "applied_at": datetime.utcnow() - timedelta(days=14),
        "salary_offered": "$195,000 + 1.8% Equity",
        "recruiter_name": "Devin Chen (Founder)",
        "recruiter_email": "devin@autonomousai.example",
        "interview_date": None,
        "follow_up_date": datetime.utcnow() + timedelta(days=2),
        "notes": "Written offer received! Competitive base + equity. Decision needed by Friday.",
        "cover_letter": None,
        "created_at": datetime.utcnow() - timedelta(days=14),
        "updated_at": datetime.utcnow() - timedelta(hours=3),
        "events": [
            {"id": "ev-9", "from_stage": "Interview", "to_stage": "Offer", "note": "Offer package delivered", "created_at": datetime.utcnow() - timedelta(hours=3)}
        ]
    }
]

mock_automations = [
    {
        "id": "aut-001",
        "name": "Daily Agentic Scout",
        "is_active": True,
        "frequency": "daily",
        "keywords": ["Staff AI Engineer", "Senior Full Stack", "AI Platform"],
        "locations": ["Remote", "San Francisco, CA"],
        "min_match_score": 80,
        "enabled_sources": ["greenhouse", "lever", "wellfound", "indeed", "linkedin"],
        "email_notifications": True,
        "max_jobs_per_run": 25,
        "last_run_at": datetime.utcnow() - timedelta(hours=6),
        "next_run_at": datetime.utcnow() + timedelta(hours=18)
    }
]

mock_automation_runs = [
    {
        "id": "run-901",
        "automation_id": "aut-001",
        "status": "completed",
        "jobs_found": 18,
        "jobs_matched": 12,
        "errors": [],
        "started_at": datetime.utcnow() - timedelta(hours=6),
        "completed_at": datetime.utcnow() - timedelta(hours=6, seconds=-42)
    }
]

# Profile Endpoints
@router.get("/profile", response_model=UserProfileResponse)
def get_user_profile():
    return mock_profile

@router.patch("/profile", response_model=UserProfileResponse)
def update_user_profile(payload: UserPreferenceUpdate):
    for key, value in payload.model_dump(exclude_unset=True).items():
        if key in mock_profile["preference"]:
            mock_profile["preference"][key] = value
    return mock_profile

# Resume Endpoints
@router.post("/resume/upload", response_model=ResumeUploadResponse)
async def upload_resume(file: UploadFile = File(...)):
    if not (file.filename.endswith(".pdf") or file.filename.endswith(".docx") or file.filename.endswith(".txt")):
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, and TXT files are supported.")
    
    content = await file.read()
    if file.filename.endswith(".pdf"):
        text = resume_pipeline.extract_text_from_pdf(content)
    elif file.filename.endswith(".docx"):
        text = resume_pipeline.extract_text_from_docx(content)
    else:
        text = content.decode("utf-8", errors="ignore")

    parsed = resume_pipeline.parse_resume_structure(text)
    mock_resume["file_name"] = file.filename
    mock_resume["raw_text"] = text
    mock_resume["parsed_data"] = parsed

    return {
        "id": str(uuid.uuid4()),
        "file_name": file.filename,
        "file_size": len(content),
        "is_active": True,
        "parsed_summary": parsed.get("summary", ""),
        "skills_extracted": parsed.get("skills", []),
        "experience_years_estimated": parsed.get("experience_years", 5)
    }

@router.get("/resume", response_model=ResumeDataResponse)
def get_resume():
    return mock_resume

@router.post("/resume/tailor", response_model=ResumeTailorResponse)
def tailor_resume(payload: ResumeTailorRequest):
    # Find target job
    job = next((j for j in mock_jobs if j["id"] == payload.job_id), None)
    target_skills = job.get("skills", []) if job else ["Python", "FastAPI", "Next.js", "AI"]

    original_bullets = [
        "Architected microservices handling 10M+ daily events using FastAPI, PostgreSQL, and Redis.",
        "Designed and deployed Next.js web portals with Tailwind CSS and responsive design systems.",
        "Integrated LangChain and vector retrieval pipelines for automated semantic document analysis."
    ]

    tailored = resume_pipeline.generate_tailored_bullets(original_bullets, target_skills)

    return {
        "version_id": str(uuid.uuid4()),
        "job_id": payload.job_id,
        "original_bullets": original_bullets,
        "tailored_bullets": tailored,
        "alignment_summary": f"Emphasized production concurrency, vector retrieval accuracy, and Next.js frontend performance specifically targeting {job.get('company') if job else 'the target role'}."
    }

@router.post("/cover-letter/generate", response_model=CoverLetterGenerateResponse)
def generate_cover_letter(payload: CoverLetterGenerateRequest):
    job = next((j for j in mock_jobs if j["id"] == payload.job_id), None)
    company = job.get("company", "Company") if job else "Company"
    role = job.get("title", "Software Engineer") if job else "Software Engineer"

    letter = career_tools.create_cover_letter_draft(
        company=company,
        role_title=role,
        user_name=mock_profile["full_name"]
    )
    return {
        "job_id": payload.job_id,
        "company": company,
        "role_title": role,
        "cover_letter": letter
    }

# Jobs Endpoints
@router.post("/jobs/search", response_model=JobSearchResponse)
def search_jobs(payload: JobSearchRequest):
    filtered = list(mock_jobs)
    
    if payload.query:
        q = payload.query.lower()
        filtered = [
            j for j in filtered 
            if q in j["title"].lower() or q in j["company"].lower() or any(q in s.lower() for s in j.get("skills", []))
        ]
    if payload.remote_only:
        filtered = [j for j in filtered if j.get("work_mode") == "remote"]
    if payload.min_match_score is not None:
        filtered = [j for j in filtered if j.get("match", {}).get("overall_score", 0) >= payload.min_match_score]
    if payload.min_salary:
        filtered = [j for j in filtered if j.get("salary_max", 0) >= payload.min_salary]

    return {
        "total": len(filtered),
        "page": payload.page,
        "page_size": payload.page_size,
        "items": filtered
    }

@router.get("/jobs", response_model=JobSearchResponse)
def list_jobs(page: int = 1, page_size: int = 20):
    return {
        "total": len(mock_jobs),
        "page": page,
        "page_size": page_size,
        "items": mock_jobs
    }

@router.get("/jobs/{job_id}", response_model=JobSchema)
def get_job(job_id: str):
    job = next((j for j in mock_jobs if j["id"] == job_id), None)
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")
    return job

@router.post("/jobs/{job_id}/save")
def save_job(job_id: str):
    job = next((j for j in mock_jobs if j["id"] == job_id), None)
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")
    job["is_saved"] = not job.get("is_saved", False)
    return {"id": job_id, "is_saved": job["is_saved"]}

@router.post("/jobs/{job_id}/dismiss")
def dismiss_job(job_id: str):
    job = next((j for j in mock_jobs if j["id"] == job_id), None)
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")
    job["is_dismissed"] = True
    return {"id": job_id, "is_dismissed": True}

@router.post("/jobs/{job_id}/match", response_model=JobMatchSchema)
def calculate_job_match(job_id: str):
    job = next((j for j in mock_jobs if j["id"] == job_id), None)
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")
    return job["match"]

# Application Tracking Endpoints
@router.get("/applications", response_model=List[ApplicationResponse])
def get_applications():
    return mock_applications

@router.post("/applications", response_model=ApplicationResponse)
def create_application(payload: ApplicationCreate):
    new_app = {
        "id": f"app-{str(uuid.uuid4())[:8]}",
        "user_id": mock_profile["id"],
        "job_id": payload.job_id,
        "company": payload.company,
        "role_title": payload.role_title,
        "source_url": payload.source_url,
        "stage": payload.stage,
        "applied_at": payload.applied_at or datetime.utcnow(),
        "salary_offered": payload.salary_offered,
        "recruiter_name": payload.recruiter_name,
        "recruiter_email": payload.recruiter_email,
        "interview_date": payload.interview_date,
        "follow_up_date": payload.follow_up_date,
        "notes": payload.notes,
        "cover_letter": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "events": [
            {
                "id": str(uuid.uuid4()),
                "from_stage": None,
                "to_stage": payload.stage,
                "note": "Application created manually or via JobPilot",
                "created_at": datetime.utcnow()
            }
        ]
    }
    mock_applications.insert(0, new_app)
    return new_app

@router.patch("/applications/{application_id}", response_model=ApplicationResponse)
def update_application(application_id: str, payload: ApplicationUpdate):
    app = next((a for a in mock_applications if a["id"] == application_id), None)
    if not app:
        raise HTTPException(status_code=404, detail="Application record not found")

    old_stage = app["stage"]
    for k, v in payload.model_dump(exclude_unset=True).items():
        app[k] = v
    app["updated_at"] = datetime.utcnow()

    if payload.stage and payload.stage != old_stage:
        app["events"].insert(0, {
            "id": str(uuid.uuid4()),
            "from_stage": old_stage,
            "to_stage": payload.stage,
            "note": payload.notes or f"Moved from {old_stage} to {payload.stage}",
            "created_at": datetime.utcnow()
        })

    return app

@router.post("/applications/{application_id}/follow-up")
def create_application_follow_up(application_id: str, payload: FollowUpRequest):
    app = next((a for a in mock_applications if a["id"] == application_id), None)
    if not app:
        raise HTTPException(status_code=404, detail="Application record not found")
    app["follow_up_date"] = payload.reminder_date
    return {"status": "scheduled", "application_id": application_id, "reminder_date": payload.reminder_date}

# AI Career Assistant & Multi-Agent Run Endpoints
@router.post("/agent/chat", response_model=AgentChatResponse)
async def chat_with_career_assistant(payload: AgentChatRequest):
    msg = payload.message.lower()
    tool_calls: List[AgentToolCall] = []
    response_text = ""
    suggested = []

    if "match" in msg or "best" in msg or "recommend" in msg:
        results = career_tools.search_jobs("engineer", remote_only=True)
        tool_calls.append(AgentToolCall(
            tool_name="search_jobs",
            parameters={"query": "engineer", "remote_only": True},
            result=results
        ))
        response_text = (
            "I analyzed your profile against active listings. Your strongest fit right now is **Stripe - Staff AI Platform Engineer** (96% match) "
            "due to direct alignment with Python, FastAPI, and LangChain. **Figma - Senior Full Stack** is also a 94% match if you want a visual AI product focus."
        )
        suggested = ["Tailor my resume for Stripe", "Draft recruiter outreach for Figma", "Compare Stripe and Figma"]

    elif "compare" in msg:
        comp = career_tools.compare_jobs("gh-stripe-4921", "gh-figma-8312")
        tool_calls.append(AgentToolCall(
            tool_name="compare_jobs",
            parameters={"job_id_a": "gh-stripe-4921", "job_id_b": "gh-figma-8312"},
            result=comp
        ))
        response_text = comp["comparison"] + "\n\n**Strategy Recommendation**: " + comp["recommendation"]
        suggested = ["Draft cover letter for Stripe", "What are common interview questions for Stripe?"]

    elif "cover letter" in msg or "draft" in msg:
        letter = career_tools.create_cover_letter_draft("Stripe", "Staff AI Platform Engineer", mock_profile["full_name"])
        tool_calls.append(AgentToolCall(
            tool_name="create_cover_letter_draft",
            parameters={"company": "Stripe", "role_title": "Staff AI Platform Engineer"},
            result={"length": len(letter)}
        ))
        response_text = f"Here is a tailored cover letter draft grounded strictly in your verified background:\n\n```text\n{letter}\n```\n\nYou can review, refine, and export this in the **Resume Studio**."
        suggested = ["Draft recruiter message for Stripe", "Schedule follow-up reminder"]

    elif "outreach" in msg or "recruiter" in msg:
        outreach = career_tools.create_recruiter_message_draft("Stripe", "Staff AI Platform Engineer")
        tool_calls.append(AgentToolCall(
            tool_name="create_recruiter_message_draft",
            parameters={"company": "Stripe", "role_title": "Staff AI Platform Engineer"},
            result={"text": outreach}
        ))
        response_text = f"Here is a concise, high-response LinkedIn/Email recruiter message:\n\n> {outreach}"
        suggested = ["Prepare interview prep topics", "Show my application pipeline"]

    elif "pipeline" in msg or "status" in msg:
        response_text = (
            f"You currently have **{len(mock_applications)} active applications**:\n"
            "- **Stripe**: Interview stage (Round 2 Systems scheduled)\n"
            "- **Autonomous AI**: Offer received ($195k + 1.8% equity)\n"
            "- **Anthropic**: Applied (Follow-up due in 5 days)\n"
            "- **Figma**: Shortlisted (Ready for tailored application)"
        )
        suggested = ["Schedule follow-up reminder for Anthropic", "Find more jobs like Stripe"]

    else:
        response_text = (
            "I'm your dedicated JobPilot Career Assistant. I can help you find high-match opportunities, "
            "truthfully tailor your resume bullets, prepare interview talking points, or draft recruiter messages."
        )
        suggested = ["Find jobs matching my resume", "Explain why Stripe is a good fit", "Summarize my application pipeline"]

    return {
        "response": response_text,
        "tool_calls": tool_calls,
        "suggested_actions": suggested
    }

@router.post("/agent/run", response_model=AgentWorkflowRunResponse)
async def trigger_agent_workflow(payload: AgentWorkflowRunRequest):
    run_state = await run_job_hunter_workflow({
        "user_id": mock_profile["id"],
        "target_roles": mock_profile["preference"]["target_roles"],
        "preferred_locations": mock_profile["preference"]["preferred_locations"],
        "remote_preference": mock_profile["preference"]["remote_preference"],
        "skills": mock_profile["preference"]["skills"],
        "min_salary": mock_profile["preference"]["min_salary"],
        "enabled_sources": payload.sync_sources or ["greenhouse", "lever", "wellfound"]
    })

    return {
        "run_id": str(uuid.uuid4()),
        "status": "completed",
        "steps_executed": run_state.get("execution_steps", []),
        "jobs_discovered": len(run_state.get("raw_discovered_jobs", [])),
        "jobs_matched": len(run_state.get("matched_jobs", [])),
        "summary": f"Executed full LangGraph multi-agent loop across {len(payload.sync_sources or ['greenhouse', 'lever', 'wellfound'])} providers. Discovered and ranked opportunities."
    }

# Automation Endpoints
@router.get("/automations", response_model=List[AutomationResponse])
def get_automations():
    return mock_automations

@router.post("/automations", response_model=AutomationResponse)
def create_automation(payload: AutomationConfig):
    auto = {
        "id": f"aut-{str(uuid.uuid4())[:6]}",
        "name": payload.name,
        "is_active": payload.is_active,
        "frequency": payload.frequency,
        "keywords": payload.keywords,
        "locations": payload.locations,
        "min_match_score": payload.min_match_score,
        "enabled_sources": payload.enabled_sources,
        "email_notifications": payload.email_notifications,
        "max_jobs_per_run": payload.max_jobs_per_run,
        "last_run_at": None,
        "next_run_at": datetime.utcnow() + timedelta(days=1)
    }
    mock_automations.append(auto)
    return auto

@router.patch("/automations/{automation_id}", response_model=AutomationResponse)
def update_automation(automation_id: str, payload: dict):
    auto = next((a for a in mock_automations if a["id"] == automation_id), None)
    if not auto:
        raise HTTPException(status_code=404, detail="Automation not found")
    for k, v in payload.items():
        if k in auto:
            auto[k] = v
    return auto

@router.post("/automations/{automation_id}/run", response_model=AutomationRunResponse)
def run_automation_now(automation_id: str):
    auto = next((a for a in mock_automations if a["id"] == automation_id), None)
    if not auto:
        raise HTTPException(status_code=404, detail="Automation not found")
    
    auto["last_run_at"] = datetime.utcnow()
    run = {
        "id": f"run-{str(uuid.uuid4())[:6]}",
        "automation_id": automation_id,
        "status": "completed",
        "jobs_found": 15,
        "jobs_matched": 8,
        "errors": [],
        "started_at": datetime.utcnow() - timedelta(seconds=12),
        "completed_at": datetime.utcnow()
    }
    mock_automation_runs.insert(0, run)
    return run

# Analytics Overview
@router.get("/analytics/overview", response_model=AnalyticsOverview)
def get_analytics_overview():
    # Dynamic counts from current applications
    stage_counts = {
        "Saved": sum(1 for a in mock_applications if a["stage"] == "Saved"),
        "Shortlisted": sum(1 for a in mock_applications if a["stage"] == "Shortlisted"),
        "Applied": sum(1 for a in mock_applications if a["stage"] == "Applied"),
        "Assessment": sum(1 for a in mock_applications if a["stage"] == "Assessment"),
        "Interview": sum(1 for a in mock_applications if a["stage"] == "Interview"),
        "Offer": sum(1 for a in mock_applications if a["stage"] == "Offer"),
        "Rejected": sum(1 for a in mock_applications if a["stage"] == "Rejected"),
        "Withdrawn": sum(1 for a in mock_applications if a["stage"] == "Withdrawn")
    }

    pipeline = [{"stage": k, "count": v} for k, v in stage_counts.items()]

    trends = [
        {"date": "Mon", "jobs_discovered": 14, "matches": 8, "applied": 1},
        {"date": "Tue", "jobs_discovered": 22, "matches": 12, "applied": 2},
        {"date": "Wed", "jobs_discovered": 19, "matches": 11, "applied": 0},
        {"date": "Thu", "jobs_discovered": 27, "matches": 16, "applied": 1},
        {"date": "Fri", "jobs_discovered": 31, "matches": 21, "applied": 2},
        {"date": "Sat", "jobs_discovered": 15, "matches": 7, "applied": 0},
        {"date": "Sun", "jobs_discovered": 18, "matches": 9, "applied": 1}
    ]

    return {
        "total_jobs_discovered": 146,
        "new_jobs_today": 18,
        "strong_matches": 38,
        "applications_submitted": stage_counts["Applied"] + stage_counts["Assessment"] + stage_counts["Interview"] + stage_counts["Offer"],
        "interviews_scheduled": stage_counts["Interview"],
        "responses_received": stage_counts["Assessment"] + stage_counts["Interview"] + stage_counts["Offer"],
        "applications_needing_followup": 2,
        "pipeline": pipeline,
        "discovery_trends": trends,
        "match_distribution": {
            "90-100%": 12,
            "80-89%": 26,
            "70-79%": 44,
            "60-69%": 38,
            "< 60%": 26
        },
        "top_matched_skills": [
            {"skill": "Python", "frequency": 42},
            {"skill": "FastAPI", "frequency": 38},
            {"skill": "TypeScript", "frequency": 35},
            {"skill": "Next.js", "frequency": 31},
            {"skill": "LangChain", "frequency": 28},
            {"skill": "PostgreSQL", "frequency": 24}
        ]
    }
