"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useAgoraStore } from "@/lib/store";
import { StatusPill } from "@/components/common/StatusPill";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { useI18n } from "@/components/i18n/LanguageProvider";
import type { PanelMode } from "@/types";

interface CommandBarProps {
  sessionTitle?: string;
  mode: PanelMode;
  onModeChange: (mode: PanelMode) => void;
}

export function CommandBar({ sessionTitle, mode, onModeChange }: CommandBarProps) {
  const { isStreaming } = useAgoraStore();
  const { t } = useI18n();

  const modes: { key: PanelMode; label: string }[] = [
    { key: "council", label: t("command.council") },
    { key: "arena", label: t("command.arena") },
    { key: "board", label: t("command.board") },
    { key: "evolution", label: t("command.evolution") },
  ];

  return (
    <div className="h-12 shrink-0 px-3 sm:px-4 flex items-center gap-2 module-divider border-b border-agora-border/70 z-20">
      <Link
        href="/"
        className="font-tech text-sm text-cyan-200 hover:text-cyan-100 transition-colors tracking-[0.18em]"
      >
        AGORA
      </Link>

      {sessionTitle && (
        <>
          <span className="text-slate-500">/</span>
          <span className="text-xs text-slate-300 truncate max-w-28 sm:max-w-48 font-wisdom">
            {sessionTitle || t("command.sessionFallback")}
          </span>
        </>
      )}

      <StatusPill
        label={isStreaming ? "LIVE" : "IDLE"}
        variant={isStreaming ? "live" : "idle"}
        pulse={isStreaming}
      />

      <div className="ml-auto flex items-center gap-2">
        <LanguageToggle />
        <div className="inline-flex items-center rounded-lg border border-agora-border bg-agora-surface/70 p-0.5">
          {modes.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onModeChange(key)}
              className={clsx(
                "px-2 sm:px-3 py-1 text-[10px] font-semibold tracking-[0.15em] rounded-md transition-colors",
                mode === key
                  ? "text-cyan-100 bg-cyan-500/15 border border-cyan-400/35"
                  : "text-slate-400 hover:text-slate-100 border border-transparent"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

