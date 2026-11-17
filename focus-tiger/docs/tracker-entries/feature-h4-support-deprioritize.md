# feature/h4-support-deprioritize

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| H4 Support 默认小标（功能不删） | UI/交互 | 待人工测试 | **主路径**：`?product=1` Idle 右上 `#yin-support-fab` 默认只见头像小标，不见完整「Support Yin」药丸。悬停或 Tab 到钮 → 0–1 秒见完整药丸。点下去仍开 `#yin-support-modal` 三卡。Focusing 时 FAB 仍隐藏。**对照**：不把 Support 放进 ⋯。**自动化**：`SupportYinModalUI.test.js` H4 源码锁；`npm run test:payment-contract`。 | — | — | — | `http://127.0.0.1:5173/?product=1` · `#yin-support-fab` · `#yin-support-modal` | 2026-11-18 |
