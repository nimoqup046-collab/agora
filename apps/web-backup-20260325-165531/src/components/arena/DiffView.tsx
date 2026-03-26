"use client";

import { clsx } from "clsx";

interface DiffLine {
  type: "add" | "remove" | "context";
  content: string;
  lineNo?: number;
}

interface DiffViewProps {
  diff: string;
  filename?: string;
}

function parseDiff(diff: string): DiffLine[] {
  return diff.split("\n").map((line) => {
    if (line.startsWith("+") && !line.startsWith("+++")) {
      return { type: "add" as const, content: line.slice(1) };
    } else if (line.startsWith("-") && !line.startsWith("---")) {
      return { type: "remove" as const, content: line.slice(1) };
    }
    return { type: "context" as const, content: line };
  });
}

export function DiffView({ diff, filename }: DiffViewProps) {
  const lines = parseDiff(diff);

  return (
    <div className="rounded border border-agora-border overflow-hidden">
      {filename && (
        <div className="px-3 py-1.5 bg-agora-surface border-b border-agora-border">
          <span className="text-[10px] text-slate-500 font-mono">{filename}</span>
        </div>
      )}
      <div className="overflow-x-auto text-xs font-mono bg-agora-bg/80">
        {lines.map((line, i) => (
          <div
            key={i}
            className={clsx(
              "px-3 py-0.5 whitespace-pre leading-5",
              line.type === "add" && "bg-emerald-950/60 text-emerald-300",
              line.type === "remove" && "bg-rose-950/60 text-rose-300",
              line.type === "context" && "text-slate-500"
            )}
          >
            <span className="select-none mr-3 text-slate-700 w-4 inline-block">
              {line.type === "add" ? "+" : line.type === "remove" ? "-" : " "}
            </span>
            {line.content}
          </div>
        ))}
      </div>
    </div>
  );
}
