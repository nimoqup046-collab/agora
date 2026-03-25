'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, Beaker, Zap, BrainCircuit, Palette, X
} from 'lucide-react';
import { useModeStore, Mode } from '@/src/store/modeStore';
import { cn } from '@/src/lib/utils';
import { useRef } from 'react';

interface ModeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSecretTrigger?: () => void;
}

const modes = [
  { id: 'programming', name: '编程模式', icon: Code2, color: 'blue', description: '像素代码与蜂群协作' },
  { id: 'research', name: '科研模式', icon: Beaker, color: 'purple', description: '科学议事厅与知识球体' },
  { id: 'reasoning', name: '推理模式', icon: BrainCircuit, color: 'cyan', description: '逻辑链与并行辩论' },
  { id: 'evolution', name: 'AGI自进化', icon: Zap, color: 'amber', description: 'DNA螺旋与性能基准' },
  { id: 'creation', name: '创作模式', icon: Palette, color: 'orange', description: '实时渲染与迭代历史' },
] as const;

export default function ModeSelector({ isOpen, onClose, onSecretTrigger }: ModeSelectorProps) {
  const { currentMode, setMode } = useModeStore();
  const pressTimer = useRef<NodeJS.Timeout | null>(null);

  const startLongPress = () => {
    pressTimer.current = setTimeout(() => {
      if (onSecretTrigger) onSecretTrigger();
    }, 2000);
  };

  const cancelLongPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={startLongPress}
          onMouseUp={cancelLongPress}
          onMouseLeave={cancelLongPress}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-8"
        >
          {/* 背景粒子效果 (模拟) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * window.innerWidth, 
                  y: Math.random() * window.innerHeight,
                  opacity: Math.random() * 0.5
                }}
                animate={{ 
                  y: [null, Math.random() * -100],
                  opacity: [null, 0]
                }}
                transition={{ 
                  duration: Math.random() * 5 + 5, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="absolute w-1 h-1 bg-blue-500/30 rounded-full"
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </motion.button>

          <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative z-10">
            {modes.map((mode, index) => (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                onClick={() => {
                  setMode(mode.id as Mode);
                  onClose();
                }}
                className={cn(
                  "group relative aspect-[4/5] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[40px] p-8 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-white/30",
                  currentMode === mode.id && "border-white/40 bg-white/10 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                )}
              >
                <div className={cn(
                  "w-20 h-20 rounded-3xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-2xl",
                  mode.color === 'blue' && "bg-blue-500/20 text-blue-400 shadow-blue-500/20",
                  mode.color === 'purple' && "bg-purple-500/20 text-purple-400 shadow-purple-500/20",
                  mode.color === 'cyan' && "bg-cyan-500/20 text-cyan-400 shadow-cyan-500/20",
                  mode.color === 'amber' && "bg-amber-500/20 text-amber-400 shadow-amber-500/20",
                  mode.color === 'orange' && "bg-orange-500/20 text-orange-400 shadow-orange-500/20"
                )}>
                  <mode.icon className="w-10 h-10" />
                </div>
                
                <h3 className="font-mono text-xl font-bold mb-3 tracking-tight">{mode.name}</h3>
                <p className="text-xs text-zinc-500 text-center leading-relaxed font-mono uppercase tracking-wider px-4">
                  {mode.description}
                </p>

                {/* 悬浮光效 */}
                <div className={cn(
                  "absolute inset-0 rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none blur-3xl -z-10",
                  mode.color === 'blue' && "bg-blue-500/10",
                  mode.color === 'purple' && "bg-purple-500/10",
                  mode.color === 'cyan' && "bg-cyan-500/10",
                  mode.color === 'amber' && "bg-amber-500/10",
                  mode.color === 'orange' && "bg-orange-500/10"
                )} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
