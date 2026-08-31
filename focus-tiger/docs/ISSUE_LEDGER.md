# Issue Ledger（问题闭环追踪）

| 类型 | 问题描述 | 首次发现时间/来源 | 受影响项/范围 | 状态 |
| --- | --- | --- | --- | --- |
| 独立bug | Confide L2 同面板约第 5–6 句闲聊复读第一句 generate（先是 `Yes.`，#492 拦截后变成完整旧句） | 2026-08-31 用户书面 · 本会话 | `l1Hold.js` KV sequence（`resetChatHistory` 不擦序列）；`l2Sanitize` 缺 echo 拒绝；`historyForGeneratePrompt` 未丢 `memory_suppress` | 已解决 |
