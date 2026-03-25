"use client";

import { Group, Panel, Separator } from "react-resizable-panels";
import { useI18n } from "@/components/i18n/LanguageProvider";

interface PanelGroupProps {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
}

export function PanelGroup({ left, center, right }: PanelGroupProps) {
  const { t } = useI18n();

  return (
    <Group orientation="horizontal" className="flex-1 overflow-hidden" style={{ display: "flex", height: "100%" }}>
      <Panel
        defaultSize="20"
        minSize="12"
        maxSize="30"
        style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        <div className="h-full rounded-none lg:rounded-l-lg agora-panel border-r border-agora-border/70 overflow-hidden relative">
          <span className="absolute top-1.5 left-2.5 z-10 panel-section-tag">{t("command.sessions")}</span>
          {left}
        </div>
      </Panel>

      <Separator className="panel-resize-sep" style={{ flexShrink: 0 }} />

      <Panel defaultSize="52" minSize="30" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div className="relative h-full agora-panel agora-panel-highlight overflow-hidden">
          <span className="absolute top-1.5 left-2.5 z-10 panel-section-tag">{t("command.workspace")}</span>
          {center}
        </div>
      </Panel>

      <Separator className="panel-resize-sep" style={{ flexShrink: 0 }} />

      <Panel
        defaultSize="28"
        minSize="16"
        maxSize="40"
        style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        <div className="h-full rounded-none lg:rounded-r-lg agora-panel border-l border-agora-border/70 overflow-hidden relative">
          <span className="absolute top-1.5 left-2.5 z-10 panel-section-tag">{t("command.graph")}</span>
          {right}
        </div>
      </Panel>
    </Group>
  );
}
