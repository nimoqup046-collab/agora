"use client";

import { clsx } from "clsx";

type Variant = "live" | "idle" | "error" | "info";

interface StatusPillProps {
  label: string;
  variant?: Variant;
  pulse?: boolean;
}

const variantClass: Record<Variant, string> = {
  live: "text-emerald-400 border-emerald-800/60 bg-emerald-950/40",
  idle: "text-slate-500 border-slate-700/60 bg-slate-900/40",
  error: "text-rose-400 border-rose-800/60 bg-rose-950/40",
  info: "text-sky-400 border-sky-800/60 bg-sky-950/40",
};

export function StatusPill({ label, variant = "idle", pulse = false }: StatusPillProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border",
        variantClass[variant]
      )}
    >
      <span
        className={clsx(
          "w-1.5 h-1.5 rounded-full",
          variant === "live" ? "bg-emerald-400" : variant === "error" ? "bg-rose-400" : "bg-slate-500",
          pulse && "animate-pulse"
        )}
      />
      {label}
    </span>
  );
}
