---
id: pr-smoke-demote-menu-reachability
kind: feature
status: 已完成 · T12 后续 · 2026-11-12
updated: 2026-11-12
---

从 Required `test:pr-smoke` / pre-push 拿掉 `menu-full-reachability`（种类 1 时序不稳；档间未隔离）。nightly、合入 develop 后仍跑。改菜单路径也不再加跑必过关。不改产品代码。
