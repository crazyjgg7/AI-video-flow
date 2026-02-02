import { useCallback, useEffect } from 'react';
import { useAssetStore, Asset } from '../../stores/assetStore';
import { AssetItem } from './AssetItem';
import './AssetLibrary.css';

export function AssetLibrary() {
    const { assets, isLoading, error, fetchAssets, uploadAsset } = useAssetStore();

    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files);
            files.forEach((file) => uploadAsset(file));
        },
        [uploadAsset]
    );

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach((file) => uploadAsset(file));
        }
    };

    return (
        <div className="asset-library">
            {/* 上传区域 */}
            <div
                className="upload-zone"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept="video/*,audio/*,image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
                <label htmlFor="file-upload" className="upload-label">
                    <span className="upload-icon">📁</span>
                    <span>点击或拖拽上传</span>
                </label>
            </div>

            {/* 加载/错误状态 */}
            {isLoading && <div className="loading">加载中...</div>}
            {error && <div className="error">{error}</div>}

            {/* 素材列表 */}
            <div className="asset-list">
                {assets.map((asset) => (
                    <AssetItem key={asset.id} asset={asset} />
                ))}
                {assets.length === 0 && !isLoading && (
                    <div className="empty-message">暂无素材</div>
                )}
            </div>
        </div>
    );
}
