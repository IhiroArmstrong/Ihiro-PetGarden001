# Focus Tiger · 环境配置与密钥隔离

> **状态（2026-08-15 核实）**：生产 Worker `focus-tiger-cloud` 已接 Tip / Sanctuary / Membership / OTP / practice-backup / newsletter 路由。前端只经公开 `VITE_CLOUD_API_BASE_URL` 调用；**Secret 仍不得进客户端**。CI Playwright **不**需要任何 API Key。  
> 本文把隔离规则钉死，避免把 Secret Key 写进客户端。

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

## 2. 当前仓库事实

| 项 | 状态 |
|---|---|
| `focus-tiger/.env` / `.env.development` / `.env.production` 已提交？ | **否**（`.gitignore` 挡 `.env*`，仅放行 `.env.example`） |
| 客户端调用云 API？ | **是（可选）**。配了 `VITE_CLOUD_API_BASE_URL` 时，Tip / Sanctuary / Membership / OTP restore / practice-backup / newsletter / **品味层**（`/api/emotion-weight`、`/api/daily-message`）走公开 Worker；未配则本地。品味层失败静默用本地表。**禁止**把 Secret 放进任何 `VITE_*` |
| CI workflow 引用 `secrets.*`？ | **否**（`pr-smoke` / `focus-tiger-e2e-full` 等仅需 `CI=true`） |
| 为当前全量 e2e 配置 GitHub Secrets？ | **不需要**；缺 Key **不会**导致现有 Playwright 失败 |
| 品味层 runtime | **已接线**（`schemaVersion: 1` 可选 overlay；失败用本地冻结表）。生产 Worker 须明确「部署」才从旧 mock 换成 v1。现有 Playwright **不**需要品味层 `secrets.*` |
| Tip / Sanctuary / Membership / practice-backup / newsletter Worker（2026-08-16） | **SSOT**：`https://focus-tiger-cloud.ihiro.workers.dev`（**163 / ihiro Cloudflare**）。当前生产 Version **`fb568e27-96dd-4fb1-b15c-acbac8dd919b`**（请茶 `STRIPE_PRICE_ID`=`price_1U4nanFuIhgJPGLidoTdxobW` US$4.99；Newsletter 路由 + 欢迎信 await/重发仍在，覆盖 `8c649d12-…` / `d0140328-…`；OTP / webhook / Membership / practice-backup 同 Worker）。本地 `.env.local` 用同一 base。**勿**用旁路 `*.focus-tiger.workers.dev`。**OTP 发信（2026-08-13）**：生产已 `wrangler secret put RESTORE_OTP_PEPPER` + `RESEND_API_KEY`；`RESEND_FROM` = `Yin <restore@twinsology.com>`。本地 Vite 缺 `VITE_CLOUD_API_BASE_URL` 时 Send code 会本地失败。**Newsletter**：From = **只** `NEWSLETTER_FROM`（`hello@twinsology.com`），**禁止**回退 `RESEND_FROM` / `restore@`。探路：无效邮箱 → 400。**2026-08-15 人工**：用户书面确认已收到 From `hello@twinsology.com`（一封约 18:54+08 进垃圾箱，属旧 Worker；一封约 20:54+08 为无 `welcomeSentAt` 重发）。**2026-08-16 人工**：再提交 Stay in touch + Dashboard `NEWSLETTER_KV` `newsletter:v1:{email}` — **测试 OK**。**wrangler login**：先在 Safari 切到正确 CF 帐号再 OAuth；环境若有 `CLOUDFLARE_API_TOKEN` 须先 `unset` |

## 3. 与 CI 的关系

- **PR smoke**（`pr-smoke.yml`）：PR→`develop` 自动跑；解放本地 Agent；**无** Secret 依赖。
- **全量 e2e**（`focus-tiger-e2e-full.yml`）：`schedule`（UTC 02:00）+ `workflow_dispatch`；测本地静态壳，**无** Secret。Plan A（`matrix` 2 shards + JUnit always + slim traces；`playwright.ci-full.config.js`；历史上 #63 先合入当时的默认分支 `main`）。job checkout **`develop` tip**（或 dispatch `ref`）。**2026-08-02**：#15 稳定红修合 develop（#74）；dispatch 验绿 [run 30712008401](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/actions/runs/30712008401)。见 `PROCESS.md` Backlog「CI 全量」。
- **注意（2026-08-14）**：GitHub `schedule` 使用**当前默认分支**上的 workflow 文件。默认分支已改为 **`develop`**，故改 timeout / workers / **shards** 合进 `develop` 即可作用于夜间 cron，**不必**再为定时任务把 YAML 同步到 `main`。`main` 仍是发布线，与 cron 无关。

## 4. 自检清单（接云 / 加 Key 前）

- [ ] 新密钥是否出现在 `src/**` 或任何 `VITE_*`？
- [ ] `.env.production` 与 `.env.development` 是否分文件、未互相粘贴 Secret？
- [ ] CI 是否**真的**需要该 Key？需要 → 写入 Actions Secret 且 workflow 显式 `secrets.NAME`；不需要 → 不要为「以防万一」乱加
- [ ] `cloud/` stub 仍无绑定时，勿把「缺 Key」误判为 e2e 失败根因
