# AGORA MVP 技术蓝图（v1）

## 1. 目标

在 4-6 周内交付一个可演示、可评估、可迭代的多智能体协同开发系统 MVP：

- 同一任务下，多个代理协作完成代码变更
- 具备最小共享记忆与审查闭环
- 能生成 PR（默认草稿）并保留全链路日志

## 2. 系统边界

### 服务

- `apps/web`: 前端协作终端（任务面板、会话面板、审查面板）
- `apps/api`: 编排 API（会话、任务、代理调度、审批）
- `worker`（后续添加）: 异步执行与工具调用
- `postgres`: 任务与会话主存储
- `redis`: 队列与短期状态

### 外部依赖

- OpenAI / Anthropic / OpenClaw（通过 adapter 统一接入）
- GitHub API（分支、提交、PR、审查评论）

## 3. 核心领域模型

- Workspace: 一个项目工作空间（仓库与策略配置）
- Session: 一次协作会话（例如“修复某个 issue”）
- Task: 可执行任务单元（支持审批与状态流转）
- AgentTurn: 代理一次发言或动作
- Evidence: 产出证据（diff、测试结果、引用）

任务状态机：

- `queued` -> `running` -> `review` -> `completed`
- `running` -> `waiting_approval` -> `running`
- 任意状态 -> `failed` / `canceled`

## 4. API 合同（MVP）

- `GET /health` 健康检查
- `POST /v1/workspaces` 创建工作空间
- `GET /v1/workspaces/{workspace_id}` 查询工作空间
- `POST /v1/sessions` 创建会话
- `GET /v1/sessions/{session_id}` 查询会话
- `POST /v1/tasks` 创建任务
- `GET /v1/tasks/{task_id}` 查询任务
- `POST /v1/tasks/{task_id}/approve` 审批高风险动作
- `POST /v1/tasks/{task_id}/events` 记录任务事件

## 5. 安全与治理（MVP 必做）

- 默认只读策略：高风险动作必须审批
- PR 默认 Draft：不允许自动直推 main
- 最小权限 token：区分读写权限
- 可审计日志：任务、调用、审批、结果全记录

## 6. 成本与可靠性控制

- 模型路由：默认低成本模型，失败升级
- 单任务预算：token 上限 + 重试次数上限
- 幂等重试：任务具备可恢复与重放能力
- 指标最小集：成功率、返工率、平均耗时、平均成本

## 7. Railway 部署原则

- 服务间内网通信，避免公网暴露内部 API
- 持久化数据进入 Postgres（文件系统不作为主存储）
- 配置由环境变量注入，不在仓库存密钥

## 8. 验收标准（MVP）

- 能创建 workspace/session/task 并完整走通状态流
- 至少 1 个真实仓库任务生成 Draft PR
- 任务日志可回放，审批动作可追踪
- 文档齐全，支持新贡献者 30 分钟内跑通本地环境
