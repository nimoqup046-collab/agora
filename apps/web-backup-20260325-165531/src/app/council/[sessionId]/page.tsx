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
import { CouncilChat } from "@/components/CouncilChat";
import { ArenaPanel } from "@/components/arena/ArenaPanel";
import { TaskBoard } from "@/components/board/TaskBoard";
import { GraphPanel } from "@/components/graph/GraphPanel";

import type { PanelMode } from "@/types";

interface SessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export default function SessionPage({ params }: SessionPageProps) {
  const { sessionId } = use(params);
  const { setCurrentSessionId, sessions } = useAgoraStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawMode = searchParams.get("mode");
  const mode: PanelMode =
    rawMode === "arena" || rawMode === "board" ? rawMode : "council";

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
    if (newMode === "council") {
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
        className="flex-1 flex flex-col overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        {mode === "council" && <CouncilChat sessionId={sessionId} />}
        {mode === "arena" && <ArenaPanel sessionId={sessionId} />}
        {mode === "board" && <TaskBoard sessionId={sessionId} />}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <>
      <CommandBar
        sessionTitle={sessionTitle}
        mode={mode}
        onModeChange={handleModeChange}
      />
      <ResponsiveWorkbench
        left={<SessionSidebar />}
        center={centerPanel}
        right={<GraphPanel sessionId={sessionId} />}
        workspaceLabel={mode.toUpperCase()}
      />
      <StatusStrip />
    </>
  );
}