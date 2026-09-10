<!-- fragment for TEST_TRACKER assemble; branch fix-practice-aggregate-batch-4 -->

| Confide practice aggregate · Batch 4 registry + CI audit | 纯后端+调试 | 仅单元测试覆盖 | **新增**：`practiceAggregateConsumerRegistry.js` 机器清单 + `npm run audit:practice-coverage`（挂 `docs:check`）。P0/P1 消费者须含 aggregate 锚点且 baseline 三源全覆盖。**顺带修**：`contemplativeArchiveSeal` 改读 lotus 终身分（与 Batch 2 芥子印一致）。**测**：本地 `npm run audit:practice-coverage` + `npm run test:smoke` 绿即可；无用户面改动。 | — | — | — | `scripts/audit-practice-coverage.js` · `docs/practice-aggregate-registry.md` 机器块 | 2026-09-09 |
