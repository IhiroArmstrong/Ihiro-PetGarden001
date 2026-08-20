# fix/sprite-channel-arbitration · 2026-08-20

| 精灵占用仲裁层（睡 / 欢迎 / 付款回跳） | UI可见 | 待人工测试 | **冷启动**：白天硬刷新须 Idle 或欢迎/吹花，不得凭陈旧 2h 戳开场即睡。凌晨 2 点冷启动可披毯（与 wellness 0–6 对齐）。**回前台**：Welcome 后短切 tab（&lt;2h）仍不得披毯（#341 吸收）。Reflection / Arrival 开着时切走 ≥2h 再回 **不得** cloak（叠层否决）。凌晨 2 点切走 ≥2h 再回：无叠层时可睡（与冷启动对齐）。**付款**：Stripe 回跳致谢须压过深夜披毯，不得先看到睡着再谢谢。**会话结束**：Rise / 达标进 Reflection 仍醒着（#347 吸收）。**回流**：关 Reflection 后再验 Idle 点额头仍可武装。 | — | — | — | `http://127.0.0.1:5173/?product=1`（本分支 worktree，非 QA 5173） | 2026-08-20 |
