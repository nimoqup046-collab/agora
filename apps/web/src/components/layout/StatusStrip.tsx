"use client";

import { useEffect, useState } from "react";
import { useAgoraStore } from "@/lib/store";
import { healthApi } from "@/lib/api";
import { useI18n } from "@/components/i18n/LanguageProvider";

type HealthState = "checking" | "online" | "offline";

export function StatusStrip() {
  const { memoryCount, prCount, messages, isStreaming } = useAgoraStore();
  const { t } = useI18n();
  const [apiHealth, setApiHealth] = useState<HealthState>("checking");
  const [agentCount, setAgentCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const probe = async () => {
      try {
        const result = await healthApi.check();
        if (cancelled) return;
        setApiHealth("online");
        setAgentCount(typeof result.agents === "number" ? result.agents : null);
      } catch {
        if (cancelled) return;
        setApiHealth("offline");
        setAgentCount(null);
      }
    };

    probe();
    const timer = setInterval(probe, 15000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const healthClass =
    apiHealth === "online"
      ? "text-emerald-400"
      : apiHealth === "offline"
        ? "text-rose-400"
        : "text-amber-400";

  const healthLabel =
    apiHealth === "online"
      ? t("status.online")
      : apiHealth === "offline"
        ? t("status.offline")
        : t("status.checking");

  return (
    <div className="h-8 shrink-0 module-divider border-t border-agora-border/70 flex items-center px-3 sm:px-4 gap-3 sm:gap-4">
      <span className="text-[10px] text-slate-300 font-tech">{t("status.msgs")}: {messages.length}</span>
      <span className="text-[10px] text-slate-300 font-tech">{t("status.mem")}: {memoryCount}</span>
      <span className="text-[10px] text-slate-300 font-tech">{t("status.prs")}: {prCount}</span>

      <span className={`text-[10px] font-tech ${healthClass}`}>
        {t("status.api")}: {healthLabel}
        {agentCount !== null ? ` (${agentCount})` : ""}
      </span>

      <div className="ml-auto flex items-center gap-1">
        <span className="text-[10px] text-slate-300 font-tech">
          {isStreaming ? t("status.deliberating") : t("status.ready")}
        </span>
      </div>
    </div>
  );
}
