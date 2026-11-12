# ci/pr-smoke-demote-menu-reachability

| PR smoke 移出菜单走完（T12） | 纯后端 | 仅单元测试覆盖 | 本条验收的是 CI 范围：Required `test:pr-smoke` 与 pre-push 都不含 `menu-full-reachability`（改菜单路径也不加跑）；`scripts/pr-smoke-e2e-subset.test.js` 锁住。不代表菜单产品交互已关单。nightly / 合入 develop 后由 workflow `menu-full-reachability` 跑。 | — | — | — | `PR_SMOKE_FAILURE_CLASSES.md` · `npm run test:e2e:menu-reachability` | 2026-11-12 |
