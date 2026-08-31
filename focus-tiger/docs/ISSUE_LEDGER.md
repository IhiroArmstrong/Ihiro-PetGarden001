# Issue Ledger（问题闭环追踪）

| 类型 | 问题描述 | 首次发现时间/来源 | 受影响项/范围 | 状态 |
| --- | --- | --- | --- | --- |
| 独立bug | Confide L2 同面板约第 5–6 句闲聊复读第一句 generate（先是 `Yes.`，#492 拦截后变成完整旧句） | 2026-08-31 用户书面 · 本会话 | `l1Hold.js` KV sequence（`resetChatHistory` 不擦序列）；`l2Sanitize` 缺 echo 拒绝；`historyForGeneratePrompt` 未丢 `memory_suppress` | 已解决 |
| 独立bug | Allow 后 What Yin remembers 空态仍写「去 Confide 允许」 | 2026-09-01 用户书面 · 本会话 | `YinPersonalMemoryUI` 空列表一律 `YIN_MEMORY_PANEL_EMPTY` | 已解决 |
| 独立bug | What Yin remembers 开着时 Forget 后新抽取不出现在列表 | 2026-09-01 用户书面 · Mondays feel crowded | `YinPersonalMemoryUI` 无 `reloadIfOpen`；Confide Remember 未通知面板（Forget 已有 `removeMemoryIfOpen`） | 已解决 |
| 优化建议 | Confide 闲聊/问答（含中文、L3 答句）是否写入 Personal Memory 列表 | 2026-09-01 用户书面 · 本会话 | 英文 check-in 三句（reset / not focusing / until this morning）本批已加规则；**中文闲聊、L3 答句仍不入库** | 跟进中 |
| 独立bug | L3 山水清风式答句（river/ground 等）不像听见用户，疑非 1.7B 自然 | 2026-09-01 用户书面 · reset / not focusing / until this morning | 语料无这些句 → 属 generate；`l2Persona.js`「Observe; do not advise」+ 1.7B 易写成风景隐喻。未改 prompt | 未跟进 |
