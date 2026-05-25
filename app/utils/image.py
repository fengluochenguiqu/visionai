"""图片工具函数"""

import base64
from typing import Tuple


def image_to_base64(image_bytes: bytes) -> str:
    """
    将图片字节转换为 base64 编码字符串

    Args:
        image_bytes: 图片字节数据

    Returns:
        base64 编码字符串
    """
    return base64.b64encode(image_bytes).decode("utf-8")


def get_image_dimensions(image_bytes: bytes) -> Tuple[int, int]:
    """
    获取图片尺寸

    Args:
        image_bytes: 图片字节数据

    Returns:
        (width, height) 图片宽高
    """
    from PIL import Image
    import io

    img = Image.open(io.BytesIO(image_bytes))
    return img.size
