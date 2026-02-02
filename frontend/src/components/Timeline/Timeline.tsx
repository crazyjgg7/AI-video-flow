import { useEffect } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';
import { Ruler } from './Ruler';
import { Track } from './Track';
import './Timeline.css';

const PIXELS_PER_FRAME = 2; // 每帧对应的像素数

export function Timeline() {
    const { project, currentFrame, setCurrentFrame, initProject } = useTimelineStore();

    useEffect(() => {
        if (!project) {
            initProject('未命名项目');
        }
    }, [project, initProject]);

    if (!project) {
        return <div className="timeline-loading">加载中...</div>;
    }

    const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const frame = Math.floor(x / PIXELS_PER_FRAME);
        setCurrentFrame(frame);
    };

    return (
        <div className="timeline-container">
            {/* 轨道标签区 */}
            <div className="timeline-labels">
                <div className="timeline-label-header" />
                {project.tracks.map((track) => (
                    <div key={track.id} className="timeline-label">
                        <span className="track-icon">
                            {track.type === 'video' ? '🎬' : track.type === 'audio' ? '🎵' : '📝'}
                        </span>
                        <span className="track-name">{track.name}</span>
                    </div>
                ))}
            </div>

            {/* 时间轴主体 */}
            <div className="timeline-main">
                {/* 时间刻度尺 */}
                <div className="timeline-ruler-container" onClick={handleRulerClick}>
                    <Ruler fps={project.fps} pixelsPerFrame={PIXELS_PER_FRAME} />
                    {/* 播放头 */}
                    <div
                        className="playhead"
                        style={{ left: `${currentFrame * PIXELS_PER_FRAME}px` }}
                    />
                </div>

                {/* 轨道内容 */}
                <div className="timeline-tracks">
                    {project.tracks.map((track) => (
                        <Track
                            key={track.id}
                            track={track}
                            pixelsPerFrame={PIXELS_PER_FRAME}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
