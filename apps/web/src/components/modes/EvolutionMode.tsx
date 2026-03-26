"use client";

import { Activity, Dna, Orbit, Sparkles } from "lucide-react";
import { EvolutionPanel } from "@/components/arena/EvolutionPanel";
import { useI18n } from "@/components/i18n/LanguageProvider";

export function EvolutionMode() {
  const { locale } = useI18n();

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#0f0c06] via-[#080813] to-[#120812] text-white">
      <div className="h-11 px-4 border-b border-white/10 bg-black/45 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-amber-100">
          <Dna className="w-4 h-4 text-amber-300" />
          {locale === "zh-CN" ? "AGI 自进化" : "AGI Evolution"}
        </div>
        <span className="text-[10px] px-2 py-1 rounded border border-emerald-400/35 text-emerald-200 uppercase font-mono">Evolution Loop</span>
      </div>

      <div className="flex-1 min-h-0 p-3 grid grid-cols-1 2xl:grid-cols-[320px_minmax(0,1fr)] gap-3">
        <aside className="rounded-2xl border border-amber-300/22 bg-amber-500/8 backdrop-blur-2xl p-3 flex flex-col">
          <p className="text-[10px] uppercase tracking-[0.18em] font-mono text-amber-100/90">
            {locale === "zh-CN" ? "进化核心状态" : "Evolution Core"}
          </p>

          <div className="mt-3 rounded-xl border border-amber-300/30 bg-black/40 p-3 text-center">
            <div className="relative mx-auto w-40 h-40 rounded-full border border-amber-300/35 flex items-center justify-center">
              <div className="absolute inset-3 rounded-full border border-cyan-300/25 animate-spin" style={{ animationDuration: "10s" }} />
              <div className="absolute inset-8 rounded-full border border-violet-300/25 animate-spin" style={{ animationDuration: "14s", animationDirection: "reverse" }} />
              <Orbit className="w-8 h-8 text-amber-300" />
            </div>

            <p className="mt-3 text-xs font-mono text-amber-100 uppercase tracking-[0.12em]">GEN-CORE ACTIVE</p>
            <p className="mt-1 text-[11px] text-slate-300/85">
              {locale === "zh-CN" ? "SOUL 蒸馏、技能审批、回路迭代正在进行。" : "SOUL distill, skill approval, and loop iteration are running."}
            </p>
          </div>

          <div className="mt-2 space-y-2 text-[11px]">
            <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-3">
              <div className="flex items-center gap-2 text-emerald-200 font-mono uppercase tracking-[0.12em]"><Activity className="w-4 h-4" /> Fitness</div>
              <p className="mt-1 text-slate-200/90">0.88 / target 0.95</p>
            </div>
            <div className="rounded-xl border border-cyan-300/25 bg-cyan-500/10 p-3">
              <div className="flex items-center gap-2 text-cyan-200 font-mono uppercase tracking-[0.12em]"><Sparkles className="w-4 h-4" /> Mutation</div>
              <p className="mt-1 text-slate-200/90">0.024%</p>
            </div>
          </div>

          <div className="mt-auto text-[10px] text-slate-300/85 font-mono uppercase tracking-[0.14em]">
            {locale === "zh-CN" ? "建议：先审批 pending SOUL，再触发新一轮进化。" : "Tip: approve pending SOULs before triggering next loop."}
          </div>
        </aside>

        <section className="rounded-2xl border border-amber-300/22 bg-black/35 backdrop-blur-xl min-h-0 overflow-hidden">
          <EvolutionPanel />
        </section>
      </div>
    </div>
  );
}
