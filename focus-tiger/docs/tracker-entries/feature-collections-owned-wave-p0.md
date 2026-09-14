# tracker-entries · feature/collections-owned-wave-p0

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 锚点 | 日期 |
|---|---|---|---|---|---|---|---|---|
| Collections P0 · 挥手 blur 渐退 | UI可见 | 待人工测试 | **主路径**：`?product=1` → Idle → Yin's Collections → 底栏 **请阿寅挥挥手**。≥480 宽屏：**0–1s** 遮罩 blur 渐退，阿寅 `wave-hello` 在面板左侧中线可见；播完遮罩恢复。**375** 短底栏：挥手仍可见、不挡头顶。**回流**：播完再点可再挥；关面板再开遮罩正常。**Focusing** 中：toast「阿寅正在坐着…」，无 blur 渐退。自动化：`overlayBackdrop` wave-focus class + `main.js` acquire/release 契约。 | — | — | — | `?product=1` · `#yin-coin-panel-backdrop` · `data-testid=yin-coin-wave-play` | 2026-09-13 |
| Collections P0 · 已结缘分组卡片 | UI可见 | 待人工测试 | **主路径**：`?product=1` → Collections；已有结缘 SKU 时见 **案上陪伴** 分区（暖底 + 朱印「已结缘」+ 小字枚数纪念）；未结缘见 **静候结缘** 分区（stone 色点 + 结缘钮 + 缺口句）。**无结缘**：只显示静候分区。**locale**：en/zh/ja 分区标题随语言切换。**回流**：结缘后行移入案上分区；再开面板分组仍正确。自动化：`focusCoinsSurface.test.js` sections + `FocusCoinsPanelUI.test.js` 分区契约。 | — | — | — | `?product=1` · `#yin-coin-panel` · `data-testid=yin-coin-section-*` | 2026-09-13 |
