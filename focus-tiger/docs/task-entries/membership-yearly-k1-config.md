---
id: membership-yearly-k1-config
kind: deploy
status: 已合 #1893 · 年付 Test Mode Price id 写入 wrangler（部署见 membership-yearly-k1-worker-deploy-2026-11-26）
updated: 2026-11-26
---

接续 #1883（membership-yearly-k1 逻辑）。在 `wrangler.jsonc` 写入 Stripe **Test Mode** 年付 Price `price_1UftOEFuIhgJPGLiCCWi98s3`（US$47.99/year）。**本 PR 不执行** `wrangler deploy`；线上 Worker 须 PO 口令「部署」后在本机 redeploy。