# feature/confide-verbal-hint-chips

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Confide 口头金句芯片（首发仅 Forget this） | UI可见 | 待人工测试 | **Electron 宽屏**：Idle → Confide → **0–1 秒内** `[data-testid=confide-to-yin-verbal-chips]` 见引导句 + **仅一条**芯片（en：`Forget this`）。点芯片 → **0–1 秒内** textarea 填入该句、**不**自动发送；再 Share 才走 suppress。无上一 turn 记忆时诚实短句即可。**负例**：不得见 Don't save / How long have I practiced? / 两周情绪芯片。**Web/375**：无芯片条。自动化：`confideVerbalHintChips.test.js` · `desktopCompanionL2Route.test.js`（接线）。 | — | — | — | `desktop:dev` · AE Electron L1 步 1 | 2026-09-01 |
