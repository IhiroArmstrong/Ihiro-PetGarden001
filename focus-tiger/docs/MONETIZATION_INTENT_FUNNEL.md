# Monetization Intent Funnel · 付费意愿漏斗

> **状态（2026-08-12）**：本地漏斗 **#255 已合** tip `fea9c11`；**opt-in 回传** 本支 `feature/monetization-intent-funnel-opt-in`（Brief `task-monetization-intent-funnel-opt-in.md`）。  
> **性质**：本地埋点 + 可选自有 Worker 聚合；**无第三方**；不改变支付行为。  
> **对照**：留存漏斗见 `RETENTION_FUNNEL.md`（另一套事件）。  
> **隐私**：默认**不上报**；须 Privacy 页明示同意（`MVP_PRODUCT_DEFINITION` §六）。

## 节点

| 事件名 | 触发 | `track` |
|---|---|---|
| `support_open` | Support Yin FAB 打开 Modal | —（`source=fab`） |
| `support_cta` | Modal 卡 CTA（开 Tip / Sanctuary / Membership 卡） | `tea` / `sanctuary` / `membership` |
| `checkout_start` | 卡内确认后拿到 Stripe Checkout URL、即将跳转 | 同上 |
| `checkout_complete` | 回跳成功（Tea optimistic / Sanctuary·Membership server confirm） | 同上 |
| `checkout_cancel` | Tea 回跳 cancel | `tea` |

计数键：无 track → `support_open`；有 track → `support_cta:tea` 等。

## 存储（本地）

`focus-tiger.monetization-funnel.v1`：

```ts
{
  counts: Record<string, number>,
  events: { at, name, track, source }[] // 最多 80
}
```

Opt-in：`focus-tiger.monetization-funnel-opt-in.v1` → `{ enabled, consentedAt, clientId, lastUploadAt, lastUploadError }`（默认 `enabled=false`）。

二者均纳入 DEV「重置全部本地状态」白名单。

## Opt-in 回传

| 项 | 口径 |
|---|---|
| 入口 | `#onboarding-privacy-sheet` 开关 `#privacy-monetization-funnel-opt-in-toggle` |
| 载荷 | `schemaVersion=1` + 匿名 `clientId` + `counts` + 最近 ≤20 事件（白名单字段） |
| 禁止 | 邮箱、支付 id、反思/意图自由文本、第三方 SDK |
| API | `POST /api/monetization-funnel-ingest` → KV `funnel:v1:{day}:{clientId}`（`TIP_KV` 命名空间隔离；TTL 90 天） |
| 节流 | 约 60s；`checkout_start` / `checkout_complete` 可立即尝试 |
| Cloud 未配 | 同意可开；flush 记 `cloud_api_unconfigured`，不打扰练习 |

## DEV 面板

实验室（无 `?product=1`）：顶栏 **意愿漏斗** → `alert` + `console.log`（含 opt-in 摘要）。  
控制台：`window.__monetizationFunnel` / `window.__monetizationFunnelOptIn`。

## 代码

- `src/core/monetizationIntentFunnel.js`
- `src/core/monetizationFunnelOptIn.js`
- `src/core/monetizationFunnelUpload.js`
- Worker：`cloud/src/routes/monetizationFunnelIngest.ts`
- 接线：`SupportYinModalUI` / Tip·Sanctuary·Membership 卡 / `main` boot + Privacy sheet
