# feature/stage2-m-replay

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Stage 2 M 小回放（字面 + embedding + live 路由） | 纯后端 | 仅单元测试覆盖 | **无用户路径。不进 smoke。不改 live 路由。** `cd focus-tiger && FT_SEMANTIC_ACCEPTANCE_NO_DOWNLOAD=1 npm run audit:stage2-m-replay -- --file <绝对路径>`。终端 `STABLE` = 字面 gray、语义 functional、路由未改。**本条验收的是**实验室回放计数，**不代表**产品路径 M，也不含 Hybrid / 回复生成。单测：`node --test src/core/confide/stage2MReplayDecide.test.js`。 | — | — | — | `l0-replay-stage2-m-candidates.js` · `stage2MReplayDecide.js` | 2026-09-29 |
