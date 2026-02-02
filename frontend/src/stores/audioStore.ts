import { create } from 'zustand';

export interface AudioClip {
    id: string;
    assetId: string;
    startFrame: number;
    duration: number;
    volume: number;
    fadeInDuration: number;  // 淡入帧数
    fadeOutDuration: number; // 淡出帧数
}

interface AudioState {
    bgmTrack: AudioClip | null;

    // Actions
    setBgm: (assetId: string, duration: number) => void;
    removeBgm: () => void;
    updateBgmVolume: (volume: number) => void;
    updateFadeIn: (frames: number) => void;
    updateFadeOut: (frames: number) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
    bgmTrack: null,

    setBgm: (assetId: string, duration: number) =>
        set({
            bgmTrack: {
                id: crypto.randomUUID(),
                assetId,
                startFrame: 0,
                duration,
                volume: 0.5,
                fadeInDuration: 30,  // 默认 1 秒
                fadeOutDuration: 30, // 默认 1 秒
            },
        }),

    removeBgm: () => set({ bgmTrack: null }),

    updateBgmVolume: (volume: number) =>
        set((state) => ({
            bgmTrack: state.bgmTrack ? { ...state.bgmTrack, volume } : null,
        })),

    updateFadeIn: (frames: number) =>
        set((state) => ({
            bgmTrack: state.bgmTrack ? { ...state.bgmTrack, fadeInDuration: frames } : null,
        })),

    updateFadeOut: (frames: number) =>
        set((state) => ({
            bgmTrack: state.bgmTrack ? { ...state.bgmTrack, fadeOutDuration: frames } : null,
        })),
}));
