# tracker fragment · fix-copy-and-entry-overlay-cancel

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 备注 | 日期 |
|---|---|---|---|---|---|---|---|---|
| Yin's Collections「years of sitting」文案 | UI可见 | 待人工测试 | **主路径（`?product=1`）**：Idle → 宽屏 ⋯ / 窄屏抽屉 **Yin's Collections** → 抬头须见 **sitting together over time**（中文「同坐日久」、日语「日々の同坐」），**不得**再出现 years of sitting / 同坐岁月 / 歳月。仍须同时看到「不能买 / 不可金钱相求」。**回流**：关卡再开文案不变。**375**：两段说明完整可读。 | **2026-08-23 用户书面（图1）**：years of sitting 会吓坏用户。 | — | — | `#yin-coin-panel` · `YIN_COIN_NOT_FOR_SALE` | 2026-08-23 |
| 录入叠层点空白不关 + Stay in touch Cancel | UI可见 | 待人工测试 | **主路径**：Idle → ⋯ / 抽屉 **Stay in touch** → 在 Email 打几个字 → **点卡外空白**：**0–1 秒内卡仍在、字还在**（**SB-19**，不是哑点击失败）。左下 **Cancel** 与右下 **Close** 均可关卡并丢掉未提交内容。Esc 仍可关。提交成功后 Cancel 隐藏、只留 Close。**邻接录入**：Journey 打开备份面板后点空白不得整卡消失；请茶 / Sanctuary 邮箱；Membership **Restore** 遮罩；Confide 左下 Cancel。**不含**：Arrival Notice/Choose、Companion、Honesty 选择格仍可点空白取消。**回流**：关后再开邮箱是空的。**375**：Cancel/Close 均可点。 | **2026-08-23 用户书面（图2）**：录入框点空白整卡消失等于白录入；要国际惯例 Cancel。 | — | — | `#newsletter-capture-card` · `[data-testid=newsletter-capture-cancel]` | 2026-08-23 |
