# docs/agent-tool-budget-explore-only

| 探索类工具预算（只计 Grep/Glob/整读大文件） | 纯后端 | 仅单元测试覆盖 | **不是产品功能**。改的是 Cursor Agent hook：探索类才计软/硬上限；`StrReplace` / 定点 Read / git / 约定 smoke 不计次且硬顶不拦。硬顶后只在**同一 Chat**发「继续 <任务>」，禁止 New Agent 续同一任务；新 Chat 只留给 PR 已合或换题。跨模块+单测+PR 用口令「大任务」。自动化：`focus-tiger/scripts/tool-budget-explore.test.js`。 | — | — | `.cursor/hooks/tool_budget.sh` · `session_gate.sh` · `focus-tiger-agent-token-cost.mdc` · `RULES_INDEX` → `agent-tool-budget` | 2026-09-10 |
