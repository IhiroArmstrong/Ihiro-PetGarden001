# Yin's Sanctuary · Lifetime（B 轨 · 买断付费方式）

> **状态（2026-08-07 夜）**：Unlock UI + 独立 Checkout / confirm / verify 路由于 `feature/yin-sanctuary-unlock`。  
> **性质**：深度音效 + 已划界非核心高级表现解锁（**B 轨 · 进阶内容**）。  
> **付费方式**：本文档描述 **Sanctuary Lifetime**（一次买断）这一 SKU。v1 另有 **Yin Membership** 订阅；二者解锁**同一套**进阶内容，**lifetime ∪ subscription 互相覆盖**（不是「订阅少一档」）。见 `MVP_PRODUCT_DEFINITION.md` §五 / 技术方向 Brief。  
> **零耦合**：不得 import / 读取 `tipJarGate`；见技术方向 Brief §2.6 Code Review 条款。

## Schema

`focus-tiger.sanctuary-entitlement.v1`：

```ts
{
  unlocked: boolean,
  unlockedVia: 'payment' | 'preview',
  unlockedAt: string,
  itemId: string,
  badgeIds: string[] // prestigious badges · sanctuary-badges/ catalog · only-grow
}
```

## Client

- `SanctuaryUnlockUI` / `#yin-sanctuary-card`（Idle ⋯ / 抽屉 `sanctuary`）
- 回跳：`?sanctuary_session={CHECKOUT_SESSION_ID}` → `confirmSanctuaryReturnQuery` → **仅**服务端 confirm 成功后 `markSanctuaryFromPayment`（授 ≥3 枚尊贵章）
- **致谢动画（2026-08-11）**：confirm 成功后播 `mindfulAcknowledge`（`nod-bow`）；回跳期间跳过冷启动欢迎（`paymentCheckoutThanks.js`）
- **禁止**乐观 query 解锁（与 tip `?tip=1` 不同）
- **跨设备恢复**：`POST /api/restore/request-otp` `{ email, purpose: "sanctuary" }` → 邮箱收 6 位码 → `POST /api/verify-sanctuary` `{ email, code }`（**禁止**裸邮箱 lookup；Tip 仍可用 `/api/verify-tip`）
- 练习上涨：`syncSanctuaryBadgesFromPractice`（卡内 + Idle 阿寅旁优先展示 Sanctuary 章）

## Prestigious badges

> **状态**：素材已入库；**授予/UI 已接线**（`feature/unified-practice-badges`）。  
> **路径**：`public/ui/support/sanctuary-badges/`（17 枚 · 与 tip `yin-badges/` **两套视觉**；清单见 `ASSET_INVENTORY.md`）  
> **算法**：`sanctuaryBadges.js` — 付费/preview 起 3；`3 + floor(score/3)` 夹到 17；只增不减  
> **零耦合**：badgeIds 写在本 entitlement；**禁止** tip gate 读写  

## Cloud

| 项 | Sanctuary | Tip（对照） |
|---|---|---|
| Price var | `STRIPE_SANCTUARY_PRICE_ID` | `STRIPE_PRICE_ID` |
| KV | `SANCTUARY_KV` · `sanctuary:{email}` | `TIP_KV` · `tip:{email}` |
| Create | `/api/create-sanctuary-checkout-session` | `/api/create-tip-checkout-session` |
| Confirm | `/api/confirm-sanctuary-session` | （tip 可用乐观 + verify） |
| Restore | `/api/restore/request-otp` + `/api/verify-sanctuary` `{email,code}` | `/api/verify-tip`（无 OTP） |
| metadata | `product=sanctuary` | `product=tip` |

Webhook 按 `metadata.product` 分流；缺省按 tip（兼容旧 tip session）。

## Pricing (display)

- UI：`SANCTUARY_LIFETIME_PRICE_USD` = **89.99**（与 Dashboard Lifetime Price 对齐）
- Worker：`STRIPE_SANCTUARY_PRICE_ID`（见 `cloud/wrangler.jsonc`）

## Next

- 部署：Lifetime Price + `SANCTUARY_KV` 真实 id + secrets（KV / Price ID 已写入 wrangler；须 `wrangler deploy`）  
- Ambient / 动画消费 `isSanctuaryUnlocked`（深度曲目等）  
- 统一练习徽章体系 Brief：`docs/task-briefs/task-unified-practice-badges.md`（本支实现）  

