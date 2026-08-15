# Focus Tiger · Cloudflare Workers (`cloud/`)

独立 API（TypeScript + Wrangler）。含历史 stub 路由 + **Buy Yin a Tea · Tip Jar** + **Yin's Sanctuary Lifetime** + **Yin Membership**（Stripe Checkout + 分 KV）。

权威产品/部署说明：[`../docs/YIN_TIP_JAR.md`](../docs/YIN_TIP_JAR.md) · [`../docs/YIN_SANCTUARY.md`](../docs/YIN_SANCTUARY.md) · [`../docs/YIN_MEMBERSHIP.md`](../docs/YIN_MEMBERSHIP.md) · 密钥隔离：[`../docs/ENV_CONFIG.md`](../docs/ENV_CONFIG.md)。

## 前置

- Node.js 18+（建议 20+）
- 在本目录安装依赖：

```bash
cd focus-tiger/cloud
npm install
```

## 本地启动

```bash
cd focus-tiger/cloud
npm run dev
# 等价：npx wrangler dev
```

默认监听 **`http://127.0.0.1:8787`**（以终端输出为准）。

健康检查：

```bash
curl -s http://127.0.0.1:8787/health
# {"ok":true,"service":"focus-tiger-cloud"}
```

## 路由一览

| Method | Path | 说明 |
|---|---|---|
| `GET` | `/health` | 健康检查 |
| `POST` | `/api/daily-message` | stub（mock） |
| `POST` | `/api/emotion-weight` | stub（mock） |
| `POST` | `/api/monetization-funnel-ingest` | 意愿漏斗 opt-in 快照 → `TIP_KV` 键 `funnel:v1:{day}:{clientId}`（TTL 90d） |
| `POST` | `/api/create-tip-checkout-session` | Stripe Checkout（`mode: payment`）→ `{ url }` |
| `POST` | `/api/create-sanctuary-checkout-session` | Stripe Checkout（`mode: payment` Lifetime）→ `{ url }` |
| `POST` | `/api/create-membership-checkout-session` | Stripe Checkout（`mode: subscription`）→ `{ url }` |
| `POST` | `/api/confirm-sanctuary-session` | `{ sessionId }` → 服务端校验后解锁 |
| `POST` | `/api/confirm-membership-session` | `{ sessionId }` → 校验 subscription active；成功可返回 `email`+`deviceToken` |
| `POST` | `/api/membership-entitlement` | `{ email, deviceToken }` → subscription entitlement（provider 轮询） |
| `POST` | `/api/create-membership-portal-session` | `{ email, deviceToken }` → Stripe Billing Portal `{ url }` |
| `POST` | `/api/stripe-webhook` | Stripe 验签 → tip/sanctuary（payment）+ Membership 订阅生命周期（`MEMBERSHIP_KV`） |
| `POST` | `/api/verify-tip` | `{ email }` → `{ tipped, … }` |
| `POST` | `/api/restore/request-otp` | `{ email, purpose }` → 恒 `{ ok: true }`；有权益时写 OTP 哈希并用 `waitUntil` 调 Resend（防时序侧信道） |
| `POST` | `/api/verify-sanctuary` | `{ email, code }` → OTP 通过后才 lookup → `{ unlocked, … }` |
| `POST` | `/api/verify-membership` | `{ email, code }` → OTP 通过后才 lookup；成功可返回 `deviceToken` |
| `POST` | `/api/practice-backup/request-otp` | `{ email }` → 恒 `{ ok: true }`；**无权益门闩**；`purpose: practice-backup` |
| `POST` | `/api/practice-backup/verify` | `{ email, code }` → `{ deviceToken }`（~30d） |
| `POST` | `/api/practice-backup/put` | `{ email, deviceToken, snapshot }` → 写 `PRACTICE_BACKUP_KV` 最新整包 |
| `POST` | `/api/practice-backup/get` | `{ email, deviceToken }` → `{ snapshot }` |
| `POST` | `/api/practice-backup/delete` | `{ email, code }` 或 `{ email, deviceToken }` → 删云端快照（关闭备份） |
| `POST` | `/api/newsletter/subscribe` | `{ email, locale? }` → `{ ok: true }`；新订阅写入 `NEWSLETTER_KV` 并用 `waitUntil` 发 Resend 欢迎信（含退订链接） |
| `GET`/`POST` | `/api/newsletter/unsubscribe` | `?token=` → HTML 退订页（GET）或 `{ ok: true }`（POST one-click）；从 KV 删除 |

### 限流

| 路由 | 限流 |
|---|---|
| 默认 API | 60/min（内存；按 IP / Bearer） |
| `/api/verify-*` / `/api/confirm-*` | **10/min/IP**（单独桶） |
| `/api/restore/request-otp` | **5/min/IP** + KV 层 60s/email cooldown + 5/hour/email |
| `/api/newsletter/subscribe` | **5/min/IP**（防 Resend 刷信） |
| `/api/newsletter/unsubscribe` | **10/min/IP** |
| `/api/stripe-webhook` | **豁免全局**；仍 **300/min/IP**（防 HMAC 刷量） |

## Stub 接口（仍保留）

| Method | Path | 必需 JSON 字段 | 固定响应 |
|---|---|---|---|
| `POST` | `/api/daily-message` | `locale`, `localDate` | `{ "message": "mock", "variantSeed": "0" }` |
| `POST` | `/api/emotion-weight` | `emotionKey`, `sessionPhase` | `{ "variant": "default", "weight": 1.0 }` |

## 目录结构

```
cloud/
  wrangler.jsonc      # TIP_KV + SANCTUARY_KV + MEMBERSHIP_KV
  src/
    index.ts
    types.ts
    lib/http.ts | validate.ts | cors.ts | stripe.ts | tipKv.ts | sanctuaryKv.ts | membershipKv.ts
    middleware/rateLimit.ts
    routes/…
```

## 部署摘要

> **何时允许执行**：见仓库根 `WORKFLOW.md`「生产 Worker Redeploy」（`RULES_INDEX` → `prod-worker-deploy`）。须用户当回合明确说「部署」；合入 `develop` / CI 绿 **不**授权本步。  
> **当前生产**（2026-08-15）：`https://focus-tiger-cloud.ihiro.workers.dev` · Version `8c649d12-1c1c-4d45-b9f4-92cd75686e81`（含 `/api/newsletter/subscribe` + `/api/newsletter/unsubscribe`）。

```bash
# Membership recurring Price → wrangler.jsonc vars.STRIPE_MEMBERSHIP_PRICE_ID
npx wrangler kv namespace create MEMBERSHIP_KV
npx wrangler kv namespace create MEMBERSHIP_KV --preview
# 替换 wrangler.jsonc 占位 id
npx wrangler secret put STRIPE_SECRET_KEY   # 若尚未配置
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npm run deploy
```

前端：`VITE_CLOUD_API_BASE_URL=<worker base>`。

**密钥**：客户端禁止 Secret；Worker 用 `wrangler secret put`。
