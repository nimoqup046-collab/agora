"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { EvolutionPanel } from "@/components/arena/EvolutionPanel";

export function EvolutionWorkspace() {
  const { t } = useI18n();

  const metrics = [
    { label: t("evolution.generation"), value: "Gen 0", color: "#10b981" },
    { label: t("evolution.fitness"), value: "—", color: "#39d8ff" },
    { label: t("evolution.mutations"), value: "0", color: "#8f7dff" },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden workspace-evolution">
      {/* ── Header strip ────────────────────────────────── */}
      <div className="shrink-0 px-4 py-2.5 flex items-center gap-3 border-b border-emerald-500/[0.06]">
        <div className="relative">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-30" />
        </div>
        <span className="font-tech text-[11px] tracking-[0.25em] text-emerald-300/90 uppercase">
          {t("evolution.title")}
        </span>
        <div className="flex-1" />
        <span className="text-[9px] font-tech tracking-[0.15em] text-emerald-400/50 uppercase flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-emerald-400/50 animate-pulse" />
          {t("evolution.monitoring")}
        </span>
      </div>

      {/* ── Main evolution content ───────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <EvolutionPanel />
        </div>

        {/* Evolution metrics footer */}
        <div className="shrink-0 px-4 py-2.5 border-t border-emerald-500/[0.04] flex items-center gap-5"
          style={{ background: "rgba(16,185,129,0.02)" }}
        >
          {metrics.map((metric) => (
            <div key={metric.label} className="flex items-center gap-2">
              <span className="text-[9px] font-tech tracking-wider uppercase" style={{ color: `${metric.color}50` }}>
                {metric.label}
              </span>
              <span
                className="text-[10px] font-tech px-2 py-0.5 rounded-md"
                style={{
                  color: metric.color,
                  background: `${metric.color}08`,
                  border: `1px solid ${metric.color}15`,
                }}
              >
                {metric.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
