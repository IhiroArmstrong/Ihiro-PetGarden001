# Task Brief · Yin Personal Memory · Slice 1c（What Yin remembers + Forget）

> **状态（2026-08-25）**：**Slice 1c 开工**（口令「开工 Yin Personal Memory」子段 1c）。  
> **权威架构**：`YIN_PERSONAL_MEMORY.md`。  
> **前置**：Slice 1b 已合（#428）；Remember 管道在 develop。

---

## 做什么（本切片）

1. **What Yin remembers 列表**：Electron 宽屏；Confide 面板内链「What Yin remembers」→ 玻璃卡片列出 `active` 记忆（类型 + 摘要 + Why 一句）。  
2. **Forget**：列表 Forget 按钮 → 0–1s 内从 UI 消失 + IPC 真删 `memories[]` 条目（非 soft-delete）。  
3. **IPC**：`desktop:yin-personal-memory-forget`；preload `yinPersonalMemory.forget`。

## 不做（本切片）

- 层 3 prompt 注入（1d）  
- Edit 摘要  
- 口头「别再记这个」Confide 路由（可 1d 后另议）  
- Web / 窄屏 bridge

## 验收

- Electron 宽屏：Confide →「What Yin remembers」→ 见 1b 写入的条目；点 Forget → 行立刻消失；`yin-personal-memory.json` 该 id 已删。  
- Consent Denied → 面板说明未记住；空列表文案。  
- Web / 375：无链、无面板。
