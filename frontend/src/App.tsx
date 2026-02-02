import { EditorLayout } from './layouts/EditorLayout';
import { useProjectStore } from './stores/projectStore';
import { AssetLibrary } from './components/AssetLibrary/AssetLibrary';
import { Timeline } from './components/Timeline/Timeline';
import { Preview } from './components/Preview/Preview';
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
      preview={<Preview />}
      properties={
        <div style={{ color: '#666', fontSize: '0.875rem' }}>
          选择素材后显示属性
        </div>
      }
      timeline={<Timeline />}
    />
  );
}

export default App;
