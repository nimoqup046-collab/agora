"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useAgoraStore } from "@/lib/store";
import { StatusPill } from "@/components/common/StatusPill";
import type { PanelMode } from "@/types";

const MODES: { key: PanelMode; label: string }[] = [
  { key: "council", label: "COUNCIL" },
  { key: "arena", label: "ARENA" },
  { key: "board", label: "BOARD" },
];

interface CommandBarProps {
  sessionTitle?: string;
  mode: PanelMode;
  onModeChange: (mode: PanelMode) => void;
}

export function CommandBar({ sessionTitle, mode, onModeChange }: CommandBarProps) {
  const { isStreaming } = useAgoraStore();

  return (
    <div className="h-10 shrink-0 bg-agora-surface border-b border-agora-border flex items-center px-3 sm:px-4 gap-2 sm:gap-3 z-10">
      <Link
        href="/"
        className="text-sm font-bold text-slate-200 hover:text-agora-accent transition-colors tracking-wider"
      >
        AGORA
      </Link>

      {sessionTitle && (
        <>
          <span className="text-slate-700">/</span>
          <span className="text-xs text-slate-400 font-mono truncate max-w-32 sm:max-w-48">
            {sessionTitle}
          </span>
        </>
      )}

      <StatusPill
        label={isStreaming ? "LIVE" : "IDLE"}
        variant={isStreaming ? "live" : "idle"}
        pulse={isStreaming}
      />

      <div className="ml-auto flex items-center gap-0.5">
        {MODES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onModeChange(key)}
            className={clsx(
              "px-2 sm:px-3 py-1 text-[10px] font-semibold tracking-widest rounded transition-colors",
              mode === key
                ? "text-agora-accent bg-agora-accent/10 border border-agora-accent/30"
                : "text-slate-500 hover:text-slate-300 border border-transparent"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}