# feature/h3-home-memorabilia

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| H3 首页纪念物一件+件数+进收藏 | UI/交互 | 待人工测试 | **主路径（宽 ≥480 · `?product=1`）**：Idle 右栏「阿寅与记忆」上方有最近一件（空收藏无图）、件数、「进入收藏」。点进入 **0–1 秒**见 `#yin-coin-panel`。无一排徽章。Support Yin 仍在右上。⋯ 打开时整栏仍隐藏。**自动化**：`homeMemorabiliaPreview.test.js`；`HomeMemorabiliaSlotUI.test.js`；`e2e/wide-idle-more-menu.spec.js` H3。 | — | — | — | `http://127.0.0.1:5173/?product=1` · `#ft-home-memorabilia-slot` · `#yin-coin-panel` | 2026-11-17 |
