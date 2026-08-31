# Issue Ledger（问题闭环追踪）

| 类型 | 问题描述 | 首次发现时间/来源 | 受影响项/范围 | 状态 |
| --- | --- | --- | --- | --- |
| 独立bug | Confide L2 同面板约第 5–6 句闲聊复读第一句 generate（先是 `Yes.`，#492 拦截后变成完整旧句） | 2026-08-31 用户书面 · 本会话 | `l1Hold.js` KV sequence（`resetChatHistory` 不擦序列）；`l2Sanitize` 缺 echo 拒绝；`historyForGeneratePrompt` 未丢 `memory_suppress` | 已解决 |
| 独立bug | Allow 后 What Yin remembers 空态仍写「去 Confide 允许」 | 2026-09-01 用户书面 · 本会话 | `YinPersonalMemoryUI` 空列表一律 `YIN_MEMORY_PANEL_EMPTY` | 已解决 |
| 独立bug | What Yin remembers 开着时 Forget 后新抽取不出现在列表 | 2026-09-01 用户书面 · Mondays feel crowded | `YinPersonalMemoryUI` 无 `reloadIfOpen`；Confide Remember 未通知面板（Forget 已有 `removeMemoryIfOpen`） | 已解决 |
| 独立bug | Confide「total sitting time」未走 Journey 同坐时长 | 2026-09-01 用户书面 · Gate 0.2 C-5 | `isPracticeDurationQuestion` 未匹配 paraphrase；L3「Still observing.」→ `confidePracticeFacts.js` 读 Journey Log | 已解决 |
| 优化建议 | Confide 闲聊/问答（含中文、L3 答句）是否写入 Personal Memory 列表 | 2026-09-01 用户书面 · 本会话 | **V1 有意不做中文抽取**（「彤彤儿…」不入库是设计）。L3 答句永不入库。**可核对触发（未钉日期 / 未钉连续次数 N）**：须同时满足再开 `feature/yin-memory-zh-extract`。① Slice **1c** 面板路径（开着 Remember、关着再开、连续两条）已有用户书面记入该行「用户反馈」；关单仍只认 `origin/develop` tip。② tracker 行「Confide L3 不得用风景/天气代替听见」人工判定为**接住内容**（不是「河/山没出现」）；若换马甲则风景项未清零，**禁止**开中文 Slice。CI 绿 / prompt 单测绿 **不等于**触发。下次碰此话题再钉 N。 | 跟进中 |
| 独立bug | L3 山水清风式答句（river/ground 等）不像听见用户，疑非 1.7B 自然 | 2026-09-01 用户书面 · reset / not focusing / until this morning | 语料无这些句 → 属 generate。本支 `fix/yin-l3-observe-no-scenery` 已加 prompt 约束。**通过标准**：答句须回应用户句内容；**失败**：只是河/山消失、换成天气/季节/光线空话。单测只锁字符串写入，不锁 1.7B 服从。换马甲 → 上调「Observe; do not advise」，禁止再加词表。 | 跟进中 |
