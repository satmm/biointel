from fastapi import APIRouter
from app.api.routes import identification, species, intelligence, papers

api_router = APIRouter()

api_router.include_router(identification.router)
api_router.include_router(species.router)
api_router.include_router(intelligence.router)
api_router.include_router(papers.router)
