# fix/handtest-ticket-2-click-visible

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| 单 2 点了必须看见（11/27 原话 1、4、11、21） | UI/交互 | 待人工测试 | **主路径（宽 ≥480 · `?product=1`）**：Idle 记忆轨进收藏，1 秒内见标题和列表，不是空框。点 Inspiration 只出一层名单、侧栏扇面不可见。⋯ → Daily noticing 写一句点 Continue，见收束句，不见静坐 Pause。有圈时 Rise 留痕迹点一项：成功关窗或见失败原因。**回流**：关收藏再开。**自动化**：`e2e/handtest-ticket-2-click-visible.spec.js` · `focusCircleWitness.test.js` · `FocusCircleWitnessLeaveUI.test.js` · `WideIdleMoreMenu.test.js` · `inSurfaceClickContract.test.js`。 | 11/27 手测原话（见 issue-entries/docs-handtest-2026-11-27-ledger.md 单 2） | — | — | `http://127.0.0.1:5173/?product=1` · `#yin-coin-panel` · `[data-testid=ft-home-preview-inspiration]` · `[data-testid=daily-noticing-continue]` · `[data-testid=focus-circle-witness-picker]` | 2026-11-28 |
