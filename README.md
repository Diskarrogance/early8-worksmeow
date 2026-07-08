# 早八 WorksMeow 🐱

> 早八跟他的小伙伴们来帮你干活，挣猫粮。

---

## 一句话

桌面 Agent 客户端。基于 Electron，跑 PI Agent 引擎 + Hermes 网关，直接读你 `~/.qclaw/` 里的 Agent 和 Skill，不用迁移不用改。多 Agent 协同、自进化、早八猫 UI，都给你整到位。

---

## 30 秒快速开始

```bash
git clone https://github.com/Diskarrogance/early8-worksmeow.git
cd early8-worksmeow
npm install
npm run dev
# 另一个终端
npx electron .
```

---

## 核心功能

| 功能 | 说明 |
|------|------|
| QClaw 兼容 | 直接读 `~/.qclaw/`，现有 Agent / Skill 零迁移 |
| 多 Agent | 主从 / 接力 / 圆桌三种协作模式 |
| PI 引擎 | 极简 Agent 运行时，自进化（能改自身配置） |
| 早八猫 | 八卦双鱼脸，8 种状态反映一切（idle→thinking→done→error） |
| Electron 桌面 | 托盘常驻、透明圆角、猫耳拖拽 |
| 记忆 | SQLite + 向量记忆（TencentDB-Agent-Memory） |

---

## 项目结构

```
early8-worksmeow/
├── config/                 运行时配置
├── src/
│   ├── engine/             引擎（PI Agent + Hermes 网关）
│   ├── main/               Electron 主进程
│   └── renderer/           React 渲染进程
├── docs/                   开发文档
│   ├── architecture/       架构图 / 兼容 / 多Agent / 自进化
│   └── development/        环境搭建 / 代码地图
└── package.json
```

---

## 当前状态

- ✅ 项目脚手架搭建完成
- ✅ PI Agent 运行时（调用 DeepSeek / Kimi API）
- ✅ Hermes 网关（注册中心 / 上下文 / 调度器）
- ✅ QClaw 兼容层（Agent / Skill 扫描与配置读取）
- ✅ Electron 壳（窗口 + 托盘 + IPC）
- ✅ React UI（猫头 + 聊天 + 输入框）
- ⏳ 早八猫 SVG 动画（占位中）
- ⏳ 子进程隔离（v2）
- ⏳ Skill 容器化执行（v2）

---

## 参考

- [PI Agent](https://github.com/earendil-works/pi-agent) — Agent 运行时核心
- [TencentDB-Agent-Memory](https://github.com/Tencent/tencentdb-agent-memory) — 记忆引擎
- [QClaw](https://qclaw.ai) — 上游兼容目标

---

> 有问题？看 `docs/` 或直接开 issue。
