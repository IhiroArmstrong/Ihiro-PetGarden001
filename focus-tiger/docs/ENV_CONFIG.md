# Focus Tiger · 环境配置与密钥隔离

> **状态（2026-07-31 核实）**：v1.0 纯本地；前端**未**接 `cloud/`；当前 CI Playwright **不**需要任何 API Key。  
> 本文把隔离规则先钉死，避免 v1.1 接线时把 Secret Key 写进客户端。

## 1. 硬性规则

1. **客户端禁止硬编码**任何云端 Secret Key / private API Key（含写死在 `src/**`、locale、注释里的「临时 key」）。
2. **Vite 只允许 `VITE_*` 进浏览器包**。`VITE_*` 只能放**公开**配置（如 API base URL）。  
   **禁止**把 Secret Key 放进任何 `VITE_*`——会随 bundle 发给每位用户。
3. **开发 / 生产隔离**：
   - 本地开发：`.env.development` / `.env.local`（gitignored）
   - 生产公开配置：`.env.production`（gitignored；仅非机密）
   - 模板：[`focus-tiger/.env.example`](../.env.example)（可提交；无真实值）
   - **禁止**把生产 Secret 拷进 development 文件，也禁止反向混用
4. **服务端密钥**只放在：
   - Cloudflare Workers secrets（`wrangler secret put` / 控制台）
   - GitHub Actions repository secrets（**仅当** workflow 真正引用 `secrets.*`）
5. 模板对照：[`cloud/.env.example`](../cloud/.env.example)

## 2. 当前仓库事实

| 项 | 状态 |
|---|---|
| `focus-tiger/.env` / `.env.development` / `.env.production` 已提交？ | **否**（`.gitignore` 挡 `.env*`，仅放行 `.env.example`） |
| 客户端调用云 API？ | **否**（`src/` 无 cloud fetch；见 `cloud/README.md`） |
| CI workflow 引用 `secrets.*`？ | **否**（`pr-smoke` / `focus-tiger-e2e-full` 等仅需 `CI=true`） |
| 为当前全量 e2e 配置 GitHub Secrets？ | **不需要**；缺 Key **不会**导致现有 Playwright 失败 |
| v1.1 接云后 | 先补公开 `VITE_CLOUD_API_BASE_URL`；服务端密钥走 Workers / Actions；再为**真实**云 E2E 加对应 `secrets.*` |

## 3. 与 CI 的关系

- **PR smoke**（`pr-smoke.yml`）：PR→`develop` 自动跑；解放本地 Agent；**无** Secret 依赖。
- **全量 e2e**（`focus-tiger-e2e-full.yml`）：`schedule`（UTC 02:00）+ `workflow_dispatch`；测的是本地静态壳，**无** Secret 依赖。Plan A：`matrix` 2 shards + JUnit always + slim traces（`playwright.ci-full.config.js`）。
- **注意**：GitHub `schedule` 使用**默认分支 `main` 上的 workflow 文件**。`timeout-minutes` / workers / **shards** 等改动若只合进 `develop`，定时任务仍读 `main` 旧 YAML。见 `PROCESS.md` Backlog「CI 全量」。

## 4. 自检清单（接云 / 加 Key 前）

- [ ] 新密钥是否出现在 `src/**` 或任何 `VITE_*`？
- [ ] `.env.production` 与 `.env.development` 是否分文件、未互相粘贴 Secret？
- [ ] CI 是否**真的**需要该 Key？需要 → 写入 Actions Secret 且 workflow 显式 `secrets.NAME`；不需要 → 不要为「以防万一」乱加
- [ ] `cloud/` stub 仍无绑定时，勿把「缺 Key」误判为 e2e 失败根因
