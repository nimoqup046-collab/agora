"use client";

import { useI18n } from "@/components/i18n/LanguageProvider";
import { ArenaPanel } from "@/components/arena/ArenaPanel";
import { TaskBoard } from "@/components/board/TaskBoard";

/**
 * CodingWorkspace – integrates Arena (action proposals) and Board (task board)
 * into a single coding-focused interface with a split-pane IDE feel.
 */
interface CodingWorkspaceProps {
  sessionId: string;
}

export function CodingWorkspace({ sessionId }: CodingWorkspaceProps) {
  const { t } = useI18n();

  return (
    <div className="flex-1 flex flex-col overflow-hidden workspace-coding">
      {/* ── Header strip ────────────────────────────────── */}
      <div className="shrink-0 px-4 py-2.5 flex items-center gap-3 border-b border-cyan-500/10">
        <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(57,216,255,0.5)]" />
        <span className="font-tech text-[11px] tracking-[0.25em] text-cyan-300/90 uppercase">
          {t("coding.title")}
        </span>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400/80" />
          <span className="w-2 h-2 rounded-full bg-amber-400/80" />
          <span className="w-2 h-2 rounded-full bg-emerald-400/80" />
        </div>
      </div>

      {/* ── Split Panes: Arena (top) + Board (bottom) ──── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto border-b border-cyan-500/[0.06]">
          <ArenaPanel sessionId={sessionId} />
        </div>
        <div className="h-[45%] min-h-[180px] overflow-auto">
          <TaskBoard sessionId={sessionId} />
        </div>
      </div>
    </div>
  );
}
