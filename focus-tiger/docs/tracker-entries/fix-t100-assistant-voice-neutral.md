# fix/t100-assistant-voice-neutral

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| T100 助手腔改走中性回落 | 纯后端 | 仅单元测试覆盖 | `cd focus-tiger && node --test src/core/outputGate/outputGate.test.js`。“I am an AI”、语言模型、Please provide/describe/consult/seek 须换成中性句且不锁。房间里的医生仍放行。转诊句仍算转诊。不测界面。不跑真模型。 | — | — | — | 无界面。规则在 `focus-tiger/src/core/outputGate/outputGateRules.js` | 2026-11-18 |
