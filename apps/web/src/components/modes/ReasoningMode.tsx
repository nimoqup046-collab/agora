"use client";

import { BrainCircuit, CheckCircle2, Scale, Sparkles, Timer } from "lucide-react";
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
  const done = tasks.filter((task) => task.status === "done").length;
  const progress = Math.round((done / total) * 100);

  const chain = [
    {
      key: "01",
      title: locale === "zh-CN" ? "定义核心问题" : "Define Core Question",
      desc:
        locale === "zh-CN"
          ? "明确范围、约束与目标，锁定推理边界。"
          : "Lock scope, constraints, and goals to bound the inference.",
    },
    {
      key: "02",
      title: locale === "zh-CN" ? "拆分并行分支" : "Spawn Parallel Branches",
      desc:
        locale === "zh-CN"
          ? "让多智能体从不同假设路径并行求证。"
          : "Let agents validate competing hypotheses in parallel.",
    },
    {
      key: "03",
      title: locale === "zh-CN" ? "交叉验证" : "Cross Validation",
      desc:
        locale === "zh-CN"
          ? "聚合证据，识别冲突并修正逻辑链。"
          : "Merge evidence, detect conflicts, and repair the logic chain.",
    },
    {
      key: "04",
      title: locale === "zh-CN" ? "形成结论" : "Conclude & Commit",
      desc:
        locale === "zh-CN"
          ? "输出可执行结论并落地到任务板。"
          : "Ship executable conclusion and push into task board.",
    },
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#061024] to-[#050b18] text-white">
      <div className="h-11 px-4 border-b border-white/10 bg-black/45 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-cyan-100">
          <BrainCircuit className="w-4 h-4 text-cyan-300" />
          {locale === "zh-CN" ? "推理模式" : "Reasoning Mode"}
        </div>

        <div className="text-[10px] font-mono text-cyan-200 uppercase tracking-[0.14em]">confidence {progress}%</div>
      </div>

      <div className="shrink-0 px-4 py-3 border-b border-cyan-300/15 bg-cyan-500/5">
        <div className="flex items-center justify-between text-[11px] text-slate-300">
          <span>{locale === "zh-CN" ? "推理收敛进度" : "Reasoning Convergence"}</span>
          <span className="font-mono text-cyan-200">{progress}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-cyan-900/45 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-violet-400 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex-1 min-h-0 p-3 grid grid-cols-1 2xl:grid-cols-[380px_minmax(0,1fr)] gap-3">
        <aside className="rounded-2xl border border-cyan-300/24 bg-cyan-500/8 backdrop-blur-2xl p-3 overflow-y-auto">
          <p className="text-[10px] uppercase tracking-[0.18em] font-mono text-cyan-100/90">
            {locale === "zh-CN" ? "逻辑链仪表盘" : "Logic Chain Dashboard"}
          </p>

          <div className="mt-3 space-y-2">
            {chain.map((step, index) => (
              <div key={step.key} className="rounded-xl border border-white/12 bg-black/35 p-3">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-lg border border-cyan-300/35 text-cyan-200 text-[11px] font-mono flex items-center justify-center">
                    {index < done ? <CheckCircle2 className="w-4 h-4" /> : step.key}
                  </span>
                  <div>
                    <p className="text-sm text-white">{step.title}</p>
                    <p className="mt-1 text-[11px] text-slate-300/85 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-xl border border-amber-300/25 bg-amber-500/10 p-3 text-[11px] text-slate-200/90">
            <div className="flex items-center gap-2 text-amber-200 font-mono uppercase tracking-[0.12em]">
              <Scale className="w-4 h-4" />
              {locale === "zh-CN" ? "推理规范" : "Reasoning Rule"}
            </div>
            <p className="mt-2">
              {locale === "zh-CN"
                ? "每条结论必须可回溯到至少一条证据和一条任务行动。"
                : "Every conclusion must map to at least one evidence source and one action task."}
            </p>
          </div>

          <div className="mt-2 rounded-xl border border-white/10 bg-black/45 p-3 text-[10px] uppercase tracking-[0.14em] font-mono text-slate-300 flex items-center gap-2">
            <Timer className="w-4 h-4 text-cyan-300" />
            <Sparkles className="w-4 h-4 text-violet-300" />
            {locale === "zh-CN" ? "并行辩论引擎运行中" : "Parallel debate engine running"}
          </div>
        </aside>

        <section className="rounded-2xl border border-cyan-300/24 bg-black/35 backdrop-blur-xl min-h-0 overflow-hidden">
          <TaskBoard sessionId={sessionId} />
        </section>
      </div>
    </div>
  );
}
