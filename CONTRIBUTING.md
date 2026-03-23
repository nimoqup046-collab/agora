# 🤝 Contributing to AGORA

Thank you for considering contributing to AGORA. This project is built on the belief that collective intelligence — human or artificial — produces better outcomes than any single mind working alone. Your contribution is part of that thesis.

---

## 🗺️ Before You Start

1. **Read the [Philosophy](PHILOSOPHY.md)** — understand what we are building and why.
2. **Read the [Roadmap](ROADMAP.md)** — understand where we are and where we are going.
3. **Check open issues** — your idea may already be in progress.
4. **Open a Discussion** — for large architectural changes, discuss before building.

---

## 🏗️ Project Structure

```
agora/
├── packages/
│   ├── adapter/       # Unified Model Adapter — start here for new AI provider support
│   ├── memory/        # Shared Memory Fabric — Redis, pgvector, Neo4j
│   ├── orchestrator/  # Agent Council & Turn-Taking Engine
│   ├── evolution/     # Evolution Engine — prompt optimizer, trait propagation
│   └── science/       # Science Domain Module — arXiv, PubMed connectors
├── apps/
│   ├── web/           # Next.js 14 GUI Terminal
│   └── api/           # FastAPI Backend Service
├── infra/
│   ├── railway/       # Railway deployment configs
│   └── docker/        # Docker Compose for local dev
└── docs/
    ├── architecture/  # Architecture Decision Records (ADR)
    ├── philosophy/    # Extended philosophical essays
    └── science-domains/ # Domain onboarding guides
```

---

## 🔌 How to Contribute

### Adding a New Model Adapter
The easiest and highest-impact contribution. Add support for a new AI provider (Gemini, Mistral, Llama, etc.) in `packages/adapter/`.

All adapters must implement the `IModelAdapter` interface:
- `complete(messages, options)` — single completion
- `stream(messages, options)` — streaming completion
- `getCapabilities()` — return model metadata (context window, supports tools, etc.)

### Improving the Memory Fabric
Work in `packages/memory/`. The memory fabric has three tiers:
- **Hot memory**: Redis, session-scoped, TTL-based
- **Episodic memory**: pgvector, semantic similarity search
- **Knowledge graph**: Neo4j, entity-relationship network

### Evolution Engine
Work in `packages/evolution/`. This is the most experimental module. Ideas welcome:
- Better outcome scoring functions
- Trait propagation protocols
- Safety constraints for strategy updates

### GUI Terminal
Work in `apps/web/`. Built with Next.js 14, TypeScript, Tailwind CSS, Zustand.

### Science Domain Modules
Work in `packages/science/`. Add new domain connectors (arXiv, PubMed, Semantic Scholar, Wolfram Alpha).

---

## 📝 Development Setup

```bash
# Prerequisites: Node.js 20+, Python 3.12+, Docker, pnpm

# 1. Clone
git clone https://github.com/nimoqup046-collab/agora.git
cd agora

# 2. Install dependencies
pnpm install

# 3. Environment variables
cp .env.example .env

# 4. Start all services
docker compose up -d

# 5. Start dev servers
pnpm dev
```

---

## 🔀 Pull Request Process

1. Fork the repository
2. Create a branch: `git checkout -b feat/your-feature-name`
3. Write your code + tests
4. Commit using Conventional Commits (see below)
5. Push and open a PR against `main`
6. Fill in the PR template completely

### Commit Format
```
feat(adapter): add Gemini 1.5 Pro support
fix(memory): correct pgvector cosine similarity query
docs(philosophy): expand section IV on multi-agent distinction
chore(infra): update docker-compose postgres to v16.2
test(orchestrator): add turn-taking edge case coverage
```

---

## ⚖️ Code of Conduct

AGORA is built for the frontier. We expect contributors to:
- Argue with ideas, not people
- Be wrong gracefully — errors are how councils learn
- Credit others generously
- Build for the long term, not the demo

---

*"Come argue with us."*

→ [Read the Philosophy](PHILOSOPHY.md) · [See the Roadmap](ROADMAP.md)

---