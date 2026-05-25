"""VisionAI 智能图像识别平台 - FastAPI 应用入口"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.models.database import init_db, close_db
from app.routers import analyze, history
import os


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时初始化数据库
    await init_db()
    # 确保上传目录存在
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield
    # 关闭时清理数据库连接
    await close_db()


# 创建 FastAPI 应用
app = FastAPI(
    title="VisionAI 智能图像识别平台",
    description="基于 AI 大模型的智能图像识别与分析平台",
    version="1.0.0",
    lifespan=lifespan,
)

# 配置 CORS（开发阶段允许所有源）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载静态文件目录（用于访问上传的图片）
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# 注册路由
app.include_router(analyze.router)
app.include_router(history.router)


@app.get("/api/health")
async def health_check():
    """健康检查端点"""
    return {"status": "ok", "service": "VisionAI"}
