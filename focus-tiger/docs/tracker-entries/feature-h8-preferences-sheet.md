# feature/h8-preferences-sheet

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Preferences 子页同一张纸（H8） | UI/交互 | 待人工测试 | **主路径（宽 ≥480 · `?product=1`）**：Idle → ⋯ → Preferences → How Yin may speak 或 Reminder。**0–1 秒**菜单不关，同一张纸出现内容与「返回偏好设置」。点返回回到分组列表。Esc 先回列表，再关菜单。Sound / Help Center / Subscription 仍走现网叠层，不收进这张纸。Support Yin 仍在右上。**窄屏**：抽屉同一返回。**回流**：关菜单再开，再进 Reminder，仍是同一张纸。**自动化**：`preferenceSheetEmbed.test.js` · `WideIdleMoreMenu.test.js` H8 源码锁 · `e2e/wide-idle-more-menu.spec.js` embed。 | — | — | — | `http://127.0.0.1:5173/?product=1` · `#ft-wide-more-menu` · `[data-testid=ft-pref-sheet-back]` | 2026-11-18 |
