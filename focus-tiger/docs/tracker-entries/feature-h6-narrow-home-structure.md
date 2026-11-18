# feature/h6-narrow-home-structure

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| H6 窄屏问候 + Begin Practice | UI/交互 | 待人工测试 | **主路径（宽 375 · `?product=1`）**：Idle 见 `#ft-narrow-home-idle-greeting` 一句短问候，其下金色 Begin Practice，再下三球。点 Begin Practice **0–1 秒**见到达。问候点不了。抽屉仍从底下抽出，不是侧栏。Focusing 时问候与钮消失。**对照**：宽屏仍用 `#ft-home-idle-greeting`。**自动化**：`NarrowIdleShell.test.js` H6 源码锁 · `homeChromeClearance.test.js` 净空抬高。 | — | — | — | `http://127.0.0.1:5173/?product=1` · 375 · `#ft-narrow-home-begin-practice` | 2026-11-18 |
