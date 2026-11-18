# feature/h5-home-greeting

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| H5 首页短问候轮换 | UI/交互 | 待人工测试 | **主路径（宽 ≥480 · `?product=1`）**：Idle 阿寅下方 `#ft-home-idle-greeting` 见一句短问候，其下是 Begin Practice。问候点不了。同一天刷新仍是同一句。Focusing 时问候消失。**对照**：不是 Quiet Line 日签，不是切语喝茶/看书。窄屏本条不测。**自动化**：`homeIdleGreeting.test.js` · `WideIdleMoreMenu.test.js` H5 源码锁 · `e2e/wide-idle-more-menu.spec.js` 问候可见。 | — | — | — | `http://127.0.0.1:5173/?product=1` · `#ft-home-idle-greeting` · `#ft-home-begin-practice` | 2026-11-18 |
