import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // 窗口控制
  minimize: () => ipcRenderer.send('window:minimize'),
  close: () => ipcRenderer.send('window:close'),
  quit: () => ipcRenderer.send('window:quit'),
  startDrag: () => {
    // 通过 IPC 通知主进程开始拖拽
    ipcRenderer.send('window:drag');
  },

  // Agent IPC
  sendMessage: (text: string) => ipcRenderer.invoke('agent:message', text),
  getAgents: () => ipcRenderer.invoke('agent:list'),
  getAgentStatus: (id: string) => ipcRenderer.invoke('agent:status', id),

  // 事件监听
  onAgentResponse: (callback: (data: unknown) => void) => {
    ipcRenderer.on('agent:response', (_e, data) => callback(data));
  },
  onAgentStatusChange: (callback: (data: unknown) => void) => {
    ipcRenderer.on('agent:status-change', (_e, data) => callback(data));
  },
  onCatStateChange: (callback: (state: string) => void) => {
    ipcRenderer.on('cat:state-change', (_e, state) => callback(state));
  },
});
