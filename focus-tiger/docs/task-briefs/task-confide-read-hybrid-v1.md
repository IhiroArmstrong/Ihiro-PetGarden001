# Task Brief · Confide Read Hybrid V1

> **状态（2026-08-27）**：**已开工**（设计师拍板：regex miss → L0 只读 tool 补漏）。  
> **前置**：Tool Registry #461 + 实验室探针 `writeFalsePositives === 0`（基线 JSON：`tool-call-1787834402925.json`）。  
> **权威**：`CONFIDE_EXECUTABLE_INTENTS.md` · `confideReadHybrid.js` · `confideExecutableTools.js`

---

## 做什么

1. **Regex 优先不变**；`matchConfideExecutableTool` 命中时**绝不**调用 L0。  
2. **Regex miss + route=fallback + 宽屏 Electron**：`classifyReadTool` → 约束 JSON prompt（**无** `forget_memory_entry`）。  
3. **执行链**：parse → allowed id → registry lookup → `readOnly && autoExecute` 才执行（CI-00/02 模板）。  
4. **写工具**仍仅 regex + Consent；L0 返回 forget 一律丢弃。  
5. **不参与** Safety / 情绪桶 / YPE / L3 generate 门闩逻辑。

## 不做

- 扩大 prompt 追 15/15 召回（`practice-en-paraphrase` = known gap）  
- Qwen 主路由替换 regex  
- App CLI / bulk wipe / 备份 / 更新

---

## 冲突扫描

| 轴 | 判断 |
|---|---|
| **强度** | 仅补漏 paraphrase；canonical 仍 regex，无新 UI |
| **人设** | 命中后仍确定性 facts 模板 |
| **职责** | 只读意图补全器；≠ Operating Layer |

---

## 验收

- 单元：`confideReadHybrid.test.js` · `confideExecutableTools.test.js` · `desktopCompanionL2Route.test.js`  
- 实验室：同一 fixture 探针仍 `writeFalsePositives === 0`（lab prompt 仍含 forget 测假阳性）  
- **人工**：Electron 宽屏 — canonical CI-00/01/02 与改前一致；paraphrase presence 可补（视模型）；practice paraphrase 不保证
