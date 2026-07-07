import { QClawCompatibilityLayer } from './compatibility/qclaw-adapter';
import { PiAgentInstance } from './pi-runtime/agent-instance';
import { AgentRegistry, AgentRecord } from './hermes-core/registry';
import { TaskScheduler } from './hermes-core/scheduler';
import { ContextManager } from './hermes-core/context';
import { ToolLoader } from './hermes-core/tools/loader';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

export type CatState = 'idle' | 'listening' | 'thinking' | 'confirming' | 'working' | 'done' | 'error' | 'evolving';

export class HermesEngine {
  registry: AgentRegistry;
  scheduler: TaskScheduler;
  contextManager: ContextManager;
  toolLoader: ToolLoader;
  compatibility: QClawCompatibilityLayer;
  catState: CatState = 'idle';
  private currentAgent: PiAgentInstance | null = null;
  private agentPool: Map<string, PiAgentInstance> = new Map();
  private catStateCallbacks: ((state: CatState) => void)[] = [];

  constructor() {
    this.registry = new AgentRegistry();
    this.scheduler = new TaskScheduler(this.registry);
    this.contextManager = new ContextManager();
    this.toolLoader = new ToolLoader();
    this.compatibility = new QClawCompatibilityLayer();
  }

  async initialize() {
    // 1. 扫描 QClaw Agent
    const qclawAgents = await this.compatibility.scanAgents();
    for (const a of qclawAgents) {
      this.registry.register({
        id: a.id,
        name: a.name || a.id,
        skills: a.skills || [],
        status: 'idle',
        metadata: { soul: a.soul },
      });
    }

    // 2. 加载工具
    const qclawSkills = await this.compatibility.scanSkills();
    for (const skill of qclawSkills) {
      this.toolLoader.load(skill);
    }

    // 3. 启动默认 Agent
    await this.startDefaultAgent();

    this.catState = 'idle';
    this.notifyCatState('idle');
  }

  private async startDefaultAgent() {
    const config = this.readConfig();
    const agentId = config.defaultAgentId || 'agent-b0093843';
    const agentConfig = await this.compatibility.loadAgentConfig(agentId);

    if (agentConfig) {
      const instance = new PiAgentInstance({
        id: agentId,
        config: {
          ...agentConfig,
          tools: this.toolLoader.getAvailable(),
        },
      });
      this.currentAgent = instance;
      this.agentPool.set(agentId, instance);
      this.registry.updateStatus(agentId, 'idle');
    }
  }

  async handleMessage(text: string): Promise<{ text: string; meta?: any }> {
    if (!this.currentAgent) {
      this.notifyCatState('error');
      return { text: '引擎未就绪' };
    }

    this.notifyCatState('thinking');

    try {
      const result = await this.currentAgent.process({
        message: text,
        context: this.contextManager.getCurrent(),
      });

      this.contextManager.add({ role: 'user', content: text });
      this.contextManager.add({ role: 'agent', content: result.text });

      this.notifyCatState(this.catState === 'thinking' ? 'idle' : this.catState);
      return result;
    } catch (err) {
      this.notifyCatState('error');
      return { text: `处理消息时出错: ${String(err)}` };
    }
  }

  getAgentStatus(id: string): { status: string; load?: number } {
    const record = this.registry.get(id);
    return record ? { status: record.status } : { status: 'unknown' };
  }

  onCatStateChange(cb: (state: CatState) => void) {
    this.catStateCallbacks.push(cb);
  }

  notifyCatState(state: CatState) {
    this.catState = state;
    for (const cb of this.catStateCallbacks) {
      cb(state);
    }
  }

  private readConfig(): { defaultAgentId?: string; qclawPath?: string } {
    const configPath = path.join(process.cwd(), 'config', 'default.json');
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch {
      return {};
    }
  }
}
