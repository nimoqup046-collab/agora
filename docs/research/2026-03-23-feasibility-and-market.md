# AGORA 可行性与市场评估（2026-03-23）

## 结论摘要

AGORA 项目可行，但难点不是“模型能力不够”，而是“系统工程复杂度高”。
在 2026 年，Codex、Claude、OpenClaw 及相关基础设施已具备落地多智能体协同开发的条件，关键在于：

- 编排一致性：多模型多代理的任务状态与上下文一致性
- 安全治理：执行权限、沙箱、PR 合并护栏
- 成本可控：并行代理引发的 token 与工具调用放大
- 可靠性：长任务稳定性、失败恢复与可观测性

## 竞品与可借鉴方向

高相关开源项目（按“相似度 + 落地性 + 活跃度”综合观察）：

1. OpenHands: https://github.com/OpenHands/OpenHands
2. SWE-agent: https://github.com/SWE-agent/SWE-agent
3. MetaGPT: https://github.com/FoundationAgents/MetaGPT
4. ChatDev: https://github.com/OpenBMB/ChatDev
5. AutoGen: https://github.com/microsoft/autogen
6. CrewAI: https://github.com/crewAIInc/crewAI
7. LangGraph: https://github.com/langchain-ai/langgraph
8. PR-Agent: https://github.com/qodo-ai/pr-agent

可借鉴架构模式：

- 编排层与执行层分离（Orchestrator 与 Tool Runner 解耦）
- 分层记忆（热状态/会话事实/语义检索）
- PR 作为一等对象（Issue -> Plan -> Patch -> Test -> PR -> Review -> Merge）

## 市场信号与叙事风险

市场信号（强）：

- 多代理协同 coding 与自动 PR 审查已成主流讨论主题
- 终端/CLI 协作范式热度持续上升
- 企业侧对“可审计、可回滚、可预算”的要求显著增强

叙事风险（需规避）：

- “代理越多越强”的误导
- 只追 benchmark 不做生产治理
- 自动审查替代人工决策的过度承诺

## Go / No-Go 判定标准（MVP）

### Go 条件

- 20 个真实任务样本中，端到端成功率 >= 55%
- 相比单代理基线，平均返工率下降 >= 20%
- 单任务成本在预算上限内（含失败重试）
- 全流程可追溯（任务、工具调用、PR、审查日志）

### No-Go 条件

- 成本失控且无法通过路由策略收敛
- 安全边界无法确保（高风险动作无可靠审批链）
- 长任务稳定性不足（频繁中断且不可恢复）

## 推荐下一步

1. 先实现 4 服务 MVP（web/api/worker/redis+postgres）
2. 仅开放受控写入 + 草稿 PR，禁用高风险自动合并
3. 先跑“真实任务小样本验证”，再扩展多学科场景
