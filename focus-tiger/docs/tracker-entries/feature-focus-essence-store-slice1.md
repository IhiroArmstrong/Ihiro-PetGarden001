# feature/focus-essence-store-slice1

| Focus Essence Slice 1 · L0 ledger + store + award helpers | 纯后端 | 仅单元测试覆盖 | **无 UI · 不挂 main.js。** `node --test src/core/focusEssenceLedger.test.js src/core/focusEssenceAward.test.js` 全绿；`growthMetricsRegistry` 增 `focus-essence-earn` 轨；`?focusEssence=0` 独立关闸；`essenceTotal` 从 0 起、只增；不回溯 Coin；activeRecover **不**写 Coin `lifetimeMarks`。Brief `task-focus-essence-slice1.md` · 审计 `focus-essence-coin-split-audit.md`。 | — | — | — | `focusEssenceLedger.js` · `FocusEssenceStore.js` · `focusEssenceAward.js` · `focusEssenceAwardGate.js` | 2026-09-20 |
