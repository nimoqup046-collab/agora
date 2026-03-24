"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAgoraStore } from "@/lib/store";
import { useI18n } from "@/components/i18n/LanguageProvider";

export function MemoryOrb() {
  const [isOpen, setIsOpen] = useState(false);
  const { memoryCount } = useAgoraStore();
  const { t } = useI18n();

  return (
    <>
      {/* Floating Orb */}
      <motion.button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer orb-float"
        style={{
          background: "linear-gradient(135deg, rgba(57, 216, 255, 0.2), rgba(143, 125, 255, 0.2))",
          border: "1px solid rgba(57, 216, 255, 0.2)",
          boxShadow: "0 0 30px rgba(57, 216, 255, 0.15), 0 0 60px rgba(143, 125, 255, 0.08), inset 0 0 20px rgba(57, 216, 255, 0.05)",
        }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Inner glow ring */}
        <div className="absolute inset-1 rounded-full border border-cyan-400/20 pulse-ring" />
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="relative z-10">
          <circle cx="10" cy="10" r="3" fill="rgba(57, 216, 255, 0.6)" />
          <circle cx="10" cy="10" r="6" stroke="rgba(57, 216, 255, 0.3)" strokeWidth="0.5" />
          <circle cx="10" cy="10" r="9" stroke="rgba(143, 125, 255, 0.2)" strokeWidth="0.5" strokeDasharray="2 3" />
          <line x1="10" y1="1" x2="10" y2="4" stroke="rgba(57,216,255,0.3)" strokeWidth="0.5" />
          <line x1="10" y1="16" x2="10" y2="19" stroke="rgba(57,216,255,0.3)" strokeWidth="0.5" />
          <line x1="1" y1="10" x2="4" y2="10" stroke="rgba(57,216,255,0.3)" strokeWidth="0.5" />
          <line x1="16" y1="10" x2="19" y2="10" stroke="rgba(57,216,255,0.3)" strokeWidth="0.5" />
        </svg>
        {memoryCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500/80 text-[8px] font-tech flex items-center justify-center text-white">
            {memoryCount}
          </span>
        )}
      </motion.button>

      {/* Memory Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-20 right-6 z-50 w-72 rounded-2xl overflow-hidden"
              style={{
                background: "rgba(5, 8, 16, 0.9)",
                backdropFilter: "blur(32px) saturate(1.5)",
                border: "1px solid rgba(57, 216, 255, 0.1)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(57, 216, 255, 0.05)",
              }}
            >
              <div className="px-4 py-3 border-b border-white/[0.04] flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(57,216,255,0.5)]" />
                <span className="font-tech text-[10px] tracking-[0.2em] text-cyan-300/90 uppercase">
                  {t("status.mem")}
                </span>
                <span className="ml-auto text-[10px] font-tech text-slate-400">{memoryCount}</span>
              </div>
              <div className="p-4 flex flex-col items-center justify-center min-h-[120px]">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                  style={{
                    background: "radial-gradient(circle, rgba(57,216,255,0.1), rgba(143,125,255,0.05))",
                    border: "1px solid rgba(57,216,255,0.1)",
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <circle cx="14" cy="14" r="5" fill="rgba(57, 216, 255, 0.3)" />
                    <circle cx="14" cy="14" r="9" stroke="rgba(57, 216, 255, 0.2)" strokeWidth="0.5" />
                    <circle cx="14" cy="14" r="13" stroke="rgba(143, 125, 255, 0.15)" strokeWidth="0.5" strokeDasharray="3 4" />
                  </svg>
                </div>
                <p className="text-[11px] text-slate-300/60 font-tech text-center">
                  {t("research.kbHint")}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
