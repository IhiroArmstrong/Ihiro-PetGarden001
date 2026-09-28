# feature/open-ended-focus-slice0

| Open-ended focus Slice 0（纯计时规则，未接界面） | 仅单元测试覆盖 | 本条验收的是开放式计时的纯函数：正计时、休眠/暂停不计入、24 小时封顶、20 小时奖励计入、崩溃不按墙钟补时、90 分钟与 3 小时提示点。不代表时长芯片、HUD、发币或语音命令已经改过。 | `cd focus-tiger && node --test src/core/openEndedFocus.test.js` | — | — | 未接线前不得把固定时长 chip 改成开放式 | 无界面路径 · [`openEndedFocus.js`](../../src/core/openEndedFocus.js) · Brief [task-open-ended-focus.md](../task-briefs/task-open-ended-focus.md) | 2026-09-28 |
