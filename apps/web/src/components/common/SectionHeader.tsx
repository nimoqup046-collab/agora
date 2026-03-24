"use client";

interface SectionHeaderProps {
  title: string;
  right?: React.ReactNode;
}

export function SectionHeader({ title, right }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 border-b border-agora-border/70 module-divider shrink-0">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(57,216,255,0.7)]" />
        <span className="font-tech text-[10px] font-semibold text-cyan-100 tracking-[0.22em] uppercase">
          {title}
        </span>
      </div>
      {right && <div className="flex items-center gap-1">{right}</div>}
    </div>
  );
}

