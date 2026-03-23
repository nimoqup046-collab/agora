"use client";

import { useEffect } from "react";
import { useAgoraStore } from "@/lib/store";
import { agentsApi } from "@/lib/api";
import { AgentBadge } from "./AgentBadge";
import { clsx } from "clsx";

const ROLE_LABELS: Record<string, string> = {
  architect: "Architect",
  implementer: "Implementer",
  conductor: "Conductor",
};

export function AgentPanel() {
  const { agents, setAgents, streamingAgents } = useAgoraStore();

  useEffect(() => {
    agentsApi.list().then(setAgents).catch(console.error);
  }, [setAgents]);

  return (
    <aside className="w-56 shrink-0 border-r border-agora-border bg-agora-surface flex flex-col">
      <div className="px-4 py-3 border-b border-agora-border">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Council Members
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto py-2 space-y-1 px-2">
        {agents.map((agent) => {
          const isStreaming = !!streamingAgents[agent.agent_id];
          return (
            <div
              key={agent.agent_id}
              className={clsx(
                "rounded-lg px-3 py-2.5 space-y-1 transition-colors",
                isStreaming
                  ? "bg-agora-accent/10 border border-agora-accent/30"
                  : "bg-agora-bg/50"
              )}
            >
              <div className="flex items-center justify-between">
                <AgentBadge
                  agentId={agent.agent_id}
                  agentName={agent.name}
                  showDot
                />
                {isStreaming && (
                  <span className="text-[10px] text-agora-accent animate-pulse">
                    thinking...
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600">
                {ROLE_LABELS[agent.role] || agent.role}
              </p>
              <div className="flex flex-wrap gap-1">
                {agent.capabilities.slice(0, 2).map((cap) => (
                  <span
                    key={cap}
                    className="text-[9px] text-slate-600 bg-agora-border/40 px-1.5 py-0.5 rounded"
                  >
                    {cap.replace("_", " ")}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-3 border-t border-agora-border">
        <p className="text-[10px] text-slate-600">Phase 1 · Council MVP</p>
      </div>
    </aside>
  );
}
