import { useAssetStore, Asset } from '../../stores/assetStore';
import './AssetLibrary.css';

interface AssetItemProps {
    asset: Asset;
}

export function AssetItem({ asset }: AssetItemProps) {
    const { selectedAssetId, selectAsset, deleteAsset } = useAssetStore();
    const isSelected = selectedAssetId === asset.id;

    const getIcon = () => {
        switch (asset.file_type) {
            case 'video': return '🎬';
            case 'audio': return '🎵';
            case 'image': return '🖼️';
            default: return '📄';
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div
            className={`asset-item ${isSelected ? 'selected' : ''}`}
            onClick={() => selectAsset(asset.id)}
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData('application/json', JSON.stringify(asset));
                e.dataTransfer.effectAllowed = 'copy';
            }}
        >
            <div className="asset-icon">{getIcon()}</div>
            <div className="asset-info">
                <div className="asset-name" title={asset.original_name}>
                    {asset.original_name}
                </div>
                <div className="asset-meta">
                    {asset.file_type} • {formatSize(asset.file_size)}
                </div>
            </div>
            <button
                className="asset-delete"
                onClick={(e) => {
                    e.stopPropagation();
                    deleteAsset(asset.id);
                }}
                title="删除"
            >
                ✕
            </button>
        </div>
    );
}
