import { create } from 'zustand';
import type { CatState } from '../types/cat';

interface AgentInfo {
  id: string;
  name: string;
  status: 'idle' | 'busy' | 'error';
  soul: string;
}

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: number;
}

interface AgentStore {
  // 猫状态
  catState: CatState;
  setCatState: (state: CatState) => void;

  // 消息列表
  messages: Message[];
  sendMessage: (text: string) => void;

  // Agent 列表
  agents: AgentInfo[];
  loadAgents: () => void;

  // 当前 Agent
  currentAgentId: string;
  setCurrentAgent: (id: string) => void;

  // 面板控制
  showPanel: boolean;
  togglePanel: () => void;
  showSettings: boolean;
  toggleSettings: () => void;

  // 输入区
  isRecording: boolean;
  setRecording: (v: boolean) => void;
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  // 猫状态
  catState: 'idle',
  setCatState: (state) => set({ catState: state }),

  // 消息
  messages: [],
  sendMessage: async (text) => {
    const msg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    set((s) => ({ messages: [...s.messages, msg], catState: 'listening' }));

    try {
      const api = (window as any).electronAPI;
      if (api?.sendMessage) {
        const res = await api.sendMessage(text);
        set((s) => ({
          messages: [
            ...s.messages,
            { id: crypto.randomUUID(), role: 'agent', content: res.text ?? JSON.stringify(res), timestamp: Date.now() },
          ],
          catState: 'idle',
        }));
      } else {
        // 降级：没有 electronAPI（浏览器开发模式）
        setTimeout(() => {
          set((s) => ({
            messages: [
              ...s.messages,
              { id: crypto.randomUUID(), role: 'agent', content: `🐱 收到："${text}"`, timestamp: Date.now() },
            ],
            catState: 'idle',
          }));
        }, 800);
      }
    } catch {
      set({ catState: 'error' });
    }
  },

  // Agent 列表
  agents: [],
  loadAgents: async () => {
    try {
      const api = (window as any).electronAPI;
      if (api?.getAgents) {
        const agents = await api.getAgents();
        set({ agents });
      }
    } catch {}
  },

  // 当前 Agent
  currentAgentId: 'default',
  setCurrentAgent: (id) => set({ currentAgentId: id }),

  // 面板
  showPanel: false,
  togglePanel: () => set((s) => ({ showPanel: !s.showPanel })),
  showSettings: false,
  toggleSettings: () => set((s) => ({ showSettings: !s.showSettings })),

  // 输入
  isRecording: false,
  setRecording: (v) => set({ isRecording: v }),
}));
