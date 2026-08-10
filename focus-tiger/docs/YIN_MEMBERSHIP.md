# Yin Membership · 订阅（B 轨 · 订阅付费方式）

> **状态（2026-08-10）**：Checkout + confirm + verify + **webhook 生命周期（Prompt 9）** 于 `feature/yin-membership-webhook`。  
> **性质**：与 **Sanctuary Lifetime** 解锁**同一套**进阶内容（lifetime ∪ subscription 互覆盖）。  
> **验证强度**：与 Sanctuary 相同——**禁止**乐观 query 解锁；须服务端 confirm。  
> **零耦合**：不得 import / 读取 `tipJarGate`。  
> **本期范围**：开通 → 续费 → 扣款失败（宽限）→ 取消/删除写 `MEMBERSHIP_KV`。真实 provider 轮询 / Customer Portal → Prompt 10。

## Schema

### Worker KV · `membership:{normalizedEmail}`

```ts
{
  active: true,
  periodEndsAt: string, // ISO
  planId: string,       // default yin-membership
  receiptId: string,    // **原始** Checkout Session id（续费不改写）
  subscriptionId: string,
  lastPaymentFailedAt?: string // 运维可观测；**不**参与 entitlement 判定
}
```

反查索引（webhook 续费/取消用）：

```ts
// membership-sub:{subscriptionId} → normalizedEmail
```

降级（`customer.subscription.deleted` / `status=canceled`）：**删除** email key + 反查 key（与 tip/sanctuary「无记录=未开通」对齐；无 tombstone）。

### 本地 · 统一 entitlement 缓存（非独立 gate）

成功 confirm / verify 后 `applyEntitlementPatch`：

```ts
{
  subscription: {
    active: true,
    periodEndsAt: string,
    planId: string,
    via: 'payment'
    // lastVerifiedAt 由 mergeEntitlementCache 自动戳
  }
}
```

Key：`focus-tiger.entitlement-cache.v1`（见 `entitlementState.js`）。

### verify-membership 宽限（防无限续命）

服务端：`now < periodEndsAt + MEMBERSHIP_GRACE_MS`（7 天，对齐客户端 `ENTITLEMENT_GRACE_MS`）才返回 `active: true`。  
宽限耗尽后即使 KV 行仍在（Stripe 仍在 dunning），verify 返回 `active: false` + `reason: grace_exhausted`，避免换设备反复 verify 刷新 `lastVerifiedAt` 无限续宽限。

## Client

- `MembershipUnlockUI` / `#yin-membership-card`（Idle ⋯ / 抽屉 `membership` + Support 卡）
- 回跳：`?membership_session={CHECKOUT_SESSION_ID}` → `confirmMembershipReturnQuery` → **仅**服务端 confirm 成功后 `markMembershipFromPayment`
- 取消：`?membership=cancel`（不写缓存）
- 跨设备：邮箱 → `POST /api/verify-membership` → 同上 patch（受上节宽限约束）

## Cloud

| 项 | Membership | Sanctuary（对照） |
|---|---|---|
| Price var | `STRIPE_MEMBERSHIP_PRICE_ID`（**recurring**） | `STRIPE_SANCTUARY_PRICE_ID`（one-time） |
| KV | `MEMBERSHIP_KV` · `membership:{email}` | `SANCTUARY_KV` · `sanctuary:{email}` |
| Create | `/api/create-membership-checkout-session` | `/api/create-sanctuary-checkout-session` |
| Confirm | `/api/confirm-membership-session` | `/api/confirm-sanctuary-session` |
| Restore | `/api/verify-membership` | `/api/verify-sanctuary` |
| metadata | Session + **`subscription_data.metadata`**: `product=membership` · `planId=yin-membership` | `product=sanctuary` |
| Checkout `mode` | `subscription` | `payment` |

Confirm 额外拉取 Stripe Subscription：`status` ∈ `active|trialing`，并用 `periodEndsAtFromSubscription` → `periodEndsAt`；写 KV 时同步写 `membership-sub:` 反查。  
**Stripe API Basil+ / webhook `2026-07-29.dahlia`**：顶层 `subscription.current_period_end` 已移除，须读 `items.data[].current_period_end`（代码已兼容旧顶层字段）。缺 period → webhook/confirm 会 502 `subscription missing current_period_end`。

### Webhook（`POST /api/stripe-webhook` · 扩展既有处理器）

