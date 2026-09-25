import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "PRAHARI Reasoning Server"
    VERSION: str = "1.0.0"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    
    # Model Backend: 'gemini' (default) | 'openai' | 'ollama' | 'mock'
    MODEL_BACKEND: str = os.getenv("MODEL_BACKEND", "gemini")
    MODEL_NAME: str = os.getenv("MODEL_NAME", "gemini-2.0-flash")
    
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

settings = Settings()
