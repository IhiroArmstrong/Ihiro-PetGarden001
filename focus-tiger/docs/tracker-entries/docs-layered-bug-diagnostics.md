# docs/layered-bug-diagnostics · 2026-09-29

| 多层系统集成 bug 排查规则（layered-bug-diagnostics） | 纯后端 | 仅单元测试覆盖 | 规则 `.cursor/rules/focus-tiger-layered-bug-diagnostics.mdc`：症状单一但根因可能分层时，第一刀加诊断，禁止猜测性修复；连续 2 次修复失败须停改逻辑。`alwaysApply: false`，glob 覆盖 voice/speech/audio/permission。`npm run docs:check` 含 `rules:doc-check`。无用户路径。 | — | — | — | `.cursor/rules/focus-tiger-layered-bug-diagnostics.mdc` · `RULES_INDEX` `layered-bug-diagnostics` | 2026-09-29 |
