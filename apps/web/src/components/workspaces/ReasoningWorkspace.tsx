"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/components/i18n/LanguageProvider";

export function ReasoningWorkspace() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");

  const steps = [
    { label: "INPUT", color: "#e3c27a" },
    { label: "DECOMPOSE", color: "#39d8ff" },
    { label: "REASON", color: "#8f7dff" },
    { label: "VERIFY", color: "#10b981" },
    { label: "OUTPUT", color: "#f472b6" },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden workspace-reasoning">
      {/* ── Header strip ────────────────────────────────── */}
      <div className="shrink-0 px-4 py-2.5 flex items-center gap-3 border-b border-amber-500/[0.06]">
        <div className="relative">
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(227,194,122,0.5)]" />
        </div>
        <span className="font-tech text-[11px] tracking-[0.25em] text-amber-300/90 uppercase">
          {t("reasoning.title")}
        </span>
        <div className="flex-1" />
        <span className="text-[9px] font-tech tracking-[0.15em] text-amber-400/40 uppercase px-2 py-0.5 rounded-full"
          style={{
            background: "rgba(227,194,122,0.05)",
            border: "1px solid rgba(227,194,122,0.1)",
          }}
        >
          ALPHA
        </span>
      </div>

      {/* ── Main content ────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", damping: 20 }}
          className="max-w-lg w-full"
        >
          {/* Reasoning Chain Visualization */}
          <div className="flex items-center justify-center gap-1 mb-8">
            {steps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-1">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-tech font-bold transition-all hover:scale-110"
                    style={{
                      background: `${step.color}08`,
                      border: `1px solid ${step.color}20`,
                      color: `${step.color}aa`,
                      boxShadow: `0 0 15px ${step.color}08`,
                    }}
                  >
                    {i + 1}
                  </div>
                  <span className="text-[7px] font-tech tracking-wider" style={{ color: `${step.color}60` }}>
                    {step.label}
                  </span>
                </motion.div>
                {i < steps.length - 1 && (
                  <div className="w-4 h-px mt-[-12px]" style={{
                    background: `linear-gradient(90deg, ${step.color}30, ${steps[i + 1].color}30)`,
                  }} />
                )}
              </div>
            ))}
          </div>

          <h2 className="font-tech text-xl tracking-[0.12em] text-amber-200/90 mb-2">
            {t("reasoning.heading")}
          </h2>
          <p className="text-sm text-slate-400/70 mb-6 font-wisdom leading-relaxed max-w-md mx-auto">
            {t("reasoning.description")}
          </p>

          {/* Input area */}
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("reasoning.placeholder")}
              className="w-full h-28 px-4 py-3 rounded-2xl text-sm text-slate-200 placeholder:text-slate-600 resize-none focus:outline-none transition-all duration-300"
              style={{
                background: "rgba(227,194,122,0.03)",
                border: "1px solid rgba(227,194,122,0.1)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(227,194,122,0.25)";
                e.target.style.boxShadow = "0 0 20px rgba(227,194,122,0.05)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(227,194,122,0.1)";
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              className="absolute bottom-3 right-3 px-5 py-1.5 rounded-xl text-[11px] font-tech tracking-[0.15em] transition-all duration-300 hover:scale-105"
              style={{
                background: "rgba(227,194,122,0.08)",
                border: "1px solid rgba(227,194,122,0.2)",
                color: "#e3c27a",
              }}
            >
              {t("reasoning.analyze")}
            </button>
          </div>

          <p className="mt-4 text-[10px] text-slate-500/60">
            {t("reasoning.hint")}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
