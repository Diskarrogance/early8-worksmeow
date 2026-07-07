import { AgentRegistry } from './registry';

interface Task {
  id: string;
  coordinatorId: string;
  subtasks: SubTask[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
}

interface SubTask {
  id: string;
  skill: string;
  prompt: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  assigneeId?: string;
}

export class TaskScheduler {
  private tasks: Map<string, Task> = new Map();
  private registry: AgentRegistry;

  constructor(registry: AgentRegistry) {
    this.registry = registry;
  }

  /**
   * Coordinator 创建一个主任务，自动拆分为子任务并派发
   */
  schedule(coordinatorId: string, taskPrompt: string, subtasks: { skill: string; prompt: string }[]): Task {
    const task: Task = {
      id: crypto.randomUUID(),
      coordinatorId,
      subtasks: subtasks.map(s => ({
        id: crypto.randomUUID(),
        skill: s.skill,
        prompt: s.prompt,
        status: 'pending',
      })),
      status: 'running',
    };

    this.tasks.set(task.id, task);
    this.dispatch(task);
    return task;
  }

  private dispatch(task: Task) {
    for (const sub of task.subtasks) {
      const agent = this.registry.findFreeBySkill(sub.skill);
      if (agent) {
        sub.assigneeId = agent.id;
        sub.status = 'running';
        this.registry.updateStatus(agent.id, 'busy');
        // 实际执行由 Agent 实例完成，此处标记状态
      } else {
        sub.status = 'failed';
        sub.result = { error: `无可用 Agent 处理技能: ${sub.skill}` };
      }
    }

    this.checkCompletion(task);
  }

  onSubtaskComplete(taskId: string, subtaskId: string, result: any) {
    const task = this.tasks.get(taskId);
    if (!task) return;

    const sub = task.subtasks.find(s => s.id === subtaskId);
    if (!sub || !sub.assigneeId) return;

    sub.status = 'completed';
    sub.result = result;
    this.registry.updateStatus(sub.assigneeId, 'idle');

    this.checkCompletion(task);
  }

  private checkCompletion(task: Task) {
    const allDone = task.subtasks.every(s => s.status === 'completed' || s.status === 'failed');
    if (allDone) {
      task.status = task.subtasks.some(s => s.status === 'failed') ? 'failed' : 'completed';
      task.result = {
        subtasks: task.subtasks.map(s => ({
          skill: s.skill,
          status: s.status,
          result: s.result,
        })),
      };
    }
  }

  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }
}