签名：既有 HMAC；失败 → **400** + `console.error({ reason })`（禁止 silent 200）。

| 事件 | MEMBERSHIP_KV |
|---|---|
| `checkout.session.completed` · `mode=subscription` · product=membership | 拉 Subscription；`active` + `periodEndsAt`；`receiptId=cs_…`；清 `lastPaymentFailedAt` |
| `invoice.paid` | 刷新 `periodEndsAt`；**保留**原 `receiptId`；清失败戳 |
| `invoice.payment_failed` | **不降级**；写 `lastPaymentFailedAt` |
| `customer.subscription.updated` · active/trialing | 刷新期末；`cancel_at_period_end` 仍不降级 |
| `customer.subscription.updated` · past_due/unpaid | 不降级；可补失败戳 |
| `customer.subscription.updated` · canceled | 删 key（同 deleted） |
| `customer.subscription.deleted` | 删 `membership:` + `membership-sub:` |

`mode=payment` tip/sanctuary 分支不变。

## 本地 / Test Mode 验收（禁止生产裸测）

1. `wrangler dev` + Stripe **Test** secret  
2. `stripe listen --forward-to http://127.0.0.1:8787/api/stripe-webhook` → 用 CLI 的 `whsec_` 作本地 `STRIPE_WEBHOOK_SECRET`  
3. 真实 Test Checkout → confirm + webhook 双写 KV  
4. Dashboard：拒付 / 取消 → 观察 failed 戳 vs deleted 删 key  
5. 负向：错 whsec → 400；tip/sanctuary 回归仍绿  

## 部署清单（须人工）

1. Stripe Dashboard（Sandbox）：建 **recurring** Price → 填 `wrangler.jsonc` `vars.STRIPE_MEMBERSHIP_PRICE_ID`  
   - 已写入 Sandbox Price：`price_1U2r5lFuIhgJPGLiEPOhJbst`（2026-08-10）
2. `MEMBERSHIP_KV` 已创建（2026-08-10）：`id=331994910f30411393e241c1252d85e6` · `preview_id=5496acb38b20430b936e700e598d3c6a`（本地 dev 不直连 remote）
3. secrets 沿用既有 `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`（Sandbox）；**生产 webhook 须订阅上表事件**
4. **生产 `npm run deploy`**：**已完成（2026-08-11）** · Version `2dc088de-3676-42b7-a885-3e490fb2f041` · tip 含 #226。  
   - **Wrangler 登录坑**：默认浏览器（Safari）须**先** logout 再登录 **ihiro / 163 Cloudflare**，然后再 `npx wrangler login`；否则 OAuth 会绑错 Google，deploy 到旁路账号。`itilbase@gmail.com` 只用于 **Stripe**，不能用来登 CF。  
   - 若报 `Unset the CLOUDFLARE_API_TOKEN`：当前终端先 `unset CLOUDFLARE_API_TOKEN` 再 login。  
5. 前端用户测：`VITE_CLOUD_API_BASE_URL=https://focus-tiger-cloud.ihiro.workers.dev`（本地 `.env.local`）；成功/cancel URL 已指向 `127.0.0.1:5173`  
6. Stripe Dashboard（同一 Sandbox webhook → `…/api/stripe-webhook`，帐号 **itilbase / AhoovaTech**）须包含：`checkout.session.completed`、`invoice.paid`、`invoice.payment_failed`、`customer.subscription.updated`、`customer.subscription.deleted`（与 tip 共用 URL，**不必**新建 endpoint）

### 用户验收（与 Tea 相同 · 短步骤 · 无需 stripe listen / 本地 wrangler）

1. `cd focus-tiger && npm run dev`（`.env.local` → ihiro Worker）  
2. 打开 `http://127.0.0.1:5173/?product=1`  
3. Support / ⋯ → Yin Membership → Subscribe → Test 卡付完（Stripe = itilbase Sandbox）  
4. 回跳后进阶应解锁（靠 `confirm-membership-session`；Webhook 异步写 KV）

## Pricing (display)

- UI：文案写「Subscription · price set in Stripe」——**未**锁死展示金额（与 Dashboard Price 对齐后再改 locale）
- Worker：`STRIPE_MEMBERSHIP_PRICE_ID`

## Next

- Prompt 10：真实 `EntitlementProvider` 轮询 / Customer Portal 自助管理  
- Ambient 等下游统一改读 `isEntitled`（见 `FREE_PAID_MATRIX.md`）
