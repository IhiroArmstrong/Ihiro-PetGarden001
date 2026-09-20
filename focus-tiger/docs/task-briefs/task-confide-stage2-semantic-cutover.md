# Task Brief · Confide Stage 2 语义切真路由

> **状态（2026-09-21）**：已开工。Electron 默认 `live`；`FT_CONFIDE_SEMANTIC_ROUTING=shadow` 回滚 Stage 1。  
> **口令**：本 Brief。  
> **权威实现**：`confideSemanticStage2.js` · `ConfideToYinUI._applyLiveSemanticThenDispatch` · `l1Runtime.semanticLiveClassify`

## 做什么

在安全 / 他人攻击正则**之后**、功能 handler **之前**，等 embedding 粗桶：

- 语义 `functional` + 字面情绪桶 → 改走 `fallback`，让 `practice_facts` / Hybrid / honesty 有机会命中（「累积了多久」类误伤）
- 语义失败 / gray / 情绪自述灰区 → **不改**字面路由（`有点烦` / `睡不着` 仍可 generate 观察翼）
- Web / 无 IPC：行为与 Stage 1 相同

## 明确不做

- 不改 `confideClassify` 词表
- 不把闲聊金标准拧成功能桶
- 不切观察翼答句护栏
- 制造机脚本仍不得打印「可以切 Stage 2」

## 回滚

Electron 主进程环境变量 `FT_CONFIDE_SEMANTIC_ROUTING=shadow`（或 `off` / `stage1`）。

## 验收

- 单测：`confideSemanticStage2.test.js` · `confideReplyFlow.test.js` · `desktopCompanionL2Route.test.js` IPC 锁
- 人工（Electron 宽屏 ready）：`累积了多久` 仍须 `practice_facts`；`有点烦` 仍可 generate；`I don't want to live` 仍 safety-01、不等 embedding
