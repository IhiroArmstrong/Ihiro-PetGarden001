# Focus Tiger · Cloudflare Workers (`cloud/`)

独立 API（TypeScript + Wrangler）。含历史 stub 路由 + **Buy Yin a Tea · Tip Jar**（一次性 Stripe Checkout + KV）。

权威产品/部署说明：[`../docs/YIN_TIP_JAR.md`](../docs/YIN_TIP_JAR.md)（§ 部署 · 任务 5）· 密钥隔离：[`../docs/ENV_CONFIG.md`](../docs/ENV_CONFIG.md)。

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

Checkout / webhook 需配置 `STRIPE_*` secrets 与真实 KV id（见 `YIN_TIP_JAR.md` § 部署 · 任务 5）。**代码 alone 无法完成真实收款。**

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

## 部署（任务 5 · 完整清单）

逐步清单以 **`docs/YIN_TIP_JAR.md` § 部署** 为准。摘要：

```bash
# 1) Stripe Test：建 $9.99 one-time Price → 填 wrangler.jsonc vars.STRIPE_PRICE_ID
# 2) npx wrangler kv namespace create TIP_KV（+ --preview）→ 替换 wrangler.jsonc 占位 id
# 3) secrets
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
# 4) npm run deploy → workers.dev
# 5) Stripe Webhook → https://<worker>/api/stripe-webhook
# 6) 前端 VITE_CLOUD_API_BASE_URL=<worker base>
```

先用 **workers.dev** 验证；正式域名另开任务。  
Sanctuary Lifetime **另** Price / KV / 路由——勿复用本 Tip 配置当解锁凭证。

## 与前端的关系

可选接线：Vite `VITE_CLOUD_API_BASE_URL`（公开 base）。未配置时免费主路径不变；Tip Jar 卡提示「未配置」。

**密钥**：客户端禁止 Secret；Worker 用 `wrangler secret put`。
