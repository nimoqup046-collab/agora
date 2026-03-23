/**
 * AGORA API Client
 * Typed wrappers around the FastAPI backend.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Agent {
  agent_id: string;
  name: string;
  role: string;
  capabilities: string[];
  is_active: boolean;
}

export interface Session {
  id: string;
  title: string;
  task: string;
  status: string;
  message_count: number;
  participant_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface SessionMessage {
  id: string;
  agent_id: string;
  agent_name: string;
  content: string;
  timestamp: string;
}

export interface SessionDetail extends Session {
  messages: SessionMessage[];
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${res.status}: ${err}`);
  }
  return res.json();
}

// ── Agents ────────────────────────────────────────────────────────────────────

export const agentsApi = {
  list: () => request<{ agents: Agent[] }>("/agents/").then((r) => r.agents),

  get: (agentId: string) => request<Agent>(`/agents/${agentId}`),
};

// ── Sessions ──────────────────────────────────────────────────────────────────

export const sessionsApi = {
  list: () =>
    request<{ sessions: Session[] }>("/sessions/").then((r) => r.sessions),

  get: (sessionId: string) =>
    request<SessionDetail>(`/sessions/${sessionId}`),

  create: (params: { title: string; task: string; participant_ids?: string[] }) =>
    request<Session>("/sessions/", {
      method: "POST",
      body: JSON.stringify(params),
    }),

  delete: (sessionId: string) =>
    request<{ status: string }>(`/sessions/${sessionId}`, { method: "DELETE" }),
};

// ── Council ───────────────────────────────────────────────────────────────────

export const councilApi = {
  sendMessage: (
    sessionId: string,
    content: string,
    agentId?: string
  ) =>
    request<{ message_id: string; agent_id: string; agent_name: string; content: string }>(
      `/council/${sessionId}/message`,
      {
        method: "POST",
        body: JSON.stringify({ content, agent_id: agentId }),
      }
    ),

  decompose: (sessionId: string, task?: string) =>
    request<{ subtasks: Array<{ id: number; description: string; assigned_to: string; priority: number }> }>(
      `/council/${sessionId}/decompose`,
      {
        method: "POST",
        body: JSON.stringify({ task }),
      }
    ),

  /**
   * Returns an SSE URL for streaming a full council round.
   */
  streamRoundUrl: (sessionId: string, userMessage: string, turns = 1) =>
    `${API_URL}/council/${sessionId}/stream?user_message=${encodeURIComponent(userMessage)}&turns=${turns}`,
};

// ── Health ────────────────────────────────────────────────────────────────────

export const healthApi = {
  check: () => request<{ status: string; agents: number }>("/health"),
};
