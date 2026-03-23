"use client";

import { AgentBadge, getAgentColor } from "./AgentBadge";
import { clsx } from "clsx";
import type { SessionMessage } from "@/lib/api";

interface MessageBubbleProps {
  message: SessionMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.agent_id === "user";
  const time = new Date(message.timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <div
      className={clsx(
        "flex flex-col gap-1 px-4 py-3 rounded-lg border",
        isUser
          ? "border-slate-700/50 bg-slate-800/20"
          : "border-agora-border bg-agora-surface/60"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <AgentBadge
          agentId={message.agent_id}
          agentName={message.agent_name}
          showDot={!isUser}
        />
        <span className="text-slate-600 text-xs ml-auto">{time}</span>
      </div>

      {/* Content */}
      <div
        className={clsx(
          "text-sm leading-relaxed whitespace-pre-wrap break-words",
          getAgentColor(message.agent_id)
        )}
      >
        {message.content}
      </div>
    </div>
  );
}

interface StreamingBubbleProps {
  agentId: string;
  agentName: string;
  content: string;
}

export function StreamingBubble({ agentId, agentName, content }: StreamingBubbleProps) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 rounded-lg border border-agora-accent/30 bg-agora-surface/60">
      <div className="flex items-center gap-2 mb-1">
        <AgentBadge agentId={agentId} agentName={agentName} showDot />
        <span className="text-agora-accent text-xs animate-pulse">streaming...</span>
      </div>
      <div
        className={clsx(
          "text-sm leading-relaxed whitespace-pre-wrap break-words",
          getAgentColor(agentId)
        )}
      >
        {content}
        <span className="inline-block w-2 h-4 bg-agora-accent/70 ml-0.5 animate-pulse align-middle" />
      </div>
    </div>
  );
}

export function TypingIndicator({ agentId, agentName }: { agentId: string; agentName: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-lg border border-agora-border bg-agora-surface/40">
      <AgentBadge agentId={agentId} agentName={agentName} showDot />
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="typing-dot w-1.5 h-1.5 rounded-full bg-slate-500"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}
