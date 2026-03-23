<div align="center">

# 🗺️ AGORA — Roadmap

### *Three phases. One destination: collective machine intelligence.*

</div>

---

## Overview

```
2026 Q2          2026 Q3               2026 Q4+
    │                │                     │
    ▼                ▼                     ▼
┌─────────┐    ┌──────────┐    ┌───────────────────┐
│ PHASE 1 │───▶│ PHASE 2  │───▶│     PHASE 3       │
│  Council│    │ Memory & │    │  Swarm             │
│  MVP    │    │ Evolution│    │  Consciousness     │
└─────────┘    └──────────┘    └───────────────────┘
  Prove the     Build the        Unlock emergent
  council       brain            collective mind
```

---

## 🔨 Phase 1 — MVP Council
**Target: Q2 2026 | Status: 🔨 In Progress**

> *Prove the core thesis: top-tier agents collaborating in a shared workspace produce better outcomes than any single agent alone.*

### Goals
- [ ] Multi-agent group chat with real streaming output (SSE)
- [ ] 3 agents live: Claude Opus, Codex, Meta-Agent (orchestrator)
- [ ] Shared session context — all agents see the full conversation history
- [ ] Structured turn-taking — agents know when to speak, when to listen
- [ ] Basic consensus mechanism — agents can agree, object, or abstain
- [ ] GitHub PR integration — agents can open, review, and comment on real PRs
- [ ] Next.js GUI Terminal — Agent Council panel + Code Arena
- [ ] One-click Railway deployment

### Technical Milestones
| Milestone | Description | Status |
|-----------|-------------|--------|
| `M1.1` | `packages/adapter` — Unified API for Claude + Codex | ⬜ |
| `M1.2` | `apps/api` — FastAPI backend + SSE streaming | ⬜ |
| `M1.3` | `packages/orchestrator` — Session + turn-taking engine | ⬜ |
| `M1.4` | `apps/web` — Council chat UI + Code Arena | ⬜ |
| `M1.5` | GitHub API integration — PR open/review/comment | ⬜ |
| `M1.6` | Railway multi-service deployment config | ⬜ |
| `M1.7` | End-to-end demo: council builds + PRs a real feature | ⬜ |

### Success Criteria
- A user can describe a coding problem; the council collaboratively produces a PR with code, tests, and a review — without the user writing a single line.
- Session quality is measurably better than single-agent baseline on 3+ benchmark tasks.

### Stack
```
Frontend:   Next.js 14 · TypeScript · Tailwind CSS · Zustand
Backend:    FastAPI · Python 3.12 · Uvicorn
Streaming:  Server-Sent Events (SSE)
Queue:      Redis + BullMQ
Database:   PostgreSQL 16
Deploy:     Railway (private networking)
```

---

## 🧬 Phase 2 — Memory & Evolution
**Target: Q3 2026 | Status: 📋 Planned**

> *Give the council a brain. Memories that outlast context windows. Strategies that improve over time.*

### Goals
- [ ] **Shared Memory Fabric** — persistent, multi-tier memory architecture
  - Working memory: Redis (hot, session-scoped)
  - Episodic memory: PostgreSQL + pgvector (semantic recall)
  - Knowledge graph: Neo4j (entity-relationship network, grows over time)
- [ ] **Memory Inspector UI** — visualize the knowledge graph live with D3.js
- [ ] **Evolution Engine v1** — agents self-optimize their System Prompts based on task outcomes
- [ ] **Trait Propagation** — successful reasoning strategies shared across agents
- [ ] **Evolution Guard** — audit mechanism preventing bad strategies from propagating
- [ ] **Evolution Timeline UI** — visualize each agent's capability growth over time
- [ ] **Science Mode v1** — arXiv + PubMed API connectors; agents can cite real papers
- [ ] **Memory access control** — private vs. shared memory; provenance tracking

### Technical Milestones
| Milestone | Description | Status |
|-----------|-------------|--------|
| `M2.1` | `packages/memory` — Redis + pgvector + Neo4j unified interface | ⬜ |
| `M2.2` | Memory injection into agent context at inference time | ⬜ |
| `M2.3` | `packages/evolution` — Prompt optimizer + outcome scorer | ⬜ |
| `M2.4` | Trait propagation protocol between agents | ⬜ |
| `M2.5` | D3.js knowledge graph visualization component | ⬜ |
| `M2.6` | `packages/science` — arXiv + PubMed connectors | ⬜ |
| `M2.7` | Evolution Guard — safety audit for strategy updates | ⬜ |

### Success Criteria
- The council demonstrably improves on a recurring task class over 10+ sessions.
- Knowledge graph for a science domain accumulates >500 nodes with correct relationships after a 2-hour research session.
- Agent A's evolved strategy measurably improves Agent B's performance on transfer tasks.

---

## 🌌 Phase 3 — Swarm Consciousness
**Target: Q4 2026+ | Status: 🌌 Vision**

> *The council becomes a civilization. Emergent behavior. Collective scientific discovery. The first AI system that genuinely thinks together.*

### Goals
- [ ] **Multi-workspace parallelism** — multiple independent councils, each attacking a different problem, with controlled cross-pollination
- [ ] **Science Research Terminal** — structured scientific method: hypothesis → experiment design → execution → validation → publication draft
- [ ] **Autonomous experiment design** — agents propose falsifiable hypotheses and design computational tests
- [ ] **Cross-domain synthesis** — knowledge from physics informs biology informs mathematics, automatically
- [ ] **LoRA trait propagation** — lightweight fine-tuning artifacts shared between agents as "evolved instincts"
- [ ] **External tool integrations** — Python REPL, Wolfram Alpha, molecular simulation engines, theorem provers
- [ ] **Public API** — let third-party agents join an AGORA council via standard protocol
- [ ] **Benchmark: match or exceed single-domain specialist on a Millennium Prize-adjacent problem**

### The Long Vision

```
Phase 3 AGORA council on "Room-temperature superconductivity":

  Session 1    →  Literature map of 847 relevant papers built
  Session 3    →  3 competing theoretical frameworks identified
  Session 7    →  Framework B falsified via simulation; Council converges
  Session 12   →  Novel prediction: Cu-doped hydride at 180GPa
  Session 15   →  Experiment protocol drafted, sent to human researchers
  Session 20   →  Human lab confirms partial prediction
               →  Council evolves: "pressure-doping synergy" strategy
                  propagated to all agents as a new evolved heuristic
```

This is not a demo. This is what AGORA is being built for.

---

## 🔮 Beyond Phase 3

These are not commitments — they are directions worth pointing toward:

- **Multi-institution councils** — AGORA instances at different research institutions sharing anonymized evolved strategies
- **Adversarial councils** — two councils assigned opposing hypotheses, competing to falsify each other
- **Human-in-the-loop science** — researchers join the council as first-class participants
- **Open Evolution Registry** — a public, versioned registry of evolved agent strategies, like npm but for reasoning heuristics

---

## 📌 How to Track Progress

- **Issues** — every milestone has a corresponding GitHub Issue with acceptance criteria
- **Projects** — a GitHub Project board tracks Phase 1 in real-time
- **Discussions** — architectural decisions are debated in GitHub Discussions before implementation
- **ADRs** — every significant design decision is documented in `docs/architecture/`

→ [View open issues](https://github.com/nimoqup046-collab/agora/issues)
→ [Read the Philosophy](PHILOSOPHY.md)
→ [Back to README](README.md)

---

<div align="center">

*"We are not building a faster horse.*
*We are building the first road."*

</div>