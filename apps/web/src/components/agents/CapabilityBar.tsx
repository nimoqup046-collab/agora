"use client";

interface CapabilityBarProps {
  capabilities: string[];
}

export function CapabilityBar({ capabilities }: CapabilityBarProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {capabilities.map((cap) => (
        <span
          key={cap}
          className="text-[9px] text-slate-600 bg-agora-border/40 px-1.5 py-0.5 rounded font-mono"
        >
          {cap.replace(/_/g, " ")}
        </span>
      ))}
    </div>
  );
}
