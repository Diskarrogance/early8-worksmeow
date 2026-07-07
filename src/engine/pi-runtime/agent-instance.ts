export interface PiAgentConfig {
  id: string;
  model: string;
  apiKey: string;
  baseUrl: string;
  tools: any[];
  systemPrompt?: string;
  maxTokens?: number;
  reasoning?: boolean;
}

export class PiAgentInstance {
  private config: PiAgentConfig;
  private running = false;
  private context: any[] = [];
  private modelId: string;

  constructor(config: PiAgentConfig) {
    this.config = config;
    this.modelId = config.model;
  }

  async initialize() {
    this.running = true;
    console.log(`[PiAgent] ${this.config.id} 已就绪 (模型: ${this.modelId})`);
  }

  async process(input: { message: string; context?: any[] }): Promise<{ text: string; meta?: any }> {
    if (!this.running) {
      throw new Error('Agent 未初始化');
    }

    this.context = input.context || [];
    this.context.push({ role: 'user', content: input.message });

    // 构造 LLM 请求
    const messages = this.buildMessages();
    const response = await this.callLLM(messages);

    this.context.push({ role: 'assistant', content: response });

    return {
      text: response,
      meta: {
        model: this.modelId,
        tokens: response.length, // 粗略估计
      },
    };
  }

  private buildMessages(): any[] {
    const system = this.config.systemPrompt
      ? { role: 'system', content: this.config.systemPrompt }
      : null;

    return [
      ...(system ? [system] : []),
      ...this.context.map(c => ({
        role: c.role,
        content: c.content,
      })),
    ];
  }

  private async callLLM(messages: any[]): Promise<string> {
    const { baseUrl, apiKey } = this.config;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: this.modelId,
        messages,
        max_tokens: this.config.maxTokens ?? 4096,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      throw new Error(`LLM 调用失败 (${response.status}): ${errBody}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? '';
  }

  async shutdown() {
    this.running = false;
    console.log(`[PiAgent] ${this.config.id} 已关闭`);
  }
}
