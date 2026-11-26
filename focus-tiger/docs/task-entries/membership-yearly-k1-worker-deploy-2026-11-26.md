---
id: membership-yearly-k1-worker-deploy-2026-11-26
kind: deploy
status: 已部署生产 Worker 47066591
updated: 2026-11-26
---

`focus-tiger-cloud` 生产 Version `47066591-dc7d-4e5d-8e1c-bd71a7d92411`（PO 口令「部署」，本机 163 / ihiro `npm run deploy`）。`STRIPE_MEMBERSHIP_YEARLY_PRICE_ID` = `price_1UftOEFuIhgJPGLiCCWi98s3`（Test Mode US$47.99/year）。验收：`POST https://focus-tiger-cloud.ihiro.workers.dev/api/create-membership-checkout-session` body `{ "plan": "yearly" }` → 200 + `cs_test_…` Checkout URL。Support 主按钮仍月付。