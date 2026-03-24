"use client";

import { useI18n } from "@/components/i18n/LanguageProvider";
import { EvolutionPanel } from "@/components/arena/EvolutionPanel";

/**
 * EvolutionWorkspace – AGI self-evolution monitoring.
 * Wraps the existing EvolutionPanel with a dedicated workspace aesthetic.
 */
export function EvolutionWorkspace() {
  const { t } = useI18n();

  return (
    <div className="flex-1 flex flex-col overflow-hidden workspace-evolution">
      {/* ── Header strip ────────────────────────────────── */}
      <div className="shrink-0 px-4 py-2.5 flex items-center gap-3 border-b border-emerald-500/10">
        <div className="relative">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-30" />
        </div>
        <span className="font-tech text-[11px] tracking-[0.25em] text-emerald-300/90 uppercase">
          {t("evolution.title")}
        </span>
        <div className="flex-1" />
        <span className="text-[9px] font-tech tracking-[0.15em] text-emerald-400/40 uppercase">
          {t("evolution.monitoring")}
        </span>
      </div>

      {/* ── Main evolution content ───────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <EvolutionPanel />
        </div>

        {/* Evolution metrics footer */}
        <div className="shrink-0 px-4 py-2 border-t border-emerald-500/[0.06] flex items-center gap-4">
          {[
            { label: t("evolution.generation"), value: "Gen 0" },
            { label: t("evolution.fitness"), value: "—" },
            { label: t("evolution.mutations"), value: "0" },
          ].map((metric) => (
            <div key={metric.label} className="flex items-center gap-1.5">
              <span className="text-[9px] font-tech text-emerald-400/50 tracking-wider uppercase">
                {metric.label}
              </span>
              <span className="text-[10px] font-tech text-emerald-300/80">
                {metric.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
