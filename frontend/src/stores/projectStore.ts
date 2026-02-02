import { create } from 'zustand';

export interface Project {
  id: string;
  name: string;
  fps: number;
  width: number;
  height: number;
  duration: number; // 总帧数
}

interface ProjectState {
  project: Project | null;
  isPlaying: boolean;
  currentFrame: number;
  
  // Actions
  createProject: (name: string) => void;
  setCurrentFrame: (frame: number) => void;
  setPlaying: (playing: boolean) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  project: null,
  isPlaying: false,
  currentFrame: 0,
  
  createProject: (name: string) => set({
    project: {
      id: crypto.randomUUID(),
      name,
      fps: 30,
      width: 1920,
      height: 1080,
      duration: 0,
    }
  }),
  
  setCurrentFrame: (frame: number) => set({ currentFrame: frame }),
  
  setPlaying: (playing: boolean) => set({ isPlaying: playing }),
}));
