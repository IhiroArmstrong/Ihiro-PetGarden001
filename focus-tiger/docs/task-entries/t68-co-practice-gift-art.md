---
id: t68-co-practice-gift-art
kind: feature
status: 已合 develop · 出卡开关开 · 批量手测排队 · 可选
updated: 2026-11-15
---

T68 共修纪念画发放。**#1490** 已合 `origin/develop`（运行时，当时开关关）。本支 **开关开**（独立小 PR）。闸 4 仅第 1 档生效；第 2、3 档仍 provisional。

手测：**并入下一批批量验收**（tracker 仍「待人工测试」）。5173 QA 树须 `npm run sync:qa-develop` 后按脚本 **restart** 行重启 Vite。

2a DEV（仅 DEV）：`window.__coPracticeGiftArtJoinFourScenes()` · `window.__coPracticeJoinLedgerSummary()` · 预览 `window.__coPracticeGiftArtPreviewCard()`（不写账）。
