"use client";

import { motion } from "framer-motion";
import { useAgoraStore } from "@/lib/store";
import { ArenaPanel } from "@/components/arena/ArenaPanel";
import { useI18n } from "@/components/i18n/LanguageProvider";

interface ProgrammingModeProps {
  sessionId: string;
}

const SWARM_NODES = [
  { id: "lead", nameEn: "Lead", nameZh: "领航", cls: "top-6 left-8 bg-cyan-400/90" },
  { id: "coder", nameEn: "Coder", nameZh: "编码", cls: "top-20 right-10 bg-emerald-400/90" },
  { id: "review", nameEn: "Review", nameZh: "审查", cls: "bottom-20 left-10 bg-violet-400/90" },
  { id: "meta", nameEn: "Meta", nameZh: "统筹", cls: "bottom-8 right-12 bg-amber-300/95" },
];

export function ProgrammingMode({ sessionId }: ProgrammingModeProps) {
  const { locale } = useI18n();
  const { tasks } = useAgoraStore();

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#040912] via-[#061127] to-[#080a16]">
      <div className="shrink-0 border-b border-cyan-300/20 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="font-tech text-xs tracking-[0.18em] text-cyan-100">
            {locale === "zh-CN" ? "编程模式" : "PROGRAMMING MODE"}
          </p>
          <p className="text-[11px] text-slate-300/80 mt-1">
            {locale === "zh-CN"
              ? "蜂群编码竞技场 · 差异审查 · PR 推进"
              : "Swarm coding arena, diff review, and PR execution"}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-tech">
          <span className="px-2 py-1 rounded border border-emerald-400/40 text-emerald-300">
            {locale === "zh-CN" ? "在线" : "LIVE"}
          </span>
          <span className="px-2 py-1 rounded border border-cyan-400/40 text-cyan-200">
            TASKS {tasks.length}
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[1.05fr_1.95fr] gap-3 p-3">
        <div className="rounded-xl border border-cyan-300/25 bg-cyan-500/5 backdrop-blur-xl min-h-[220px] xl:min-h-0 p-3">
          <p className="font-tech text-[10px] tracking-[0.16em] text-cyan-200/90">
            {locale === "zh-CN" ? "SWARM CANVAS · 实时协作网络" : "SWARM CANVAS · LIVE COORDINATION"}
          </p>

          <div className="mt-3 h-[210px] xl:h-[calc(100%-2rem)] rounded-lg border border-cyan-300/20 bg-[#050a1b]/85 relative overflow-hidden">
            <svg className="absolute inset-0 w-full h-full opacity-60">
              <line x1="22%" y1="20%" x2="76%" y2="34%" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="6 5" />
              <line x1="75%" y1="34%" x2="66%" y2="78%" stroke="#34d399" strokeWidth="1.5" strokeDasharray="6 5" />
              <line x1="66%" y1="78%" x2="24%" y2="72%" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="6 5" />
              <line x1="24%" y1="72%" x2="22%" y2="20%" stroke="#facc15" strokeWidth="1.5" strokeDasharray="6 5" />
            </svg>

            {SWARM_NODES.map((node, idx) => (
              <motion.div
                key={node.id}
                className={`absolute ${node.cls} rounded-lg border border-white/20 px-2.5 py-1.5 text-[11px] font-tech shadow-[0_0_20px_rgba(56,189,248,0.25)]`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: [0, -3, 0] }}
                transition={{
                  duration: 2.4,
                  delay: idx * 0.08,
                  repeat: Infinity,
                  repeatType: "mirror",
                }}
              >
                <span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle bg-current" />
                {locale === "zh-CN" ? node.nameZh : node.nameEn}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-cyan-300/25 bg-slate-950/65 backdrop-blur-xl min-h-0 overflow-hidden">
          <ArenaPanel sessionId={sessionId} />
        </div>
      </div>
    </div>
  );
}
