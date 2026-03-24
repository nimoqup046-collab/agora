"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { councilApi } from "@/lib/api";
import { SectionHeader } from "@/components/common/SectionHeader";
import { useI18n } from "@/components/i18n/LanguageProvider";
import type { VoteResult } from "@/types";

interface VotePanelProps {
  sessionId: string;
}

export function VotePanel({ sessionId }: VotePanelProps) {
  const { t } = useI18n();
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<VoteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVote = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await councilApi.vote(sessionId, {
        topic: topic.trim(),
        agent_votes: {
          "claude-architect": "yea",
          "codex-implementer": "yea",
          "meta-conductor": "yea",
        },
      });
      setResult(res as VoteResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("vote.failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col overflow-hidden">
      <SectionHeader title={t("vote.title")} />

      <div className="p-3 space-y-2">
        <div className="flex gap-1.5">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t("vote.topic")}
            className="flex-1 bg-[#090f1f] border border-agora-border rounded px-2 py-1 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-cyan-300/60"
          />
          <button
            onClick={handleVote}
            disabled={!topic.trim() || loading}
            className="px-2 py-1 rounded border border-cyan-300/50 text-[10px] text-cyan-100 hover:bg-cyan-500/15 transition-colors disabled:opacity-50 font-tech"
          >
            {loading ? "..." : t("vote.vote")}
          </button>
        </div>

        {error && (
          <p className="text-[10px] text-rose-400">{error}</p>
        )}

        {result && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  "text-[10px] font-semibold tracking-widest font-mono",
                  result.decision === "approved" ? "text-emerald-400" : "text-rose-400"
                )}
              >
                {result.decision.toUpperCase()}
              </span>
              <div className="flex gap-1 ml-auto">
                <span className="text-[9px] text-emerald-400 font-mono">YEA:{result.yea}</span>
                <span className="text-[9px] text-rose-400 font-mono">NAY:{result.nay}</span>
                <span className="text-[9px] text-slate-500 font-mono">ABS:{result.abstain}</span>
              </div>
            </div>

            <div className="space-y-1">
              {result.votes.map((v) => (
                <div key={v.agent_id} className="flex items-start gap-2 text-[10px]">
                  <span className="text-slate-500 font-mono w-28 shrink-0">{v.agent_id}</span>
                  <span
                    className={clsx(
                      "font-mono",
                      v.option === "yea"
                        ? "text-emerald-400"
                        : v.option === "nay"
                          ? "text-rose-400"
                          : "text-slate-500"
                    )}
                  >
                    {v.option.toUpperCase()}
                  </span>
                  {v.rationale && (
                    <span className="text-slate-600 text-[9px] truncate">{v.rationale}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
