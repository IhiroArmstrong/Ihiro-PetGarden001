---
ledger: 觉察 overlay 用黑名单默认放行，#1828 夹带踢掉 safety_care，CI 没拦
kind: progress
status: 跟进中
updated: 2026-11-23
---

手测发现、门禁没抓到：#1828 把 `safety_care` 一并踢出觉察 overlay。#1836 已把产品语义裁回。本支不重做 1828。

根因：`shouldUseNoticingFixedLine` 默认 `true`、少数 opt-out；没有「每条 classify 路由必须点名 on/off」的表；文档曾把「#1828 不合」当成真相。

本支闸：白名单 + 表必须覆盖 `Object.values(CONFIDE_ROUTE)`；未知 id / `generate` 默认 false。
