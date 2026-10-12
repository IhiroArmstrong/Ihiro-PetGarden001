---
id: confide-stage2b-shadow
kind: feature
status: 进行中（影子字段已接 · 待 Electron 人工看 jsonl · 切 live 仍 defer）
updated: 2026-10-12
---

Stage 2b（gray→功能桶）影子：`semantic_shadow_classify` 行加 `stage2bWouldPromote` / `stage2bReason` / `seedSource`。只写日志，不改路由与回复。PO 手打正例用主进程 `FT_CONFIDE_SEED_SOURCE=po_seeded`。

衍生（来源本任务）：按 `seedSource=po_seeded` 统计互异句数 / 意图族 / 误拉 → 见 `confide-stage2b-po-seeded-audit.md`。
