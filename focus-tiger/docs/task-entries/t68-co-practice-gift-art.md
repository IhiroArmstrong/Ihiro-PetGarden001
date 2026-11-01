---
id: t68-co-practice-gift-art
kind: feature
status: 已合 develop · 出卡开关关 · 批量手测排队 · 可选
updated: 2026-11-01
---

T68 共修纪念画发放。**#1490** 已合 `origin/develop`（`3eb2cd4`）；合入后另有 **#1491** 线文档与 `a1c687b0` 玻璃卡 deck 门禁（surface 关时不进叠层拖拽名单）。

闸 4 仅第 1 档生效。**出卡开关仍关**；打开开关须**独立小 PR**（文案/图/QA 预览点头后，不在本线顺手翻）。

手测：**并入下一批批量验收**（tracker 仍「待人工测试」）。5173 QA 树须 `npm run sync:qa-develop` 后按脚本 **restart** 行重启 Vite。

2a DEV（仅 DEV）：`window.__coPracticeGiftArtJoinFourScenes()` · `window.__coPracticeJoinLedgerSummary()` · 预览 `window.__coPracticeGiftArtPreviewCard()`（不写账）。
