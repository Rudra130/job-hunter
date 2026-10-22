from typing import List, Dict, Any, Optional, Annotated
import operator
from typing_extensions import TypedDict

class AgentWorkflowState(TypedDict):
    """
    Comprehensive state passed across the LangGraph multi-agent pipeline.
    """
    user_id: str
    target_roles: List[str]
    preferred_locations: List[str]
    remote_preference: str
    skills: List[str]
    experience_level: str
    min_salary: int
    salary_currency: str
    enabled_sources: List[str]

    # Search planner output
    planned_queries: List[Dict[str, Any]]

    # Discovery output
    raw_discovered_jobs: Annotated[List[Dict[str, Any]], operator.add]

    # Deduplication output
    deduped_jobs: List[Dict[str, Any]]

    # Resume data
    resume_text: str
    parsed_resume: Dict[str, Any]

    # Matching & Ranking output
    matched_jobs: List[Dict[str, Any]]

    # Errors & execution trace
    errors: Annotated[List[str], operator.add]
    execution_steps: Annotated[List[str], operator.add]
    is_completed: bool
