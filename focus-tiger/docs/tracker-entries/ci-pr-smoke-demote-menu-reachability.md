# ci/pr-smoke-demote-menu-reachability

| PR smoke 移出菜单走完（T12） | 纯后端 | 仅单元测试覆盖 | 本条验收的是 CI 范围：默认 `test:e2e:smoke` 不再含 `menu-full-reachability`；`scripts/pr-smoke-e2e-subset.test.js` 锁住。不代表菜单产品交互已关单。改菜单文件的 PR 仍应在 `pr-smoke` 看到额外一步；nightly workflow `menu-full-reachability` 可手动触发。 | — | — | — | `PR_SMOKE_FAILURE_CLASSES.md` · `npm run test:e2e:menu-reachability` | 2026-10-17 |
