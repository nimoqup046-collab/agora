"use client";

import { useAgoraStore } from "@/lib/store";
import { DecomposeButton } from "./DecomposeButton";
import { TaskCard } from "./TaskCard";
import { SectionHeader } from "@/components/common/SectionHeader";
import type { Subtask } from "@/types";

interface TaskBoardProps {
  sessionId: string;
}

const COLUMNS: { key: Subtask["status"]; label: string }[] = [
  { key: "pending", label: "PENDING" },
  { key: "in_progress", label: "IN PROGRESS" },
  { key: "done", label: "DONE" },
];

export function TaskBoard({ sessionId }: TaskBoardProps) {
  const { tasks, updateTaskStatus } = useAgoraStore();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <SectionHeader
        title="TASK BOARD"
        right={<DecomposeButton sessionId={sessionId} />}
      />

      <div className="flex-1 overflow-hidden flex gap-0">
        {COLUMNS.map(({ key, label }) => {
          const colTasks = tasks.filter((t) => t.status === key);
          return (
            <div key={key} className="flex-1 flex flex-col overflow-hidden border-r border-agora-border last:border-r-0">
              <div className="px-3 py-1.5 border-b border-agora-border shrink-0">
                <span className="text-[9px] font-semibold text-slate-600 tracking-widest">
                  {label}
                </span>
                <span className="text-[9px] text-slate-700 ml-2">({colTasks.length})</span>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={(status) => updateTaskStatus(task.id, status)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {tasks.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-20">
          <p className="text-xs text-slate-700">Click DECOMPOSE to generate tasks from the session.</p>
        </div>
      )}
    </div>
  );
}
