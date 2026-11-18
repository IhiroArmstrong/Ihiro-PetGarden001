# fix/t100-doctor-disorder-look

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| T100：同一句里的医生看障碍 | 纯后端 | 仅单元测试覆盖 | `cd focus-tiger && node --test src/core/outputGate/outputGate.test.js`。`Disorders are things a grown-up helps a doctor look at.` 须判 G3。光秃的医生、光秃的 disorder、两句拆开的医生和障碍须放行。1200 条放行集不超过 2%，语料与 108 条冻表为 0。不测界面。 | — | — | — | `focus-tiger/src/core/outputGate/outputGateRules.js` | 2026-11-18 |
