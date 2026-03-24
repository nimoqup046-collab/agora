"use client";

import { EvolutionPanel } from "@/components/arena/EvolutionPanel";
import { useI18n } from "@/components/i18n/LanguageProvider";

export function EvolutionMode() {
  const { locale } = useI18n();

  return (
    <div className="h-full grid grid-rows-[auto_1fr] bg-gradient-to-br from-[#120f05] via-[#0d0a16] to-[#12070f]">
      <div className="border-b border-amber-300/20 px-4 py-3">
        <p className="font-tech text-xs tracking-[0.18em] text-amber-100">
          {locale === "zh-CN" ? "AGI 自进化模式" : "AGI EVOLUTION MODE"}
        </p>
        <p className="text-[11px] text-slate-300/80 mt-1">
          {locale === "zh-CN"
            ? "SOUL 蒸馏 · 迭代基准 · 蜂群升级仪式"
            : "SOUL distill, benchmark loop, and swarm upgrade ritual"}
        </p>
      </div>
      <div className="min-h-0 p-3">
        <div className="h-full rounded-xl border border-amber-300/22 bg-black/35 backdrop-blur-xl overflow-hidden">
          <EvolutionPanel />
        </div>
      </div>
    </div>
  );
}
