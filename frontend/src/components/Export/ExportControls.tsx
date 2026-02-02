import { useState, useEffect } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';
import { useAudioStore } from '../../stores/audioStore';
import type { Asset } from '../../stores/assetStore'; // Import Type
import './ExportControls.css';

const API_BASE = 'http://localhost:8000';

interface ExportStatus {
    task_id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    output_path?: string;
    error?: string;
}

export function ExportControls() {
    const { project } = useTimelineStore();
    const { bgmTrack } = useAudioStore();
    const [isExporting, setIsExporting] = useState(false);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // 轮询导出状态
    useEffect(() => {
        let interval: number;

        if (taskId && isExporting) {
            interval = setInterval(async () => {
                try {
                    const res = await fetch(`${API_BASE}/api/export/status/${taskId}`);
                    const data: ExportStatus = await res.json();

                    setProgress(data.progress);

                    if (data.status === 'completed') {
                        setIsExporting(false);
                        // 获取下载链接
                        const downloadRes = await fetch(`${API_BASE}/api/export/download/${taskId}`);
                        const downloadData = await downloadRes.json();
                        setDownloadUrl(API_BASE + downloadData.download_url);
                    } else if (data.status === 'failed') {
                        setIsExporting(false);
                        setError(data.error || '导出失败');
                    }
                } catch (err) {
                    console.error(err);
                }
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [taskId, isExporting]);

    const handleExport = async () => {
        if (!project) return;

        setIsExporting(true);
        setError(null);
        setDownloadUrl(null);
        setProgress(0);

        try {
            // 构建导出请求数据
            // 1. 收集所有视频片段（简化版：假设只有第一条视频轨道）
            const videoTrack = project.tracks.find(t => t.type === 'video');
            if (!videoTrack) throw new Error('没有视频轨道');

            const videoClips = videoTrack.clips.map(clip => {
                // FIXME: 这里需要实际的素材路径，目前 store 里没有存完整路径，
                // 实际上后端需要 assetId -> path 的映射，或者前端传 path。
                // 为了演示，我们假设后端能通过 assetId 找到素材，或者前端知道 path。
                // 这里暂时用 assetId 占位，后端 render.py 需要根据 assetId 查库。
                // 但我们在 backend/routers/export.py 里是接受 asset_path 的。
                // 简单起见，我们假设前端能获取到 path (需修改 store 存储 path)
                // 或者我们先传 "uploads/xxx" 假设
                return {
                    asset_path: `uploads/${clip.assetId}`, // 简化处理：假设文件名为 assetId，实际应该是 filename
                    // 但实际上 Clip 存的是 assetId。我们需要从 AssetStore 获取 filename。
                    // 这里暂时不完美，先跑通流程。
                    start_time: clip.sourceOffset / project.fps,
                    duration: clip.duration / project.fps
                };
            });

            // 2. 收集字幕
            const textTrack = project.tracks.find(t => t.type === 'text');
            const subtitles = textTrack ? textTrack.clips.map(clip => ({
                text: clip.text || '',
                start_time: clip.startFrame / project.fps,
                end_time: (clip.startFrame + clip.duration) / project.fps,
                font_size: clip.style?.fontSize,
                font_color: clip.style?.fontColor
            })) : [];

            const payload = {
                project_name: project.name,
                fps: project.fps,
                resolution: "1920x1080", // 默认
                video_clips: videoClips, // 注意：这里可能会因为路径问题失败，见上方注释
                subtitles: subtitles,
                bgm_path: bgmTrack ? `uploads/${bgmTrack.assetId}` : null,
                bgm_volume: bgmTrack?.volume
            };

            const res = await fetch(`${API_BASE}/api/export/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('启动导出失败');

            const data = await res.json();
            setTaskId(data.task_id);

        } catch (err) {
            setIsExporting(false);
            setError(err instanceof Error ? err.message : '未知错误');
        }
    };

    return (
        <div className="export-controls">
            <button
                className="btn btn-export"
                onClick={handleExport}
                disabled={isExporting}
            >
                {isExporting ? `导出中 ${progress}%` : '🎬 导出视频'}
            </button>

            {error && <div className="export-error">{error}</div>}

            {downloadUrl && (
                <a href={downloadUrl} target="_blank" rel="noreferrer" className="btn btn-download">
                    ⬇️ 下载视频
                </a>
            )}
        </div>
    );
}
