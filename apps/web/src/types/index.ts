/**
 * AGORA shared frontend types.
 */

export type PanelMode = 'council' | 'arena' | 'board'

export interface Subtask {
  id: string | number
  description: string
  assigned_to: string
  priority: number
  status: 'pending' | 'in_progress' | 'done'
}

export interface ActionResult {
  action_type: string
  agent_id: string
  requires_approval: boolean
  rationale: string
  output: {
    branch?: string
    slug?: string
    pr_title?: string
    pr_body?: string
    files?: Array<{ path: string; content: string; commit_message?: string }>
    code?: string
    language?: string
    filename?: string
    diff?: string
    description?: string
    [key: string]: unknown
  }
}

export interface VoteResult {
  topic: string
  decision: string
  yea: number
  nay: number
  abstain: number
  votes: Array<{
    agent_id: string
    agent_name: string
    option: string
    rationale: string
  }>
}

export interface GraphNode {
  id: string
  type: 'agent' | 'memory' | 'task'
  label: string
  agentId?: string
  data: Record<string, unknown>
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  label?: string
  animated?: boolean
}
