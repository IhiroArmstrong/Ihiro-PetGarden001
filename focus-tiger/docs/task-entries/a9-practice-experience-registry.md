---
id: a9-practice-experience-registry
kind: feature
status: 已合 develop #1275 · slice 2（练习结束语音 + 存图命名）
updated: 2026-10-16
---

根因盘点 A9（R6）第二刀：新增 `practiceExperienceRegistry.js` SSOT，逐行声明练习种类（结束语音接线、可选仪式存图）与可下载 PNG 命名策略。`practiceExperienceRegistry.test.js` + `practiceEndVoiceParallelListContract` / `practiceSaveImageParallelListContract` 穷举缺字段或缺源码锚点即失败。商品 checkout 登记表见 slice 1 `commerceProductRegistry.js`。不改用户可见路由/文案。
