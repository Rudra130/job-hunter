import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Boolean, Integer, Float, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    preference = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="user", cascade="all, delete-orphan")
    saved_jobs = relationship("SavedJob", back_populates="user", cascade="all, delete-orphan")
    automations = relationship("Automation", back_populates="user", cascade="all, delete-orphan")
    reminders = relationship("FollowUpReminder", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    target_roles = Column(JSON, default=list)  # ["Senior Full Stack Engineer", "Staff AI Engineer"]
    preferred_locations = Column(JSON, default=list)  # ["San Francisco, CA", "Bengaluru, India", "Remote"]
    remote_preference = Column(String(50), default="remote")  # "remote", "hybrid", "onsite", "any"
    min_salary = Column(Integer, default=120000)
    salary_currency = Column(String(10), default="USD")
    experience_level = Column(String(50), default="Senior")  # Entry, Mid, Senior, Lead, Executive
    skills = Column(JSON, default=list)  # ["Python", "FastAPI", "React", "Next.js", "LangChain"]
    preferred_companies = Column(JSON, default=list)
    employment_type = Column(String(50), default="full-time")  # full-time, contract, part-time
    notice_period = Column(String(50), default="Immediately")
    search_frequency = Column(String(50), default="daily")  # manual, daily, weekly
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="preference")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), default="application/pdf")
    file_size = Column(Integer, default=0)
    raw_text = Column(Text, nullable=True)
    parsed_data = Column(JSON, default=dict)  # structured: summary, skills, experience, education, projects
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="resumes")
    versions = relationship("ResumeVersion", back_populates="resume", cascade="all, delete-orphan")

class ResumeVersion(Base):
    __tablename__ = "resume_versions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    resume_id = Column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    version_name = Column(String(255), nullable=False)
    target_role = Column(String(255), nullable=True)
    tailored_bullets = Column(JSON, default=list)
    summary = Column(Text, nullable=True)
    cover_letter = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    resume = relationship("Resume", back_populates="versions")

class JobSource(Base):
    __tablename__ = "job_sources"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False)  # LinkedIn, Indeed, Naukri, Greenhouse, Lever, etc.
    code = Column(String(50), unique=True, nullable=False)
    adapter_type = Column(String(50), nullable=False)  # api, feed, board, scraper_sandbox
    is_enabled = Column(Boolean, default=True)
    auth_status = Column(String(50), default="configured")  # configured, requires_key, public_feed
    base_url = Column(String(255), nullable=True)
    config_schema = Column(JSON, default=dict)

    jobs = relationship("Job", back_populates="source_rel")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    source_id = Column(String(36), ForeignKey("job_sources.id"), nullable=True)
    source_code = Column(String(50), default="direct", index=True)
    external_id = Column(String(255), nullable=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    company = Column(String(255), nullable=False, index=True)
    company_logo = Column(String(512), nullable=True)
    location = Column(String(255), nullable=False)
    work_mode = Column(String(50), default="remote")  # remote, hybrid, onsite
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    salary_currency = Column(String(10), default="USD")
    experience_level = Column(String(50), default="Mid")
    job_type = Column(String(50), default="full-time")
    description = Column(Text, nullable=False)
    requirements = Column(JSON, default=list)
    nice_to_have = Column(JSON, default=list)
    skills = Column(JSON, default=list)
    source_url = Column(String(1024), nullable=False)
    posted_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    source_rel = relationship("JobSource", back_populates="jobs")
    matches = relationship("JobMatch", back_populates="job", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="job")

class JobMatch(Base):
    __tablename__ = "job_matches"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(String(36), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    overall_score = Column(Integer, default=0)  # 0 to 100
    skills_score = Column(Integer, default=0)
    experience_score = Column(Integer, default=0)
    matched_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    match_reasons = Column(JSON, default=list)
    concerns = Column(JSON, default=list)
    interview_topics = Column(JSON, default=list)
    calculated_at = Column(DateTime, default=datetime.utcnow)

    job = relationship("Job", back_populates="matches")

class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(String(36), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="saved")  # saved, dismissed
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="saved_jobs")
    job = relationship("Job")

class Application(Base):
    __tablename__ = "applications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(String(36), ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True)
    company = Column(String(255), nullable=False)
    role_title = Column(String(255), nullable=False)
    source_url = Column(String(1024), nullable=True)
    stage = Column(String(50), default="Saved", index=True)  # Saved, Shortlisted, Applied, Assessment, Interview, Offer, Rejected, Withdrawn
    applied_at = Column(DateTime, nullable=True)
    salary_offered = Column(String(100), nullable=True)
    recruiter_name = Column(String(255), nullable=True)
    recruiter_email = Column(String(255), nullable=True)
    interview_date = Column(DateTime, nullable=True)
    follow_up_date = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    cover_letter = Column(Text, nullable=True)
    custom_resume_version_id = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="applications")
    job = relationship("Job", back_populates="applications")
    events = relationship("ApplicationEvent", back_populates="application", cascade="all, delete-orphan", order_by="desc(ApplicationEvent.created_at)")
    reminders = relationship("FollowUpReminder", back_populates="application", cascade="all, delete-orphan")

class ApplicationEvent(Base):
    __tablename__ = "application_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    from_stage = Column(String(50), nullable=True)
    to_stage = Column(String(50), nullable=False)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="events")

class Automation(Base):
    __tablename__ = "automations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), default="Daily AI Job Scout")
    is_active = Column(Boolean, default=True)
    frequency = Column(String(50), default="daily")  # manual, daily, weekly
    keywords = Column(JSON, default=list)
    locations = Column(JSON, default=list)
    min_match_score = Column(Integer, default=75)
    enabled_sources = Column(JSON, default=lambda: ["linkedin", "indeed", "greenhouse", "lever", "wellfound"])
    email_notifications = Column(Boolean, default=True)
    max_jobs_per_run = Column(Integer, default=25)
    last_run_at = Column(DateTime, nullable=True)
    next_run_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="automations")
    runs = relationship("AutomationRun", back_populates="automation", cascade="all, delete-orphan")

class AutomationRun(Base):
    __tablename__ = "automation_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    automation_id = Column(String(36), ForeignKey("automations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="completed")  # running, completed, failed
    jobs_found = Column(Integer, default=0)
    jobs_matched = Column(Integer, default=0)
    errors = Column(JSON, default=list)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    automation = relationship("Automation", back_populates="runs")

class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), nullable=False, index=True)
    agent_name = Column(String(100), nullable=False)  # SearchPlanner, Discovery, Matching, Prep, Assistant
    trace_id = Column(String(100), nullable=True)
    input_payload = Column(JSON, default=dict)
    output_payload = Column(JSON, default=dict)
    status = Column(String(50), default="success")
    created_at = Column(DateTime, default=datetime.utcnow)

class FollowUpReminder(Base):
    __tablename__ = "follow_up_reminders"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    application_id = Column(String(36), ForeignKey("applications.id", ondelete="CASCADE"), nullable=True)
    reminder_date = Column(DateTime, nullable=False)
    message = Column(Text, nullable=False)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reminders")
    application = relationship("Application", back_populates="reminders")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="job_match")  # job_match, application_update, reminder, system
    is_read = Column(Boolean, default=False)
    link = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
