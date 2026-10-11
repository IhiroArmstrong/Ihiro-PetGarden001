# Task Brief · Yin's Collections 可读玻璃卡

> **状态（2026-10-11）**：PO 书面立刻开工。扇叶 Collection 与 ⋯ → Yin's Collections 打开同一张空玻璃卡。
> **对照**：Yin's Art Collection 正常。

## 根因

两入口都调用 `FocusCoinsPanelUI.open()`。宽屏把 `#yin-coin-panel` 拉成 `top`+`bottom` 通高、`GLASS_FILL` 半透明。标题和关闭在内容流顶部，大半张卡是空白浅玻璃；字叠在浅底上对比不足。

## 验收

- 扇叶 Collection 与 ⋯ → Yin's Collections：1 秒内见标题、关闭、可读正文。
- 数据为空时见「这个收藏还没有内容」，不留白。
- 拖动仍走玻璃卡甲板（与 Art Collection 同族）。
- 不改 Art Collection。
