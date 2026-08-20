# Monetization Intent Funnel · 付费意愿漏斗

> **状态（2026-08-20）**：本地漏斗 **#255 已合**；opt-in 回传 **#262 已合**；**Support layout 维**（`tea-first` / `sanctuary-first`）**#378 已合** tip `8535da1`（Brief `task-support-funnel-layout.md`）。现网 Worker **尚未** Redeploy 该 ingest（仍 Version `5b5b3451-4c35-4d9b-b27b-622b72ed673e`）；用户已书面「部署」，Cloud Agent 无 Cloudflare token，须本机对 **163 / ihiro** 帐号 `npm run deploy`。  
> **性质**：本地埋点 + 可选自有 Worker 聚合；**无第三方**；不改变支付行为。  
> **对照**：留存漏斗见 `RETENTION_FUNNEL.md`（另一套事件）。  
> **隐私**：默认**不上报**；须 Privacy 页明示同意（`MVP_PRODUCT_DEFINITION` §六）。

## 节点

| 事件名 | 触发 | `track` | `layout` |
|---|---|---|---|
| `support_open` | Support Yin FAB 打开 Modal | —（`source=fab`） | `tea-first` / `sanctuary-first`（当时三卡顺序） |
| `support_cta` | Modal 卡 CTA（开 Tip / Sanctuary / Membership 卡） | `tea` / `sanctuary` / `membership` | 同上 |
| `checkout_start` | 卡内确认后拿到 Stripe Checkout URL、即将跳转 | 同上 | 可选；Tip/Sanctuary/Membership 卡不强制带 |
| `checkout_complete` | 回跳成功（Tea optimistic / Sanctuary·Membership server confirm） | 同上 | 可选 |
| `checkout_cancel` | Tea 回跳 cancel | `tea` | 可选 |

计数键：

- 无维 → `support_open`
- track → `support_cta:tea`
- layout → `support_open:tea-first`
- 交叉 → `support_cta:tea:tea-first`（看客单有没有被请茶优先带崩：比较 `support_open:tea-first` vs `support_cta:tea:tea-first`）

## 存储（本地）

`focus-tiger.monetization-funnel.v1`：

```ts
{
  counts: Record<string, number>,
  events: { at, name, track, source, layout }[] // 最多 80
}
```

Opt-in：`focus-tiger.monetization-funnel-opt-in.v1` → `{ enabled, consentedAt, clientId, lastUploadAt, lastUploadError }`（默认 `enabled=false`）。

二者均纳入 DEV「重置全部本地状态」白名单。

## 两条云路径（禁止混绑）

| 路径 | 同意入口 | 载荷 | 用途 |
|---|---|---|---|
| **意愿漏斗** | Privacy `#privacy-monetization-funnel-opt-in-toggle`（默认关） | 匿名 `counts` + 最近事件（白名单字段，含 `layout`） | 运营看 Support 转化 |
| **练习记忆联网备份** | Journey Log 邮箱 OTP | **精确 6 key**（journey-log / practice-days / milestone-glow / entitlement-ownership / ritual-completions / mustard-seed-seal） | 本机被清后恢复练习 |

漏斗键 **不在** 备份白名单。打开联网备份 **不会** 自动上传漏斗，也 **不会** 打开 Privacy 漏斗开关。没有漏斗同意 → layout 只在本机 `localStorage` / 实验室面板，KV 里没有可汇总的客单维。

## Opt-in 回传

| 项 | 口径 |
|---|---|
| 入口 | `#onboarding-privacy-sheet` 开关 `#privacy-monetization-funnel-opt-in-toggle` |
| 载荷 | `schemaVersion=1` + 匿名 `clientId` + `counts` + 最近 ≤20 事件（`at/name/track/source/layout`） |
| 禁止 | 邮箱、支付 id、反思/意图自由文本、第三方 SDK |
| API | `POST /api/monetization-funnel-ingest` → KV `funnel:v1:{day}:{clientId}`（`TIP_KV` 命名空间隔离；TTL 90 天） |
| 节流 | 约 60s；`checkout_start` / `checkout_complete` 可立即尝试 |
| Cloud 未配 | 同意可开；flush 记 `cloud_api_unconfigured`，不打扰练习 |
| 生产 Worker | `develop` 源码白名单已含 layout 计数键（#378）。**现网仍是旧 Worker** Version `5b5b3451-4c35-4d9b-b27b-622b72ed673e`，会丢掉 `support_open:tea-first` 等键。本机 Redeploy 成功前 KV **不能**汇总客单 layout |

## DEV 面板

实验室（无 `?product=1`）：顶栏 **意愿漏斗** → `alert` + `console.log`（含 opt-in 摘要）。  
控制台：`window.__monetizationFunnel` / `window.__monetizationFunnelOptIn`。  
摘要行示例：`support_open layout=tea-first @fab`。

## 代码

- `src/core/monetizationIntentFunnel.js`
- `src/core/monetizationFunnelOptIn.js`
- `src/core/monetizationFunnelUpload.js`
- `src/core/supportModalLead.js`（`supportModalFunnelLayout`）
- Worker：`cloud/src/routes/monetizationFunnelIngest.ts` + `cloud/src/lib/monetizationFunnelKv.ts`
- 接线：`SupportYinModalUI`（open / CTA 带 layout）/ Tip·Sanctuary·Membership 卡 / `main` boot + Privacy sheet
