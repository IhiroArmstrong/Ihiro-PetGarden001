# feature/membership-yearly-k1

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Membership 年付结账 plan=yearly（第 1 刀，无卡面 CTA） | 纯后端 | 仅单元测试覆盖 | **本条验收的是** Worker 可用 `plan=yearly` 走年付 Price、到期日跟 Stripe、webhook 事件 id 幂等；**不代表** Support 上能点到年付。自动化：`cloud` `membershipPlanId` / `createMembershipCheckoutSession` / `membershipStripeWebhook`。人补：Stripe Dashboard 建 US$47.99/year Price，把 `STRIPE_MEMBERSHIP_YEARLY_PRICE_ID` 从 `price_REPLACE_YEARLY` 换成真 id；Test Clock 走续费 / 失败 / 取消（不只测当天开通）。Support 主按钮仍须月付。 | — | — | — | `POST /api/create-membership-checkout-session` body `{ plan: "yearly" }` | 2026-11-24 |
