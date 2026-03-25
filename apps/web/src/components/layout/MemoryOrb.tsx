"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Brain } from "lucide-react";
import { useAgoraStore } from "@/lib/store";
import { useI18n } from "@/components/i18n/LanguageProvider";

export function MemoryOrb() {
  const [open, setOpen] = useState(false);
  const { messages, tasks } = useAgoraStore();
  const { locale } = useI18n();

  const recent = messages.slice(-6).reverse();

  return (
    <>
      {/* Orb button */}
      <div className="fixed right-4 sm:right-6 bottom-14 sm:bottom-16 z-[65]">
        {/* Ping animation ring */}
        <span className="absolute inset-0 rounded-3xl bg-blue-500/30 animate-ping" />

        <motion.button
          onClick={() => setOpen((v) => !v)}
          className="relative w-14 h-14 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-500 border border-white/30 shadow-[0_0_50px_rgba(59,130,246,0.6)] flex items-center justify-center text-white"
          whileHover={{ scale: 1.08, rotate: 8 }}
          whileTap={{ scale: 0.96 }}
          title={locale === "zh-CN" ? "记忆球体" : "Memory Orb"}
        >
          <Brain className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ opacity: 0, x: 26 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 26 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed right-4 sm:right-6 bottom-32 sm:bottom-36 z-[64] w-[min(92vw,380px)] rounded-3xl border border-white/20 bg-zinc-900/90 backdrop-blur-3xl shadow-[0_0_50px_rgba(59,130,246,0.15)]"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10">
              <p className="font-mono text-[10px] tracking-widest text-white/70 uppercase">
                {locale === "zh-CN" ? "全局记忆中枢" : "Global Memory Core"}
              </p>
              <p className="font-mono text-[11px] text-white/40 mt-1">
                {locale === "zh-CN"
                  ? "跨模式共享上下文、任务与最近推理结果。"
                  : "Cross-mode context, tasks, and recent reasoning traces."}
              </p>
            </div>

            {/* Stats grid */}
            <div className="px-5 py-4 space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 py-3">
                  <p className="font-mono text-[9px] tracking-wider text-white/30 uppercase">
                    {locale === "zh-CN" ? "消息" : "Messages"}
                  </p>
                  <p className="font-mono text-sm text-blue-400 mt-0.5">{messages.length}</p>
                </div>
                <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 py-3">
                  <p className="font-mono text-[9px] tracking-wider text-white/30 uppercase">
                    {locale === "zh-CN" ? "任务" : "Tasks"}
                  </p>
                  <p className="font-mono text-sm text-purple-400 mt-0.5">{tasks.length}</p>
                </div>
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 py-3">
                  <p className="font-mono text-[9px] tracking-wider text-white/30 uppercase">
                    {locale === "zh-CN" ? "模式" : "Modes"}
                  </p>
                  <p className="font-mono text-sm text-amber-400 mt-0.5">5</p>
                </div>
              </div>

              {/* Recent messages */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 max-h-44 overflow-y-auto space-y-1.5">
                {recent.length === 0 ? (
                  <p className="font-mono text-[10px] text-white/30">
                    {locale === "zh-CN" ? "暂无跨会话记忆片段。" : "No memory snippets yet."}
                  </p>
                ) : (
                  recent.map((m) => (
                    <div key={m.id} className="font-mono text-[11px] leading-relaxed text-white/60">
                      <span className="text-cyan-400/80 mr-1">{m.agent_name}:</span>
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
