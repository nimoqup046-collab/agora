"use client";

import { useState } from "react";
import { SessionSidebar } from "@/components/SessionSidebar";
import { CommandBar } from "@/components/layout/CommandBar";
import { StatusStrip } from "@/components/layout/StatusStrip";
import { ResponsiveWorkbench } from "@/components/layout/ResponsiveWorkbench";
import { GraphPanel } from "@/components/graph/GraphPanel";
import { useI18n } from "@/components/i18n/LanguageProvider";
import type { PanelMode } from "@/types";

export default function CouncilIndexPage() {
  const [mode, setMode] = useState<PanelMode>("research");
  const { t } = useI18n();

  const centerPlaceholder = (
    <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-300 space-y-3 p-8">
      <div className="text-4xl font-tech text-cyan-300/70">[ ]</div>
      <h2 className="text-sm font-tech text-cyan-100 tracking-[0.16em] uppercase">
        {t("council.selectSession")}
      </h2>
      <p className="text-xs max-w-sm text-slate-300/80">
        {t("council.selectDesc")}
      </p>
      <p className="text-[11px] text-slate-400 max-w-xs font-wisdom">
        {t("council.selectSub")}
      </p>
    </div>
  );

  return (
    <>
      <CommandBar mode={mode} onModeChange={setMode} />
      <ResponsiveWorkbench
        left={<SessionSidebar />}
        center={centerPlaceholder}
        right={<GraphPanel sessionId={null} />}
        workspaceLabel={t(`menu.${mode}`)}
      />
      <StatusStrip />
    </>
  );
}
