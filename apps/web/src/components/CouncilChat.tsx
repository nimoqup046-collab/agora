"use client";

import { useState, useEffect } from "react";
import { useAgoraStore } from "@/lib/store";
import { sessionsApi } from "@/lib/api";
import { useCouncilStream } from "@/hooks/useCouncilStream";
import { MessageFeed } from "@/components/council/MessageFeed";
import { SectionHeader } from "@/components/common/SectionHeader";
import { useI18n } from "@/components/i18n/LanguageProvider";

interface CouncilChatProps {
  sessionId: string;
}

export function CouncilChat({ sessionId }: CouncilChatProps) {
  const { setMessages } = useAgoraStore();
  const { t } = useI18n();
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
        title={t("council.feed")}
        right={
          <span className="text-[10px] text-slate-300 font-tech tracking-[0.12em]">
            {isStreaming ? t("council.deliberating") : t("council.ready")}
          </span>
        }
      />

      <MessageFeed sessionId={sessionId} />

      <form
        onSubmit={handleSubmit}
        className="border-t border-agora-border/70 module-divider p-3 space-y-2 shrink-0"
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
            placeholder={t("council.describe")}
            disabled={isStreaming}
            rows={2}
            className="flex-1 bg-[#090f1f] border border-agora-border rounded px-3 py-2 text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:border-cyan-300/65 disabled:opacity-50"
          />

          <div className="flex flex-col gap-1">
            {isStreaming ? (
              <button
                type="button"
                onClick={stop}
                className="px-3 py-2 rounded bg-rose-500/20 border border-rose-300/60 text-rose-100 text-xs hover:bg-rose-500/30 transition-colors"
              >
                {t("council.stop")}
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="px-3 py-2 rounded bg-cyan-500/20 border border-cyan-300/60 text-cyan-100 text-xs hover:bg-cyan-500/30 transition-colors disabled:opacity-40"
              >
                {t("council.send")}
              </button>
            )}

            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <span>{t("council.turns")}:</span>
              <select
                value={turns}
                onChange={(e) => setTurns(Number(e.target.value))}
                className="bg-[#090f1f] border border-agora-border rounded px-1 py-0.5 text-slate-300 text-[10px]"
              >
                {[1, 2, 3].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-slate-400">
          {isStreaming
            ? t("council.streaming")
            : t("council.enterHint")}
        </p>
      </form>
    </div>
  );
}
