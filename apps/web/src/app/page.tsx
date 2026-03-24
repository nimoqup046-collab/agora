import Link from "next/link";

const MODULES = [
  { label: "COUNCIL", desc: "Multi-agent deliberation and consensus", href: "/council", status: "ACTIVE" },
  { label: "ARENA", desc: "Action proposals, execution, and approval", href: "/council?mode=arena", status: "ACTIVE" },
  { label: "BOARD", desc: "Task decomposition and execution board", href: "/council?mode=board", status: "ACTIVE" },
  { label: "MEMORY", desc: "Cross-session memory and graph context", href: "/council", status: "ALPHA" },
];

const AGENTS = [
  { id: "claude-architect", name: "Claude", role: "ARCHITECT", color: "text-amber-500 border-amber-700/50" },
  { id: "codex-implementer", name: "Codex", role: "IMPLEMENTER", color: "text-emerald-400 border-emerald-700/50" },
  { id: "meta-conductor", name: "Meta", role: "CONDUCTOR", color: "text-violet-400 border-violet-700/50" },
];

export default function HomePage() {
  return (
    <main className="flex flex-col h-screen bg-agora-bg overflow-hidden">
      <div className="h-10 border-b border-agora-border bg-agora-surface flex items-center px-4 sm:px-6 shrink-0">
        <span className="text-sm font-bold text-slate-200 tracking-wider">AGORA</span>
        <span className="ml-3 text-[10px] text-slate-600 font-mono tracking-widest">INTELLIGENCE COMMAND CENTER</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded font-mono">
            ONLINE
          </span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        <div className="lg:w-80 border-b lg:border-b-0 lg:border-r border-agora-border flex flex-col p-5 sm:p-6 space-y-5 lg:space-y-6 overflow-y-auto">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">AGORA</h1>
            <p className="text-xs text-agora-accent font-mono tracking-widest mt-1">COLLECTIVE INTELLIGENCE TERMINAL</p>
          </div>

          <blockquote className="border-l-2 border-agora-border pl-3 text-slate-500 text-xs italic leading-relaxed">
            "In the original Agora, Socrates did not seek answers alone."
            <br />
            "He convened willing minds and let wisdom emerge through debate, challenge, and collision."
          </blockquote>

          <div className="space-y-2">
            <p className="text-[10px] text-slate-600 tracking-widest uppercase">Agent Council</p>
            {AGENTS.map((a) => (
              <div
                key={a.id}
                className={`flex items-center gap-2 px-2.5 py-2 rounded border ${a.color} bg-agora-surface/40`}
              >
                <span className={`text-xs font-mono ${a.color.split(" ")[0]}`}>{a.name}</span>
                <span className="text-[9px] text-slate-600 tracking-widest ml-auto">{a.role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 p-5 sm:p-6 space-y-4 overflow-y-auto">
          <p className="text-[10px] text-slate-600 tracking-widest uppercase">Core Modules</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MODULES.map((m) => (
              <Link
                key={m.label}
                href={m.href}
                className="group block p-4 rounded border border-agora-border bg-agora-surface/40 hover:border-agora-accent/40 hover:bg-agora-surface transition-colors"
              >
                <div className="flex items-center justify-between mb-2 gap-3">
                  <span className="text-xs font-semibold text-slate-300 tracking-widest group-hover:text-agora-accent transition-colors">
                    {m.label}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                      m.status === "ACTIVE"
                        ? "text-emerald-400 border-emerald-800/40"
                        : "text-amber-400 border-amber-800/40"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">{m.desc}</p>
              </Link>
            ))}
          </div>

          <div className="pt-4">
            <Link
              href="/council"
              className="inline-flex items-center gap-2 px-4 py-2 rounded border border-agora-accent/40 bg-agora-accent/10 text-agora-accent text-xs font-semibold hover:bg-agora-accent/20 transition-colors tracking-wider"
            >
              ENTER WORKSPACE
            </Link>
          </div>
        </div>

        <div className="lg:w-56 border-t lg:border-t-0 lg:border-l border-agora-border flex flex-col p-4 space-y-4">
          <p className="text-[10px] text-slate-600 tracking-widest uppercase">System State</p>
          <div className="space-y-2">
            {[
              ["API", "READY"],
              ["MEMORY", "REDIS + PG"],
              ["GITHUB", "CONNECTED"],
              ["VERSION", "2.0.0"],
            ].map(([key, val]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-[10px] text-slate-600 font-mono">{key}</span>
                <span className="text-[10px] text-slate-400 font-mono">{val}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4 border-t border-agora-border">
            <p className="text-[9px] text-slate-700 font-mono">Phase 2 / Command Center</p>
          </div>
        </div>
      </div>
    </main>
  );
}