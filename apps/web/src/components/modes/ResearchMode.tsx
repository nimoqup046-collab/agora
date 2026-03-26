"use client";

import { BookOpen, FileSearch, Globe2, Lightbulb } from "lucide-react";
import { CouncilChat } from "@/components/CouncilChat";
import { useI18n } from "@/components/i18n/LanguageProvider";

interface ResearchModeProps {
  sessionId: string;
}

export function ResearchMode({ sessionId }: ResearchModeProps) {
  const { locale, t } = useI18n();

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#070918] via-[#09061a] to-[#080d1b] text-white">
      <div className="h-11 px-4 border-b border-white/10 bg-black/45 backdrop-blur-xl flex items-center justify-between">
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-violet-100">
          {locale === "zh-CN" ? "科研模式" : "Research Mode"}
        </p>
        <span className="text-[10px] px-2 py-1 rounded border border-violet-400/35 text-violet-200 uppercase font-mono">
          Council Live
        </span>
      </div>

      <div className="flex-1 min-h-0 p-3 grid grid-cols-1 xl:grid-cols-[minmax(0,1.65fr)_320px] gap-3">
        <section className="min-h-0 rounded-2xl border border-violet-300/22 bg-black/35 backdrop-blur-xl overflow-hidden">
          <CouncilChat sessionId={sessionId} />
        </section>

        <aside className="rounded-2xl border border-violet-300/22 bg-violet-500/8 backdrop-blur-2xl p-3 flex flex-col min-h-[220px] xl:min-h-0">
          <p className="text-[10px] uppercase tracking-[0.18em] font-mono text-violet-100/95">
            {locale === "zh-CN" ? "知识球谱" : "Knowledge Sphere"}
          </p>

          <div className="mt-3 rounded-xl border border-violet-300/25 bg-black/35 p-3">
            <div className="flex items-center gap-2 text-xs font-mono text-violet-100">
              <Globe2 className="w-4 h-4" />
              {t("research.knowledgeBase")}
            </div>
            <p className="mt-2 text-[11px] text-slate-300/85 leading-relaxed">{t("research.kbHint")}</p>
          </div>

          <div className="mt-2 rounded-xl border border-cyan-300/25 bg-cyan-500/8 p-3">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-100 uppercase tracking-[0.12em]">
              <FileSearch className="w-4 h-4" />
              {locale === "zh-CN" ? "证据链" : "Evidence Chain"}
            </div>
            <ul className="mt-2 space-y-1 text-[11px] text-slate-200/90">
              <li>• arXiv / PubMed / Internal Notes</li>
              <li>• Cross-session memory distillation</li>
              <li>• Multi-agent source checking</li>
            </ul>
          </div>

          <div className="mt-2 rounded-xl border border-amber-300/25 bg-amber-500/10 p-3 text-[11px]">
            <div className="flex items-center gap-2 text-amber-200 font-mono uppercase tracking-[0.12em]">
              <BookOpen className="w-4 h-4" />
              {locale === "zh-CN" ? "研究守则" : "Research Rule"}
            </div>
            <p className="mt-2 text-slate-200/90">
              {locale === "zh-CN"
                ? "先让 Council 形成假设，再进入 Arena 执行动作验证。"
                : "Let Council converge on hypotheses first, then execute verification in Arena."}
            </p>
          </div>

          <div className="mt-auto rounded-xl border border-white/10 bg-black/45 p-3 text-[10px] text-slate-300/90 flex items-center gap-2 uppercase tracking-[0.14em] font-mono">
            <Lightbulb className="w-4 h-4 text-violet-300" />
            {locale === "zh-CN" ? "跨会话记忆持续同步中" : "Cross-session memory sync active"}
          </div>
        </aside>
      </div>
    </div>
  );
}
