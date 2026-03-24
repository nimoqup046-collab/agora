"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/components/i18n/LanguageProvider";

/**
 * ReasoningWorkspace – dedicated interface for multi-step reasoning chains.
 * Visualises inference steps, chain-of-thought, and logical deductions.
 */
export function ReasoningWorkspace() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");

  return (
    <div className="flex-1 flex flex-col overflow-hidden workspace-reasoning">
      {/* ── Header strip ────────────────────────────────── */}
      <div className="shrink-0 px-4 py-2.5 flex items-center gap-3 border-b border-amber-500/10">
        <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(227,194,122,0.5)]" />
        <span className="font-tech text-[11px] tracking-[0.25em] text-amber-300/90 uppercase">
          {t("reasoning.title")}
        </span>
      </div>

      {/* ── Main content ────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-lg w-full"
        >
          {/* Visual: Chain of thought diagram */}
          <div className="flex items-center justify-center gap-3 mb-6">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/[0.08] border border-amber-500/20 flex items-center justify-center">
                  <span className="text-[11px] font-tech text-amber-300/70">{step}</span>
                </div>
                {step < 5 && (
                  <div className="w-6 h-px bg-gradient-to-r from-amber-500/30 to-amber-500/10" />
                )}
              </div>
            ))}
          </div>

          <h2 className="font-tech text-lg tracking-[0.15em] text-amber-200/90 mb-2">
            {t("reasoning.heading")}
          </h2>
          <p className="text-sm text-slate-300/70 mb-6 font-wisdom leading-relaxed">
            {t("reasoning.description")}
          </p>

          {/* Input area */}
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("reasoning.placeholder")}
              className="w-full h-24 px-4 py-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/15 text-sm text-slate-200 placeholder:text-slate-500 resize-none focus:outline-none focus:border-amber-400/30 transition-colors"
            />
            <button
              className="absolute bottom-3 right-3 px-4 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-[11px] font-tech tracking-[0.15em] text-amber-200 hover:bg-amber-500/20 transition-colors"
            >
              {t("reasoning.analyze")}
            </button>
          </div>

          <p className="mt-4 text-[10px] text-slate-400/60">
            {t("reasoning.hint")}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
