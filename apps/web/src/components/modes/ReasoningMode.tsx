"use client";

import { BrainCircuit } from "lucide-react";
import { TaskBoard } from "@/components/board/TaskBoard";
import { useAgoraStore } from "@/lib/store";
import { useI18n } from "@/components/i18n/LanguageProvider";

interface ReasoningModeProps {
  sessionId: string;
}

export function ReasoningMode({ sessionId }: ReasoningModeProps) {
  const { locale } = useI18n();
  const { tasks } = useAgoraStore();

  const total = Math.max(tasks.length, 1);
  const done = tasks.filter((t) => t.status === "done").length;
  const progress = Math.round((done / total) * 100);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-zinc-950 via-black to-zinc-950">
      <div className="shrink-0 bg-zinc-900/50 backdrop-blur-3xl border-b border-white/10 px-6 py-4 flex items-center gap-3">
        <BrainCircuit className="w-4 h-4 text-cyan-400 shrink-0" />
        <div>
          <p className="font-mono text-xs tracking-[2px] text-cyan-400 uppercase">
            {locale === "zh-CN" ? "推理模式" : "REASONING MODE"}
          </p>
          <p className="text-[11px] text-slate-300/80 mt-1">
            {locale === "zh-CN"
              ? "逻辑链可视化 · 任务分解 · 进度置信度"
              : "Logic-chain timeline, decomposition, and confidence progress"}
          </p>
        </div>
      </div>

      <div className="shrink-0 px-6 py-5 border-b border-white/10 bg-black/20">
        <div className="flex items-end justify-between mb-3">
          <span className="font-mono text-[10px] tracking-[2px] text-cyan-400/70 uppercase">
            {locale === "zh-CN" ? "推理收敛进度" : "Reasoning Convergence"}
          </span>
          <span className="font-mono text-4xl text-cyan-300 leading-none tabular-nums" style={{ textShadow: "0 0 20px rgba(34,211,238,0.6)" }}>
            {progress}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-white/5 border border-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 transition-all duration-500 rounded-full shadow-[0_0_12px_rgba(34,211,238,0.7)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 p-3">
        <div className="h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
          <TaskBoard sessionId={sessionId} />
        </div>
      </div>
    </div>
  );
}
