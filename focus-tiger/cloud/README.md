# Focus Tiger · Cloudflare Workers (`cloud/`)

独立 API（TypeScript + Wrangler）。含历史 stub 路由 + **Buy Yin a Tea · Tip Jar**（一次性 Stripe Checkout + KV）。

权威产品/部署说明：[`../docs/FOUNDER_SUPPORTER_PACK.md`](../docs/FOUNDER_SUPPORTER_PACK.md) · 密钥隔离：[`../docs/ENV_CONFIG.md`](../docs/ENV_CONFIG.md)。

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
| `POST` | `/api/create-tip-checkout-session` | Stripe Checkout（one-time）→ `{ url }` |
| `POST` | `/api/stripe-webhook` | Stripe 验签 → 写 `TIP_KV` |
| `POST` | `/api/verify-tip` | `{ email }` → `{ tipped, lastTippedAt? }` |

### Tip Jar 限流

| 路由 | 限流 |
|---|---|
| 默认 API | 60/min（内存；按 IP / Bearer） |
| `/api/verify-tip` | **10/min/IP**（单独桶） |
| `/api/stripe-webhook` | **豁免全局**；仍 **300/min/IP**（防 HMAC 刷量） |

### curl：邮箱核验（无记录时）

```bash
curl -s -X POST http://127.0.0.1:8787/api/verify-tip \
  -H 'content-type: application/json' \
  -d '{"email":"nobody@example.com"}'
# {"tipped":false}
```

Checkout / webhook 需配置 `STRIPE_*` secrets 与真实 KV id（见 `FOUNDER_SUPPORTER_PACK.md` §6）。

## Stub 接口（仍保留）

| Method | Path | 必需 JSON 字段 | 固定响应 |
|---|---|---|---|
| `POST` | `/api/daily-message` | `locale`, `localDate` | `{ "message": "mock", "variantSeed": "0" }` |
| `POST` | `/api/emotion-weight` | `emotionKey`, `sessionPhase` | `{ "variant": "default", "weight": 1.0 }` |

## 目录结构

```
cloud/
  wrangler.jsonc      # Worker 名 focus-tiger-cloud + TIP_KV
  src/
    index.ts
    types.ts
    lib/http.ts | validate.ts | cors.ts | stripe.ts | tipKv.ts
    middleware/rateLimit.ts
    routes/dailyMessage.ts | emotionWeight.ts
    routes/createTipCheckoutSession.ts | stripeWebhook.ts | verifyTip.ts
```

## 部署

```bash
# 1) 替换 wrangler.jsonc 中 KV 占位 id
# 2) secrets
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
# 3)
npm run deploy
```

先用 **workers.dev** 验证；正式域名另开任务。

## 与前端的关系

可选接线：Vite `VITE_CLOUD_API_BASE_URL`（公开 base）。未配置时免费主路径不变；Founder 面板提示「未配置」。

**密钥**：客户端禁止 Secret；Worker 用 `wrangler secret put`。
