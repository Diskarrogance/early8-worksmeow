interface ContextEntry {
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp?: number;
}

export class ContextManager {
  private context: ContextEntry[] = [];
  private maxEntries = 100;

  add(entry: ContextEntry) {
    this.context.push({ ...entry, timestamp: Date.now() });
    if (this.context.length > this.maxEntries) {
      this.context = this.context.slice(-this.maxEntries);
    }
  }

  getCurrent(): ContextEntry[] {
    return [...this.context];
  }

  summarize(): string {
    // 简单摘要：取最近 5 条 + 上下文合计
    const recent = this.context.slice(-5);
    return [
      `共 ${this.context.length} 条上下文记录`,
      ...recent.map(e => `[${e.role}] ${e.content.slice(0, 100)}`),
    ].join('\n');
  }
}
