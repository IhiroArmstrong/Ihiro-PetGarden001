---
id: confide-stage2b-po-seeded-audit
kind: feature
status: 进行中（审计脚本已接 · 切 live 仍 defer）
updated: 2026-10-12
---

Stage 2b 门闩审计：`npm run audit:stage2b-po-seeded-gate` 数 `seedSource=po_seeded` 互异句、意图族（需 `--families` TSV）、误拉（与负例表求交且 `wouldPromote`）。不改回复，不得打印「可以切 live」。字面预览：`--preview-literal`。
