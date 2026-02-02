import { useState } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';
import './AIAssistant.css';

const API_BASE = 'http://localhost:8000';

export function AIAssistant() {
    const [script, setScript] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { addClip, project } = useTimelineStore();

    const handleGenerate = async () => {
        if (!script.trim() || !project) return;

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE}/api/ai/parse-script`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ script, fps: project.fps }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || '解析失败');
            }

            const data = await res.json();

            // 将解析结果添加到时间轴
            for (const track of data.tracks) {
                const localTrack = project.tracks.find((t) => t.type === track.type);
                if (localTrack) {
                    for (const clip of track.clips) {
                        addClip(localTrack.id, 'ai-generated', clip.start_frame, clip.duration);
                        // 更新字幕文本
                        if (clip.text) {
                            setTimeout(() => {
                                const state = useTimelineStore.getState();
                                const clips = state.project?.tracks.flatMap((t) => t.clips) || [];
                                const lastClip = clips[clips.length - 1];
                                if (lastClip) {
                                    state.updateClip(lastClip.id, { text: clip.text });
                                }
                            }, 0);
                        }
                    }
                }
            }

            setScript('');
        } catch (err) {
            setError(err instanceof Error ? err.message : '未知错误');
        } finally {
            setIsLoading(false);
        }
    };

    const exampleScript = `[场景1] 阳光明媚的早晨
清晨的阳光洒落在城市中

[场景2] 主角走进咖啡厅
欢迎来到我们的故事

[场景3] 特写咖啡杯
一杯咖啡，开启美好的一天`;

    return (
        <div className="ai-assistant">
            <h3 className="ai-title">AI 初剪助手</h3>

            <div className="ai-form">
                <div className="form-group">
                    <label>输入脚本</label>
                    <textarea
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                        placeholder="输入视频脚本，AI 将自动生成时间轴..."
                        rows={8}
                    />
                </div>

                <button
                    className="btn btn-example"
                    onClick={() => setScript(exampleScript)}
                >
                    📝 使用示例脚本
                </button>

                {error && <div className="ai-error">{error}</div>}

                <button
                    className="btn btn-primary"
                    onClick={handleGenerate}
                    disabled={isLoading || !script.trim()}
                >
                    {isLoading ? '生成中...' : '🚀 AI 生成时间轴'}
                </button>
            </div>

            <div className="ai-tips">
                <p>💡 脚本格式提示：</p>
                <code>[场景1] 场景描述<br />字幕内容</code>
            </div>
        </div>
    );
}
