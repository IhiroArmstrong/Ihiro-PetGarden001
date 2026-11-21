---
ledger: 打开 Yin's Collections / Art Collection 见一片空白
kind: progress
status: 跟进中
updated: 2026-11-21
---

# fix/collections-glass-fill-readable

## 本支

- `#1831` 把卡根改成 `createGlassCard()` 后，**inline** 默认 `GLASS_FILL`（0.62）盖过 Collections 样式表里的 `GLASS_FILL_STRONG`（0.78），暖米变浅、像发白/空白。
- Yin's Collections：`createGlassCard({ strong: true })`，与现网内层滚动契约对齐。
- Art Collection：同样 `strong: true`；壳 `overflow: hidden`，货架滚 `#art-collection-panel-scroll`（不再在毛玻璃壳上 `overflow: auto`）。
- 单测：未传 `strong: true` / 艺术收藏壳上 `overflow: auto` 会红。

## 仍须

- 人工：两扇门打开即对比度可读；Support 付款入口未改。
- 总表「一片空白」行不改写。
