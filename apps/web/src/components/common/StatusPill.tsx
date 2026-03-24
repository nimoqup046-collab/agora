"use client";

import { clsx } from "clsx";

type Variant = "live" | "idle" | "error" | "info";

interface StatusPillProps {
  label: string;
  variant?: Variant;
  pulse?: boolean;
}

const variantClass: Record<Variant, string> = {
  live: "text-emerald-200 border-emerald-500/55 bg-emerald-500/10",
  idle: "text-slate-300 border-slate-500/50 bg-slate-600/10",
  error: "text-rose-200 border-rose-500/60 bg-rose-500/10",
  info: "text-sky-200 border-sky-500/60 bg-sky-500/10",
};

export function StatusPill({ label, variant = "idle", pulse = false }: StatusPillProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 text-[10px] font-tech px-2 py-0.5 rounded border tracking-[0.14em]",
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
