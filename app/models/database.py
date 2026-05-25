"""数据库模块，使用 aiosqlite 异步操作 SQLite"""

import aiosqlite
import uuid
import functools
from datetime import datetime
from typing import Optional, List

from app.config import settings

# 数据库路径
DB_PATH = settings.DATABASE_URL.replace("sqlite+aiosqlite:///", "").replace("sqlite:///", "")

# 数据库连接实例
_db: Optional[aiosqlite.Connection] = None


async def get_db() -> aiosqlite.Connection:
    """获取数据库连接"""
    global _db
    if _db is None:
        _db = await aiosqlite.connect(DB_PATH)
        _db.row_factory = aiosqlite.Row
    return _db


async def init_db():
    """初始化数据库，创建表结构"""
    db = await get_db()
    await db.execute("""
        CREATE TABLE IF NOT EXISTS analysis_records (
            id TEXT PRIMARY KEY,
            image_url TEXT NOT NULL,
            image_hash TEXT NOT NULL,
            mode TEXT NOT NULL,
            model TEXT NOT NULL,
            result TEXT NOT NULL,
            result_summary TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    await db.commit()


def auto_init_db(func):
    """装饰器：确保数据库已初始化后再执行函数"""
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        await init_db()
        return await func(*args, **kwargs)
    return wrapper


@auto_init_db
async def create_record(
    image_url: str,
    image_hash: str,
    mode: str,
    model: str,
    result: str,
    result_summary: str,
) -> dict:
    """创建分析记录"""
    db = await get_db()
    record_id = str(uuid.uuid4())
    created_at = datetime.now().isoformat()
    await db.execute(
        """INSERT INTO analysis_records
           (id, image_url, image_hash, mode, model, result, result_summary, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (record_id, image_url, image_hash, mode, model, result, result_summary, created_at),
    )
    await db.commit()
    return {
        "id": record_id,
        "image_url": image_url,
        "image_hash": image_hash,
        "mode": mode,
        "model": model,
        "result": result,
        "result_summary": result_summary,
        "created_at": created_at,
    }


@auto_init_db
async def get_record(record_id: str) -> Optional[dict]:
    """根据 ID 获取单条记录"""
    db = await get_db()
    cursor = await db.execute(
        "SELECT * FROM analysis_records WHERE id = ?", (record_id,)
    )
    row = await cursor.fetchone()
    if row is None:
        return None
    return dict(row)


@auto_init_db
async def get_records(
    page: int = 1,
    page_size: int = 10,
    mode: Optional[str] = None,
) -> tuple[List[dict], int]:
    """获取记录列表，支持分页和模式筛选"""
    db = await get_db()
    offset = (page - 1) * page_size

    if mode:
        count_cursor = await db.execute(
            "SELECT COUNT(*) FROM analysis_records WHERE mode = ?", (mode,)
        )
        cursor = await db.execute(
            "SELECT * FROM analysis_records WHERE mode = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
            (mode, page_size, offset),
        )
    else:
        count_cursor = await db.execute(
            "SELECT COUNT(*) FROM analysis_records"
        )
        cursor = await db.execute(
            "SELECT * FROM analysis_records ORDER BY created_at DESC LIMIT ? OFFSET ?",
            (page_size, offset),
        )

    total = (await count_cursor.fetchone())[0]
    rows = await cursor.fetchall()
    records = [dict(row) for row in rows]
    return records, total


@auto_init_db
async def delete_record(record_id: str) -> bool:
    """删除记录，返回是否删除成功"""
    db = await get_db()
    cursor = await db.execute(
        "DELETE FROM analysis_records WHERE id = ?", (record_id,)
    )
    await db.commit()
    return cursor.rowcount > 0


async def close_db():
    """关闭数据库连接"""
    global _db
    if _db is not None:
        await _db.close()
        _db = None
