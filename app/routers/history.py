"""历史记录路由"""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.models.database import get_record, get_records, delete_record
from app.services.image_service import delete_image
from app.schemas.analyze import AnalyzeMode
from app.schemas.history import HistoryItem, HistoryDetail, HistoryListResponse

router = APIRouter(prefix="/api", tags=["history"])


@router.get("/history", response_model=HistoryListResponse)
async def list_history(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(10, ge=1, le=100, description="每页数量"),
    mode: Optional[AnalyzeMode] = Query(None, description="按分析模式筛选"),
):
    """
    获取历史记录列表

    支持分页和按分析模式筛选。
    """
    records, total = await get_records(
        page=page,
        page_size=page_size,
        mode=mode.value if mode else None,
    )

    items = [
        HistoryItem(
            id=r["id"],
            image_url=r["image_url"],
            mode=r["mode"],
            result_summary=r["result_summary"],
            created_at=r["created_at"],
        )
        for r in records
    ]

    return HistoryListResponse(items=items, total=total)


@router.get("/history/{record_id}", response_model=HistoryDetail)
async def get_history_detail(record_id: str):
    """
    获取单条历史记录详情
    """
    record = await get_record(record_id)
    if record is None:
        raise HTTPException(status_code=404, detail="记录不存在")

    return HistoryDetail(
        id=record["id"],
        image_url=record["image_url"],
        mode=record["mode"],
        result=record["result"],
        created_at=record["created_at"],
    )


@router.delete("/history/{record_id}")
async def delete_history(record_id: str):
    """
    删除历史记录及对应的图片文件
    """
    # 先获取记录，以便删除关联的图片
    record = await get_record(record_id)
    if record is None:
        raise HTTPException(status_code=404, detail="记录不存在")

    # 删除图片文件
    try:
        delete_image(record["image_url"])
    except Exception:
        pass  # 图片删除失败不影响记录删除

    # 删除数据库记录
    deleted = await delete_record(record_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="记录删除失败")

    return {"message": "删除成功"}
