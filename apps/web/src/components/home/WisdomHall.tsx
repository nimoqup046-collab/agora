"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/components/i18n/LanguageProvider";

type PixelLegend = "." | "s" | "h" | "r" | "g" | "e";

interface Figure {
  id: string;
  nameEn: string;
  nameZh: string;
  titleEn: string;
  titleZh: string;
  map: string[];
  accentColor: string;
}

const COLOR_MAP: Record<PixelLegend, string> = {
  ".": "transparent",
  s: "#f4d7b3",
  h: "#d4c5a1",
  r: "#5f73ff",
  g: "#d7ad63",
  e: "#7ff3ff",
};

const FIGURES: Figure[] = [
  {
    id: "socrates",
    nameEn: "Socrates",
    nameZh: "苏格拉底",
    titleEn: "Dialectics",
    titleZh: "诘问辩证",
    accentColor: "#39d8ff",
    map: [
      "..hhhhhhhh..",
      ".hhsssssshh.",
      ".hsssssssshh",
      ".hssesseessh",
      ".hsssssssssh",
      ".hhssggsshh.",
      "..hsggggsh..",
      "..rrsggssr..",
      ".rrrsggssrr.",
      ".rrrsggssrr.",
      "..rrrsssrr..",
      "...rr..rr...",
    ],
  },
  {
    id: "einstein",
    nameEn: "Einstein",
    nameZh: "爱因斯坦",
    titleEn: "Relativity",
    titleZh: "相对论",
    accentColor: "#8f7dff",
    map: [
      "..hhhhhhhh..",
      ".hhhsssshhh.",
      ".hsssssssshh",
      ".hsseseeessh",
      ".hsssssssssh",
      ".hhssggsshh.",
      "..hsggggsh..",
      "..rrsggssr..",
      ".rrssggssrr.",
      ".rrssggssrr.",
      "..rrrsssrr..",
      "...rr..rr...",
    ],
  },
  {
    id: "laozi",
    nameEn: "Laozi",
    nameZh: "老子",
    titleEn: "Dao",
    titleZh: "道法自然",
    accentColor: "#10b981",
    map: [
      "..hhhhhhhh..",
      ".hhsssssshh.",
      ".hsssssssshh",
      ".hssesseessh",
      ".hsssssssssh",
      ".hhssggsshh.",
      "..hsggggsh..",
      "..ggsggssg..",
      ".gggsggssgg.",
      ".gggsggssgg.",
      "..gggsssgg..",
      "...gg..gg...",
    ],
  },
  {
    id: "buddha",
    nameEn: "Buddha",
    nameZh: "佛陀",
    titleEn: "Awakening",
    titleZh: "觉悟慈悲",
    accentColor: "#e3c27a",
    map: [
      "..gggggggg..",
      ".ggssssssgg.",
      ".gssssssssgg",
      ".gsseseeessg",
      ".gsssssssssg",
      ".ggssrrssgg.",
      "..gsrrrrsg..",
      "..rrsrrssr..",
      ".rrrsrrssrr.",
      ".rrrsrrssrr.",
      "..rrrsssrr..",
      "...rr..rr...",
    ],
  },
];

function PixelAvatar({ map }: { map: string[] }) {
  return (
    <div className="pixel-grid">
      {map
        .join("")
        .split("")
        .map((cell, idx) => (
          <span
            key={idx}
            className="pixel-cell"
            style={{ background: COLOR_MAP[(cell as PixelLegend) || "."] }}
          />
        ))}
    </div>
  );
}

export function WisdomHall() {
  const { locale, t } = useI18n();

  return (
    <section className="glass-card rounded-2xl p-5 sm:p-6 relative overflow-hidden">
      {/* Subtle glow effect */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(57,216,255,0.04), transparent 60%)",
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3 mb-5">
          <h3 className="font-tech text-sm tracking-[0.25em] text-cyan-200/80 uppercase text-glow-cyan">
            {t("home.wisdomHall")}
          </h3>
          <span className="text-[9px] uppercase tracking-[0.18em] text-amber-300/60 font-tech">
            {t("home.ancientFuture")}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FIGURES.map((figure, i) => (
            <motion.div
              key={figure.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="pixel-avatar rounded-xl p-3 flex flex-col items-center gap-2.5 group transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <div className="relative">
                <PixelAvatar map={figure.map} />
                {/* Hover glow ring */}
                <div
                  className="absolute inset-[-4px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle, ${figure.accentColor}08, transparent 70%)`,
                  }}
                />
              </div>
              <div className="text-center">
                <p className="font-tech text-[11px] text-cyan-100/80 tracking-wide">
                  {locale === "zh-CN" ? figure.nameZh : figure.nameEn}
                </p>
                <p className="font-wisdom text-[10px] text-amber-200/60 mt-0.5">
                  {locale === "zh-CN" ? figure.titleZh : figure.titleEn}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
