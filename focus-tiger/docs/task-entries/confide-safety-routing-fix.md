---
id: confide-safety-routing-fix
kind: feature
status: Brief 已修订 · 待 PO 点头 · 禁止写运行时
updated: 2026-10-14
---

安全路由修复（CR-43）。只修字面分类，不调否决 margin、不用 #1188 遮漏接。开发集分母 64、基线 16/64；门槛明确危机 ≥90%、逃避误捕 ≤2/35 且不得为纯逃避句。关单独立盲测 s-v1（≥40 / ≥20，≥90% / ≤2/20），与 a-v2 解耦。每个盲测文件只跑一次；每个 Brief 版本最多 2 个过关文件。语义危机层另定。权威 `task-briefs/task-confide-safety-routing-fix.md`。
