"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "clsx";
import type { PanelMode } from "@/types";
import { useI18n } from "@/components/i18n/LanguageProvider";

interface ModeSelectorOverlayProps {
  open: boolean;
  currentMode: PanelMode;
  onClose: () => void;
  onSelect: (mode: PanelMode) => void;
}

interface ModeCard {
  mode: PanelMode;
  icon: string;
  colorClass: string;
  halo: string;
  x: number;
  y: number;
}

const MODE_CARDS: ModeCard[] = [
  {
    mode: "coding",
    icon: "</>",
    colorClass: "from-cyan-500/22 to-blue-500/8 border-cyan-300/50",
    halo: "0 0 42px rgba(34,211,238,0.34)",
    x: 0,
    y: -35,
  },
  {
    mode: "research",
    icon: "Σ",
    colorClass: "from-violet-500/24 to-indigo-500/8 border-violet-300/50",
    halo: "0 0 42px rgba(167,139,250,0.32)",
    x: -31,
    y: -8,
  },
  {
    mode: "reasoning",
    icon: "⋮",
    colorClass: "from-teal-500/24 to-cyan-500/8 border-teal-300/50",
    halo: "0 0 42px rgba(45,212,191,0.32)",
    x: 31,
    y: -8,
  },
  {
    mode: "evolution",
    icon: "DNA",
    colorClass: "from-amber-500/24 to-yellow-500/8 border-amber-300/50",
    halo: "0 0 42px rgba(251,191,36,0.3)",
    x: -17,
    y: 25,
  },
  {
    mode: "creation",
    icon: "✦",
    colorClass: "from-orange-500/24 to-rose-500/8 border-orange-300/50",
    halo: "0 0 42px rgba(251,146,60,0.3)",
    x: 17,
    y: 25,
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

  const links = useMemo(
    () =>
      MODE_CARDS.map((card) => ({
        mode: card.mode,
        x1: 50,
        y1: 50,
        x2: 50 + card.x * 0.72,
        y2: 50 + card.y * 0.72,
      })),
    []
  );

  const handleSelect = (mode: PanelMode) => {
    setSelecting(mode);
    window.setTimeout(() => {
      onSelect(mode);
      onClose();
      setSelecting(null);
    }, 180);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] bg-[#01040f]/90 backdrop-blur-[14px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="mode-selector-noise absolute inset-0 pointer-events-none" />
          <div className="mode-selector-scanline absolute inset-0 pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_45%,rgba(56,189,248,0.2),transparent_42%)]" />
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_70%_70%,rgba(139,92,246,0.15),transparent_38%)]" />

          <div className="relative h-full w-full flex flex-col">
            <div className="h-14 px-4 sm:px-6 flex items-center justify-between border-b border-cyan-300/18">
              <div>
                <p className="font-tech text-xs tracking-[0.24em] text-cyan-200">MODE SELECTOR</p>
                <p className="text-[11px] text-slate-300/80">
                  {locale === "zh-CN" ? "选择要进入的智慧维度" : "Select the intelligence dimension"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-xs px-3 py-1 rounded border border-slate-500/45 text-slate-300 hover:text-slate-100 hover:border-slate-300/65 transition-colors"
              >
                ESC
              </button>
            </div>

            <div className="flex-1 relative overflow-hidden">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(92vw,980px)] h-[min(86vh,760px)]">
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-75">
                  {links.map((line) => (
                    <line
                      key={line.mode}
                      x1={`${line.x1}%`}
                      y1={`${line.y1}%`}
                      x2={`${line.x2}%`}
                      y2={`${line.y2}%`}
                      stroke={currentMode === line.mode ? "#67e8f9" : "rgba(103,232,249,0.35)"}
                      strokeWidth={currentMode === line.mode ? 1.8 : 1.2}
                      strokeDasharray="5 6"
                    />
                  ))}
                </svg>

                <motion.div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full border border-cyan-300/28 bg-cyan-500/6 shadow-[0_0_80px_rgba(56,189,248,0.25)] flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                >
                  <div className="mode-core-ring absolute inset-3 rounded-full border border-cyan-200/20" />
                  <div className="text-center">
                    <p className="font-tech text-cyan-100 text-lg tracking-[0.2em]">AGORA</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {locale === "zh-CN" ? "蜂群智慧核心" : "SWARM CORE"}
                    </p>
                  </div>
                </motion.div>

                {MODE_CARDS.map((card, idx) => (
                  <motion.button
                    key={card.mode}
                    onClick={() => handleSelect(card.mode)}
                    initial={{ opacity: 0, y: 12, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.9 }}
                    transition={{ duration: 0.25, delay: 0.04 * idx }}
                    whileHover={{ y: -4, scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                    className={clsx(
                      "absolute w-[220px] sm:w-[246px] rounded-2xl border p-4 text-left",
                      "bg-gradient-to-br backdrop-blur-xl transition-all duration-200",
                      card.colorClass,
                      currentMode === card.mode ? "ring-1 ring-cyan-200/90" : "ring-1 ring-transparent",
                      selecting === card.mode && "mode-selector-jump"
                    )}
                    style={{
                      left: `calc(50% + ${card.x}%)`,
                      top: `calc(50% + ${card.y}%)`,
                      transform: "translate(-50%, -50%)",
                      boxShadow: currentMode === card.mode ? card.halo : "0 0 24px rgba(59,130,246,0.2)",
                    }}
                  >
                    <p className="font-tech text-[10px] tracking-[0.16em] text-cyan-100/90">{card.icon}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-100">{t(`menu.${card.mode}`)}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-300/85">{t(`menu.${card.mode}Desc`)}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

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
