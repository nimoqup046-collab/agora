"use client";

import { Beaker } from "lucide-react";
import { CouncilChat } from "@/components/CouncilChat";
import { useI18n } from "@/components/i18n/LanguageProvider";

interface ResearchModeProps {
  sessionId: string;
}

export function ResearchMode({ sessionId }: ResearchModeProps) {
  const { locale } = useI18n();

  return (
    <div className="h-full grid grid-rows-[auto_1fr] bg-gradient-to-br from-zinc-950 via-black to-zinc-950">
      <div className="bg-zinc-900/50 backdrop-blur-3xl border-b border-white/10 p-6 flex items-center gap-3">
        <Beaker className="w-4 h-4 text-purple-400 shrink-0" />
        <div className="flex-1">
          <p className="font-mono text-xs tracking-[2px] text-purple-400 uppercase">
            {locale === "zh-CN" ? "科研模式" : "RESEARCH MODE"}
          </p>
          <p className="text-[11px] text-slate-300/80 mt-1">
            {locale === "zh-CN"
              ? "科学议事厅 · 证据链讨论 · 结论收敛"
              : "Scientific council, evidence chain, and convergent conclusions"}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.8)] [animation-delay:0.3s]" />
          <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse shadow-[0_0_8px_rgba(147,51,234,0.8)] [animation-delay:0.6s]" />
        </div>
      </div>
      <div className="min-h-0 p-3">
        <div className="h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
          <CouncilChat sessionId={sessionId} />
        </div>
      </div>
    </div>
  );
}
