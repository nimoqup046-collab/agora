"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { ArenaPanel } from "@/components/arena/ArenaPanel";
import { TaskBoard } from "@/components/board/TaskBoard";

interface CodingWorkspaceProps {
  sessionId: string;
}

const SWARM_AGENTS = [
  { id: "lead", name: "Lead", color: "#39d8ff", status: "active" },
  { id: "coder", name: "Coder", color: "#10b981", status: "coding" },
  { id: "reviewer", name: "Reviewer", color: "#8b5cf6", status: "reviewing" },
  { id: "evolutor", name: "Evolutor", color: "#e3c27a", status: "evolving" },
];

export function CodingWorkspace({ sessionId }: CodingWorkspaceProps) {
  const { t } = useI18n();

  return (
    <div className="flex-1 flex flex-col overflow-hidden workspace-coding">
      {/* ── Header strip ────────────────────────────────── */}
      <div className="shrink-0 px-4 py-2.5 flex items-center gap-3 border-b border-cyan-500/[0.06]">
        <div className="relative">
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(57,216,255,0.5)]" />
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-cyan-400/30 animate-ping" />
        </div>
        <span className="font-tech text-[11px] tracking-[0.25em] text-cyan-300/90 uppercase">
          {t("coding.title")}
        </span>
        <div className="flex-1" />

        {/* Swarm Agent Indicators */}
        <div className="hidden sm:flex items-center gap-1.5">
          {SWARM_AGENTS.map((agent) => (
            <motion.div
              key={agent.id}
              whileHover={{ scale: 1.15, y: -2 }}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-[8px] font-tech font-bold cursor-default"
              style={{
                background: `${agent.color}10`,
                border: `1px solid ${agent.color}25`,
                color: agent.color,
              }}
              title={`${agent.name} - ${agent.status}`}
            >
              {agent.name[0]}
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-1.5 ml-2">
          <span className="w-2 h-2 rounded-full bg-red-400/60" />
          <span className="w-2 h-2 rounded-full bg-amber-400/60" />
          <span className="w-2 h-2 rounded-full bg-emerald-400/60" />
        </div>
      </div>

      {/* ── Main Content: Arena + Board ──────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Arena Panel */}
        <div className="flex-1 overflow-auto border-b border-cyan-500/[0.04]">
          <ArenaPanel sessionId={sessionId} />
        </div>

        {/* Task Board */}
        <div className="h-[45%] min-h-[180px] overflow-auto">
          <TaskBoard sessionId={sessionId} />
        </div>
      </div>
    </div>
  );
}
