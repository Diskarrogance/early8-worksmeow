# 代码地图

> EarlyEight 项目结构导读。按层级从上往下读。

---

## 快速定位

| 你想找什么 | 看这里 |
|-----------|--------|
| 项目入口、启动流程 | `src/main/index.ts` |
| Agent 引擎初始化 | `src/engine/index.ts` |
| Agent 实例如何工作 | `src/engine/pi-runtime/agent-instance.ts` |
| 多 Agent 调度 | `src/engine/hermes-core/scheduler.ts` |
| Agent 注册中心 | `src/engine/hermes-core/registry.ts` |
| 上下文管理 | `src/engine/hermes-core/context.ts` |
| QClaw 兼容层 | `src/engine/compatibility/qclaw-adapter.ts` |
| 渲染进程入口 | `src/renderer/main.tsx` |
| 主 UI 组件 | `src/renderer/App.tsx` |
| 状态管理 | `src/renderer/stores/agentStore.ts` |
| IPC 通信 | `src/main/ipc/handlers.ts` |
| preload 桥接 | `src/main/preload.ts` |
| 猫状态定义 | `src/renderer/types/cat.ts` |
| 主题样式 | `src/renderer/styles/global.css` |
| 运行时配置 | `config/default.json` |
| 构建配置 | `vite.config.ts` / `tsconfig.json` / `tsconfig.main.json` |

---

## 目录结构

```
early8-agent-desktop/
│
├── config/                          ◀── 运行时配置
│   └── default.json                     模型、路径、默认 Agent
│
├── src/                             ◀── 源代码
│   │
│   ├── engine/                      ◀── Agent 引擎（核心）
│   │   ├── index.ts                      HermesEngine 入口类
│   │   │                                 初始化、消息处理、猫状态
│   │   │
│   │   ├── pi-runtime/              ◀── PI Agent 运行时
│   │   │   └── agent-instance.ts         调用 LLM API 的核心逻辑
│   │   │                                 构造 messages、fetch、返回
│   │   │
│   │   ├── hermes-core/             ◀── Hermes 网关核心
│   │   │   ├── context.ts               上下文管理（会话级）
│   │   │   ├── registry.ts              Agent 注册中心
│   │   │   └── scheduler.ts             多 Agent 任务调度
│   │   │
│   │   └── compatibility/           ◀── QClaw 资产兼容层
│   │       └── qclaw-adapter.ts         只读扫描 ~/.qclaw/ 目录
│   │                                     返回 AgentInfo / SkillInfo
│   │
│   ├── main/                        ◀── Electron 主进程
│   │   ├── index.ts                     窗口创建、托盘、全局快捷键
│   │   ├── preload.ts                   contextBridge → window.electronAPI
│   │   └── ipc/
│   │       └── handlers.ts              注册 ipcMain.handle
│   │                                     对接 HermesEngine
│   │
│   └── renderer/                    ◀── React 渲染进程
│       ├── index.html                    HTML 入口
│       ├── main.tsx                      ReactDOM.createRoot
│       ├── App.tsx                       主组件（猫头+聊天+输入）
│       ├── stores/
│       │   └── agentStore.ts             Zustand store
│       ├── styles/
│       │   └── global.css                Tailwind + 猫主题变量
│       └── types/
│           └── cat.ts                    CatState 类型定义
│
├── docs/                            ◀── 开发文档
│   ├── architecture/
│   │   ├── overview.md                   架构总览
│   │   ├── qclaw-compatibility.md        QClaw 兼容方案
│   │   ├── multi-agent.md                多 Agent 调度
│   │   └── self-evolution.md             自进化机制
│   └── development/
│       ├── getting-started.md            环境搭建
│       └── codebase-map.md               代码地图（本文）
│
├── resources/                       ◀── 图标资源
│   └── icons/                            cat-tray.png, icon.ico/icns
│
├── package.json                     ◀── 依赖 + 脚本 + electron-builder 配置
├── tsconfig.json                     ◀── Renderer TS 配置（ESNext, jsx）
├── tsconfig.main.json                ◀── Main/Engine TS 配置（CommonJS）
├── vite.config.ts                    ◀── Vite 构建（React + Tailwind + 别名）
└── .gitignore
```

---

## 数据流依赖

```
用户输入
  → renderer/agentStore.ts (sendMessage)
    → main/preload.ts (electronAPI.sendMessage)
      → main/ipc/handlers.ts (ipcMain.handle agent:message)
        → engine/index.ts (HermesEngine.handleMessage)
          → engine/pi-runtime/agent-instance.ts (process)
            → LLM API (fetch)
          ← agent response
        → engine/hermes-core/context.ts (add)
      ← IPC 返回
    → agentStore.ts (追加消息)
  → UI 渲染
```

---

## 扩展指南

### 添加新 Agent

1. 在 `~/.qclaw/agents/` 下创建目录
2. 放入 `agent/models.json` + `workspace/SOUL.md`
3. 重启 EarlyEight，Engine 自动扫描

### 添加新 Skill（兼容模式）

1. 在 `~/.qclaw/skills/` 下创建目录
2. 放入 `skill.json` + 执行脚本
3. Engine 启动时自动加载元数据

### 添加新 UI 组件

1. `src/renderer/components/` 下创建组件
2. `App.tsx` 引用并在条件式 `{showX && <X />}` 显示
3. 面板控制 state 放在 `agentStore.ts`
