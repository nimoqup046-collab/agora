"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAgoraStore } from "@/lib/store";
import { useI18n } from "@/components/i18n/LanguageProvider";

export function MemoryOrb() {
  const [open, setOpen] = useState(false);
  const { messages, tasks } = useAgoraStore();
  const { locale } = useI18n();

  const recent = messages.slice(-6).reverse();

  return (
    <>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        className="fixed right-4 sm:right-6 bottom-14 sm:bottom-16 z-[65] w-12 h-12 rounded-2xl border border-cyan-300/40 bg-gradient-to-br from-cyan-500/40 to-violet-500/30 backdrop-blur-xl shadow-[0_0_38px_rgba(56,189,248,0.45)] text-cyan-50 font-tech text-[11px] tracking-[0.12em]"
        whileHover={{ scale: 1.08, rotate: 8 }}
        whileTap={{ scale: 0.96 }}
        title={locale === "zh-CN" ? "记忆球体" : "Memory Orb"}
      >
        MEM
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ opacity: 0, x: 26 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 26 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed right-4 sm:right-6 bottom-28 sm:bottom-32 z-[64] w-[min(92vw,380px)] rounded-2xl border border-cyan-300/35 bg-[#071027]/86 backdrop-blur-2xl shadow-[0_0_40px_rgba(56,189,248,0.2)]"
          >
            <div className="px-4 py-3 border-b border-cyan-300/20">
              <p className="font-tech text-xs tracking-[0.18em] text-cyan-100">
                {locale === "zh-CN" ? "全局记忆中枢" : "Global Memory Core"}
              </p>
              <p className="text-[11px] text-slate-300/80 mt-1">
                {locale === "zh-CN"
                  ? "跨模式共享上下文、任务与最近推理结果。"
                  : "Cross-mode context, tasks, and recent reasoning traces."}
              </p>
            </div>

            <div className="px-4 py-3 space-y-2">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border border-cyan-300/25 bg-cyan-400/5 py-2">
                  <p className="text-[10px] text-slate-400">{locale === "zh-CN" ? "消息" : "Messages"}</p>
                  <p className="font-tech text-sm text-cyan-100">{messages.length}</p>
                </div>
                <div className="rounded-lg border border-violet-300/25 bg-violet-400/5 py-2">
                  <p className="text-[10px] text-slate-400">{locale === "zh-CN" ? "任务" : "Tasks"}</p>
                  <p className="font-tech text-sm text-violet-100">{tasks.length}</p>
                </div>
                <div className="rounded-lg border border-amber-300/25 bg-amber-400/5 py-2">
                  <p className="text-[10px] text-slate-400">{locale === "zh-CN" ? "模式" : "Modes"}</p>
                  <p className="font-tech text-sm text-amber-100">5</p>
                </div>
              </div>

              <div className="rounded-lg border border-slate-600/45 bg-slate-900/50 p-2 max-h-44 overflow-y-auto space-y-1.5">
                {recent.length === 0 ? (
                  <p className="text-[11px] text-slate-400">
                    {locale === "zh-CN" ? "暂无跨会话记忆片段。" : "No memory snippets yet."}
                  </p>
                ) : (
                  recent.map((m) => (
                    <div key={m.id} className="text-[11px] leading-relaxed text-slate-200/90">
                      <span className="font-tech text-cyan-200/90 mr-1">{m.agent_name}:</span>
                      {m.content.slice(0, 72)}
                      {m.content.length > 72 ? "..." : ""}
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
