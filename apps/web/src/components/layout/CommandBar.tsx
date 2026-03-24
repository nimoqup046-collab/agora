"use client";

import Link from "next/link";
import { useAgoraStore } from "@/lib/store";
import { StatusPill } from "@/components/common/StatusPill";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { AgoraMenu } from "@/components/menu/AgoraMenu";
import type { PanelMode } from "@/types";

interface CommandBarProps {
  sessionTitle?: string;
  mode: PanelMode;
  onModeChange: (mode: PanelMode) => void;
}

export function CommandBar({ sessionTitle, mode, onModeChange }: CommandBarProps) {
  const { isStreaming } = useAgoraStore();
  const { t } = useI18n();

  return (
    <div className="command-bar-glass h-12 shrink-0 px-3 sm:px-4 flex items-center gap-2 border-b border-white/[0.06] z-20">
      {/* ── Logo + Orbital Menu ─────────────────────────── */}
      <AgoraMenu currentMode={mode} onModeChange={onModeChange} />

      {sessionTitle && (
        <>
          <span className="text-slate-500/60">/</span>
          <span className="text-xs text-slate-300/80 truncate max-w-28 sm:max-w-48 font-wisdom">
            {sessionTitle || t("command.sessionFallback")}
          </span>
        </>
      )}

      <StatusPill
        label={isStreaming ? "LIVE" : "IDLE"}
        variant={isStreaming ? "live" : "idle"}
        pulse={isStreaming}
      />

      {/* ── Current mode badge ──────────────────────────── */}
      <div className="ml-auto flex items-center gap-3">
        <span className="hidden sm:inline-block text-[9px] font-tech tracking-[0.2em] text-slate-400 uppercase">
          {t(`menu.${mode}`)}
        </span>
        <LanguageToggle />
      </div>
    </div>
  );
}

