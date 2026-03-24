"use client";

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
  x: number;
  y: number;
}

const MODE_CARDS: ModeCard[] = [
  {
    mode: "coding",
    icon: "</>",
    colorClass: "from-cyan-500/30 to-blue-500/10 border-cyan-300/45",
    x: 0,
    y: -33,
  },
  {
    mode: "research",
    icon: "Σ",
    colorClass: "from-indigo-500/30 to-violet-500/10 border-violet-300/45",
    x: -34,
    y: -7,
  },
  {
    mode: "reasoning",
    icon: "⋮",
    colorClass: "from-teal-500/30 to-cyan-500/10 border-teal-300/45",
    x: 34,
    y: -7,
  },
  {
    mode: "evolution",
    icon: "DNA",
    titleEn: "AGI Evolution",
    titleZh: "AGI 自进化",
    descEn: "SOUL mutation, benchmark loop, and next-generation distill.",
    descZh: "SOUL 迭代、基准回环与下一代蒸馏。",
    colorClass: "from-amber-500/30 to-yellow-500/10 border-amber-300/45",
    x: -18,
    y: 26,
  },
  {
    mode: "creation",
    icon: "✦",
    colorClass: "from-orange-500/30 to-rose-500/10 border-orange-300/45",
    x: 18,
    y: 26,
  },
];

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
          className="fixed inset-0 z-[80] bg-[#02040d]/88 backdrop-blur-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(69,180,255,0.18),transparent_52%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_60%,rgba(167,139,250,0.16),transparent_48%)]" />
          </div>

          <div className="relative h-full w-full flex flex-col">
            <div className="h-14 px-4 sm:px-6 flex items-center justify-between border-b border-cyan-300/20">
              <div>
                <p className="font-tech text-xs tracking-[0.24em] text-cyan-200">MODE SELECTOR</p>
                <p className="text-[11px] text-slate-300/80">
                  {locale === "zh-CN"
                    ? "选择要进入的智慧维度"
                    : "Select the intelligence dimension"}
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
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(86vw,840px)] h-[min(82vh,680px)]">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-cyan-300/25 bg-cyan-500/5 shadow-[0_0_60px_rgba(57,216,255,0.24)] flex items-center justify-center">
                  <div className="text-center">
                    <p className="font-tech text-cyan-100 text-sm tracking-[0.22em]">AGORA</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {locale === "zh-CN" ? "蜂群智慧核心" : "SWARM CORE"}
                    </p>
                  </div>
                </div>

                {MODE_CARDS.map((card, idx) => (
                  <motion.button
                    key={card.mode}
                    onClick={() => {
                      onSelect(card.mode);
                      onClose();
                    }}
                    initial={{ opacity: 0, y: 12, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.92 }}
                    transition={{ duration: 0.24, delay: 0.04 * idx }}
                    className={clsx(
                      "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-52 sm:w-56 rounded-2xl border p-4 text-left",
                      "bg-gradient-to-br",
                      card.colorClass,
                      "backdrop-blur-xl shadow-[0_0_28px_rgba(59,130,246,0.2)] hover:shadow-[0_0_40px_rgba(59,130,246,0.34)] transition-all duration-200",
                      currentMode === card.mode ? "ring-1 ring-cyan-200/80" : "ring-1 ring-transparent"
                    )}
                    style={{
                      transform: `translate(calc(-50% + ${card.x}%), calc(-50% + ${card.y}%))`,
                    }}
                  >
                    <p className="font-tech text-[10px] tracking-[0.16em] text-cyan-100/90">{card.icon}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-100">
                      {t(`menu.${card.mode}`)}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-300/85">
                      {t(`menu.${card.mode}Desc`)}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
