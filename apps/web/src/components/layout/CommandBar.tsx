"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Activity, Cpu, LayoutGrid, ShieldCheck } from "lucide-react";
import { useAgoraStore } from "@/lib/store";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { ModeSelectorOverlay } from "@/components/layout/ModeSelectorOverlay";
import type { PanelMode } from "@/types";

interface CommandBarProps {
  sessionTitle?: string;
  mode: PanelMode;
  onModeChange: (mode: PanelMode) => void;
}

const MODE_META: Record<PanelMode, { key: string; color: string; shadow: string }> = {
  coding: {
    key: "menu.coding",
    color: "#38bdf8",
    shadow: "0 0 18px rgba(56,189,248,0.38)",
  },
  research: {
    key: "menu.research",
    color: "#a78bfa",
    shadow: "0 0 18px rgba(167,139,250,0.38)",
  },
  reasoning: {
    key: "menu.reasoning",
    color: "#22d3ee",
    shadow: "0 0 18px rgba(34,211,238,0.38)",
  },
  evolution: {
    key: "menu.evolution",
    color: "#f59e0b",
    shadow: "0 0 18px rgba(245,158,11,0.35)",
  },
  creation: {
    key: "menu.creation",
    color: "#fb7185",
    shadow: "0 0 18px rgba(251,113,133,0.35)",
  },
};

export function CommandBar({ sessionTitle, mode, onModeChange }: CommandBarProps) {
  const { isStreaming } = useAgoraStore();
  const { locale, t } = useI18n();
  const [selectorOpen, setSelectorOpen] = useState(false);

  const modeLabel = useMemo(() => t(MODE_META[mode].key), [mode, t]);
  const meta = MODE_META[mode];

  return (
    <>
      <header className="h-12 bg-black/45 backdrop-blur-2xl border-b border-white/10 flex items-center px-3 sm:px-5 gap-3 z-20">
        <button
          type="button"
          onClick={() => setSelectorOpen(true)}
          className="group flex items-center gap-2.5 cursor-pointer"
          title={locale === "zh-CN" ? "打开模式选择器" : "Open mode selector"}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-mono font-black text-white"
            style={{ background: meta.color, boxShadow: meta.shadow }}
          >
            A
          </div>
          <span className="font-mono text-base tracking-tight text-white group-hover:text-sky-300 transition-colors">AGORA</span>
          <LayoutGrid className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-200 transition-colors" />
        </button>

        {sessionTitle && (
          <span className="hidden xl:inline text-xs text-slate-400 truncate max-w-64">/{sessionTitle}</span>
        )}

        <div className="flex-1 flex justify-center">
          <div
            className="px-3 py-1 rounded-full border text-[10px] font-mono uppercase tracking-[0.18em] flex items-center gap-2"
            style={{ borderColor: `${meta.color}55`, color: meta.color, backgroundColor: `${meta.color}14` }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: meta.color, boxShadow: meta.shadow }} />
            {modeLabel}
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2">
          {["#3b82f6", "#10b981", "#a855f7", "#f59e0b", "#22d3ee"].map((dot, idx) => (
            <span
              key={idx}
              className="w-2.5 h-2.5 rounded-full border border-black/40"
              style={{ backgroundColor: dot }}
            />
          ))}
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 ml-1">Swarm</span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-zinc-500">
          <Activity className="w-4 h-4 hover:text-sky-300 transition-colors" />
          <ShieldCheck className="w-4 h-4 hover:text-emerald-300 transition-colors" />
          <Cpu className="w-4 h-4 hover:text-violet-300 transition-colors" />
        </div>

        <div className="text-[10px] px-2 py-1 rounded border font-mono uppercase tracking-wider border-emerald-500/40 text-emerald-300">
          {isStreaming ? "Live" : "Idle"}
        </div>

        <LanguageToggle />

        <Link
          href="/"
          className="text-[10px] px-2 py-1 rounded border border-slate-500/45 text-slate-300 hover:text-slate-100 hover:border-slate-300/65 transition-colors"
        >
          {locale === "zh-CN" ? "首页" : "Home"}
        </Link>
      </header>

      <ModeSelectorOverlay
        open={selectorOpen}
        currentMode={mode}
        onClose={() => setSelectorOpen(false)}
        onSelect={(nextMode) => {
          onModeChange(nextMode);
          setSelectorOpen(false);
        }}
      />
    </>
  );
}