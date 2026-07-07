import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentStore } from '../../stores/agentStore';

export default function Chat() {
  const { messages, catState } = useAgentStore();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={listRef} className="h-full overflow-y-auto px-4 py-2 space-y-3">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full opacity-30 text-sm"
             style={{ color: 'var(--cat-text)' }}>
          <p>🐱 早八猫在线</p>
          <p className="mt-1">有啥要帮忙的吗</p>
        </div>
      )}

      <AnimatePresence>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative flex"
          >
            <div className={`message-bubble ${msg.role}`}
                 style={{ whiteSpace: 'pre-wrap' }}>
              {msg.content}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 思考中占位 */}
      {catState === 'thinking' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start"
        >
          <div className="message-bubble agent flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </motion.div>
      )}
    </div>
  );
}
