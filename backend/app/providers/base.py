from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime

class NormalizedJob(dict):
    """
    Standard normalized job representation across all providers.
    """
    def __init__(
        self,
        external_id: str,
        source_code: str,
        title: str,
        company: str,
        company_logo: Optional[str],
        location: str,
        work_mode: str,
        salary_min: Optional[int],
        salary_max: Optional[int],
        salary_currency: str,
        experience_level: str,
        job_type: str,
        description: str,
        requirements: List[str],
        nice_to_have: List[str],
        skills: List[str],
        source_url: str,
        posted_at: datetime
    ):
        super().__init__(
            external_id=external_id,
            source_code=source_code,
            title=title,
            company=company,
            company_logo=company_logo,
            location=location,
            work_mode=work_mode,
            salary_min=salary_min,
            salary_max=salary_max,
            salary_currency=salary_currency,
            experience_level=experience_level,
            job_type=job_type,
            description=description,
            requirements=requirements,
            nice_to_have=nice_to_have,
            skills=skills,
            source_url=source_url,
            posted_at=posted_at
        )

class BaseJobProvider(ABC):
    """
    Abstract Base Class for all Job Source Providers.
    Ensures ethical access, strict schema normalization, and error isolation.
    """
    source_code: str
    source_name: str
    auth_status: str  # 'configured', 'requires_key', 'public_feed'

    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        self.api_key = api_key
        self.base_url = base_url

    @abstractmethod
    async def search_jobs(
        self,
        query: str,
        location: Optional[str] = None,
        remote_only: bool = False,
        limit: int = 10
    ) -> List[NormalizedJob]:
        """Fetch and normalize jobs for this source."""
        pass

    @abstractmethod
    def is_configured(self) -> bool:
        """Return True if legitimate credentials or public feed is available."""
        pass
