"use client";

import { useRef, useCallback } from "react";
import { useAgoraStore } from "@/lib/store";
import { councilApi, sessionsApi } from "@/lib/api";

export function useCouncilStream(sessionId: string) {
  const {
    addMessage,
    setMessages,
    setStreamingToken,
    clearStreamingAgent,
    clearAllStreaming,
    streamingAgents,
    isStreaming,
    setIsStreaming,
  } = useAgoraStore();

  const abortRef = useRef<AbortController | null>(null);

  const handleSSEEvent = useCallback(
    (event: Record<string, unknown>) => {
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
          const existing = useAgoraStore.getState().streamingAgents[agentId];
          setStreamingToken(agentId, {
            agentId,
            agentName: existing?.agentName ?? "",
            content: (existing?.content ?? "") + (event.token as string),
            isComplete: false,
          });
          break;
        }

        case "agent_done":
          clearStreamingAgent(event.agent_id as string);
          break;

        case "error": {
          const agentId = (event.agent_id as string) || "system";
          const agentName = (event.agent_name as string) || "System";
          const errorText = (event.error as string) || "Unknown streaming error";
          clearStreamingAgent(agentId);
          addMessage({
            id: `error-${agentId}-${Date.now()}`,
            agent_id: agentId,
            agent_name: agentName,
            content: `[ERROR] ${errorText}`,
            timestamp: new Date().toISOString(),
          });
          break;
        }

        case "round_complete":
          clearAllStreaming();
          break;
      }
    },
    [setStreamingToken, clearStreamingAgent, clearAllStreaming, addMessage]
  );

  const sendMessage = useCallback(
    async (userMessage: string, turns = 1) => {
      if (!userMessage.trim() || isStreaming) return;

      setIsStreaming(true);
      clearAllStreaming();

      // Optimistic user message
      addMessage({
        id: `temp-${Date.now()}`,
        agent_id: "user",
        agent_name: "You",
        content: userMessage,
        timestamp: new Date().toISOString(),
      });

      const url = councilApi.streamRoundUrl(sessionId, userMessage, turns);
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`SSE ${res.status}: ${errText}`);
        }
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
          addMessage({
            id: `client-error-${Date.now()}`,
            agent_id: "system",
            agent_name: "System",
            content: `[ERROR] ${err.message}`,
            timestamp: new Date().toISOString(),
          });
        }
      } finally {
        // Flush any remaining streaming agents as completed messages
        const currentStreaming = useAgoraStore.getState().streamingAgents;
        Object.values(currentStreaming).forEach((st) => {
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
    },
    [sessionId, isStreaming, addMessage, setMessages, setIsStreaming, clearAllStreaming, handleSSEEvent]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { sendMessage, stop, isStreaming, streamingAgents };
}
