# AI 短视频自动生成平台 (MVP) 设计方案

> **日期**: 2026-02-02
> **状态**: 草案 (Review Needed)
> **目标用户**: 普通用户 / 自媒体博主
> **核心场景**: 口播解说 / 图文混剪

## 1. 系统概述

本项目旨在构建一个 **"本地优先 + AI 辅助"** 的智能化短视频剪辑平台。通过 AI (LLM) 理解用户脚本，自动规划镜头语言并从素材库匹配素材，生成可视化时间轴。用户可在 Web 界面进行帧级精度的微调，最终利用本地或云端 FFmpeg 引擎渲染高质量视频。

### 1.1 核心价值
- **降低门槛**: AI 承担 80% 的粗剪工作。
- **精确控制**: 保留非线性编辑 (NLE) 的核心能力，拒绝"黑盒"生成。
- **混合算力**: 本地处理即时交互，云端/本地灵活选择渲染资源。

## 2. 核心架构

采用 **本地优先 (Local-First)** 架构，确保隐私安全与操作流畅性。

```mermaid
graph TD
    User[用户] --> WebUI[Web 可视化编辑器 (React/Electron)]
    WebUI --> LocalEngine[本地逻辑引擎]
    
    subgraph "Core System (Local)"
        LocalEngine --> StateManager[状态管理 (Zustand)]
        StateManager --> Timeline[时间轴数据模型]
        LocalEngine --> Player[预览播放器 (WebCodecs)]
        LocalEngine --> LLM_Adapter[LLM 适配层]
    end
    
    subgraph "AI Capabilities"
        LLM_Adapter -.-> CloudLLM[云端 LLM (Claude/GPT)]
        LLM_Adapter -.-> LocalLLM[本地 LLM (Ollama)]
    end
    
    subgraph "Render Engine"
        WebUI --> RenderService[渲染服务 (Python/FastAPI)]
        RenderService --> FFmpeg[FFmpeg 核心]
        RenderService --> CloudRender[云端渲染 (Optional)]
    end
    
    subgraph "Assets"
        LocalStore[本地素材库]
        CloudStore[云端素材源 (API)]
    end
    
    LocalEngine --> LocalStore
    LocalEngine --> CloudStore
```

### 2.1 模块划分

| 模块 | 技术栈 | 职责 |
|------|--------|------|
| **前端编辑器** | React, Vite, Tailwind | 核心交互界面，时间轴可视化 |
| **状态管理** | Zustand | 管理复杂的剪辑轨道、选中状态、撤销重做 |
| **媒体引擎** | WebCodecs, Canvas | 浏览器端高性能视频解码与实时预览合成 |
| **后端/渲染** | Python, FastAPI | 本地 API 服务，FFmpeg 命令编排与执行 |
| **AI 适配层** | LangChain / SDK | 统一封装不同 LLM 的调用接口 (Prompt Engineering) |

## 3. MVP 功能清单

根据头脑风暴，MVP 阶段聚焦以下 7 项核心功能：

1.  **素材管理**: 支持用户上传视频、图片、音频素材，并提取基础元数据。
2.  **AI 一键初剪**: 输入脚本/Prompt，LLM 生成 JSON 格式的时间轴描述（镜头切分、素材匹配）。
3.  **可视化时间轴**: 支持多轨道（视频、音频、字幕）的拖拽、缩放、分割、删除。
4.  **字幕系统**: 自动/手动添加字幕，支持样式调整与时间对齐。
5.  **背景音乐**: 音频轨道管理，支持淡入淡出设置。
6.  **实时预览**: 所见即所得的 Web 端预览播放。
7.  **导出渲染**: 生成标准 1080p MP4 视频 (H.264)。

## 4. 数据结构设计

核心时间轴数据结构 (Draft)：

```typescript
interface TimelineProject {
  id: string;
  fps: number;
  duration: number; // 总帧数
  tracks: Track[];
}

interface Track {
  id: string;
  type: 'video' | 'audio' | 'text';
  clips: Clip[];
}

interface Clip {
  id: string;
  assetId: string; // 关联素材
  startAt: number; // 在时间轴上的起始帧
  duration: number; // 持续帧数
  offset: number; // 素材内部起始偏移帧
  properties: {
    volume?: number;
    opacity?: number;
    transform?: Transform;
    text?: string; // 字幕内容
  };
}
```

## 5. AI 工作流设计

1.  **Prompt 输入**: 用户输入 "制作一段 30 秒的 iPhone 15 评测视频，风格科技感"。
2.  **Scene Planning**: LLM 输出分镜脚本 (Script) 和所需素材描述。
3.  **Asset Matching**: 系统在素材库中检索或提示用户上传对应素材。
4.  **Timeline Generation**: 将匹配好的素材映射为 `TimelineProject` JSON 结构。
5.  **User Edit**: 用户在界面加载该 JSON，进行人工微调。

## 6. 下一步计划

1.  初始化项目仓库 (Monorepo: Frontend + Backend)。
2.  搭建本地 FFmpeg 渲染微服务原型。
3.  实现基础的时间轴前端渲染 POC。
