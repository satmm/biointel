import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    session_secret: str = ""
    groq_api_key: str = ""
    huggingface_token: str = ""
    supabase_url: str = ""
    supabase_key: str = ""
    database_url: str = ""
    base_path: str = "/backend"

    bioclip_model: str = "imageomics/bioclip"
    inaturalist_model: str = "google/vit-large-patch16-224"
    embedding_model: str = "BAAI/bge-small-en-v1.5"
    groq_model: str = "llama-3.3-70b-versatile"

    hf_inference_url: str = "https://api-inference.huggingface.co/models"
    max_image_size_mb: int = 10
    max_image_pixels: int = 4096

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
