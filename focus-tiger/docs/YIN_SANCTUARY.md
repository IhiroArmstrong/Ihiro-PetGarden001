# Yin's Sanctuary · Lifetime

> **状态（2026-08-07）**：脚手架于 `feature/yin-sanctuary-lifetime`。  
> **性质**：深度音效 + 已划界非核心高级表现解锁；**仅 Lifetime**。  
> **零耦合**：不得 import / 读取 `tipJarGate`；见技术方向 Brief §2.6 Code Review 条款。

## Schema

`focus-tiger.sanctuary-entitlement.v1`：

```ts
{ unlocked: boolean, unlockedVia: 'payment' | 'preview', unlockedAt: string, itemId: string }
```

## Next

- **部署（对标 Tip 任务 5）**：另建 Lifetime Price + 独立 KV + secrets / webhook 分支；**禁止**复用 `TIP_KV` / tip `STRIPE_PRICE_ID` 当解锁凭证  
- Stripe Lifetime Checkout + confirm-session（禁止乐观 query 解锁真内容）  
- SanctuaryUnlockUI + ambient / 动画消费 `isSanctuaryUnlocked`  
- 与 tip-jar **分 Price / 分 KV / 分路由**；可共享 `cloud` payment 工具层  
