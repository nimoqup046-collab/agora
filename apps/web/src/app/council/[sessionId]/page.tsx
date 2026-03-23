"use client";

import { use, useEffect } from "react";
import { useAgoraStore } from "@/lib/store";
import { CouncilChat } from "@/components/CouncilChat";

interface SessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export default function SessionPage({ params }: SessionPageProps) {
  const { sessionId } = use(params);
  const { setCurrentSessionId } = useAgoraStore();

  useEffect(() => {
    setCurrentSessionId(sessionId);
  }, [sessionId, setCurrentSessionId]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <CouncilChat sessionId={sessionId} />
    </div>
  );
}
