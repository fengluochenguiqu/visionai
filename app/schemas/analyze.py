"""图像分析相关的数据模型"""

from enum import Enum
from typing import Optional
from pydantic import BaseModel


class AnalyzeMode(str, Enum):
    """分析模式枚举"""
    describe = "describe"  # 描述
    object = "object"      # 物体识别
    scene = "scene"        # 场景分析
    ocr = "ocr"            # 文字识别
    color = "color"        # 色彩分析


class AIModel(str, Enum):
    """AI 模型枚举"""
    gpt4v = "gpt-4v"
    glm4v = "glm-4v"


# 每种分析模式对应的 system prompt
MODE_PROMPTS: dict[AnalyzeMode, str] = {
    AnalyzeMode.describe: "请详细描述这张图片的内容，包括主要物体、人物、动作、环境等细节。",
    AnalyzeMode.object: "请识别并列出图片中的所有物体，对每个物体给出名称、位置描述和置信度。使用列表格式输出。",
    AnalyzeMode.scene: "请分析这张图片的场景，包括场景类型、时间、天气、氛围、光线条件等。",
    AnalyzeMode.ocr: "请识别并提取图片中的所有文字内容，保持原始排版格式。如果没有文字，请说明。",
    AnalyzeMode.color: "请分析这张图片的色彩构成，列出主要颜色及其占比，描述整体色调和色彩搭配风格。",
}


class AnalyzeRequest(BaseModel):
    """分析请求"""
    mode: AnalyzeMode
    model: Optional[AIModel] = None


class AnalyzeResponse(BaseModel):
    """分析响应"""
    id: str
    mode: AnalyzeMode
    result: str
    created_at: str
    image_url: str
