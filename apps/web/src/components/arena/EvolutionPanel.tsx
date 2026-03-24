"use client";

import { useEffect, useState, useCallback } from "react";
import { evolutionApi, agentsApi, type Soul } from "@/lib/api";
import { SectionHeader } from "@/components/common/SectionHeader";

interface AgentSoulState {
  agent_id: string;
  agent_name: string;
  souls: Soul[];
  current_version: number;
}

export function EvolutionPanel() {
  const [agentSouls, setAgentSouls] = useState<AgentSoulState[]>([]);
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerResult, setTriggerResult] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchAllSouls = useCallback(async () => {
    try {
      const agents = await agentsApi.list();
      const states = await Promise.all(
        agents.map(async (a) => {
          try {
            const r = await evolutionApi.listSouls(a.agent_id);
            return r;
          } catch {
            return { agent_id: a.agent_id, agent_name: a.name, souls: [], current_version: 0 };
          }
        })
      );
      setAgentSouls(states);
    } catch {
      // Soul store may not be available in dev/no-db mode
    }
  }, []);

  useEffect(() => {
    fetchAllSouls();
  }, [fetchAllSouls]);

  const handleTrigger = async () => {
    setIsTriggering(true);
    setTriggerResult(null);
    try {
      const result = await evolutionApi.trigger(10);
      setTriggerResult(
        `Evolved ${result.agents_evolved} agent(s) from ${result.sessions_analyzed} sessions`
      );
      await fetchAllSouls();
    } catch (e) {
      setTriggerResult(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsTriggering(false);
    }
  };

  const handleApprove = async (soulId: string) => {
    setApprovingId(soulId);
    try {
      await evolutionApi.approveSoul(soulId);
      await fetchAllSouls();
    } finally {
      setApprovingId(null);
    }
  };

  const pendingSouls = agentSouls.flatMap((s) =>
    s.souls.filter((soul) => soul.approved_at === null).map((soul) => ({ ...soul, agent_name: s.agent_name }))
  );
  const approvedSouls = agentSouls.flatMap((s) =>
    s.souls.filter((soul) => soul.approved_at !== null).map((soul) => ({ ...soul, agent_name: s.agent_name }))
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <SectionHeader
        title="EVOLUTION"
        right={
          <button
            onClick={handleTrigger}
            disabled={isTriggering}
            className="text-[10px] font-semibold tracking-widest px-2 py-0.5 rounded border border-agora-accent/40 text-agora-accent hover:bg-agora-accent/10 disabled:opacity-40 transition-colors font-mono"
          >
            {isTriggering ? "ANALYZING..." : "TRIGGER ▶"}
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {triggerResult && (
          <div className="text-[10px] font-mono text-slate-400 bg-agora-surface border border-agora-border rounded px-3 py-2">
            {triggerResult}
          </div>
        )}

        {pendingSouls.length === 0 && approvedSouls.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-center space-y-2 text-slate-700">
            <div className="text-2xl font-mono">∅</div>
            <p className="text-xs">No SOULs yet.</p>
            <p className="text-[10px] text-slate-700">
              Click TRIGGER to analyze recent sessions and generate evolution drafts.
            </p>
          </div>
        )}

        {pendingSouls.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] text-slate-600 tracking-widest font-semibold uppercase px-1">
              Pending Approval
            </p>
            {pendingSouls.map((soul) => (
              <SoulCard
                key={soul.id}
                soul={soul}
                status="pending"
                onApprove={() => handleApprove(soul.id)}
                isApproving={approvingId === soul.id}
              />
            ))}
          </div>
        )}

        {approvedSouls.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] text-slate-600 tracking-widest font-semibold uppercase px-1">
              Active SOULs
            </p>
            {approvedSouls.slice(0, 6).map((soul) => (
              <SoulCard key={soul.id} soul={soul} status="active" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface SoulCardProps {
  soul: Soul & { agent_name: string };
  status: "pending" | "active";
  onApprove?: () => void;
  isApproving?: boolean;
}

function SoulCard({ soul, status, onApprove, isApproving }: SoulCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-agora-border rounded bg-agora-surface p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-mono text-slate-300 truncate">
            {soul.agent_id}
          </span>
          <span className="text-[10px] font-mono text-slate-600">v{soul.version}</span>
          <span
            className={`text-[9px] font-semibold tracking-widest px-1.5 py-0.5 rounded border ${
              status === "pending"
                ? "text-amber-400 border-amber-400/30 bg-amber-400/10"
                : "text-emerald-400 border-emerald-400/30 bg-emerald-400/10"
            }`}
          >
            {status === "pending" ? "PENDING" : "ACTIVE"}
          </span>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-[10px] text-slate-600 hover:text-slate-400 font-mono shrink-0"
        >
          {expanded ? "▲" : "▼"}
        </button>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed">
        {soul.delta_summary}
      </p>

      {expanded && (
        <pre className="text-[10px] text-slate-500 font-mono whitespace-pre-wrap break-words bg-black/20 rounded p-2 max-h-40 overflow-y-auto">
          {soul.soul_content}
        </pre>
      )}

      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-slate-700 font-mono">
          {soul.approved_at
            ? `Approved ${new Date(soul.approved_at).toLocaleDateString()}`
            : `Draft ${new Date(soul.created_at).toLocaleDateString()}`}
        </span>
        {status === "pending" && onApprove && (
          <button
            onClick={onApprove}
            disabled={isApproving}
            className="text-[10px] font-semibold tracking-widest px-2 py-0.5 rounded border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-40 transition-colors"
          >
            {isApproving ? "ACTIVATING..." : "APPROVE"}
          </button>
        )}
      </div>
    </div>
  );
}
