# Issue Ledger（问题闭环追踪）

| 类型 | 问题描述 | 首次发现时间/来源 | 受影响项/范围 | 状态 |
| --- | --- | --- | --- | --- |
| 独立bug | Confide L2 同面板约第 5–6 句闲聊复读第一句 generate（先是 `Yes.`，#492 拦截后变成完整旧句） | 2026-08-31 用户书面 · 本会话 | `l1Hold.js` KV sequence（`resetChatHistory` 不擦序列）；`l2Sanitize` 缺 echo 拒绝；`historyForGeneratePrompt` 未丢 `memory_suppress` | 已解决 |
| 优化建议 | Confide 闲聊/问答（含中文、L3 答句）是否写入 Personal Memory 列表 | 2026-09-01 用户书面 · Gate 0.2 C-3 | Slice 1b 抽取未命中 `Mondays feel crowded`；Forget 空库诚实句。补测行 `qa-ag-slice-1e-forget-e2e`，不挡 #472 关单 | 未跟进 |
| 独立bug | Confide「total sitting time」未走 Journey 同坐时长 | 2026-09-01 用户书面 · Gate 0.2 C-5 | `isPracticeDurationQuestion` 未匹配 paraphrase；L3「Still observing.」 | 跟进中 |
