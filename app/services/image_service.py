"""图片处理服务"""

import os
import hashlib
import base64
from typing import Optional

from fastapi import UploadFile

from app.config import settings


def _ensure_upload_dir():
    """确保上传目录存在"""
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


def validate_image(file: UploadFile) -> None:
    """
    验证上传的图片格式和大小

    Args:
        file: 上传的文件对象

    Raises:
        ValueError: 图片格式不支持或大小超限
    """
    # 验证文件类型
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise ValueError(
            f"不支持的图片格式: {file.content_type}，"
            f"支持的格式: {', '.join(settings.ALLOWED_IMAGE_TYPES)}"
        )


async def validate_image_size(file: UploadFile) -> None:
    """
    验证图片大小

    Args:
        file: 上传的文件对象

    Raises:
        ValueError: 图片大小超限
    """
    content = await file.read()
    if len(content) > settings.MAX_IMAGE_SIZE:
        max_size_mb = settings.MAX_IMAGE_SIZE / (1024 * 1024)
        raise ValueError(f"图片大小超过限制: 最大 {max_size_mb}MB")
    # 重置文件指针，以便后续读取
    await file.seek(0)


async def save_upload_image(file: UploadFile) -> tuple[str, str]:
    """
    保存上传的图片到 uploads 目录

    Args:
        file: 上传的文件对象

    Returns:
        (image_url, image_hash) 图片 URL 和文件哈希值
    """
    _ensure_upload_dir()

    content = await file.read()

    # 计算文件哈希
    image_hash = hashlib.sha256(content).hexdigest()

    # 根据内容类型确定扩展名
    ext_map = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/gif": ".gif",
        "image/webp": ".webp",
    }
    ext = ext_map.get(file.content_type, ".jpg")

    # 使用哈希值作为文件名，避免重复存储
    filename = f"{image_hash}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)

    # 如果文件已存在则不重复写入
    if not os.path.exists(filepath):
        with open(filepath, "wb") as f:
            f.write(content)

    image_url = f"/uploads/{filename}"
    return image_url, image_hash


def get_image_base64(image_url: str) -> str:
    """
    读取图片并转为 base64 编码

    Args:
        image_url: 图片 URL 路径，如 /uploads/xxx.jpg

    Returns:
        base64 编码的图片字符串

    Raises:
        FileNotFoundError: 图片文件不存在
    """
    # 从 URL 中提取文件名
    filename = image_url.lstrip("/uploads/")
    filepath = os.path.join(settings.UPLOAD_DIR, filename)

    if not os.path.exists(filepath):
        raise FileNotFoundError(f"图片文件不存在: {filepath}")

    with open(filepath, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def delete_image(image_url: str) -> bool:
    """
    删除图片文件

    Args:
        image_url: 图片 URL 路径

    Returns:
        是否删除成功
    """
    filename = image_url.lstrip("/uploads/")
    filepath = os.path.join(settings.UPLOAD_DIR, filename)

    if os.path.exists(filepath):
        os.remove(filepath)
        return True
    return False
