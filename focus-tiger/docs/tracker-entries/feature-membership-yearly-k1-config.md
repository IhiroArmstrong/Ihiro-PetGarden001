# feature/membership-yearly-k1-config

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Membership 年付 Price id（Test Mode）写入 wrangler | 配置 | 仓库已接线 · Worker 待部署 | `wrangler.jsonc` `STRIPE_MEMBERSHIP_YEARLY_PRICE_ID` = `price_1UftOEFuIhgJPGLiCCWi98s3`；`cloud` 单测仍用 placeholder 夹具。本地 `wrangler dev` 或 redeploy 后 `POST … checkout-session` `{ plan: "yearly" }` 应 200 并进 Stripe yearly Checkout。**不写 Support 主按钮。** | — | — | 部署口令前不宣称线上可用 | 同 k1 API | 2026-11-26 |