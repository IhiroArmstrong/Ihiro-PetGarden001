# fix/pref-sheet-embed-back

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| 单 1 设置壳（11/27 原话 14–16、18–20、22–23、26） | UI/交互 | 待人工测试 | **主路径（宽 ≥480 · `?product=1`）**：Idle → ⋯ → Preferences。列表能拖、能滚到最后一行。进 How Yin may speak：同一张纸、左箭头返回、无大片空白叠字标题。点返回只关子页。子页再点侧栏 Preferences 或标题回到列表。心念流行不可见。Presence Field 打开不叠在菜单外。网页无「打字节奏」行。Save this journey：返回后子页消失。**窄屏**：抽屉同一返回。**回流**：关菜单再开再进 Reminder。**自动化**：`preferenceSheetEmbed.test.js` · `idleChromeOrchestration.test.js` nebula hide · `WideIdleMoreMenu.test.js` 标题/侧栏退出。 | 11/27 手测原话（见 issue-entries/docs-handtest-2026-11-27-ledger.md 单 1） | — | — | `http://127.0.0.1:5173/?product=1` · `#ft-wide-more-menu` · `[data-testid=ft-pref-sheet-back]` | 2026-11-28 |
