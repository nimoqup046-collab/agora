"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { clsx } from "clsx";
import { useAgoraStore } from "@/lib/store";
import { StatusPill } from "@/components/common/StatusPill";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { ModeSelectorOverlay } from "@/components/layout/ModeSelectorOverlay";
import { MENU_ITEMS } from "@/components/menu/AgoraMenu";
import type { PanelMode } from "@/types";

interface CommandBarProps {
  sessionTitle?: string;
  mode: PanelMode;
  onModeChange: (mode: PanelMode) => void;
}

export function CommandBar({ sessionTitle, mode, onModeChange }: CommandBarProps) {
  const { isStreaming } = useAgoraStore();
  const { locale, t } = useI18n();
  const [selectorOpen, setSelectorOpen] = useState(false);

  const modeLabel = useMemo(() => t(`menu.${mode}`), [mode, t]);
  const currentItem = useMemo(() => MENU_ITEMS.find((item) => item.mode === mode), [mode]);

  return (
    <>
      <div className="command-bar-glass h-12 shrink-0 px-3 sm:px-4 flex items-center gap-2 border-b border-white/[0.06] z-20">
        <button
          type="button"
          onClick={() => setSelectorOpen(true)}
          className="font-tech text-sm text-cyan-200 hover:text-cyan-100 transition-colors tracking-[0.18em] px-2 py-1 rounded border border-cyan-400/25 hover:border-cyan-300/55"
          title={locale === "zh-CN" ? "打开模式选择器" : "Open mode selector"}
        >
          AGORA
        </button>

        {sessionTitle && (
          <>
            <span className="text-slate-500/60">/</span>
            <span className="text-xs text-slate-300/80 truncate max-w-28 sm:max-w-48 font-wisdom">
              {sessionTitle || t("command.sessionFallback")}
            </span>
          </>
        )}

        <StatusPill
          label={isStreaming ? "LIVE" : "IDLE"}
          variant={isStreaming ? "live" : "idle"}
          pulse={isStreaming}
        />

        <div className="ml-auto flex items-center gap-2">
          <div
            className="hidden sm:flex items-center px-2.5 py-1 rounded border"
            style={{
              borderColor: `${currentItem?.color ?? "#67e8f9"}55`,
              color: currentItem?.color ?? "#cffafe",
              backgroundColor: `${currentItem?.color ?? "#67e8f9"}16`,
            }}
          >
            <span className="font-tech text-[10px] tracking-[0.16em]">{modeLabel}</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded border border-violet-300/35 bg-violet-500/10">
            {[0, 1, 2, 3, 4].map((idx) => (
              <span
                key={idx}
                className={clsx(
                  "w-2 h-2 rounded-full",
                  idx % 3 === 0 && "bg-cyan-300",
                  idx % 3 === 1 && "bg-violet-300",
                  idx % 3 === 2 && "bg-amber-300"
                )}
              />
            ))}
            <span className="font-tech text-[10px] tracking-[0.14em] text-slate-200">SWARM</span>
          </div>

          <LanguageToggle />
          <Link
            href="/"
            className="text-[10px] px-2 py-1 rounded border border-slate-500/45 text-slate-300 hover:text-slate-100 hover:border-slate-300/65 transition-colors"
          >
            {locale === "zh-CN" ? "首页" : "HOME"}
          </Link>
        </div>
      </div>

      <ModeSelectorOverlay
        open={selectorOpen}
        currentMode={mode}
        onClose={() => setSelectorOpen(false)}
        onSelect={onModeChange}
      />
    </>
  );
}