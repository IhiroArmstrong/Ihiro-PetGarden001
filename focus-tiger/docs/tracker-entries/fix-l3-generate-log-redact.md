| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 相关文件 | 完成日期 |
|---|---|---|---|---|---|---|---|---|
| L3 generate 本地日志不得留用户原句 | 仅单元测试覆盖 | 待人工测试 | 终端：`node --test src/core/confide/confideL3GenerateTurnLog.test.js` 与 `npm run test:smoke`。无新界面。可选：一次练习结束陪伴一句后打开本机 `companion-l2/turns.jsonl`，确认 `l3_generate` 行无用户原文、有 `queryHash` 与 `textLength`。 | 2026-11-24 只读审计缺口 1 | — | 本 PR 对齐语义危机日志口径 | `l3GenerateTurnLog.js` · `l1Runtime.js` | 2026-11-24 |
