import { AgentPanel } from "@/components/AgentPanel";
import { SessionSidebar } from "@/components/SessionSidebar";
import Link from "next/link";

export default function CouncilLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-agora-bg">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 h-10 bg-agora-surface border-b border-agora-border flex items-center px-4 gap-3 z-10">
        <Link href="/" className="text-sm font-bold text-slate-200 hover:text-agora-accent transition-colors">
          AGORA
        </Link>
        <span className="text-slate-700">/</span>
        <span className="text-xs text-slate-500">Council</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] text-slate-600 px-2 py-0.5 rounded border border-agora-border">
            Phase 1 MVP
          </span>
        </div>
      </div>

      {/* Main layout below top bar */}
      <div className="flex w-full pt-10">
        <SessionSidebar />
        <main className="flex-1 flex overflow-hidden">
          {children}
        </main>
        <AgentPanel />
      </div>
    </div>
  );
}
