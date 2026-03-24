"use client";

import Link from "next/link";
import { useAgoraStore } from "@/lib/store";
import { StatusPill } from "@/components/common/StatusPill";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { AgoraMenu, MENU_ITEMS } from "@/components/menu/AgoraMenu";
import type { PanelMode } from "@/types";

interface CommandBarProps {
  sessionTitle?: string;
  mode: PanelMode;
  onModeChange: (mode: PanelMode) => void;
}

export function CommandBar({ sessionTitle, mode, onModeChange }: CommandBarProps) {
  const { isStreaming, agents } = useAgoraStore();
  const { t } = useI18n();

  const currentItem = MENU_ITEMS.find((m) => m.mode === mode);

  return (
    <div className="command-bar-glass h-12 shrink-0 px-3 sm:px-4 flex items-center gap-2 z-20">
      {/* ── Logo + Mode Selector ─────────────────────────── */}
      <AgoraMenu currentMode={mode} onModeChange={onModeChange} />

      {sessionTitle && (
        <>
          <span className="text-slate-600">/</span>
          <span className="text-xs text-slate-400/80 truncate max-w-28 sm:max-w-48">
            {sessionTitle || t("command.sessionFallback")}
          </span>
        </>
      )}

      {/* ── Current mode pill (glassmorphism) ──────────── */}
      <div
        className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-tech tracking-[0.15em]"
        style={{
          background: `${currentItem?.color}10`,
          border: `1px solid ${currentItem?.color}25`,
          color: currentItem?.color,
        }}
      >
        <div
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: currentItem?.color }}
        />
        {t(`menu.${mode}`)}
      </div>

      <div className="flex-1" />

      {/* ── Agent Status Indicators ──────────────────────── */}
      <div className="hidden md:flex items-center gap-1 mr-2">
        {["C", "X", "M"].map((label, i) => {
          const colors = ["#d97706", "#10b981", "#8b5cf6"];
          return (
            <div
              key={label}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-[8px] font-tech font-bold transition-all"
              style={{
                background: `${colors[i]}12`,
                border: `1px solid ${colors[i]}25`,
                color: `${colors[i]}cc`,
              }}
              title={["Claude", "Codex", "Meta-Agent"][i]}
            >
              {label}
            </div>
          );
        })}
      </div>

      <StatusPill
        label={isStreaming ? "LIVE" : "IDLE"}
        variant={isStreaming ? "live" : "idle"}
        pulse={isStreaming}
      />

      <LanguageToggle />
    </div>
  );
}
