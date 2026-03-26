"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Beaker, BrainCircuit, Code2, Palette, X, Zap } from "lucide-react";
import { useI18n } from "@/components/i18n/LanguageProvider";
import type { PanelMode } from "@/types";

interface ModeSelectorOverlayProps {
  open: boolean;
  currentMode: PanelMode;
  onClose: () => void;
  onSelect: (mode: PanelMode) => void;
}

const MODE_RING: Array<{
  mode: PanelMode;
  icon: typeof Code2;
  color: string;
  glow: string;
  x: number;
  y: number;
}> = [
  { mode: "coding", icon: Code2, color: "#38bdf8", glow: "rgba(56,189,248,0.35)", x: 0, y: -220 },
  { mode: "research", icon: Beaker, color: "#a78bfa", glow: "rgba(167,139,250,0.35)", x: 210, y: -70 },
  { mode: "reasoning", icon: BrainCircuit, color: "#22d3ee", glow: "rgba(34,211,238,0.32)", x: 130, y: 190 },
  { mode: "evolution", icon: Zap, color: "#f59e0b", glow: "rgba(245,158,11,0.35)", x: -130, y: 190 },
  { mode: "creation", icon: Palette, color: "#fb7185", glow: "rgba(251,113,133,0.35)", x: -210, y: -70 },
];

function ModeCard({
  mode,
  color,
  glow,
  selected,
  label,
  desc,
  onClick,
  Icon,
}: {
  mode: PanelMode;
  color: string;
  glow: string;
  selected: boolean;
  label: string;
  desc: string;
  onClick: () => void;
  Icon: typeof Code2;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -8, scale: 1.03 }}
      className="relative w-[250px] h-[142px] rounded-3xl border text-left px-5 py-4 backdrop-blur-2xl"
      style={{
        background: selected ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
        borderColor: selected ? "rgba(255,255,255,0.55)" : `${color}66`,
        boxShadow: `0 0 35px ${selected ? glow : "rgba(0,0,0,0.15)"}`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="w-11 h-11 rounded-xl border flex items-center justify-center"
          style={{ borderColor: `${color}88`, color }}
        >
          <Icon className="w-5 h-5" />
        </div>
        {selected && (
          <span className="text-[9px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full border border-white/35 text-white/90">
            Active
          </span>
        )}
      </div>
      <p className="mt-3 font-semibold tracking-[0.08em] text-white text-lg">{label}</p>
      <p className="mt-1 text-xs text-slate-300/90 leading-relaxed">{desc}</p>

      <span
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(140deg, ${color}33, transparent 45%)`,
        }}
      />
    </motion.button>
  );
}

export function ModeSelectorOverlay({
  open,
  currentMode,
  onClose,
  onSelect,
}: ModeSelectorOverlayProps) {
  const { locale, t } = useI18n();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-[#02050f]/95 backdrop-blur-3xl"
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(56,189,248,0.25),transparent_40%),radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_80%_85%,rgba(168,85,247,0.18),transparent_35%)]" />
            {Array.from({ length: 28 }).map((_, idx) => (
              <motion.span
                key={idx}
                className="absolute w-1 h-1 rounded-full bg-cyan-300/35"
                initial={{
                  x: Math.random() * 1600,
                  y: Math.random() * 1000,
                  opacity: Math.random() * 0.4 + 0.15,
                }}
                animate={{ y: [null, -120], opacity: [null, 0] }}
                transition={{ duration: Math.random() * 7 + 6, repeat: Infinity, ease: "linear" }}
              />
            ))}
          </div>

          <div className="relative z-10 h-full">
            <div className="h-12 border-b border-white/10 px-5 flex items-center justify-between">
              <div>
                <p className="font-mono text-cyan-100 text-sm tracking-[0.25em] uppercase">Mode Selector</p>
                <p className="text-[11px] text-slate-400">
                  {locale === "zh-CN" ? "选择要进入的智慧维度" : "Choose a workspace dimension"}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-11 h-9 rounded-lg border border-white/15 text-slate-200 hover:border-cyan-300/45 hover:text-cyan-100 transition-colors"
              >
                <X className="w-4 h-4 mx-auto" />
              </button>
            </div>

            <div className="hidden lg:block relative h-[calc(100%-3rem)]">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] rounded-full border border-cyan-300/20" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[460px] rounded-full border border-white/10" />

              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                onClick={() => onSelect(currentMode)}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full border border-cyan-300/30 bg-cyan-500/10 backdrop-blur-2xl text-center"
              >
                <p className="font-mono text-cyan-100 text-3xl tracking-[0.2em]">AGORA</p>
                <p className="text-[11px] text-cyan-200/75 mt-2 uppercase tracking-[0.16em]">
                  {locale === "zh-CN" ? "蜂群核心" : "Swarm Core"}
                </p>
              </motion.button>

              {MODE_RING.map((entry, idx) => (
                <motion.div
                  key={entry.mode}
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.06, duration: 0.28 }}
                  className="absolute left-1/2 top-1/2"
                  style={{ transform: `translate(${entry.x - 125}px, ${entry.y - 71}px)` }}
                >
                  <ModeCard
                    mode={entry.mode}
                    color={entry.color}
                    glow={entry.glow}
                    selected={currentMode === entry.mode}
                    label={t(`menu.${entry.mode}`)}
                    desc={t(`menu.${entry.mode}Desc`)}
                    onClick={() => onSelect(entry.mode)}
                    Icon={entry.icon}
                  />
                </motion.div>
              ))}
            </div>

            <div className="lg:hidden h-[calc(100%-3rem)] overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
              {MODE_RING.map((entry) => (
                <ModeCard
                  key={entry.mode}
                  mode={entry.mode}
                  color={entry.color}
                  glow={entry.glow}
                  selected={currentMode === entry.mode}
                  label={t(`menu.${entry.mode}`)}
                  desc={t(`menu.${entry.mode}Desc`)}
                  onClick={() => onSelect(entry.mode)}
                  Icon={entry.icon}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
