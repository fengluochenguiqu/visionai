"""VisionAI 配置模块，使用 pydantic-settings 管理配置"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """应用配置，从 .env 文件加载"""

    # OpenAI 配置
    OPENAI_API_KEY: str = ""
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"

    # 智谱 AI 配置
    ZHIPU_API_KEY: str = ""

    # 数据库配置
    DATABASE_URL: str = "sqlite+aiosqlite:///./visionai.db"

    # 上传配置
    UPLOAD_DIR: str = "./uploads"
    MAX_IMAGE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/gif", "image/webp"]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


settings = Settings()
