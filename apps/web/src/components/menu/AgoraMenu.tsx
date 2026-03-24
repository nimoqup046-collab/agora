"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { useI18n } from "@/components/i18n/LanguageProvider";
import type { PanelMode } from "@/types";

/* ── Pixel-art icon maps (12×12) ─────────────────────────────── */

type PxLegend = "." | "c" | "a" | "b" | "g" | "w" | "p" | "o";

const PX_COLORS: Record<PxLegend, string> = {
  ".": "transparent",
  c: "#39d8ff", // cyan
  a: "#8f7dff", // violet
  b: "#e3c27a", // gold
  g: "#10b981", // green
  w: "#dce6ff", // white
  p: "#f472b6", // pink
  o: "#f97316", // orange
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
  { mode: "coding", labelKey: "menu.coding", descKey: "menu.codingDesc", color: "#39d8ff", glow: "rgba(57,216,255,0.25)" },
  { mode: "research", labelKey: "menu.research", descKey: "menu.researchDesc", color: "#8f7dff", glow: "rgba(143,125,255,0.25)" },
  { mode: "reasoning", labelKey: "menu.reasoning", descKey: "menu.reasoningDesc", color: "#e3c27a", glow: "rgba(227,194,122,0.25)" },
  { mode: "evolution", labelKey: "menu.evolution", descKey: "menu.evolutionDesc", color: "#10b981", glow: "rgba(16,185,129,0.25)" },
  { mode: "creation", labelKey: "menu.creation", descKey: "menu.creationDesc", color: "#f472b6", glow: "rgba(244,114,182,0.25)" },
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
          "group flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300",
          isOpen
            ? "bg-white/[0.06] shadow-[0_0_20px_rgba(57,216,255,0.15)]"
            : "hover:bg-white/[0.04]",
        )}
      >
        <span
          className="font-tech text-base tracking-[0.25em] transition-colors duration-300"
          style={{ color: isOpen ? currentItem?.color ?? "#39d8ff" : "#a5f3fc" }}
        >
          AGORA
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="text-[10px] text-slate-400"
        >
          ▾
        </motion.span>
      </button>

      {/* ── Orbital Menu Dropdown ─────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="agora-menu-backdrop absolute top-full left-0 mt-2 z-50 w-[340px] rounded-2xl p-1"
          >
            <div className="agora-menu-inner rounded-xl p-3 space-y-1">
              {/* Mode selector title */}
              <div className="px-3 py-2 flex items-center gap-2">
                <span className="text-[9px] font-tech tracking-[0.3em] text-slate-400 uppercase">
                  {t("menu.switchMode")}
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-slate-600/40 to-transparent" />
              </div>

              {MENU_ITEMS.map((item, index) => {
                const isActive = item.mode === currentMode;
                return (
                  <motion.button
                    key={item.mode}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.2 }}
                    onClick={() => {
                      onModeChange(item.mode);
                      setIsOpen(false);
                    }}
                    className={clsx(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group/item",
                      isActive
                        ? "agora-menu-item-active"
                        : "hover:bg-white/[0.04]",
                    )}
                    style={
                      isActive
                        ? {
                            background: `linear-gradient(135deg, ${item.glow}, transparent 70%)`,
                            boxShadow: `inset 0 0 0 1px ${item.color}33, 0 0 16px ${item.glow}`,
                          }
                        : undefined
                    }
                  >
                    {/* Pixel Icon */}
                    <div
                      className={clsx(
                        "shrink-0 p-1.5 rounded-lg transition-all duration-200",
                        isActive ? "bg-white/[0.08]" : "bg-white/[0.03] group-hover/item:bg-white/[0.06]",
                      )}
                    >
                      <PixelIcon mode={item.mode} size={4} />
                    </div>

                    {/* Label + description */}
                    <div className="flex-1 text-left">
                      <span
                        className="block text-xs font-tech tracking-[0.15em] transition-colors"
                        style={{ color: isActive ? item.color : "#c8d6e5" }}
                      >
                        {t(item.labelKey)}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-0.5 leading-tight">
                        {t(item.descKey)}
                      </span>
                    </div>

                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="menu-active-dot"
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { PixelIcon, MENU_ITEMS };
