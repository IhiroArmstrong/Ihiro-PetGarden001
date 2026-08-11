# Task Brief · 付费意愿漏斗 opt-in 回传

> **状态（2026-08-12）**：`feature/monetization-funnel-optin-upload`  
> **前置**：本地漏斗 #255 已合（`MONETIZATION_INTENT_FUNNEL.md`）  
> **隐私**：`MVP_PRODUCT_DEFINITION` §六 — 分析须明示同意；默认关；最少字段。

## 目标

在用户**明示同意**后，把本地意愿漏斗的**聚合计数**回传到 Focus Tiger Cloud，使运营端能从已安装客户端汇总 Support→CTA→Checkout→完成，而不依赖用户自愿导出。

## 非目标

- 不上报反思 / 意图 / Confide 文本
- 不上报邮箱、支付明细、IP 画像
- 不接第三方分析 SDK（Amplitude 等）
- 不默认打开；关同意后停止上报（已送出的历史不自动删除于服务端 — v1 可接受，文案须诚实）

## 产品交互

- 入口：应用内 Privacy 页（`#onboarding-privacy-sheet`）底部 opt-in 开关  
- 文案须说明：**发送什么**（漏斗事件计数）、**为什么**（改进付费入口）、**默认关**  
- 开关开 → 立即尝试上传一次；之后在漏斗 `record` 后节流上传（或冷启动补传）

## 技术

| 层 | 约定 |
|---|---|
| Consent storage | `focus-tiger.monetization-funnel-consent.v1`：`{ optedIn, installId, lastSentCounts, lastSentAt }` |
| Payload | `{ schemaVersion:1, installId, counts }` — **仅** counts 增量或全量快照（v1 全量快照即可，服务端取 max/sum 合并） |
| API | `POST /api/monetization-funnel-ingest` |
| KV（v1） | 暂写 `TIP_KV` 前缀 `analytics:monetization-funnel:`（避免本回合新建命名空间）；日后迁 `FUNNEL_KV` |
| 失败 | 静默；不挡主路径；未成功不更新 `lastSentAt` |

## 验收

1. 默认关：无网络请求到 ingest  
2. 打开开关：有 POST；实验室可再开「意愿漏斗」对照本地 counts  
3. 关闭开关：不再 POST  
4. 单测：consent gate + payload 不含自由文本键  
5. TRACKER 待人工；生产 redeploy 另记

## 文档

更新：`MONETIZATION_INTENT_FUNNEL.md`、`PRIVACY_NOTICE.md`（一句）、`PROCESS`、`TEST_TRACKER`、`SHARED_RESOURCES`、`FREE_PAID_MATRIX` #12
