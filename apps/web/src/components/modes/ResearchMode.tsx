"use client";

import { CouncilChat } from "@/components/CouncilChat";
import { useI18n } from "@/components/i18n/LanguageProvider";

interface ResearchModeProps {
  sessionId: string;
}

export function ResearchMode({ sessionId }: ResearchModeProps) {
  const { locale } = useI18n();

  return (
    <div className="h-full grid grid-rows-[auto_1fr] bg-gradient-to-br from-[#060a18] via-[#091129] to-[#0a1222]">
      <div className="border-b border-violet-300/20 px-4 py-3">
        <p className="font-tech text-xs tracking-[0.18em] text-violet-100">
          {locale === "zh-CN" ? "科研模式" : "RESEARCH MODE"}
        </p>
        <p className="text-[11px] text-slate-300/80 mt-1">
          {locale === "zh-CN"
            ? "科学议事厅 · 证据链讨论 · 结论收敛"
            : "Scientific council, evidence chain, and convergent conclusions"}
        </p>
      </div>
      <div className="min-h-0 p-3">
        <div className="h-full rounded-xl border border-violet-300/22 bg-black/30 backdrop-blur-xl overflow-hidden">
          <CouncilChat sessionId={sessionId} />
        </div>
      </div>
    </div>
  );
}
