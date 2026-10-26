# feat/t54-research-consent

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 自动化 | 日期 |
|---|---|---|---|---|---|---|---|---|
| T54 Privacy 研究数据分享开关 | UI可见 | 待人工测试 | `?product=1` → ? → Privacy。见「分享可选的练习效果计数（研究）」默认未勾。勾上后 0–1 秒内方块勾上；再点掉取消。支持阿寅流程开关、云端个人化开关不得跟着变。窄屏 375 开关在可滚区域内，Back 仍在。关单只认 `origin/develop` tip。不要用清库命令。 | — | — | — | 单测 `t54ResearchLedger.test.js` / `t54ResearchUpload.test.js`；e2e `onboarding-remedy-contract.spec.js` 默认未勾+勾上 | 2026-10-26 |
