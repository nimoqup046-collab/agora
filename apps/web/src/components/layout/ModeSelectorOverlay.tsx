"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "clsx";
import { useI18n } from "@/components/i18n/LanguageProvider";
import type { PanelMode } from "@/types";

interface ModeSelectorOverlayProps {
  open: boolean;
  currentMode: PanelMode;
  onClose: () => void;
  onSelect: (mode: PanelMode) => void;
}

interface ModeCardDef {
  mode: PanelMode;
  icon: string;
  color: string;
  glow: string;
  angle: number;
}

const MODE_CARDS: ModeCardDef[] = [
  { mode: "coding", icon: "</>", color: "#3dd8ff", glow: "rgba(61,216,255,0.35)", angle: -90 },
  { mode: "research", icon: "SCI", color: "#a78bfa", glow: "rgba(167,139,250,0.34)", angle: -20 },
  { mode: "reasoning", icon: "LOG", color: "#34d399", glow: "rgba(52,211,153,0.34)", angle: 50 },
  { mode: "evolution", icon: "DNA", color: "#fbbf24", glow: "rgba(251,191,36,0.32)", angle: 130 },
  { mode: "creation", icon: "ART", color: "#fb7185", glow: "rgba(251,113,133,0.33)", angle: 200 },
];

export function ModeSelectorOverlay({
  open,
  currentMode,
  onClose,
  onSelect,
}: ModeSelectorOverlayProps) {
  const { locale, t } = useI18n();
  const [selecting, setSelecting] = useState<PanelMode | null>(null);
  const [viewport, setViewport] = useState({ w: 1440, h: 900 });

  useEffect(() => {
    const update = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!open) {
      setSelecting(null);
    }
  }, [open]);

  const isCompact = viewport.w < 1040;
  const radiusX = Math.min(Math.max(220, viewport.w * 0.24), 360);
  const radiusY = Math.min(Math.max(140, viewport.h * 0.22), 250);

  const positionedCards = useMemo(
    () =>
      MODE_CARDS.map((card) => {
        const rad = (card.angle * Math.PI) / 180;
        const x = Math.cos(rad) * radiusX;
        const y = Math.sin(rad) * radiusY;
        return { ...card, x, y };
      }),
    [radiusX, radiusY]
  );

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
          className="fixed inset-0 z-[90] bg-[#01040f]/92 backdrop-blur-[14px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="mode-selector-noise absolute inset-0 pointer-events-none" />
          <div className="mode-selector-scanline absolute inset-0 pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_46%,rgba(56,189,248,0.22),transparent_42%)]" />
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_74%_70%,rgba(168,85,247,0.16),transparent_36%)]" />

          <div className="relative h-full w-full flex flex-col">
            <div className="h-14 px-4 sm:px-6 flex items-center justify-between border-b border-cyan-300/18">
              <div>
                <p className="font-tech text-xs tracking-[0.24em] text-cyan-200">MODE SELECTOR</p>
                <p className="text-[11px] text-slate-300/80">
                  {locale === "zh-CN" ? "选择要进入的智慧维度" : "Select the intelligence dimension"}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-xs px-3 py-1 rounded border border-slate-500/45 text-slate-300 hover:text-slate-100 hover:border-slate-300/65 transition-colors"
              >
                ESC
              </button>
            </div>

            <div className="flex-1 relative overflow-hidden">
              <div className="absolute inset-0">
                {!isCompact && (
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none opacity-70"
                    viewBox="0 0 1000 1000"
                    preserveAspectRatio="none"
                  >
                    {positionedCards.map((card) => (
                      <line
                        key={card.mode}
                        x1={500}
                        y1={500}
                        x2={500 + card.x * 1.45}
                        y2={500 + card.y * 1.45}
                        stroke={card.mode === currentMode ? "#67e8f9" : "rgba(103,232,249,0.34)"}
                        strokeWidth={card.mode === currentMode ? 1.8 : 1.1}
                        strokeDasharray="5 6"
                        className="dash-flow"
                      />
                    ))}
                  </svg>
                )}

                <motion.div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full border border-cyan-300/28 bg-cyan-500/8 shadow-[0_0_80px_rgba(56,189,248,0.24)] flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
                >
                  <div className="mode-core-ring absolute inset-3 rounded-full border border-cyan-200/20" />
                  <div className="text-center">
                    <p className="font-tech text-cyan-100 text-lg tracking-[0.2em]">AGORA</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {locale === "zh-CN" ? "蜂群智慧核心" : "SWARM CORE"}
                    </p>
                  </div>
                </motion.div>

                {!isCompact &&
                  positionedCards.map((card, idx) => {
                    const isActive = currentMode === card.mode;
                    const isSelecting = selecting === card.mode;
                    return (
                      <div
                        key={card.mode}
                        className="absolute"
                        style={{
                          left: "50%",
                          top: "50%",
                          transform: `translate(-50%, -50%) translate(${card.x}px, ${card.y}px)`,
                        }}
                      >
                        <motion.button
                          type="button"
                          onClick={() => handleSelect(card.mode)}
                          initial={{ opacity: 0, scale: 0.88 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.28, delay: idx * 0.05 }}
                          whileHover={{ scale: 1.04, y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          className={clsx(
                            "w-[230px] rounded-2xl border p-4 text-left",
                            "bg-gradient-to-br backdrop-blur-xl transition-all duration-200",
                            isActive ? "ring-1 ring-cyan-200/90" : "ring-1 ring-transparent"
                          )}
                          style={{
                            borderColor: `${card.color}66`,
                            backgroundImage:
                              "linear-gradient(165deg, rgba(14,24,48,0.92), rgba(9,14,28,0.85))",
                            boxShadow: isActive ? `0 0 42px ${card.glow}` : "0 0 24px rgba(59,130,246,0.2)",
                          }}
                        >
                          <p className="font-tech text-[10px] tracking-[0.16em]" style={{ color: card.color }}>
                            {card.icon}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-100">{t(`menu.${card.mode}`)}</p>
                          <p className="mt-1 text-[11px] leading-relaxed text-slate-300/85">
                            {t(`menu.${card.mode}Desc`)}
                          </p>
                        </motion.button>
                      </div>
                    );
                  })}

                {isCompact && (
                  <div className="absolute inset-x-4 bottom-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {MODE_CARDS.map((card, idx) => {
                      const isActive = currentMode === card.mode;
                      const isSelecting = selecting === card.mode;
                      return (
                        <motion.button
                          key={card.mode}
                          type="button"
                          onClick={() => handleSelect(card.mode)}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.22, delay: idx * 0.03 }}
                          className={clsx(
                            "rounded-xl border p-3 text-left bg-[#091224]/88 backdrop-blur-xl",
                            isActive ? "ring-1 ring-cyan-200/90" : "ring-1 ring-transparent"
                          )}
                          style={{
                            borderColor: `${card.color}66`,
                            boxShadow: isActive ? `0 0 24px ${card.glow}` : "0 0 14px rgba(59,130,246,0.16)",
                          }}
                        >
                          <p className="font-tech text-[10px] tracking-[0.14em]" style={{ color: card.color }}>
                            {card.icon}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-100">{t(`menu.${card.mode}`)}</p>
                          <p className="mt-1 text-[11px] leading-relaxed text-slate-300/85">
                            {t(`menu.${card.mode}Desc`)}
                          </p>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
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
