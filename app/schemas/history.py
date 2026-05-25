"""历史记录相关的数据模型"""

from typing import List
from pydantic import BaseModel

from app.schemas.analyze import AnalyzeMode


class HistoryItem(BaseModel):
    """历史记录列表项"""
    id: str
    image_url: str
    mode: AnalyzeMode
    result_summary: str
    created_at: str


class HistoryDetail(BaseModel):
    """历史记录详情"""
    id: str
    image_url: str
    mode: AnalyzeMode
    result: str
    created_at: str


class HistoryListResponse(BaseModel):
    """历史记录列表响应"""
    items: List[HistoryItem]
    total: int
