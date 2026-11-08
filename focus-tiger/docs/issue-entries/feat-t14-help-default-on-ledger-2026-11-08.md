---
ledger: R2-lite 后续账本补充（T14 / 9-15 / 向量默认 / T97）
kind: progress
status: 跟进中
updated: 2026-11-08
---

## 本支做了什么

- **T14**：`resolveConfideHelpEntryEnabled` 默认 **on**；`FT_CONFIDE_HELP_ENTRY=off` 仍可关。单测与 `PaidPanelsBackdropDim.test.js` 已对齐。
- 队列：`GLOSSARY.md` · `SCHEDULING_GLOSSARY.md` §1 · `CONFIDE_NOW.md` · `LANGUAGE_SUPPORT.md`。
- **R2L-01**：独立 fix PR（`fix/r2l-01-privacy-t54-refresh` · #1626），本支不重复改代码。

## 账本登记（PO 2026-11-08）

| 项 | 处理 |
|---|---|
| **9-15 / 9-15b** | 云备份 Worker **写入路由**仍在线（前端已关）→ 并行整改 **P2**，见总表新行 · Brief `audit/governance-drafts/2026-11-07-b5-b6-remediation-queue.md` |
| **T14 默认开** | 本 PR 运行时 + 队列文档 |
| **向量模型默认是否下载** | **核实（只读）**：Electron 宽屏 Confide 默认 profile `Qwen3-Embedding-0.6B-Q8_0`（`l0EmbeddingProfiles.test.js`）；首次打开会按需下载，不进 DMG。R2-lite 有向量文件 ≠ 无下载策略。补跑须 **有/无向量** 两配置对比（待 R2L-01 合入后窄复跑） |
| **T97 两周期限** | PO：若 **2026-11-22** 前无危机标注资质人点头，须汇报并决定是否延后第 3 刀 Brief（不写死自动延期） |

## 还剩什么

- `npm run queue:check` / PR CI 绿后合 develop。
- R2L-01 #1626 应先合或与本品栈合并 develop 后跑 V1 补跑。
