"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { PanelGroup } from "@/components/layout/PanelGroup";
import { useI18n } from "@/components/i18n/LanguageProvider";

type MobileTab = "sessions" | "workspace" | "graph";

interface ResponsiveWorkbenchProps {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
  workspaceLabel?: string;
}

export function ResponsiveWorkbench({
  left,
  center,
  right,
  workspaceLabel = "Workspace",
}: ResponsiveWorkbenchProps) {
  const [mobileTab, setMobileTab] = useState<MobileTab>("workspace");
  const { t } = useI18n();

  const mobileTabs: Array<{ key: MobileTab; label: string }> = [
    { key: "sessions", label: t("command.sessions") },
    { key: "workspace", label: workspaceLabel },
    { key: "graph", label: t("command.graph") },
  ];

  return (
    <>
      <div className="hidden lg:flex flex-1 overflow-hidden">
        <PanelGroup left={left} center={center} right={right} />
      </div>

      <div className="lg:hidden flex flex-1 flex-col overflow-hidden bg-black/50 backdrop-blur-xl">
        <div className="h-11 px-2 flex items-center gap-1 border-b border-white/10 bg-zinc-950/80">
          {mobileTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setMobileTab(tab.key)}
              className={clsx(
                "px-3 py-1.5 text-[10px] rounded-lg font-semibold tracking-[0.14em] border transition-colors uppercase",
                mobileTab === tab.key
                  ? "text-cyan-100 bg-cyan-500/15 border-cyan-400/45"
                  : "text-slate-400 border-transparent"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-hidden">
          {mobileTab === "sessions" && <div className="h-full overflow-hidden">{left}</div>}
          {mobileTab === "workspace" && <div className="h-full overflow-hidden">{center}</div>}
          {mobileTab === "graph" && <div className="h-full overflow-hidden">{right}</div>}
        </div>
      </div>
    </>
  );
}
