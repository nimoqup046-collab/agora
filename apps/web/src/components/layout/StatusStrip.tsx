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
    let failureCount = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const probe = async () => {
      try {
        const result = await healthApi.check();
        if (cancelled) return;
        failureCount = 0;
        setApiHealth("online");
        setAgentCount(typeof result.agents === "number" ? result.agents : null);
        timer = setTimeout(probe, 15000);
      } catch {
        if (cancelled) return;
        failureCount += 1;
        setApiHealth(failureCount >= 3 ? "offline" : "checking");
        setAgentCount(null);
        timer = setTimeout(probe, failureCount >= 3 ? 5000 : 2500);
      }
    };

    void probe();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  const healthColor =
    apiHealth === "online"
      ? "#10b981"
      : apiHealth === "offline"
        ? "#f43f5e"
        : "#e3c27a";

  const healthLabel =
    apiHealth === "online"
      ? t("status.online")
      : apiHealth === "offline"
        ? t("status.offline")
        : t("status.checking");

  return (
    <div
      className="h-8 shrink-0 flex items-center px-3 sm:px-4 gap-4 sm:gap-5 z-10"
      style={{
        background: "rgba(3, 5, 8, 0.8)",
        borderTop: "1px solid rgba(255,255,255,0.03)",
      }}
    >
      <span className="text-[9px] text-slate-500 font-tech tracking-wider">
        {t("status.msgs")}: <span className="text-slate-400">{messages.length}</span>
      </span>
      <span className="text-[9px] text-slate-500 font-tech tracking-wider">
        {t("status.mem")}: <span className="text-slate-400">{memoryCount}</span>
      </span>
      <span className="text-[9px] text-slate-500 font-tech tracking-wider">
        {t("status.prs")}: <span className="text-slate-400">{prCount}</span>
      </span>

      <span className="text-[9px] font-tech tracking-wider flex items-center gap-1.5">
        <span className="w-1 h-1 rounded-full" style={{ background: healthColor }} />
        <span style={{ color: healthColor }}>
          {t("status.api")}: {healthLabel}
          {agentCount !== null ? ` (${agentCount})` : ""}
        </span>
      </span>

      <div className="ml-auto flex items-center gap-1.5">
        {isStreaming && (
          <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
        )}
        <span className="text-[9px] font-tech tracking-wider" style={{ color: isStreaming ? "#39d8ff" : "#4a5568" }}>
          {isStreaming ? t("status.deliberating") : t("status.ready")}
        </span>
      </div>
    </div>
  );
}
