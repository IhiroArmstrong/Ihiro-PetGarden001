# fix/t100-crisis-hotline-and-self-harm

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| T100 988 与自我伤害用语同时出现才升级成求助句 | 纯后端 | 仅单元测试覆盖 | `cd focus-tiger && node --test src/core/outputGate/outputGate.test.js`。988 加 “ending your life” / “harming yourself” / “not wanting to be here” 须变成求助句并锁住。单独 988、单独转述、111、120 分钟维持原判定。不测界面。不跑真模型。 | — | — | — | 无界面。规则在 `focus-tiger/src/core/outputGate/outputGateRules.js` | 2026-11-18 |
