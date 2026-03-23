"use client";

import { SectionHeader } from "@/components/common/SectionHeader";
import { KnowledgeGraph } from "./KnowledgeGraph";
import { VotePanel } from "@/components/vote/VotePanel";

interface GraphPanelProps {
  sessionId: string | null;
}

export function GraphPanel({ sessionId }: GraphPanelProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <SectionHeader title="KNOWLEDGE GRAPH" />

      <KnowledgeGraph />

      {sessionId && (
        <div className="border-t border-agora-border shrink-0 overflow-y-auto max-h-48">
          <VotePanel sessionId={sessionId} />
        </div>
      )}
    </div>
  );
}
