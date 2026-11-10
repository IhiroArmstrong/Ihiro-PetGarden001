---
id: t93-email-sign-in-d2
kind: note
status: D2 实现旁支 feature/t93-email-sign-in-d2 · Worker 默认允许发验证码 · 未部署 · 菜单登录仍灰
updated: 2026-11-10
---

T93 第二刀：Worker 去掉写死 410，改成环境旗标。缺省允许发码；审计可设 `PRACTICE_BACKUP_WRITES_DISABLED=true` 保持关闭。客户端仍关云闸，菜单登录仍不可点。本刀不部署生产 Worker。
