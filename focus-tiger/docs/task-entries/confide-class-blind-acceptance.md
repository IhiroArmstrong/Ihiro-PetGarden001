---
id: confide-class-blind-acceptance
kind: feature
status: holdout 已接线 · 泄漏扫描仅整句 · 豁免表仅收缩 · 盲测集仍未封存
updated: 2026-10-13
---

Confide 问答按类验收（R-Confide-Class）。开发集已入库。`audit:confide-acceptance-leak` 只防整句照抄；`CONFIDE_MOOD_VETO_LEAK_GRANDFATHERED_LITERALS` 仅收缩。holdout 读口：`npm run audit:mood-veto-holdout`（工作区外路径；未封存不得回退开发集）。下一步：会话 B 生成并封存盲测。见 `task-briefs/task-confide-class-blind-acceptance.md`.
