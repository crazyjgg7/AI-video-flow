"""
AI 初剪相关 API 路由
将文本脚本解析为时间轴 JSON
"""
import re
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/ai", tags=["ai"])


class SceneInfo(BaseModel):
    """场景信息"""
    index: int
    description: str
    duration: float  # 秒
    suggested_asset_type: str  # video, image
    subtitle: Optional[str] = None


class ScriptRequest(BaseModel):
    """脚本解析请求"""
    script: str
    fps: int = 30


class TimelineClip(BaseModel):
    """时间轴片段"""
    id: str
    track_id: str
    start_frame: int
    duration: int
    text: Optional[str] = None
    asset_id: Optional[str] = None


class TimelineTrack(BaseModel):
    """时间轴轨道"""
    id: str
    type: str
    name: str
    clips: List[TimelineClip]


class TimelineResponse(BaseModel):
    """时间轴响应"""
    tracks: List[TimelineTrack]
    total_duration: int  # 总帧数


@router.post("/parse-script", response_model=TimelineResponse)
async def parse_script(request: ScriptRequest):
    """
    解析文本脚本，生成时间轴 JSON
    
    脚本格式示例:
    [场景1] 一个阳光明媚的早晨
    这是一段旁白文字
    
    [场景2] 主角走进咖啡厅
    欢迎光临
    """
    script = request.script.strip()
    fps = request.fps
    
    if not script:
        raise HTTPException(status_code=400, detail="脚本不能为空")
    
    # 解析场景
    scenes = parse_scenes(script)
    
    if not scenes:
        raise HTTPException(status_code=400, detail="无法解析脚本，请检查格式")
    
    # 生成时间轴
    video_track = TimelineTrack(
        id="track-video-1",
        type="video",
        name="视频轨道 1",
        clips=[]
    )
    
    text_track = TimelineTrack(
        id="track-text-1",
        type="text",
        name="字幕轨道",
        clips=[]
    )
    
    current_frame = 0
    
    for i, scene in enumerate(scenes):
        # 计算持续帧数（每个场景默认 3 秒）
        duration_frames = int(scene.duration * fps)
        
        # 添加视频片段占位
        video_track.clips.append(TimelineClip(
            id=f"clip-video-{i}",
            track_id=video_track.id,
            start_frame=current_frame,
            duration=duration_frames,
            text=scene.description,
        ))
        
        # 添加字幕
        if scene.subtitle:
            text_track.clips.append(TimelineClip(
                id=f"clip-text-{i}",
                track_id=text_track.id,
                start_frame=current_frame,
                duration=duration_frames,
                text=scene.subtitle,
            ))
        
        current_frame += duration_frames
    
    return TimelineResponse(
        tracks=[video_track, text_track],
        total_duration=current_frame
    )


def parse_scenes(script: str) -> List[SceneInfo]:
    """解析脚本中的场景"""
    scenes = []
    
    # 正则匹配 [场景X] 或 [SceneX] 格式
    pattern = r'\[(?:场景|Scene|scene)\s*(\d+)\]\s*(.+?)(?=\[(?:场景|Scene|scene)|$)'
    matches = re.findall(pattern, script, re.DOTALL | re.IGNORECASE)
    
    if matches:
        for idx, (scene_num, content) in enumerate(matches):
            lines = [line.strip() for line in content.strip().split('\n') if line.strip()]
            description = lines[0] if lines else f"场景 {scene_num}"
            subtitle = lines[1] if len(lines) > 1 else None
            
            scenes.append(SceneInfo(
                index=idx,
                description=description,
                duration=3.0,  # 默认每个场景 3 秒
                suggested_asset_type="video",
                subtitle=subtitle
            ))
    else:
        # 如果没有场景标记，按段落分割
        paragraphs = [p.strip() for p in script.split('\n\n') if p.strip()]
        for idx, para in enumerate(paragraphs):
            lines = [line.strip() for line in para.split('\n') if line.strip()]
            scenes.append(SceneInfo(
                index=idx,
                description=lines[0],
                duration=3.0,
                suggested_asset_type="video",
                subtitle=lines[1] if len(lines) > 1 else None
            ))
    
    return scenes


@router.get("/health")
async def ai_health():
    """AI 服务健康检查"""
    return {"status": "healthy", "service": "ai"}
