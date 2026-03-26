"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SessionSidebar } from "@/components/SessionSidebar";
import { CommandBar } from "@/components/layout/CommandBar";
import { StatusStrip } from "@/components/layout/StatusStrip";
import { ResponsiveWorkbench } from "@/components/layout/ResponsiveWorkbench";
import { GraphPanel } from "@/components/graph/GraphPanel";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { MemoryOrb } from "@/components/layout/MemoryOrb";
import type { PanelMode } from "@/types";

function normalizeMode(rawMode: string | null): PanelMode {
  if (rawMode === "coding" || rawMode === "arena") return "coding";
  if (rawMode === "research" || rawMode === "council") return "research";
  if (rawMode === "reasoning" || rawMode === "board") return "reasoning";
  if (rawMode === "evolution") return "evolution";
  if (rawMode === "creation" || rawMode === "creative") return "creation";
  return "research";
}

function CouncilIndexContent() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  const mode = normalizeMode(searchParams.get("mode"));

  const handleModeChange = (nextMode: PanelMode) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextMode === "research") {
      params.delete("mode");
    } else {
      params.set("mode", nextMode);
    }
    const query = params.toString();
    router.replace(`/council${query ? `?${query}` : ""}`, { scroll: false });
  };

  const centerPlaceholder = useMemo(
    () => (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-[#060d1e] via-[#040816] to-[#070b18] px-8">
        <div className="w-full max-w-2xl rounded-3xl border border-cyan-300/20 bg-black/35 backdrop-blur-2xl p-8 text-center">
          <div className="text-5xl font-tech text-cyan-300/70">[ ]</div>
          <h2 className="mt-3 text-sm font-tech text-cyan-100 tracking-[0.16em] uppercase">
            {t(`menu.${mode}`)} · {t("council.selectSession")}
          </h2>
          <p className="mt-3 text-xs text-slate-300/85 max-w-lg mx-auto">{t("council.selectDesc")}</p>
          <p className="mt-2 text-[11px] text-slate-400 max-w-lg mx-auto">{t("council.selectSub")}</p>
        </div>
      </div>
    ),
    [mode, t]
  );

  return (
    <>
      <CommandBar mode={mode} onModeChange={handleModeChange} />
      <ResponsiveWorkbench
        left={<SessionSidebar />}
        center={centerPlaceholder}
        right={<GraphPanel sessionId={null} />}
        workspaceLabel={t(`menu.${mode}`)}
      />
      <StatusStrip />
      <MemoryOrb />
    </>
  );
}

export default function CouncilIndexPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen bg-[#050505] flex items-center justify-center text-cyan-200 text-sm font-mono">
          Loading AGORA Council...
        </div>
      }
    >
      <CouncilIndexContent />
    </Suspense>
  );
}
