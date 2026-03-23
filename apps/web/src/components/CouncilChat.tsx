"use client";

import { useState, useRef, useEffect } from "react";
import { useAgoraStore } from "@/lib/store";
import { councilApi, sessionsApi } from "@/lib/api";
import { MessageBubble, StreamingBubble } from "./MessageBubble";

interface CouncilChatProps {
  sessionId: string;
}

export function CouncilChat({ sessionId }: CouncilChatProps) {
  const {
    messages,
    setMessages,
    addMessage,
    streamingAgents,
    setStreamingToken,
    clearStreamingAgent,
    clearAllStreaming,
    isStreaming,
    setIsStreaming,
  } = useAgoraStore();

  const [input, setInput] = useState("");
  const [turns, setTurns] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load existing messages on mount
  useEffect(() => {
    sessionsApi.get(sessionId).then((s) => setMessages(s.messages)).catch(console.error);
  }, [sessionId, setMessages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingAgents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    setInput("");
    setIsStreaming(true);
    clearAllStreaming();

    // Optimistic user message
    const tempId = `temp-${Date.now()}`;
    addMessage({
      id: tempId,
      agent_id: "user",
      agent_name: "You",
      content: userMessage,
      timestamp: new Date().toISOString(),
    });

    // Open SSE stream
    const url = councilApi.streamRoundUrl(sessionId, userMessage, turns);
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;

          try {
            const event = JSON.parse(data);
            handleSSEEvent(event);
          } catch {
            // ignore malformed events
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("SSE error:", err);
      }
    } finally {
      // Flush any remaining streaming agents as completed messages
      Object.values(streamingAgents).forEach((st) => {
        if (st.content) {
          addMessage({
            id: `stream-${st.agentId}-${Date.now()}`,
            agent_id: st.agentId,
            agent_name: st.agentName,
            content: st.content,
            timestamp: new Date().toISOString(),
          });
        }
      });
      clearAllStreaming();
      setIsStreaming(false);

      // Refresh messages from server to sync state
      sessionsApi.get(sessionId).then((s) => setMessages(s.messages)).catch(console.error);
    }
  };

  const handleSSEEvent = (event: Record<string, unknown>) => {
    switch (event.type) {
      case "agent_start":
        setStreamingToken(event.agent_id as string, {
          agentId: event.agent_id as string,
          agentName: event.agent_name as string,
          content: "",
          isComplete: false,
        });
        break;

      case "token": {
        const agentId = event.agent_id as string;
        setStreamingToken(agentId, {
          agentId,
          agentName: "", // will be filled from existing state
          content: (useAgoraStore.getState().streamingAgents[agentId]?.content || "") + (event.token as string),
          isComplete: false,
        });
        break;
      }

      case "agent_done":
        clearStreamingAgent(event.agent_id as string);
        break;

      case "round_complete":
        clearAllStreaming();
        break;
    }
  };

  const stopStreaming = () => {
    abortRef.current?.abort();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 text-slate-600">
            <p className="text-2xl">🏛</p>
            <p className="text-sm">The council awaits your question.</p>
            <p className="text-xs">
              Type a problem below and all agents will collaborate in real-time.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Streaming agent bubbles */}
        {Object.values(streamingAgents).map((st) => (
          <StreamingBubble
            key={st.agentId}
            agentId={st.agentId}
            agentName={st.agentName}
            content={st.content}
          />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-agora-border bg-agora-surface/80 p-4 space-y-2"
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
            placeholder="Describe a problem for the council... (Enter to send, Shift+Enter for newline)"
            disabled={isStreaming}
            rows={2}
            className="flex-1 bg-agora-bg border border-agora-border rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-agora-accent/60 disabled:opacity-50"
          />

          <div className="flex flex-col gap-1">
            {isStreaming ? (
              <button
                type="button"
                onClick={stopStreaming}
                className="px-4 py-2 rounded-lg bg-red-700/80 text-white text-sm hover:bg-red-700 transition-colors"
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="px-4 py-2 rounded-lg bg-agora-accent text-white text-sm hover:bg-agora-accent/90 transition-colors disabled:opacity-40"
              >
                Send
              </button>
            )}

            <div className="flex items-center gap-1 text-xs text-slate-600">
              <span>Rounds:</span>
              <select
                value={turns}
                onChange={(e) => setTurns(Number(e.target.value))}
                className="bg-agora-bg border border-agora-border rounded px-1 py-0.5 text-slate-300"
              >
                {[1, 2, 3].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-slate-700">
          {isStreaming
            ? "Council is deliberating..."
            : "All 3 agents will respond in turn. Meta-Agent moderates every 3rd turn."}
        </p>
      </form>
    </div>
  );
}
