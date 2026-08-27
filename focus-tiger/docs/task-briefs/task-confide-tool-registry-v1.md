# Task Brief · Confide Tool Registry V1

> **状态（2026-08-26）**：**已开工**（用户书面同意「CI 白名单 → Tool Registry + 实验室 tool-call 探针」）。  
> **权威**：`CONFIDE_EXECUTABLE_INTENTS.md` · `LOCAL_AI_SCENARIOS_V1.md` · `confideExecutableTools.js`  
> **不是**开放域 Agent · **不是** App CLI（备份 / 更新仍禁止口头自动执行）

---

## 做什么

1. **Tool Registry**：把 CI-00 / CI-01 / CI-02 登记为 `CONFIDE_EXECUTABLE_TOOLS`（`id` · `ciId` · `risk` · `source` · `match`）。  
2. **生产路由不变**：`matchConfideExecutableTool` 内部仍调用现有正则（`shouldAnswerWithPracticeFacts` 等）；`ConfideToYinUI` 只经 registry 分发。  
3. **实验室探针**：`desktop/scripts/l0-tool-call-probe.js` + `npm run companion:tool-call`；冻结 fixture；**不进** Confide send 路径。  
4. **未来 hybrid（未开工）**：仅当探针过门（写工具假阳性 = 0）后，才讨论「正则 miss → Qwen 选只读 tool」。

## 不做

- 备份 Journey / App 更新 / bulk wipe 口头 tool  
- MCP / Qwen-Agent 生产接线  
- 用 Qwen 替换 Safety / 情绪桶 / YPE 门闩

---

## 冲突扫描

| 轴 | 判断 |
|---|---|
| **强度** | 行为与改前一致；无新 UI |
| **人设** | 仍模板/系统字段；禁止诊断 |
| **职责** | 明确 **≠** Operating Layer / **≠** App CLI |

---

## 验收

- 单元：`confideExecutableTools.test.js`  
- 路由锚：`desktopCompanionL2Route.test.js`（registry 接线）  
- 实验室：系统终端 `cd focus-tiger/desktop && npm run companion:tool-call` → `/tmp/ft-l0-lab/tool-call-*.json`；`writeFalsePositives === 0` 为探针过门必要条件（召回可另记）
