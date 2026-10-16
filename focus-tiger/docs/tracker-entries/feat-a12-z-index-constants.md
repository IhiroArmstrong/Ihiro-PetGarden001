# feat/a12-z-index-constants

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| A12 层级常量化（Z-dim 扫描） | 纯后端 | 仅单元测试覆盖 | **本条验收的是**静态扫描与常量对账，**不代表**叠层观感已人眼验收。自动化：`npm run check:z-index-literals`（表外数字红、未豁免手写数字红）；`overlayBackdrop.test.js` 仍锁 Support/mute dim 选择器。不测 Stripe。 | — | — | — | `docs/task-briefs/task-a12-z-index-constants.md` | 2026-10-16 |
