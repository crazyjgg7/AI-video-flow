import { useState } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';
import type { TextStyle } from '../../types/timeline';
import './Subtitle.css';

const defaultStyle: TextStyle = {
    fontSize: 24,
    fontFamily: 'Inter, sans-serif',
    fontColor: '#ffffff',
    strokeColor: '#000000',
    strokeWidth: 2,
    position: 'bottom',
};

export function SubtitleEditor() {
    const { project, selectedClipId, updateClip, addClip } = useTimelineStore();
    const [text, setText] = useState('');
    const [style, setStyle] = useState<TextStyle>(defaultStyle);
    const [startFrame, setStartFrame] = useState(0);
    const [duration, setDuration] = useState(90); // 默认 3 秒 (30fps)

    // 获取选中的字幕片段
    const selectedClip = project?.tracks
        .flatMap((t) => t.clips)
        .find((c) => c.id === selectedClipId);

    // 获取字幕轨道
    const textTrack = project?.tracks.find((t) => t.type === 'text');

    const handleAddSubtitle = () => {
        if (!textTrack || !text.trim()) return;
        addClip(textTrack.id, 'subtitle', startFrame, duration);
        // 更新刚添加的片段文本
        setTimeout(() => {
            const clips = useTimelineStore.getState().project?.tracks
                .flatMap((t) => t.clips)
                .filter((c) => c.trackId === textTrack.id);
            const lastClip = clips?.[clips.length - 1];
            if (lastClip) {
                useTimelineStore.getState().updateClip(lastClip.id, { text, style });
            }
        }, 0);
        setText('');
    };

    const handleUpdateSubtitle = () => {
        if (!selectedClipId || !text.trim()) return;
        updateClip(selectedClipId, { text, style });
    };

    return (
        <div className="subtitle-editor">
            <h3 className="subtitle-title">字幕编辑</h3>

            <div className="subtitle-form">
                <div className="form-group">
                    <label>字幕内容</label>
                    <textarea
                        value={selectedClip?.text ?? text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="输入字幕文本..."
                        rows={3}
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>起始帧</label>
                        <input
                            type="number"
                            value={startFrame}
                            onChange={(e) => setStartFrame(Number(e.target.value))}
                            min={0}
                        />
                    </div>
                    <div className="form-group">
                        <label>持续帧数</label>
                        <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            min={1}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>字体大小</label>
                        <input
                            type="number"
                            value={style.fontSize}
                            onChange={(e) => setStyle({ ...style, fontSize: Number(e.target.value) })}
                            min={12}
                            max={72}
                        />
                    </div>
                    <div className="form-group">
                        <label>字体颜色</label>
                        <input
                            type="color"
                            value={style.fontColor}
                            onChange={(e) => setStyle({ ...style, fontColor: e.target.value })}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>描边颜色</label>
                        <input
                            type="color"
                            value={style.strokeColor}
                            onChange={(e) => setStyle({ ...style, strokeColor: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>位置</label>
                        <select
                            value={style.position}
                            onChange={(e) => setStyle({ ...style, position: e.target.value as TextStyle['position'] })}
                        >
                            <option value="top">顶部</option>
                            <option value="center">居中</option>
                            <option value="bottom">底部</option>
                        </select>
                    </div>
                </div>

                <div className="form-actions">
                    {selectedClip ? (
                        <button className="btn btn-primary" onClick={handleUpdateSubtitle}>
                            更新字幕
                        </button>
                    ) : (
                        <button className="btn btn-primary" onClick={handleAddSubtitle}>
                            添加字幕
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
