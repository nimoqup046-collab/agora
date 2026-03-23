export default function CouncilIndexPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-600 space-y-3 p-8">
      <p className="text-3xl">🏛</p>
      <h2 className="text-lg font-semibold text-slate-400">
        Select or create a session
      </h2>
      <p className="text-sm max-w-sm">
        Choose an existing council session from the left, or click{" "}
        <span className="text-agora-accent font-bold">+</span> to start a new
        one.
      </p>
      <p className="text-xs text-slate-700 max-w-xs">
        Each session is a collaborative problem-solving thread where Claude,
        Codex, and Meta-Agent work together in real-time.
      </p>
    </div>
  );
}
