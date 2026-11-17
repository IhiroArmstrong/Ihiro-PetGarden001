# feature/h1-home-side-nav

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| H1 侧边名单 + Begin Practice | UI/交互 | 待人工测试 | **主路径（宽 ≥480 · 高 ≥520 · `?product=1`）**：Idle 见金色 Begin Practice。点它 **0–1 秒**见到达，与 Sit 球相同。点 ⋯ **0–1 秒**见右侧带「导航」抬头的五组文字名单，不是围着 ⋯ 的圆标。点 Practice & moments 见右侧列表。点遮罩关掉。三球仍在。Support Yin 仍在右上。窄屏不测本条。**自动化**：`WideIdleMoreMenu.test.js` 侧栏/Begin Practice；`e2e/wide-idle-more-menu.spec.js` Begin Practice + 五组名单。 | — | — | — | `http://127.0.0.1:5173/?product=1` · `#ft-home-begin-practice` · `#ft-wide-more-radial` | 2026-11-17 |
