"use client";

import { useState, useEffect } from "react";
import { useAgoraStore } from "@/lib/store";
import { sessionsApi } from "@/lib/api";
import { useCouncilStream } from "@/hooks/useCouncilStream";
import { MessageFeed } from "@/components/council/MessageFeed";
import { SectionHeader } from "@/components/common/SectionHeader";

interface CouncilChatProps {
  sessionId: string;
}

export function CouncilChat({ sessionId }: CouncilChatProps) {
  const { setMessages } = useAgoraStore();
  const { sendMessage, stop, isStreaming } = useCouncilStream(sessionId);

  const [input, setInput] = useState("");
  const [turns, setTurns] = useState(1);

  useEffect(() => {
    sessionsApi.get(sessionId).then((s) => setMessages(s.messages)).catch(console.error);
  }, [sessionId, setMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    const msg = input.trim();
    setInput("");
    await sendMessage(msg, turns);
  };

  return (
    <div className="flex flex-col h-full">
      <SectionHeader
        title="COUNCIL FEED"
        right={
          <span className="text-[10px] text-slate-600 font-mono">
            {isStreaming ? "DELIBERATING" : "READY"}
          </span>
        }
      />

      <MessageFeed sessionId={sessionId} />

      <form
        onSubmit={handleSubmit}
        className="border-t border-agora-border bg-agora-surface/80 p-3 space-y-2 shrink-0"
      >
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as unknown as React.FormEvent);
              }
            }}
            placeholder="Describe a hard problem for the council..."
            disabled={isStreaming}
            rows={2}
            className="flex-1 bg-agora-bg border border-agora-border rounded px-3 py-2 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-agora-accent/60 disabled:opacity-50"
          />

          <div className="flex flex-col gap-1">
            {isStreaming ? (
              <button
                type="button"
                onClick={stop}
                className="px-3 py-2 rounded bg-rose-800/80 text-white text-xs hover:bg-rose-700 transition-colors"
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="px-3 py-2 rounded bg-agora-accent text-white text-xs hover:bg-agora-accent/90 transition-colors disabled:opacity-40"
              >
                Send
              </button>
            )}

            <div className="flex items-center gap-1 text-[10px] text-slate-600">
              <span>Turns:</span>
              <select
                value={turns}
                onChange={(e) => setTurns(Number(e.target.value))}
                className="bg-agora-bg border border-agora-border rounded px-1 py-0.5 text-slate-300 text-[10px]"
              >
                {[1, 2, 3].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-slate-700">
          {isStreaming
            ? "Council is deliberating..."
            : "Enter to send, Shift+Enter for newline."}
        </p>
      </form>
    </div>
  );
}