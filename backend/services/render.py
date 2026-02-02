"""
FFmpeg 渲染服务 - 核心命令构建器
"""
import subprocess
import os
from typing import List, Optional
from dataclasses import dataclass


@dataclass
class ClipInfo:
    """视频片段信息"""
    input_path: str
    start_time: float  # 秒
    duration: float    # 秒


class FFmpegRenderer:
    """FFmpeg 渲染器"""
    
    def __init__(self, ffmpeg_path: str = "ffmpeg"):
        self.ffmpeg_path = ffmpeg_path
    
    def concat_videos(
        self,
        clips: List[ClipInfo],
        output_path: str,
        resolution: str = "1920x1080",
        fps: int = 30
    ) -> bool:
        """
        拼接多个视频片段
        """
        if not clips:
            return False
        
        # 创建临时文件列表
        filter_complex = []
        inputs = []
        
        for i, clip in enumerate(clips):
            inputs.extend(["-i", clip.input_path])
            # 使用 trim 和 setpts 处理每个片段
            filter_complex.append(
                f"[{i}:v]trim=start={clip.start_time}:duration={clip.duration},"
                f"setpts=PTS-STARTPTS,scale={resolution}:force_original_aspect_ratio=decrease,"
                f"pad={resolution}:(ow-iw)/2:(oh-ih)/2[v{i}]"
            )
            filter_complex.append(
                f"[{i}:a]atrim=start={clip.start_time}:duration={clip.duration},"
                f"asetpts=PTS-STARTPTS[a{i}]"
            )
        
        # 拼接所有片段
        video_concat = "".join(f"[v{i}]" for i in range(len(clips)))
        audio_concat = "".join(f"[a{i}]" for i in range(len(clips)))
        filter_complex.append(
            f"{video_concat}concat=n={len(clips)}:v=1:a=0[outv]"
        )
        filter_complex.append(
            f"{audio_concat}concat=n={len(clips)}:v=0:a=1[outa]"
        )
        
        cmd = [
            self.ffmpeg_path,
            "-y",  # 覆盖输出
            *inputs,
            "-filter_complex", ";".join(filter_complex),
            "-map", "[outv]",
            "-map", "[outa]",
            "-c:v", "libx264",
            "-preset", "medium",
            "-crf", "23",
            "-c:a", "aac",
            "-b:a", "128k",
            "-r", str(fps),
            output_path
        ]
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True
            )
            return True
        except subprocess.CalledProcessError as e:
            print(f"FFmpeg error: {e.stderr}")
            return False
    
    def add_subtitle(
        self,
        input_path: str,
        output_path: str,
        text: str,
        start_time: float,
        end_time: float,
        font_size: int = 24,
        font_color: str = "white"
    ) -> bool:
        """
        添加字幕到视频
        """
        # 使用 drawtext 滤镜
        drawtext = (
            f"drawtext=text='{text}':"
            f"fontsize={font_size}:fontcolor={font_color}:"
            f"x=(w-text_w)/2:y=h-th-50:"
            f"enable='between(t,{start_time},{end_time})'"
        )
        
        cmd = [
            self.ffmpeg_path,
            "-y",
            "-i", input_path,
            "-vf", drawtext,
            "-c:a", "copy",
            output_path
        ]
        
        try:
            subprocess.run(cmd, capture_output=True, check=True)
            return True
        except subprocess.CalledProcessError:
            return False
    
    def check_ffmpeg(self) -> bool:
        """检查 FFmpeg 是否可用"""
        try:
            subprocess.run(
                [self.ffmpeg_path, "-version"],
                capture_output=True,
                check=True
            )
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False
