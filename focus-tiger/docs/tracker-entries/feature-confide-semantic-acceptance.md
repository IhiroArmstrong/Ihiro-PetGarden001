# TEST_TRACKER 碎片 · feature/confide-semantic-acceptance

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 相关文件 | 日期 |
|---|---|---|---|---|---|---|---|---|
| Confide 离线语义冻表（Prompt 7 · 真 GGUF） | 纯后端 | 仅单元测试覆盖 | **不进 smoke。** 系统终端.app（Metal）：`cd focus-tiger && npm run test:confide-semantic-acceptance`。汇总形态 `N/100 · 锚点 3/3`。leave-one-out。缺模型时下载到 companion-l0。单测：`node --test src/core/confide/confideSemanticAcceptanceEvaluate.test.js`。JSON：`/tmp/ft-l0-lab/semantic-acceptance-*.json`。**不测 UI。** 不据此切 Stage 2。本旁支首次 Metal：`84/100 · 锚点 3/3 PASS`（16 条落 gray，未调阈值）。 | — | — | — | `l0-confide-semantic-acceptance.js` · `confideSemanticAcceptanceEvaluate.js` | 2026-09-20 |
