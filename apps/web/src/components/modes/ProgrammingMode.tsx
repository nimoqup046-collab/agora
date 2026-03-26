"use client";

import { motion } from "framer-motion";
import { Activity, CheckCircle2, Cpu, GitBranch, Zap } from "lucide-react";
import { ArenaPanel } from "@/components/arena/ArenaPanel";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { useAgoraStore } from "@/lib/store";

interface ProgrammingModeProps {
  sessionId: string;
}

const SWARM_AGENTS = [
  { name: "Lead", hue: "from-cyan-400 to-blue-500" },
  { name: "Coder", hue: "from-emerald-400 to-cyan-500" },
  { name: "Reviewer", hue: "from-violet-400 to-fuchsia-500" },
  { name: "Meta", hue: "from-amber-400 to-orange-500" },
  { name: "Ops", hue: "from-sky-400 to-indigo-500" },
  { name: "Scout", hue: "from-pink-400 to-purple-500" },
];

export function ProgrammingMode({ sessionId }: ProgrammingModeProps) {
  const { locale } = useI18n();
  const { tasks, currentAction } = useAgoraStore();

  const pending = tasks.filter((task) => task.status !== "done").length;
  const done = tasks.filter((task) => task.status === "done").length;

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-zinc-950 via-black to-[#020713] text-white">
      <div className="h-11 px-4 border-b border-white/10 bg-black/45 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.14em]">
          <Cpu className="w-4 h-4 text-cyan-300" />
          <span className="text-cyan-100">{locale === "zh-CN" ? "编程模式" : "Programming Mode"}</span>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="px-2 py-1 rounded border border-emerald-400/40 text-emerald-300 uppercase">
            {locale === "zh-CN" ? "在线" : "Live"}
          </span>
          <span className="px-2 py-1 rounded border border-cyan-400/35 text-cyan-200 uppercase">Task {tasks.length}</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-3 grid grid-cols-1 2xl:grid-cols-[280px_minmax(0,1fr)_320px] gap-3">
        <aside className="rounded-2xl border border-cyan-300/25 bg-cyan-500/5 backdrop-blur-2xl p-3 flex flex-col min-h-[220px] 2xl:min-h-0">
          <p className="text-[10px] uppercase tracking-[0.18em] font-mono text-cyan-200/95">
            {locale === "zh-CN" ? "蜂群协作网络" : "Swarm Coordination"}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2 flex-1">
            {SWARM_AGENTS.map((agent, index) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.03, y: -2 }}
                className="rounded-xl border border-white/15 bg-black/40 p-2.5"
              >
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${agent.hue} shadow-[0_0_20px_rgba(56,189,248,0.25)]`} />
                <p className="mt-2 text-[11px] font-mono text-slate-100">{agent.name}</p>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  synced
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-2 rounded-xl border border-white/10 bg-black/45 p-2.5 text-[10px] text-slate-300/85 leading-relaxed">
            {locale === "zh-CN"
              ? "左侧蜂群仅负责调度视图，核心执行与 PR 动作在中间 Arena 完成。"
              : "Swarm panel visualizes routing only; execution and PR actions run in the central Arena."}
          </div>
        </aside>

        <section className="rounded-2xl border border-cyan-300/24 bg-black/35 backdrop-blur-xl min-h-0 overflow-hidden">
          <ArenaPanel sessionId={sessionId} />
        </section>

        <aside className="rounded-2xl border border-violet-300/24 bg-violet-500/5 backdrop-blur-2xl p-3 flex flex-col min-h-[220px] 2xl:min-h-0">
          <p className="text-[10px] uppercase tracking-[0.18em] font-mono text-violet-200/95">
            {locale === "zh-CN" ? "PR / 任务管线" : "PR / Task Pipeline"}
          </p>

          <div className="mt-3 space-y-2">
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-mono text-emerald-200">PR Status</p>
                <GitBranch className="w-4 h-4 text-emerald-300" />
              </div>
              <p className="mt-2 text-[11px] text-emerald-100/90">
                {currentAction
                  ? locale === "zh-CN"
                    ? "存在待确认动作，可一键执行到主分支。"
                    : "Action proposal pending confirmation for one-click execution."
                  : locale === "zh-CN"
                    ? "当前无待确认动作。"
                    : "No pending action proposal."}
              </p>
            </div>

            <div className="rounded-xl border border-cyan-300/25 bg-cyan-500/8 p-3 grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div>
                <p className="text-slate-400 uppercase">Pending</p>
                <p className="text-cyan-100 text-lg">{pending}</p>
              </div>
              <div>
                <p className="text-slate-400 uppercase">Done</p>
                <p className="text-emerald-200 text-lg">{done}</p>
              </div>
            </div>

            <div className="rounded-xl border border-amber-300/25 bg-amber-500/10 p-3 text-[11px]">
              <div className="flex items-center gap-2 text-amber-200 font-mono uppercase tracking-[0.12em]">
                <Zap className="w-4 h-4" />
                {locale === "zh-CN" ? "执行建议" : "Execution Tips"}
              </div>
              <ul className="mt-2 space-y-1 text-slate-200/90">
                <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-amber-300" />{locale === "zh-CN" ? "先在 Arena 产出 action proposal" : "Generate action proposal in Arena first."}</li>
                <li className="flex items-start gap-2"><Activity className="w-3.5 h-3.5 mt-0.5 text-amber-300" />{locale === "zh-CN" ? "再在这里跟踪执行状态与任务完成率" : "Track execution and completion rate here."}</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
