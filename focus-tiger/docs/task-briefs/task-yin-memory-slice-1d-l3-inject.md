# Task Brief · Yin Personal Memory · Slice 1d（层 3 注入）

> **状态（2026-08-25）**：**Slice 1d 开工**（口令「开工 Yin Personal Memory」子段 1d）。  
> **权威架构**：`YIN_PERSONAL_MEMORY.md` §9–§10。  
> **前置**：Slice 1c 已合（#430）；Remember + Forget UI 在 develop。

---

## 做什么（本切片）

1. **检索**：Electron main `companion.generate` 前读 `yin-personal-memory.json`；Consent = granted 时按用户句主题取最多 **3** 条 `active` 摘要。  
2. **门槛**：`low` 不注入；`medium`/`high` 须主题相关；无相关记忆 = 不硬插。  
3. **注入**：`buildCompanionL2Prompt` 增加观察式 recall 块；Safety / Corpus 路径不调用检索（仍只在 fallback L3）。

## 不做（本切片）

- 口头「别再记这个」Confide 路由  
- Edit 摘要  
- 仪式场景 generate  
- Web / 窄屏

## 验收

- Electron 宽屏：Consent Allow + 1b 写入 Monday pattern（第二次观察 medium）→ 再发「Monday feels crowded」→ L3 生成 prompt 含该摘要（单测锁）。  
- 无关闲聊（天气）→ prompt 无 recall 块。  
- Consent Denied / low confidence → 不注入。  
- AE 安全/情绪桶/练多久路径不变。
