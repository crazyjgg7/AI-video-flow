"""
渲染相关 API 路由
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from services.render import FFmpegRenderer, ClipInfo

router = APIRouter(prefix="/api/render", tags=["render"])

renderer = FFmpegRenderer()


class ClipRequest(BaseModel):
    input_path: str
    start_time: float = 0.0
    duration: float = 5.0


class ConcatRequest(BaseModel):
    clips: List[ClipRequest]
    output_path: str
    resolution: str = "1920x1080"
    fps: int = 30


class SubtitleRequest(BaseModel):
    input_path: str
    output_path: str
    text: str
    start_time: float
    end_time: float
    font_size: int = 24
    font_color: str = "white"


@router.get("/check")
async def check_ffmpeg():
    """检查 FFmpeg 是否可用"""
    available = renderer.check_ffmpeg()
    return {"ffmpeg_available": available}


@router.post("/concat")
async def concat_videos(request: ConcatRequest):
    """拼接多个视频片段"""
    clips = [
        ClipInfo(
            input_path=c.input_path,
            start_time=c.start_time,
            duration=c.duration
        )
        for c in request.clips
    ]
    
    success = renderer.concat_videos(
        clips=clips,
        output_path=request.output_path,
        resolution=request.resolution,
        fps=request.fps
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="视频拼接失败")
    
    return {"success": True, "output_path": request.output_path}


@router.post("/subtitle")
async def add_subtitle(request: SubtitleRequest):
    """添加字幕到视频"""
    success = renderer.add_subtitle(
        input_path=request.input_path,
        output_path=request.output_path,
        text=request.text,
        start_time=request.start_time,
        end_time=request.end_time,
        font_size=request.font_size,
        font_color=request.font_color
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="添加字幕失败")
    
    return {"success": True, "output_path": request.output_path}
