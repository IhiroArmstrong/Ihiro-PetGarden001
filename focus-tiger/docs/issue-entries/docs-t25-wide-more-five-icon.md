---
ledger: Electron 测扇形菜单仍只有三个图标，疑未实现近期五组扇形
kind: note
status: 入口已确认 · Brief 已点头
updated: 2026-10-21
---

用户 2026-10-20 书面确认：底栏 ⋯ 点开应是五个组图标，目前是老式菜单。不是指南针三叶。

根因：#1307 五组已合；`shouldDegenerateWideMenuRadial` 与 `#sprite-stage` 整块 AABB 相交则退化。该层约占视口中部大盒，普通桌面窗几乎总命中 → 直接出手风琴列表。

改正规格：[`task-briefs/task-wide-more-five-icon-show.md`](../task-briefs/task-wide-more-five-icon-show.md)（T25 · P1 · 2026-10-21 已点头）。实现另 Chat，本条不改 `src/`。
