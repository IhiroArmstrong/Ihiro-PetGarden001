# Task Brief · 目录 / 近邻命中后再核「是不是情绪自述」

> **状态（2026-10-13）**：PO 已点头立本 Brief，并点头第一段（只记日志 + 实验室，不改回复）。第一段已开工。  
> **盘点拍板（同日稍后）**：目录 / 近邻误命中并入 [`task-confide-routing-arbitration-v1.md`](./task-confide-routing-arbitration-v1.md) 前两刀，不再另开第二份 Brief。接到发送链仍须路由仲裁 v1 的 live 点头。
> **类别**：影子日志 = **A 类**。改短答 = **B 类**。
> **分支建议**：实现时另开 `feature/confide-kb-catalog-near-misfire-shadow`，不要叠在情绪否决分支上。
> **来源**：[`task-confide-kb-gate-mood-veto.md`](./task-confide-kb-gate-mood-veto.md) 第一轮后决定 3、第二轮后决定 5、第三轮后决定 6；[`ISSUE_LEDGER.md`](../ISSUE_LEDGER.md)「徽章能否当寅币用 → 误命中寅币短答」。登记片：[`task-entries/confide-kb-catalog-near-misfire.md`](../task-entries/confide-kb-catalog-near-misfire.md)。

## 问题

知识库产品闸的情绪否决按现有设计管不到「已经命中」的句子。`resolveProductKnowledgeGateAction` 里 `catalogHit` 最先判，命中就念短答。近邻先接成某条目录时也一样。情绪分再高，也走不到否决。

实验室第三轮因此留下的漏网（否决按设计管不到，英文 51/57 不靠调否决补）：

- 英文 6 句：I'm just sitting here for a bit. / I just want something sweet to escape for a bit / I can't sit still today and I want to quit / I want to order a pizza and forget about everything / Practice felt pointless today / I keep replaying a conversation from years ago
- 中文 1 句：不想再被各种会员推销缠着

同一根因的另一句，不是情绪自述：

- `徽章 是否 可以 做 focus coin 来 使用？`：粗桶 `gray`，source `product_knowledge`，近义或关键词打到寅币条，念了赚币短答。所答非所问。

## 已拍板的方向

目录命中或近邻命中之后，再过一道复核：**这句是不是情绪自述。**

是情绪自述 → 这次命中不能当成答复（不得把上面那 7 句念成产品短答）。

不是情绪自述 → 维持今天的命中短答。真正的产品问（如「接地练习在哪」「A Quiet Line 在哪」）不得被这道复核改道。

本页不锁用哪套分数、margin 多少、写在哪个函数。情绪否决 Brief 已决定不再跑 Library C 分数同类实验室；实现切片不得用「再扫一遍 Library C」代替这道复核。

## 徽章 ≠ 寅币（并进本 Brief，情绪复核盖不住）

这句是在问徽章和寅币的关系，不是情绪自述。上面那道复核即使做了，也不会拦它。

已锁的只有结果：不得念赚币短答。

PO 2026-10-13 倾向：**诚实空态**（指向 Help Center；「徽章≠寅币」文章已另合）。改这句的回复之前须再确认一次。本段影子不特判这句，也不新增目录正文。

## 明确不做（本回合，以及未另点头之前）

- 第一段只在已经念出短答时追加影子日志；不改用户看到的回复
- 不把情绪否决、规则 1、窄规则 1 接上线；2b 继续 shadow（见情绪否决 Brief 第三轮后决定 2、5）
- 不再跑 Library C 分数同类实验室
- 不改 Library C 阈值，不改 `decideKbNearMatch` 的分档（近邻中间带诚实空态仍按原 Brief）
- 不改日语路径（母语审前不上线；影子阶段暂时放过，见情绪否决 Brief 第三轮后决定 4）
- 不写「徽章≠寅币」短答，不改寅币账本

## 冲突扫描（对照 `SCENARIO_TESTS.md`）

- **场景 AE · catalog 真命中**（「接地练习在哪」「A Quiet Line 在哪」→ `product_knowledge`）：第一段短答正文不变，无冲突。将来 B 类只允许情绪自述误命中改道，不得把这两类真命中改成观察翼或诚实空态。
- **场景 AE · 未命中诚实空态**：本 Brief 不放宽「产品问未命中必须诚实空态」。
- **近邻中间带**（`task-confide-kb-embedding-near-match.md`）：管的是已经判成命中的句子，不改 0.62–0.80 诚实档。
- **情绪否决 Brief**：`catalogHit` 先于否决的现网行为保持到本任务另点头。本 Brief 不回头改「只加否决、不加规则 1」。

**结论**：无未拍板冲突。徽章倾向诚实空态，改这句回复前再确认一次；不是和场景打架。

## 已好清单（将来改发送链时须守，本回合不改）

- 真产品短答仍短答
- 情绪否决仍只在影子里，2b 仍 shadow
- 近邻中间带分档不变
- 徽章句在复核上线前，行为与今天相同（仍会误命中；不假装已修）
