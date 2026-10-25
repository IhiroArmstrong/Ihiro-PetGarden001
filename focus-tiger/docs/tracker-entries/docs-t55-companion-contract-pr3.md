# docs/t55-companion-contract-pr3

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| T55 PR-3 陪伴契约字面检查 | 纯文档 + CI 脚本 | 仅单元测试覆盖 | 本条验收的是 `npm run check:companion-contract`：先扫 Re-focus 池再扫其余固定文案；豁免只减不增；输出含诚实边界且样本两比率标 n/a（PR-4）。`git diff` 无 `src/` 运行时。不测界面。 | — | — | — | `focus-tiger/scripts/check-companion-contract.js` · T55 PR-3 | 2026-10-25 |
