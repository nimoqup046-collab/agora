"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { WisdomHall } from "@/components/home/WisdomHall";

export default function HomePage() {
  const { locale, t } = useI18n();

  const modules = [
    {
      key: "COUNCIL",
      descEn: "Multi-agent deliberation and consensus stream.",
      descZh: "多智能体推理协商与结论共识中心。",
      href: "/council",
      active: true,
    },
    {
      key: "ARENA",
      descEn: "Action proposals, execution path, and approvals.",
      descZh: "动作提案、执行路径与确认审批。",
      href: "/council?mode=arena",
      active: true,
    },
    {
      key: "BOARD",
      descEn: "Task decomposition and collaborative battle board.",
      descZh: "任务拆解与协同推进作战看板。",
      href: "/council?mode=board",
      active: true,
    },
    {
      key: "MEMORY",
      descEn: "Cross-session memory and knowledge graph context.",
      descZh: "跨会话记忆与知识图谱上下文。",
      href: "/council",
      active: false,
    },
  ];

  return (
    <main className="min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      <div className="agora-panel rounded-xl px-4 sm:px-5 py-3 flex items-center gap-3">
        <div>
          <p className="font-tech text-cyan-200 text-sm tracking-[0.3em]">AGORA</p>
          <p className="text-[10px] text-slate-400 tracking-[0.18em] uppercase">
            {t("command.center")}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] border border-emerald-500/40 text-emerald-300 px-2 py-1 rounded">
            {t("home.online")}
          </span>
          <LanguageToggle />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4">
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="agora-panel rounded-xl p-5 sm:p-6"
        >
          <p className="font-tech text-xs uppercase tracking-[0.25em] text-cyan-300/85">
            {t("home.modules")}
          </p>
          <h1 className="font-tech text-4xl sm:text-5xl mt-3 text-slate-100 leading-none">
            {t("home.title")}
          </h1>
          <p className="font-wisdom text-base sm:text-lg mt-2 text-amber-200/90">
            {t("home.subtitle")}
          </p>

          <blockquote className="mt-5 p-4 rounded-lg module-divider font-wisdom text-sm sm:text-base leading-relaxed text-slate-200/90">
            <p>{t("home.quoteA")}</p>
            <p className="mt-2">{t("home.quoteB")}</p>
          </blockquote>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {modules.map((module) => (
              <Link
                key={module.key}
                href={module.href}
                className="module-divider rounded-lg p-4 hover:scale-[1.01] transition-transform duration-200"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-tech text-xs tracking-[0.2em] text-cyan-200">{module.key}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded border ${
                      module.active
                        ? "border-emerald-500/50 text-emerald-300"
                        : "border-amber-500/50 text-amber-300"
                    }`}
                  >
                    {module.active ? t("home.moduleStatusActive") : t("home.moduleStatusAlpha")}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-300/90 leading-relaxed">
                  {locale === "zh-CN" ? module.descZh : module.descEn}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-5">
            <Link
              href="/council"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-cyan-400/45 bg-cyan-500/10 text-cyan-100 font-tech text-sm tracking-[0.12em] hover:bg-cyan-500/16 transition-colors"
            >
              {t("home.enter")}
            </Link>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.06 }}
          className="space-y-4"
        >
          <WisdomHall />

          <div className="agora-panel rounded-xl p-5">
            <p className="font-tech text-[11px] uppercase tracking-[0.2em] text-slate-300/80">
              {t("home.systemState")}
            </p>
            <div className="mt-3 space-y-2">
              {[
                ["API", "LIVE"],
                ["MEMORY", "REDIS + PG"],
                ["GITHUB", "CONNECTED"],
                ["VERSION", "2.1.0"],
              ].map(([k, v]) => (
                <div key={k} className="module-divider rounded-md px-3 py-2 flex items-center justify-between">
                  <span className="font-tech text-xs text-slate-300">{k}</span>
                  <span className="text-xs text-cyan-200">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}

