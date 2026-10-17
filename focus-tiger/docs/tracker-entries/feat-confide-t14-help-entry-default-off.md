# TEST_TRACKER row · T14 Confide 支持入口（默认关）

| 功能 | 类型 | 状态 | 测试步骤 / 自动化 | 用户反馈 | 严重度 | 处理承诺 | 锚点 | 更新 |
|---|---|---|---|---|---|---|---|---|
| Confide 倾诉卡常驻帮助入口（CR-46 P3 · T14） | UI可见 | 待人工测试 | **终端已覆盖**：`resolveConfideHelpEntryEnabled` 默认 off、`FT_CONFIDE_HELP_ENTRY=on` 才显示；`confideHelpEntry.test.js`；`PaidPanelsBackdropDim.test.js`（默认隐藏 + on 时卡内展开、无 `#yin-support-modal`）。**人只补**：Electron 宽屏、不设变量 → 打开 Confide 卡应**看不到**帮助链；本机设 `FT_CONFIDE_HELP_ENTRY=on` 重启 → 点链 0–1s 内卡内见 crisis 指引、草稿仍在；右上 Support FAB 不变。措辞仍为占位，等 10/20 专业复核。 | — | — | — | `confideHelpEntryGate.js` · `ConfideToYinUI.js` · `task-confide-tiered-response-support-entry.md` | 2026-10-18 |
