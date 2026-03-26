/**
 * AGORA API Client
 * 集成后端 FastAPI 服务
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Agent {
  agent_id: string;
  name: string;
  model: string;
  status: 'online' | 'offline' | 'busy';
}

export interface Session {
  session_id: string;
  title: string;
  task: string;
  participant_ids: string[];
  status: 'created' | 'running' | 'waiting_approval' | 'completed' | 'failed' | 'canceled';
  created_at: string;
  updated_at: string;
}

export interface Message {
  message_id: string;
  session_id: string;
  agent_id: string;
  content: string;
  timestamp: string;
  message_type: 'text' | 'code' | 'system';
}

export interface CreateSessionRequest {
  title?: string;
  task: string;
  participant_ids?: string[];
}

export interface CreateSessionResponse {
  session_id: string;
  title: string;
  task: string;
  participant_ids: string[];
  status: string;
  created_at: string;
}

class AgoraAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || 'API request failed');
    }

    return response.json();
  }

  // 健康检查
  async healthCheck(): Promise<{ status: string; app: string; agents: number }> {
    return this.request('/health');
  }

  // 获取所有 Agents
  async getAgents(): Promise<Agent[]> {
    return this.request('/agents');
  }

  // 创建会话
  async createSession(data: CreateSessionRequest): Promise<CreateSessionResponse> {
    return this.request('/sessions/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 获取所有会话
  async getSessions(): Promise<{ sessions: Session[] }> {
    return this.request('/sessions/');
  }

  // 获取单个会话详情
  async getSession(sessionId: string): Promise<Session & { messages: Message[] }> {
    return this.request(`/sessions/${sessionId}`);
  }

  // 更新会话状态
  async updateSessionStatus(
    sessionId: string,
    status: Session['status']
  ): Promise<{ status: string; session_id: string; new_status: string }> {
    return this.request(`/sessions/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // 删除会话
  async deleteSession(sessionId: string): Promise<{ status: string; session_id: string }> {
    return this.request(`/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // 发送消息到 Council
  async sendCouncilMessage(sessionId: string, content: string): Promise<any> {
    return this.request(`/council/${sessionId}/turn`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // 获取 Council 流式消息 (SSE)
  async streamCouncilMessages(sessionId: string): Promise<ReadableStream> {
    const url = `${this.baseURL}/council/${sessionId}/stream`;
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to connect to council stream');
    }

    return response.body!;
  }
}

export const agoraAPI = new AgoraAPI();
