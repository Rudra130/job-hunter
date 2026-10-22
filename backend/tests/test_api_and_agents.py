import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.agents.nodes import job_matching_node, job_deduplication_node
from app.providers.adapters import GreenhouseAdapter, LeverAdapter

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "JobPilot AI Backend"

def test_get_profile():
    response = client.get("/api/v1/profile")
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "alex.morgan@example.com"
    assert "target_roles" in data["preference"]

def test_list_jobs():
    response = client.get("/api/v1/jobs")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) > 0
    first_job = data["items"][0]
    assert "title" in first_job
    assert "match" in first_job
    assert first_job["match"]["overall_score"] >= 0

def test_job_search_filter():
    response = client.post("/api/v1/jobs/search", json={"query": "Stripe", "remote_only": True})
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert "stripe" in item["company"].lower() or "stripe" in item["title"].lower()

def test_application_lifecycle():
    # Fetch initial
    res_initial = client.get("/api/v1/applications")
    assert res_initial.status_code == 200
    apps = res_initial.json()
    assert len(apps) > 0

    # Create new application
    new_app_payload = {
        "company": "Vercel",
        "role_title": "Staff AI Engineer",
        "stage": "Saved",
        "notes": "Bookmarked for review"
    }
    res_create = client.post("/api/v1/applications", json=new_app_payload)
    assert res_create.status_code == 200
    created = res_create.json()
    assert created["company"] == "Vercel"
    assert created["stage"] == "Saved"

    # Update stage to Applied
    app_id = created["id"]
    res_update = client.patch(f"/api/v1/applications/{app_id}", json={"stage": "Applied", "notes": "Application sent"})
    assert res_update.status_code == 200
    updated = res_update.json()
    assert updated["stage"] == "Applied"
    assert len(updated["events"]) >= 1

def test_analytics_overview():
    response = client.get("/api/v1/analytics/overview")
    assert response.status_code == 200
    data = response.json()
    assert "total_jobs_discovered" in data
    assert "pipeline" in data
    assert "discovery_trends" in data

def test_job_deduplication():
    import asyncio
    async def _run():
        duplicate_jobs = [
            {"title": "Staff AI Engineer", "company": "Stripe", "source_code": "greenhouse"},
            {"title": "Staff AI Engineer", "company": "Stripe", "source_code": "lever"},
            {"title": "Senior Frontend Engineer", "company": "Figma", "source_code": "greenhouse"}
        ]
        state = {"raw_discovered_jobs": duplicate_jobs}
        result = await job_deduplication_node(state)
        assert len(result["deduped_jobs"]) == 2  # duplicate Stripe job removed
    asyncio.run(_run())

def test_job_matching_logic():
    import asyncio
    async def _run():
        state = {
            "deduped_jobs": [
                {
                    "title": "Senior Full Stack Engineer",
                    "company": "TestCorp",
                    "skills": ["Python", "FastAPI", "React", "Next.js"],
                    "work_mode": "remote",
                    "salary_min": 170000
                }
            ],
            "target_roles": ["Senior Full Stack Engineer"],
            "parsed_resume": {"skills": ["Python", "FastAPI", "React", "Next.js", "PostgreSQL"]},
            "remote_preference": "remote",
            "min_salary": 150000
        }
        result = await job_matching_node(state)
        matched = result["matched_jobs"][0]
        assert matched["match"]["overall_score"] > 80
        assert "Python" in matched["match"]["matched_skills"]
        assert len(matched["match"]["match_reasons"]) > 0
    asyncio.run(_run())
