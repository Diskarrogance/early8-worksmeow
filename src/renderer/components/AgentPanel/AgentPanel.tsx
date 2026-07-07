import { motion } from 'framer-motion';
import { useAgentStore } from '../../stores/agentStore';

export default function AgentPanel() {
  const { agents, togglePanel } = useAgentStore();

  return (
    <motion.div
      initial={{ x: 280 }}
      animate={{ x: 0 }}
      exit={{ x: 280 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="absolute right-0 top-0 bottom-0 w-[280px] z-40"
      style={{ background: 'var(--cat-bg-light)', borderLeft: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="p-4">
        {/* 标题 */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium text-sm" style={{ color: 'var(--cat-text)' }}>Agent</span>
          <button onClick={togglePanel} className="text-white/40 hover:text-white/70 text-sm">✕</button>
        </div>

        {/* Agent 列表 */}
        <div className="space-y-2">
          {agents.length === 0 && (
            <p className="text-xs text-white/30 text-center py-4">正在扫描 QClaw Agent...</p>
          )}
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="rounded-xl p-3 flex items-center gap-3"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              {/* 状态点 */}
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{
                  background: agent.status === 'idle' ? '#4ade80'
                    : agent.status === 'busy' ? '#f5a623'
                    : '#ef4444',
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate" style={{ color: 'var(--cat-text)' }}>
                  {agent.name || agent.id}
                </p>
                <p className="text-xs text-white/30 truncate">
                  人设: {agent.soul ? agent.soul.split('\n')[0].slice(0, 20) : '无'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
