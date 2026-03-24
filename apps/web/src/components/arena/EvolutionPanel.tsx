"use client";

import { useEffect, useState, useCallback } from "react";
import { evolutionApi, agentsApi, skillsApi, type Soul, type Skill } from "@/lib/api";
import { SectionHeader } from "@/components/common/SectionHeader";

interface AgentSoulState {
  agent_id: string;
  agent_name: string;
  souls: Soul[];
  current_version: number;
}

export function EvolutionPanel() {
  const [tab, setTab] = useState<"souls" | "skills">("souls");
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
          tab === "souls" ? (
            <button
              onClick={handleTrigger}
              disabled={isTriggering}
              className="text-[10px] font-semibold tracking-widest px-2 py-0.5 rounded border border-agora-accent/40 text-agora-accent hover:bg-agora-accent/10 disabled:opacity-40 transition-colors font-mono"
            >
              {isTriggering ? "ANALYZING..." : "TRIGGER ▶"}
            </button>
          ) : null
        }
      />

      {/* Tab switcher */}
      <div className="flex border-b border-agora-border">
        {(["souls", "skills"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 text-[10px] font-semibold tracking-widest uppercase py-1.5 transition-colors font-mono ${
              tab === t
                ? "text-agora-accent border-b border-agora-accent"
                : "text-slate-600 hover:text-slate-400"
            }`}
          >
            {t === "souls" ? "SOULs" : "Skill Library"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {tab === "skills" && <SkillLibraryPanel />}
        {tab === "souls" && (<>
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
        </>)}
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

// ── Skill Library Panel ────────────────────────────────────────────────────────

function SkillLibraryPanel() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [filterDomain, setFilterDomain] = useState<string>("");

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    try {
      const r = await skillsApi.list({ domain: filterDomain || undefined });
      setSkills(r.skills);
    } catch {
      // Skill store may not be available
    } finally {
      setLoading(false);
    }
  }, [filterDomain]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const handleApprove = async (skillId: string) => {
    setApprovingId(skillId);
    try {
      await skillsApi.approve(skillId);
      await fetchSkills();
    } finally {
      setApprovingId(null);
    }
  };

  const domains = Array.from(new Set(skills.map((s) => s.domain))).sort();
  const pending = skills.filter((s) => !s.approved_at);
  const approved = skills.filter((s) => s.approved_at);

  return (
    <div className="space-y-3">
      {/* Domain filter */}
      {domains.length > 1 && (
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setFilterDomain("")}
            className={`text-[9px] px-1.5 py-0.5 rounded border font-mono tracking-widest ${
              !filterDomain
                ? "border-agora-accent text-agora-accent"
                : "border-agora-border text-slate-600 hover:text-slate-400"
            }`}
          >
            ALL
          </button>
          {domains.map((d) => (
            <button
              key={d}
              onClick={() => setFilterDomain(d === filterDomain ? "" : d)}
              className={`text-[9px] px-1.5 py-0.5 rounded border font-mono tracking-widest uppercase ${
                d === filterDomain
                  ? "border-agora-accent text-agora-accent"
                  : "border-agora-border text-slate-600 hover:text-slate-400"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="text-[10px] font-mono text-slate-600 text-center py-6">Loading…</div>
      )}

      {!loading && skills.length === 0 && (
        <div className="flex flex-col items-center justify-center h-32 text-center space-y-2 text-slate-700">
          <div className="text-2xl font-mono">∅</div>
          <p className="text-xs">No skills yet.</p>
          <p className="text-[10px]">Use POST /skills/ to create the first skill.</p>
        </div>
      )}

      {pending.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] text-slate-600 tracking-widest font-semibold uppercase px-1">
            Pending Approval
          </p>
          {pending.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              status="pending"
              onApprove={() => handleApprove(skill.id)}
              isApproving={approvingId === skill.id}
            />
          ))}
        </div>
      )}

      {approved.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] text-slate-600 tracking-widest font-semibold uppercase px-1">
            Active Skills
          </p>
          {approved.map((skill) => (
            <SkillCard key={skill.id} skill={skill} status="active" />
          ))}
        </div>
      )}
    </div>
  );
}

interface SkillCardProps {
  skill: Skill;
  status: "pending" | "active";
  onApprove?: () => void;
  isApproving?: boolean;
}

function SkillCard({ skill, status, onApprove, isApproving }: SkillCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-agora-border rounded bg-agora-surface p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className="text-[10px] font-mono text-slate-300 truncate">{skill.name}</span>
          <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest bg-agora-border/40 px-1 rounded">
            {skill.domain}
          </span>
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

      <p className="text-[11px] text-slate-400 leading-relaxed">{skill.description}</p>

      {status === "active" && (
        <div className="flex gap-3 text-[10px] font-mono text-slate-600">
          <span>Used: {skill.usage_count}×</span>
          <span>Success: {Math.round(skill.success_rate * 100)}%</span>
          <span>v{skill.version}</span>
        </div>
      )}

      {expanded && (
        <pre className="text-[10px] text-slate-500 font-mono whitespace-pre-wrap break-words bg-black/20 rounded p-2 max-h-40 overflow-y-auto">
          {skill.template}
        </pre>
      )}

      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-slate-700 font-mono">
          {skill.approved_at
            ? `Approved ${new Date(skill.approved_at).toLocaleDateString()}`
            : `Draft ${new Date(skill.created_at).toLocaleDateString()}`}
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

// ── Soul Card ──────────────────────────────────────────────────────────────────

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
