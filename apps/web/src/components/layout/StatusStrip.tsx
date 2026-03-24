"use client";

import { useEffect, useState } from "react";
import { useAgoraStore } from "@/lib/store";
import { healthApi } from "@/lib/api";

type HealthState = "checking" | "online" | "offline";

export function StatusStrip() {
  const { memoryCount, prCount, messages, isStreaming } = useAgoraStore();
  const [apiHealth, setApiHealth] = useState<HealthState>("checking");
  const [agentCount, setAgentCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const probe = async () => {
      try {
        const result = await healthApi.check();
        if (cancelled) return;
        setApiHealth("online");
        setAgentCount(typeof result.agents === "number" ? result.agents : null);
      } catch {
        if (cancelled) return;
        setApiHealth("offline");
        setAgentCount(null);
      }
    };

    probe();
    const timer = setInterval(probe, 15000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const healthClass =
    apiHealth === "online"
      ? "text-emerald-400"
      : apiHealth === "offline"
        ? "text-rose-400"
        : "text-amber-400";

  return (
    <div className="h-6 shrink-0 bg-agora-surface/80 border-t border-agora-border flex items-center px-3 sm:px-4 gap-3 sm:gap-4">
      <span className="text-[10px] text-slate-600 font-mono">MSGS: {messages.length}</span>
      <span className="text-[10px] text-slate-600 font-mono">MEM: {memoryCount}</span>
      <span className="text-[10px] text-slate-600 font-mono">PRS: {prCount}</span>

      <span className={`text-[10px] font-mono ${healthClass}`}>
        API: {apiHealth.toUpperCase()}
        {agentCount !== null ? ` (${agentCount})` : ""}
      </span>

      <div className="ml-auto flex items-center gap-1">
        <span className="text-[10px] text-slate-700 font-mono">
          {isStreaming ? "DELIBERATING..." : "READY"}
        </span>
      </div>
    </div>
  );
}