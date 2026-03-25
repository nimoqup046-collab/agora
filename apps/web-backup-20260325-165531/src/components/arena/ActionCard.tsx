"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { CodeBlock } from "./CodeBlock";
import { DiffView } from "./DiffView";
import type { ActionResult } from "@/types";

interface ActionCardProps {
  action: ActionResult;
  sessionId: string;
  onConfirm?: (result: Record<string, unknown>) => Promise<void>;
  onDismiss?: () => void;
}

const ACTION_LABELS: Record<string, string> = {
  github_pr: "GITHUB PR",
  code_artifact: "CODE ARTIFACT",
  file_write: "FILE WRITE",
  search: "SEARCH",
  delegate: "DELEGATE",
  noop: "NO-OP",
};

export function ActionCard({ action, sessionId, onConfirm, onDismiss }: ActionCardProps) {
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const label = ACTION_LABELS[action.action_type] || action.action_type.toUpperCase();
  const needsApproval = action.requires_approval;

  const handleConfirm = async () => {
    if (!onConfirm) return;
    setConfirming(true);
    setError(null);
    try {
      await onConfirm(action as unknown as Record<string, unknown>);
      setConfirmed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Confirmation failed");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className={clsx(
      "rounded border space-y-3 p-3",
      confirmed ? "border-emerald-700/40 bg-emerald-950/20" : "border-agora-accent/40 bg-agora-surface/60"
    )}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold tracking-widest text-agora-accent font-mono">
          {label}
        </span>
        {needsApproval && !confirmed && (
          <span className="text-[9px] text-amber-400 border border-amber-700/40 px-1.5 py-0.5 rounded">
            REQUIRES APPROVAL
          </span>
        )}
        {confirmed && (
          <span className="text-[9px] text-emerald-400 border border-emerald-700/40 px-1.5 py-0.5 rounded">
            EXECUTED
          </span>
        )}
        <span className="text-[10px] text-slate-600 font-mono ml-auto">
          {action.agent_id}
        </span>
      </div>

      {/* Rationale */}
      {action.rationale && (
        <p className="text-xs text-slate-400 italic">{action.rationale}</p>
      )}

      {/* PR details */}
      {action.action_type === "github_pr" && action.output.pr_title && (
        <div className="space-y-1">
          <p className="text-xs text-slate-300 font-semibold">{action.output.pr_title as string}</p>
          {action.output.pr_body && (
            <p className="text-xs text-slate-500 whitespace-pre-wrap">{action.output.pr_body as string}</p>
          )}
          {action.output.branch && (
            <p className="text-[10px] text-slate-600 font-mono">branch: {action.output.branch as string}</p>
          )}
        </div>
      )}

      {/* Code artifact */}
      {(action.action_type === "code_artifact" || action.action_type === "file_write") &&
        action.output.code && (
          <CodeBlock
            code={action.output.code as string}
            language={(action.output.language as string) || "typescript"}
            filename={action.output.filename as string | undefined}
          />
        )}

      {/* Diff */}
      {action.output.diff && (
        <DiffView diff={action.output.diff as string} filename={action.output.filename as string | undefined} />
      )}

      {/* Files list */}
      {Array.isArray(action.output.files) && action.output.files.length > 0 && (
        <div className="space-y-1">
          {(action.output.files as Array<{ path: string; content: string }>).map((f) => (
            <CodeBlock key={f.path} code={f.content} filename={f.path} />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-rose-400 border border-rose-700/30 rounded px-2 py-1">
          {error}
        </p>
      )}

      {/* Actions */}
      {!confirmed && needsApproval && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="flex-1 py-1.5 rounded bg-agora-accent text-white text-xs hover:bg-agora-accent/90 transition-colors disabled:opacity-50"
          >
            {confirming ? "Executing..." : "Approve & Execute"}
          </button>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="px-3 py-1.5 rounded border border-agora-border text-xs text-slate-400 hover:text-slate-300 transition-colors"
            >
              Dismiss
            </button>
          )}
        </div>
      )}
    </div>
  );
}
