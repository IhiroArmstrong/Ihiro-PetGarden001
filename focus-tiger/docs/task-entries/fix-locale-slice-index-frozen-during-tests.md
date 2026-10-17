---
id: fix-locale-slice-index-frozen-during-tests
kind: feature
status: 进行中
updated: 2026-10-17
---

并行 `test:smoke` 期间冻结 `localeSliceModules.js`。原子写不够：压测若仍改共享索引，holdout CLI 会误报缺 `LOCALE_SLICES`。无用户路径。
