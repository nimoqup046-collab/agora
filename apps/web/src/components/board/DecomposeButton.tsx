"use client";

import { useState } from "react";
import { councilApi } from "@/lib/api";
import { useAgoraStore } from "@/lib/store";
import type { Subtask } from "@/types";

interface DecomposeButtonProps {
  sessionId: string;
}

export function DecomposeButton({ sessionId }: DecomposeButtonProps) {
  const { setTasks } = useAgoraStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDecompose = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await councilApi.decompose(sessionId);
      const tasks: Subtask[] = res.subtasks.map((t) => ({
        id: t.id,
        description: t.description,
        assigned_to: t.assigned_to,
        priority: t.priority,
        status: (t.status as Subtask["status"]) || "pending",
      }));
      setTasks(tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Decompose failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleDecompose}
        disabled={loading}
        className="px-3 py-1 rounded border border-agora-accent/40 text-[10px] text-agora-accent hover:bg-agora-accent/10 transition-colors disabled:opacity-50 font-mono tracking-widest"
      >
        {loading ? "DECOMPOSING..." : "DECOMPOSE"}
      </button>
      {error && (
        <span className="text-[10px] text-rose-400">{error}</span>
      )}
    </div>
  );
}
