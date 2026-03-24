"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { WisdomHall } from "@/components/home/WisdomHall";
import { PixelIcon, MENU_ITEMS } from "@/components/menu/AgoraMenu";

export default function HomePage() {
  const { locale, t } = useI18n();

  const modules = MENU_ITEMS.map((item) => ({
    ...item,
    href:
      item.mode === "research"
        ? "/council"
        : `/council?mode=${item.mode}`,
    active: item.mode !== "reasoning",
  }));

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* ── Ambient Background Particles ─────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 2,
              height: 2,
              background: i % 2 === 0 ? "rgba(57,216,255,0.3)" : "rgba(143,125,255,0.3)",
              left: `${15 + i * 15}%`,
              top: `${10 + (i * 17) % 80}%`,
              animation: `particle-drift ${4 + i * 0.8}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 px-4 py-4 sm:px-6 sm:py-6 max-w-7xl mx-auto">
        {/* ── Top Bar ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card rounded-2xl px-5 py-3 flex items-center gap-3"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-tech text-sm font-bold text-cyan-300"
              style={{
                background: "linear-gradient(135deg, rgba(57,216,255,0.12), rgba(143,125,255,0.08))",
                border: "1px solid rgba(57,216,255,0.2)",
                boxShadow: "0 0 20px rgba(57,216,255,0.1)",
              }}
            >
              A
            </div>
            <div>
              <p className="font-tech text-cyan-200/90 text-sm tracking-[0.3em] text-glow-cyan">AGORA</p>
              <p className="text-[9px] text-slate-500 tracking-[0.15em] uppercase">
                {t("command.center")}
              </p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[10px] font-tech text-emerald-400/80 px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(16,185,129,0.06)",
                border: "1px solid rgba(16,185,129,0.15)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t("home.online")}
            </span>
            <LanguageToggle />
          </div>
        </motion.div>

        <div className="mt-6 grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-5">
          {/* ── Left: Hero + Mode Cards ───────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="glass-card rounded-2xl p-6 sm:p-8"
          >
            <p className="font-tech text-[10px] uppercase tracking-[0.3em] text-cyan-400/70">
              {t("home.modules")}
            </p>
            <h1 className="font-tech text-4xl sm:text-5xl mt-3 text-white/95 leading-none tracking-[0.05em] text-glow-cyan">
              {t("home.title")}
            </h1>
            <p className="font-wisdom text-lg sm:text-xl mt-2 text-amber-200/80">
              {t("home.subtitle")}
            </p>

            <blockquote className="mt-6 p-4 rounded-xl font-wisdom text-sm sm:text-base leading-relaxed text-slate-300/80"
              style={{
                background: "rgba(57,216,255,0.02)",
                borderLeft: "2px solid rgba(57,216,255,0.15)",
              }}
            >
              <p>{t("home.quoteA")}</p>
              <p className="mt-2">{t("home.quoteB")}</p>
            </blockquote>

            {/* ── Five Mode Grid ──────────────────────────── */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {modules.map((mod, index) => (
                <motion.div
                  key={mod.mode}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.06, duration: 0.4, type: "spring", damping: 20 }}
                >
                  <Link
                    href={mod.href}
                    className="home-module-card group block rounded-2xl p-4 relative overflow-hidden"
                    style={{
                      ["--module-color" as string]: mod.color,
                      ["--module-glow" as string]: mod.glow,
                    }}
                  >
                    {/* Hover glow */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, ${mod.glow}, transparent 70%)`,
                      }}
                    />

                    <div className="relative z-10 flex items-start justify-between gap-2 mb-3">
                      <div
                        className="p-2 rounded-xl transition-all duration-300 group-hover:scale-105"
                        style={{
                          background: `${mod.color}08`,
                          border: `1px solid ${mod.color}18`,
                        }}
                      >
                        <PixelIcon mode={mod.mode} size={4} />
                      </div>
                      <span
                        className="text-[9px] px-2 py-0.5 rounded-full font-tech"
                        style={{
                          border: `1px solid ${mod.active ? mod.color + "30" : "rgba(245,158,11,0.3)"}`,
                          color: mod.active ? mod.color : "rgb(252,211,77)",
                          background: mod.active ? `${mod.color}08` : "rgba(245,158,11,0.05)",
                        }}
                      >
                        {mod.active ? t("home.moduleStatusActive") : t("home.moduleStatusAlpha")}
                      </span>
                    </div>
                    <span
                      className="relative z-10 block font-tech text-xs tracking-[0.2em] transition-colors"
                      style={{ color: mod.color }}
                    >
                      {t(mod.labelKey)}
                    </span>
                    <p className="relative z-10 mt-1.5 text-[11px] text-slate-400/70 leading-relaxed">
                      {t(mod.descKey)}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-6">
              <Link
                href="/council"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-tech text-sm tracking-[0.12em] transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, rgba(57,216,255,0.1), rgba(143,125,255,0.08))",
                  border: "1px solid rgba(57,216,255,0.2)",
                  color: "#a5f3fc",
                  boxShadow: "0 0 20px rgba(57,216,255,0.08)",
                }}
              >
                {t("home.enter")}
                <span className="text-cyan-400/60">→</span>
              </Link>
            </div>
          </motion.section>

          {/* ── Right: Wisdom Hall + System State ────────── */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="space-y-5"
          >
            <WisdomHall />

            <div className="glass-card rounded-2xl p-5">
              <p className="font-tech text-[10px] uppercase tracking-[0.25em] text-slate-400/80">
                {t("home.systemState")}
              </p>
              <div className="mt-3 space-y-2">
                {[
                  { k: "API", v: "LIVE", color: "#10b981" },
                  { k: "MEMORY", v: "REDIS + PG", color: "#39d8ff" },
                  { k: "GITHUB", v: "CONNECTED", color: "#8f7dff" },
                  { k: "VERSION", v: "2.1.0", color: "#e3c27a" },
                ].map(({ k, v, color }) => (
                  <div
                    key={k}
                    className="rounded-xl px-3 py-2 flex items-center justify-between"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <span className="font-tech text-[10px] text-slate-400 tracking-wider">{k}</span>
                    <span className="text-[10px] font-tech" style={{ color }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
