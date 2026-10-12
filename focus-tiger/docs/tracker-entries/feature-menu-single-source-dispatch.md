# feature/menu-single-source-dispatch

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| A2 菜单接线单一来源（查表分派） | UI可见 | 待人工测试 | 接线改查表，外观不变。宽屏 ⋯ 与窄屏抽屉各点：Honesty、会员、Art Collection、锁定仪式行（应禁用）、账号占位（应禁用）。对应面板仍出现；会员只开会员卡、不进 Stripe。Confide 默认 `?product=1` 仍不出现。自动化：`idleChromeOrchestration.test.js` 目录每个可点 proxy 有 handler；锁定/占位不调用。A1 全量可达 e2e 交 CI。 | — | — | — | `src/core/idleChromeOrchestration.js` · `WideIdleMoreMenu.js` · `NarrowIdleShell.js` | 2026-10-13 |
