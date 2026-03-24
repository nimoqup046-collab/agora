"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { useI18n } from "@/components/i18n/LanguageProvider";
import type { PanelMode } from "@/types";

/* ── Pixel-art icon maps (12x12) ─────────────────────────────── */

type PxLegend = "." | "c" | "a" | "b" | "g" | "w" | "p" | "o";

const PX_COLORS: Record<PxLegend, string> = {
  ".": "transparent",
  c: "#39d8ff",
  a: "#8f7dff",
  b: "#e3c27a",
  g: "#10b981",
  w: "#dce6ff",
  p: "#f472b6",
  o: "#f97316",
};

const ICON_MAPS: Record<PanelMode, string[]> = {
  coding: [
    "..cccccccc..",
    ".cc......cc.",
    "cc........cc",
    "cc.cc..cc.cc",
    "cc........cc",
    "cc.c....c.cc",
    "cc..cccc..cc",
    ".cc......cc.",
    "..cccccccc..",
    "....cccc....",
    "..cccccccc..",
    "....c..c....",
  ],
  research: [
    "....aaaa....",
    "..aaaaaa....",
    ".aaa..aaa...",
    "aaa....aaa..",
    "aaa....aaa..",
    ".aaa..aaa...",
    "..aaaaaa....",
    "....aaaa....",
    "......aaa...",
    ".......aaa..",
    "........aa..",
    "............",
  ],
  reasoning: [
    "..bbbbbbbb..",
    ".bb......bb.",
    "bb........bb",
    "bb..bbbb..bb",
    "bb..b..b..bb",
    "bb..bbbb..bb",
    "bb........bb",
    ".bb......bb.",
    "..bbbbbbbb..",
    "....b..b....",
    "...bb..bb...",
    "............",
  ],
  evolution: [
    "......gg....",
    ".....ggg....",
    "....gggg....",
    "...ggggg....",
    "..gggggg.g..",
    ".ggggggg.gg.",
    "gggg..gg.gg.",
    "ggg....gggg.",
    ".gg....ggg..",
    "..gg..ggg...",
    "...ggggg....",
    "....ggg.....",
  ],
  creation: [
    "....pppp....",
    "...pppppp...",
    "..pp.pp.pp..",
    ".pp..pp..pp.",
    "pp...pp...pp",
    "pp..pppp..pp",
    "pp.pppppp.pp",
    ".pppppppppp.",
    "..pppppppp..",
    "...pp..pp...",
    "..pp....pp..",
    ".pp......pp.",
  ],
};

