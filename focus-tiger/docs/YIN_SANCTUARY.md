# Yin's Sanctuary · Lifetime

> **状态（2026-08-07 夜）**：Unlock UI + 独立 Checkout / confirm / verify 路由于 `feature/yin-sanctuary-unlock`。  
> **性质**：深度音效 + 已划界非核心高级表现解锁；**仅 Lifetime**。  
> **零耦合**：不得 import / 读取 `tipJarGate`；见技术方向 Brief §2.6 Code Review 条款。

## Schema

`focus-tiger.sanctuary-entitlement.v1`：

```ts
{ unlocked: boolean, unlockedVia: 'payment' | 'preview', unlockedAt: string, itemId: string }
```

## Client

- `SanctuaryUnlockUI` / `#yin-sanctuary-card`（Idle ⋯ / 抽屉 `sanctuary`）
- 回跳：`?sanctuary_session={CHECKOUT_SESSION_ID}` → `confirmSanctuaryReturnQuery` → **仅**服务端 confirm 成功后 `markSanctuaryFromPayment`
- **禁止**乐观 query 解锁（与 tip `?tip=1` 不同）

## Cloud

| 项 | Sanctuary | Tip（对照） |
|---|---|---|
| Price var | `STRIPE_SANCTUARY_PRICE_ID` | `STRIPE_PRICE_ID` |
| KV | `SANCTUARY_KV` · `sanctuary:{email}` | `TIP_KV` · `tip:{email}` |
| Create | `/api/create-sanctuary-checkout-session` | `/api/create-tip-checkout-session` |
| Confirm | `/api/confirm-sanctuary-session` | （tip 可用乐观 + verify） |
| Restore | `/api/verify-sanctuary` | `/api/verify-tip` |
| metadata | `product=sanctuary` | `product=tip` |

Webhook 按 `metadata.product` 分流；缺省按 tip（兼容旧 tip session）。

## Next

- 部署：创建 Lifetime Price + `SANCTUARY_KV` 真实 id + secrets  
- Ambient / 动画消费 `isSanctuaryUnlocked`（深度曲目等）  
- 定价数字拍板后改 `SANCTUARY_LIFETIME_PRICE_USD` 展示  
