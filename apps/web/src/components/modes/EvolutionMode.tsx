"use client";

import { Zap } from "lucide-react";
import { EvolutionPanel } from "@/components/arena/EvolutionPanel";
import { useI18n } from "@/components/i18n/LanguageProvider";

export function EvolutionMode() {
  const { locale } = useI18n();

  return (
    <div className="h-full grid grid-rows-[auto_1fr] bg-gradient-to-br from-zinc-950 via-black to-zinc-950">
      <div className="bg-zinc-900/50 backdrop-blur-3xl border-b border-white/10 px-6 py-4 flex items-center gap-3">
        <Zap className="w-4 h-4 text-amber-400 shrink-0" style={{ filter: "drop-shadow(0 0 6px rgba(251,191,36,0.8))" }} />
        <div>
          <p className="font-mono text-xs tracking-[2px] text-amber-400 uppercase">
            {locale === "zh-CN" ? "AGI 自进化模式" : "AGI EVOLUTION MODE"}
          </p>
          <p className="text-[11px] text-slate-300/80 mt-1">
            {locale === "zh-CN"
              ? "SOUL 蒸馏 · 迭代基准 · 蜂群升级仪式"
              : "SOUL distill, benchmark loop, and swarm upgrade ritual"}
          </p>
        </div>
      </div>
      <div className="min-h-0 p-3">
        <div className="h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
          <EvolutionPanel />
        </div>
      </div>
    </div>
  );
}
