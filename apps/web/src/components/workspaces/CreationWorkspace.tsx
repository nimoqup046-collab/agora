"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/components/i18n/LanguageProvider";

const CREATIVE_ICONS: Record<string, string> = {
  text: "T",
  code: "</>",
  idea: "!",
  design: "D",
};

const CREATIVE_COLORS: Record<string, string> = {
  text: "#f472b6",
  code: "#39d8ff",
  idea: "#e3c27a",
  design: "#8f7dff",
};

export function CreationWorkspace() {
  const { t } = useI18n();
  const [prompt, setPrompt] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const creativeTypes = [
    { key: "text", labelKey: "creation.typeText" },
    { key: "code", labelKey: "creation.typeCode" },
    { key: "idea", labelKey: "creation.typeIdea" },
    { key: "design", labelKey: "creation.typeDesign" },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden workspace-creation">
      {/* ── Header strip ────────────────────────────────── */}
      <div className="shrink-0 px-4 py-2.5 flex items-center gap-3 border-b border-pink-500/[0.06]">
        <div className="relative">
          <div className="w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.5)]" />
        </div>
        <span className="font-tech text-[11px] tracking-[0.25em] text-pink-300/90 uppercase">
          {t("creation.title")}
        </span>
      </div>

      {/* ── Main content ────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Prompt area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring", damping: 20 }}
            className="max-w-xl w-full"
          >
            {/* Creative type cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
              {creativeTypes.map((type, i) => {
                const isSelected = selectedType === type.key;
                const color = CREATIVE_COLORS[type.key];
                return (
                  <motion.button
                    key={type.key}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => setSelectedType(isSelected ? null : type.key)}
                    className="relative px-3 py-3 rounded-2xl text-center group overflow-hidden transition-all duration-300"
                    style={{
                      background: isSelected ? `${color}10` : `${color}04`,
                      border: `1px solid ${isSelected ? `${color}30` : `${color}10`}`,
                      boxShadow: isSelected ? `0 0 20px ${color}10` : "none",
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                      style={{ background: `radial-gradient(circle at 50% 50%, ${color}08, transparent 70%)` }}
                    />
                    <span
                      className="relative z-10 text-sm font-tech font-bold block mb-1 transition-colors"
                      style={{ color: isSelected ? color : `${color}80` }}
                    >
                      {CREATIVE_ICONS[type.key]}
                    </span>
                    <span
                      className="relative z-10 text-[10px] font-tech tracking-[0.1em] transition-colors"
                      style={{ color: isSelected ? color : `${color}60` }}
                    >
                      {t(type.labelKey)}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <h2 className="font-tech text-xl tracking-[0.12em] text-pink-200/90 text-center mb-2">
              {t("creation.heading")}
            </h2>
            <p className="text-sm text-slate-400/60 text-center mb-5 font-wisdom max-w-md mx-auto">
              {t("creation.description")}
            </p>

            {/* Prompt input */}
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t("creation.placeholder")}
                className="w-full h-32 px-4 py-3 rounded-2xl text-sm text-slate-200 placeholder:text-slate-600 resize-none focus:outline-none transition-all duration-300"
                style={{
                  background: "rgba(244,114,182,0.03)",
                  border: "1px solid rgba(244,114,182,0.1)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(244,114,182,0.25)";
                  e.target.style.boxShadow = "0 0 20px rgba(244,114,182,0.05)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(244,114,182,0.1)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                className="absolute bottom-3 right-3 px-5 py-1.5 rounded-xl text-[11px] font-tech tracking-[0.15em] transition-all duration-300 hover:scale-105"
                style={{
                  background: "rgba(244,114,182,0.08)",
                  border: "1px solid rgba(244,114,182,0.2)",
                  color: "#f472b6",
                }}
              >
                {t("creation.generate")}
              </button>
            </div>

            <p className="mt-3 text-[10px] text-slate-500/60 text-center">
              {t("creation.hint")}
            </p>
          </motion.div>
        </div>

        {/* Right: Artifact Preview placeholder */}
        <div className="hidden xl:flex flex-col w-[280px] shrink-0 border-l border-pink-500/[0.04]"
          style={{
            background: "linear-gradient(180deg, rgba(244,114,182,0.02), rgba(5,8,16,0.5))",
          }}
        >
          <div className="px-4 py-3 border-b border-pink-500/[0.04]">
            <span className="font-tech text-[10px] tracking-[0.2em] text-pink-300/60 uppercase">
              PREVIEW
            </span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
            <div className="relative w-16 h-16 mb-3">
              <div
                className="absolute inset-0 rounded-full pulse-ring"
                style={{
                  background: "radial-gradient(circle, rgba(244,114,182,0.06), transparent 70%)",
                  border: "1px solid rgba(244,114,182,0.08)",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-tech text-lg" style={{ color: "rgba(244,114,182,0.25)" }}>
                  {CREATIVE_ICONS[selectedType || "idea"]}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500/50 font-tech">
              Artifacts will render here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
