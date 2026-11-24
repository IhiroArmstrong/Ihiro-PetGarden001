---
id: fix-l3-generate-log-redact
kind: feature
status: 只读审计缺口 1 · L3 generate 日志去原句
updated: 2026-11-24
---

桌面 `l3_generate` 写入 `turns.jsonl` 前去掉用户原句，与语义危机日志同一口径（`queryHash` + `textLength`）。缺口 3 / 缺口 2 另 PR。
