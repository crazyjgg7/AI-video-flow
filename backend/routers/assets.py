"""
素材管理相关 API 路由
"""
import os
import uuid
import shutil
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/assets", tags=["assets"])

# 素材存储目录
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


class AssetInfo(BaseModel):
    id: str
    filename: str
    original_name: str
    file_type: str  # video, audio, image
    file_size: int
    path: str


# 内存中的素材列表（简化版，生产环境应使用数据库）
assets_db: List[AssetInfo] = []


def get_file_type(filename: str) -> str:
    """根据文件扩展名判断类型"""
    ext = filename.lower().split('.')[-1]
    if ext in ['mp4', 'mov', 'avi', 'mkv', 'webm']:
        return 'video'
    elif ext in ['mp3', 'wav', 'aac', 'm4a', 'ogg']:
        return 'audio'
    elif ext in ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']:
        return 'image'
    else:
        return 'unknown'


@router.get("/", response_model=List[AssetInfo])
async def list_assets():
    """获取所有素材列表"""
    return assets_db


@router.post("/upload", response_model=AssetInfo)
async def upload_asset(file: UploadFile = File(...)):
    """上传素材文件"""
    # 生成唯一文件名
    file_id = str(uuid.uuid4())
    ext = file.filename.split('.')[-1] if '.' in file.filename else ''
    new_filename = f"{file_id}.{ext}" if ext else file_id
    file_path = UPLOAD_DIR / new_filename
    
    # 保存文件
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件保存失败: {str(e)}")
    
    # 获取文件大小
    file_size = os.path.getsize(file_path)
    
    # 创建素材信息
    asset = AssetInfo(
        id=file_id,
        filename=new_filename,
        original_name=file.filename,
        file_type=get_file_type(file.filename),
        file_size=file_size,
        path=str(file_path)
    )
    
    assets_db.append(asset)
    return asset


@router.delete("/{asset_id}")
async def delete_asset(asset_id: str):
    """删除素材"""
    global assets_db
    
    # 查找素材
    asset = next((a for a in assets_db if a.id == asset_id), None)
    if not asset:
        raise HTTPException(status_code=404, detail="素材不存在")
    
    # 删除文件
    file_path = Path(asset.path)
    if file_path.exists():
        file_path.unlink()
    
    # 从列表中移除
    assets_db = [a for a in assets_db if a.id != asset_id]
    
    return {"success": True, "message": "素材已删除"}
