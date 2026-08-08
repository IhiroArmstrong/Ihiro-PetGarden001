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
| secrets | **已在 `ihiro` Worker** |
| 2026-08-08 redeploy | Version **`eb921e5f-a80a-4447-add7-2f9772982d67`**：新 Tip/Sanctuary Price ID 已上线 |

### 今日误操作（勿当 SSOT）

曾在 `armstronghhe@gmail.com` 账号另注册子域 **`focus-tiger`** 并 deploy——**作废对齐**；Stripe Webhook **不要**改指它。

### 仍须完成的步骤

1. 本地：`focus-tiger/.env.local`  
   `VITE_CLOUD_API_BASE_URL=https://focus-tiger-cloud.ihiro.workers.dev`
2. **人工**：Test 卡走 Tea **$9.99** / Sanctuary **$89.99** Checkout + 回跳
3. **不必**改 Stripe Webhook URL（已正确）

### 本地自检（redeploy 后）

- 产品壳点 **Buy Yin a tea** → Checkout **$9.99**  
- Sanctuary 卡面 **$89.99** + Lifetime Checkout  
- Webhook → KV；**不得** tip 解锁 Sanctuary

### 与 Sanctuary（B）的关系

- Tip 与 Sanctuary **分 Price ID、分 KV、分 webhook 业务分支**（可共享 `cloud/src/lib/stripe.ts` 工具层）  
- 共用同一 Worker base（**`ihiro`**）与同一组 Stripe secrets

### 排期口径

| 层 | 状态 |
|---|---|
| 前端 Tip UI + `tipJarGate` | 已合 develop（#161） |
| Worker Checkout / webhook / verify 代码 | 已在 `cloud/` |
| `ihiro` Worker + Webhook + secrets | **已有** |
| #181 新 Price ID → **`ihiro` redeploy** | **已做**（2026-08-08 · `eb921e5f…`） |
| 误建 `focus-tiger` 旁路 | **作废对齐** |
| 人工 Test 卡金额验收 | **待做** |
