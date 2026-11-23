# tracker fragment · fix/noticing-overlay-whitelist

| 觉察一句 overlay 改白名单（逐路由表） | 纯后端 | 仅单元测试覆盖 | **无界面。** 本条验收的是：`shouldUseNoticingFixedLine` 只对白名单路由为真；`aggression_toward_others` 为假；`safety_care` 仍为真；未知 route id 为假。不代表中档关心已 live，不代表 12/5 已签发，不代表夹具重写。自动化：`noticingFixedLineLibrary.test.js` 逐路由表 + `noticingOpenGateNfFixtures.test.js` NF-02。 | — | — | — | `src/core/noticingOneLine/` | 2026-11-23 |
