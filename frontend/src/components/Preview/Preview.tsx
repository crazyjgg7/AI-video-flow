import { useRef, useEffect } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';
import { PlaybackControls } from './PlaybackControls';
import './Preview.css';

export function Preview() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { project, currentFrame } = useTimelineStore();

    // 渲染当前帧到 Canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !project) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 清空画布
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 渲染当前帧的内容（简化版：显示帧号）
        ctx.fillStyle = '#fff';
        ctx.font = '24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
            `帧: ${currentFrame}`,
            canvas.width / 2,
            canvas.height / 2 - 20
        );

        // 显示时间码
        const seconds = currentFrame / project.fps;
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(2);
        ctx.font = '16px Inter, sans-serif';
        ctx.fillStyle = '#888';
        ctx.fillText(
            `${mins}:${secs.padStart(5, '0')}`,
            canvas.width / 2,
            canvas.height / 2 + 20
        );

        // 渲染当前帧的字幕（遍历字幕轨道）
        const textTracks = project.tracks.filter((t) => t.type === 'text');
        for (const track of textTracks) {
            for (const clip of track.clips) {
                if (
                    currentFrame >= clip.startFrame &&
                    currentFrame < clip.startFrame + clip.duration &&
                    clip.text
                ) {
                    ctx.font = '20px Inter, sans-serif';
                    ctx.fillStyle = '#fff';
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 3;
                    ctx.textAlign = 'center';
                    ctx.strokeText(clip.text, canvas.width / 2, canvas.height - 50);
                    ctx.fillText(clip.text, canvas.width / 2, canvas.height - 50);
                }
            }
        }
    }, [currentFrame, project]);

    return (
        <div className="preview-container">
            <div className="preview-canvas-wrapper">
                <canvas
                    ref={canvasRef}
                    width={640}
                    height={360}
                    className="preview-canvas"
                />
            </div>
            <PlaybackControls />
        </div>
    );
}
