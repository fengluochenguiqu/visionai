"""智谱 GLM-4V 图像分析提供者"""

import json
from typing import AsyncGenerator

import httpx

from app.config import settings
from app.schemas.analyze import AnalyzeMode, MODE_PROMPTS
from app.services.ai_provider import AIProvider


class ZhipuProvider(AIProvider):
    """智谱 GLM-4V 提供者，支持流式返回"""

    async def analyze_image(
        self, image_base64: str, mode: AnalyzeMode, model: str = "glm-4v"
    ) -> AsyncGenerator[str, None]:
        """
        使用智谱 GLM-4V-Flash API 流式分析图片

        Args:
            image_base64: 图片的 base64 编码
            mode: 分析模式
            model: 模型名称

        Yields:
            分析结果的文本片段
        """
        # 检查 API Key 是否已配置
        if not settings.ZHIPU_API_KEY:
            raise ValueError(
                "智谱 API Key 未配置。请在 backend/.env 文件中设置 ZHIPU_API_KEY"
            )

        system_prompt = MODE_PROMPTS.get(mode, MODE_PROMPTS[AnalyzeMode.describe])

        # 使用免费模型 glm-4v-flash（glm-4v 是付费模型）
        payload = {
            "model": "glm-4v-flash",
            "messages": [
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}"
                            },
                        },
                        {"type": "text", "text": f"请对这张图片进行{mode.value}分析"},
                    ],
                },
            ],
            "stream": True,
        }

        # 智谱最新 API 支持直接使用 API Key 作为 Bearer Token
        headers = {
            "Authorization": f"Bearer {settings.ZHIPU_API_KEY}",
            "Content-Type": "application/json",
        }

        url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"

        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST", url, json=payload, headers=headers
            ) as response:
                if response.status_code != 200:
                    error_text = await response.aread()
                    error_msg = error_text.decode()

                    # 解析常见错误，给出友好提示
                    if response.status_code == 401:
                        raise ValueError(
                            "智谱 API Key 无效或已过期，请检查 backend/.env 中的 ZHIPU_API_KEY"
                        )
                    elif response.status_code == 429:
                        raise ValueError(
                            "智谱 API 请求频率超限，请稍后再试"
                        )
                    else:
                        raise Exception(
                            f"智谱 API 请求失败 (状态码 {response.status_code}): {error_msg}"
                        )

                async for line in response.aiter_lines():
                    line = line.strip()
                    if not line or not line.startswith("data: "):
                        continue
                    data = line[6:]  # 去掉 "data: " 前缀
                    if data == "[DONE]":
                        break
                    try:
                        chunk = json.loads(data)
                        delta = chunk.get("choices", [{}])[0].get("delta", {})
                        content = delta.get("content", "")
                        if content:
                            yield content
                    except json.JSONDecodeError:
                        continue
