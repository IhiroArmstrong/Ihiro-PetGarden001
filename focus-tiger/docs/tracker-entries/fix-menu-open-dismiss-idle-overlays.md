| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 分支/备注 | 日期 |
|---|---|---|---|---|---|---|---|---|
| 菜单打开时收起 Idle 下层选择格（#773） | UI可见 | 待人工测试 | **宽屏 Electron 5173**：Idle → 展开 Companion 三选（いま・ここ / オフライン / フロー）→ 点 ⋯ → **0–1 秒内**三选须收起，菜单正常打开。**回流**：关菜单后再开三选仍可用。**窄屏**：同样路径用抽屉抓手。**不闪没**：菜单里开 Quiet Line / Wallpapers 金句卡 → 卡须保持（growth 门闩）。**不测**：Confide/Privacy SB-19 卡不被误关。自动化：`WideIdleMoreMenu.test.js` · `NarrowIdleShell.test.js` openMenu/openSheet 契约。 | — | — | — | `fix/menu-open-dismiss-idle-overlays` · #773 | 2026-09-15 |
