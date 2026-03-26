"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { PanelGroup } from "@/components/layout/PanelGroup";

type MobileTab = "sessions" | "workspace" | "graph";

interface ResponsiveWorkbenchProps {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
  workspaceLabel?: string;
}

const MOBILE_TABS: Array<{ key: MobileTab; label: string }> = [
  { key: "sessions", label: "Sessions" },
  { key: "workspace", label: "Workspace" },
  { key: "graph", label: "Graph" },
];

export function ResponsiveWorkbench({
  left,
  center,
  right,
  workspaceLabel = "Workspace",
}: ResponsiveWorkbenchProps) {
  const [mobileTab, setMobileTab] = useState<MobileTab>("workspace");

  return (
    <>
      <div className="hidden lg:flex flex-1 overflow-hidden">
        <PanelGroup left={left} center={center} right={right} />
      </div>

      <div className="lg:hidden flex flex-1 flex-col overflow-hidden">
        <div className="h-10 border-b border-agora-border bg-agora-surface/80 px-2 flex items-center gap-1 shrink-0">
          {MOBILE_TABS.map((tab) => {
            const label = tab.key === "workspace" ? workspaceLabel : tab.label;
            return (
              <button
                key={tab.key}
                onClick={() => setMobileTab(tab.key)}
                className={clsx(
                  "px-3 py-1 text-[10px] rounded font-semibold tracking-wider border transition-colors",
                  mobileTab === tab.key
                    ? "text-agora-accent bg-agora-accent/10 border-agora-accent/40"
                    : "text-slate-500 border-transparent"
                )}
              >
                {label}
              </button>
            );
          })}
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