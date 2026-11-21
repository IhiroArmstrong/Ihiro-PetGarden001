# 分支名 fix/collections-glass-fill-readable

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| 收藏屏玻璃不再发白/空白 | UI可见 | 待人工测试 | **终端已覆盖**：工厂卡根须 `strong: true`（0.78 暖米，不被 inline 0.62 盖掉）；艺术收藏内层滚动、壳 `overflow: hidden`。`FocusCoinsPanelUI.test.js` · `ArtCollectionPanelUI.test.js`。**人只补**：`?product=1` → 扇叶或 ⋯ → Yin's Collections：1 秒内见标题、关闭、可读正文（空态「这个收藏还没有内容」不是白屏）。⋯ → Art Collection：标题与关闭钉在壳上，货架可滚、字不发白。回流：关再开仍可读。对照：Support 三卡外观与 Subscribe 可点不变。 | 账本 2026-10-11「一片空白」+ 2026-10-20 发白；#1831 工厂默认 0.62 盖住 Collections 的 STRONG。 | — | — | `http://127.0.0.1:5173/?product=1` · `#yin-coin-panel` · `#art-collection-panel` | 2026-11-21 |
