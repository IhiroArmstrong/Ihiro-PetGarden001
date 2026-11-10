# docs/prod-worker-plan-a-version

| 记下 Plan A 生产 Worker 已关新结账 | 纯后端 | 仅单元测试覆盖 | **无界面。** 本条验收的是生产 Worker 版本与两条新结账接口，不代表客人界面文案已清完。2026-11-10 核对：线上 Version `04a56014-3aaa-4422-bb3c-d5b13abb9ae5`（2026-11-09T15:04:07Z）已含关闸。`POST /api/create-pro-checkout-session` 与 `POST /api/create-companion-addon-checkout-session` 返回 410 `plan_a_new_checkout_disabled`。`POST /api/create-membership-portal-session` 用假邮箱返回 400 `invalid_email`，不是 410。没有真实订阅凭证，未打开 Stripe 顾客门户。本回合未再部署。cloud 源与 `2201ba5b` 相同，并已在 `origin/develop` `3d852ffa`。 | — | — | — | `INFRA_SNAPSHOT.md` | 2026-11-10 |
