# Task Brief · 付费意愿漏斗 · opt-in 回传

> **状态（2026-08-12）**：**已合 develop** · #262 tip `582e79f` · `feature/monetization-intent-funnel-opt-in`  
> **前置**：本地漏斗 #255 已合 tip `fea9c11`（`MONETIZATION_INTENT_FUNNEL.md`）  
> **目的**：在**明示同意**后，把本机意愿漏斗计数聚合到自有 Cloud Worker，装成本地 APP 时仍可抓回运营可读摘要。  
> **红线**：`MVP_PRODUCT_DEFINITION.md` §六；默认**关**；禁止静默上报；禁止第三方 SDK；禁止自由文本 / 意图 / 反思内容。

## 为何必须另开

| 层 | 谁做 | 范围 |
|---|---|---|
| 本地漏斗 | **#255 已合** | Support→CTA→Checkout→完成；实验室面板；仅 localStorage |
| **本 Brief · opt-in 回传** | 本任务 | 同意开关 + 匿名 clientId + Worker ingest + 字段白名单 |

本地统计解决「本机可看」；**没有回传**则桌面壳/换机后运营仍盲。回传是经济可持续的观测面，但必须 opt-in。

## 产品契约

| 项 | 口径 |
|---|---|
| 默认 | **关**（未同意绝不 `fetch`） |
| 同意入口 | Privacy 页（`#onboarding-privacy-sheet`）明示开关；文案说明发什么 / 为什么 / 多久 |
| 事件名 | **复用**本地表：`support_open` / `support_cta` / `checkout_*`（见 `MONETIZATION_INTENT_FUNNEL.md`） |
| 载荷 | `counts` + 最近 ≤20 条事件（`at/name/track/source/layout`）；**无**邮箱 / 支付 id / 反思 / 意图句 |
| 身份 | 本机生成的随机 `clientId`（UUID）；可随 DEV 重置清掉；**不是**账号 |
| 关闭同意 | 立即停止上传；已上传记录不要求服务端删除（v1）；本机可继续记本地漏斗 |
| Cloud 未配 | 同意可开；flush 静默跳过（记 `lastError=cloud_api_unconfigured`）；不打扰练习 |
| i18n | en + ja + zh |

## 实现要点

1. `monetizationFunnelOptIn.js`：consent 读写（`focus-tiger.monetization-funnel-opt-in.v1`）  
2. `monetizationFunnelUpload.js`：组包 + `POST /api/monetization-funnel-ingest`；节流（约 60s）+ `checkout_complete` 立即尝试  
3. Worker：校验白名单；KV 键 `funnel:v1:{day}:{clientId}`（落在现有 `TIP_KV`，与 `tip:` 命名空间隔离）  
4. Privacy sheet UI 开关；实验室「意愿漏斗」摘要附带 opt-in / lastUpload  
5. 单测：默认不上传；同意后组包字段；关同意后不再 flush；Worker 拒非法字段  
6. 同步 `FREE_PAID_MATRIX` 差距 #12、`TEST_TRACKER`、`SHARED_RESOURCES`、`PRIVACY_NOTICE` 一句、PROCESS

## 保护面

- 本地漏斗计数行为不变（关同意仍写 localStorage）  
- Tip / Sanctuary / Membership Checkout 路径不因上报失败而阻断  
- 不接 Sentry / 第三方 analytics

## 建议分支

`feature/monetization-intent-funnel-opt-in`（base：`develop` tip 含 #255/#258/#260）

## 不做

- 强制弹窗逼同意  
- 把留存漏斗（`RETENTION_FUNNEL`）一并上报  
- 运营后台 UI（KV 可读即可；导出另立项）  
- 新建 Cloudflare KV namespace（v1 复用 `TIP_KV` 前缀）
