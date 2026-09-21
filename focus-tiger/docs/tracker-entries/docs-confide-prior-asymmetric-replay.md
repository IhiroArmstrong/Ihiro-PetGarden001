# Tracker fragment · docs/confide-prior-asymmetric-replay

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 分支 | 日期 |
|---|---|---|---|---|---|---|---|---|
| Confide with-prior 不对称规则离线回放 | 纯后端 | 仅单元测试覆盖 | **不进 smoke。不改 live 路由。** `cd focus-tiger && npm run audit:confide-prior-asymmetric`。缺 `turns.jsonl` 时 exit 1。终端只见 eligible / naiveHelp·Harm / ruleHelp·Harm。JSON：`/tmp/ft-l0-lab/semantic-prior-asymmetric-*.json`。单测：`node --test src/core/confide/auditConfideSemanticPriorAsymmetric.test.js`。**本条验收的是**历史两列套规则后的计数，**不代表**用户可见回复已吃上下文。 | — | — | — | `audit-confide-prior-asymmetric.js` · `task-confide-prior-asymmetric-replay.md` | 2026-09-21 |
