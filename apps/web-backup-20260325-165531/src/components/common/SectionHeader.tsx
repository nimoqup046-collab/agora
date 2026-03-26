"use client";

interface SectionHeaderProps {
  title: string;
  right?: React.ReactNode;
}

export function SectionHeader({ title, right }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-agora-border shrink-0">
      <span className="text-[10px] font-semibold text-slate-500 tracking-widest uppercase">
        {title}
      </span>
      {right && <div className="flex items-center gap-1">{right}</div>}
    </div>
  );
}
