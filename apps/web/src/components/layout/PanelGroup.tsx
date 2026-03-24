"use client";

import {
  Group,
  Panel,
  Separator,
} from "react-resizable-panels";

interface PanelGroupProps {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
}

export function PanelGroup({ left, center, right }: PanelGroupProps) {
  return (
    <Group orientation="horizontal" className="flex-1 overflow-hidden" style={{ display: "flex", height: "100%" }}>
      <Panel defaultSize="20" minSize="12" maxSize="30" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div className="h-full rounded-none lg:rounded-l-lg agora-panel border-r border-agora-border/70 overflow-hidden">
          {left}
        </div>
      </Panel>

      <Separator
        className="w-1 bg-gradient-to-b from-cyan-400/25 via-violet-400/20 to-amber-300/20 hover:from-cyan-300/45 hover:to-amber-200/40 transition-colors cursor-col-resize"
        style={{ flexShrink: 0 }}
      />

      <Panel defaultSize="52" minSize="30" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div className="relative h-full agora-panel agora-panel-highlight overflow-hidden">
          {center}
        </div>
      </Panel>

      <Separator
        className="w-1 bg-gradient-to-b from-cyan-400/25 via-violet-400/20 to-amber-300/20 hover:from-cyan-300/45 hover:to-amber-200/40 transition-colors cursor-col-resize"
        style={{ flexShrink: 0 }}
      />

      <Panel defaultSize="28" minSize="16" maxSize="40" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div className="h-full rounded-none lg:rounded-r-lg agora-panel border-l border-agora-border/70 overflow-hidden">
          {right}
        </div>
      </Panel>
    </Group>
  );
}
