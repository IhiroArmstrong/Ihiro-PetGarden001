---
id: root-cause-hardening
kind: feature
status: 盘点已落 · A22 已合 #1171 · A1 已合 #1173 · A2 已合 #1179 · A3 已合 #1181 · A4 已合 #1184 · A5 本支
updated: 2026-10-13
---

2026-10-09 至 10-11 的修复归为 6 类、19 条根因，对应 22 项根治行动（A1–A22），分五个阶段，一项一个 PR。计划与对照表见 `docs/root-cause-audit-2026-10-12.md`，账本见 `ISSUE_LEDGER.md` 文首七行。A5：husky `pre-push` 跑 `test:e2e:startup`（`__FT_APP_READY__` + 无 pageerror）；仅 `.md`/`.mdc` 可跳过。
