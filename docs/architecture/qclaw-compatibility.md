# QClaw 兼容方案

> 核心原则：**零迁移、零解构、零复制**。EarlyEight 直接读 `~/.qclaw/` 目录，不动任何现有文件。

---

## 现有资产

| 资产 | 位置 | 数量 |
|------|------|------|
| Agent 配置 | `~/.qclaw/agents/*/agent/models.json` | 5 个 Agent |
| Agent 人设 | `~/.qclaw/agents/*/workspace/{SOUL.md, MEMORY.md, IDENTITY.md}` | 每个 Agent 一套 |
| Skill 定义 | `~/.qclaw/skills/*/skill.json` | 60+ Skill |
| Skill 执行逻辑 | `~/.qclaw/skills/*/src/` | 按 Skill 不同 |
| 模型配置 | `~/.qclaw/modelroute/` | 路由 / 负载均衡 |

---

## 兼容层设计

### QClawCompatibilityLayer (<code>src/engine/compatibility/qclaw-adapter.ts</code>)

```
QClawCompatibilityLayer
  ├── scanAgents()        → AgentInfo[]
  ├── scanSkills()        → SkillInfo[]
  ├── loadAgentConfig(id) → PiAgentConfig | null
  └── setQClawPath(p)     → void (env: QCLAW_PATH)
```

### scanAgents() — 扫描 Agent

读取 `~/.qclaw/agents/` 下每个目录：

1. 读取 `{agentId}/workspace/SOUL.md` → 提取人设（前 200 字符为摘要）
2. 读取 `{agentId}/agent/models.json` → 提取模型配置
3. 组装为 `AgentInfo` 返回

### scanSkills() — 扫描 Skill

读取 `~/.qclaw/skills/` 下每个目录：

1. 优先读 `skill.json`（结构化定义）
2. 不存在则读 `SKILL.md` 第一行当描述
3. 组装为 `SkillInfo` 返回

### loadAgentConfig() — 加载 Agent 配置

1. 读 `models.json` → 提取 `provider[].baseUrl` / `apiKey` / `model`
2. 读 `SOUL.md` → `systemPrompt`
3. 读 `MEMORY.md` → 追加到 systemPrompt（前 1000 字符）
4. 返回 `PiAgentConfig`（可直接传给 `PiAgentInstance`）

---

## models.json 映射

QClaw 的 models.json 结构（典型）：

```json
{
  "providers": {
    "deepseek": {
      "baseUrl": "https://api.deepseek.com/",
      "apiKey": "sk-xxx",
      "models": [{ "id": "deepseek-v4-flash", "reasoning": true }]
    }
  }
}
```

映射为 EarlyEight 的 AgentConfig：

```json
{
  "id": "agent-b0093843",
  "model": "deepseek-v4-flash",
  "apiKey": "sk-xxx",
  "baseUrl": "https://api.deepseek.com/",
  "systemPrompt": "你是一个...\n\n## 记忆\n...",
  "reasoning": true
}
```

---

## 兼容边界

### 当前版本 (MVP)

- ✅ Agent 配置读取（模型、人设、记忆）
- ✅ Skill 元数据读取（名称、描述、路径）
- ❌ Skill 实际执行（需要 Skill 容器运行时，v2）
- ❌ LCM 上下文压缩（Hermes 原生实现）
- ❌ 多渠道接入（飞书/企微等，v2）
- ❌ 定时任务 / Webhook（v2）

### 迁移零成本原理

EarlyEight 从未写过 `~/.qclaw/` 目录下的任何文件。所有操作都是**只读扫描**。Agent 的原始配置和环境完全不受影响。

唯一的改动点是：用户在 EarlyEight 中切换 Agent 时，Engine 从原始路径读取配置来**创建新的内存实例**，原始配置不被修改。

---

## 后续：Skill 容器化

v2 中将为 Skill 建立沙箱容器：

```
SkillContainer
  ├── 解析 skill.json → 工具定义
  ├── 加载 SKILL.md → 指令注入 PI 提示词
  ├── 执行入口 → 调用脚本（Python/Node/Shell）
  └── 沙箱 → 受限文件 + 网络 + API 访问
```

容器化后，60+ Skill 无需任何修改即可在 EarlyEight 中执行。
