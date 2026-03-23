"use client";

import { useAgoraStore } from "@/lib/store";

export function StatusStrip() {
  const { memoryCount, prCount, messages, isStreaming } = useAgoraStore();

  return (
    <div className="h-6 shrink-0 bg-agora-surface/80 border-t border-agora-border flex items-center px-4 gap-4">
      <span className="text-[10px] text-slate-600 font-mono">
        MSGS: {messages.length}
      </span>
      <span className="text-[10px] text-slate-600 font-mono">
        MEM: {memoryCount}
      </span>
      <span className="text-[10px] text-slate-600 font-mono">
        PRS: {prCount}
      </span>
      <div className="ml-auto flex items-center gap-1">
        <span className="text-[10px] text-slate-700 font-mono">
          {isStreaming ? "DELIBERATING..." : "READY"}
        </span>
      </div>
    </div>
  );
}
