from typing import Dict, Any
from app.agents.state import AgentWorkflowState
from app.agents.nodes import (
    search_planner_node,
    job_discovery_node,
    job_deduplication_node,
    resume_parsing_node,
    job_matching_node,
    finalize_workflow_node
)

try:
    from langgraph.graph import StateGraph, END
    HAS_LANGGRAPH = True
except ImportError:
    HAS_LANGGRAPH = False

def create_agent_workflow():
    """
    Constructs the stateful LangGraph multi-agent pipeline:
    Search Planner -> Discovery -> Deduplication -> Resume Parsing -> Matching -> Finalize
    """
    if not HAS_LANGGRAPH:
        return None

    workflow = StateGraph(AgentWorkflowState)

    # Add Nodes
    workflow.add_node("search_planner", search_planner_node)
    workflow.add_node("job_discovery", job_discovery_node)
    workflow.add_node("job_deduplication", job_deduplication_node)
    workflow.add_node("resume_parsing", resume_parsing_node)
    workflow.add_node("job_matching", job_matching_node)
    workflow.add_node("finalize", finalize_workflow_node)

    # Set Entry Point
    workflow.set_entry_point("search_planner")

    # Add Linear & Conditional Edges
    workflow.add_edge("search_planner", "job_discovery")
    workflow.add_edge("job_discovery", "job_deduplication")
    workflow.add_edge("job_deduplication", "resume_parsing")
    workflow.add_edge("resume_parsing", "job_matching")
    workflow.add_edge("job_matching", "finalize")
    workflow.add_edge("finalize", END)

    return workflow.compile()

# Instantiated compiled graph
compiled_workflow = create_agent_workflow()

async def run_job_hunter_workflow(initial_state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Executes the job hunter workflow, either via compiled LangGraph or direct step sequencing.
    """
    state: AgentWorkflowState = {
        "user_id": initial_state.get("user_id", "demo-user-1"),
        "target_roles": initial_state.get("target_roles", ["Senior Full Stack Engineer"]),
        "preferred_locations": initial_state.get("preferred_locations", ["Remote"]),
        "remote_preference": initial_state.get("remote_preference", "remote"),
        "skills": initial_state.get("skills", ["TypeScript", "Python", "FastAPI", "React"]),
        "experience_level": initial_state.get("experience_level", "Senior"),
        "min_salary": initial_state.get("min_salary", 130000),
        "salary_currency": initial_state.get("salary_currency", "USD"),
        "enabled_sources": initial_state.get("enabled_sources", ["greenhouse", "lever", "wellfound"]),
        "planned_queries": [],
        "raw_discovered_jobs": [],
        "deduped_jobs": [],
        "resume_text": initial_state.get("resume_text", ""),
        "parsed_resume": initial_state.get("parsed_resume", {}),
        "matched_jobs": [],
        "errors": [],
        "execution_steps": [],
        "is_completed": False
    }

    if compiled_workflow is not None:
        try:
            result = await compiled_workflow.ainvoke(state)
            return result
        except Exception as e:
            state["errors"].append(f"LangGraph execution exception, falling back to direct pipeline: {str(e)}")

    # Direct fallback sequencing guaranteeing execution without dependencies
    res_a = await search_planner_node(state)
    state.update(res_a)

    res_b = await job_discovery_node(state)
    state["raw_discovered_jobs"] = res_b["raw_discovered_jobs"]
    state["execution_steps"].extend(res_b["execution_steps"])
    if res_b.get("errors"):
        state["errors"].extend(res_b["errors"])

    res_c = await job_deduplication_node(state)
    state["deduped_jobs"] = res_c["deduped_jobs"]
    state["execution_steps"].extend(res_c["execution_steps"])

    res_d = await resume_parsing_node(state)
    state["parsed_resume"] = res_d["parsed_resume"]
    state["execution_steps"].extend(res_d["execution_steps"])

    res_e = await job_matching_node(state)
    state["matched_jobs"] = res_e["matched_jobs"]
    state["execution_steps"].extend(res_e["execution_steps"])

    res_f = await finalize_workflow_node(state)
    state["is_completed"] = res_f["is_completed"]
    state["execution_steps"].extend(res_f["execution_steps"])

    return state
