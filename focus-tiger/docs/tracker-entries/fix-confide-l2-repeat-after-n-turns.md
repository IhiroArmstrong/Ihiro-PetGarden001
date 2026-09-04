# tracker fragment · fix/confide-l2-repeat-after-n-turns

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 备注 | 日期 |
|---|---|---|---|---|---|---|---|---|
| 桌面 L2：第 5–6 句闲聊不得复读首句 generate | UI可见 | 有问题 | **仅 Electron 非低配宽屏。** **主路径**：Idle 宽窗 → Confide ready → 连续 ≥6 次对不上情绪桶的闲聊。第 5–6 句 **不得**再显示第 1 句 generate 全文。允许新 generate 短句，或失败时**另一条** corpus fallback；**连续可见闲聊答句不得字面相同**。自动化：`confideReplyUniqueness.test.js`。 | **2026-08-31 / 2026-09-04**：echo 后换茶句马甲。见主表 L365。 | release-blocker | 与主表 L365 同 | `#confide-to-yin-reply` | 2026-08-31 |
