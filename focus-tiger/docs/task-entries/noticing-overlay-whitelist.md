---
id: noticing-overlay-whitelist
kind: feature
status: 旁支实现中 · 觉察一句 overlay 改白名单 + 逐路由表
updated: 2026-11-23
---

不重开专用池、不重写十题夹具。#1828/#1836/#1842 已合。本支只把 `shouldUseNoticingFixedLine` 从默认放行改成显式白名单，并用表锁住每条 `CONFIDE_ROUTE`。`safety_care` 仍在名单内；伤害他人仍不在。未知路由默认不进觉察 A/B。
