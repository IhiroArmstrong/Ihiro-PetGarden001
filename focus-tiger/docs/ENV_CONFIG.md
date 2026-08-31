# Focus Tiger · 环境配置与密钥隔离

> **规则 SSOT**：本文 §1 / §3 / §4。  
> **仓库与环境现状事实**（Worker URL、KV 绑定、生产 Version、Stripe Price 记档、`VITE_*` 政策等）→ [`INFRA_SNAPSHOT.md`](./INFRA_SNAPSHOT.md)（`RULES_INDEX` → `infra-snapshot`）。  
> 前端只经公开 `VITE_CLOUD_API_BASE_URL` 调用；**Secret 仍不得进客户端**。CI Playwright **不**需要任何 API Key。

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

**Electron 步骤 A（2026-08-17）**：打包壳内的 Cloud POST 走**主进程 IPC**（不把自定义协议 Origin 直接打到 Worker）。失败仍抛错，UI 复用 Web 卡面（请茶 / Sanctuary / Membership / Journey 备份），不为壳另做提示。壳内 `getCloudApiBaseUrl()` 在缺 `VITE_*` 时回退到公开 Worker URL（避免打包后假「离线」把按钮禁用）。Worker `ALLOWED_ORIGIN` 已支持逗号列表（可含 `focus-tiger://app`）；**生产名单要等你明确下令 Redeploy 才改**，本回合不部署。

**本地 Vite 旁支端口（2026-09-01）**：生产 Worker Origin 名单仍是 `:5173`。`npm run dev` 在浏览器里把 Cloud POST 打到**当前页 origin** `/api`，由 `vite.config.js` 代理到公开 Worker（避免 `:5174` CORS）。改 proxy 后须**重启** Vite。结账 POST 另带 `pageOrigin`（仅 loopback）；Worker 把 Stripe success/cancel 从 env 里的 `:5173` **改写到当前 tab 端口**。生产 Version **`2e94d4c0-0ec5-42e8-aa89-d06dd914b303`**（2026-09-01 Redeploy）已含该改写。

## 2. 现状事实（已迁出）

Worker 绑定、KV id、HTTP 路由、生产 `prod_worker_version`、Stripe Price 记档、locale tier、entitlement 表、CI workflow 清单等 **不再维护于本文**。  
接云 / entitlement / Worker 任务前可读 [`INFRA_SNAPSHOT.md`](./INFRA_SNAPSHOT.md)；摘要过期或任务改相关源文件时再读 SSOT。

## 3. 与 CI 的关系

- **PR smoke**（`pr-smoke.yml`）：PR→`develop` 自动跑；解放本地 Agent；**无** Secret 依赖。
- **全量 e2e**（`focus-tiger-e2e-full.yml`）：`schedule`（UTC 02:00）+ `workflow_dispatch`；测本地静态壳，**无** Secret。Plan A（`matrix` 2 shards + JUnit always + slim traces；`playwright.ci-full.config.js`；历史上 #63 先合入当时的默认分支 `main`）。job checkout **`develop` tip**（或 dispatch `ref`）。**2026-08-02**：#15 稳定红修合 develop（#74）；dispatch 验绿 [run 30712008401](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/actions/runs/30712008401)。见 `PROCESS.md` Backlog「CI 全量」。
- **注意（2026-08-14）**：GitHub `schedule` 使用**当前默认分支**上的 workflow 文件。默认分支已改为 **`develop`**，故改 timeout / workers / **shards** 合进 `develop` 即可作用于夜间 cron，**不必**再为定时任务把 YAML 同步到 `main`。`main` 仍是发布线，与 cron 无关。

## 4. 自检清单（接云 / 加 Key 前）

- [ ] 新密钥是否出现在 `src/**` 或任何 `VITE_*`？
- [ ] `.env.production` 与 `.env.development` 是否分文件、未互相粘贴 Secret？
- [ ] CI 是否**真的**需要该 Key？需要 → 写入 Actions Secret 且 workflow 显式 `secrets.NAME`；不需要 → 不要为「以防万一」乱加
- [ ] `cloud/` stub 仍无绑定时，勿把「缺 Key」误判为 e2e 失败根因
- [ ] 生产 Worker 是否已 redeploy？→ 查 `INFRA_SNAPSHOT.md` §1 生产漂移表；**仅**用户口令「部署」+ redeploy 后可更新 `prod_worker_version`
