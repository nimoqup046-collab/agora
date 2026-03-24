"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { WisdomHall } from "@/components/home/WisdomHall";
import { PixelIcon, MENU_ITEMS } from "@/components/menu/AgoraMenu";
import { ModeSelectorOverlay } from "@/components/layout/ModeSelectorOverlay";
import type { PanelMode } from "@/types";

function routeForMode(mode: PanelMode) {
  return mode === "research" ? "/council" : `/council?mode=${mode}`;
}

export default function HomePage() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<PanelMode>("research");

  const modules = useMemo(
    () =>
      MENU_ITEMS.map((item) => ({
        ...item,
        href: routeForMode(item.mode),
      })),
    []
  );

  const enterMode = (mode: PanelMode) => {
    setActiveMode(mode);
    router.push(routeForMode(mode));
  };

  return (
    <main className="home-cosmos min-h-screen relative overflow-hidden px-4 py-4 sm:px-6 sm:py-6">
      <div className="home-cosmos-grid" />
      <div className="home-cosmos-noise" />
      <div className="home-orb home-orb-cyan" />
      <div className="home-orb home-orb-violet" />
      <div className="home-orb home-orb-gold" />

      <div className="relative z-10">
        <header className="agora-panel rounded-2xl px-4 sm:px-6 py-3 flex items-center gap-3 border border-cyan-400/30">
          <button
            onClick={() => setSelectorOpen(true)}
            className="group rounded-lg px-2 py-1.5 hover:bg-cyan-500/10 transition-colors"
            title={locale === "zh-CN" ? "打开模式选择器" : "Open mode selector"}
          >
            <p className="font-tech text-cyan-200 text-sm tracking-[0.34em] group-hover:text-cyan-100">AGORA</p>
            <p className="text-[10px] text-slate-400 tracking-[0.2em] uppercase">{t("command.center")}</p>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] border border-emerald-500/45 text-emerald-300 px-2 py-1 rounded">
              {t("home.online")}
            </span>
            <LanguageToggle />
          </div>
        </header>

        <section className="mt-4 grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="agora-panel rounded-2xl p-5 sm:p-6 border border-cyan-400/30"
          >
            <p className="font-tech text-[11px] uppercase tracking-[0.28em] text-cyan-300/90">
              {locale === "zh-CN" ? "群星工作区门户" : "SWARM WORKSPACE GATEWAY"}
            </p>
            <h1 className="font-tech text-5xl sm:text-6xl mt-3 text-slate-100 leading-none">AGORA</h1>
            <p className="font-wisdom text-lg sm:text-xl mt-2 text-amber-200/90">{t("home.subtitle")}</p>

            <blockquote className="mt-5 p-4 rounded-xl module-divider font-wisdom text-sm sm:text-base leading-relaxed text-slate-200/90 border-cyan-400/25">
              <p>{t("home.quoteA")}</p>
              <p className="mt-2">{t("home.quoteB")}</p>
            </blockquote>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => enterMode("research")}
                className="px-5 py-2.5 rounded-xl border border-cyan-400/45 bg-cyan-500/12 text-cyan-100 font-tech text-sm tracking-[0.12em] hover:bg-cyan-500/20 transition-colors"
              >
                {locale === "zh-CN" ? "进入议会" : "ENTER COUNCIL"}
              </button>
              <button
                onClick={() => setSelectorOpen(true)}
                className="px-5 py-2.5 rounded-xl border border-violet-400/45 bg-violet-500/12 text-violet-100 font-tech text-sm tracking-[0.12em] hover:bg-violet-500/20 transition-colors"
              >
                {locale === "zh-CN" ? "选择模式" : "SELECT MODE"}
              </button>
              <Link
                href="/council"
                className="px-5 py-2.5 rounded-xl border border-amber-400/45 bg-amber-500/10 text-amber-100 font-tech text-sm tracking-[0.12em] hover:bg-amber-500/18 transition-colors"
              >
                {t("home.enter")}
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {modules.map((mod, index) => (
                <motion.button
                  key={mod.mode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.26 }}
                  onClick={() => enterMode(mod.mode)}
                  className="gateway-card group text-left rounded-xl p-4"
                  style={
                    {
                      borderColor: `${mod.color}33`,
                      "--module-color": mod.color,
                      "--module-glow": mod.glow,
                    } as CSSProperties
                  }
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="p-1.5 rounded-lg bg-white/[0.03] group-hover:bg-white/[0.08] transition-colors">
                      <PixelIcon mode={mod.mode} size={4} />
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded border border-cyan-400/40 text-cyan-200">
                      {locale === "zh-CN" ? "模式" : "MODE"}
                    </span>
                  </div>
                  <span className="block font-tech text-xs tracking-[0.2em]" style={{ color: mod.color }}>
                    {t(mod.labelKey)}
                  </span>
                  <p className="mt-1.5 text-[11px] text-slate-300/75 leading-relaxed">{t(mod.descKey)}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="space-y-4"
          >
            <WisdomHall />

            <div className="agora-panel rounded-2xl p-5 border border-violet-400/30">
              <p className="font-tech text-[11px] uppercase tracking-[0.24em] text-violet-200/85">
                {locale === "zh-CN" ? "终端维度" : "TERMINAL DIMENSIONS"}
              </p>
              <div className="mt-3 space-y-2">
                {[
                  [locale === "zh-CN" ? "编程" : "CODING", "LIVE"],
                  [locale === "zh-CN" ? "科研" : "RESEARCH", "LIVE"],
                  [locale === "zh-CN" ? "推理" : "REASONING", "ALPHA"],
                  [locale === "zh-CN" ? "进化" : "EVOLUTION", "LIVE"],
                  [locale === "zh-CN" ? "创作" : "CREATION", "LIVE"],
                ].map(([k, v]) => (
                  <div key={k} className="module-divider rounded-md px-3 py-2 flex items-center justify-between">
                    <span className="font-tech text-xs text-slate-200">{k}</span>
                    <span className="text-xs text-cyan-200">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>
      </div>

      <ModeSelectorOverlay
        open={selectorOpen}
        currentMode={activeMode}
        onClose={() => setSelectorOpen(false)}
        onSelect={enterMode}
      />
    </main>
  );
}
