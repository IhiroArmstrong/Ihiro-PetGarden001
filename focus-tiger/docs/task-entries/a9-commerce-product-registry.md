---
id: a9-commerce-product-registry
kind: feature
status: 本支 feat/a9-commerce-product-registry · slice 1（商品 checkout 登记表）
updated: 2026-10-16
---

根因盘点 A9（R6）第一刀：新增 `commerceProductRegistry.js` SSOT，覆盖全部 `DESKTOP_CHECKOUT_KINDS`（付款回跳 query、产品壳 thanks、Support 卡、已购变淡旗标、高清/编号规则指针）。`commerceProductRegistry.test.js` 穷举缺字段即失败；平行名单契约测试改为读登记表。练习结束语音 / 存图命名仍留 slice 2。不改用户可见路由/文案。
