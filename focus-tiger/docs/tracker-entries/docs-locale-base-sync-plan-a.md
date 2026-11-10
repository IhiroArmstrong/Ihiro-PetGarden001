# docs-locale-base-sync-plan-a

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| 方案 A Support 总账与切片对齐 | 纯文档/字典 | 仅单元测试覆盖 | **无用户路径。** 本条验收的是：en/zh/ja 四句 Support 键与 `plan-a-option1-support-sale-stop.json` 相同；合并后画面与改前切片覆盖一致。不代表深链已实现。`node --test src/locales/mergeLocaleSlices.test.js src/locales/slices/planAOption1SupportMergedLocale.test.js` · `npm run locale:slices` 检查。 | — | — | — | `src/locales/{en,zh,ja}.json` · 本 PR | 2026-11-10 |
