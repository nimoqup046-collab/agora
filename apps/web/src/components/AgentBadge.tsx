"use client";

import { clsx } from "clsx";

const AGENT_COLORS: Record<string, string> = {
  "claude-architect": "border-amber-500/50 text-amber-200 bg-amber-500/10",
  "codex-implementer": "border-emerald-500/50 text-emerald-200 bg-emerald-500/10",
  "meta-conductor": "border-violet-500/50 text-violet-200 bg-violet-500/10",
  user: "border-cyan-500/45 text-cyan-100 bg-cyan-500/10",
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
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border font-tech tracking-[0.08em]",
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
