"use client";

import { SectionHeader } from "@/components/common/SectionHeader";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { KnowledgeGraph } from "./KnowledgeGraph";
import { VotePanel } from "@/components/vote/VotePanel";

interface GraphPanelProps {
  sessionId: string | null;
}

export function GraphPanel({ sessionId }: GraphPanelProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <SectionHeader title={t("graph.title")} />

      <KnowledgeGraph />

      {sessionId && (
        <div className="border-t border-agora-border/70 shrink-0 overflow-y-auto max-h-48 module-divider">
          <VotePanel sessionId={sessionId} />
        </div>
      )}
    </div>
  );
}
