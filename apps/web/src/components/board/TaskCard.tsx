"use client";

import { clsx } from "clsx";
import { useI18n } from "@/components/i18n/LanguageProvider";
import type { Subtask } from "@/types";

const PRIORITY_COLORS: Record<number, string> = {
  1: "text-rose-300 border-rose-500/45",
  2: "text-amber-300 border-amber-500/45",
  3: "text-sky-300 border-sky-500/45",
};

const AGENT_COLORS: Record<string, string> = {
  "claude-architect": "text-amber-300",
  "codex-implementer": "text-emerald-300",
  "meta-conductor": "text-violet-300",
};

interface TaskCardProps {
  task: Subtask;
  onStatusChange?: (status: Subtask["status"]) => void;
}

export function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const { t } = useI18n();
  const priorityClass = PRIORITY_COLORS[task.priority] || "text-slate-300 border-slate-500/45";
  const agentColor = AGENT_COLORS[task.assigned_to] || "text-slate-300";

  return (
    <div className="rounded border border-agora-border/70 module-divider p-2.5 space-y-2 group">
      <p className="text-xs text-slate-200 leading-snug">{task.description}</p>

      <div className="flex items-center gap-2">
        <span className={clsx("text-[9px] font-tech border rounded px-1.5 py-0.5", priorityClass)}>
          P{task.priority}
        </span>
        <span className={clsx("text-[9px] font-tech tracking-[0.08em]", agentColor)}>
          {task.assigned_to}
        </span>

        {onStatusChange && task.status !== "done" && (
          <button
            onClick={() => onStatusChange(task.status === "pending" ? "in_progress" : "done")}
            className="ml-auto text-[9px] text-slate-400 hover:text-cyan-200 transition-colors opacity-0 group-hover:opacity-100 font-tech tracking-[0.1em]"
          >
            {task.status === "pending" ? `> ${t("board.start")}` : `> ${t("board.markDone")}`}
          </button>
        )}
      </div>
    </div>
  );
}

