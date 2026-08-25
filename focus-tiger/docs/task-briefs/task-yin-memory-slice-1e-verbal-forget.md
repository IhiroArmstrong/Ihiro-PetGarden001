# Task Brief · Yin Personal Memory · Slice 1e（口头 Forget 路由）

> **状态（2026-08-25）**：**已合 #434**（develop）。  
> **权威架构**：`YIN_PERSONAL_MEMORY.md` · `CONFIDE_EXECUTABLE_INTENTS.md`（CI-01）。  
> **前置**：Slice 1c 已合（#430）；Slice 1d 已合（#431）。**不依赖** 1d tracker 人工关单。

---

## 做什么（本切片）

1. **口头 Forget 意图**：Confide 发送链 · `practice_facts` 之后 · 层 3 之前；`fallback` + Consent granted + bridge。  
2. **主题匹配**：1d 同族重叠；至多删 1 条；并列 → 不删。  
3. **删除**：复用 `desktop:yin-personal-memory-forget`；`data-source=memory_forget`；面板同步 `removeMemoryIfOpen`。

## 不做

bulk wipe · 新 IPC · L3 确认句 · Web bridge · 仪式 generate 扩权

## 验收

见 `CONFIDE_EXECUTABLE_INTENTS.md` · `yinPersonalMemoryVerbalForget.test.js` · tracker 行 `feature-yin-memory-slice-1e-verbal-forget.md`
