# EarlyEight · 我上早八 🐱

**自进化 Agent 桌面客户端** — 兼容 QClaw 全部 60+ Skill 与 5 个 Agent，零迁移。

> 一生二，二生三，三生万物。
> 早八猫的八卦双鱼脸，陪你从空闲到进化，从思考到完成。

---

## 快速开始

```bash
npm install
npm run dev
```

## 功能预览

- 🐱 **早八猫 Avatar** — 八卦双鱼脸，8 种状态动画（idle/listening/thinking/working/confirming/done/error/evolving）
- 🧠 **PI Agent 引擎** — 极简 Agent 运行时，<1000 tokens 系统提示词，自进化基因
- 🔄 **Hermes 网关** — 消息路由 + Agent 调度 + 上下文管理 + 工具系统
- 🔌 **QClaw 兼容层** — 零迁移，直接读现有 Agent 配置和 Skill
- 🤝 **多 Agent 协同** — Coordinator → Subagent 主从协作 + 接力模式 + 圆桌模式
- 🧩 **Electron 桌面壳** — 托盘常驻 / 透明圆角窗 / 猫耳拖拽

---

## 项目结构

```
early8-agent-desktop/
├── config/                    # 运行时配置
│   └── default.json           #   模型 / 路径 / Agent 默认配置
├── src/
│   ├── engine/                # Agent 引擎（Node.js 子进程）
│   │   ├── index.ts           #   HermesEngine 主入口
│   │   ├── pi-runtime/        #   PI Agent 运行时
│   │   │   └── agent-instance.ts
│   │   ├── hermes-core/       #   Hermes 网关核心
│   │   │   ├── context.ts     #     上下文管理器
│   │   │   ├── registry.ts   #     Agent 注册中心
│   │   │   └── scheduler.ts  #     多 Agent 调度器
│   │   └── compatibility/    #   兼容层
│   │       └── qclaw-adapter.ts  # QClaw 资产扫描/加载
│   ├── main/                  # Electron 主进程
│   │   ├── index.ts           #   窗口 / 托盘 / IPC
│   │   ├── preload.ts         #   contextBridge 暴露 API
│   │   └── ipc/
│   │       └── handlers.ts    #   IPC handler 注册
│   └── renderer/              # React 渲染进程
│       ├── index.html         #   入口 HTML
│       ├── main.tsx           #   React 挂载点
│       ├── App.tsx            #   主组件（猫头 + 聊天 + 输入）
│       ├── stores/            #   状态管理（Zustand）
│       │   └── agentStore.ts
│       ├── styles/
│       │   └── global.css     #   Tailwind + 猫主题
│       └── types/
│           └── cat.ts         #   猫状态类型定义
├── docs/                      # 开发文档
│   ├── architecture/
│   │   ├── overview.md        #   架构总览
│   │   ├── qclaw-compatibility.md # QClaw 兼容方案
│   │   ├── multi-agent.md     #   多 Agent 调度设计
│   │   └── self-evolution.md  #   自进化机制
│   └── development/
│       ├── getting-started.md #   开发环境搭建
│       └── codebase-map.md    #   代码地图
├── resources/                 # 图标 / 资源
│   └── icons/
├── package.json
├── tsconfig.json              # Renderer TS 配置
├── tsconfig.main.json         # Main/Engine TS 配置
└── vite.config.ts             # Vite 构建配置
```

---

## 技术栈

| 层 | 技术 | 用途 |
|---|---|---|
| 桌面壳 | **Electron 34** | 窗口 + 托盘 + IPC |
| 渲染层 | **React 19** | UI 组件 |
| UI 库 | **Tailwind 4** | CSS 样式 |
| 动画 | **Framer Motion 12** | 猫动画 |
| 状态 | **Zustand 5** | 前端状态 |
| 构建 | **Vite 6 + TypeScript 5.7** | 编译打包 |
| Agent 运行时 | **PI Agent Core** | Agent 引擎核心 |
| 记忆系统 | **TencentDB-Agent-Memory** | SQLite + 向量记忆 |
| 兼容目标 | **QClaw v0.2.32.610** | Skill / Agent 零迁移 |

---

## 核心设计原则

1. **零迁移** — 不解构 QClaw 现有文件，直接读取 `~/.qclaw/` 目录
2. **进程隔离** — 每个 Agent 独立子进程，一个挂了不影响其他
3. **自进化安全** — 修改配置文件前自动备份，Shell 执行须手动确认
4. **猫即入口** — 所有交互从早八猫开始，八卦双鱼脸反映一切状态

---

## 许可

MIT
