/**
 * 时间轴核心类型定义
 */

export interface TimelineProject {
    id: string;
    name: string;
    fps: number;
    width: number;
    height: number;
    duration: number; // 总帧数
    tracks: Track[];
}

export interface Track {
    id: string;
    type: 'video' | 'audio' | 'text';
    name: string;
    clips: Clip[];
    muted: boolean;
    locked: boolean;
}

export interface Clip {
    id: string;
    trackId: string;
    assetId: string;
    startFrame: number;    // 在时间轴上的起始帧
    duration: number;      // 持续帧数
    sourceOffset: number;  // 素材内部起始偏移帧

    // 属性
    volume?: number;       // 音量 (0-1)
    opacity?: number;      // 透明度 (0-1)
    text?: string;         // 字幕内容

    // 样式 (字幕)
    style?: TextStyle;
}

export interface TextStyle {
    fontSize: number;
    fontFamily: string;
    fontColor: string;
    strokeColor: string;
    strokeWidth: number;
    position: 'top' | 'center' | 'bottom';
}

// 默认值工厂
export function createDefaultTrack(type: Track['type'], name: string): Track {
    return {
        id: crypto.randomUUID(),
        type,
        name,
        clips: [],
        muted: false,
        locked: false,
    };
}

export function createDefaultClip(
    trackId: string,
    assetId: string,
    startFrame: number,
    duration: number
): Clip {
    return {
        id: crypto.randomUUID(),
        trackId,
        assetId,
        startFrame,
        duration,
        sourceOffset: 0,
        volume: 1,
        opacity: 1,
    };
}
