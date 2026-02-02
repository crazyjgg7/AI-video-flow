import { useCallback, useEffect, useRef } from 'react';
import { useTimelineStore } from '../stores/timelineStore';

interface PlaybackOptions {
    fps?: number;
}

export function usePlayback(options: PlaybackOptions = {}) {
    const { fps = 30 } = options;
    const { currentFrame, setCurrentFrame, project } = useTimelineStore();

    const isPlayingRef = useRef(false);
    const animationFrameRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);

    const play = useCallback(() => {
        if (isPlayingRef.current) return;
        isPlayingRef.current = true;
        lastTimeRef.current = performance.now();

        const animate = (now: number) => {
            if (!isPlayingRef.current) return;

            const delta = now - lastTimeRef.current;
            const frameDelta = (delta / 1000) * fps;

            if (frameDelta >= 1) {
                const newFrame = currentFrame + Math.floor(frameDelta);
                setCurrentFrame(newFrame);
                lastTimeRef.current = now;
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);
    }, [currentFrame, fps, setCurrentFrame]);

    const pause = useCallback(() => {
        isPlayingRef.current = false;
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    }, []);

    const stop = useCallback(() => {
        pause();
        setCurrentFrame(0);
    }, [pause, setCurrentFrame]);

    const seekTo = useCallback((frame: number) => {
        setCurrentFrame(Math.max(0, frame));
    }, [setCurrentFrame]);

    const stepForward = useCallback(() => {
        setCurrentFrame(currentFrame + 1);
    }, [currentFrame, setCurrentFrame]);

    const stepBackward = useCallback(() => {
        setCurrentFrame(Math.max(0, currentFrame - 1));
    }, [currentFrame, setCurrentFrame]);

    // 清理
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    return {
        isPlaying: isPlayingRef.current,
        currentFrame,
        play,
        pause,
        stop,
        seekTo,
        stepForward,
        stepBackward,
    };
}
