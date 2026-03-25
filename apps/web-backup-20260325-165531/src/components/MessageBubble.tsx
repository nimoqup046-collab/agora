"use client";

import { motion } from "framer-motion";
import { AgentBadge, getAgentColor } from "./AgentBadge";
import { clsx } from "clsx";
import type { SessionMessage } from "@/lib/api";

const AGENT_BORDER: Record<string, string> = {
  "claude-architect": "border-l-amber-600/50",
  "codex-implementer": "border-l-emerald-600/50",
  "meta-conductor": "border-l-violet-500/50",
  user: "border-l-slate-600/50",
};

interface MessageBubbleProps {
  message: SessionMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.agent_id === "user";
  const borderColor = AGENT_BORDER[message.agent_id] || "border-l-slate-600/50";
  const time = new Date(message.timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={clsx(
        "flex flex-col gap-1 px-3 py-2.5 rounded border border-agora-border border-l-2",
        borderColor,
        isUser ? "bg-slate-800/20" : "bg-agora-surface/60"
      )}
    >
      <div className="flex items-center gap-2 mb-0.5">
        <AgentBadge
          agentId={message.agent_id}
          agentName={message.agent_name}
          showDot={!isUser}
        />
        <span className="text-slate-700 text-[10px] ml-auto font-mono">{time}</span>
      </div>

      <div
        className={clsx(
          "text-sm leading-relaxed whitespace-pre-wrap break-words",
          getAgentColor(message.agent_id)
        )}
      >
        {message.content}
      </div>
    </motion.div>
  );
}

interface StreamingBubbleProps {
  agentId: string;
  agentName: string;
  content: string;
}

export function StreamingBubble({ agentId, agentName, content }: StreamingBubbleProps) {
  const borderColor = AGENT_BORDER[agentId] || "border-l-slate-600/50";

  return (
    <div
      className={clsx(
        "flex flex-col gap-1 px-3 py-2.5 rounded border border-agora-accent/30 border-l-2",
        borderColor,
        "bg-agora-surface/60"
      )}
    >
      <div className="flex items-center gap-2 mb-0.5">
        <AgentBadge agentId={agentId} agentName={agentName} showDot />
        <span className="text-agora-accent text-[10px] animate-pulse font-mono">STREAMING</span>
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
    <div className="flex items-center gap-3 px-3 py-2 rounded border border-agora-border bg-agora-surface/40">
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
