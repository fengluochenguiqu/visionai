"""图像分析路由"""

import json
from typing import Optional

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse

from app.schemas.analyze import AnalyzeMode, AIModel
from app.services.ai_provider import get_provider
from app.services.image_service import (
    validate_image,
    validate_image_size,
    save_upload_image,
    get_image_base64,
)
from app.models.database import create_record

router = APIRouter(prefix="/api", tags=["analyze"])


@router.post("/analyze")
async def analyze_image(
    file: UploadFile = File(..., description="上传的图片文件"),
    mode: AnalyzeMode = Form(..., description="分析模式"),
    model: Optional[AIModel] = Form(None, description="AI 模型"),
):
    """
    分析图片接口

    接收图片文件和分析模式，调用 AI 模型进行流式分析，
    并以 SSE 格式返回分析结果。
    """
    # 默认使用 gpt-4v 模型
    selected_model = model.value if model else "gpt-4v"

    # 验证图片格式
    try:
        validate_image(file)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 验证图片大小
    try:
        await validate_image_size(file)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 保存图片
    try:
        image_url, image_hash = await save_upload_image(file)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"图片保存失败: {str(e)}")

    # 获取图片 base64 编码
    try:
        image_base64 = get_image_base64(image_url)
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))

    # 获取 AI Provider
    try:
        provider = get_provider(selected_model)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    async def event_stream():
        """SSE 事件流生成器"""
        result_text = ""

        try:
            async for chunk in provider.analyze_image(image_base64, mode, selected_model):
                result_text += chunk
                # 发送内容块
                data = json.dumps({"type": "chunk", "content": chunk}, ensure_ascii=False)
                yield f"data: {data}\n\n"

            # 分析完成，保存记录到数据库
            # 生成摘要（取前200字符）
            result_summary = result_text[:200] + ("..." if len(result_text) > 200 else "")

            record = await create_record(
                image_url=image_url,
                image_hash=image_hash,
                mode=mode.value,
                model=selected_model,
                result=result_text,
                result_summary=result_summary,
            )

            # 发送完成信号
            done_data = json.dumps(
                {
                    "type": "done",
                    "id": record["id"],
                    "mode": mode.value,
                },
                ensure_ascii=False,
            )
            yield f"data: {done_data}\n\n"

        except Exception as e:
            # 发送错误信息
            error_data = json.dumps(
                {"type": "error", "content": str(e)}, ensure_ascii=False
            )
            yield f"data: {error_data}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
