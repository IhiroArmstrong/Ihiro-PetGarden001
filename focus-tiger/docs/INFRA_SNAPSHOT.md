# INFRA_SNAPSHOT — 基础设施现状摘要（非 SSOT）

> `RULES_INDEX` → topicId **`infra-snapshot`**。只写「现在是什么」；历史演变见 `PROCESS.md` / tracker。  
> **不得**替代：Secret **值**、KV 内用户数据、Stripe 控制台实时态、分支/worktree 占用。  
> 隔离**规则**仍读 [`ENV_CONFIG.md`](./ENV_CONFIG.md) §1。

| 字段 | 值 |
|---|---|
| `snapshot_base` | `origin/develop` tip `fc61fd7f` |
| `snapshot_date` | 2026-08-27 |
| `generated_by` | `manual`（首期纯手工；`infra:snapshot-sync` 第二期） |

**过期判定**：`git diff <snapshot_base>..HEAD -- <stale_after_paths>` 非空 → 本节摘要过期，须读 SSOT 或重填摘要。

---

## §1 Cloud / Worker

`last_sync`: 首版 · commit `fc61fd7f` · 2026-08-27  
`SSOT`: [`cloud/wrangler.jsonc`](../cloud/wrangler.jsonc) · [`cloud/src/index.ts`](../cloud/src/index.ts) · [`cloud/.env.example`](../cloud/.env.example)

| 项 | 现状 |
|---|---|
| Worker name | `focus-tiger-cloud` |
| Public URL | `https://focus-tiger-cloud.ihiro.workers.dev`（163 / ihiro Cloudflare；**勿**用旁路 `*.focus-tiger.workers.dev`） |
| `ALLOWED_ORIGIN`（vars） | `http://127.0.0.1:5173`（支持逗号列表；可含 `focus-tiger://app`；**生产名单变更须 redeploy**）。本地旁支 `:5174` 不在名单内 → 浏览器 CORS 拦结账；Vite dev 用同源 `/api` 代理，不扩生产 Origin。Checkout POST `pageOrigin` 仅改写 loopback success/cancel；**须 redeploy** 后 `:5174` 才不再被 Stripe 打回 `:5173`。 |
| KV bindings（7） | 见下表 |
| Checkout `vars` 接线 | Tip ✓ · Sanctuary ✓ · Membership ✓ · **Pro ✓** · **Companion Add-on ✓** |
| Secrets required（**仅名称**） | `STRIPE_SECRET_KEY` · `STRIPE_WEBHOOK_SECRET` · `RESEND_API_KEY` · `RESTORE_OTP_PEPPER` |
| Secrets 生产态（名称级） | `RESTORE_OTP_PEPPER` + `RESEND_API_KEY` **已 put**（2026-08-13）；Stripe secrets 生产已用（Tip/Sanctuary/Membership 路径） |
| `RESEND_FROM` / `NEWSLETTER_FROM`（vars） | `Yin <restore@twinsology.com>` · `Yin <hello@twinsology.com>`（Newsletter **禁止**回退 restore@） |
| 品味层 | `schemaVersion: 1` overlay；`/api/emotion-weight` · `/api/daily-message`；失败静默本地冻结表 |
| OTP / Newsletter 人工备注 | 无效邮箱 → 400；2026-08-16 Newsletter KV 写入 **测试 OK**；`wrangler login` 前 Safari 切 CF 帐号；有 `CLOUDFLARE_API_TOKEN` 须先 `unset` |

### KV bindings

| binding | prod `id`（前 8） | preview `id`（前 8） |
|---|---|---|
| `TIP_KV` | `e26fc50b` | `b9543c7c` |
| `SANCTUARY_KV` | `d337b4b1` | `d71d6fed` |
| `MEMBERSHIP_KV` | `33199491` | `5496acb3` |
| `OTP_KV` | `7d5acbe4` | `d0211c3d` |
| `PRACTICE_BACKUP_KV` | `f6f99774` | `5b9051e9` |
| `NEWSLETTER_KV` | `baeb661c` | `8e13fe05` |
| `YPE_PERSONALIZATION_KV` | `2b5d3c65` | `763411ae` |

### HTTP 路由（`index.ts` · 32 path handlers + webhook）

