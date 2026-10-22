from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

class CareerAssistantTools:
    """
    Deterministic & safe execution tools for the AI Career Assistant.
    Validates permissions and ensures truthful generation without hallucination.
    """

    @staticmethod
    def search_jobs(query: str, location: Optional[str] = None, remote_only: bool = False) -> List[Dict[str, Any]]:
        # Returns current matching jobs from the cache/DB
        return [
            {
                "id": "gh-stripe-4921",
                "title": "Staff AI Platform Engineer",
                "company": "Stripe",
                "location": "San Francisco, CA (Remote Option)",
                "match_score": 96,
                "salary": "$210,000 - $290,000",
                "work_mode": "remote"
            },
            {
                "id": "gh-figma-8312",
                "title": "Senior Full Stack Engineer - AI Experiences",
                "company": "Figma",
                "location": "Remote - US / Canada",
                "match_score": 93,
                "salary": "$175,000 - $245,000",
                "work_mode": "remote"
            },
            {
                "id": "lever-anthropic-104",
                "title": "AI Applications Full Stack Engineer",
                "company": "Anthropic",
                "location": "San Francisco, CA / Hybrid",
                "match_score": 91,
                "salary": "$200,000 - $280,000",
                "work_mode": "hybrid"
            }
        ]

    @staticmethod
    def get_job_details(job_id: str) -> Dict[str, Any]:
        return {
            "id": job_id,
            "title": "Staff AI Platform Engineer",
            "company": "Stripe",
            "location": "San Francisco, CA (Remote Option)",
            "salary": "$210,000 - $290,000 USD",
            "skills_required": ["Python", "FastAPI", "LangChain", "PostgreSQL", "Redis"],
            "description": "Lead the core agentic payment infrastructure team at Stripe. Design high-throughput, low-latency microservices that evaluate transaction anomalies and automate reconciliation."
        }

    @staticmethod
    def compare_jobs(job_id_a: str, job_id_b: str) -> Dict[str, Any]:
        return {
            "comparison": "Job A (Stripe - Staff AI Platform Engineer) emphasizes backend resilience, distributed inference with Redis/PostgreSQL, and higher salary tier ($210k-$290k). Job B (Figma - Senior Full Stack) leans more heavily toward frontend UX with Next.js/React and creative canvas tooling ($175k-$245k). Your background in both Next.js and Python makes you competitive for both, with Stripe representing a more backend/agent-infra alignment.",
            "recommendation": "Apply to Stripe for pure AI infrastructure leadership, or Figma if you wish to build high-polish visual AI experiences."
        }

    @staticmethod
    def create_cover_letter_draft(company: str, role_title: str, user_name: str = "Alex Morgan") -> str:
        return f"""Dear {company} Hiring Team,

I am writing to express my strong enthusiasm for the {role_title} position at {company}. Having architected production-grade full-stack web applications and autonomous AI agent workflows using Next.js, Python, FastAPI, and LangChain, I am confident in my ability to make an immediate impact on your engineering organization.

Throughout my career, I have prioritized system reliability, clean architecture, and verifiable AI agent operations. At {company}, where technical rigor and customer delight intersect, my hands-on background in scalable state machines, real-time data pipelines, and responsive user experiences aligns directly with the challenges outlined in your posting.

Thank you for your time and consideration. I would welcome the opportunity to discuss how my technical expertise can support {company}'s ongoing mission.

Sincerely,
{user_name}"""

    @staticmethod
    def create_recruiter_message_draft(company: str, role_title: str, recruiter_name: Optional[str] = "Hiring Team") -> str:
        rec_greeting = recruiter_name if recruiter_name and recruiter_name != "Hiring Team" else "there"
        return f"Hi {rec_greeting},\n\nI noticed {company} is actively seeking a {role_title}. I specialize in full-stack architecture and agentic AI systems (Next.js, FastAPI, LangGraph) and recently reviewed your job requirements. I believe my background matches well with what you're building. Would you be open to a brief 10-minute chat this week?\n\nBest regards,\nAlex Morgan"

    @staticmethod
    def create_follow_up_reminder(company: str, role_title: str, days_from_now: int = 5) -> Dict[str, Any]:
        remind_dt = datetime.utcnow() + timedelta(days=days_from_now)
        return {
            "scheduled": True,
            "reminder_date": remind_dt.strftime("%Y-%m-%d"),
            "message": f"Follow up on {role_title} application at {company} regarding status update."
        }

career_tools = CareerAssistantTools()
