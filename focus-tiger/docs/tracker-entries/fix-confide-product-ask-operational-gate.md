# fix-confide-product-ask-operational-gate

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Confide 产品问收窄为操作问法（CR-47 发送链） | UI可见 | 待人工测试 | **终端已覆盖**：`resolveProductKnowledgeGateAction` 在向量说「像产品问」、目录未命中时，英文动机 / 不想练 / 想喝酒躲开 / 陈述想练为 `skip`；观察翼是什么、关提醒、Sit 按钮在哪、won't stop、How can I meditate? 仍诚实空态；接地练习 catalog 命中仍短答。`npm run test:smoke`。**人只补**：Electron 宽屏、向量就绪，英文先发 Brief 回归表那几句，不得出现 “doesn't keep a manual”；接地练习仍短答；观察翼是什么仍空态。**不要测危机竖线**（等 CR-48）。关单不得用各类平均 ≥90% 代替按类。 | — | — | — | `?product=1&confide=1` · Mac Electron 宽屏 | 2026-10-15 |