| 类 | paths |
|---|---|
| health | `GET /health` |
| Tip | `/api/create-tip-checkout-session` · `/api/verify-tip` |
| Sanctuary | `/api/create-sanctuary-checkout-session` · `/api/confirm-sanctuary-session` · `/api/verify-sanctuary` |
| Membership | `/api/create-membership-checkout-session` · `/api/confirm-membership-session` · `/api/verify-membership` · `/api/membership-entitlement` · `/api/create-membership-portal-session` |
| Pro | `/api/create-pro-checkout-session` · `/api/confirm-pro-session` |
| Companion Add-on | `/api/create-companion-addon-checkout-session` · `/api/confirm-companion-addon-session` · `/api/verify-companion-addon` |
| Restore OTP | `/api/restore/request-otp` |
| Practice backup | `/api/practice-backup/request-otp` · `verify` · `put` · `get` · `delete` |
| Taste layer | `/api/daily-message` · `/api/emotion-weight` |
| Funnel / YPE | `/api/monetization-funnel-ingest` · `/api/ype-personalization-ingest` · `/api/ype-personalization-delete` |
| Newsletter | `/api/newsletter/subscribe` · `/api/newsletter/unsubscribe` |
| Stripe | `POST /api/stripe-webhook` |

### 生产漂移（**仅用户口令「部署」+ redeploy 完成后人工更新**）

| 字段 | 值 |
|---|---|
| `prod_worker_version` | `d46b2dad-937b-412d-b0e3-7c09a80f94dc` |
| `prod_verified_at` | 2026-08-31（本机 `wrangler deploy` · `/checkout/desktop-return` HTTPS→`focus-tiger://` 桥接） |

| 源码 `develop` 有 · 生产 Version **可能未含** | 说明 |
|---|---|
| `monetization-funnel-ingest`（#378） | 现网旧 ingest 会丢 `tea-first` / `sanctuary-first` 计数键 |
| YPE L2 ingest/delete（#459–#460） | 须 KV 绑定 + redeploy 后生产才可用 |
| Pro / Companion Add-on checkout（#checkout 线） | `wrangler.jsonc` vars 已接线；**合 develop ≠ 生产已生效** |
| 请茶 `STRIPE_PRICE_ID` US$4.99 | 2026-08-20 deploy 已含；更早 Version 可能仍为旧价 |

---

## §2 Entitlement & Monetization

`last_sync`: 首版 · commit `fc61fd7f` · 2026-08-27  
`SSOT`: [`src/core/entitlement/entitlementRegistry.js`](../src/core/entitlement/entitlementRegistry.js) · [`companionAddonSku.js`](../src/core/entitlement/companionAddonSku.js) · [`FREE_PAID_MATRIX.md`](./FREE_PAID_MATRIX.md)

| 项 | 现状 |
|---|---|
| `FEATURE_CATALOG` keys | **22**（free tier: 3 · subscription-tier: 19） |
| 非 catalog SKU | `companion.addon.lifetime`（**禁止**进 catalog / `isEntitled` 互覆盖） |
| Pro planId | `focus-tiger-pro`（`companionEntitlement.js`） |
| Support Modal 卡 | **5**（Tea · Sanctuary · Membership · Pro · Companion Add-on；互斥展示） |
| 接线差距（压缩） | **部分接线**：Daily Wisdom Phase B 印花 · Journey Daily Card · Membership webhook 续费 · 多数 UI 未统一改读 `isEntitled`（仪式菜单等已接）→ 详表 [`FREE_PAID_MATRIX.md`](./FREE_PAID_MATRIX.md) |

### `FEATURE_CATALOG` 速查

| key | tier | type |
|---|---|---|
| `journey.log` | free | persistent |
| `content.daily-wisdom` | free | ongoing |
| `milestone.glow.played` | free | persistent |
| `ritual.morning.access` | subscription | ongoing |
| `ritual.emotional-reset.access` | subscription | ongoing |
| `ritual.work-transition.access` | subscription | ongoing |
| `ambient.deep.play` | subscription | ongoing |
| `content.advanced.daily-unlock` | subscription | ongoing |
| `theme.seasonal.access` | subscription | ongoing |
| `ritual.morning.history` | subscription | persistent |
| `ritual.emotional-reset.history` | subscription | persistent |
| `ritual.work-transition.history` | subscription | persistent |
| `ritual.morning.memento` | subscription | persistent |
| `ritual.emotional-reset.memento` | subscription | persistent |
| `ritual.work-transition.memento` | subscription | persistent |
| `ritual.morning.copy-unlocked` | subscription | persistent |
| `ritual.emotional-reset.copy-unlocked` | subscription | persistent |
| `ritual.work-transition.copy-unlocked` | subscription | persistent |
| `ritual.morning.sfx-unlocked` | subscription | persistent |
| `ritual.emotional-reset.sfx-unlocked` | subscription | persistent |
| `ritual.work-transition.sfx-unlocked` | subscription | persistent |

