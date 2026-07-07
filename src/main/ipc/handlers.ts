import { ipcMain } from 'electron';
import { HermesEngine } from '../../engine/index';
import { QClawCompatibilityLayer } from '../../engine/compatibility/qclaw-adapter';

let engine: HermesEngine | null = null;

export function initIpcHandlers() {
  engine = new HermesEngine();
  engine.initialize();

  // 发送消息给当前 Agent
  ipcMain.handle('agent:message', async (_e, text: string) => {
    if (!engine) return { error: 'engine not ready' };
    engine.catState = 'listening';
    engine.notifyCatState('listening');

    try {
      const response = await engine.handleMessage(text);
      engine.catState = 'idle';
      engine.notifyCatState('idle');
      return response;
    } catch (err) {
      engine.catState = 'error';
      engine.notifyCatState('error');
      return { error: String(err) };
    }
  });

  // 获取 Agent 列表
  ipcMain.handle('agent:list', async () => {
    const compat = new QClawCompatibilityLayer();
    return await compat.scanAgents();
  });

  // 获取 Agent 状态
  ipcMain.handle('agent:status', async (_e, id: string) => {
    return engine?.getAgentStatus(id) ?? { status: 'unknown' };
  });
}
