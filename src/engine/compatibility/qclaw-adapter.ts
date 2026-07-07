import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

interface AgentInfo {
  id: string;
  name: string;
  soul: string;
  skills: string[];
  model?: string;
}

interface SkillInfo {
  id: string;
  name: string;
  description: string;
  location: string;
  category?: string;
}

/**
 * QClaw 兼容层：读取现有 ~/.qclaw 目录结构
 */
export class QClawCompatibilityLayer {
  private qclawPath: string;

  constructor() {
    // 默认 ~/.qclaw
    this.qclawPath = path.join(os.homedir(), '.qclaw');
    // 允许环境变量覆盖
    if (process.env.QCLAW_PATH) {
      this.qclawPath = process.env.QCLAW_PATH;
    }
  }

  setQClawPath(p: string) {
    this.qclawPath = p;
  }

  /**
   * 扫描 ~/.qclaw/agents/ 下的所有 Agent
   */
  async scanAgents(): Promise<AgentInfo[]> {
    const agentsDir = path.join(this.qclawPath, 'agents');
    if (!fs.existsSync(agentsDir)) {
      console.warn(`[QClawCompatibility] agents 目录不存在: ${agentsDir}`);
      return [];
    }

    const entries = fs.readdirSync(agentsDir, { withFileTypes: true });
    const agents: AgentInfo[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const agentId = entry.name;
      const agentDir = path.join(agentsDir, agentId);

      // 读取人设文件
      const workspaceDir = path.join(agentDir, 'workspace');
      let soul = '';
      const soulPath = path.join(workspaceDir, 'SOUL.md');
      if (fs.existsSync(soulPath)) {
        soul = fs.readFileSync(soulPath, 'utf-8');
      }

      // 读取模型配置
      const modelConfigPath = path.join(agentDir, 'agent', 'models.json');
      let model: string | undefined;
      if (fs.existsSync(modelConfigPath)) {
        try {
          const config = JSON.parse(fs.readFileSync(modelConfigPath, 'utf-8'));
          model = config.model || config.defaultModel;
        } catch {}
      }

      agents.push({
        id: agentId,
        name: agentId,  // QClaw Agent 名字通常就是 id
        soul: soul.slice(0, 200),
        skills: [],
        model,
      });
    }

    return agents;
  }

  /**
   * 扫描 ~/.qclaw/skills/ 下的所有 Skill
   */
  async scanSkills(): Promise<SkillInfo[]> {
    const skillsDir = path.join(this.qclawPath, 'skills');
    if (!fs.existsSync(skillsDir)) {
      console.warn(`[QClawCompatibility] skills 目录不存在: ${skillsDir}`);
      return [];
    }

    const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
    const skills: SkillInfo[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const skillDir = path.join(skillsDir, entry.name);

      // 读 skill.json
      const skillJsonPath = path.join(skillDir, 'skill.json');
      if (fs.existsSync(skillJsonPath)) {
        try {
          const skillDef = JSON.parse(fs.readFileSync(skillJsonPath, 'utf-8'));
          skills.push({
            id: entry.name,
            name: skillDef.name || entry.name,
            description: skillDef.description || '',
            location: skillDir,
            category: skillDef.category,
          });
        } catch {
          // skill.json 解析失败，用目录名
          skills.push({
            id: entry.name,
            name: entry.name,
            description: '',
            location: skillDir,
          });
        }
      } else {
        // 没有 skill.json，读 SKILL.md 第一行当描述
        const skillMdPath = path.join(skillDir, 'SKILL.md');
        let description = '';
        if (fs.existsSync(skillMdPath)) {
          const lines = fs.readFileSync(skillMdPath, 'utf-8').split('\n');
          description = lines[0] || '';
        }
        skills.push({
          id: entry.name,
          name: entry.name,
          description: description.slice(0, 100),
          location: skillDir,
        });
      }
    }

    return skills;
  }

  /**
   * 加载指定 Agent 的配置（模型 + 人设）
   */
  async loadAgentConfig(agentId: string): Promise<{
    id: string;
    model: string;
    apiKey: string;
    baseUrl: string;
    systemPrompt: string;
    maxTokens?: number;
    reasoning?: boolean;
  } | null> {
    const agentDir = path.join(this.qclawPath, 'agents', agentId);
    if (!fs.existsSync(agentDir)) return null;

    // 读 models.json
    const modelConfigPath = path.join(agentDir, 'agent', 'models.json');
    let model = 'deepseek-v4-flash';
    let apiKey = '';
    let baseUrl = 'https://api.deepseek.com';
    let reasoning = false;

    if (fs.existsSync(modelConfigPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(modelConfigPath, 'utf-8'));
        // QClaw 的 models.json 结构多是嵌套的 provider.models[]
        const provider = config.providers?.deepseek || config.models?.deepseek;
        if (provider) {
          baseUrl = provider.baseUrl || baseUrl;
          apiKey = provider.apiKey || apiKey;
          model = provider.models?.[0]?.id || model;
          reasoning = provider.models?.[0]?.reasoning || false;
        }
        // 也可能有全局配置
        if (config.apiKey) apiKey = config.apiKey;
        if (config.defaultModel) model = config.defaultModel;
      } catch {}
    }

    // 读人设文件
    const workspaceDir = path.join(agentDir, 'workspace');
    let soulPath = path.join(workspaceDir, 'SOUL.md');
    let systemPrompt = '你是一个 AI 助手。';
    if (fs.existsSync(soulPath)) {
      systemPrompt = fs.readFileSync(soulPath, 'utf-8');
    }

    // 补充 MEMORY.md
    const memoryPath = path.join(workspaceDir, 'MEMORY.md');
    if (fs.existsSync(memoryPath)) {
      const memory = fs.readFileSync(memoryPath, 'utf-8');
      systemPrompt += '\n\n## 记忆\n' + memory.slice(0, 1000);
    }

    return {
      id: agentId,
      model,
      apiKey,
      baseUrl,
      systemPrompt,
      reasoning,
    };
  }
}
