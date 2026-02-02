import { create } from 'zustand';
import type { TimelineProject, Track, Clip } from '../types/timeline';
import { createDefaultTrack, createDefaultClip } from '../types/timeline';

interface TimelineState {
    project: TimelineProject | null;
    currentFrame: number;
    selectedClipId: string | null;

    // 历史记录 (撤销/重做)
    history: TimelineProject[];
    historyIndex: number;

    // Actions
    initProject: (name: string, fps?: number) => void;

    // 轨道操作
    addTrack: (type: Track['type'], name?: string) => void;
    removeTrack: (trackId: string) => void;

    // 片段操作
    addClip: (trackId: string, assetId: string, startFrame: number, duration: number) => void;
    removeClip: (clipId: string) => void;
    moveClip: (clipId: string, newStartFrame: number, newTrackId?: string) => void;
    resizeClip: (clipId: string, newDuration: number) => void;
    splitClip: (clipId: string, splitFrame: number) => void;
    updateClip: (clipId: string, updates: Partial<Clip>) => void;

    // 选择
    selectClip: (clipId: string | null) => void;
    setCurrentFrame: (frame: number) => void;

    // 历史
    undo: () => void;
    redo: () => void;
    pushHistory: () => void;
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
    project: null,
    currentFrame: 0,
    selectedClipId: null,
    history: [],
    historyIndex: -1,

    initProject: (name: string, fps = 30) => {
        const project: TimelineProject = {
            id: crypto.randomUUID(),
            name,
            fps,
            width: 1920,
            height: 1080,
            duration: 0,
            tracks: [
                createDefaultTrack('video', '视频轨道 1'),
                createDefaultTrack('audio', '音频轨道 1'),
                createDefaultTrack('text', '字幕轨道'),
            ],
        };
        set({ project, history: [project], historyIndex: 0 });
    },

    addTrack: (type, name) => {
        const { project, pushHistory } = get();
        if (!project) return;

        pushHistory();
        const trackName = name || `${type === 'video' ? '视频' : type === 'audio' ? '音频' : '字幕'}轨道`;
        const newTrack = createDefaultTrack(type, trackName);

        set({
            project: {
                ...project,
                tracks: [...project.tracks, newTrack],
            },
        });
    },

    removeTrack: (trackId) => {
        const { project, pushHistory } = get();
        if (!project) return;

        pushHistory();
        set({
            project: {
                ...project,
                tracks: project.tracks.filter((t) => t.id !== trackId),
            },
        });
    },

    addClip: (trackId, assetId, startFrame, duration) => {
        const { project, pushHistory } = get();
        if (!project) return;

        pushHistory();
        const newClip = createDefaultClip(trackId, assetId, startFrame, duration);

        set({
            project: {
                ...project,
                tracks: project.tracks.map((track) =>
                    track.id === trackId
                        ? { ...track, clips: [...track.clips, newClip] }
                        : track
                ),
            },
        });
    },

    removeClip: (clipId) => {
        const { project, pushHistory, selectedClipId } = get();
        if (!project) return;

        pushHistory();
        set({
            project: {
                ...project,
                tracks: project.tracks.map((track) => ({
                    ...track,
                    clips: track.clips.filter((c) => c.id !== clipId),
                })),
            },
            selectedClipId: selectedClipId === clipId ? null : selectedClipId,
        });
    },

    moveClip: (clipId, newStartFrame, newTrackId) => {
        const { project, pushHistory } = get();
        if (!project) return;

        pushHistory();
        let clipToMove: Clip | null = null;
        let sourceTrackId: string | null = null;

        // 找到 clip
        for (const track of project.tracks) {
            const clip = track.clips.find((c) => c.id === clipId);
            if (clip) {
                clipToMove = { ...clip, startFrame: newStartFrame };
                sourceTrackId = track.id;
                break;
            }
        }

        if (!clipToMove || !sourceTrackId) return;

        const targetTrackId = newTrackId || sourceTrackId;
        clipToMove.trackId = targetTrackId;

        set({
            project: {
                ...project,
                tracks: project.tracks.map((track) => {
                    if (track.id === sourceTrackId && sourceTrackId !== targetTrackId) {
                        return { ...track, clips: track.clips.filter((c) => c.id !== clipId) };
                    }
                    if (track.id === targetTrackId) {
                        const clips = sourceTrackId === targetTrackId
                            ? track.clips.map((c) => (c.id === clipId ? clipToMove! : c))
                            : [...track.clips, clipToMove!];
                        return { ...track, clips };
                    }
                    return track;
                }),
            },
        });
    },

    resizeClip: (clipId, newDuration) => {
        const { project, pushHistory } = get();
        if (!project || newDuration <= 0) return;

        pushHistory();
        set({
            project: {
                ...project,
                tracks: project.tracks.map((track) => ({
                    ...track,
                    clips: track.clips.map((c) =>
                        c.id === clipId ? { ...c, duration: newDuration } : c
                    ),
                })),
            },
        });
    },

    splitClip: (clipId, splitFrame) => {
        const { project, pushHistory } = get();
        if (!project) return;

        // 找到 clip
        let targetClip: Clip | null = null;
        for (const track of project.tracks) {
            const clip = track.clips.find((c) => c.id === clipId);
            if (clip) {
                targetClip = clip;
                break;
            }
        }

        if (!targetClip) return;
        if (splitFrame <= targetClip.startFrame || splitFrame >= targetClip.startFrame + targetClip.duration) return;

        pushHistory();
        const splitOffset = splitFrame - targetClip.startFrame;

        const clip1: Clip = {
            ...targetClip,
            duration: splitOffset,
        };

        const clip2: Clip = {
            ...targetClip,
            id: crypto.randomUUID(),
            startFrame: splitFrame,
            duration: targetClip.duration - splitOffset,
            sourceOffset: targetClip.sourceOffset + splitOffset,
        };

        set({
            project: {
                ...project,
                tracks: project.tracks.map((track) => ({
                    ...track,
                    clips: track.clips.flatMap((c) =>
                        c.id === clipId ? [clip1, clip2] : [c]
                    ),
                })),
            },
        });
    },

    updateClip: (clipId, updates) => {
        const { project, pushHistory } = get();
        if (!project) return;

        pushHistory();
        set({
            project: {
                ...project,
                tracks: project.tracks.map((track) => ({
                    ...track,
                    clips: track.clips.map((c) =>
                        c.id === clipId ? { ...c, ...updates } : c
                    ),
                })),
            },
        });
    },

    selectClip: (clipId) => set({ selectedClipId: clipId }),

    setCurrentFrame: (frame) => set({ currentFrame: Math.max(0, frame) }),

    pushHistory: () => {
        const { project, history, historyIndex } = get();
        if (!project) return;

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(project)));

        set({
            history: newHistory.slice(-50), // 最多保留 50 步
            historyIndex: newHistory.length - 1,
        });
    },

    undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex <= 0) return;

        const newIndex = historyIndex - 1;
        set({
            project: JSON.parse(JSON.stringify(history[newIndex])),
            historyIndex: newIndex,
        });
    },

    redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex >= history.length - 1) return;

        const newIndex = historyIndex + 1;
        set({
            project: JSON.parse(JSON.stringify(history[newIndex])),
            historyIndex: newIndex,
        });
    },
}));
