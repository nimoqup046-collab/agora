# AGORA

> 集体智能终端（Collective Intelligence Terminal）  
> 让 Codex、Claude、OpenClaw 等顶级 Agent 在同一工作空间协同攻坚，而不是各自单打独斗。

> **“在最初的 Agora 广场上，苏格拉底追问：什么是真理？什么是知识？**  
> **他从不独自求解，而是召集所有愿意思考的心智，**  
> **在辩论、挑战与碰撞中，让智慧涌现。”**

```text
AGORA 不是一个聊天机器人，也不是一个 CLI 包装器。
它不只是“另一个 AI 助手”。

AGORA 旨在成为文明级的集体智能基座：
让 Claude、Codex 与其他顶级智能体形成“活的议会”，
共享记忆、共进策略、交叉审查代码，
并协同攻克科学与工程中的硬核难题。

不是工具的堆叠，而是一起思考的心智。
```

[![License: MIT](https://img.shields.io/badge/License-MIT-1f2937.svg?style=for-the-badge)](LICENSE)
[![Status: Alpha](https://img.shields.io/badge/Status-Alpha-f59e0b.svg?style=for-the-badge)]()
[![Deploy on Railway](https://img.shields.io/badge/Deploy-Railway-0b0d0e.svg?style=for-the-badge&logo=railway)](https://railway.app)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-10b981.svg?style=for-the-badge)]()

## 项目定位

AGORA 不是“模型切换器”，也不是“多标签聊天机器人”。

AGORA 要构建的是一个可持续演化的多智能体协作系统：

- 多 Agent 共享任务上下文与长期记忆
- 多 Agent 互相审查代码、提出改进并落地 PR
- 多 Agent 通过结构化群聊达成共识或保留分歧
- 多 Agent 将高价值经验沉淀为可复用策略

目标是让“群体智能”真正用于硬问题攻坚：复杂工程系统、跨学科科研问题、长期演进项目。

## 为什么要做 AGORA

传统工作流常见痛点：

- 模型间上下文割裂，知识无法复用
- 每轮协作都像“重开局”
- 代码审查常停留在建议层，难以自动执行到 PR
- 缺少多 Agent 间的决策记录与可追溯机制

AGORA 希望解决的核心问题：

- 从“单智能体问答”升级为“多智能体共创”
- 从“即时回复”升级为“长期记忆 + 策略进化”
- 从“人肉串联工具”升级为“系统化协同编排”

## 核心能力（规划中）

### 1) Agent Council（协同议会）
- 支持 Codex、Claude、OpenClaw 等 Agent 并行参与同一任务
- 支持角色分工（架构师、实现者、审查者、仲裁者）
- 支持冲突检测与多轮协商

### 2) Shared Memory Fabric（共享记忆层）
- 短期记忆：会话态与执行态缓存
- 长期记忆：任务档案、经验规则、失败模式
- 语义检索：按任务场景回放有效策略

### 3) PR Automation（工程闭环）
- 自动生成任务分解与执行计划
- 自动创建分支、提交、PR、审查意见
- 自动回流审查结论到记忆层

### 4) Evolution Engine（策略进化）
- 评估 Agent 协作质量（速度、正确率、返工率）
- 沉淀高收益策略模板
- 让系统在长期运行中逐步变强

### 5) GUI Terminal（图形化终端）
- 面向真实生产协作，而非演示型聊天界面
- 提供任务面板、群聊面板、代码审查面板、记忆面板
- 提供全链路可观测与可追踪记录

## 技术架构（建议方向）

```text
Web GUI (Next.js)
  -> Orchestrator API (FastAPI / Node)
     -> Agent Adapters (Codex / Claude / OpenClaw / ...)
     -> Memory Layer (Redis + Postgres/pgvector + Graph DB optional)
     -> Execution & PR Layer (Sandbox Runner + Git Provider APIs)
     -> Observability (OpenTelemetry + Logs + Traces + Metrics)
```

## Railway 部署思路（建议）

- `apps/web`：前端 GUI（Next.js）
- `apps/api`：编排与网关服务（FastAPI/Node）
- `worker`：异步任务执行（队列消费者）
- `redis`：任务队列与短期状态
- `postgres`：核心数据与向量检索（可先单库）

首期建议保持“4 服务以内”，先验证协同效果，再做细拆分。

## 目录结构

```text
agora/
├─ apps/
│  ├─ web/                # 前端 GUI（Next.js）
│  └─ api/                # API 网关与编排层
├─ packages/
│  ├─ adapter/            # 各模型与Agent接入层
│  ├─ orchestrator/       # 多智能体任务编排
│  ├─ memory/             # 共享记忆层
│  └─ evolution/          # 策略进化引擎
├─ infra/
│  ├─ railway/            # Railway 配置
│  └─ docker/             # 本地开发与联调
└─ docs/
   ├─ architecture/       # 架构设计文档
   ├─ product/            # 产品方案与需求
   └─ research/           # 调研与评估报告
```

## 快速开始（占位）

```bash
git clone https://github.com/nimoqup046-collab/agora.git
cd agora

# 依赖安装（示例）
pnpm install

# 启动（示例）
pnpm dev
```

> 当前仓库处于早期阶段，模块会持续补齐与演化。

## 路线图（简版）

- Phase 0：问题定义与可行性验证（竞品/技术/价值）
- Phase 1：MVP（2-3 个 Agent 协作 + PR 闭环）
- Phase 2：共享记忆与策略进化
- Phase 3：多场景扩展（科研、复杂工程、长期自治任务）

## 贡献

欢迎参与：

- 产品定义与系统架构
- 多 Agent 协作协议设计
- 代码执行沙箱与安全治理
- 前端协同工作台设计

详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 许可协议

MIT License.

## 下一步执行文档（Phase 0）

- 可行性与市场评估：`docs/research/2026-03-23-feasibility-and-market.md`
- MVP 技术蓝图：`docs/architecture/mvp-blueprint-v1.md`
- 模块与里程碑：`docs/product/mvp-modules-and-milestones.md`
