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
    active: item.mode !== "reasoning", // reasoning is still alpha
  }));

  return (
    <main className="min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      {/* ── Top Bar ─────────────────────────────────────── */}
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
        {/* ── Left: Hero + Module Cards ───────────────────── */}
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

          {/* ── Five Module Grid ──────────────────────────── */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {modules.map((mod, index) => (
              <motion.div
                key={mod.mode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.3 }}
              >
                <Link
                  href={mod.href}
                  className="home-module-card group block rounded-xl p-4 transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    borderColor: `${mod.color}22`,
                    ["--module-color" as string]: mod.color,
                    ["--module-glow" as string]: mod.glow,
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="p-1.5 rounded-lg bg-white/[0.03] group-hover:bg-white/[0.06] transition-colors">
                      <PixelIcon mode={mod.mode} size={4} />
                    </div>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded border"
                      style={{
                        borderColor: mod.active ? `${mod.color}50` : "rgba(245,158,11,0.4)",
                        color: mod.active ? mod.color : "rgb(252,211,77)",
                      }}
                    >
                      {mod.active ? t("home.moduleStatusActive") : t("home.moduleStatusAlpha")}
                    </span>
                  </div>
                  <span
                    className="block font-tech text-xs tracking-[0.2em] transition-colors"
                    style={{ color: mod.color }}
                  >
                    {t(mod.labelKey)}
                  </span>
                  <p className="mt-1.5 text-[11px] text-slate-300/70 leading-relaxed">
                    {t(mod.descKey)}
                  </p>
                </Link>
              </motion.div>
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

        {/* ── Right: Wisdom Hall + System State ────────────── */}
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

