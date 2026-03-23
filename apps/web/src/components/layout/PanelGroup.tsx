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
      <Panel defaultSize="18%" minSize="12%" maxSize="28%" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {left}
      </Panel>

      <Separator className="w-px bg-agora-border hover:bg-agora-accent/40 transition-colors cursor-col-resize" style={{ flexShrink: 0 }} />

      <Panel defaultSize="54%" minSize="30%" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {center}
      </Panel>

      <Separator className="w-px bg-agora-border hover:bg-agora-accent/40 transition-colors cursor-col-resize" style={{ flexShrink: 0 }} />

      <Panel defaultSize="28%" minSize="16%" maxSize="40%" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {right}
      </Panel>
    </Group>
  );
}
