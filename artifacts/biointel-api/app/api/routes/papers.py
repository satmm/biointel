"""
Research papers route — fetches real, citable papers from CrossRef API.
Never halluminates papers. Only returns verifiable DOI-linked publications.
"""

import httpx
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/species", tags=["Research Papers"])

CROSSREF_URL = "https://api.crossref.org/works"
USER_AGENT = "BioIntel/1.0 (https://biointel.app; mailto:research@biointel.app)"


class ResearchPaper(BaseModel):
    title: str
    authors: list[str]
    journal: Optional[str] = None
    year: Optional[int] = None
    doi: str
    url: str
    abstract_snippet: Optional[str] = None


def _extract_year(published: dict) -> Optional[int]:
    try:
        parts = published.get("date-parts", [[]])[0]
        return int(parts[0]) if parts else None
    except Exception:
        return None


def _format_authors(authors: list) -> list[str]:
    result = []
    for a in authors[:6]:  # cap at 6 authors
        given = a.get("given", "")
        family = a.get("family", "")
        name = f"{given} {family}".strip()
        if name:
            result.append(name)
    if len(authors) > 6:
        result.append("et al.")
    return result


@router.get(
    "/{species_id}/papers",
    response_model=list[ResearchPaper],
    summary="Fetch real research papers for a species from CrossRef",
    description=(
        "Queries CrossRef for peer-reviewed journal articles about the species. "
        "Returns DOI links so users can navigate to the actual paper. "
        "Never generates fake papers."
    ),
)
async def get_research_papers(species_id: str, scientific_name: str = "", limit: int = 8):
    """
    scientific_name is passed as a query param because it's more precise than the slug.
    Falls back to the slug as a search term if scientific_name is not provided.
    """
    query = scientific_name.strip() if scientific_name else species_id.replace("-", " ")
    limit = min(limit, 12)

    logger.info(
        "Fetching research papers from CrossRef",
        species_id=species_id,
        query=query,
        limit=limit,
    )

    params = {
        "query.bibliographic": query,
        "rows": limit,
        "sort": "relevance",
        "select": "title,author,published,DOI,URL,container-title,abstract",
        "filter": "type:journal-article",
    }

    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.get(
                CROSSREF_URL,
                params=params,
                headers={"User-Agent": USER_AGENT},
            )
            resp.raise_for_status()
            data = resp.json()
    except httpx.TimeoutException:
        logger.warning("CrossRef request timed out", query=query)
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Research paper search timed out. Try again shortly.",
        )
    except httpx.HTTPError as exc:
        logger.error("CrossRef request failed", error=str(exc), query=query)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not reach paper database.",
        )

    items = data.get("message", {}).get("items", [])
    papers: list[ResearchPaper] = []

    for item in items:
        title_list = item.get("title", [])
        if not title_list:
            continue

        doi = item.get("DOI", "")
        if not doi:
            continue

        url = item.get("URL") or f"https://doi.org/{doi}"
        journal_list = item.get("container-title", [])
        journal = journal_list[0] if journal_list else None
        published = item.get("published", {}) or item.get("published-print", {}) or {}
        year = _extract_year(published)
        authors = _format_authors(item.get("author", []))

        # Optional abstract snippet (CrossRef sometimes includes it)
        abstract = item.get("abstract", "")
        snippet: Optional[str] = None
        if abstract:
            # Strip JATS XML tags if present
            import re
            clean = re.sub(r"<[^>]+>", "", abstract).strip()
            snippet = clean[:220] + "..." if len(clean) > 220 else clean or None

        papers.append(ResearchPaper(
            title=title_list[0],
            authors=authors,
            journal=journal,
            year=year,
            doi=doi,
            url=url,
            abstract_snippet=snippet,
        ))

    logger.info("Research papers fetched", count=len(papers), query=query)
    return papers
