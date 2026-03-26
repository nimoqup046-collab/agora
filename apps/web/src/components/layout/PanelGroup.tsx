"use client";

import { Group, Panel, Separator } from "react-resizable-panels";
import { useI18n } from "@/components/i18n/LanguageProvider";

interface PanelGroupProps {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
}

function ResizeHandle({ tone = "cyan" }: { tone?: "cyan" | "violet" }) {
  return (
    <Separator className="group relative w-[3px] bg-white/10 hover:bg-white/20 transition-colors cursor-col-resize">
      <span
        className={`absolute inset-y-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity ${
          tone === "cyan"
            ? "bg-gradient-to-b from-cyan-400/40 via-cyan-300/20 to-violet-400/30"
            : "bg-gradient-to-b from-violet-400/40 via-violet-300/20 to-cyan-400/30"
        }`}
      />
    </Separator>
  );
}

export function PanelGroup({ left, center, right }: PanelGroupProps) {
  const { t } = useI18n();

  return (
    <Group orientation="horizontal" className="flex-1 h-full overflow-hidden" style={{ display: "flex", height: "100%" }}>
      <Panel defaultSize={20} minSize={14} maxSize={30}>
        <div className="h-full border-r border-white/10 bg-zinc-950/70 backdrop-blur-2xl overflow-hidden">
          <div className="h-8 px-3 flex items-center border-b border-white/10 font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-200/90">
            {t("command.sessions")}
          </div>
          <div className="h-[calc(100%-2rem)] overflow-hidden">{left}</div>
        </div>
      </Panel>

      <ResizeHandle tone="cyan" />

      <Panel defaultSize={56} minSize={35}>
        <div className="h-full border-x border-white/5 bg-black/40 backdrop-blur-xl overflow-hidden">
          <div className="h-8 px-3 flex items-center border-b border-white/10 font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-100/90">
            {t("command.workspace")}
          </div>
          <div className="h-[calc(100%-2rem)] overflow-hidden">{center}</div>
        </div>
      </Panel>

      <ResizeHandle tone="violet" />

      <Panel defaultSize={24} minSize={14} maxSize={36}>
        <div className="h-full border-l border-white/10 bg-zinc-950/70 backdrop-blur-2xl overflow-hidden">
          <div className="h-8 px-3 flex items-center border-b border-white/10 font-mono text-[10px] uppercase tracking-[0.16em] text-violet-200/90">
            {t("command.graph")}
          </div>
          <div className="h-[calc(100%-2rem)] overflow-hidden">{right}</div>
        </div>
      </Panel>
    </Group>
  );
}
