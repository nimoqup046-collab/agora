"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Code2, FlaskConical, BrainCircuit, Zap, Palette, X } from "lucide-react";
import { clsx } from "clsx";
import { useI18n } from "@/components/i18n/LanguageProvider";
import type { PanelMode } from "@/types";

interface ModeSelectorOverlayProps {
  open: boolean;
  currentMode: PanelMode;
  onClose: () => void;
  onSelect: (mode: PanelMode) => void;
}

const MODE_CARDS = [
  {
    mode: "coding" as PanelMode,
    icon: Code2,
    color: "blue",
    glowShadow: "shadow-[0_0_50px_rgba(59,130,246,0.4)]",
    glowBg: "bg-blue-500/20",
    glowText: "text-blue-400",
    glowIcon: "shadow-blue-500/30",
    label: "编程模式",
    labelEn: "PROGRAMMING",
    desc: "蜂群编码竞技场",
    descEn: "Swarm coding arena",
  },
  {
    mode: "research" as PanelMode,
    icon: FlaskConical,
    color: "purple",
    glowShadow: "shadow-[0_0_50px_rgba(168,85,247,0.4)]",
    glowBg: "bg-purple-500/20",
    glowText: "text-purple-400",
    glowIcon: "shadow-purple-500/30",
    label: "科研模式",
    labelEn: "RESEARCH",
    desc: "科学议事厅与知识球体",
    descEn: "Scientific council",
  },
  {
    mode: "reasoning" as PanelMode,
    icon: BrainCircuit,
    color: "cyan",
    glowShadow: "shadow-[0_0_50px_rgba(34,211,238,0.4)]",
    glowBg: "bg-cyan-500/20",
    glowText: "text-cyan-400",
    glowIcon: "shadow-cyan-500/30",
    label: "推理模式",
    labelEn: "REASONING",
    desc: "逻辑链与并行辩论",
    descEn: "Logic chain & debate",
  },
  {
    mode: "evolution" as PanelMode,
    icon: Zap,
    color: "amber",
    glowShadow: "shadow-[0_0_50px_rgba(245,158,11,0.4)]",
    glowBg: "bg-amber-500/20",
    glowText: "text-amber-400",
    glowIcon: "shadow-amber-500/30",
    label: "AGI自进化",
    labelEn: "EVOLUTION",
    desc: "SOUL蒸馏与蜂群升级",
    descEn: "SOUL distill & upgrade",
  },
  {
    mode: "creation" as PanelMode,
    icon: Palette,
    color: "emerald",
    glowShadow: "shadow-[0_0_50px_rgba(16,185,129,0.4)]",
    glowBg: "bg-emerald-500/20",
    glowText: "text-emerald-400",
    glowIcon: "shadow-emerald-500/30",
    label: "创作模式",
    labelEn: "CREATION",
    desc: "实时渲染与迭代历史",
    descEn: "Live render & iteration",
  },
];

export function ModeSelectorOverlay({
  open,
  currentMode,
  onClose,
  onSelect,
}: ModeSelectorOverlayProps) {
  const { locale, t } = useI18n();
  const [selecting, setSelecting] = useState<PanelMode | null>(null);

  useEffect(() => {
    if (!open) setSelecting(null);
  }, [open]);

  const handleSelect = (mode: PanelMode) => {
    setSelecting(mode);
    window.setTimeout(() => {
      onSelect(mode);
      onClose();
    }, 220);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: typeof window !== "undefined" ? Math.random() * window.innerWidth : 500,
                  y: typeof window !== "undefined" ? Math.random() * window.innerHeight : 500,
                  opacity: Math.random() * 0.5,
                }}
                animate={{
                  y: [null, Math.random() * -100],
                  opacity: [null, 0],
                }}
                transition={{
                  duration: Math.random() * 5 + 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute w-1 h-1 bg-blue-500/30 rounded-full"
              />
            ))}
          </div>

          {/* Close button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 hover:border-white/20 text-white/60 hover:text-white transition-all duration-200 z-10"
          >
            <X className="w-5 h-5" />
          </motion.button>

          {/* Title */}
          <div className="absolute top-8 left-8 z-10">
            <p className="font-mono text-xs tracking-[4px] text-white/40 uppercase">
              {locale === "zh-CN" ? "选择智慧维度" : "SELECT MODE"}
            </p>
            <p className="font-mono text-[10px] tracking-widest text-white/25 mt-0.5">
              {locale === "zh-CN" ? "选择要进入的智慧维度" : "Select the intelligence dimension"}
            </p>
          </div>

          {/* Mode cards grid */}
          <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative z-10">
            {MODE_CARDS.map((card, index) => {
              const isActive = currentMode === card.mode;
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.mode}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  onClick={() => handleSelect(card.mode)}
                  className={clsx(
                    "group relative aspect-[4/5] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[40px] p-8 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-white/30",
                    isActive && "border-white/40 bg-white/10 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                  )}
                >
                  <div
                    className={clsx(
                      "w-20 h-20 rounded-3xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-2xl",
                      card.color === "blue" && "bg-blue-500/20 text-blue-400 shadow-blue-500/20",
                      card.color === "purple" && "bg-purple-500/20 text-purple-400 shadow-purple-500/20",
                      card.color === "cyan" && "bg-cyan-500/20 text-cyan-400 shadow-cyan-500/20",
                      card.color === "amber" && "bg-amber-500/20 text-amber-400 shadow-amber-500/20",
                      card.color === "orange" && "bg-orange-500/20 text-orange-400 shadow-orange-500/20"
                    )}
                  >
                    <Icon className="w-10 h-10" />
                  </div>

                  <h3 className="font-mono text-xl font-bold mb-3 tracking-tight">
                    {locale === "zh-CN" ? card.label : card.labelEn}
                  </h3>
                  <p className="text-xs text-zinc-500 text-center leading-relaxed font-mono uppercase tracking-wider px-4">
                    {locale === "zh-CN" ? card.desc : card.descEn}
                  </p>

                  {/* Hover glow */}
                  <div
                    className={clsx(
                      "absolute inset-0 rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none blur-3xl -z-10",
                      card.color === "blue" && "bg-blue-500/10",
                      card.color === "purple" && "bg-purple-500/10",
                      card.color === "cyan" && "bg-cyan-500/10",
                      card.color === "amber" && "bg-amber-500/10",
                      card.color === "orange" && "bg-orange-500/10"
                    )}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Flash on selection */}
          <AnimatePresence>
            {selecting && (
              <motion.div
                className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(103,232,249,0.22),transparent_58%)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
