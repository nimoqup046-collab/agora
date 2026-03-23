/**
 * AGORA Zustand Store
 * Global client-side state for sessions, agents, and streaming.
 */

import { create } from "zustand";
import type { Agent, Session, SessionMessage } from "./api";
import type { Subtask, ActionResult, GraphNode, GraphEdge } from "@/types";

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

  // Tasks (board mode)
  tasks: Subtask[];
  setTasks: (tasks: Subtask[]) => void;
  updateTaskStatus: (id: string | number, status: Subtask["status"]) => void;

  // Current action (arena mode)
  currentAction: ActionResult | null;
  setCurrentAction: (action: ActionResult | null) => void;

  // Knowledge graph
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  setGraphNodes: (nodes: GraphNode[]) => void;
  setGraphEdges: (edges: GraphEdge[]) => void;

  // Stats
  memoryCount: number;
  prCount: number;
  setMemoryCount: (n: number) => void;
  setPrCount: (n: number) => void;
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

  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  updateTaskStatus: (id, status) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, status } : t
      ),
    })),

  currentAction: null,
  setCurrentAction: (action) => set({ currentAction: action }),

  graphNodes: [],
  graphEdges: [],
  setGraphNodes: (nodes) => set({ graphNodes: nodes }),
  setGraphEdges: (edges) => set({ graphEdges: edges }),

  memoryCount: 0,
  prCount: 0,
  setMemoryCount: (n) => set({ memoryCount: n }),
  setPrCount: (n) => set({ prCount: n }),
}));
