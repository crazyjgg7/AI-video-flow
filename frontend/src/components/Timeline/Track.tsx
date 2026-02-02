import type { Track as TrackType } from '../../types/timeline';
import { Clip } from './Clip';

interface TrackProps {
    track: TrackType;
    pixelsPerFrame: number;
}

export function Track({ track, pixelsPerFrame }: TrackProps) {
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        // 拖拽素材到轨道的逻辑将在后续实现
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    return (
        <div
            className={`track track-${track.type} ${track.locked ? 'locked' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            {track.clips.map((clip) => (
                <Clip key={clip.id} clip={clip} pixelsPerFrame={pixelsPerFrame} />
            ))}

            {track.clips.length === 0 && (
                <div className="track-empty">拖入素材</div>
            )}
        </div>
    );
}
