"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { useAgoraStore } from "@/lib/store";
import { sessionsApi } from "@/lib/api";

export function SessionSidebar() {
  const router = useRouter();
  const {
    sessions,
    setSessions,
    currentSessionId,
    setCurrentSessionId,
    isCreatingSession,
    setIsCreatingSession,
  } = useAgoraStore();

  const [newTask, setNewTask] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    sessionsApi
      .list()
      .then((items) => {
        setSessions(items);
        setLoadError(null);
      })
      .catch((err) => {
        console.error(err);
        setLoadError("Unable to load sessions. Check API connection.");
      });
  }, [setSessions]);

  const createSession = async () => {
    if (!newTask.trim()) return;
    setIsCreatingSession(true);
    try {
      const session = await sessionsApi.create({
        title: newTask.slice(0, 80),
        task: newTask,
      });
      setSessions([...sessions, session]);
      setCurrentSessionId(session.id);
      router.push(`/council/${session.id}`);
      setNewTask("");
      setShowForm(false);
      setLoadError(null);
    } catch (err) {
      console.error("Failed to create session:", err);
      setLoadError("Session creation failed. Verify backend and try again.");
    } finally {
      setIsCreatingSession(false);
    }
  };

  return (
    <div className="w-full lg:w-64 shrink-0 border-r border-agora-border bg-agora-surface flex flex-col h-full">
      <div className="px-4 py-3 border-b border-agora-border flex items-center justify-between shrink-0">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Sessions
        </h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-agora-accent hover:text-agora-accent/80 text-lg leading-none"
          title="New session"
        >
          +
        </button>
      </div>

      {showForm && (
        <div className="p-3 border-b border-agora-border space-y-2 shrink-0">
          <textarea
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Describe the task for this council session..."
            rows={3}
            className="w-full bg-agora-bg border border-agora-border rounded px-2 py-1.5 text-xs text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-agora-accent/60"
          />
          <button
            onClick={createSession}
            disabled={!newTask.trim() || isCreatingSession}
            className="w-full py-1.5 rounded bg-agora-accent text-white text-xs hover:bg-agora-accent/90 disabled:opacity-40 transition-colors"
          >
            {isCreatingSession ? "Creating..." : "Start Session"}
          </button>
        </div>
      )}

      {loadError && (
        <div className="px-3 py-2 border-b border-agora-border text-[11px] text-rose-400 bg-rose-950/20 shrink-0">
          {loadError}
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-1">
        {sessions.length === 0 && !loadError && (
          <p className="text-center text-xs text-slate-600 py-6 px-4">
            No sessions yet. Create one and start a multi-agent run.
          </p>
        )}

        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => {
              setCurrentSessionId(session.id);
              router.push(`/council/${session.id}`);
            }}
            className={clsx(
              "w-full text-left px-3 py-2.5 hover:bg-agora-bg/80 transition-colors border-l-2",
              currentSessionId === session.id
                ? "border-agora-accent bg-agora-accent/5"
                : "border-transparent"
            )}
          >
            <p className="text-xs text-slate-300 truncate">{session.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={clsx(
                  "text-[10px] px-1.5 rounded-full",
                  session.status === "active"
                    ? "text-emerald-400 bg-emerald-400/10"
                    : "text-slate-500 bg-slate-700/30"
                )}
              >
                {session.status}
              </span>
              <span className="text-[10px] text-slate-600">
                {session.message_count} msgs
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}