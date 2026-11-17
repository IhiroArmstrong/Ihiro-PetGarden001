# feature/t100-g1-presuppose-illness

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| T100 PR-2 补丁：预设有病句式 | 纯后端 | 仅单元测试覆盖 | `cd focus-tiger && node --test src/core/outputGate/outputGate.test.js`。第 12 句 `I do not know the name of the illness.` 须 G1；capability 拒绝句、茶名、不知道你为什么难过须放行。不测界面。 | — | — | — | `focus-tiger/src/core/outputGate/outputGateRules.js` | 2026-11-17 |
