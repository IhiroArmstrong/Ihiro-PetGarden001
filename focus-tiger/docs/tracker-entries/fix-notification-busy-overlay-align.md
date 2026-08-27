# fix/notification-busy-overlay-align · 2026-08-26

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地路径 / 备注 | 日期 |
|---|---|---|---|---|---|---|---|---|
| 通知 busy 与浮层快照对齐（P1–P4） | UI可见 | 待人工测试 | **主路径**：`?product=1` Idle 设提醒已过时分 → 横幅出 → 开 Compass → 横幅当帧收起。**G2**：RitualFlow / 时长选择器开时横幅不出。**G3/G4**：Honesty prompt / 吹花 Welcome 可见时横幅不出（与茶气泡同级）。**觉察卡**：Focusing 间隔磬后 Compass 开时卡不出。**鹦鹉**：横幅 busy 时不播 `parrotEarVisit`。自动化：`overlaySlotArbitration.test.js`（reminder/awareness 新 case）。 | 分析师：横幅 derive 偏窄假绿；P1–P4 一批 | — | — | `overlaySlotArbitration.js` · `main.js` | 2026-08-26 |
