"use client";

import { useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useAgoraStore } from "@/lib/store";
import type { Agent } from "@/lib/api";

type FlowNode = Node<Record<string, unknown>>;
type FlowEdge = Edge<Record<string, unknown>>;

const AGENT_COLORS: Record<string, string> = {
  "claude-architect": "#d97706",
  "codex-implementer": "#34d399",
  "meta-conductor": "#a78bfa",
};

function buildInitialGraph(agents: Agent[]): { nodes: FlowNode[]; edges: FlowEdge[] } {
  const nodes: FlowNode[] = agents.map((agent, i) => ({
    id: agent.agent_id,
    type: "default",
    position: {
      x: 160 + Math.cos((i * 2 * Math.PI) / agents.length) * 140,
      y: 160 + Math.sin((i * 2 * Math.PI) / agents.length) * 100,
    },
    data: { label: agent.name },
    style: {
      background: "#0f172a",
      border: `1px solid ${AGENT_COLORS[agent.agent_id] || "#475569"}`,
      borderRadius: "4px",
      color: AGENT_COLORS[agent.agent_id] || "#94a3b8",
      fontSize: "11px",
      fontFamily: "monospace",
      padding: "6px 10px",
    },
  }));

  const edges: FlowEdge[] = [];
  for (let i = 0; i < agents.length; i++) {
    for (let j = i + 1; j < agents.length; j++) {
      edges.push({
        id: `e-${agents[i].agent_id}-${agents[j].agent_id}`,
        source: agents[i].agent_id,
        target: agents[j].agent_id,
        data: {},
        style: { stroke: "#1e293b", strokeWidth: 1 },
        animated: false,
      });
    }
  }

  return { nodes, edges };
}

export function KnowledgeGraph() {
  const { agents, graphNodes, setGraphNodes, setGraphEdges, streamingAgents } =
    useAgoraStore();

  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>([]);

  useEffect(() => {
    if (agents.length > 0 && graphNodes.length === 0) {
      const { nodes: initialNodes, edges: initialEdges } = buildInitialGraph(agents);
      setGraphNodes(
        initialNodes.map((n) => ({
          id: n.id,
          type: "agent",
          label: n.data.label as string,
          agentId: n.id,
          data: {},
        }))
      );
      setGraphEdges(
        initialEdges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
        }))
      );
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [agents, graphNodes.length, setGraphNodes, setGraphEdges, setNodes, setEdges]);

  // Animate edges for active streaming agents
  useEffect(() => {
    const activeAgents = Object.keys(streamingAgents);
    setEdges((eds: FlowEdge[]) =>
      eds.map((e) => ({
        ...e,
        animated: activeAgents.includes(e.source) || activeAgents.includes(e.target),
        style: {
          ...e.style,
          stroke:
            activeAgents.includes(e.source) || activeAgents.includes(e.target)
              ? "#6366f1"
              : "#1e293b",
        },
      }))
    );
  }, [streamingAgents, setEdges]);

  return (
    <div className="flex-1 bg-agora-bg" style={{ minHeight: 200 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange as (changes: NodeChange<FlowNode>[]) => void}
        onEdgesChange={onEdgesChange as (changes: EdgeChange<FlowEdge>[]) => void}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        style={{ background: "transparent" }}
      >
        <Background color="#1e293b" gap={20} size={1} />
        <Controls
          style={{
            background: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: "4px",
          }}
        />
      </ReactFlow>
    </div>
  );
}
