# fix/flower-welcome-occupancy-sync

| 吹花占用与开播不同步（quota 拒播仍占 FLOWER） | UI/交互 | 待人工测试 | **主路径**：DEV `window.__ftDebug.resetScenario('day1-flower-card')` → 硬刷新 → 吹花+四选卡。**回流**：同日再刷不吹花不坏。**复现路径**：`resetScenario('welcome-quota-blocks-flower')` → 不得再吹花，但须回 `idle-breathing`（不得僵尸 FLOWER 占用）。**自动化**：`spriteChannelArbitration.test.js`（quota 已用不 claim FLOWER）+ `e2e/flower-welcome.spec.js` quota 用例断言 `idle-breathing`。删 `[FT-DIAG-727]`。 | 2026-09-12：只清花欢迎 key、保留 scene-anim-daily 复现「占用是花、动画完全不播」；PO 同意修占用同步而非结束判据。 | — | 本回合 | 5173 develop tip 清库复测 | 2026-09-12 |
