'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Code2, Beaker, Zap, BrainCircuit, Palette } from 'lucide-react';
import { useRef } from 'react';
import { useModeStore, type Mode } from '@/store/modeStore';
import { cn } from '@/lib/utils';

interface ModeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSecretTrigger?: () => void;
}

const modes = [
  { id: 'programming', name: '编程', subtitle: '代码竞技场与蜂群协作', icon: Code2, color: 'blue' },
  { id: 'research', name: '科研', subtitle: '科学议事厅与知识球体', icon: Beaker, color: 'purple' },
  { id: 'reasoning', name: '推理', subtitle: '逻辑链与并行辩论', icon: BrainCircuit, color: 'cyan' },
  { id: 'evolution', name: '进化', subtitle: 'AGI 自进化与基准监控', icon: Zap, color: 'amber' },
  { id: 'creation', name: '创作', subtitle: '实时渲染与内容合成', icon: Palette, color: 'orange' },
] as const;

function colorClass(color: string) {
  if (color === 'blue') return 'border-blue-400/35 bg-blue-500/10 text-blue-300 shadow-[0_0_32px_rgba(59,130,246,0.2)]';
  if (color === 'purple') return 'border-purple-400/35 bg-purple-500/10 text-purple-300 shadow-[0_0_32px_rgba(168,85,247,0.2)]';
  if (color === 'cyan') return 'border-cyan-400/35 bg-cyan-500/10 text-cyan-300 shadow-[0_0_32px_rgba(34,211,238,0.2)]';
  if (color === 'amber') return 'border-amber-400/35 bg-amber-500/10 text-amber-300 shadow-[0_0_32px_rgba(251,191,36,0.2)]';
  return 'border-orange-400/35 bg-orange-500/10 text-orange-300 shadow-[0_0_32px_rgba(249,115,22,0.2)]';
}

export default function ModeSelector({ isOpen, onClose, onSecretTrigger }: ModeSelectorProps) {
  const { currentMode, setMode } = useModeStore();
  const longPressRef = useRef<NodeJS.Timeout | null>(null);

  const startLongPress = () => {
    if (!onSecretTrigger) return;
    longPressRef.current = setTimeout(() => {
      onSecretTrigger();
    }, 1600);
  };

  const cancelLongPress = () => {
    if (!longPressRef.current) return;
    clearTimeout(longPressRef.current);
    longPressRef.current = null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] overflow-hidden bg-[radial-gradient(circle_at_50%_45%,rgba(59,130,246,0.26),rgba(8,12,24,0.94)_52%,rgba(2,4,8,0.98)_100%)]"
        >
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_32%),radial-gradient(circle_at_78%_72%,rgba(147,51,234,0.16),transparent_28%)]" />
          <div className="absolute inset-0 pointer-events-none border border-white/5" />

          <div className="absolute top-4 left-5">
            <div className="font-mono text-[22px] md:text-[28px] tracking-[0.25em] text-cyan-200/90">MODE SELECTOR</div>
            <div className="font-mono text-[10px] tracking-[0.24em] text-zinc-500">选择要进入的智慧维度</div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-5 rounded-xl border border-white/20 bg-black/35 px-3 py-2 font-mono text-sm text-zinc-200 hover:border-cyan-400/40 hover:text-cyan-200"
          >
            ESC
          </button>

          <div className="hidden md:flex absolute inset-0 items-center justify-center">
            <div className="relative h-[640px] w-[960px]">
              <motion.button
                initial={{ scale: 0.88, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35 }}
                onMouseDown={startLongPress}
                onMouseUp={cancelLongPress}
                onMouseLeave={cancelLongPress}
                className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/30 bg-cyan-500/5 text-center shadow-[0_0_42px_rgba(34,211,238,0.22)]"
              >
                <div className="font-mono text-[34px] tracking-[0.22em] text-cyan-200">AGORA</div>
                <div className="mt-1 font-mono text-[11px] tracking-[0.2em] text-cyan-300/70">蜂群智慧核心</div>
                <div className="mt-2 font-mono text-[10px] tracking-[0.16em] text-zinc-500">长按 1.6s 进入秘境</div>
              </motion.button>

              {modes.map((mode, idx) => {
                const radius = 265;
                const angle = (-90 + idx * 72) * (Math.PI / 180);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const Icon = mode.icon;

                return (
                  <motion.button
                    key={mode.id}
                    initial={{ opacity: 0, y: 26, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: idx * 0.06, duration: 0.28 }}
                    whileHover={{ scale: 1.04, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setMode(mode.id as Mode);
                      onClose();
                    }}
                    className={cn(
                      'absolute h-32 w-64 rounded-[22px] border bg-black/35 p-4 text-left backdrop-blur-xl transition-all',
                      colorClass(mode.color),
                      currentMode === mode.id && 'ring-1 ring-white/35'
                    )}
                    style={{
                      left: `calc(50% + ${x}px - 8rem)`,
                      top: `calc(50% + ${y}px - 4rem)`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn('rounded-xl border p-2', colorClass(mode.color))}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-xl leading-5 text-zinc-100">{mode.name}</div>
                        <div className="mt-2 text-xs leading-5 text-zinc-300">{mode.subtitle}</div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="md:hidden absolute inset-x-4 top-24 bottom-6 overflow-auto rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-xl">
            <button
              onMouseDown={startLongPress}
              onMouseUp={cancelLongPress}
              onMouseLeave={cancelLongPress}
              className="mb-3 w-full rounded-2xl border border-cyan-400/35 bg-cyan-500/10 py-4 text-center"
            >
              <div className="font-mono text-2xl tracking-[0.18em] text-cyan-200">AGORA</div>
              <div className="mt-1 text-xs text-zinc-400">长按进入秘境</div>
            </button>

            <div className="space-y-3">
              {modes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setMode(mode.id as Mode);
                      onClose();
                    }}
                    className={cn(
                      'w-full rounded-2xl border bg-black/35 p-4 text-left',
                      colorClass(mode.color),
                      currentMode === mode.id && 'ring-1 ring-white/35'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <div className="font-semibold text-lg text-zinc-100">{mode.name}</div>
                    </div>
                    <div className="mt-2 text-xs text-zinc-300">{mode.subtitle}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
