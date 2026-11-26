# feature/membership-yearly-k1-config

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Membership 年付 Price id（Test Mode）写入 wrangler | 配置 | 已合 #1893 · Worker 已部署 47066591 | `wrangler.jsonc` + 生产 Worker；`POST …/create-membership-checkout-session` `{ plan: "yearly" }` → 200 + Stripe test yearly Checkout（2026-11-26 验收）。**不写 Support 主按钮。** | — | — | Live Price / Test Clock 仍待人补 | 同 k1 API | 2026-11-26 |