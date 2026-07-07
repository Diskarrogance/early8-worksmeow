import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  location: string;
}

export class ToolLoader {
  private tools: Map<string, any> = new Map();

  load(skillDef: SkillDefinition) {
    this.tools.set(skillDef.id, {
      name: skillDef.name,
      description: skillDef.description,
      location: skillDef.location,
      loaded: true,
    });
  }

  getAvailable(): any[] {
    return Array.from(this.tools.values());
  }

  get(id: string): any | undefined {
    return this.tools.get(id);
  }
}

export interface SkillInfo {
  id: string;
  name: string;
  description: string;
  location: string;
  category?: string;
}
