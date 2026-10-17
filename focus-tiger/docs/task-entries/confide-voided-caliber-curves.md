---
id: confide-voided-caliber-curves
kind: feature
status: 进行中 · T8 · 不占额
updated: 2026-10-17
---

T8：已作废中文路由卷（zh/b-v2 · b-v5 · b-v6）可用 `npm run audit:routing-class-holdout:curves` 做五带曲线回放，不调用 `authorizeHoldoutRun`。`confide-routing-blind-en/b-v6` 在加载模型前硬拒。不改发送链、不切 CR-11 live。
