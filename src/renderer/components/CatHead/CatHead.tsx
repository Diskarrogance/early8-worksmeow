import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentStore } from '../../stores/agentStore';
import type { CatState } from '../../types/cat';

// 猫形态映射
const catConfigByState: Record<CatState, {
  ear: string;        // 耳朵位置
  eye: string;        // 眼睛形态
  mouth: string;      // 嘴巴
  tail: string;       // 尾巴
  glow: boolean;      // 发光
  tooltip: string;    // 状态说明
}> = {
  idle: {
    ear: 'normal',
    eye: 'M 12 22 Q 24 16 36 22',     // 眯眼
    mouth: 'M18 32 Q24 30 30 32',      // 微笑
    tail: 'curled',
    glow: false,
    tooltip: '我在~',
  },
  listening: {
    ear: 'alert',
    eye: 'M 12 22 Q 24 14 36 22',      // 睁圆
    mouth: 'M18 32 Q24 30 30 32',
    tail: 'raised',
    glow: false,
    tooltip: '嗯？有问题来~',
  },
  thinking: {
    ear: 'alert',
    eye: 'M 12 22 L 18 28 L 24 22 L 30 28 L 36 22',  // 歪眼
    mouth: 'M18 32 L 30 32',
    tail: 'swishing',
    glow: false,
    tooltip: '让本喵想想...',
  },
  confirming: {
    ear: 'normal',
    eye: 'M 12 22 Q 24 14 36 22',
    mouth: 'M 18 30 Q 24 34 30 30',    // O 型嘴
    tail: 'still',
    glow: false,
    tooltip: '这样可以吗？',
  },
  working: {
    ear: 'normal',
    eye: 'M 12 22 Q 24 14 36 22',
    mouth: 'M18 32 Q24 30 30 32',
    tail: 'typing',
    glow: false,
    tooltip: '干活中别打扰~',
  },
  done: {
    ear: 'normal',
    eye: 'M 12 22 Q 24 16 36 22',
    mouth: 'M18 32 Q24 30 30 32',
    tail: 'stretch',
    glow: true,
    tooltip: '搞定！',
  },
  error: {
    ear: 'flatten',
    eye: 'M 12 26 L 18 20 L 24 26 L 30 20 L 36 26',  // 怒视
    mouth: 'M 18 32 Q 24 34 30 32',
    tail: 'puffed',
    glow: true,
    tooltip: '不好！出问题了...',
  },
  evolving: {
    ear: 'alert',
    eye: '',    // 发光特效
    mouth: '',
    tail: 'glowing',
    glow: true,
    tooltip: '正在升级...',
  },
};

export default function CatHead({ onClick }: { onClick?: () => void }) {
  const { catState } = useAgentStore();
  const config = catConfigByState[catState];
  const [glowIntensity, setGlowIntensity] = React.useState(0);

  // 发光脉冲效果
  React.useEffect(() => {
    if (!config.glow) {
      setGlowIntensity(0);
      return;
    }
    const interval = setInterval(() => {
      setGlowIntensity((p) => (p >= 1 ? 0 : p + 0.1));
    }, 100);
    return () => clearInterval(interval);
  }, [config.glow]);

  const glowOpacity = 0.3 + glowIntensity * 0.4;

  return (
    <div className="relative cursor-pointer" onClick={onClick}>
      <motion.div
        animate={{ scale: catState === 'listening' ? 1.05 : 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="relative"
      >
        <svg width="56" height="48" viewBox="0 0 48 48" className="relative z-10">
          {/* 发光光晕 */}
          {config.glow && (
            <motion.circle
              cx="24" cy="24" r="20"
              fill="none"
              stroke="#f5a623"
              strokeWidth="2"
              opacity={glowOpacity}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}

          {/* 猫头 */}
          <circle cx="24" cy="28" r="18" fill="#f5a623" />

          {/* 耳朵 */}
          {config.ear === 'normal' && (
            <>
              <polygon points="10,12 6,0 16,8" fill="#f5a623" />
              <polygon points="38,12 42,0 32,8" fill="#f5a623" />
              <polygon points="10,12 8,4 14,10" fill="#e8912a" />
              <polygon points="38,12 40,4 34,10" fill="#e8912a" />
            </>
          )}
          {config.ear === 'alert' && (
            <>
              <polygon points="8,8 2,-4 14,4" fill="#f5a623" />
              <polygon points="40,8 46,-4 34,4" fill="#f5a623" />
              <polygon points="8,8 5,0 11,6" fill="#e8912a" />
              <polygon points="40,8 43,0 37,6" fill="#e8912a" />
            </>
          )}
          {config.ear === 'flatten' && (
            <>
              <polygon points="6,16 8,4 16,14" fill="#f5a623" />
              <polygon points="42,16 40,4 32,14" fill="#f5a623" />
              <polygon points="6,16 10,8 14,14" fill="#e8912a" />
              <polygon points="42,16 38,8 34,14" fill="#e8912a" />
            </>
          )}

          {/* 脸部八卦纹样 - 简化版双鱼形 */}
          <circle cx="16" cy="32" r="4" fill="#fce38a" opacity={0.3} />
          <circle cx="32" cy="32" r="4" fill="#fce38a" opacity={0.3} />

          {/* 眼睛 */}
          <AnimatePresence mode="wait">
            {catState === 'evolving' ? (
              <motion.g key="evo-eyes" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <circle cx="17" cy="26" r="5" fill="white" />
                <circle cx="31" cy="26" r="5" fill="white" />
                <circle cx="17" cy="26" r="2.5" fill="#00ffcc" />
                <circle cx="31" cy="26" r="2.5" fill="#00ffcc" />
              </motion.g>
            ) : (
              <motion.g key="normal-eyes" initial={{ scale: 1 }}>
                {config.eye && (
                  <>
                    <circle cx="17" cy="26" r="6" fill="white" />
                    <circle cx="31" cy="26" r="6" fill="white" />
                    <path d={config.eye} fill="#2c1810" />
                  </>
                )}
              </motion.g>
            )}
          </AnimatePresence>

          {/* 鼻子 */}
          <ellipse cx="24" cy="30" rx="2" ry="1.5" fill="#e8912a" />

          {/* 嘴巴 */}
          <path d={config.mouth} fill="none" stroke="#2c1810" strokeWidth="1.5" strokeLinecap="round" />

          {/* 胡须 */}
          <line x1="8" y1="28" x2="0" y2="26" stroke="#2c1810" strokeWidth="0.8" opacity={0.5} />
          <line x1="8" y1="30" x2="0" y2="30" stroke="#2c1810" strokeWidth="0.8" opacity={0.5} />
          <line x1="8" y1="32" x2="0" y2="34" stroke="#2c1810" strokeWidth="0.8" opacity={0.5} />
          <line x1="40" y1="28" x2="48" y2="26" stroke="#2c1810" strokeWidth="0.8" opacity={0.5} />
          <line x1="40" y1="30" x2="48" y2="30" stroke="#2c1810" strokeWidth="0.8" opacity={0.5} />
          <line x1="40" y1="32" x2="48" y2="34" stroke="#2c1810" strokeWidth="0.8" opacity={0.5} />
        </svg>
      </motion.div>
    </div>
  );
}
