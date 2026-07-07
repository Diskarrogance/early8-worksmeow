import React from 'react';
import { useAgentStore } from './stores/agentStore';
import CatHead from './components/CatHead/CatHead';
import Chat from './components/Chat/Chat';
import AgentPanel from './components/AgentPanel/AgentPanel';
import Settings from './components/Settings/Settings';

export default function App() {
  const { showPanel, showSettings } = useAgentStore();

  return (
    <div className="relative w-full h-full flex flex-col"
         style={{ background: 'var(--cat-bg)' }}>
      {/* 猫耳朵拖拽区域 */}
      <div data-drag-region className="h-10 flex items-center justify-center shrink-0">
        <CatHead />
      </div>

      {/* 聊天区 */}
      <div className="flex-1 overflow-hidden">
        <Chat />
      </div>

      {/* 底部输入区 */}
      <div className="shrink-0 px-4 pb-4 pt-2"
           style={{ background: 'var(--cat-bg-light)' }}>
        <ChatInput />
      </div>

      {/* 侧边面板 */}
      {showPanel && <AgentPanel />}
      {showSettings && <Settings />}
    </div>
  );
}

function ChatInput() {
  const [text, setText] = React.useState('');
  const { sendMessage } = useAgentStore();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setText('');
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSend()}
        placeholder="跟早八猫说说..."
        className="flex-1 rounded-2xl px-4 py-2.5 text-sm outline-none"
        style={{
          background: 'rgba(255,255,255,0.06)',
          color: 'var(--cat-text)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      />
      <button
        onClick={handleSend}
        disabled={!text.trim()}
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 disabled:opacity-30"
        style={{
          background: text.trim() ? 'var(--cat-primary)' : 'rgba(255,255,255,0.06)',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <path d="M22 2L11 13" strokeLinecap="round"/>
          <path d="M22 2L15 22L11 13L2 9L22 2Z" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
