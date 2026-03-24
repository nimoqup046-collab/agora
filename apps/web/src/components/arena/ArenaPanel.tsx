"use client";

import { useAgoraStore } from "@/lib/store";
import { councilApi } from "@/lib/api";
import { ActionCard } from "./ActionCard";
import { SectionHeader } from "@/components/common/SectionHeader";
import { useI18n } from "@/components/i18n/LanguageProvider";

interface ArenaPanelProps {
  sessionId: string;
}

export function ArenaPanel({ sessionId }: ArenaPanelProps) {
  const { t } = useI18n();
  const { currentAction, setCurrentAction } = useAgoraStore();

  const handleConfirm = async (actionResult: Record<string, unknown>) => {
    await councilApi.confirmAct(sessionId, actionResult);
    setCurrentAction(null);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <SectionHeader
        title={t("arena.title")}
        right={
          <span className="text-[10px] text-slate-300 font-tech tracking-[0.14em]">
            {currentAction ? t("arena.pendingOne") : t("arena.clear")}
          </span>
        }
      />

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {!currentAction ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2 text-slate-400">
            <div className="text-2xl font-tech text-cyan-300/70">[ ]</div>
            <p className="text-xs">{t("arena.empty")}</p>
            <p className="text-[11px] text-slate-400 font-wisdom">
              {t("arena.tip")}
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
