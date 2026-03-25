"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LayoutGrid, Activity, ShieldCheck, Cpu } from "lucide-react";
import { useAgoraStore } from "@/lib/store";
import { StatusPill } from "@/components/common/StatusPill";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { ModeSelectorOverlay } from "@/components/layout/ModeSelectorOverlay";
import { MENU_ITEMS } from "@/components/menu/AgoraMenu";
import type { PanelMode } from "@/types";

interface CommandBarProps {
  sessionTitle?: string;
  mode: PanelMode;
  onModeChange: (mode: PanelMode) => void;
}

const AGENT_DOT_COLORS = [
  "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]",
  "bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.8)]",
  "bg-cyan-500 shadow-[0_0_6px_rgba(34,211,238,0.8)]",
  "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]",
  "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]",
];

export function CommandBar({ sessionTitle, mode, onModeChange }: CommandBarProps) {
  const { isStreaming } = useAgoraStore();
  const { locale, t } = useI18n();
  const [selectorOpen, setSelectorOpen] = useState(false);

  const modeLabel = useMemo(() => t(`menu.${mode}`), [mode, t]);
  const currentItem = useMemo(() => MENU_ITEMS.find((item) => item.mode === mode), [mode]);

  return (
    <>
      <div className="h-12 shrink-0 px-3 sm:px-4 flex items-center gap-2 bg-black/40 backdrop-blur-2xl border-b border-white/5 z-20">
        {/* AGORA button: mode-colored bg + glow */}
        <button
          type="button"
          onClick={() => setSelectorOpen(true)}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${currentItem?.color ?? "#3b82f6"}40, ${currentItem?.color ?? "#3b82f6"}20)`,
            border: `1px solid ${currentItem?.color ?? "#3b82f6"}50`,
            boxShadow: `0 0 18px ${currentItem?.color ?? "#3b82f6"}55`,
          }}
          title={locale === "zh-CN" ? "打开模式选择器" : "Open mode selector"}
        >
          <LayoutGrid className="w-3.5 h-3.5" style={{ color: currentItem?.color ?? "#3b82f6" }} />
        </button>

        {/* AGORA label */}
        <span className="font-mono text-xs tracking-widest text-white/60 hidden sm:block">AGORA</span>

        {sessionTitle && (
          <>
            <span className="text-white/20">/</span>
            <span className="font-mono text-[11px] text-white/50 truncate max-w-28 sm:max-w-48">
              {sessionTitle || t("command.sessionFallback")}
            </span>
          </>
        )}

        {/* Center: mode badge pill */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: currentItem?.color ?? "#3b82f6",
                boxShadow: `0 0 6px ${currentItem?.color ?? "#3b82f6"}`,
              }}
            />
            <span
              className="font-mono text-[10px] tracking-widest"
              style={{ color: currentItem?.color ?? "#3b82f6" }}
            >
              {modeLabel.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Agent dots */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
            {AGENT_DOT_COLORS.map((cls, idx) => (
              <span key={idx} className={`w-2 h-2 rounded-full ${cls}`} />
            ))}
          </div>

          {/* Status icons */}
          <div className="hidden sm:flex items-center gap-1.5">
            <Activity
              className="w-3.5 h-3.5"
              style={{
                color: isStreaming ? "#22d3ee" : "rgba(255,255,255,0.2)",
                filter: isStreaming ? "drop-shadow(0 0 4px rgba(34,211,238,0.8))" : "none",
              }}
            />
            <ShieldCheck className="w-3.5 h-3.5 text-white/20" />
            <Cpu className="w-3.5 h-3.5 text-white/20" />
          </div>

          <StatusPill
            label={isStreaming ? "LIVE" : "IDLE"}
            variant={isStreaming ? "live" : "idle"}
            pulse={isStreaming}
          />

          <LanguageToggle />

          <Link
            href="/"
            className="font-mono text-[10px] tracking-widest px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-white/40 hover:text-white/70 hover:border-white/20 hover:bg-white/10 transition-all duration-200"
          >
            {locale === "zh-CN" ? "首页" : "HOME"}
          </Link>
        </div>
      </div>

      <ModeSelectorOverlay
        open={selectorOpen}
        currentMode={mode}
        onClose={() => setSelectorOpen(false)}
        onSelect={onModeChange}
      />
    </>
  );
}