### Stripe Price（非 Secret · 仓库已记）

| 产品 | Price id | 备注 |
|---|---|---|
| Tip / Tea | `price_1U4nanFuIhgJPGLidoTdxobW` | US$4.99 · vars 已接线 |
| Sanctuary Lifetime | `price_1U22T4FuIhgJPGLiT0hcEWxY` | vars 已接线 |
| Yin Membership | `price_1U2r5lFuIhgJPGLiEPOhJbst` | vars 已接线 |
| Focus Tiger Pro | `price_1U6EB1FuIhgJPGLiuciuX1to` | US$12.99/月 · vars 已接线 |
| Companion Add-on | `price_1U6GnXFuIhgJPGLiNlXs0IKe` | US$29.99 一次 · SKU `companion.addon.lifetime` |

---

## §3 Locale & i18n tier

`last_sync`: 首版 · commit `fc61fd7f` · 2026-08-27  
`SSOT`: [`src/locales/localeRegistry.js`](../src/locales/localeRegistry.js)

| 项 | 现状 |
|---|---|
| `ready`（选择器可见） | `en` · `ja` |
| `draft`（库内保留、选择器隐藏） | `zh` · `es` · `de` · `fr` |
| `DEFAULT_LOCALE` | `en` |
| v1.0 对外宣称 | English + Japanese |

---

## §4 Local AI / Confide 口头白名单

`last_sync`: 首版 · commit `fc61fd7f` · 2026-08-27  
`SSOT`: [`CONFIDE_EXECUTABLE_INTENTS.md`](./CONFIDE_EXECUTABLE_INTENTS.md) · 规划 [`LOCAL_AI_SCENARIOS_V1.md`](./LOCAL_AI_SCENARIOS_V1.md) · Operating 方向锁 [`LOCAL_AI_OPERATING_LAYER.md`](./LOCAL_AI_OPERATING_LAYER.md)（无运行时）

| ID | 数据 / 动作 | 状态 |
|---|---|---|
| CI-00 | `practice_facts` · PracticeDaysStore | live |
| CI-01 | `memory_forget` · 单条删 `yin-personal-memory.json` | live |
| CI-02 | `presence_facts` · 14 日 Presence 封闭标签 | live |

层序：`Safety → 仪式语料 → 情绪桶 → CI 白名单 → L3`。Web/窄屏 **检索不生成**。

---

## §5 Desktop companion L0

`last_sync`: 首版 · commit `fc61fd7f` · 2026-08-27  
`SSOT`: [`desktop/companion/l0Config.js`](../desktop/companion/l0Config.js)

| 项 | 现状 |
|---|---|
| Model id | `Qwen3-1.7B-Q4_K_M` |
| File | `Qwen3-1.7B-Q4_K_M.gguf` |
| Expected bytes | ~1.11 GB（`1_107_409_472`） |
| Locked | 2026-08-24（unsloth · M5 Focusing spike） |
| Legacy（卸载） | `Qwen_Qwen3-0.6B-Q4_K_M.gguf` |

---

## §6 Ambient 免费子集

`last_sync`: 首版 · commit `fc61fd7f` · 2026-08-27  
`SSOT`: [`src/audio/ambientEntitlement.js`](../src/audio/ambientEntitlement.js)

| 项 | 现状 |
|---|---|
| Catalog key | `ambient.deep.play`（subscription-tier · lifetime ∪ subscription 覆盖） |
| 免费内置曲（5） | `singing-bowl` · `divine-life-society` · `somnia-variation-3` · `dreamland` · `frozen-in-love` |
| 用户自传曲 | 始终免费（不走 entitlement） |

---

## §7 Local state & contracts（计数级）

`last_sync`: 首版 · commit `fc61fd7f` · 2026-08-27  
`SSOT`: [`src/core/localStateKeys.js`](../src/core/localStateKeys.js) · [`DOC_CODE_CONTRACT.md`](./DOC_CODE_CONTRACT.md)

