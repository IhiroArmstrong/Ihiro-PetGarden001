# fix/e2e-open-shell-stability

| E2E 打开链路可观测 + :5199 探测失败快失败 | 纯后端 | 仅单元测试覆盖 | **本条验收的是** CI 日志能搜到 `FT_E2E_OPEN_METRICS` / `FT_E2E_RETRY_SUMMARY`（一次就过 vs 重试才过 vs 硬失败），以及探测失败不再烧 40s `page.goto`。**不代表**产品壳观感关单，**不代表** night full / visibility 已健康。单测：`scripts/open-shell-metrics.test.js`（探测失败须 abort goto；撤掉该判定会红）。全量与 visibility 验收交给 dispatch，不以 job 全绿单独过关。 | — | — | — | `e2e/helpers/product-shell.js` · `e2e/helpers/open-shell-metrics.js` | 2026-10-23 |
