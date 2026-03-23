"use client";

import { clsx } from "clsx";
import { getAgentColor } from "@/components/AgentBadge";

interface ThinkingBlockProps {
  agentId: string;
  agentName: string;
}

export function ThinkingBlock({ agentId, agentName }: ThinkingBlockProps) {
  return (
    <div
      className={clsx(
        "flex items-center gap-3 px-3 py-2 rounded border border-agora-accent/20 bg-agora-surface/40"
      )}
    >
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={clsx(
              "w-1 h-1 rounded-full animate-bounce",
              getAgentColor(agentId).replace("text-", "bg-").split(" ")[0]
            )}
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <span className={clsx("text-xs font-mono", getAgentColor(agentId))}>
        {agentName}
      </span>
      <span className="text-[10px] text-slate-600 animate-pulse">thinking...</span>
    </div>
  );
}
