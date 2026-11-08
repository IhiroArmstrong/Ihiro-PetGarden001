# tracker fragment · fix/confide-semantic-crisis-narrow-window

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 备注 | 日期 |
|---|---|---|---|---|---|---|---|---|
| 缩窄窗口 · 有向量时仍打危机分 | 纯后端 | 待人工测试 | **主路径**：Electron 本机向量已加载 → 把窗口缩到 &lt;480px → 发非关键字危机转述 → **须**仍走语义打分，命中则 `safety_redirect`。**对照**：网页/无向量窄窗 → 不因本刀把全部兜底改成固定句。**不测**：窄窗自由生成（生成层宽屏门槛不变）。自动化：`confideSemanticCrisisLayer.test.js` · `confideSemanticCrisisGenerateGate.test.js`。 | 分析师 2026-11-08：宽度绑生成层，不是安全必须；PO 点头现在做 | — | 扩大识别覆盖，不调 0.78 | `fix/confide-semantic-crisis-narrow-window` | 2026-11-08 |
