# docs/agent-tool-budget-explore-only

| 探索类工具预算（#700 后补漏） | 纯后端 | 仅单元测试覆盖 | **不是产品功能**。探索类计软/硬上限；`Read` 计次对齐 `source-read-granularity`（200/400；大 `limit` 仍计）；连续 8 次探索无改文件先软停；软/硬顶与交接模板强制**探索快照**；「大任务」开工须先列预期文件/函数清单。硬顶后只在**同一 Chat**发「继续 <任务>」。自动化：`focus-tiger/scripts/tool-budget-explore.test.js`。 | — | — | `.cursor/hooks/tool_budget.sh` · `session_gate.sh` · `lib_common.sh` · `config.json` · `focus-tiger-agent-token-cost.mdc` · `focus-tiger-session-handoff.mdc` | 2026-09-10 |
