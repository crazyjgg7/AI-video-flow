import { create } from 'zustand';

export interface Asset {
    id: string;
    filename: string;
    original_name: string;
    file_type: 'video' | 'audio' | 'image' | 'unknown';
    file_size: number;
    path: string;
}

interface AssetState {
    assets: Asset[];
    selectedAssetId: string | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchAssets: () => Promise<void>;
    uploadAsset: (file: File) => Promise<void>;
    deleteAsset: (id: string) => Promise<void>;
    selectAsset: (id: string | null) => void;
}

const API_BASE = 'http://localhost:8000';

export const useAssetStore = create<AssetState>((set, get) => ({
    assets: [],
    selectedAssetId: null,
    isLoading: false,
    error: null,

    fetchAssets: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`${API_BASE}/api/assets/`);
            const data = await res.json();
            set({ assets: data, isLoading: false });
        } catch (err) {
            set({ error: '加载素材失败', isLoading: false });
        }
    },

    uploadAsset: async (file: File) => {
        set({ isLoading: true, error: null });
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(`${API_BASE}/api/assets/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('上传失败');

            const newAsset = await res.json();
            set((state) => ({
                assets: [...state.assets, newAsset],
                isLoading: false,
            }));
        } catch (err) {
            set({ error: '上传素材失败', isLoading: false });
        }
    },

    deleteAsset: async (id: string) => {
        try {
            await fetch(`${API_BASE}/api/assets/${id}`, { method: 'DELETE' });
            set((state) => ({
                assets: state.assets.filter((a) => a.id !== id),
                selectedAssetId: state.selectedAssetId === id ? null : state.selectedAssetId,
            }));
        } catch (err) {
            set({ error: '删除素材失败' });
        }
    },

    selectAsset: (id: string | null) => set({ selectedAssetId: id }),
}));
