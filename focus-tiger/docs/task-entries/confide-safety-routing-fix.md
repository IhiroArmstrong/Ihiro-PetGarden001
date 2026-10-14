---
id: confide-safety-routing-fix
kind: feature
status: 第一步实现中（字面分类 + 中文邻接否定）
updated: 2026-10-14
---

安全路由修复（CR-43）。只修字面分类，不调否决 margin、不用 #1188 遮漏接。开发集分母 64、基线 16/64。本步逃避误捕 ≤2/35 且不得为纯逃避句；明确危机通过率如实报告（≥90% 为第一步加第二步总门槛，在 s-v1 上最终判）。关单独立盲测 s-v1。语义危机层另定。权威 `task-briefs/task-confide-safety-routing-fix.md`。
