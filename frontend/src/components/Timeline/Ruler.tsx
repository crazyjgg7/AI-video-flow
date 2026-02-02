interface RulerProps {
    fps: number;
    pixelsPerFrame: number;
    width?: number;
}

export function Ruler({ fps, pixelsPerFrame, width = 3000 }: RulerProps) {
    const totalFrames = Math.floor(width / pixelsPerFrame);
    const majorTickInterval = fps; // 每秒一个大刻度
    const minorTickInterval = fps / 2; // 每半秒一个小刻度

    const ticks = [];
    for (let frame = 0; frame < totalFrames; frame += minorTickInterval) {
        const isMajor = frame % majorTickInterval === 0;
        const seconds = frame / fps;

        ticks.push(
            <div
                key={frame}
                className={`ruler-tick ${isMajor ? 'major' : 'minor'}`}
                style={{ left: `${frame * pixelsPerFrame}px` }}
            >
                {isMajor && (
                    <span className="ruler-label">
                        {formatTime(seconds)}
                    </span>
                )}
            </div>
        );
    }

    return <div className="ruler">{ticks}</div>;
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
