import { ReactNode } from 'react';
import './EditorLayout.css';

interface EditorLayoutProps {
    assetLibrary: ReactNode;
    preview: ReactNode;
    properties: ReactNode;
    timeline: ReactNode;
}

export function EditorLayout({
    assetLibrary,
    preview,
    properties,
    timeline,
}: EditorLayoutProps) {
    return (
        <div className="editor-layout">
            {/* 顶部工具栏 */}
            <header className="editor-header">
                <h1 className="editor-title">AI Video Flow</h1>
                <div className="editor-actions">
                    <button className="btn btn-primary">导出</button>
                </div>
            </header>

            {/* 主工作区 */}
            <main className="editor-main">
                {/* 左侧素材库 */}
                <aside className="panel panel-assets">
                    <div className="panel-header">素材库</div>
                    <div className="panel-content">{assetLibrary}</div>
                </aside>

                {/* 中间预览区 */}
                <section className="panel panel-preview">
                    <div className="panel-header">预览</div>
                    <div className="panel-content">{preview}</div>
                </section>

                {/* 右侧参数面板 */}
                <aside className="panel panel-properties">
                    <div className="panel-header">参数</div>
                    <div className="panel-content">{properties}</div>
                </aside>
            </main>

            {/* 底部时间轴 */}
            <footer className="editor-timeline">
                {timeline}
            </footer>
        </div>
    );
}
