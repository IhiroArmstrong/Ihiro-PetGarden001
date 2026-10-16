---
id: a8-visible-text-poison
kind: feature
status: 本支 feat/a8-visible-text-poison
updated: 2026-10-16
---

根因盘点 A8（R5）：页面防呆。① `VISIBLE_TEXT_POISON_RE` SSOT + 启动冒烟 / 产品壳 e2e / A1 菜单可达共用；② `appendDomChild` / `setDomText` 在 dev/test 对 nullish 抛错。不改用户可见路由/文案。验收：`visibleTextPoison.test.js` · `test:e2e:startup` · `test:e2e:smoke` 产品壳行。
