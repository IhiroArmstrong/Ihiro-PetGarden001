# fix/help-center-crisis-paraphrase-not-search

| 帮助中心改写危机句不得当普通检索 | 仅单元测试覆盖 | 待人工测试 | 终端：`node --test src/core/helpCenterAskSearch.test.js src/ui/HelpCenterUI.test.js` 与 `npm run test:smoke`。锁：`I cannot keep going much longer` 在 `matchesSafetyRedirect` 为假、向量命中时 `reason=safety` 且 `shouldSearch=false`。无新按钮。可选：桌面 Help Center 问卡发该英文改写句，应见求助热线句而不是文章列表。 | 2026-11-24 只读审计缺口 2 | — | 本 PR 收口问卡检索 | `helpCenterAskSearch.js` · `HelpCenterUI.js` | 2026-11-26 |
