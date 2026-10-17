---
id: pr-smoke-demote-menu-reachability
kind: feature
status: 进行中 · T12
updated: 2026-10-17
---

从每个 PR 的必跑 `test:e2e:smoke` 拿掉 `menu-full-reachability`（种类 1 时序不稳）。nightly、合入 develop 后、以及改菜单路径的 PR 仍跑。不改产品代码。
