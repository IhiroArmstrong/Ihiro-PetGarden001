# docs/t55-companion-contract-pr4

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| T55 PR-4 陪伴契约红线样本集 | 纯文档 + CI 脚本 | 仅单元测试覆盖 | `npm run check:companion-contract`：40 条样本；坏样本命中率与放行样本放行率分开打印（建议 34/34 与 6/6）；无危机类；`git diff` 无 `src/` 运行时。不测界面。 | — | — | — | `focus-tiger/scripts/companion-contract-samples.js` · T55 PR-4 | 2026-10-25 |
