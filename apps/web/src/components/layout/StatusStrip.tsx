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

  const healthGlow =
    apiHealth === "online"
      ? "rgba(16,185,129,0.8)"
      : apiHealth === "offline"
        ? "rgba(244,63,94,0.8)"
        : "rgba(227,194,122,0.8)";

  const healthLabel =
    apiHealth === "online"
      ? t("status.online")
      : apiHealth === "offline"
        ? t("status.offline")
        : t("status.checking");

  return (
    <div className="h-8 shrink-0 flex items-center px-3 sm:px-4 gap-4 sm:gap-5 z-10 bg-black/40 backdrop-blur-xl border-t border-white/5">
      <span className="font-mono text-[9px] tracking-wider text-white/30">
        {t("status.msgs")}:{" "}
        <span className="text-white/50">{messages.length}</span>
      </span>

      <span className="font-mono text-[9px] tracking-wider text-white/30">
        {t("status.mem")}:{" "}
        <span className="text-white/50">{memoryCount}</span>
      </span>

      <span className="font-mono text-[9px] tracking-wider text-white/30">
        {t("status.prs")}:{" "}
        <span className="text-white/50">{prCount}</span>
      </span>

      <span className="font-mono text-[9px] tracking-wider flex items-center gap-1.5">
        {/* Health dot with glow */}
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: healthColor,
            boxShadow: `0 0 6px ${healthGlow}`,
          }}
        />
        <span style={{ color: healthColor }}>
          {t("status.api")}: {healthLabel}
          {agentCount !== null ? ` (${agentCount})` : ""}
        </span>
      </span>

      <div className="ml-auto flex items-center gap-1.5">
        {isStreaming && (
          <span
            className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"
            style={{ boxShadow: "0 0 6px rgba(34,211,238,0.8)" }}
          />
        )}
        <span
          className="font-mono text-[9px] tracking-wider"
          style={{ color: isStreaming ? "#22d3ee" : "rgba(255,255,255,0.2)" }}
        >
          {isStreaming ? t("status.deliberating") : t("status.ready")}
        </span>
      </div>
    </div>
  );
}