| 项 | 现状 |
|---|---|
| `localStorage` 白名单 | **50** keys（`FOCUS_TIGER_LOCAL_STORAGE_KEYS`；L-01 契约测试锁集合相等） |
| 最近新增（参考） | `focus-tiger.brand-yin-way-first-reflect.v1` · `focus-tiger.ype-companion-style.v1` · `focus-tiger.ype-cloud-personalization-consent.v1` · `focus-tiger.ype-personalization-pack.v1` |
| Practice-backup 快照 keys（6） | `journey-log` · `practice-days` · `milestone-glow` · `entitlement-ownership` · `ritual-completions` · `mustard-seed-seal`（schema v1） |
| Practice-backup opt-in key | `focus-tiger.practice-backup.v1`（**不**进 6-key 快照） |
| DOC_CODE_CONTRACT 强绑 ID | G-01–G-04 · H-01 · L-01 · S-01 · F-01 · D-01–D-04 · A-01 · V-01 |

---

## §8 CI & repo hygiene（指针）

`last_sync`: 首版 · commit `fc61fd7f` · 2026-08-27  
`SSOT`: [`WORKFLOW.md`](../../WORKFLOW.md) · [`.github/workflows/`](../../.github/workflows/)

| 项 | 现状 |
|---|---|
| 默认分支 | `develop` |
| PR `--base` | `develop`（禁默认打 `main`） |
| `.env*` 已提交？ | **否**（仅 `.env.example`） |
| 客户端云 API | **可选**；`VITE_CLOUD_API_BASE_URL` → 公开 Worker；未配则本地 |
| CI `secrets.*` | **无**（`pr-smoke` / `focus-tiger-e2e-full` 仅需 `CI=true`） |
| 全量 e2e GitHub Secrets | **不需要** |
| Workflows（6） | `pr-smoke` · `focus-tiger-e2e-full`（schedule+dispatch）· `focus-tiger-doc-contract-check` · `focus-tiger-visibility-contract` · `pr-merge-conflict-check` · `dependency-audit` |
| `schedule` cron | 读**默认分支** YAML（现为 `develop`；UTC 02:00） |
| 营销站公开域 | `https://twinsology.com`（apex；`marketing-site/` Slice 0；Pages/DNS **未**绑） |
| Rules 主题数 | 见 [`RULES_INDEX.md`](./RULES_INDEX.md) 机器块（`npm run rules:doc-sync` 刷新） |

---

## §9 Agent 速查：接任务前先读哪节

| 任务类型 | 读摘要 § | 过期 / 改动则读 SSOT |
|---|---|---|
| 云 / Worker / OTP / Newsletter | §1 | `wrangler.jsonc` · `index.ts` · `ENV_CONFIG` §1 规则 |
| 付费 / `isEntitled` / Support 卡 | §2 | `entitlementRegistry.js` · `FREE_PAID_MATRIX.md` |
| 语言 / locale tier | §3 | `localeRegistry.js` |
| Confide CI / 口头可执行 | §4 | `CONFIDE_EXECUTABLE_INTENTS.md` · Operating 边界 `LOCAL_AI_OPERATING_LAYER.md` |
| Electron L0 下载 / 模型 | §5 | `l0Config.js` |
| Ambient 免费曲 / 深库锁 | §6 | `ambientEntitlement.js` |
| 新 localStorage key / 备份范围 | §7 | `localStateKeys.js` · `practiceBackupSnapshot.js` |
| 分支 / CI / env 提交政策 | §8 | `WORKFLOW.md` · `ENV_CONFIG.md` §1 |
| **生产是否已 deploy** | §1 生产漂移表 | **不得**只信摘要；须 `prod_worker_version` 行 + 用户口令「部署」 |

---

## 漂移触发路径（`stale_after_paths`）

以下路径相对 `snapshot_base` 有 diff 时，摘要视为过期：

```
cloud/wrangler.jsonc
cloud/src/index.ts
cloud/.env.example
src/core/entitlement/**
src/locales/localeRegistry.js
src/core/localStateKeys.js
src/audio/ambientEntitlement.js
desktop/companion/l0Config.js
docs/CONFIDE_EXECUTABLE_INTENTS.md
.github/workflows/**
```

（第二期可将 `infra:snapshot-check` 接此列表做 WARN/FAIL。）
