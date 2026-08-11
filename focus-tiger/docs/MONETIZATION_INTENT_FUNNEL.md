# Monetization Intent Funnel · 付费意愿漏斗（本地）

> **状态（2026-08-12）**：本地漏斗已合 #255；**opt-in 回传**本支 `feature/monetization-funnel-optin-upload`  
> **性质**：本地埋点 + DEV 可读面板；**无第三方 SDK**；不改变支付行为。  
> **对照**：留存漏斗见 `RETENTION_FUNNEL.md`（另一套事件）。  
> **回传**：Privacy 页明示开关（默认关）。开启后仅上报匿名 `counts` 增量 → `POST /api/monetization-funnel-ingest`。Brief：`task-monetization-funnel-optin-upload.md`。

## 节点

| 事件名 | 触发 | `track` |
|---|---|---|
| `support_open` | Support Yin FAB 打开 Modal | —（`source=fab`） |
| `support_cta` | Modal 卡 CTA（开 Tip / Sanctuary / Membership 卡） | `tea` / `sanctuary` / `membership` |
| `checkout_start` | 卡内确认后拿到 Stripe Checkout URL、即将跳转 | 同上 |
| `checkout_complete` | 回跳成功（Tea optimistic / Sanctuary·Membership server confirm） | 同上 |
| `checkout_cancel` | Tea 回跳 cancel | `tea` |

计数键：无 track → `support_open`；有 track → `support_cta:tea` 等。

## 存储

`focus-tiger.monetization-funnel.v1`：

```ts
{
  counts: Record<string, number>,
  events: { at, name, track, source }[] // 最多 80
}
```

纳入 DEV「重置全部本地状态」白名单。

## DEV 面板

实验室（无 `?product=1`）：顶栏 **意愿漏斗** → `alert` + `console.log` 摘要。  
控制台：`window.__monetizationFunnel.formatSummary()` / `.read()`。

## 代码

- `src/core/monetizationIntentFunnel.js`
- 接线：`SupportYinModalUI` / `TipJarUI` / `SanctuaryUnlockUI` / `MembershipUnlockUI` / `main` boot return

## Opt-in 回传（v1）

- Consent：`focus-tiger.monetization-funnel-consent.v1`（`optedIn` 默认 false + `installId`）
- UI：`#onboarding-privacy-sheet` 开关 `#privacy-funnel-optin`
- API：`POST /api/monetization-funnel-ingest`（counts 白名单；写 `TIP_KV` 前缀 `analytics:monetization-funnel:`）
- 生产需 Worker redeploy 后才真正入库
