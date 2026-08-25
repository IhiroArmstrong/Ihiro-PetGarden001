# Task Brief · Presence Signals · Slice 3（Reflection 双写 + 90 天对齐）

> **状态（2026-08-25）**：**开工 Presence Signals Slice 3**  
> **分支**：`feature/presence-signals-slice-3`  
> **前置**：#435 已合 develop（账本 + Confide + 披露）

---

## 做什么

1. **Reflection → presence-signals 双写**：`SessionEndFlow.onDone` 非空答案时，Q1/Q2/Q3 各 append 一行 `freeText`（`reflection_q1`…`q3`）。
2. **reflections.v1 90 天对齐**：`pruneExpiredReflectionBundles` 与 `PRESENCE_SIGNALS_FREE_TEXT_RETENTION_DAYS` 同值；写入前修剪。
3. **趋势样本规则（文档 + 测试）**：`totalTagged` 只计 `emotionTag`；**freeText-only 不计入**；**同日多次 Notice 按事件条数计、不去重**（3 次同天可满门槛）。
4. **披露阅读时长**：首次披露时 Notice dwell = 2400 + 1600ms（`arrivalNoticeReplyDwellMs`）。

## 披露文案（已确认 #435）

纯陈述「会记下」，**无**「查看/管理/删除」许诺——可控入口留待后续面板 Slice。

## 不做

- Ritual chip（Slice 2，待交互稿）
- 查看/删除 UI
- freeText L3 Consent

## 验收

1. Rise → Reflection 填 Q1+Q2 → 关面板 → `presence-signals` 有 2 条 `reflection_q*` + `reflections.v1` 仍有 bundle
2. 90 天前 bundle 在下次写入时被 prune
3. 单测：双写、prune、同日 3 Notice 满门槛、reflection freeText 不计趋势
