import { create } from 'zustand';
import { agoraAPI, Session, Agent } from '../lib/api';

interface SessionStore {
  sessions: Session[];
  agents: Agent[];
  currentSession: Session | null;
  isLoading: boolean;
  error: string | null;

  fetchAgents: () => Promise<void>;
  fetchSessions: () => Promise<void>;
  createSession: (task: string, participantIds?: string[]) => Promise<void>;
  selectSession: (sessionId: string) => Promise<void>;
  clearCurrentSession: () => void;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  sessions: [],
  agents: [],
  currentSession: null,
  isLoading: false,
  error: null,

  fetchAgents: async () => {
    set({ isLoading: true, error: null });
    try {
      const agents = await agoraAPI.getAgents();
      set({ agents, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch agents',
        isLoading: false
      });
    }
  },

  fetchSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await agoraAPI.getSessions();
      set({ sessions: response.sessions, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch sessions',
        isLoading: false
      });
    }
  },

  createSession: async (task: string, participantIds?: string[]) => {
    set({ isLoading: true, error: null });
    try {
      const response = await agoraAPI.createSession({
        task,
        participant_ids: participantIds || ['claude-architect', 'codex-implementer', 'meta-conductor'],
      });

      // 自动选择新创建的会话
      await get().selectSession(response.session_id);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create session',
        isLoading: false
      });
    }
  },

  selectSession: async (sessionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = await agoraAPI.getSession(sessionId);
      set({ currentSession: session, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch session',
        isLoading: false
      });
    }
  },

  clearCurrentSession: () => {
    set({ currentSession: null });
  },
}));
