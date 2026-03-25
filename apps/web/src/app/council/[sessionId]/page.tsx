"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { sessionsApi } from "@/lib/api";
import { useAgoraStore } from "@/lib/store";
import { SessionSidebar } from "@/components/SessionSidebar";
import { GraphPanel } from "@/components/graph/GraphPanel";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { CommandBar } from "@/components/layout/CommandBar";
import { MemoryOrb } from "@/components/layout/MemoryOrb";
import { ResponsiveWorkbench } from "@/components/layout/ResponsiveWorkbench";
import { StatusStrip } from "@/components/layout/StatusStrip";
import { CreativeMode } from "@/components/modes/CreativeMode";
import { EvolutionMode } from "@/components/modes/EvolutionMode";
import { ProgrammingMode } from "@/components/modes/ProgrammingMode";
import { ReasoningMode } from "@/components/modes/ReasoningMode";
import { ResearchMode } from "@/components/modes/ResearchMode";
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
  const mode = normalizeMode(searchParams.get("mode"));
  const [sessionTitle, setSessionTitle] = useState<string | undefined>();

  useEffect(() => {
    setCurrentSessionId(sessionId);
  }, [sessionId, setCurrentSessionId]);

  useEffect(() => {
    const cached = sessions.find((session) => session.id === sessionId);
    if (cached) {
      setSessionTitle(cached.title);
      return;
    }

    sessionsApi
      .get(sessionId)
      .then((session) => setSessionTitle(session.title))
      .catch(console.error);
  }, [sessionId, sessions]);

  const handleModeChange = (nextMode: PanelMode) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextMode === "research") {
      params.delete("mode");
    } else {
      params.set("mode", nextMode);
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