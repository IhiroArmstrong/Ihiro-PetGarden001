# tracker fragment · fix/t90-semantic-crisis-generate-gate

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 备注 | 日期 |
|---|---|---|---|---|---|---|---|---|
| T90 · 危机未打分不放行生成（10-01 / 10-06） | 纯后端 | 待人工测试 | **主路径**：Electron 宽屏 Confide · 嵌入模型未就绪 → 发非关键字兜底句 → **不得** `source=generate`，须 `corpus`。**对照**：嵌入就绪后同句可走 generate。**自动化**：`confideSemanticCrisisGenerateGate.test.js` · `desktopCompanionL2Route.test.js` UI 契约。 | — | — | — | `fix/t90-semantic-crisis-generate-gate` | 2026-11-07 |
