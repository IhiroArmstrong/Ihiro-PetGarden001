# Issue Ledger（问题闭环追踪）

| 类型 | 问题描述 | 首次发现时间/来源 | 受影响项/范围 | 状态 |
| --- | --- | --- | --- | --- |
| 独立bug | Confide L2 同面板约第 5–6 句闲聊复读第一句 generate（先是 `Yes.`，#492 拦截后变成完整旧句） | 2026-08-31 用户书面 · 本会话 | `l1Hold.js` KV sequence（`resetChatHistory` 不擦序列）；`l2Sanitize` 缺 echo 拒绝；`historyForGeneratePrompt` 未丢 `memory_suppress` | 已解决 |
| 独立bug | Allow 后 What Yin remembers 空态仍写「去 Confide 允许」 | 2026-09-01 用户书面 · 本会话 | `YinPersonalMemoryUI` 空列表一律 `YIN_MEMORY_PANEL_EMPTY` | 已解决 |
| 独立bug | What Yin remembers 开着时 Forget 后新抽取不出现在列表 | 2026-09-01 用户书面 · Mondays feel crowded | `YinPersonalMemoryUI` 无 `reloadIfOpen`；Confide Remember 未通知面板（Forget 已有 `removeMemoryIfOpen`） | 已解决 |
| 独立bug | Confide「total sitting time」未走 Journey 同坐时长 | 2026-09-01 用户书面 · Gate 0.2 C-5 | `isPracticeDurationQuestion` 未匹配 paraphrase；L3「Still observing.」→ `confidePracticeFacts.js` 读 Journey Log | 已解决 |
| 优化建议 | Confide 闲聊/问答（含中文、L3 答句）是否写入 Personal Memory 列表 | 2026-09-01 用户书面 · 本会话 | **V1 有意不做中文抽取**（规则表保持英文；「彤彤儿…」不入库是设计不是漏）。**下一 Slice 触发**：英文 AG 面板/抽取人工复测过关后，开独立 `feature/yin-memory-zh-extract`（不跟进风景 PR）。L3 答句仍永不入库。 | 跟进中 |
| 独立bug | L3 山水清风式答句（river/ground 等）不像听见用户，疑非 1.7B 自然 | 2026-09-01 用户书面 · reset / not focusing / until this morning | 语料无这些句 → 属 generate。本支 `fix/yin-l3-observe-no-scenery` 在 `buildCompanionL2Prompt` 加一行：未提风景则禁止河/山/地代替听见，且不得改用天气/季节/光线顶替。人工须复测原三句 + 未测过的新句；若仍打太极则上调 Observe 约束，禁止继续逐词堵。 | 跟进中 |
