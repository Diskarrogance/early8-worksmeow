# EarlyEight · 我上早八 🐱

**自进化 Agent 桌面客户端** — 兼容 QClaw 全部 Skill 与 Agent，零迁移。

> 一生二，二生三，三生万物。
> 早八猫的八卦双鱼脸，陪你从空闲到进化，从思考到完成。

---

## 快速开始

```bash
git clone https://github.com/Diskarrogance/early8-worksmeow.git
cd early8-worksmeow
npm install
```

## 功能预览

- 🐱 **早八猫 Avatar** — 八卦双鱼脸，8 种状态动画
- 🧠 **PI Agent 引擎** — 极简 Agent 运行时，自进化基因
- 🔄 **Hermes 网关** — 消息路由 + Agent 调度 + 上下文管理
- 🔌 **QClaw 兼容层** — 零迁移，直接读现有配置
- 🤝 **多 Agent 协同** — 主从 / 接力 / 圆桌三种模式
- 🧩 **Electron 桌面壳** — 托盘常驻 / 透明圆角窗 / 猫耳拖拽

---

## 项目结构

```
early8-worksmeow/
├── config/                      运行时配置
├── src/
│   ├── engine/                  Agent 引擎（核心）
│   ├── main/                    Electron 主进程
│   └── renderer/                React 渲染进程
├── docs/                        开发文档
│   ├── architecture/            架构文档
│   └── development/             开发指南
└── package.json
```

---

## 技术栈

| 层 | 技术 |
|---|---|
| 桌面壳 | **Electron 34** |
| 渲染层 | **React 19** |
| UI 库 | **Tailwind 4** |
| 动画 | **Framer Motion 12** |
| 状态 | **Zustand 5** |
| 构建 | **Vite 6 + TypeScript 5.7** |
| Agent 运行时 | **PI Agent Core** |
| 记忆系统 | **TencentDB-Agent-Memory** |
| 兼容目标 | **QClaw v0.2.32.610** |

---

## 核心设计原则

1. **零迁移** — 不解构 QClaw 现有文件，直接读取 `~/.qclaw/`
2. **进程隔离** — 每个 Agent 独立子进程，一个挂了不影响其他
3. **自进化安全** — 修改配置前自动备份，Shell 执行须手动确认
4. **猫即入口** — 所有交互从早八猫开始

---

## 许可

MIT
