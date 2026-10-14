---
id: confide-class-blind-acceptance
kind: feature
status: holdout 已接线 · 额度按文件+哈希 · 盲测仍须按缺口补句
updated: 2026-10-13
---

Confide 问答按类验收（R-Confide-Class）。情绪开发集已入库。安全开发集已纳入 `audit:confide-acceptance-leak`（只防整句照抄；1 句因与封存盲测完全重复未入库）。holdout 真跑：`npm run audit:mood-veto-holdout`。信封校验：`npm run audit:mood-veto-holdout:validate`（#1213）。缺口计数：`npm run validate:confide-holdout-counts`（#1214）。额度按文件，计数在 `~/Documents/ft-private/`。见 `task-briefs/task-confide-class-blind-acceptance.md`.
