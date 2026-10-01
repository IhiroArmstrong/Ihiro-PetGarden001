# TEST_TRACKER 碎片 · feature/confide-semantic-shadow-export

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 相关文件 | 完成日期 |
|---|---|---|---|---|---|---|---|---|
| Confide 影子日志导出（Prompt 8） | 纯后端 | 仅单元测试覆盖 | **不进 smoke。** `cd focus-tiger && npm run audit:confide-semantic-shadow`。缺 `turns.jsonl` 时 exit 1。有影子行时终端只见 N / D / D÷N，CSV 在 `/tmp/ft-l0-lab/semantic-shadow-disagreement-*.csv`。空列 `favorable_disagreement` 留给人工。N=0 仍 exit 0，**不得**据此切 Stage 2。单测：`node --test src/core/confide/auditConfideSemanticShadow.test.js`。宽屏聊出样本仍须手动。 | — | — | — | `audit-confide-semantic-shadow.js` · `auditConfideSemanticShadow.js` | 2026-09-20 |
