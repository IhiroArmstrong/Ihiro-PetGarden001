# fix/overlay-three-questions

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 访问路径 | 日期 |
|---|---|---|---|---|---|---|---|---|
| 叠层占用三问接 registry（摸头 / 进睡） | UI可见 | 待人工测试 | **主路径（深夜 / DORMANT）**：关其它弹窗。① 开 Confide：额头点不到摸头；等进睡窗口不应披毯；关 Confide 后摸头恢复，Yin 应已醒（`dormantWake`）。② 开 Support Yin：同样挡摸头、挡进睡；关后恢复。③ 开 Journey Log：挡摸头、挡进睡；关后恢复。**回流**：Sit→Rise 回 Idle 后再开上述叠层，摸头仍应卸武装。Confide / Newsletter 点空白**不得**关（SB-19）。**对照**：Arrival / Honesty duration 摸头与进睡须与改前一致。风险 5–10（Yin Memory、⋯ 菜单、Companion 展开等）本轮不测占用扩展。CI 绿 ≠ 可合入。 | — | — | — | Idle · Confide · Support · Journey Log · `#idle-yin-tap-anchor` | 2026-08-31 |
| Privacy 点空白关 sheet（父卡 hidden） | UI可见 | 待人工测试 | **主路径**：`?product=1` → ? → Privacy。简介卡 hidden、Privacy 可见时点 `document` 空白 / backdrop → **0–1 秒内** sheet+简介关闭。点 sheet 内不关。**回流**：再开 ? → Privacy → Back。**375** 仍可关。 | — | — | — | `?product=1` · `#onboarding-privacy-sheet` | 2026-08-31 |
