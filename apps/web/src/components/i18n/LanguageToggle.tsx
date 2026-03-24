"use client";

import { clsx } from "clsx";
import { useI18n } from "@/components/i18n/LanguageProvider";

export function LanguageToggle() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="inline-flex items-center rounded-md border border-agora-border bg-agora-surface/70 p-0.5">
      <button
        onClick={() => setLocale("en")}
        className={clsx(
          "px-2 py-1 text-[10px] font-semibold tracking-wider rounded transition-colors",
          locale === "en" ? "text-cyan-200 bg-cyan-500/15" : "text-slate-400 hover:text-slate-200"
        )}
      >
        EN
      </button>
      <button
        onClick={() => setLocale("zh-CN")}
        className={clsx(
          "px-2 py-1 text-[10px] font-semibold tracking-wider rounded transition-colors",
          locale === "zh-CN" ? "text-amber-200 bg-amber-500/15" : "text-slate-400 hover:text-slate-200"
        )}
      >
        中文
      </button>
    </div>
  );
}

