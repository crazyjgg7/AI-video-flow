import { useAudioStore } from '../../stores/audioStore';
import { useAssetStore } from '../../stores/assetStore';
import './AudioControls.css';

export function AudioControls() {
    const { bgmTrack, updateBgmVolume, updateFadeIn, updateFadeOut, removeBgm, setBgm } = useAudioStore();
    const { assets } = useAssetStore();

    const audioAssets = assets.filter((a) => a.file_type === 'audio');

    const handleAddBgm = (assetId: string) => {
        // 默认 5 分钟时长 (30fps * 60s * 5min)
        setBgm(assetId, 30 * 60 * 5);
    };

    return (
        <div className="audio-controls">
            <h3 className="audio-title">背景音乐</h3>

            {bgmTrack ? (
                <div className="bgm-settings">
                    <div className="bgm-info">
                        <span className="bgm-icon">🎵</span>
                        <span className="bgm-name">
                            {audioAssets.find((a) => a.id === bgmTrack.assetId)?.original_name || '背景音乐'}
                        </span>
                        <button className="btn-remove" onClick={removeBgm} title="移除">
                            ✕
                        </button>
                    </div>

                    <div className="form-group">
                        <label>音量: {Math.round(bgmTrack.volume * 100)}%</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={bgmTrack.volume}
                            onChange={(e) => updateBgmVolume(Number(e.target.value))}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>淡入 (帧)</label>
                            <input
                                type="number"
                                value={bgmTrack.fadeInDuration}
                                onChange={(e) => updateFadeIn(Number(e.target.value))}
                                min={0}
                                max={300}
                            />
                        </div>
                        <div className="form-group">
                            <label>淡出 (帧)</label>
                            <input
                                type="number"
                                value={bgmTrack.fadeOutDuration}
                                onChange={(e) => updateFadeOut(Number(e.target.value))}
                                min={0}
                                max={300}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bgm-empty">
                    {audioAssets.length > 0 ? (
                        <div className="audio-list">
                            <p>选择音频作为背景音乐：</p>
                            {audioAssets.map((asset) => (
                                <button
                                    key={asset.id}
                                    className="audio-item"
                                    onClick={() => handleAddBgm(asset.id)}
                                >
                                    🎵 {asset.original_name}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="empty-hint">请先上传音频文件</p>
                    )}
                </div>
            )}
        </div>
    );
}
