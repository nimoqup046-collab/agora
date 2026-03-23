"use client";

import { useAgoraStore } from "@/lib/store";
import { councilApi } from "@/lib/api";
import { ActionCard } from "./ActionCard";
import { SectionHeader } from "@/components/common/SectionHeader";

interface ArenaPanelProps {
  sessionId: string;
}

export function ArenaPanel({ sessionId }: ArenaPanelProps) {
  const { currentAction, setCurrentAction } = useAgoraStore();

  const handleConfirm = async (actionResult: Record<string, unknown>) => {
    await councilApi.confirmAct(sessionId, actionResult);
    setCurrentAction(null);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <SectionHeader
        title="ARENA"
        right={
          <span className="text-[10px] text-slate-600 font-mono">
            {currentAction ? "1 PENDING" : "CLEAR"}
          </span>
        }
      />

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {!currentAction ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2 text-slate-700">
            <div className="text-2xl font-mono">[ ]</div>
            <p className="text-xs">No pending actions.</p>
            <p className="text-[10px] text-slate-700">
              Use POST /council/&#123;id&#125;/act to generate an action plan.
            </p>
          </div>
        ) : (
          <ActionCard
            action={currentAction}
            sessionId={sessionId}
            onConfirm={handleConfirm}
            onDismiss={() => setCurrentAction(null)}
          />
        )}
      </div>
    </div>
  );
}
