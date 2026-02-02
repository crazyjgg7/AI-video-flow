"""
导出渲染相关 API 路由
"""
import os
import uuid
import json
from typing import List, Optional
from pathlib import Path
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from services.render import FFmpegRenderer, ClipInfo

router = APIRouter(prefix="/api/export", tags=["export"])

# 渲染输出目录
OUTPUT_DIR = Path("outputs")
OUTPUT_DIR.mkdir(exist_ok=True)

# 渲染任务状态存储（简化版）
render_tasks = {}


class SubtitleClip(BaseModel):
    text: str
    start_time: float
    end_time: float
    font_size: int = 24
    font_color: str = "white"


class ExportClip(BaseModel):
    asset_path: str
    start_time: float
    duration: float


class ExportRequest(BaseModel):
    """导出请求"""
    project_name: str
    fps: int = 30
    resolution: str = "1920x1080"
    video_clips: List[ExportClip]
    subtitles: Optional[List[SubtitleClip]] = None
    bgm_path: Optional[str] = None
    bgm_volume: float = 0.5


class ExportStatus(BaseModel):
    """导出状态"""
    task_id: str
    status: str  # pending, processing, completed, failed
    progress: int  # 0-100
    output_path: Optional[str] = None
    error: Optional[str] = None


@router.post("/start", response_model=ExportStatus)
async def start_export(request: ExportRequest, background_tasks: BackgroundTasks):
    """开始导出渲染任务"""
    task_id = str(uuid.uuid4())
    
    # 初始化任务状态
    render_tasks[task_id] = {
        "status": "pending",
        "progress": 0,
        "output_path": None,
        "error": None,
    }
    
    # 后台执行渲染
    background_tasks.add_task(
        process_export,
        task_id,
        request
    )
    
    return ExportStatus(
        task_id=task_id,
        status="pending",
        progress=0
    )


@router.get("/status/{task_id}", response_model=ExportStatus)
async def get_export_status(task_id: str):
    """获取导出任务状态"""
    if task_id not in render_tasks:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    task = render_tasks[task_id]
    return ExportStatus(
        task_id=task_id,
        status=task["status"],
        progress=task["progress"],
        output_path=task.get("output_path"),
        error=task.get("error")
    )


async def process_export(task_id: str, request: ExportRequest):
    """后台处理导出任务"""
    renderer = FFmpegRenderer()
    
    try:
        render_tasks[task_id]["status"] = "processing"
        render_tasks[task_id]["progress"] = 10
        
        # 输出文件路径
        output_filename = f"{request.project_name}_{task_id[:8]}.mp4"
        output_path = str(OUTPUT_DIR / output_filename)
        
        # 准备视频片段
        clips = [
            ClipInfo(
                input_path=c.asset_path,
                start_time=c.start_time,
                duration=c.duration
            )
            for c in request.video_clips
        ]
        
        render_tasks[task_id]["progress"] = 30
        
        # 如果有视频片段，先拼接
        if clips:
            temp_video = str(OUTPUT_DIR / f"temp_{task_id}.mp4")
            success = renderer.concat_videos(
                clips=clips,
                output_path=temp_video,
                resolution=request.resolution,
                fps=request.fps
            )
            if not success:
                raise Exception("视频拼接失败")
        else:
            temp_video = None
        
        render_tasks[task_id]["progress"] = 60
        
        # 添加字幕（如果有）
        if temp_video and request.subtitles:
            for i, subtitle in enumerate(request.subtitles):
                sub_output = str(OUTPUT_DIR / f"sub_{task_id}_{i}.mp4")
                renderer.add_subtitle(
                    input_path=temp_video,
                    output_path=sub_output,
                    text=subtitle.text,
                    start_time=subtitle.start_time,
                    end_time=subtitle.end_time,
                    font_size=subtitle.font_size,
                    font_color=subtitle.font_color
                )
                temp_video = sub_output
        
        render_tasks[task_id]["progress"] = 80
        
        # 最终输出
        if temp_video:
            os.rename(temp_video, output_path)
        
        render_tasks[task_id]["status"] = "completed"
        render_tasks[task_id]["progress"] = 100
        render_tasks[task_id]["output_path"] = output_path
        
    except Exception as e:
        render_tasks[task_id]["status"] = "failed"
        render_tasks[task_id]["error"] = str(e)


@router.get("/download/{task_id}")
async def download_export(task_id: str):
    """获取导出文件下载链接"""
    if task_id not in render_tasks:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    task = render_tasks[task_id]
    if task["status"] != "completed":
        raise HTTPException(status_code=400, detail="任务尚未完成")
    
    output_path = task.get("output_path")
    if not output_path or not os.path.exists(output_path):
        raise HTTPException(status_code=404, detail="文件不存在")
    
    return {"download_url": f"/outputs/{os.path.basename(output_path)}"}
