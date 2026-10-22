from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# User & Preference Schemas
class UserPreferenceBase(BaseModel):
    target_roles: List[str] = ["Senior Full Stack Engineer", "Staff AI Engineer"]
    preferred_locations: List[str] = ["San Francisco, CA", "Remote", "New York, NY", "Bengaluru"]
    remote_preference: str = "remote"
    min_salary: int = 140000
    salary_currency: str = "USD"
    experience_level: str = "Senior"
    skills: List[str] = ["TypeScript", "Next.js", "Python", "FastAPI", "PostgreSQL", "LangChain", "Tailwind CSS"]
    preferred_companies: List[str] = ["Stripe", "Linear", "OpenAI", "Anthropic", "Scale AI", "Vercel"]
    employment_type: str = "full-time"
    notice_period: str = "Immediately"
    search_frequency: str = "daily"

class UserPreferenceUpdate(BaseModel):
    target_roles: Optional[List[str]] = None
    preferred_locations: Optional[List[str]] = None
    remote_preference: Optional[str] = None
    min_salary: Optional[int] = None
    salary_currency: Optional[str] = None
    experience_level: Optional[str] = None
    skills: Optional[List[str]] = None
    preferred_companies: Optional[List[str]] = None
    employment_type: Optional[str] = None
    notice_period: Optional[str] = None
    search_frequency: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: str
    email: str
    full_name: str
    is_active: bool
    created_at: datetime
    preference: Optional[UserPreferenceBase] = None

# Resume Schemas
class ResumeUploadResponse(BaseModel):
    id: str
    file_name: str
    file_size: int
    is_active: bool
    parsed_summary: str
    skills_extracted: List[str]
    experience_years_estimated: int

class ResumeDataResponse(BaseModel):
    id: str
    file_name: str
    raw_text: Optional[str] = None
    parsed_data: Dict[str, Any]
    created_at: datetime

class ResumeTailorRequest(BaseModel):
    job_id: str
    target_role: Optional[str] = None
    custom_job_description: Optional[str] = None

class ResumeTailorResponse(BaseModel):
    version_id: str
    job_id: str
    original_bullets: List[str]
    tailored_bullets: List[str]
    alignment_summary: str
    truthfulness_guarantee: str = "100% grounded in your actual uploaded experience. No hallucinated skills or roles."

class CoverLetterGenerateRequest(BaseModel):
    job_id: str
    tone: Optional[str] = "enthusiastic and professional"
    highlight_skills: Optional[List[str]] = None

class CoverLetterGenerateResponse(BaseModel):
    job_id: str
    company: str
    role_title: str
    cover_letter: str

# Job Schemas
class JobMatchSchema(BaseModel):
    overall_score: int
    skills_score: int
    experience_score: int
    matched_skills: List[str]
    missing_skills: List[str]
    match_reasons: List[str]
    concerns: List[str]
    interview_topics: List[str]

class JobSchema(BaseModel):
    id: str
    title: str
    company: str
    company_logo: Optional[str] = None
    location: str
    work_mode: str
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_currency: str = "USD"
    experience_level: str
    job_type: str
    description: str
    requirements: List[str]
    nice_to_have: List[str]
    skills: List[str]
    source_code: str
    source_url: str
    posted_at: datetime
    is_saved: bool = False
    is_dismissed: bool = False
    match: Optional[JobMatchSchema] = None

class JobSearchRequest(BaseModel):
    query: Optional[str] = None
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    remote_only: Optional[bool] = False
    min_salary: Optional[int] = None
    experience_level: Optional[str] = None
    skills: Optional[List[str]] = None
    job_type: Optional[str] = None
    sources: Optional[List[str]] = None
    min_match_score: Optional[int] = None
    page: int = 1
    page_size: int = 20
    sort_by: Optional[str] = "match_score"  # match_score, posted_at, salary

class JobSearchResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[JobSchema]

