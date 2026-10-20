# fix/yin-collections-scroll-washout

| Yin's Collections 打开发白、须滚动才可读 | UI可见 | 待人工测试 | **主路径**：`?product=1` → 扇叶 Collection 或 ⋯ → Yin's Collections。1 秒内标题、余额、器物行对比度可读；列表不得画到玻璃卡圆角外；**不必**先拖滚动条才变清楚。**回流**：关掉再开仍一打开就可读。 | **2026-10-20 用户书面**：打开显示不对，向下拖滚动条才正常；要求先修此项。 | release-blocker | 内层滚动 + 外壳不滚；`FocusCoinsPanelUI.test.js` 契约。 | `#yin-coin-panel` · `[data-testid=yin-coin-panel-scroll]` | 2026-10-20 |
