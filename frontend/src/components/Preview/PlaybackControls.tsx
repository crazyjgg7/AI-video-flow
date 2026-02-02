import { useState } from 'react';
import { usePlayback } from '../../hooks/usePlayback';
import './Preview.css';

export function PlaybackControls() {
    const [isPlaying, setIsPlaying] = useState(false);
    const { currentFrame, play, pause, stop, stepForward, stepBackward } = usePlayback();

    const handlePlayPause = () => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleStop = () => {
        stop();
        setIsPlaying(false);
    };

    return (
        <div className="playback-controls">
            <button className="control-btn" onClick={stepBackward} title="上一帧">
                ⏮
            </button>
            <button className="control-btn control-btn-main" onClick={handlePlayPause} title={isPlaying ? '暂停' : '播放'}>
                {isPlaying ? '⏸' : '▶'}
            </button>
            <button className="control-btn" onClick={handleStop} title="停止">
                ⏹
            </button>
            <button className="control-btn" onClick={stepForward} title="下一帧">
                ⏭
            </button>
            <span className="frame-display">帧: {currentFrame}</span>
        </div>
    );
}
