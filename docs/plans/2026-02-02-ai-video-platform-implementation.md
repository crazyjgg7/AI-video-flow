# AI 短视频平台 MVP 实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建一个本地优先的 AI 短视频剪辑平台 MVP

**Architecture:** React 前端 + FastAPI 后端 + FFmpeg 渲染引擎，采用 Monorepo 结构

**Tech Stack:** React, Vite, Zustand, FastAPI, Python, FFmpeg

---

## 任务总览

| # | 任务名称 | 预计时间 | 状态 |
|---|---------|---------|------|
| 1 | 项目初始化 (Monorepo) | 30 min | ⬜ |
| 2 | 后端 FFmpeg 渲染服务 | 1 hr | ⬜ |
| 3 | 前端基础框架搭建 | 45 min | ⬜ |
| 4 | 素材库管理模块 | 1 hr | ⬜ |
| 5 | 时间轴数据模型 | 45 min | ⬜ |
| 6 | 时间轴可视化组件 | 2 hr | ⬜ |
| 7 | 预览播放器 | 1.5 hr | ⬜ |
| 8 | 字幕系统 | 1 hr | ⬜ |
| 9 | 背景音乐模块 | 45 min | ⬜ |
| 10 | AI 初剪接口 | 1 hr | ⬜ |
| 11 | 导出渲染流程 | 1 hr | ⬜ |

---

## Task 1: 项目初始化 (Monorepo)

**Files:**
- Create: `package.json` (root)
- Create: `frontend/package.json`
- Create: `backend/requirements.txt`
- Create: `backend/main.py`

**Steps:**
1. 初始化根目录 package.json (npm workspaces)
2. 使用 Vite 创建 React 前端项目
3. 创建 Python FastAPI 后端骨架
4. 验证前后端均可独立启动
5. Git 初始化并提交

---

## Task 2: 后端 FFmpeg 渲染服务

**Files:**
- Create: `backend/services/render.py`
- Create: `backend/routers/render.py`
- Test: `backend/tests/test_render.py`

**Steps:**
1. 编写 FFmpeg 命令构建器
2. 实现 /api/render 接口
3. 测试简单的视频拼接
4. 提交

---

## Task 3: 前端基础框架搭建

**Files:**
- Modify: `frontend/src/App.tsx`
- Create: `frontend/src/stores/projectStore.ts`
- Create: `frontend/src/layouts/EditorLayout.tsx`

**Steps:**
1. 配置 Zustand 状态管理
2. 创建编辑器主布局 (三栏: 素材库 | 预览 | 参数)
3. 添加底部时间轴占位区域
4. 验证热更新正常
5. 提交

---

## Task 4: 素材库管理模块

**Files:**
- Create: `frontend/src/components/AssetLibrary/AssetLibrary.tsx`
- Create: `frontend/src/components/AssetLibrary/AssetItem.tsx`
- Create: `frontend/src/stores/assetStore.ts`
- Create: `backend/routers/assets.py`

**Steps:**
1. 后端: 实现素材上传接口 `/api/assets/upload`
2. 后端: 实现素材列表接口 `/api/assets`
3. 前端: 创建 assetStore 管理素材状态
4. 前端: 实现素材上传组件 (拖拽上传)
5. 前端: 实现素材缩略图列表展示
6. 验证: 上传视频/图片/音频均正常显示
7. 提交

---

## Task 5: 时间轴数据模型

**Files:**
- Create: `frontend/src/types/timeline.ts`
- Create: `frontend/src/stores/timelineStore.ts`
- Create: `frontend/src/utils/timelineUtils.ts`

**Steps:**
1. 定义 TypeScript 类型: `Project`, `Track`, `Clip`
2. 创建 timelineStore (Zustand)
3. 实现 addClip, removeClip, moveClip, splitClip 方法
4. 实现撤销/重做 (undo/redo) 支持
5. 单元测试: 验证 Clip 操作逻辑
6. 提交

---

## Task 6: 时间轴可视化组件

**Files:**
- Create: `frontend/src/components/Timeline/Timeline.tsx`
- Create: `frontend/src/components/Timeline/Track.tsx`
- Create: `frontend/src/components/Timeline/Clip.tsx`
- Create: `frontend/src/components/Timeline/Ruler.tsx`

**Steps:**
1. 实现时间刻度尺 (Ruler) 组件
2. 实现 Track 容器组件 (支持多轨道)
3. 实现 Clip 组件 (可拖拽、可调整宽度)
4. 实现从素材库拖入时间轴功能
5. 实现 Clip 分割功能 (点击分割点)
6. 实现 Clip 删除功能 (Delete 键)
7. 验证: 拖拽、缩放、分割操作流畅
8. 提交

---

## Task 7: 预览播放器

**Files:**
- Create: `frontend/src/components/Preview/Preview.tsx`
- Create: `frontend/src/components/Preview/PlaybackControls.tsx`
- Create: `frontend/src/hooks/usePlayback.ts`

**Steps:**
1. 实现视频 Canvas 渲染区域
2. 实现播放/暂停/停止控制
3. 实现进度条与时间轴同步
4. 实现当前帧指示器
5. 验证: 播放时时间轴光标同步移动
6. 提交

---

## Task 8: 字幕系统

**Files:**
- Create: `frontend/src/components/Subtitle/SubtitleEditor.tsx`
- Create: `frontend/src/components/Subtitle/SubtitleTrack.tsx`
- Modify: `frontend/src/stores/timelineStore.ts`

**Steps:**
1. 扩展 Clip 类型支持 text 类型
2. 实现字幕编辑面板 (文字、字体、颜色、位置)
3. 实现字幕时间范围调整
4. 在预览区叠加渲染字幕
5. 验证: 字幕随时间轴正确显示/隐藏
6. 提交

---

## Task 9: 背景音乐模块

**Files:**
- Create: `frontend/src/components/Audio/AudioTrack.tsx`
- Create: `frontend/src/components/Audio/AudioControls.tsx`
- Modify: `frontend/src/stores/timelineStore.ts`

**Steps:**
1. 实现音频轨道展示 (波形可视化可选)
2. 实现音量调节
3. 实现淡入淡出设置界面
4. 验证: 音频与视频同步播放
5. 提交

---

## Task 10: AI 初剪接口

**Files:**
- Create: `backend/services/ai_editor.py`
- Create: `backend/routers/ai.py`
- Create: `frontend/src/components/AIPanel/AIPanel.tsx`

**Steps:**
1. 后端: 定义 LLM 适配层接口
2. 后端: 实现 `/api/ai/generate-timeline` 接口
3. 后端: Prompt 模板设计 (输入脚本 → 输出 JSON 时间轴)
4. 前端: 实现 AI 输入面板
5. 前端: 解析 AI 返回的 JSON 并加载到时间轴
6. 验证: 输入脚本后自动生成时间轴
7. 提交

---

## Task 11: 导出渲染流程

**Files:**
- Modify: `backend/services/render.py`
- Create: `frontend/src/components/Export/ExportDialog.tsx`
- Create: `backend/routers/export.py`

**Steps:**
1. 后端: 扩展 FFmpeg 命令支持完整时间轴渲染
2. 后端: 实现 `/api/export` 接口 (接收 JSON 时间轴)
3. 前端: 实现导出对话框 (分辨率、格式选择)
4. 前端: 实现导出进度显示
5. 验证: 完整流程 - 编辑 → 导出 → 本地下载 MP4
6. 提交

---

## 验证计划

### 自动化测试
- 后端: `pytest backend/tests/`
- 前端: `npm run test` (Vitest)

### 手动验证
- 上传素材 → 拖入时间轴 → 预览 → 导出 MP4