function PixelIcon({ mode, size = 5 }: { mode: PanelMode; size?: number }) {
  const map = ICON_MAPS[mode];
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(12, ${size}px)`,
        gridTemplateRows: `repeat(12, ${size}px)`,
        gap: "0.5px",
      }}
    >
      {map
        .join("")
        .split("")
        .map((cell, idx) => (
          <span
            key={idx}
            style={{
              width: size,
              height: size,
              borderRadius: 1,
              background: PX_COLORS[(cell as PxLegend) || "."],
            }}
          />
        ))}
    </div>
  );
}

/* ── Menu item definition ─────────────────────────────────────── */

interface MenuItem {
  mode: PanelMode;
  labelKey: string;
  descKey: string;
  color: string;
  glow: string;
}

const MENU_ITEMS: MenuItem[] = [
  { mode: "coding", labelKey: "menu.coding", descKey: "menu.codingDesc", color: "#39d8ff", glow: "rgba(57,216,255,0.15)" },
  { mode: "research", labelKey: "menu.research", descKey: "menu.researchDesc", color: "#8f7dff", glow: "rgba(143,125,255,0.15)" },
  { mode: "reasoning", labelKey: "menu.reasoning", descKey: "menu.reasoningDesc", color: "#e3c27a", glow: "rgba(227,194,122,0.15)" },
  { mode: "evolution", labelKey: "menu.evolution", descKey: "menu.evolutionDesc", color: "#10b981", glow: "rgba(16,185,129,0.15)" },
  { mode: "creation", labelKey: "menu.creation", descKey: "menu.creationDesc", color: "#f472b6", glow: "rgba(244,114,182,0.15)" },
];

/* ── AgoraMenu Component ──────────────────────────────────────── */

interface AgoraMenuProps {
  currentMode: PanelMode;
  onModeChange: (mode: PanelMode) => void;
}

export function AgoraMenu({ currentMode, onModeChange }: AgoraMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, handleClickOutside]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const currentItem = MENU_ITEMS.find((m) => m.mode === currentMode);

  return (
    <div ref={menuRef} className="relative">
      {/* ── Logo Trigger ──────────────────────────────────── */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={clsx(
          "group flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all duration-300",
          isOpen
            ? "bg-white/[0.06]"
            : "hover:bg-white/[0.04]",
        )}
      >
        {/* Pixel hive logo */}
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-tech font-bold transition-all duration-300"
          style={{
            background: isOpen
              ? `linear-gradient(135deg, ${currentItem?.color}30, ${currentItem?.color}10)`
              : "rgba(57, 216, 255, 0.08)",
            border: `1px solid ${isOpen ? currentItem?.color + "40" : "rgba(57, 216, 255, 0.15)"}`,
            boxShadow: isOpen ? `0 0 20px ${currentItem?.glow}` : "none",
            color: isOpen ? currentItem?.color : "#a5f3fc",
          }}
        >
          A
        </div>
        <span
          className="font-tech text-sm tracking-[0.2em] transition-colors duration-300"
          style={{ color: isOpen ? currentItem?.color ?? "#39d8ff" : "#a5f3fc" }}
        >
          AGORA
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="text-[10px] text-slate-500"
        >
          ▾
        </motion.span>
      </button>

      {/* ── Fullscreen Mode Selector ─────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] mode-selector-backdrop flex items-center justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsOpen(false);
            }}
          >
            {/* Close hint */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-slate-300 transition-colors font-tech text-xs tracking-wider"
            >
              ESC
            </motion.button>

            {/* Title */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center">
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-tech text-[10px] tracking-[0.4em] text-slate-500 uppercase"
              >
                {t("menu.switchMode")}
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="font-tech text-2xl tracking-[0.15em] text-cyan-100/90 mt-2 text-glow-cyan"
              >
                AGORA
              </motion.h2>
            </div>

            {/* Mode Cards - Radial-ish Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 px-6 max-w-5xl w-full">
              {MENU_ITEMS.map((item, index) => {
                const isActive = item.mode === currentMode;
                return (
                  <motion.button
                    key={item.mode}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{
                      delay: index * 0.06,
                      duration: 0.4,
                      type: "spring",
                      damping: 20,
                      stiffness: 200,
                    }}
                    onClick={() => {
                      onModeChange(item.mode);
                      setIsOpen(false);
                    }}
                    className={clsx(
                      "mode-card rounded-2xl p-6 flex flex-col items-center gap-4 text-center group relative overflow-hidden",
                      isActive && "ring-1",
                    )}
                    style={{
                      ["--card-color" as string]: item.color + "40",
                      ["--card-glow" as string]: item.glow,
                      ...(isActive ? {
                        ringColor: item.color + "50",
                        background: `linear-gradient(135deg, ${item.glow}, rgba(255,255,255,0.02))`,
                        borderColor: item.color + "30",
                        boxShadow: `0 0 40px ${item.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
                      } : {}),
                    }}
                  >
                    {/* Glow backdrop */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at 50% 30%, ${item.glow}, transparent 70%)`,
                      }}
                    />

                    {/* Icon */}
                    <div
                      className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${item.color}15, ${item.color}08)`,
                        border: `1px solid ${item.color}25`,
                        boxShadow: isActive ? `0 0 20px ${item.glow}` : "none",
                      }}
                    >
                      <PixelIcon mode={item.mode} size={4} />
                    </div>

                    {/* Label */}
                    <div className="relative z-10">
                      <span
                        className="block font-tech text-xs tracking-[0.2em] transition-colors duration-300"
                        style={{ color: isActive ? item.color : "#c8d6e5" }}
                      >
                        {t(item.labelKey)}
                      </span>
                      <span className="block text-[10px] text-slate-400/70 mt-1.5 leading-relaxed">
                        {t(item.descKey)}
                      </span>
                    </div>

                    {/* Active dot */}
                    {isActive && (
                      <motion.div
                        layoutId="mode-active-indicator"
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: item.color,
                          boxShadow: `0 0 10px ${item.color}`,
                        }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Decorative: Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" preserveAspectRatio="none">
              <line x1="10%" y1="30%" x2="90%" y2="70%" stroke="url(#line-grad)" strokeWidth="0.5" strokeDasharray="4 8" className="dash-flow" />
              <line x1="20%" y1="80%" x2="80%" y2="20%" stroke="url(#line-grad)" strokeWidth="0.5" strokeDasharray="4 8" className="dash-flow" />
              <line x1="50%" y1="10%" x2="50%" y2="90%" stroke="url(#line-grad)" strokeWidth="0.3" strokeDasharray="3 10" className="dash-flow" />
              <defs>
                <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(57,216,255,0.3)" />
                  <stop offset="50%" stopColor="rgba(143,125,255,0.2)" />
                  <stop offset="100%" stopColor="rgba(57,216,255,0.1)" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { PixelIcon, MENU_ITEMS };
