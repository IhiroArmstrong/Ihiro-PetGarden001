# Founder Supporter Pack（一次性创始支持）

> **状态（2026-08-06）**：实现于 `feature/founder-supporter-pack`；价格 **USD $9.99** 一次性（非订阅）。  
> 解锁范围：**静态徽章 + 永久纪念文案**。不解锁音效 / 高级情绪动画 / AI Coach。

## 1. 产品边界

| 做 | 不做 |
|---|---|
| Stripe Checkout `mode=payment` | 订阅 / Customer Portal / 续费 |
| KV 存 `email → purchased` | D1 / 账号密码 / OAuth / 设备指纹 |
| 邮箱查找恢复（非登录） | 魔法链接 / 邮箱验证码 |
| 徽章 + 纪念文案 | 实质内容付费墙 |

## 2. 验证强度（必读）

此验证强度**仅适用于**无实质价值的徽章类解锁。

乐观写本地：支付成功回跳 `?supporter=1` 即写 `localStorage`，**不**向 Stripe 再校验 session。任何人可在地址栏拼该 query「免费」亮徽章——与 `flowerWelcomeGate` 同级克制，可接受前提是徽章无实质内容价值。

**未来若用于解锁真实付费内容（音效 / 动画等），必须先补 `POST /api/confirm-checkout-session` 服务端校验，禁止直接套用本乐观方案。**

代码注释 SSOT：`src/core/supporterGate.js` 文件头。

## 3. 架构要点

```
POST /api/create-checkout-session  → Stripe Checkout URL
POST /api/stripe-webhook           → 验签 → SUPPORTER_KV put
POST /api/verify-supporter         → KV get by email（恢复）
```

- KV key：`supporter:{normalizedEmail}`  
- Value：`{ purchased: true, purchasedAt, receiptId }`（`receiptId` = Checkout Session id）  
- 限流：全局 60/min；`verify-supporter` **10/min/IP**；webhook **豁免全局**但仍 **300/min/IP**（防签名验证刷量）  
- 前端：`supporterGate.js` + `SupporterPackUI`；Idle ⋯ / 抽屉「Founder supporter」

## 4. 税务 / 收据（本次明确不做）

- **不**启用 Stripe Tax。  
- **不**自建收据邮件流水线。  
- Stripe 默认可能向买家发送付款确认邮件（Stripe 侧行为，无需本仓库额外开发）。  
- 当地发票 / 税务合规：产品方自行或请专业人士确认；本包不做法律建议，仅记账「暂不做」。

## 5. KV 延迟文案

Cloudflare KV 全球写入可能延迟（常见约数十秒级）。邮箱找回 UI 已提示：「付款后可能需要几分钟才能在其他设备找回」。

## 6. 部署 checklist（workers.dev 先）

### 6.1 谁必须动手？

**不是**整份清单都要你手搓。Agent **不能**代替的只有「账号授权 + 密钥材料」；命令与接线可代跑。

| 你必须提供 / 点一次 | Agent 可代做（有授权后） |
|---|---|
| Cloudflare：本机执行一次 `npx wrangler login`（浏览器授权） | `kv namespace create`、改 `wrangler.jsonc`、设 vars、`wrangler deploy` |
| Stripe Test：账号里建好 **$9.99** one-time Price，或直接把 `price_…` 发给 Agent | 写入 `STRIPE_PRICE_ID`；用 API 创建 webhook endpoint（若给了 `sk_test_`） |
| 把 **`sk_test_…`**（及 webhook 返回的 **`whsec_…`**，若你在 Dashboard 自建）贴给 Agent 一次（聊天即可；**禁止**写进 git） | `wrangler secret put …`（stdin，不落盘进仓库）、本地 `.env.development` 的 `VITE_CLOUD_API_BASE_URL`（gitignored） |
| 用测试卡走完一次人工验收 | 部署后健康检查 / curl verify |

当前本机状态（2026-08-06）：**尚未** `wrangler login`；无 Stripe CLI；无环境里的 `STRIPE_*`。故部署卡在授权，不卡在代码。

### 6.2 步骤（有登录 + 密钥后按序）

1. Stripe **Test mode**：Product + **one-time** Price = **$9.99** → `price_…`  
2. `cd focus-tiger/cloud && npm install`  
3. `npx wrangler kv namespace create SUPPORTER_KV`  
4. `npx wrangler kv namespace create SUPPORTER_KV --preview`  
5. 把真实 id 写入 `wrangler.jsonc` 的 `kv_namespaces`（替换占位 `0000…01` / `0000…02`）  
6. 设置 vars：`STRIPE_PRICE_ID`、`CHECKOUT_SUCCESS_URL`、`CHECKOUT_CANCEL_URL`、`ALLOWED_ORIGIN`  
7. Secrets（stdin / Dashboard，**永不 commit**）：  
   `npx wrangler secret put STRIPE_SECRET_KEY`  
   `npx wrangler secret put STRIPE_WEBHOOK_SECRET`  
8. `npx wrangler deploy` → 记下 `*.workers.dev`  
9. Stripe Webhook → `https://<worker>/api/stripe-webhook`，事件：`checkout.session.completed`  
10. 前端 `.env.development`：`VITE_CLOUD_API_BASE_URL=https://<worker>`（或本地 `http://127.0.0.1:8787`）  
11. 测试卡走通 → Dashboard webhook 绿 → KV 有记录 → 第二浏览器邮箱找回  
12. **确认** `sk_test_` / `sk_live_` / `whsec_` **未**出现在任何 git 提交  

正式域名绑定另开任务。

### 6.3 未部署前仍可推进

- 产品壳 UI / 徽章乐观态 / 免费主路径：不依赖 Stripe，可在本 feature worktree 预览。  
- 合入 `develop`：仍须合前预览确认；**真收款验收**可在 workers.dev 配好后另开一轮。

## 7. 本地联调

```bash
# Terminal A
cd focus-tiger/cloud && npm run dev

# Terminal B — Vite
cd focus-tiger
# .env.development: VITE_CLOUD_API_BASE_URL=http://127.0.0.1:8787
npm run dev
```

Webhook 本地可用 Stripe CLI：`stripe listen --forward-to localhost:8787/api/stripe-webhook`。

## 8. 相关文件

| 路径 | 角色 |
|---|---|
| `cloud/src/routes/createCheckoutSession.ts` | 建 Checkout |
| `cloud/src/routes/stripeWebhook.ts` | 写 KV |
| `cloud/src/routes/verifySupporter.ts` | 邮箱恢复 |
| `src/core/supporterGate.js` | 本地状态 + 强度警示 |
| `src/ui/SupporterPackUI.js` | 徽章 / 购买 / 找回 UI |
| `docs/ENV_CONFIG.md` | 密钥隔离 |
