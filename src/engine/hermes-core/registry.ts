export class AgentRegistry {
  private agents: Map<string, AgentRecord> = new Map();
  private skillIndex: Map<string, string[]> = new Map(); // skill -> agent ids

  register(record: AgentRecord) {
    this.agents.set(record.id, record);
    // 按技能索引
    for (const skill of record.skills) {
      const existing = this.skillIndex.get(skill) || [];
      existing.push(record.id);
      this.skillIndex.set(skill, existing);
    }
  }

  unregister(id: string) {
    const record = this.agents.get(id);
    if (record) {
      for (const skill of record.skills) {
        const list = this.skillIndex.get(skill) || [];
        this.skillIndex.set(skill, list.filter(a => a !== id));
      }
    }
    this.agents.delete(id);
  }

  findFreeBySkill(skill: string): AgentRecord | null {
    const ids = this.skillIndex.get(skill) || [];
    for (const id of ids) {
      const agent = this.agents.get(id);
      if (agent && agent.status === 'idle') return agent;
    }
    return null;
  }

  get(id: string): AgentRecord | undefined {
    return this.agents.get(id);
  }

  list(): AgentRecord[] {
    return Array.from(this.agents.values());
  }

  updateStatus(id: string, status: AgentRecord['status']) {
    const record = this.agents.get(id);
    if (record) {
      record.status = status;
    }
  }
}

export interface AgentRecord {
  id: string;
  name: string;
  skills: string[];
  status: 'idle' | 'busy' | 'error';
  metadata?: Record<string, any>;
}
