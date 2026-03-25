"use client";

import { clsx } from "clsx";

const AGENT_COLORS: Record<string, string> = {
  "claude-architect": "border-amber-600 text-amber-500 bg-amber-600/10",
  "codex-implementer": "border-emerald-600 text-emerald-400 bg-emerald-600/10",
  "meta-conductor": "border-violet-500 text-violet-400 bg-violet-500/10",
  user: "border-slate-600 text-slate-400 bg-slate-600/10",
};

const AGENT_DOTS: Record<string, string> = {
  "claude-architect": "bg-amber-500",
  "codex-implementer": "bg-emerald-400",
  "meta-conductor": "bg-violet-400",
  user: "bg-slate-400",
};

interface AgentBadgeProps {
  agentId: string;
  agentName: string;
  showDot?: boolean;
  className?: string;
}

export function AgentBadge({
  agentId,
  agentName,
  showDot = false,
  className,
}: AgentBadgeProps) {
  const colorClass = AGENT_COLORS[agentId] || "border-slate-600 text-slate-300 bg-slate-600/10";
  const dotClass = AGENT_DOTS[agentId] || "bg-slate-400";

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border font-medium",
        colorClass,
        className
      )}
    >
      {showDot && (
        <span className={clsx("w-1.5 h-1.5 rounded-full", dotClass)} />
      )}
      {agentName}
    </span>
  );
}

export function getAgentColor(agentId: string): string {
  const map: Record<string, string> = {
    "claude-architect": "text-amber-500",
    "codex-implementer": "text-emerald-400",
    "meta-conductor": "text-violet-400",
    user: "text-slate-400",
  };
  return map[agentId] || "text-slate-300";
}
