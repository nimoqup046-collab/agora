"use client";

import { useI18n } from "@/components/i18n/LanguageProvider";

type PixelLegend = "." | "s" | "h" | "r" | "g" | "e";

interface Figure {
  id: string;
  nameEn: string;
  nameZh: string;
  titleEn: string;
  titleZh: string;
  map: string[];
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
      {map.join("").split("").map((cell, idx) => {
        const key = `${idx}-${cell}`;
        return (
          <span
            key={key}
            className="pixel-cell"
            style={{ background: COLOR_MAP[(cell as PixelLegend) || "."] }}
          />
        );
      })}
    </div>
  );
}

export function WisdomHall() {
  const { locale, t } = useI18n();

  return (
    <section className="agora-panel agora-panel-highlight rounded-xl p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="font-tech text-sm tracking-[0.28em] text-cyan-200 uppercase">
          {t("home.wisdomHall")}
        </h3>
        <span className="text-[10px] uppercase tracking-[0.2em] text-amber-300/80">
          {t("home.ancientFuture")}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {FIGURES.map((figure) => (
          <div key={figure.id} className="pixel-avatar module-divider rounded-lg p-3 flex flex-col items-center gap-2">
            <PixelAvatar map={figure.map} />
            <div className="text-center">
              <p className="font-tech text-xs text-cyan-100 tracking-wide">
                {locale === "zh-CN" ? figure.nameZh : figure.nameEn}
              </p>
              <p className="font-wisdom text-[11px] text-amber-200/90">
                {locale === "zh-CN" ? figure.titleZh : figure.titleEn}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

