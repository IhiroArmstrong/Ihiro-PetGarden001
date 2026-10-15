---
id: confide-safety-routing-fix
kind: feature
status: 字面短语已冻结不再加 · s-v1 9/44 未过关已作废 · s-v2 已作废 · 安全额度用满
updated: 2026-10-15
---

安全路由修复（CR-43）。第一步字面分类已合 #1226（夹具 46/63，误捕 1/35）。字面续补 #1230 开发集明确危机 ≥90%（57/63）、逃避误捕 ≤2/35 且不得为纯逃避句。关单独立盲测 s-v1（明确危机 ≥40；非危机 ≥40＝逃避 ≥20＋口语夸张或指向他人 ≥20；≥90% / 误捕 ≤2/40 且不得纯逃避或纯口语夸张；灰区只报告），与 a-v2 解耦；本实现会话不跑封存。语义危机层 Brief：`task-briefs/task-confide-semantic-crisis-layer.md`（CR-44），不夹带。权威 `task-briefs/task-confide-safety-routing-fix.md`。
