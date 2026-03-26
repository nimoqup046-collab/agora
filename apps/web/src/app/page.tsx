"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Beaker, BrainCircuit, Code2, Palette, Zap } from "lucide-react";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { ModeSelectorOverlay } from "@/components/layout/ModeSelectorOverlay";
import type { PanelMode } from "@/types";

const QUICK_MODES: Array<{ mode: PanelMode; icon: typeof Code2; color: string }> = [
  { mode: "coding", icon: Code2, color: "#38bdf8" },
  { mode: "research", icon: Beaker, color: "#a78bfa" },
  { mode: "reasoning", icon: BrainCircuit, color: "#22d3ee" },
  { mode: "evolution", icon: Zap, color: "#f59e0b" },
  { mode: "creation", icon: Palette, color: "#fb7185" },
];

function routeForMode(mode: PanelMode) {
  return mode === "research" ? "/council" : `/council?mode=${mode}`;
}

export default function HomePage() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<PanelMode>("research");

  const enterMode = (mode: PanelMode) => {
    setActiveMode(mode);
    router.push(routeForMode(mode));
  };

  const quick = useMemo(() => QUICK_MODES, []);

  return (
    <main className="min-h-screen bg-[#050505] text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_40%),radial-gradient(circle_at_80%_15%,rgba(168,85,247,0.16),transparent_40%),radial-gradient(circle_at_50%_85%,rgba(14,165,233,0.14),transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:44px_44px] opacity-35" />

      <div className="relative z-10 px-4 py-4 sm:px-6 sm:py-6">
        <header className="h-12 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl flex items-center px-4 sm:px-6">
          <button
            onClick={() => setSelectorOpen(true)}
            className="flex items-center gap-3 group"
            title={locale === "zh-CN" ? "打开模式选择器" : "Open mode selector"}
          >
            <div className="w-7 h-7 rounded-lg bg-cyan-500 shadow-[0_0_22px_rgba(34,211,238,0.45)] flex items-center justify-center text-[11px] font-mono font-black">A</div>
            <div>
              <p className="font-mono text-base tracking-[0.18em] text-cyan-100 group-hover:text-cyan-50">AGORA</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">{t("command.center")}</p>
            </div>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] px-2 py-1 border border-emerald-500/45 text-emerald-300 rounded uppercase">{t("home.online")}</span>
            <LanguageToggle />
          </div>
        </header>

        <section className="mt-5 grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-cyan-300/28 bg-black/35 backdrop-blur-2xl p-6"
          >
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-cyan-200/95">
              {locale === "zh-CN" ? "智慧协同终端" : "Collective Intelligence Terminal"}
            </p>
            <h1 className="mt-3 text-6xl font-tech text-white">AGORA</h1>
            <p className="mt-2 text-xl text-amber-200/90 font-wisdom">{t("home.subtitle")}</p>

            <blockquote className="mt-5 rounded-2xl border border-cyan-300/24 bg-cyan-500/8 px-4 py-3 text-sm text-slate-200/90 leading-relaxed font-wisdom">
              <p>{t("home.quoteA")}</p>
              <p className="mt-1.5">{t("home.quoteB")}</p>
            </blockquote>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => enterMode("research")}
                className="px-5 py-2.5 rounded-xl border border-cyan-400/45 bg-cyan-500/14 text-cyan-100 text-sm font-mono uppercase tracking-[0.12em] hover:bg-cyan-500/22 transition-colors"
              >
                {locale === "zh-CN" ? "进入工作台" : "Enter Workspace"}
              </button>
              <button
                onClick={() => setSelectorOpen(true)}
                className="px-5 py-2.5 rounded-xl border border-violet-400/45 bg-violet-500/14 text-violet-100 text-sm font-mono uppercase tracking-[0.12em] hover:bg-violet-500/22 transition-colors"
              >
                {t("menu.switchMode")}
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {quick.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.mode}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => enterMode(item.mode)}
                    className="rounded-2xl border bg-black/40 hover:bg-black/55 backdrop-blur-xl p-4 text-left transition-colors"
                    style={{ borderColor: `${item.color}55` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-lg border flex items-center justify-center" style={{ borderColor: `${item.color}99`, color: item.color }}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.14em] text-slate-300">mode</span>
                    </div>
                    <p className="mt-3 text-sm font-semibold" style={{ color: item.color }}>{t(`menu.${item.mode}`)}</p>
                    <p className="mt-1 text-[11px] text-slate-300/80">{t(`menu.${item.mode}Desc`)}</p>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-3xl border border-violet-300/28 bg-black/35 backdrop-blur-2xl p-5"
          >
            <p className="text-[11px] uppercase tracking-[0.18em] font-mono text-violet-100/95">{t("home.systemState")}</p>
            <div className="mt-3 space-y-2">
              {[
                ["API", "LIVE"],
                ["MEMORY", "REDIS + PG"],
                ["GITHUB", "CONNECTED"],
                ["VERSION", "2.2.0"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-white/12 bg-black/45 px-3 py-2 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-200">{k}</span>
                  <span className="font-mono text-cyan-200">{v}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-500/8 p-4">
              <p className="text-xs font-mono text-cyan-100 uppercase tracking-[0.14em]">{t("home.wisdomHall")}</p>
              <p className="mt-2 text-[11px] text-slate-300/90 leading-relaxed">
                {locale === "zh-CN"
                  ? "苏格拉底、爱因斯坦、老子与佛陀作为智慧原型，映射五种工作模式。"
                  : "Socrates, Einstein, Laozi, and Buddha serve as archetypes for the five workspace modes."}
              </p>
            </div>
          </motion.div>
        </section>
      </div>

      <ModeSelectorOverlay
        open={selectorOpen}
        currentMode={activeMode}
        onClose={() => setSelectorOpen(false)}
        onSelect={(mode) => {
          setSelectorOpen(false);
          enterMode(mode);
        }}
      />
    </main>
  );
}
