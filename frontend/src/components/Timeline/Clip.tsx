import type { Clip as ClipType } from '../../types/timeline';
import { useTimelineStore } from '../../stores/timelineStore';

interface ClipProps {
    clip: ClipType;
    pixelsPerFrame: number;
}

export function Clip({ clip, pixelsPerFrame }: ClipProps) {
    const { selectedClipId, selectClip, removeClip } = useTimelineStore();
    const isSelected = selectedClipId === clip.id;

    const width = clip.duration * pixelsPerFrame;
    const left = clip.startFrame * pixelsPerFrame;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            removeClip(clip.id);
        }
    };

    return (
        <div
            className={`clip ${isSelected ? 'selected' : ''}`}
            style={{
                width: `${width}px`,
                left: `${left}px`,
            }}
            onClick={() => selectClip(clip.id)}
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            <div className="clip-content">
                {clip.text ? (
                    <span className="clip-text">{clip.text}</span>
                ) : (
                    <span className="clip-label">Clip</span>
                )}
            </div>

            {/* 左右拖拽手柄 (后续实现 resize) */}
            <div className="clip-handle clip-handle-left" />
            <div className="clip-handle clip-handle-right" />
        </div>
    );
}
