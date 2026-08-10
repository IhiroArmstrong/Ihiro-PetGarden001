# Yin Membership · 订阅（B 轨 · 订阅付费方式）

> **状态（2026-08-10）**：Checkout + confirm + verify + 成功页写 entitlement 缓存于 `feature/yin-membership-checkout`。  
> **性质**：与 **Sanctuary Lifetime** 解锁**同一套**进阶内容（lifetime ∪ subscription 互覆盖）。  
> **验证强度**：与 Sanctuary 相同——**禁止**乐观 query 解锁；须服务端 confirm。  
> **零耦合**：不得 import / 读取 `tipJarGate`。  
> **本期范围**：创建订阅 + 成功页立刻本地解锁。续费/取消 webhook 生命周期 → Prompt 9；真实 provider 轮询 → Prompt 10。

## Schema

### Worker KV · `membership:{normalizedEmail}`

```ts
{
  active: true,
  periodEndsAt: string, // ISO
  planId: string,       // default yin-membership
  receiptId: string,    // Checkout Session id
  subscriptionId: string
}
```

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

## Client

- `MembershipUnlockUI` / `#yin-membership-card`（Idle ⋯ / 抽屉 `membership` + Support 卡）
- 回跳：`?membership_session={CHECKOUT_SESSION_ID}` → `confirmMembershipReturnQuery` → **仅**服务端 confirm 成功后 `markMembershipFromPayment`
- 取消：`?membership=cancel`（不写缓存）
- 跨设备：邮箱 → `POST /api/verify-membership` → 同上 patch

## Cloud

| 项 | Membership | Sanctuary（对照） |
|---|---|---|
| Price var | `STRIPE_MEMBERSHIP_PRICE_ID`（**recurring**） | `STRIPE_SANCTUARY_PRICE_ID`（one-time） |
| KV | `MEMBERSHIP_KV` · `membership:{email}` | `SANCTUARY_KV` · `sanctuary:{email}` |
| Create | `/api/create-membership-checkout-session` | `/api/create-sanctuary-checkout-session` |
| Confirm | `/api/confirm-membership-session` | `/api/confirm-sanctuary-session` |
| Restore | `/api/verify-membership` | `/api/verify-sanctuary` |
| metadata | `product=membership` · `planId=yin-membership` | `product=sanctuary` |
| Checkout `mode` | `subscription` | `payment` |

Confirm 额外拉取 Stripe Subscription：`status` ∈ `active|trialing`，并用 `current_period_end` → `periodEndsAt`。

Webhook：本期仍忽略 `mode !== payment`（续费/取消留给 Prompt 9）。

## 部署清单（须人工）

1. Stripe Dashboard（Sandbox）：建 **recurring** Price → 填 `wrangler.jsonc` `vars.STRIPE_MEMBERSHIP_PRICE_ID`  
   - 已写入 Sandbox Price：`price_1U2r5lFuIhgJPGLiEPOhJbst`（2026-08-10）
2. `cd focus-tiger/cloud && npx wrangler kv namespace create MEMBERSHIP_KV`（+ `--preview`）→ 替换 wrangler 占位 id
3. secrets 沿用既有 `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`（Sandbox）
4. **生产 `npm run deploy` 延后到 Prompt 9（webhook 续费/取消）之后**；此前勿发 Membership 到线上 Worker
5. 前端 `VITE_CLOUD_API_BASE_URL` 指向 Worker；生产 success/cancel URL / `ALLOWED_ORIGIN` 按环境改 vars

## Pricing (display)

- UI：文案写「Subscription · price set in Stripe」——**未**锁死展示金额（与 Dashboard Price 对齐后再改 locale）
- Worker：`STRIPE_MEMBERSHIP_PRICE_ID`

## Next

- Prompt 9：webhook 续费 / 取消 / 过期写 `MEMBERSHIP_KV` + 可选回写指引  
- Prompt 10：真实 `EntitlementProvider` 轮询 / 校验  
- Ambient 等下游统一改读 `isEntitled`（见 `FREE_PAID_MATRIX.md`）
