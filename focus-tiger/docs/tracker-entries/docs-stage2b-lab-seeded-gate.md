# docs-stage2b-lab-seeded-gate

| Confide Stage 2b 门闩改为 lab_seeded（不要求手打） | 纯文档 + 日志标签 | 仅单元测试覆盖 | **无用户路径。不改回复。** 本条验收的是：抽审 KEEP=19、负例误拉=1 已写入表；新日志 `seedSource=lab_seeded`；旧 `po_seeded` 仍计入审计。**不代表**可以切 Stage 2b live（正例粗分约 3 族，未满 ≥6）。复跑：`cd focus-tiger && npm run audit:stage2b-lab-seeded-gate`。单测：`node --test src/core/confide/confideSemanticStage2b.test.js src/core/confide/auditConfideStage2bPoSeeded.test.js`。 | **2026-10-12 PO**：不要求手打；19 KEEP；第 7 行看不懂留空。 | — | — | `task-confide-stage2-semantic-cutover.md` · `confide-stage2b-negative-control-sheet.md` | 2026-10-12 |
