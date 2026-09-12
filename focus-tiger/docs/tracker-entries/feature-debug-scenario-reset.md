# feature/debug-scenario-reset

| 官方场景清库 `__ftDebug.resetScenario` | 纯后端 | 仅单元测试覆盖 | **无用户路径。** Vite DEV：`window.__ftDebug.listScenarios()` / `resetScenario('day1-flower-card')`（只要吹花：`day1-flower-only`；负例留日旗：`welcome-quota-blocks-flower`）。生产 / `vite preview` **不得**存在 `__ftDebug`。半清库时 DEV console 警告 `flower reset but daily quota still consumed`（负例可忽略）。单元：`debugScenarioReset.test.js`；e2e 负例改调同一配方。 | — | — | — | `src/core/debugScenarioReset.js` · 仅 DEV | 2026-09-13 |
