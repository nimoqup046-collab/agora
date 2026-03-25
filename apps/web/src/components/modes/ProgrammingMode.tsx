"use client";

import { motion } from "framer-motion";
import { useAgoraStore } from "@/lib/store";
import { ArenaPanel } from "@/components/arena/ArenaPanel";
import { useI18n } from "@/components/i18n/LanguageProvider";

interface ProgrammingModeProps {
  sessionId: string;
}

const SWARM_NODES = [
  { id: "lead", nameEn: "Lead", nameZh: "领航", cls: "top-6 left-8", color: "cyan" },
  { id: "coder", nameEn: "Coder", nameZh: "编码", cls: "top-20 right-10", color: "emerald" },
  { id: "review", nameEn: "Review", nameZh: "审查", cls: "bottom-20 left-10", color: "violet" },
  { id: "meta", nameEn: "Meta", nameZh: "统筹", cls: "bottom-8 right-12", color: "amber" },
];

const nodeColorMap: Record<string, { dot: string; border: string; glow: string; text: string }> = {
  cyan:    { dot: "bg-cyan-400",    border: "border-cyan-400/60",    glow: "shadow-[0_0_18px_rgba(34,211,238,0.5)]",    text: "text-cyan-300" },
  emerald: { dot: "bg-emerald-400", border: "border-emerald-400/60", glow: "shadow-[0_0_18px_rgba(52,211,153,0.5)]",    text: "text-emerald-300" },
  violet:  { dot: "bg-violet-400",  border: "border-violet-400/60",  glow: "shadow-[0_0_18px_rgba(167,139,250,0.5)]",   text: "text-violet-300" },
  amber:   { dot: "bg-amber-400",   border: "border-amber-400/60",   glow: "shadow-[0_0_18px_rgba(251,191,36,0.5)]",    text: "text-amber-300" },
};

export function ProgrammingMode({ sessionId }: ProgrammingModeProps) {
  const { locale } = useI18n();
  const { tasks } = useAgoraStore();

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-zinc-950 via-black to-zinc-950">
      <div className="shrink-0 border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[3px] text-cyan-400 uppercase">
            {locale === "zh-CN" ? "编程模式" : "PROGRAMMING MODE"}
          </p>
          <p className="text-[11px] text-slate-300/80 mt-1">
            {locale === "zh-CN"
              ? "蜂群编码竞技场 · 差异审查 · PR 推进"
              : "Swarm coding arena, diff review, and PR execution"}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="px-2.5 py-1 rounded-lg border border-emerald-400/40 text-emerald-300 bg-emerald-400/5 tracking-widest">
            {locale === "zh-CN" ? "在线" : "LIVE"}
          </span>
          <span className="px-2.5 py-1 rounded-lg border border-cyan-400/40 text-cyan-300 bg-cyan-400/5 tracking-widest">
            TASKS {tasks.length}
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[1.05fr_1.95fr] gap-3 p-3">
        <div className="bg-zinc-900/50 backdrop-blur-3xl border-r border-white/10 rounded-3xl min-h-[220px] xl:min-h-0 p-4 flex flex-col">
          <p className="font-mono text-[10px] tracking-[3px] text-cyan-400 uppercase">
            {locale === "zh-CN" ? "SWARM CANVAS · 实时协作网络" : "SWARM CANVAS · LIVE COORDINATION"}
          </p>

          <div className="mt-3 flex-1 min-h-[180px] rounded-2xl border border-white/10 bg-black/60 relative overflow-hidden">
            <svg className="absolute inset-0 w-full h-full opacity-50">
              <line x1="22%" y1="20%" x2="76%" y2="34%" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="6 5" />
              <line x1="75%" y1="34%" x2="66%" y2="78%" stroke="#34d399" strokeWidth="1.5" strokeDasharray="6 5" />
              <line x1="66%" y1="78%" x2="24%" y2="72%" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="6 5" />
              <line x1="24%" y1="72%" x2="22%" y2="20%" stroke="#facc15" strokeWidth="1.5" strokeDasharray="6 5" />
            </svg>

            {SWARM_NODES.map((node, idx) => {
              const c = nodeColorMap[node.color];
              return (
                <motion.div
                  key={node.id}
                  className={`absolute ${node.cls} bg-zinc-950 border ${c.border} rounded-[32px] px-3 py-2 text-[11px] font-mono ${c.glow} flex items-center gap-2`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: [0, -3, 0] }}
                  transition={{
                    duration: 2.4,
                    delay: idx * 0.08,
                    repeat: Infinity,
                    repeatType: "mirror",
                  }}
                >
                  <span className={`inline-block w-2 h-2 rounded-full ${c.dot} shadow-[0_0_6px_currentColor]`} />
                  <span className={c.text}>
                    {locale === "zh-CN" ? node.nameZh : node.nameEn}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl min-h-0 overflow-hidden">
          <ArenaPanel sessionId={sessionId} />
        </div>
      </div>
    </div>
  );
}
