import { EditorLayout } from './layouts/EditorLayout';
import { useProjectStore } from './stores/projectStore';
import { AssetLibrary } from './components/AssetLibrary/AssetLibrary';
import { useEffect } from 'react';
import './App.css';

function App() {
  const { project, createProject } = useProjectStore();

  useEffect(() => {
    if (!project) {
      createProject('未命名项目');
    }
  }, [project, createProject]);

  return (
    <EditorLayout
      assetLibrary={<AssetLibrary />}
      preview={
        <div className="preview-placeholder">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span>预览区域</span>
          <span style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
            {project?.name ?? '加载中...'}
          </span>
        </div>
      }
      properties={
        <div style={{ color: '#666', fontSize: '0.875rem' }}>
          选择素材后显示属性
        </div>
      }
      timeline={
        <div className="timeline-placeholder">
          ⏱️ 时间轴区域 - 在此处编辑视频片段
        </div>
      }
    />
  );
}

export default App;
