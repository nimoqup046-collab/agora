"use client";

import { useEffect } from "react";
import { useAgoraStore } from "@/lib/store";
import { agentsApi } from "@/lib/api";
import { SectionHeader } from "@/components/common/SectionHeader";
import { AgentStatusRow } from "@/components/agents/AgentStatusRow";

export function AgentPanel() {
  const { agents, setAgents, streamingAgents } = useAgoraStore();

  useEffect(() => {
    agentsApi.list().then(setAgents).catch(console.error);
  }, [setAgents]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <SectionHeader title="COUNCIL MEMBERS" />

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {agents.map((agent) => (
          <AgentStatusRow
            key={agent.agent_id}
            agent={agent}
            isStreaming={!!streamingAgents[agent.agent_id]}
          />
        ))}
      </div>

      <div className="px-3 py-2 border-t border-agora-border shrink-0">
        <p className="text-[9px] text-slate-700 font-mono tracking-wider">
          AGORA · COMMAND CENTER
        </p>
      </div>
    </div>
  );
}
