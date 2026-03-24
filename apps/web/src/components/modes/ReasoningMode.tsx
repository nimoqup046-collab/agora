"use client";

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
    <div className="h-full flex flex-col bg-gradient-to-b from-[#071020] to-[#060915]">
      <div className="shrink-0 border-b border-teal-300/20 px-4 py-3">
        <p className="font-tech text-xs tracking-[0.18em] text-teal-100">
          {locale === "zh-CN" ? "推理模式" : "REASONING MODE"}
        </p>
        <p className="text-[11px] text-slate-300/80 mt-1">
          {locale === "zh-CN"
            ? "逻辑链可视化 · 任务分解 · 进度置信度"
            : "Logic-chain timeline, decomposition, and confidence progress"}
        </p>
      </div>

      <div className="shrink-0 px-4 py-3 border-b border-teal-300/15">
        <div className="flex items-center justify-between text-[11px] text-slate-300">
          <span>{locale === "zh-CN" ? "推理收敛进度" : "Reasoning Convergence"}</span>
          <span className="font-tech text-teal-200">{progress}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-teal-900/45 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <TaskBoard sessionId={sessionId} />
      </div>
    </div>
  );
}
