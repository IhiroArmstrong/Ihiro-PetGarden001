# feature/h2-home-three-zone

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| H2 首页三块骨架 | UI/交互 | 待人工测试 | **主路径（宽 ≥480 · `?product=1`）**：Idle 左上计时下面是成长一行（不再贴左下三球）。右边有「阿寅与记忆」带字入口。点 Records **0–1 秒**见 ⋯ 该组列表；名单打开时右栏应消失。Support Yin 仍在右上。Begin Practice 仍在。窄屏不测本条。**自动化**：`HomeThreeZoneUI.test.js`；`e2e/wide-idle-more-menu.spec.js` H2 三块。 | — | — | — | `http://127.0.0.1:5173/?product=1` · `#ft-home-zone-memories` · `#weekly-practice-heatmap-cluster` | 2026-11-17 |
