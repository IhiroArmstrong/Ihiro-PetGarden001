# feature/d2-presence-quiet-object

| D.2 Presence 纸感侧停 | UI可见 | 待人工测试 | **宽屏 ≥480**：⋯ → Presence moments → `#presence-signals-panel` 靠右停靠、纸感实色卡；行默认 `Today · 时间`；点行头展开精确时间；`···` → Remove 删除（Reflection 联动不变）。**窄屏 ≤479**：底栏抽屉同入口，短底面板。**回流**：删一行后列表刷新；关面板再开仍侧停。自动化：`presenceHumanTime.test.js` + `PresenceSignalsPanelUI.test.js`（纸感/overflow/人时）。 | — | — | — | `#presence-signals-panel` · `/?product=1` · Safari 宽/窄 | 2026-09-13 |
