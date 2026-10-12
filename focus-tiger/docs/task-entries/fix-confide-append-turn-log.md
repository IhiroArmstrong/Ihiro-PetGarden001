---
id: confide-append-turn-log
kind: feature
status: 旁支待合
updated: 2026-10-12
---

Renderer `appendTurnLog` 接到 preload + `desktop:companion-append-turn-log`。白名单仅 `kb_retrieval_miss` / `crisis_paraphrase_shadow`，写入前剥掉 `text`。不改用户可见回复。
