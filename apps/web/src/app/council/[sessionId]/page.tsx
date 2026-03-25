"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useAgoraStore } from "@/lib/store";
import { sessionsApi } from "@/lib/api";

import { CommandBar } from "@/components/layout/CommandBar";
import { ResponsiveWorkbench } from "@/components/layout/ResponsiveWorkbench";
import { StatusStrip } from "@/components/layout/StatusStrip";
import { SessionSidebar } from "@/components/SessionSidebar";
import { GraphPanel } from "@/components/graph/GraphPanel";
import { MemoryOrb } from "@/components/MemoryOrb";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { MemoryOrb } from "@/components/layout/MemoryOrb";
import { ProgrammingMode } from "@/components/modes/ProgrammingMode";
import { ResearchMode } from "@/components/modes/ResearchMode";
import { ReasoningMode } from "@/components/modes/ReasoningMode";
import { EvolutionMode } from "@/components/modes/EvolutionMode";
import { CreativeMode } from "@/components/modes/CreativeMode";

import type { PanelMode } from "@/types";

interface SessionPageProps {
  params: Promise<{ sessionId: string }>;
}

function normalizeMode(rawMode: string | null): PanelMode {
  if (rawMode === "coding" || rawMode === "arena") return "coding";
  if (rawMode === "research" || rawMode === "council") return "research";
  if (rawMode === "reasoning" || rawMode === "board") return "reasoning";
  if (rawMode === "evolution") return "evolution";
  if (rawMode === "creation" || rawMode === "creative") return "creation";
  return "research";
}

export default function SessionPage({ params }: SessionPageProps) {
  const { sessionId } = use(params);
  const { setCurrentSessionId, sessions } = useAgoraStore();
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawMode = searchParams.get("mode");
  const mode: PanelMode = VALID_MODES.includes(rawMode as PanelMode)
    ? (rawMode as PanelMode)
    : "research";

  const mode = normalizeMode(searchParams.get("mode"));
  const [sessionTitle, setSessionTitle] = useState<string | undefined>();

  useEffect(() => {
    setCurrentSessionId(sessionId);
  }, [sessionId, setCurrentSessionId]);

  useEffect(() => {
    const cached = sessions.find((s) => s.id === sessionId);
    if (cached) {
      setSessionTitle(cached.title);
      return;
    }

    sessionsApi
      .get(sessionId)
      .then((s) => setSessionTitle(s.title))
      .catch(console.error);
  }, [sessionId, sessions]);

  const handleModeChange = (newMode: PanelMode) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newMode === "research") {
      params.delete("mode");
    } else {
      params.set("mode", newMode);
    }

    const query = params.toString();
    router.replace(`/council/${sessionId}${query ? `?${query}` : ""}`, { scroll: false });
  };

  const centerPanel = (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={mode}
        className="relative flex-1 flex flex-col overflow-hidden"
        initial={{ opacity: 0, scale: 0.98, filter: "blur(6px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 1.02, filter: "blur(6px)" }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <span className="mode-warp" />
        <motion.span
          className="mode-jump-flash"
          initial={{ opacity: 0.65, scale: 1 }}
          animate={{ opacity: 0, scale: 1.15 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        />
        {mode === "coding" && <ProgrammingMode sessionId={sessionId} />}
        {mode === "research" && <ResearchMode sessionId={sessionId} />}
        {mode === "reasoning" && <ReasoningMode sessionId={sessionId} />}
        {mode === "evolution" && <EvolutionMode />}
        {mode === "creation" && <CreativeMode sessionId={sessionId} />}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <>
      <CommandBar sessionTitle={sessionTitle} mode={mode} onModeChange={handleModeChange} />
      <ResponsiveWorkbench
        left={<SessionSidebar />}
        center={centerPanel}
        right={<GraphPanel sessionId={sessionId} />}
        workspaceLabel={t(`menu.${mode}`)}
      />
      <StatusStrip />
      <MemoryOrb />
    </>
  );
}
