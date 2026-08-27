# Task Brief · Local AI Operating Layer 架构文（B0）

> **状态（2026-08-27）**：**本旁支开工**（只文档）。  
> **权威**：`LOCAL_AI_OPERATING_LAYER.md`  
> **拍板**：A 轨 Confide 代码冻结（验收 #472）；B 轨只写架构 MD。

---

## 做什么

1. 入库方向锁：Yin ≠ Local AI ≠ Auto-Operating。  
2. 锁死：Confide 不得执行 Operating Tools；Backup / Update / MCP 不进 Confide V1。  
3. 交叉引用：`CONFIDE_EXECUTABLE_INTENTS.md` · `LOCAL_AI_SCENARIOS_V1.md` · `RULES_INDEX` §B · `focus-tiger-docs.mdc`。

## 不做

运行时 · Auto-Operating UI · Operating 空壳 · 新 CI-xx · 改 Confide send

## 验收

`npm run docs:check`。无用户可见 UI → tracker「仅单元测试覆盖」。
