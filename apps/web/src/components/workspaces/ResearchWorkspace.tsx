"use client";

import { useI18n } from "@/components/i18n/LanguageProvider";
import { CouncilChat } from "@/components/CouncilChat";

/**
 * ResearchWorkspace – integrates Council (multi-agent deliberation)
 * with a knowledge-base sidebar and research-focused styling.
 */
interface ResearchWorkspaceProps {
  sessionId: string;
}

export function ResearchWorkspace({ sessionId }: ResearchWorkspaceProps) {
  const { t } = useI18n();

  return (
    <div className="flex-1 flex flex-col overflow-hidden workspace-research">
      {/* ── Header strip ────────────────────────────────── */}
      <div className="shrink-0 px-4 py-2.5 flex items-center gap-3 border-b border-violet-500/10">
        <div className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(143,125,255,0.5)]" />
        <span className="font-tech text-[11px] tracking-[0.25em] text-violet-300/90 uppercase">
          {t("research.title")}
        </span>
        <div className="flex-1" />
        <span className="text-[9px] font-tech tracking-[0.15em] text-violet-400/60 uppercase">
          {t("research.knowledgeBase")}
        </span>
      </div>

      {/* ── Council Chat + Knowledge sidebar ────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main: Council chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <CouncilChat sessionId={sessionId} />
        </div>

        {/* Side: Knowledge base panel */}
        <div className="hidden xl:flex flex-col w-[260px] shrink-0 border-l border-violet-500/[0.08] bg-violet-950/[0.15]">
          <div className="px-3 py-3 border-b border-violet-500/[0.06]">
            <span className="font-tech text-[10px] tracking-[0.2em] text-violet-300/80 uppercase">
              {t("research.knowledgeBase")}
            </span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-10 h-10 rounded-lg bg-violet-500/[0.08] border border-violet-500/20 flex items-center justify-center mb-3">
              <span className="text-lg text-violet-300/60">📚</span>
            </div>
            <p className="text-[11px] text-violet-300/50 font-tech tracking-wide">
              {t("research.kbEmpty")}
            </p>
            <p className="text-[10px] text-slate-400/60 mt-1 max-w-[180px]">
              {t("research.kbHint")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
