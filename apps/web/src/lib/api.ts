/**
 * AGORA API client wrappers.
 */

// Use same-origin proxy by default to avoid build-time env injection pitfalls
// on Docker deployments (Render).
const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

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
  template?: {
    id: string;
    name: string;
    category: string;
    suggested_first_message?: string | null;
  } | null;
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

export interface SessionTemplate {
  id: string;
  name: string;
  category: "scientific" | "engineering" | "review" | string;
  description: string;
  suggested_first_message?: string;
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
  create: (params: { title?: string; task: string; participant_ids?: string[]; template_id?: string }) =>
    request<Session>("/sessions/", {
      method: "POST",
      body: JSON.stringify(params),
    }),
  delete: (sessionId: string) =>
    request<{ status: string }>(`/sessions/${sessionId}`, { method: "DELETE" }),
};

const FALLBACK_TEMPLATES: SessionTemplate[] = [
  {
    id: "scientific-hypothesis-lab",
    name: "Scientific Hypothesis Lab",
    category: "scientific",
    description: "Use multi-agent debate to propose testable hypotheses and validation steps.",
    suggested_first_message:
      "请围绕该科学问题提出3个可验证假设，并给出实验/数据验证路径与风险点。",
  },
  {
    id: "engineering-implementation-sprint",
    name: "Engineering Implementation Sprint",
    category: "engineering",
    description: "Break down an engineering goal into architecture, milestones, and execution plan.",
    suggested_first_message:
      "请输出一个可落地的技术方案：架构、里程碑、风险、回滚方案、PR拆分建议。",
  },
  {
    id: "code-review-war-room",
    name: "Code Review War Room",
    category: "review",
    description: "Coordinate deep technical review and produce actionable improvement items.",
    suggested_first_message:
      "请从安全、性能、可维护性三方面审查方案，并给出可执行修复清单。",
  },
];

export const templatesApi = {
  list: async (): Promise<SessionTemplate[]> => {
    // Template endpoint is optional in current backend phase.
    // Return local fallback immediately to avoid noisy 502s during API cold start.
    return FALLBACK_TEMPLATES;
  },
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

// ── Evolution ─────────────────────────────────────────────────────────────────

export interface Soul {
  id: string;
  agent_id: string;
  version: number;
  soul_content: string;
  delta_summary: string;
  trigger_session_ids: string[];
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
}

export interface EvolutionTriggerResponse {
  drafts: Array<{
    agent_id: string;
    soul_id: string;
    delta_summary: string;
    version: number;
  }>;
  sessions_analyzed: number;
  agents_evolved: number;
}

export const evolutionApi = {
  trigger: (sessionCount = 10) =>
    request<EvolutionTriggerResponse>("/evolution/trigger", {
      method: "POST",
      body: JSON.stringify({ session_count: sessionCount }),
    }),

  listSouls: (agentId: string) =>
    request<{ agent_id: string; agent_name: string; souls: Soul[]; current_version: number }>(
      `/evolution/souls/${agentId}`
    ),

  approveSoul: (soulId: string) =>
    request<{ soul: Soul; agent_id: string; activated: boolean }>(
      `/evolution/souls/${soulId}/approve`,
      { method: "POST" }
    ),
};

// ── Health ────────────────────────────────────────────────────────────────────

export const healthApi = {
  check: () => request<HealthResponse>("/health"),
};
