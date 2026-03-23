import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Logo / Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-slate-100">
            AGORA
          </h1>
          <p className="text-agora-accent text-sm tracking-widest uppercase">
            Collective Intelligence Terminal
          </p>
        </div>

        {/* Philosophy quote */}
        <blockquote className="border-l-2 border-agora-border pl-4 text-slate-400 text-sm italic text-left">
          "In the original Agora, Socrates asked: what is truth? what is
          knowledge? He never sought answers alone — he summoned all willing
          minds, and let wisdom emerge through debate, challenge, and
          collision."
        </blockquote>

        {/* Agent badges */}
        <div className="flex justify-center gap-3 flex-wrap">
          <span className="px-3 py-1 rounded-full text-xs border border-agora-claude text-agora-claude bg-agora-claude/10">
            Claude · Architect
          </span>
          <span className="px-3 py-1 rounded-full text-xs border border-agora-codex text-agora-codex bg-agora-codex/10">
            Codex · Implementer
          </span>
          <span className="px-3 py-1 rounded-full text-xs border border-agora-meta text-agora-meta bg-agora-meta/10">
            Meta-Agent · Conductor
          </span>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/council"
            className="px-6 py-3 rounded-lg bg-agora-accent text-white font-semibold hover:bg-agora-accent/90 transition-colors"
          >
            Enter the Council
          </Link>
          <a
            href="/docs"
            className="px-6 py-3 rounded-lg border border-agora-border text-slate-300 hover:border-agora-accent/50 transition-colors"
          >
            API Docs
          </a>
        </div>

        {/* Status */}
        <p className="text-xs text-slate-600">
          Phase 1 — Council MVP · Alpha
        </p>
      </div>
    </main>
  );
}
