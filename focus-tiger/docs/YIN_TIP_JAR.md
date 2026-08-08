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

## § 部署（任务 5）· **进行中（2026-08-08）**

> **硬边界**：仓库里的 Tip Jar **应用代码 + Worker 路由**可以合 develop；**真实收款**必须另做本运维/配置任务。  
> **代码 alone 无法完成真实收款。**  
> 权威操作清单（自原 Founder Pack §6 迁入，语义改为 Tea / Tip）：

### 已用终端完成（本 CF 账号）

- workers.dev 账号子域：**`focus-tiger`**（Dashboard onboarding 链 404 时，用 API `PUT /accounts/.../workers/subdomain`）
- `TIP_KV` / `SANCTUARY_KV`（+ preview）已 `wrangler kv namespace create`，id 写入 `wrangler.jsonc`（#182）
- Stripe Price ID（纠价后）已写入 vars（#181）
- **`npx wrangler deploy` 已成功** → `https://focus-tiger-cloud.focus-tiger.workers.dev`

### 仍须完成的步骤

1. **`npx wrangler secret put STRIPE_SECRET_KEY`**  
   **`npx wrangler secret put STRIPE_WEBHOOK_SECRET`**  
   （当前 `wrangler secret list` 为空；无密钥则 Checkout 无法开）
2. Stripe Dashboard **配 Webhook** → 指到  
   `https://focus-tiger-cloud.focus-tiger.workers.dev/api/stripe-webhook`  
   （至少 `checkout.session.completed`；签名密钥 = 上一步 `STRIPE_WEBHOOK_SECRET`）
3. 前端本地：`focus-tiger/.env.local`（gitignored）设  
   `VITE_CLOUD_API_BASE_URL=https://focus-tiger-cloud.focus-tiger.workers.dev`  
   未配置时：免费主路径不变；Tip 卡提示未配置 / 无法开 Checkout

### 本地自检（secrets + webhook 配齐后）

- 产品壳点 **Buy Yin a tea** → 进 Stripe Checkout（Test 卡）→ success 回跳 `?tip=1` → 本地 tip 状态 / 徽章级反馈  
- Webhook 写入 `TIP_KV` 后，换设备用邮箱走 **`/api/verify-tip`** 可恢复 tip 记录  
- Sanctuary 卡面 **$89.99** + Lifetime Checkout 同 Worker  
- **不得**因此解锁 Sanctuary / 氛围全库（零耦合抽查）

### 与 Sanctuary（B）的关系

- Tip 与 Sanctuary **分 Price ID、分 KV、分 webhook 业务分支**（可共享 `cloud/src/lib/stripe.ts` 工具层）  
- B 的 Lifetime Checkout 与 Tip **共用同一 Worker / 同一组 Stripe secrets**；分 `STRIPE_SANCTUARY_PRICE_ID` / `SANCTUARY_KV`

### 排期口径

| 层 | 状态 |
|---|---|
| 前端 Tip UI + `tipJarGate` | 已合 develop（#161） |
| Worker Checkout / webhook / verify 代码 | 已在 `cloud/` |
| Price ID + KV + workers.dev deploy | **已做**（#181/#182 · 2026-08-08） |
| **任务 5 · secrets + Stripe Webhook** | **未做** —— 真实收款阻塞项 |
| 情境化 tip 入口（里程碑 / Honesty / About） | 产品后续；不挡任务 5 |
