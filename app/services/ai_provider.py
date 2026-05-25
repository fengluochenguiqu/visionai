"""AI Provider 抽象基类和工厂函数"""

from abc import ABC, abstractmethod
from typing import AsyncGenerator

from app.schemas.analyze import AnalyzeMode


class AIProvider(ABC):
    """AI 服务提供者抽象基类"""

    @abstractmethod
    async def analyze_image(
        self, image_base64: str, mode: AnalyzeMode, model: str
    ) -> AsyncGenerator[str, None]:
        """
        流式分析图片

        Args:
            image_base64: 图片的 base64 编码
            mode: 分析模式
            model: 使用的模型名称

        Yields:
            分析结果的文本片段
        """
        ...


def get_provider(model: str) -> AIProvider:
    """
    根据模型名称获取对应的 AI Provider

    Args:
        model: 模型名称，如 "gpt-4v" 或 "glm-4v"

    Returns:
        对应的 AIProvider 实例

    Raises:
        ValueError: 不支持的模型
    """
    if model == "gpt-4v":
        from app.services.openai_provider import OpenAIProvider
        return OpenAIProvider()
    elif model == "glm-4v":
        from app.services.zhipu_provider import ZhipuProvider
        return ZhipuProvider()
    else:
        raise ValueError(f"不支持的模型: {model}")
