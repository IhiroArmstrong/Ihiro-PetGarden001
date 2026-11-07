# 网络请求清单与同意文案对照（静态代码 · 第 0 轮）

**方法**：从 `focus-tiger/src` 与 `focus-tiger/desktop` 的非测试源码提取 `'/api/...'` 字面路径；对照 locale / 模块中的用户可见披露与 opt-in 逻辑。**本轮未做**浏览器/桌面实时抓包。

## 1. 云 API 基址

- **默认**：`https://focus-tiger-cloud.ihiro.workers.dev`（`src/core/cloudApiClient.js`）
- **开发**：Vite 下可用同源 `/api` 代理（同文件注释）

## 2. 客户端出现的 `/api/` 路径（唯一集合）

`rg -o "'/api/[^']+'|\"/api/[^\"]+\"" src desktop --glob '!**/*.test.js'` → 去引号排序（取证于 develop）。

| 路径 | 粗分类 |
|------|--------|
| `/api/calm-action-copy` | 品味层 prefetch |
| `/api/companion-channel-copy` | 同上 |
| `/api/confide-copy` | 同上 |
| `/api/confirm-*`（art / companion-addon / membership / pro / sanctuary） | 交易/权益确认 |
| `/api/create-*-checkout-session`、portal | Stripe |
| `/api/daily-message`、`/api/emotion-weight`、`/api/quiet-line` | 品味层 |
| `/api/focus-circle` | 共修圈（Privacy 下） |
| `/api/growth-metrics-config` | 成长度量配置 |
| `/api/lantern-presence` | Quiet together |
| `/api/membership-entitlement` | 权益 |
| `/api/monetization-funnel-ingest` | 漏斗（opt-in） |
| `/api/newsletter/subscribe` | 邮件 |
| `/api/practice-backup/*` | 练习云备份 |
| `/api/restore/request-otp` | OTP 恢复 |
| `/api/t54-research-ingest` | T54 研究（consent） |
| `/api/verify-*` | 验证 |
| `/api/ype-personalization-ingest` / `delete` | YPE（consent） |

## 3. 与同意/披露的对照（支撑 V1 评审）

| 数据/行为 | API | 代码门槛（摘要） | 用户可见说明（指针） |
|-----------|-----|------------------|----------------------|
| T54 研究 | `POST /api/t54-research-ingest` | 无同意不发 | `src/locales/slices/t54-research-consent.json` |
| YPE 云端个人化 | ingest / delete | `isYpeCloudPersonalizationConsentEnabled` | `PRIVACY_SHEET_YPE_OPT_IN_*`（en.json 等） |
| 练习云备份 | `practice-backup/*` | opt-in + OTP | `JOURNEY_LOG_BACKUP_*` |
| 付费意愿漏斗 | `monetization-funnel-ingest` | `isMonetizationFunnelOptInEnabled` | B5 对齐 Privacy |
| 成长度量 / 品味层 | `growth-metrics-config`、`emotion-weight`、`*-copy` 等 | 有 cloud base 且未 query 关断 | `GROWTH_METRICS_CHARTER.md`、Privacy Sheet |
| Quiet together / Focus Circle | `lantern-presence`、`focus-circle` | 功能开关 | `docs/SHARED_RESOURCES.md` |

**未检**：未抓包核对运行时 Body；B5 应补 Worker 端对照。
