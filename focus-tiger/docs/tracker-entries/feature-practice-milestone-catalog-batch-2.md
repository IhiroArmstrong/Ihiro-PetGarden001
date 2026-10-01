# feature/practice-milestone-catalog · Batch 2

| 共享里程碑目录 Batch 2 · Glow provenance | 纯后端 | 仅单元测试覆盖 | **无 UI / 无行为变化。** `MilestoneGlowStore.claimOffer` 现自动写入 #890 方案 D 三字段（`rarity_basis` = catalog id、`origin` = 谓词族、`journey_id` = Journey alias）；`resolveMilestoneGlowNodeId` 改读 `MILESTONE_CATALOG`。旧记录不回填。自动化：`MilestoneGlowStore.test.js` + `MILESTONE_CATALOG.test.js`。 | — | — | — | 无需人工测试（无用户可见变化） | 2026-09-20 |
