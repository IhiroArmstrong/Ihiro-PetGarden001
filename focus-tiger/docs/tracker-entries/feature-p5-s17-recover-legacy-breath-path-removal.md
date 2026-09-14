# feature/p5-s17-recover-legacy-breath-path-removal

| Recover 遗留呼吸/过载路径删除 (S17) | UI可见 | 待人工测试 | **主路径**：Idle → 更多 → 接地练习 → **感受地面** / **环顾四周** 仍正常。**对照**：`RecoverResetPracticeUI` 不再接受 `breath` / `overwhelmed` 路由；过载后 Confide 柔性条已删。**保护面**：MicroRitual / Honesty / RitualFlow 呼吸不变；主动 Tiger Anchor Recover 不接接地练习。e2e：`e2e/ground-exercise-menu.spec.js`。审计：`MODAL_USAGE_AUDIT.md` S17/S18。 | — | — | — | `RecoverResetPracticeUI.js` · `resetPracticeRoutes.js` · `practiceAggregateConsumerRegistry.js` | 2026-09-14 |
