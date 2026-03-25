"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { Code2, FlaskConical, BrainCircuit, Zap, Palette } from "lucide-react";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { WisdomHall } from "@/components/home/WisdomHall";
import { PixelIcon, MENU_ITEMS } from "@/components/menu/AgoraMenu";
import { ModeSelectorOverlay } from "@/components/layout/ModeSelectorOverlay";
import type { PanelMode } from "@/types";

function routeForMode(mode: PanelMode) {
  return mode === "research" ? "/council" : `/council?mode=${mode}`;
}

const MODE_LUCIDE_ICONS: Record<PanelMode, React.ElementType> = {
  coding: Code2,
  research: FlaskConical,
  reasoning: BrainCircuit,
  evolution: Zap,
  creation: Palette,
};

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
    <main className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      {/* Gradient overlays */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-cyan-500/[0.04] blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-violet-600/[0.05] blur-[120px]" />
        <div className="absolute top-[40%] left-[35%] w-[30vw] h-[30vw] rounded-full bg-amber-500/[0.03] blur-[100px]" />
      </div>

      {/* Subtle grid texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Sticky header */}
      <header className="sticky top-0 z-50 w-full bg-black/40 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => setSelectorOpen(true)}
            className="group flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-white/5 transition-colors"
            title={locale === "zh-CN" ? "打开模式选择器" : "Open mode selector"}
          >
            <span className="font-mono text-lg tracking-[-0.05em] font-bold text-white">
              AGORA
            </span>
          </button>

          <div className="ml-auto flex items-center gap-3">
            <span className="text-[10px] font-mono px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full">
              {t("home.online")}
            </span>
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Page body */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Hero + right column */}
        <section className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
          {/* Hero glass card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-400">
              {locale === "zh-CN" ? "群星工作区门户" : "SWARM WORKSPACE GATEWAY"}
            </p>
            <h1 className="font-mono text-5xl font-black mt-3 text-white leading-none">
              AGORA
            </h1>
            <p className="text-sm text-zinc-400 mt-2">{t("home.subtitle")}</p>

            <div className="mt-5 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] text-sm leading-relaxed text-zinc-300">
              <p>{t("home.quoteA")}</p>
              <p className="mt-2">{t("home.quoteB")}</p>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => enterMode("research")}
                className="px-5 py-2.5 rounded-3xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 font-mono text-sm tracking-[0.08em] hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all duration-200"
              >
                {locale === "zh-CN" ? "进入议会" : "ENTER COUNCIL"}
              </button>
              <button
                onClick={() => setSelectorOpen(true)}
                className="px-5 py-2.5 rounded-3xl border border-violet-500/30 bg-violet-500/10 text-violet-300 font-mono text-sm tracking-[0.08em] hover:bg-violet-500/20 hover:border-violet-500/50 transition-all duration-200"
              >
                {locale === "zh-CN" ? "选择模式" : "SELECT MODE"}
              </button>
              <Link
                href="/council"
                className="px-5 py-2.5 rounded-3xl border border-amber-500/30 bg-amber-500/10 text-amber-300 font-mono text-sm tracking-[0.08em] hover:bg-amber-500/20 hover:border-amber-500/50 transition-all duration-200"
              >
                {t("home.enter")}
              </Link>
            </div>

            {/* Mode cards grid */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-3">
              {modules.map((mod, index) => {
                const LucideIcon = MODE_LUCIDE_ICONS[mod.mode];
                return (
                  <motion.button
                    key={mod.mode}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06, duration: 0.3 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    onClick={() => enterMode(mod.mode)}
                    className="group text-left bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[40px] p-8 hover:border-white/30 transition-all duration-300"
                    style={
                      {
                        "--module-color": mod.color,
                        "--module-glow": mod.glow,
                        boxShadow: `0 0 0 0 ${mod.glow}`,
                      } as CSSProperties
                    }
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 60px ${mod.glow}, 0 0 0 0 transparent`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 0 ${mod.glow}`;
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div
                        className="w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                        style={{
                          background: `linear-gradient(135deg, ${mod.color}20, ${mod.color}08)`,
                          border: `1px solid ${mod.color}30`,
                          boxShadow: `0 0 24px ${mod.glow}`,
                        }}
                      >
                        <LucideIcon
                          size={28}
                          style={{ color: mod.color }}
                        />
                      </div>
                      <span
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                        style={{
                          color: mod.color,
                          borderColor: `${mod.color}40`,
                          background: `${mod.color}10`,
                        }}
                      >
                        {locale === "zh-CN" ? "模式" : "MODE"}
                      </span>
                    </div>
                    <div className="mb-2">
                      <PixelIcon mode={mod.mode} size={3} />
                    </div>
                    <span
                      className="block font-mono text-xs tracking-[0.2em] font-semibold mt-1"
                      style={{ color: mod.color }}
                    >
                      {t(mod.labelKey)}
                    </span>
                    <p className="mt-1.5 text-[11px] text-zinc-400 leading-relaxed">
                      {t(mod.descKey)}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Right column */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="space-y-5"
          >
            {/* WisdomHall wrapped in glass card */}
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden">
              <WisdomHall />
            </div>

            {/* Terminal dimensions glass card */}
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-400">
                {locale === "zh-CN" ? "终端维度" : "TERMINAL DIMENSIONS"}
              </p>
              <div className="mt-4 space-y-2">
                {(
                  [
                    [locale === "zh-CN" ? "编程" : "CODING", "LIVE", "#39d8ff"],
                    [locale === "zh-CN" ? "科研" : "RESEARCH", "LIVE", "#8f7dff"],
                    [locale === "zh-CN" ? "推理" : "REASONING", "ALPHA", "#e3c27a"],
                    [locale === "zh-CN" ? "进化" : "EVOLUTION", "LIVE", "#10b981"],
                    [locale === "zh-CN" ? "创作" : "CREATION", "LIVE", "#f472b6"],
                  ] as [string, string, string][]
                ).map(([k, v, color]) => (
                  <div
                    key={k}
                    className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-2.5 flex items-center justify-between hover:bg-white/[0.06] transition-colors duration-200"
                  >
                    <span className="font-mono text-xs text-zinc-300">{k}</span>
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                      style={{
                        color,
                        borderColor: `${color}40`,
                        background: `${color}10`,
                      }}
                    >
                      {v}
                    </span>
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
