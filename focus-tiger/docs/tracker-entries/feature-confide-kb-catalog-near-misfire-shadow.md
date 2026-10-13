# feature/confide-kb-catalog-near-misfire-shadow

| Confide 目录近邻误命中 · 第一段影子日志 + 实验室 | 仅单元测试覆盖 | 待人工测试 | 不改用户可见回复。单测 `node --test src/core/confide/confideKbCatalogNearReview.test.js`。实验室 `node desktop/scripts/l0-kb-catalog-near-review-lab.js`（真 embedding；结果在 `/tmp/ft-l0-lab/kb-catalog-near-review-lab-*.json`）。可选人工：桌面版倾诉发一句会命中短答的话，看 `turns.jsonl` 末尾有 `kb_catalog_near_review_shadow` 且无原文，短答正文与改前相同。 | — | — | — | `confideKbCatalogNearReview.js` · `task-confide-kb-catalog-near-misfire.md` | 2026-10-13 |
