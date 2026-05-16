import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logging import configure_logging, get_logger
from app.database.connection import setup_database, close_pool
from app.api.router import api_router
from app.schemas.species import HealthResponse

configure_logging()
logger = get_logger(__name__)

BASE_PATH = os.environ.get("BASE_PATH", settings.base_path).rstrip("/")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("BioIntel API starting", base_path=BASE_PATH)
    await setup_database()

    services: dict[str, str] = {}
    services["groq"] = "connected" if settings.groq_api_key else "no key"
    services["huggingface"] = "connected" if settings.huggingface_token else "no key"
    services["database"] = "connected" if settings.database_url else "no url"
    services["supabase"] = "connected" if settings.supabase_url else "no url"
    logger.info("Service status", **services)

    yield

    await close_pool()
    logger.info("BioIntel API shutdown complete")


app = FastAPI(
    title="BioIntel API",
    description=(
        "AI-powered Species Intelligence & Research Platform. "
        "Identify species from images using BioCLIP + iNaturalist Vision, "
        "generate research-grade intelligence with Groq Llama 3.3 70B, "
        "and explore ecosystem relationships."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url=f"{BASE_PATH}/docs",
    redoc_url=f"{BASE_PATH}/redoc",
    openapi_url=f"{BASE_PATH}/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception", path=request.url.path, error=str(exc), exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "type": type(exc).__name__},
    )


@app.get(f"{BASE_PATH}/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    return HealthResponse(
        status="ok",
        version="1.0.0",
        services={
            "groq": "configured" if settings.groq_api_key else "missing_key",
            "huggingface": "configured" if settings.huggingface_token else "missing_key",
            "database": "configured" if settings.database_url else "not_configured",
            "supabase": "configured" if settings.supabase_url else "not_configured",
            "bioclip": "ready",
            "embeddings": "ready",
        },
    )


@app.get(f"{BASE_PATH}/", tags=["Root"])
async def root():
    return {
        "name": "BioIntel API",
        "version": "1.0.0",
        "docs": f"{BASE_PATH}/docs",
        "endpoints": {
            "identify_upload": f"POST {BASE_PATH}/api/identify/upload",
            "search_species": f"GET {BASE_PATH}/api/identify/search?q=tiger",
            "get_species": f"GET {BASE_PATH}/api/species/{{id}}",
            "ecosystem_graph": f"GET {BASE_PATH}/api/species/{{id}}/ecosystem",
            "population_trend": f"GET {BASE_PATH}/api/species/{{id}}/population",
            "generate_intelligence": f"POST {BASE_PATH}/api/intelligence/generate",
            "generate_embedding": f"POST {BASE_PATH}/api/intelligence/embed",
            "vector_search": f"GET {BASE_PATH}/api/intelligence/similar?q={{query}}",
        },
    }


app.include_router(api_router, prefix=f"{BASE_PATH}/api")