# Application Tracking Schemas
class ApplicationCreate(BaseModel):
    job_id: Optional[str] = None
    company: str
    role_title: str
    source_url: Optional[str] = None
    stage: str = "Saved"  # Saved, Shortlisted, Applied, Assessment, Interview, Offer, Rejected, Withdrawn
    applied_at: Optional[datetime] = None
    salary_offered: Optional[str] = None
    recruiter_name: Optional[str] = None
    recruiter_email: Optional[str] = None
    interview_date: Optional[datetime] = None
    follow_up_date: Optional[datetime] = None
    notes: Optional[str] = None

class ApplicationUpdate(BaseModel):
    stage: Optional[str] = None
    applied_at: Optional[datetime] = None
    salary_offered: Optional[str] = None
    recruiter_name: Optional[str] = None
    recruiter_email: Optional[str] = None
    interview_date: Optional[datetime] = None
    follow_up_date: Optional[datetime] = None
    notes: Optional[str] = None
    cover_letter: Optional[str] = None

class ApplicationEventSchema(BaseModel):
    id: str
    from_stage: Optional[str] = None
    to_stage: str
    note: Optional[str] = None
    created_at: datetime

class ApplicationResponse(BaseModel):
    id: str
    user_id: str
    job_id: Optional[str] = None
    company: str
    role_title: str
    source_url: Optional[str] = None
    stage: str
    applied_at: Optional[datetime] = None
    salary_offered: Optional[str] = None
    recruiter_name: Optional[str] = None
    recruiter_email: Optional[str] = None
    interview_date: Optional[datetime] = None
    follow_up_date: Optional[datetime] = None
    notes: Optional[str] = None
    cover_letter: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    events: List[ApplicationEventSchema] = []

class FollowUpRequest(BaseModel):
    reminder_date: datetime
    message: str

# Automation Schemas
class AutomationConfig(BaseModel):
    name: str = "Daily AI Job Scout"
    is_active: bool = True
    frequency: str = "daily"
    keywords: List[str] = ["Staff Engineer", "Senior AI Engineer", "Full Stack"]
    locations: List[str] = ["Remote", "San Francisco, CA"]
    min_match_score: int = 75
    enabled_sources: List[str] = ["linkedin", "indeed", "greenhouse", "lever", "wellfound"]
    email_notifications: bool = True
    max_jobs_per_run: int = 25

class AutomationResponse(BaseModel):
    id: str
    name: str
    is_active: bool
    frequency: str
    keywords: List[str]
    locations: List[str]
    min_match_score: int
    enabled_sources: List[str]
    email_notifications: bool
    max_jobs_per_run: int
    last_run_at: Optional[datetime] = None
    next_run_at: Optional[datetime] = None

class AutomationRunResponse(BaseModel):
    id: str
    automation_id: str
    status: str
    jobs_found: int
    jobs_matched: int
    errors: List[str]
    started_at: datetime
    completed_at: Optional[datetime] = None

# AI Agent Chat & Run Schemas
class AgentChatRequest(BaseModel):
    message: str
    context_job_id: Optional[str] = None
    history: Optional[List[Dict[str, str]]] = None

class AgentToolCall(BaseModel):
    tool_name: str
    parameters: Dict[str, Any]
    result: Any

class AgentChatResponse(BaseModel):
    response: str
    tool_calls: List[AgentToolCall] = []
    suggested_actions: List[str] = []

class AgentWorkflowRunRequest(BaseModel):
    user_id: Optional[str] = None
    sync_sources: Optional[List[str]] = None
    recalculate_matches: bool = True

class AgentWorkflowRunResponse(BaseModel):
    run_id: str
    status: str
    steps_executed: List[str]
    jobs_discovered: int
    jobs_matched: int
    summary: str

# Analytics Overview Schema
class PipelineCount(BaseModel):
    stage: str
    count: int

class TrendPoint(BaseModel):
    date: str
    jobs_discovered: int
    matches: int
    applied: int

class AnalyticsOverview(BaseModel):
    total_jobs_discovered: int
    new_jobs_today: int
    strong_matches: int
    applications_submitted: int
    interviews_scheduled: int
    responses_received: int
    applications_needing_followup: int
    pipeline: List[PipelineCount]
    discovery_trends: List[TrendPoint]
    match_distribution: Dict[str, int]  # "90-100%": 12, "80-89%": 25, etc.
    top_matched_skills: List[Dict[str, Any]]
