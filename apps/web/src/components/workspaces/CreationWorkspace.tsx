"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/components/i18n/LanguageProvider";

/**
 * CreationWorkspace – creative content generation workspace.
 * Supports text, code, art concept generation via multi-agent collaboration.
 */
export function CreationWorkspace() {
  const { t } = useI18n();
  const [prompt, setPrompt] = useState("");

  const creativeTypes = [
    { key: "text", icon: "✍️", labelKey: "creation.typeText" },
    { key: "code", icon: "💻", labelKey: "creation.typeCode" },
    { key: "idea", icon: "💡", labelKey: "creation.typeIdea" },
    { key: "design", icon: "🎨", labelKey: "creation.typeDesign" },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden workspace-creation">
      {/* ── Header strip ────────────────────────────────── */}
      <div className="shrink-0 px-4 py-2.5 flex items-center gap-3 border-b border-pink-500/10">
        <div className="w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.5)]" />
        <span className="font-tech text-[11px] tracking-[0.25em] text-pink-300/90 uppercase">
          {t("creation.title")}
        </span>
      </div>

      {/* ── Main content ────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-xl w-full"
        >
          {/* Creative type cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
            {creativeTypes.map((type) => (
              <button
                key={type.key}
                className="px-3 py-3 rounded-xl bg-pink-500/[0.04] border border-pink-500/15 hover:border-pink-400/30 hover:bg-pink-500/[0.08] transition-all text-center group"
              >
                <span className="text-lg block mb-1">{type.icon}</span>
                <span className="text-[10px] font-tech tracking-[0.12em] text-pink-300/80 group-hover:text-pink-200">
                  {t(type.labelKey)}
                </span>
              </button>
            ))}
          </div>

          <h2 className="font-tech text-lg tracking-[0.15em] text-pink-200/90 text-center mb-2">
            {t("creation.heading")}
          </h2>
          <p className="text-sm text-slate-300/60 text-center mb-5 font-wisdom">
            {t("creation.description")}
          </p>

          {/* Prompt input */}
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t("creation.placeholder")}
              className="w-full h-28 px-4 py-3 rounded-xl bg-pink-500/[0.04] border border-pink-500/15 text-sm text-slate-200 placeholder:text-slate-500 resize-none focus:outline-none focus:border-pink-400/30 transition-colors"
            />
            <button
              className="absolute bottom-3 right-3 px-4 py-1.5 rounded-lg bg-pink-500/10 border border-pink-500/25 text-[11px] font-tech tracking-[0.15em] text-pink-200 hover:bg-pink-500/20 transition-colors"
            >
              {t("creation.generate")}
            </button>
          </div>

          <p className="mt-3 text-[10px] text-slate-400/60 text-center">
            {t("creation.hint")}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
