# Task Brief · Yin Personal Memory · Slice 1b（Remember 管道）

> **状态（2026-08-25）**：**Slice 1b 开工**（口令「开工 Yin Personal Memory」子段 1b）。  
> **权威架构**：`YIN_PERSONAL_MEMORY.md`。  
> **前置**：Slice 1a 已合（#427）；Consent + store 骨架在 develop。

---

## 做什么（本切片）

1. **Remember 管道**：Electron 宽屏 Confide，层 3 **成功生成**后、Consent = granted 时，静默抽取候选 → 写入 `memories[]`（`active`；重复观察升 confidence）。  
2. **门闩**：仅 `fallback` + `replySource=generate`；危机/情绪桶/practice_facts/诊断词 **永不**入库；失败静默（无 toast）。  
3. **IPC**：`desktop:yin-personal-memory-remember-from-confide`；preload `yinPersonalMemory.rememberFromConfide`。

## 不做（本切片）

- What Yin remembers 列表 / Forget UI（1c）  
- 层 3 prompt 注入（1d）  
- 小模型抽取器（V1 用规则/heuristic；宁可少记）  
- Web / 窄屏 bridge

## 验收

- Electron 宽屏：Consent Allow 后，unmatched L3 成功句如「I prefer quiet, short reflections.」→ `yin-personal-memory.json` 出现 1 条 `active` memory。  
- 同 rule 第二次观察 → 同条 `confidence` 升档、`lastSeenAt` 更新，不 duplicate。  
- Consent Denied / 无 bridge / 情绪桶 / 练多久 / 危机向句 → `memories` 仍空或不变。  
- L3 回复 UX 不变（Remember 不挡、不 toast）。
