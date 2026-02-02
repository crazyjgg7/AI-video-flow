import { EditorLayout } from './layouts/EditorLayout';
import { useProjectStore } from './stores/projectStore';
import { AssetLibrary } from './components/AssetLibrary/AssetLibrary';
import { Timeline } from './components/Timeline/Timeline';
import { Preview } from './components/Preview/Preview';
import { SubtitleEditor } from './components/Subtitle/SubtitleEditor';
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
      properties={<SubtitleEditor />}
      timeline={<Timeline />}
    />
  );
}

export default App;
