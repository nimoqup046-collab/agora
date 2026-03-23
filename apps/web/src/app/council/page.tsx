"use client";

import { SessionSidebar } from "@/components/SessionSidebar";
import { CommandBar } from "@/components/layout/CommandBar";
import { StatusStrip } from "@/components/layout/StatusStrip";
import { PanelGroup } from "@/components/layout/PanelGroup";
import { GraphPanel } from "@/components/graph/GraphPanel";
import { useState } from "react";
import type { PanelMode } from "@/types";

export default function CouncilIndexPage() {
  const [mode, setMode] = useState<PanelMode>("council");

  const centerPlaceholder = (
    <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-600 space-y-3 p-8">
      <div className="text-4xl font-mono text-slate-700">[ ]</div>
      <h2 className="text-sm font-semibold text-slate-400 tracking-wider uppercase">
        Select a Session
      </h2>
      <p className="text-xs max-w-sm text-slate-600">
        Choose an existing council session from the left panel, or create a new one with{" "}
        <span className="text-agora-accent font-bold">+</span>.
      </p>
      <p className="text-[10px] text-slate-700 max-w-xs">
        Each session is a collaborative thread where Claude, Codex, and Meta-Agent
        work together in real-time.
      </p>
    </div>
  );

  return (
    <>
      <CommandBar mode={mode} onModeChange={setMode} />
      <div className="flex-1 overflow-hidden flex">
        <PanelGroup
          left={<SessionSidebar />}
          center={centerPlaceholder}
          right={<GraphPanel sessionId={null} />}
        />
      </div>
      <StatusStrip />
    </>
  );
}
