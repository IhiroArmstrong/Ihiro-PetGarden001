# TEST_TRACKER 碎片 · feature/confide-semantic-live-reason-audit

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 分支/PR | 日期 |
|---|---|---|---|---|---|---|---|---|
| Confide Stage 2 live 语义 reason 审计（Prompt 8 扩展） | 纯后端 | 仅单元测试覆盖 | **不进 smoke。** Electron 宽屏发任意 Confide 句 → 查 `userData/companion-l2/turns.jsonl` 是否新增 `kind:semantic_live_classify` 且含 `reason`（冷启动 `embed_not_ready`；ready 后 `ok` / `timeout` 等）。`cd focus-tiger && npm run audit:confide-semantic-shadow` 终端须多三行 `live=` / `failOpen=` / `semanticOk=`。单测：`auditConfideSemanticShadow.test.js` · `confideSemanticCoarseMap.test.js`。 | — | — | — | `feature/confide-semantic-live-reason-audit` | 2026-09-21 |
