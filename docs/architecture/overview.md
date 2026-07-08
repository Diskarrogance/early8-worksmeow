# 架构总览

> EarlyEight 基于修正后的两层架构：**PI（Agent 运行时） + Hermes（网关）**。没有第三层。

---

## 架构图

```
┌─────────────────────────────────────────────────────────┐
│                      Electron App                        │
│  ┌──────────────────────────────────────────────────┐    │
│  │              Renderer Process (React)             │    │
│  │  ┌──────┐  ┌──────┐  ┌────────┐  ┌────────┐    │    │
│  │  │猫头UI│  │聊天框│  │Agent面板│  │设置页  │    │    │
│  │  └──────┘  └──────┘  └────────┘  └────────┘    │    │
│  └──────────────┬───────────────────────────────────┘    │
│                 │ Electron IPC (preload.ts)               │
│  ┌──────────────▼───────────────────────────────────┐    │
│  │              Main Process (Node.js)               │    │
│  │  ┌──────────────────────────────────────────┐    │    │
│  │  │     HermesEngine (引擎主入口)              │    │    │
│  │  │  ┌──────────┐ ┌──────────┐ ┌────────┐   │    │    │
│  │  │  │  Context  │ │ Registry │ │Scheduler│   │    │    │
│  │  │  │ Manager   │ │          │ │         │   │    │    │
│  │  │  └──────────┘ └──────────┘ └────────┘   │    │    │
│  │  │  ┌──────────────────────────────────┐   │    │    │
│  │  │  │ QClaw 兼容层 (compatibility/)     │   │    │    │
│  │  │  │  - scanAgents() → ~/.qclaw/agents │   │    │    │
│  │  │  │  - scanSkills() → ~/.qclaw/skills │   │    │    │
│  │  │  │  - loadAgentConfig() → 模型+人设  │   │    │    │
│  │  │  └──────────────────────────────────┘   │    │    │
│  │  └──────────────────────────────────────────┘    │    │
│  │                                                   │    │
│  │  ┌──────────────────────────────────────────┐    │    │
│  │  │   Agent 实例池                           │    │    │
│  │  │   ┌──────────┐ ┌──────────┐             │    │    │
│  │  │   │ PI Agent │ │ PI Agent │ ...          │    │    │
│  │  │   │ 实例 #1  │ │ 实例 #2  │             │    │    │
│  │  │   │ agent-   │ │ 嘎嘎     │             │    │    │
│  │  │   │ b0093843 │ │          │             │    │    │
│  │  │   └──────────┘ └──────────┘             │    │    │
│  │  └──────────────────────────────────────────┘    │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │              LLM API 调用                         │    │
│  │  DeepSeek V4 Flash / Kimi K2.5 (OpenAI 兼容)     │    │
│  └──────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 两层架构

### PI — Agent 运行时（发动机）

极简 Agent 运行时核心，参考 [@earendil-works/pi-agent-core](https://github.com/earendil-works/pi-agent)：
- **系统提示词 < 1000 tokens** — Agent 自身可以修改
- **四大基础工具** read / write / edit / bash
- **自进化基因** — Agent 能读写自身配置文件，热加载生效

PI 不做消息路由、不做会话管理、不做多渠道接入。只做一件事：**跑 Agent**。

### Hermes — 网关（大脑 + 神经系统）

原本是腾讯开源的 TencentDB-Agent-Memory 记忆引擎，在 EarlyEight 中扩展为**完整网关层**：
- **消息路由** — Renderer IPC → 目标 Agent
- **Agent 注册中心** — 扫描并管理多个 Agent 实例
- **多 Agent 调度器** — Coordinator → Subagent 主从 / 接力 / 圆桌
- **上下文管理** — 会话级 Context 记录与摘要
- **工具加载** — 从 QClaw Skill 解析工具并注册
- **猫状态联动** — 所有组件通过 Engine 通知 UI 状态变化

---

## 进程模型

```
┌──────────────────────────────────────────────────┐
│               Electron 主进程                      │
│                                                    │
│  ┌────────────────┐  ┌────────────────────────┐  │
│  │  HermesEngine  │  │  Electron Main Window  │  │
│  │  (Node.js)     │  │  - 窗口 / 托盘管理     │  │
│  │  - Agent 调度  │  │  - IPC Handler 注册    │  │
│  │  - LLM 调用    │  │  - 猫状态推送          │  │
│  │  - 记忆管理    │  │  - 文件操作            │  │
│  └──────┬─────────┘  └────────────────────────┘  │
│         │                                          │
│  ┌──────▼──────────────────────────────────────┐  │
│  │           Agent 子进程池                       │  │
│  │  ┌──────────────┐  ┌──────────────┐        │  │
│  │  │ Agent #1     │  │ Agent #2     │        │  │
│  │  │ (PI 运行时)  │  │ (PI 运行时)  │        │  │
│  │  │ 独立 session │  │ 独立 session │        │  │
│  │  │ Tree 持久化  │  │ Tree 持久化  │        │  │
│  │  └──────────────┘  └──────────────┘        │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

**Key Decision**: MVP 阶段暂不做真正子进程隔离，Engine 跑在主进程内。Agent 实例对象隔离（各自维护 context 栈）。子进程进程隔离在 v2 引入。

---

## 数据流

```
用户输入 (React Input)
  → sendMessage() (Zustand Store)
    → electronAPI.sendMessage() (preload.ts IPC invoke)
      → ipcMain.handle('agent:message') (handlers.ts)
        → HermesEngine.handleMessage()
          → 切换猫状态为 'listening'
          → 查找/创建目标 Agent 实例
          → AgentInstance.process({ message, context })
            → 构造 messages (system + context + user)
            → fetch(LLM API /chat/completions)
            → 返回 agent response
          → 更新上下文 (ContextManager)
          → 切换猫状态为 'idle'
          → 返回 { text, meta }
      → 渲染进程收到 response
      → store 追加 agent 消息
      → UI 自动滚动
```

---

## 状态管理

### 猫状态机

```
idle ─→ listening ─→ thinking ─→ idle
                   ├──→ working ─→ done ─→ idle
                   ├──→ error ──→ idle
                   └──→ evolving ──→ idle
                          (自进化中)
```

状态通过 `HermesEngine.notifyCatState()` 广播，IPC 推送到渲染进程，Zustand store 更新，React 组件响应式重渲染。

### 8 种状态

| 状态 | 描述 | 猫表情 |
|------|------|--------|
| idle | 空闲 | 眯眼打盹 |
| listening | 听用户说话 | 竖起耳朵 |
| thinking | 想问题 | 歪头 |
| working | 干活（工具调用） | 小爪敲键盘 |
| confirming | 等你确认（敏感操作） | 歪头看你 |
| done | 完成 | 伸懒腰 |
| error | 出错 | 炸毛 |
| evolving | 自进化 | 眼睛发光 |
