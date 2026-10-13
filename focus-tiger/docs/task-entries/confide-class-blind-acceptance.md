---
id: confide-class-blind-acceptance
kind: feature
status: holdout 已接线 · 只校验模式待合 · 额度按盲测集版本 · 盲测集仍未封存
updated: 2026-10-13
---

Confide 问答按类验收（R-Confide-Class）。开发集已入库。holdout 真跑：`npm run audit:mood-veto-holdout`（工作区外路径；未封存不得回退开发集）。只校验：`npm run audit:mood-veto-holdout:validate`（不计数、不 embedding）。额度按 `holdout_set_version`。下一步：封存盲测后再跑影子。见 `task-briefs/task-confide-class-blind-acceptance.md`.
