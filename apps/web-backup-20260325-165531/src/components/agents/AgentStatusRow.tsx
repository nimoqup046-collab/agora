"use client";

import { clsx } from "clsx";
import { AgentBadge, getAgentColor } from "@/components/AgentBadge";
import { CapabilityBar } from "./CapabilityBar";
import type { Agent } from "@/lib/api";

interface AgentStatusRowProps {
  agent: Agent;
  isStreaming: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  architect: "ARCHITECT",
  implementer: "IMPLEMENTER",
  conductor: "CONDUCTOR",
};

export function AgentStatusRow({ agent, isStreaming }: AgentStatusRowProps) {
  return (
    <div
      className={clsx(
        "rounded px-3 py-2 space-y-1.5 transition-colors border",
        isStreaming
          ? "bg-agora-accent/5 border-agora-accent/20"
          : "bg-agora-bg/50 border-transparent"
      )}
    >
      <div className="flex items-center justify-between">
        <AgentBadge agentId={agent.agent_id} agentName={agent.name} showDot />
        <span
          className={clsx(
            "text-[9px] font-mono tracking-widest",
            isStreaming ? "text-agora-accent animate-pulse" : "text-slate-700"
          )}
        >
          {isStreaming ? "THINKING" : ROLE_LABELS[agent.role] || agent.role.toUpperCase()}
        </span>
      </div>
      <CapabilityBar capabilities={agent.capabilities.slice(0, 3)} />
    </div>
  );
}
