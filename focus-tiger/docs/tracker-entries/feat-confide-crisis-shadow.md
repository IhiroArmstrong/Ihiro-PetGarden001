# Tracker fragment · feat/confide-crisis-shadow

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 分支 | 日期 |
|---|---|---|---|---|---|---|---|---|
| Confide 疑似危机改写句影子记录（不改回复） | 纯后端/逻辑 | 仅单元测试覆盖 | 六条 #1044 已知漏接改写句命中候选模式；明确危机句与普通难过句不记；记录只含 `queryHash`、`textLength`、`patternId`、版本和统计用途，不存原文；沿用 `turns.jsonl` 影子记录 7 天自动清理与 5 MiB 上限。运行 `npm run test:smoke`。 | PO 2026-09-30：影子日志先做，只记 hash + 长度 + 模式 id，不存原文，写明保留期限且只用于统计。 | — | — | `feat/confide-crisis-shadow` | 2026-10-01 |
