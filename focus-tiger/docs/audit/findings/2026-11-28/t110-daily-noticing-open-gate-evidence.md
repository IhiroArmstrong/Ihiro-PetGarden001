# T110 Daily Noticing · 首包四闸登记（止损 2026-12-03）

**日期**：2026-11-28  
**性质**：验收登记 + 自动化证据指针；**不**改 `src/` 句库。  
**Brief SSOT**：[task-t110-daily-noticing.md](../../task-briefs/task-t110-daily-noticing.md) §8–§11。  
**门禁 SSOT**：[first-package-open-gate-v2.md](../first-package-open-gate-v2.md)。

---

## 闸位摘要

| 闸 | T110 映射 | 证据 / 状态 |
|---|---|---|
| **G1** | 发布构建 Daily Noticing 不走生成 | [`GENERATION_SURFACES.md`](../../GENERATION_SURFACES.md) 行 `daily-noticing` · fixed-copy；`npm run test:smoke` 内 `check-generation-gate` |
| **G2** | 危机句 → 同卡求助锚点 | #1911：`e2e/daily-noticing-menu.spec.js` 危机用例；Layer0 接现网 `resolveConfideReply` |
| **G3** | 问句 + 收束过 outputGate | `src/core/dailyNoticing/dailyNoticingLineGate.test.js`（en/zh/ja × Q1–Q4 + CLOSE 1–3） |
| **G4** | 两份独立审稿 | [语气审](./daily-noticing-g4-tone-review.md) · [安全审](./daily-noticing-g4-security-review.md) — **待 PO 签字** |

**运行时**：#1907 已合 develop。#1911 补危机 + G2 e2e。本旁支：375 窄屏 e2e + G4 登记壳。

---

## PR 描述贴行模板（实现会话复用）

```text
T110 四闸：G1 release-no-generate=ok（GENERATION_SURFACES daily-noticing）；G2 e2e crisis+help；G3 dailyNoticingLineGate.test.js 绿；G4 待 PO 双签。
```