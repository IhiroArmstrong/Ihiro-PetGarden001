# Task Brief · 意愿漏斗 layout=tea-first | sanctuary-first

> **状态（2026-08-20）**：#377 已合入 Support 请茶优先 UI；本切片补漏斗维 + ingest 白名单。  
> **触发**：用户问 layout 维是否已实现，以及「联网备份」能否把该统计自动传到云端。  
> **分支**：`cursor/support-funnel-layout-8475`

## 产品规则

| 项 | 口径 |
|---|---|
| **layout 维** | Support 打开 / 卡 CTA 写入 `tea-first` 或 `sanctuary-first`（与 #377 同一 `shouldLeadWithTea`） |
| **计数键** | 保留原 `support_open` / `support_cta:tea`；另加 `support_open:tea-first`、`support_cta:tea:tea-first` 等 |
| **上云** | **仅** Privacy「分享匿名支持漏斗计数」opt-in → `POST /api/monetization-funnel-ingest` |
| **不是** | 练习记忆「联网备份」（Journey Log OTP；整包 6 key）。禁止把漏斗塞进 `PRACTICE_BACKUP_STORE_KEYS`，禁止因备份同意自动打开漏斗开关 |

## 已好清单

- Support 三卡顺序 / Suggested / 定价 / FAB **不变**（只加埋点维）。
- 漏斗默认仍关；未同意仍不 `fetch`。
- 练习备份 schema 仍精确 6 key。
- 场景化请茶气泡、精灵通道不碰。

## 不做

- 运营后台 UI / KV 导出工具
- 生产 Worker Redeploy（须用户点名「部署」）
- 把漏斗 opt-in 与练习备份捆绑
