# Task Brief · Confide Stage 2 语义切真路由

> **状态（2026-09-21）**：Brief 已按分析师阻塞项加锁。Electron 默认 `live`；`FT_CONFIDE_SEMANTIC_ROUTING=shadow` 回滚 Stage 1。  
> **口令**：本 Brief。  
> **权威实现**：`confideSemanticStage2.js` · `ConfideToYinUI._applyLiveSemanticThenDispatch` · `l1Runtime.semanticLiveClassify`  
> **范围声明**：这是 Stage 2 的**第一刀（先窄后宽）**，不是把「真实有利分歧 6 条」整包重放。

## 做什么

在安全 / 他人攻击正则**之后**、功能 handler **之前**，仅当 embedding **已经 ready** 时读取粗桶：

- 语义 `functional` + 字面**情绪桶** → 改走 `fallback`，让 `practice_facts` / Hybrid / honesty 有机会命中（「累积了多久」类误伤的安全网）
- 语义失败 / gray / 情绪自述灰区 / 字面本就是 gray → **不改**字面路由（`有点烦` / `睡不着` 仍可 generate 观察翼）
- Web / 无 IPC：行为与 Stage 1 相同

## 阻塞级不变量 · embedding 未就绪不得挡回复

Live 路径**禁止**等待 embedding 冷启动或加载完成。Stage 1 影子是 fire-and-forget；Stage 2 切真之后，可用性仍高于多等几秒的精准度。

| 发送时 embedding 状态 | Live 必须做什么 |
|---|---|
| `ready` | 可等**这一次**粗桶计算；失败 / 超时 → 立刻按字面路由发出（fail-open） |
| `unknown` / `loading` / `error` | **立刻**按字面路由发出，**不等** `waitForReady`。可在后台 `ensure-embedding`，供下一句用 |

禁止把 Prompt 11 的 15s 影子分类预算拿来让用户干等冷启动。用户点发送后 0–1 秒内仍须看到发送钮 disabled +「正在听」或立刻出 corpus；冷启动第一句若命中本刀规则，表现必须与切前字面路由相同，不得多卡数秒。

## 与「真实有利分歧 6 条」的落差（写清楚，避免事后以为修好了）

拍板用过的证据是 **Real 6（门槛 5）**：影子 CSV 1 条 + 现网肉测 KEEP 5 条。制造机公式是「字面 ≠ golden 且语义 = golden」，现网这 6 条**字面都是 gray，不是字面情绪桶**。

本刀只处理 **字面情绪桶 ∩ 语义 functional**。因此：

| 句子 | 字面粗桶 | 本刀会不会改现网行为 |
|---|---|---|
| 我有点不高兴 | 字面灰（影子 KEEP） | **不会**（切前切后都走原字面） |
| 有点烦 / 睡不着 | 字面灰 | **不会**（仍可 generate） |
| I need some practice. | 字面灰、语义 functional | **不会**（不会被抬去练习账本） |
| 其余现网肉测 KEEP（如「为什么开始做这件事？」「我今天不想练习了。」等） | 字面灰 | **不会** |

制造机 60 条 KEEP 在现网字面上同样全是 gray：0 条会被本刀改路由。  
「累积了多久」已是 patched 锚点（字面已 functional）；本刀是同类**尚未**被正则收口的情绪桶误伤的安全网，不是 6 条证据的完整实现。后续刀（gray→功能桶等）另开 Brief。

## 明确不做

- 不改 `confideClassify` 词表
- 不把闲聊金标准拧成功能桶
- 不切观察翼答句护栏
- 制造机脚本仍不得打印「可以切 Stage 2」
- 不在 live 路径上等待 embedding 变 ready

## 回滚

Electron 主进程环境变量 `FT_CONFIDE_SEMANTIC_ROUTING=shadow`（或 `off` / `stage1`）。设回后：同样三句验收句必须回到切前行为（不等粗桶、不改路由）。

## 验收

- 单测：`confideSemanticStage2.test.js`（含「未 ready 不得 await」）· `confideReplyFlow.test.js` · `desktopCompanionL2Route.test.js` IPC 锁 · `FT_CONFIDE_SEMANTIC_ROUTING=shadow` 时 `applyConfideStage2Route` 不改情绪桶
- 人工（Electron 宽屏 ready）：`累积了多久` 仍须 `practice_facts`；`有点烦` 仍可 generate；`I don't want to live` 仍 safety-01、不等 embedding
- **冷启动 / 未就绪**：companion 刚起、embedding 尚未 `ready` 时发一句若在 ready 后会走本刀的功能句（或测试替身：字面情绪桶 + 语义 functional），确认**立刻**字面路由、不卡在「正在听」数秒。回滚开关打开时同一句也必须是切前行为
- **回滚开关实测**：主进程 `FT_CONFIDE_SEMANTIC_ROUTING=shadow` 后重跑上面三句，行为与 Stage 1 相同
- **就绪延迟**：embedding 已 ready 时，记一条 live 粗桶墙钟（现成 `timing.wallMs` / `embedMs`）。只记录数字，不在本刀调阈值；15s 影子超时不得出现在用户可感知等待里

## Stage 2b（gray→功能桶）重新评估触发点（2026-09-22）

本刀只处理字面情绪桶 ∩ 语义 functional。gray→功能桶**不是** KB 问法矩阵能生成的证据。

| 门闩 | 数字 |
|---|---|
| 日历 | 窄刀在 develop 满 **3 周**；与 with-prior 同日 **2026-10-12** 复核 |
| 样本量 M | live/shadow jsonl 中 **literal=gray 且 semantic=functional** 的**互异句 ≥ 25** |
| 不算 M | 制造机 45 条 KEEP（多数 literal=gray）只作候选池，**不**计入真实 M |
| 人工 | PO 从 M 抽 **20** 条标 KEEP（该被功能桶接住）/ DROP（该留灰或 generate） |
| 才开 Stage 2b 扩面 Brief | KEEP ≥ 12 **且** 误拉情绪/闲聊少于 2 |

未到门闩：**按兵不动**，但日期已钉死，禁止无限期「等以后」。
