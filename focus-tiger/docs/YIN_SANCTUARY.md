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

## Pricing (display)

- UI：`SANCTUARY_LIFETIME_PRICE_USD` = **89.99**（与 Dashboard Lifetime Price 对齐）
- Worker：`STRIPE_SANCTUARY_PRICE_ID`（见 `cloud/wrangler.jsonc`）

## Prestigious badges（素材 · 2026-08-09）

> **状态**：**仅入库**，未接线授予 / 展示。  
> **路径**：`public/ui/support/sanctuary-badges/`（17 枚 · kebab-case PNG · 清单见 `ASSET_INVENTORY.md`）。  
> **与 Tip**：Tea 用 `yin-badges/`；Sanctuary 用本目录——**两套视觉**；gate **零耦合**（本模块仍不得读 `tipJarGate`）。  
> **schema**：当前 entitlement **无** `badgeIds`；独立 `badgeIds` 属下一正式任务（见下）。

## Next

- 部署：Lifetime Price + `SANCTUARY_KV` 真实 id + secrets（KV / Price ID 已写入 wrangler；须 `wrangler deploy`）  
- Ambient / 动画消费 `isSanctuaryUnlocked`（深度曲目等）  
- **正式任务（已立项、未开工）**：统一练习徽章体系 — 免费起 1 / 付费（Tea 或 Sanctuary）起 3 / 练习上涨自动加枚 / Sanctuary 独立 `badgeIds`；Brief：`docs/task-briefs/task-unified-practice-badges.md`  

