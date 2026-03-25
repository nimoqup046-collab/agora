"use client";

import { clsx } from "clsx";
import type { Subtask } from "@/types";

const PRIORITY_COLORS: Record<number, string> = {
  1: "text-rose-400 border-rose-700/40",
  2: "text-amber-400 border-amber-700/40",
  3: "text-sky-400 border-sky-700/40",
};

const AGENT_COLORS: Record<string, string> = {
  "claude-architect": "text-amber-500",
  "codex-implementer": "text-emerald-400",
  "meta-conductor": "text-violet-400",
};

interface TaskCardProps {
  task: Subtask;
  onStatusChange?: (status: Subtask["status"]) => void;
}

export function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const priorityClass = PRIORITY_COLORS[task.priority] || "text-slate-400 border-slate-600/40";
  const agentColor = AGENT_COLORS[task.assigned_to] || "text-slate-400";

  return (
    <div className="rounded border border-agora-border bg-agora-surface/60 p-2.5 space-y-2 group">
      <p className="text-xs text-slate-300 leading-snug">{task.description}</p>

      <div className="flex items-center gap-2">
        <span className={clsx("text-[9px] font-mono border rounded px-1.5 py-0.5", priorityClass)}>
          P{task.priority}
        </span>
        <span className={clsx("text-[9px] font-mono", agentColor)}>
          {task.assigned_to}
        </span>

        {onStatusChange && task.status !== "done" && (
          <button
            onClick={() => onStatusChange(task.status === "pending" ? "in_progress" : "done")}
            className="ml-auto text-[9px] text-slate-600 hover:text-agora-accent transition-colors opacity-0 group-hover:opacity-100"
          >
            {task.status === "pending" ? "→ START" : "→ DONE"}
          </button>
        )}
      </div>
    </div>
  );
}
