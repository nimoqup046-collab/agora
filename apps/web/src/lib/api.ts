/**
 * AGORA API client wrappers.
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

export interface DecomposeResponse {
  session_id: string;
  task: string;
  subtasks: Array<{
    id: number;
    description: string;
    assigned_to: string;
    priority: number;
    status?: string;
  }>;
}

export interface ActResponse {
  action_type: string;
  agent_id: string;
  requires_approval: boolean;
  rationale: string;
  output: Record<string, unknown>;
}

export interface ActConfirmResponse {
  status: string;
  pr_url?: string;
  pr_number?: number;
  branch?: string;
  title?: string;
  sha?: string;
}

export interface VoteRequest {
  topic: string;
  agent_votes: Record<string, string>;
  rationales?: Record<string, string>;
}

export interface VoteResponse {
  topic: string;
  decision: string;
  yea: number;
  nay: number;
  abstain: number;
  votes: Array<{
    agent_id: string;
    agent_name: string;
    option: string;
    rationale: string;
  }>;
}

export interface HealthResponse {
  status: string;
  app?: string;
  agents?: number;
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

export const agentsApi = {
  list: () => request<{ agents: Agent[] }>("/agents/").then((r) => r.agents),
  get: (agentId: string) => request<Agent>(`/agents/${agentId}`),
};

export const sessionsApi = {
  list: () => request<{ sessions: Session[] }>("/sessions/").then((r) => r.sessions),
  get: (sessionId: string) => request<SessionDetail>(`/sessions/${sessionId}`),
  create: (params: { title: string; task: string; participant_ids?: string[] }) =>
    request<Session>("/sessions/", {
      method: "POST",
      body: JSON.stringify(params),
    }),
  delete: (sessionId: string) =>
    request<{ status: string }>(`/sessions/${sessionId}`, { method: "DELETE" }),
};

export const councilApi = {
  sendMessage: (sessionId: string, content: string, agentId?: string) =>
    request<{ message_id: string; agent_id: string; agent_name: string; content: string }>(
      `/council/${sessionId}/message`,
      {
        method: "POST",
        body: JSON.stringify({ content, agent_id: agentId }),
      }
    ),

  decompose: (sessionId: string, task?: string) =>
    request<DecomposeResponse>(`/council/${sessionId}/decompose`, {
      method: "POST",
      body: JSON.stringify({ task }),
    }),

  act: (
    sessionId: string,
    params: {
      agent_id: string;
      action_type: string;
      parameters?: Record<string, unknown>;
      rationale?: string;
    }
  ) =>
    request<ActResponse>(`/council/${sessionId}/act`, {
      method: "POST",
      body: JSON.stringify(params),
    }),

  confirmAct: (
    sessionId: string,
    actionResult: Record<string, unknown>,
    sessionConfirmId?: string
  ) =>
    request<ActConfirmResponse>(`/council/${sessionId}/act/confirm`, {
      method: "POST",
      body: JSON.stringify({
        action_result: actionResult,
        session_id: sessionConfirmId,
      }),
    }),

  vote: (sessionId: string, params: VoteRequest) =>
    request<VoteResponse>(`/council/${sessionId}/vote`, {
      method: "POST",
      body: JSON.stringify(params),
    }),

  streamRoundUrl: (sessionId: string, userMessage: string, turns = 1) =>
    `${API_URL}/council/${sessionId}/stream?user_message=${encodeURIComponent(userMessage)}&turns=${turns}`,
};

export const healthApi = {
  check: () => request<HealthResponse>("/health"),
};