# feature/kb-help-single-source-k2

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| 一份事实源第 2 刀 · 菜单 proxy 登记 CI | 纯后端 | 仅单元测试覆盖 | **本条验收的是** `listSecondaryChromeEntries` 与 `kbLiveEntryRegistry` 缺行即红，以及普查 §2.2 机器块。**不代表** Help Center 正文或倾诉短答有变。自动化：`audit-kb-live-entries.test.js` · `npm run docs:check`。 | — | — | — | `kbLiveEntryRegistry.js` · `MENU_CHROME_CENSUS.md` §2.2 | 2026-11-13 |
