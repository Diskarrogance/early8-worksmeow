# 多 Agent 调度设计

> EarlyEight 支持三种 Agent 协作模式：**主从（Coordinator → Subagent）**、**接力**、**圆桌讨论**。
> MVP 阶段仅实现主从模式，后两种在 v2。

---

## 架构

```
                    ┌──────────────────────────┐
                    │     Hermes Scheduler      │
                    │  (TaskScheduler)          │
                    │  - 任务拆分               │
                    │  - Agent 发现             │
                    │  - 派发 / 状态跟踪        │
                    └──────────┬───────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
   │ Coordinator  │   │   Agent #1   │   │   Agent #2   │
   │ (调度 Agent) │   │ (Subagent)   │   │ (Subagent)   │
   │ 主 Agent     │   │              │   │              │
   └──────────────┘   └──────────────┘   └──────────────┘
```

---

## 模式一：Coordinator → Subagent（主从协作）

**MVP 实现。** 主 Agent 接收任务 → 拆分子任务 → 调度空闲 Agent 执行。

### 流程

```
用户: "做一套电商海报"
Coordinator (主 Agent):
  1. 分析需求 → 拆解为子任务
  2. 调用 scheduler.schedule() 注册任务
  3. Scheduler 扫描 AgentRegistry → 找可用 Agent
  4. 派发每个子任务到匹配的 Agent
  5. 汇总结果
  6. 返回用户
```

### Scheduler 核心逻辑

```typescript
schedule(coordinatorId, taskPrompt, subtasks):
  task = new Task(id, coordinatorId, subtasks)
  每个 subtask:
    agent = registry.findFreeBySkill(sub.skill)
    if agent → assign, set busy
    else → failed (无可用 Agent)
  checkCompletion(task)

onSubtaskComplete(taskId, subtaskId, result):
  sub.status = completed
  agent.status = idle
  checkCompletion(task)

checkCompletion(task):
  if all done → task.status = completed | failed
```

### Agent 注册中心

```typescript
AgentRegistry
  register(record)    → 注册 Agent，建技能索引
  unregister(id)     → 注销
  findFreeBySkill(s) → 按技能找空闲 Agent
  get(id)            → 查单个
  list()             → 列表
  updateStatus(id)   → 更新状态
```

**技能匹配逻辑**：Agent 注册时声明 skills[]，Scheduler 按 skill 精确匹配。无 perfect match 时 coordinator 自行处理。

---

## 模式二：接力协作（v2）

Agent A → 处理第一步 → 传给 Agent B → 处理第二步 → ...

```
用户: "写一篇技术文章"
Agent1 (Writer):  写初稿
Agent2 (Reviewer): 审阅 + 批注
Agent3 (Editor):  根据批注修改
Agent1 (Writer):  终稿
```

实现关键：每个接力节点共享上下文快照，而不是完整会话。

---

## 模式三：圆桌讨论（v2）

多个 Agent 同时收到一段输入，各自独立分析 → 结果汇总到 Coordinator 综合。

```
用户: "这个方案有什么问题？"
Agent1 (架构):  "扩展性方面..."
Agent2 (安全):  "认证方面..."
Agent3 (性能):  "数据库方面..."
Coordinator:    综合三份意见给出建议
```

实现关键：并发调用、结果归并、冲突处理。

---

## MVP 多 Agent 限制

当前实现 (v0.1) 所有 Agent 实例**运行在同一进程中**，通过对象隔离。

| 能力 | MVP | v2 |
|------|-----|-----|
| Agent 实例隔离 | 对象级（共享 event loop） | 子进程级 |
| 子任务数 | 单次 ≤ 10 | 不限 |
| 并发执行 | 串行（同一 event loop） | 并行子进程 |
| 技能自动匹配 | 精确匹配 | 模糊匹配 + 降级 |
| 新 Agent 热注册 | 重启 Engine | 热加载 |

---

## 配置示例

```json
{
  "agents": {
    "coordinator": {
      "id": "agent-b0093843",
      "type": "coordinator",
      "skills": ["scheduler"]
    },
    "worker": {
      "id": "嘎嘎",
      "type": "subagent",
      "skills": ["ecommerce-detail-image", "ecommerce-copywriter"]
    }
  }
}
```
