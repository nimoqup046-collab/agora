/**
 * AGORA Zustand Store
 * Global client-side state for sessions, agents, and streaming.
 */

import { create } from "zustand";
import type { Agent, Session, SessionMessage } from "./api";

export type StreamingToken = {
  agentId: string;
  agentName: string;
  content: string;
  isComplete: boolean;
};

interface AgoraStore {
  // Agents
  agents: Agent[];
  setAgents: (agents: Agent[]) => void;

  // Sessions
  sessions: Session[];
  setSessions: (sessions: Session[]) => void;
  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;

  // Messages for current session
  messages: SessionMessage[];
  setMessages: (messages: SessionMessage[]) => void;
  addMessage: (msg: SessionMessage) => void;

  // Streaming state
  streamingAgents: Record<string, StreamingToken>;
  setStreamingToken: (agentId: string, token: StreamingToken) => void;
  clearStreamingAgent: (agentId: string) => void;
  clearAllStreaming: () => void;

  // UI state
  isStreaming: boolean;
  setIsStreaming: (v: boolean) => void;
  isCreatingSession: boolean;
  setIsCreatingSession: (v: boolean) => void;
}

export const useAgoraStore = create<AgoraStore>((set) => ({
  agents: [],
  setAgents: (agents) => set({ agents }),

  sessions: [],
  setSessions: (sessions) => set({ sessions }),
  currentSessionId: null,
  setCurrentSessionId: (id) => set({ currentSessionId: id }),

  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),

  streamingAgents: {},
  setStreamingToken: (agentId, token) =>
    set((state) => ({
      streamingAgents: { ...state.streamingAgents, [agentId]: token },
    })),
  clearStreamingAgent: (agentId) =>
    set((state) => {
      const next = { ...state.streamingAgents };
      delete next[agentId];
      return { streamingAgents: next };
    }),
  clearAllStreaming: () => set({ streamingAgents: {} }),

  isStreaming: false,
  setIsStreaming: (v) => set({ isStreaming: v }),
  isCreatingSession: false,
  setIsCreatingSession: (v) => set({ isCreatingSession: v }),
}));
