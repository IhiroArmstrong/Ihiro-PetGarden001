# Buy Yin a Tea · Tip Jar

> **状态（2026-08-07）**：实现于 `feature/yin-tip-jar`（由 `feature/founder-supporter-pack` 改道，PR #161 已合 develop）。  
> **性质**：打赏 / 感激；**不解锁**音效或动画。  
> **零耦合**：不得被 `sanctuaryEntitlementGate` 读取；见 `task-tech-direction-v1-shell-monetization.md` §2.6。  
> **前身文档**：`FOUNDER_SUPPORTER_PACK.md` 已废止；部署清单迁入下文「§ 部署（任务 5）」。

## Schema

本地 `focus-tiger.tip-jar.v1`：

```ts
{ tipped: boolean, tipCount: number, lastTippedAt: string | null, email?: string | null, source?: ... }
```

## API

| Method | Path | Role |
|---|---|---|
| POST | `/api/create-tip-checkout-session` | Stripe Checkout URL |
| POST | `/api/stripe-webhook` | Verified write to `TIP_KV` |
| POST | `/api/verify-tip` | Email restore |

Success URL should include `?tip=1`（乐观徽章级回跳；**禁止**用 tip query 写 Sanctuary `unlocked`）。

## UI

Idle ⋯ / 抽屉 **Buy Yin a tea** → `#yin-tip-jar-card`。情境化入口（里程碑 / Honesty / About）后续再加。

---

## § 部署（任务 5）· **进行中（2026-08-08 · 纠偏）**

> **硬边界**：仓库里的 Tip Jar **应用代码 + Worker 路由**可以合 develop；**真实收款**必须另做本运维/配置任务。  
> **代码 alone 无法完成真实收款。**

### Stripe / 线上 SSOT（昨天已配好 · **以此为准**）

| 项 | 值 |
|---|---|
| Worker 公开 base | **`https://focus-tiger-cloud.ihiro.workers.dev`** |
| Webhook | `https://focus-tiger-cloud.ihiro.workers.dev/api/stripe-webhook`（Sandbox 已 Active） |
| secrets | **已在 `ihiro` Worker**（勿因今日误部署再 put 一遍到错误主机） |

探活（2026-08-08）：对该 base 调 Checkout → Stripe 回 **inactive price**（仍绑旧 Price ID）→ 说明 secrets/URL 通，**只差 redeploy 新 Price**。

### 今日误操作（勿当 SSOT）

在 `armstronghhe@gmail.com` 的 CF 账号上另注册了 workers.dev 子域 **`focus-tiger`**，并 deploy 到  
`https://focus-tiger-cloud.focus-tiger.workers.dev`（**无** Stripe secrets；与 Webhook **不一致**）。  
**不要**改 Stripe Webhook 去指它；后续以关掉/忽略该旁路为宜。

### 仍须完成的步骤

1. 用**昨天部署 `ihiro` 时同一 Cloudflare 账号**登录 wrangler，在含 #181 Price ID 的 `wrangler.jsonc` 上：  
   `cd focus-tiger/cloud && npx wrangler deploy`  
   → 目标须仍是 **`focus-tiger-cloud.ihiro.workers.dev`**
2. 本地：`focus-tiger/.env.local`  
   `VITE_CLOUD_API_BASE_URL=https://focus-tiger-cloud.ihiro.workers.dev`
3. **不必**改 Stripe Webhook URL（已正确）

### 本地自检（redeploy 新 Price 后）

- 产品壳点 **Buy Yin a tea** → Checkout 金额 **$9.99**（非 inactive）  
- Sanctuary 卡面 **$89.99** + Lifetime Checkout  
- Webhook → `TIP_KV` / Sanctuary KV；**不得** tip 解锁 Sanctuary

### 与 Sanctuary（B）的关系

- Tip 与 Sanctuary **分 Price ID、分 KV、分 webhook 业务分支**（可共享 `cloud/src/lib/stripe.ts` 工具层）  
- 共用同一 Worker base（**`ihiro`**）与同一组 Stripe secrets

### 排期口径

| 层 | 状态 |
|---|---|
| 前端 Tip UI + `tipJarGate` | 已合 develop（#161） |
| Worker Checkout / webhook / verify 代码 | 已在 `cloud/` |
| `ihiro` Worker + Webhook + secrets | **已有**（昨天） |
| #181 新 Price ID → **`ihiro` redeploy** | **未做**（阻塞真收款） |
| 误建 `focus-tiger` 旁路 | **作废对齐** |
