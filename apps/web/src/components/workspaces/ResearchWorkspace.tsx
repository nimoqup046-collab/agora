"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { CouncilChat } from "@/components/CouncilChat";

interface ResearchWorkspaceProps {
  sessionId: string;
}

export function ResearchWorkspace({ sessionId }: ResearchWorkspaceProps) {
  const { t } = useI18n();

  return (
    <div className="flex-1 flex flex-col overflow-hidden workspace-research">
      {/* ── Header strip ────────────────────────────────── */}
      <div className="shrink-0 px-4 py-2.5 flex items-center gap-3 border-b border-violet-500/[0.06]">
        <div className="relative">
          <div className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(143,125,255,0.5)]" />
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-violet-400/30 animate-ping" />
        </div>
        <span className="font-tech text-[11px] tracking-[0.25em] text-violet-300/90 uppercase">
          {t("research.title")}
        </span>
        <div className="flex-1" />
        <span className="text-[9px] font-tech tracking-[0.15em] text-violet-400/50 uppercase flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-violet-400/50" />
          {t("research.knowledgeBase")}
        </span>
      </div>

      {/* ── Council Chat + Knowledge Sidebar ────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main: Council chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <CouncilChat sessionId={sessionId} />
        </div>

        {/* Side: Knowledge base panel */}
        <div className="hidden xl:flex flex-col w-[260px] shrink-0 border-l border-violet-500/[0.04]"
          style={{
            background: "linear-gradient(180deg, rgba(143,125,255,0.03), rgba(5,8,16,0.5))",
          }}
        >
          <div className="px-4 py-3 border-b border-violet-500/[0.04]">
            <span className="font-tech text-[10px] tracking-[0.2em] text-violet-300/70 uppercase">
              {t("research.knowledgeBase")}
            </span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
            {/* Knowledge Orb Visualization */}
            <div className="relative w-20 h-20 mb-4">
              <div
                className="absolute inset-0 rounded-full pulse-ring"
                style={{
                  background: "radial-gradient(circle, rgba(143,125,255,0.08), transparent 70%)",
                  border: "1px solid rgba(143,125,255,0.1)",
                }}
              />
              <div
                className="absolute inset-3 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(143,125,255,0.12), transparent 60%)",
                  border: "1px solid rgba(143,125,255,0.15)",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="4" fill="rgba(143,125,255,0.3)" />
                  <circle cx="12" cy="12" r="8" stroke="rgba(143,125,255,0.15)" strokeWidth="0.5" strokeDasharray="3 4" />
                </svg>
              </div>
            </div>
            <p className="text-[11px] text-violet-300/50 font-tech tracking-wide">
              {t("research.kbEmpty")}
            </p>
            <p className="text-[10px] text-slate-500/60 mt-1.5 max-w-[180px] leading-relaxed">
              {t("research.kbHint")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
