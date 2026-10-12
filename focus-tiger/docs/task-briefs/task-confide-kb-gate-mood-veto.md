# Task Brief · 知识库产品闸加「情绪 / 生活自述」否决（根因方案 · 中英日）

> **状态（2026-10-13）**：**第一段已点头**（PO 决定见下文「PO 决定（2026-10-13 · 第一段已点头）」）。实验室第一轮、第二轮、第三轮均未过关（第三轮英文 51/57 = 89.5%）。第三轮后 PO 决定见「PO 决定（实验室第三轮后）」：**第二段不点头**，不再跑 Library C 分数同类实验室；否决形态保持「只加否决、不加规则 1」，第二段仍不上线。
> **类别**：分两段。第一段影子 + 实验室 = **A 类**（不改用户看到的回复）；第二段切 live = **B 类**（改变回复来源），须本 Brief 第二段单独点头。
> **分支建议**：第一段 `feature/confide-kb-gate-mood-veto-shadow`；第二段另开 `feature/confide-kb-gate-mood-veto-live`。各一 PR。
> **来源**：`ISSUE_LEDGER.md`「根因扇出 · Confide 把生活/情绪句判成产品问」；#1188 只补了三族中文字面豁免（`task-confide-mood-aside-product-gate.md`），根因未解。

## 背景：为什么 #1188 不够

#1188 在 `isConfideMoodAsideFromProductKnowledge` 加了三族中文关键词。词表只能追已经发生的说法，下面这些今天仍会掉进「Yin doesn't keep a manual…」：

- 回忆族别的说法：「昨晚又梦到以前的事」「我妈总让我想起以前」
- 放弃 / 想哭：「今天坐不住，想放弃」「练着练着就想哭」
- 逃避族别的说法：「想抽烟」「想吃点甜的逃避一下」
- 所有英文、日文同类句

## 代码现状（2026-10-13 · `origin/develop` `12ee6cb4`）

和分析师的描述有一处不同，影响方案落点：

1. **语义层已经有情绪类别。** 粗分流（Stage 2）是三桶 `functional / emotional / gray`（`confideSemanticBuckets.js`），情绪桶来自 Library B（约 50 句中英情绪自述，`confideSemanticExamples.js`）。
2. **但知识库产品闸没用它。** 闸走的是另一条路：`classifyProductKnowledgeGate`（`desktop/companion/l1EmbeddingHold.js` 约 L161–183）只拿 Library C（产品问，约 20 句）和 Library LIFE（6 句「晚饭吃什么」类日常问）比分，得出 `isProduct` 与 `lifeOutranksProduct`。情绪自述既不像 C 也不像 LIFE，所以「练习」等字面词一拉近 C，就判成产品问。
3. **三库里没有一句日文**（A / B / C / LIFE 都是中英）。日文句在闸里只能靠和中英原型的跨语言距离碰运气。
4. **2b 抬桶那条路完全绕过闸。** `ConfideToYinUI.js` L1667–1676：`stage2bLivePromote` 为真时直接念诚实空态，不经过 `resolveProductKnowledgeGateAction`，#1188 的豁免和 `lifeOutranksProduct` 都管不到（现网 2b 默认 shadow，所以今天不触发；单独记在 Ledger）。

所以根因方案不是「新造一个分类器」，而是**让产品闸也问一句「这更像情绪自述吗」**，用的就是现成的同一个 embedding 模型。

## PO 决定（2026-10-13 · 第一段已点头）

| # | 决定 |
|---|---|
| 1 | 新建 `CONFIDE_SEMANTIC_LIBRARY_MOOD_ASIDE`，**不动** Library A / B / C |
| 2 | 2b 抬桶那条路**并进本 Brief**。第一段只在影子日志里记「这次 2b 抬桶会不会被情绪否决」，**不改行为** |
| 3 | 日文门槛 **80%**；日文样本须由我们的日语母语者审过，**审前日文结果只算暂定** |
| 4 | 对照组（产品问 / 抱怨 / 混合 / 练习事实）**≥40 句**，误放行（被情绪否决送进观察翼）必须 **0** |
| 5 | 混合句（情绪 + 具体功能问，如「太累了，怎么关提醒？」）期望走**产品答复**（短答或诚实空态），**不得**进观察翼；写进对照组 |
| 6 | 2b 继续 shadow；第二段（改回复）等实验室数字出来**另点头** |

## 方案

### 第一段（A 类 · 影子 + 实验室）

| 项 | 口径 |
|---|---|
| 新原型库 | `CONFIDE_SEMANTIC_LIBRARY_MOOD_ASIDE`（`confideSemanticExamples.js`）：中英日三语情绪 / 生活自述，每语 ≥15 句，种子 = Library B 中适合的句子 + 本 Brief 验证集**之外**另写的同族句（验证集不得进种子，否则自测自）。**不改** Library A / B / C，Stage 2 粗分流不受影响 |
| 打分 | `classifyProductKnowledgeGate` 多返回 `moodScore` 与 `moodOutranksProduct`（`moodScore > productScore + margin`；margin 初值 0，实验室定） |
| 影子日志 | `turns.jsonl` 的产品闸行加 `kb_mood_score` / `kb_mood_outranks`；**不**改 `resolveProductKnowledgeGateAction` 的返回值 |
| 2b 影子（PO 决定 2） | 2b 抬桶判定处多记一个字段：若这次抬桶，情绪否决会不会拦下它；**不**改 `stage2bLivePromote` 的取值与 2b 行为 |

**审计后落点（2026-10-13 · 第一段已实现）**

- 审计发现 `turns.jsonl` 原本**没有**产品闸行（渲染层只写未命中的 `kb_retrieval_miss`，Electron 侧产品闸不落日志）。故新增一种行 `kind: kb_product_gate_shadow`，由主进程 `l1Runtime.semanticProductKnowledgeGate` 在分类成功后写入；返回给渲染层的字段**不变**。只存 `queryHash` + `textLength`，不存原文（与 `kb_retrieval_miss` 同口径 · #1037）。字段：`score` / `minScore` / `lifeScore` / `lifeOutranksProduct` / `kbMoodScore` / `kbMoodOutranks` / `nearestId` / `nearestScore`。保留期按影子审计行 7 天。
- 字段名用 camelCase（`kbMoodScore` / `kbMoodOutranks`），与现有 `turns.jsonl` 行一致，替代本表原写的 `kb_mood_score` / `kb_mood_outranks`。
- 2b：`semantic_shadow_classify` 行加 `kbProductScore` / `kbMoodScore` / `kbMoodOutranks` / **`stage2bMoodVeto`**（= `stage2bWouldPromote && kbMoodOutranks`；无情绪分时为 `null`）。live 分类走缓存复用时同样带上。`src/ui/ConfideToYinUI.js` 未改。
- 实验室：`node desktop/scripts/l0-kb-mood-veto-lab.js`（`desktop/package.json` 不在本刀白名单，未挂 npm 名）；验证集 `src/core/confide/confideKbMoodVetoLabSet.js`，第二段规则只在 `confideKbMoodVetoLabScore.js` 里模拟，未接进发送链。
| 实验室 | 复用 `desktop/scripts/l0-kb-near-calibrate.js`（或同目录新脚本，按 `LAB_SCRIPT_CONVENTIONS.md` 命名），对下方验证集出表：每句 productScore / moodScore / lifeScore / 是否否决 |
| 冷启动成本 | 多算约 45–60 个向量，与 C / LIFE 同一批预计算，走现有 `l1LlamaWorkGate`；实验室须报冷启动多出的毫秒数 |

### 第二段（B 类 · 切 live · 第一段数据过关后再点头）

`resolveProductKnowledgeGateAction`：`semanticIsProduct` 或 `nearAction === 'honesty'` 时，若 `moodOutranksProduct` → `skip`（走观察翼），与现有 `lifeOutranksProduct` 同一处、同一写法。`catalogHit` 仍最先判，命中短答照常答。

#1188 的字面豁免**保留**作冷启动 / embedding 未就绪时的兜底，不删。

## 验证集（实验室 · 过关门槛）

**情绪 / 生活自述（期望否决 → 观察翼）**

- `stage2b-negative-control.txt` 全部非注释行（41 句冻结 + 后补）
- 今晚三句：最近老是想起以前 / 我今天练习的太久啦。/ 我不想练习，想喝酒。
- 未覆盖句型（中）：昨晚又梦到以前的事 / 我妈总让我想起以前 / 今天坐不住，想放弃 / 练着练着就想哭 / 想抽烟 / 想吃点甜的逃避一下
- 英文同族：I keep thinking about the past lately / I practiced way too long today / I don't want to practice, I want a drink / I feel like giving up today / I want a cigarette / I just want something sweet to escape for a bit
- 日文同族：最近昔のことばかり思い出す / 今日は練習しすぎた / 練習したくない、お酒が飲みたい / 今日はもう諦めたい / 練習してたら泣きたくなった / タバコが吸いたい

**对照组 · 产品问 / 产品抱怨 / 混合 / 练习事实（期望不否决 → 仍短答或诚实空态；合计 ≥40 句，PO 决定 4）**

- Library C 全部 + 知识库路由矩阵 `confideKbRoutingMatrix.js` 的产品问行
- 产品抱怨：Sit 按钮不见了 / 备份失败了 / The Sit button disappeared / Backup failed / 座るボタンが消えた / バックアップに失敗した
- 混合句（PO 决定 5：期望走产品答复，不得进观察翼）：太累了，怎么关提醒？/ I'm exhausted, how do I turn off reminders? / 疲れた、リマインダーはどう消す？
- 练习事实：我练了多久 / how long have I been practicing / どれくらい練習した？

**过关门槛（第二段点头的前提）**

| 组 | 门槛 |
|---|---|
| 对照组（产品问 / 抱怨 / 混合 / 练习事实，≥40 句） | 误否决 **0** |
| 情绪自述 · 中 | 否决 ≥ 90% |
| 情绪自述 · 英 | 否决 ≥ 90% |
| 情绪自述 · 日 | 否决 ≥ 80%（三库原本无日文，先放宽；未达则报差多少，不硬调 margin 凑数）。**日文原型与验证句须经日语母语者审过；审前结果只算暂定，不能作第二段点头依据** |

不过关 → 第一段停在影子，汇报差距，不进第二段。

## 实验室第一轮（2026-10-13 · margin 0 · 日文暂定）

`/tmp/ft-l0-lab/kb-mood-veto-lab-1791841009349.{json,md}`。**未过关**，第一段停在影子。

| 组 | 结果 | 门槛 | |
|---|---|---|---|
| 情绪 · 中 | 41/44 = 93.2% | ≥90% | 过 |
| 情绪 · 英 | 15/17 = 88.2% | ≥90% | **差 1 句** |
| 情绪 · 日 | 6/6 = 100% | ≥80% | 过（**暂定**，未经母语审） |
| 对照组 | 163 句，误否决 **3** | ≥40 句，误否决 0 | **不过** |
| 冷启动 | +950 ms（51 个情绪向量） | 报数 | — |

- 误否决：混合句「太累了，怎么关提醒？」「疲れた、リマインダーはどう消す？」（情绪片段压过功能问）；练习事实「累积了 多久」（现网它在产品闸之前就被练习事实路由接走，实验室是强行送进闸测的）。英文混合句是目录命中，否决管不到，所以没出事。
- 对照组今天就已走观察翼的 1 句：「坐着 能不能 聊」，不是否决造成的。
- 情绪漏网 5 句：「I'm just sitting here for a bit.」「I just want something sweet to escape for a bit」「不想再被各种会员推销缠着」是**目录 / 近邻误命中**（hit 先判，否决按设计管不到，另一个根因）；「看那些开通入口就烦」「观察翼」是产品分高于情绪分。
- margin 扫描（0 / 0.02 / 0.05）：误否决 3 / 3 / 2，情绪否决率同步下降，**调 margin 解决不了**。
- 只算不入库的假设：否决前加一条「句子带功能问法（`isProductKnowledgeColdStartProbe`：怎么 / 如何 / how do / どう…）就不否决」，结果：中 40/44、英 15/17、日 6/6，混合句 3 句全部回到产品答复，误否决只剩「累积了 多久」。

### PO 决定（实验室第一轮后 · 2026-10-13）

第一轮后列出的四个待决问题，PO 已逐条回答，另加两条。第二轮按此执行，仍是 A 类：只改实验室与 Brief，不改任何用户可见回复，2b 继续 shadow。

| # | 当时的问题 | 决定 |
|---|---|---|
| 1 | 要不要把「带功能问法就不否决」作为第二段规则 | **同意**。句子带功能问法（`isProductKnowledgeColdStartProbe`）时不否决。本轮**只在** `confideKbMoodVetoLabScore.js` 里模拟（下称「规则 1」），不接进发送链 |
| 2 | 「累积了 多久」移出对照组，还是要求闸本身也挡住 | **移出对照组**。真实路径的断言由知识库路由矩阵承担：`confideKbRoutingMatrix.js` 的 `practice-duration-space-zh`（`lock: 'must-hit'`，`dataSource: 'practice_facts'`，在 `KB_ROUTING_MATRIX_REGRESSION_IDS` 里）。实验室把它强行送进闸测，不代表现网路径 |
| 3 | 目录 / 近邻误命中情绪句要不要单独立项 | **另立任务**，与 Ledger「徽章能否当寅币用 → 误命中寅币短答」合并成一条登记（同一根因：目录 / 近邻命中先判，答非所问）。**只登记，不实现**：[`task-entries/confide-kb-catalog-near-misfire.md`](../task-entries/confide-kb-catalog-near-misfire.md) |
| 4 | 英文差 1 句、日文待审 | 英文情绪集扩到 **≥40 句**再判门槛，**不靠规则 1 凑数**（英文门槛按不带规则 1 的否决率判，带规则 1 的数字只作参考）。日文须母语审完才算；样本量不足也要写明 |
| 5 | （新增）反向风险 | 情绪 + 怎么 / how / どう 的句子（如「练着练着就想问怎么放弃」）放进**情绪组**，单列 group `reverse_risk`，期望**仍否决**；报规则 1 下漏否决几句。该组不计入中 / 英 / 日否决率，单独出数 |
| 6 | （新增）第二段 | 等本轮数字出来**另点头**；本轮不进第二段 |

## 实验室第二轮（2026-10-13 · margin 0 · 日文暂定）

`/tmp/ft-l0-lab/kb-mood-veto-lab-1791842121750.{json,md}`。**未过关**（英文差一点），第一段继续停在影子。

本轮改动：英文情绪句加 28 句（`family_en_r2`）；新增 `reverse_risk` 组 8 句（中 3 / 英 3 / 日 2）；对照组去掉「累积了 多久」（162 句）；打分多出一列「+ 规则 1」。门槛按**不带规则 1** 的否决率判（PO 决定 4）。

| 组 | 只加否决 | 否决 + 规则 1（参考） | 门槛 | |
|---|---|---|---|---|
| 情绪 · 中 | 41/44 = 93.2% | 40/44 = 90.9% | ≥90% | 过 |
| 情绪 · 英 | 40/45 = 88.9% | 40/45 = 88.9% | ≥90%，且 ≥40 句 | **差 1 句**（41/45 才过） |
| 情绪 · 日 | 6/6 = 100% | 6/6 = 100% | ≥80% | **暂定**：未经母语审，且只有 6 句，样本量不足以下结论 |
| 反向风险（8 句，期望否决） | 8/8 否决 | **1/8**，漏 7 句 | 只报数 | — |
| 对照组（162 句） | 误否决 **2** | 误否决 **0** | ≥40 句，误否决 0 | 只加否决不过；加规则 1 过 |
| 冷启动 | +982 ms（51 个情绪向量） | 同左 | 报数 | — |

- **英文漏的 5 句全是目录 / 近邻先命中**，否决按设计管不到：I'm just sitting here for a bit. / I just want something sweet to escape for a bit / I can't sit still today and I want to quit / I want to order a pizza and forget about everything / Practice felt pointless today。英文里没被目录先接走的 40 句，否决全拦下了。所以英文差的那 1 句属于决定 3 另立的任务，调否决本身补不上。
- **中文漏的 3 句**：「不想再被各种会员推销缠着」是目录先命中；「看那些开通入口就烦」「观察翼」产品分高于情绪分（与第一轮相同）。
- **规则 1 的代价**：中文多漏 1 句「怎么又这样……」（这里的「怎么」是感叹，不是问）。反向风险 8 句里 7 句被规则 1 放回诚实空态，只有「I don't know how to keep going today」因为今天就走观察翼而没受影响。这 7 句今天本来也走诚实空态，规则 1 不会让它们比现在更差，但也没修好。
- **只加否决时的 2 句误否决**就是混合句「太累了，怎么关提醒？」「疲れた、リマインダーはどう消す？」；加规则 1 后两句都回到产品答复（PO 决定 5）。
- 对照组今天就走观察翼的仍是「坐着 能不能 聊」1 句，不是否决造成的。
- margin 扫描（0 / 0.02 / 0.05）：误否决 2 / 2 / 2，中文否决 41 / 39 / 37，英文 40 / 40 / 37。**调 margin 仍解决不了。**

### 第二轮之后，第二段点头前要定的事

规则 1 用的是「怎么 / how / どう」这类问法词，混合句和反向风险句都带这些词，所以它修好了混合句，也放走了反向风险句。第二段若要两头都顾到，规则 1 得更窄（例如问法词**加**产品名词同时出现才不否决）。这是新规则，需要 PO 点头后在实验室里再跑一轮，本轮没有做。

### PO 决定（实验室第二轮后 · 2026-10-13）

第二轮后列出的待决事项，PO 已逐条回答。第三轮按此执行，仍是 A 类：只改实验室与 Brief，不改任何用户可见回复，2b 继续 shadow。第二段**先不点头**。

| # | 决定 |
|---|---|
| 1 | **第二段先不点头。** 等第三轮数字出来再另说 |
| 2 | **试窄规则 1。** 要同时满足「是提问结构」（仍用 `isProductKnowledgeColdStartProbe`）和「指向产品功能」才不否决。产品指向用 Library C 语义分判定（现网 `semanticIsProduct`：分数达到 Library C 最低分），**不手写名词表**。只在 `confideKbMoodVetoLabScore.js` 模拟（`withVetoNarrowAskGuard`），**不接发送链**。旧规则 1 继续并列出数 |
| 3 | 「怎么」既可能是提问也可能是感叹。「怎么又这样……」「怎么才能不难过」这类句子放进反向风险组，期望仍否决 |
| 4 | 反向风险组扩到 **≥30 句**，中英日都有，继续单列，不计入中 / 英 / 日否决率。报旧规则 1 与窄规则 1 各自漏否决几句 |
| 5 | 英文差的那 1 句**不调否决**，归目录 / 近邻误命中任务（`task-entries/confide-kb-catalog-near-misfire.md`）。英文情绪集再补（`family_en_r3`），门槛仍按**不带规则**的否决率判 |
| 6 | 日文审前一律只算**暂定**。母语审**不作为本轮拦路项**（本轮不因「还没母语审」停工或改判过关） |

## 实验室第三轮（2026-10-13 · margin 0 · 日文暂定）

`/tmp/ft-l0-lab/kb-mood-veto-lab-1791843463627.{json,md}`。**未过关**（英文仍差一点），第一段继续停在影子。第二段未点头。

本轮改动：英文情绪句再加 12 句（`family_en_r3`）；「怎么又这样……」从 Stage 2b 负例组改计入 `reverse_risk`（该句不再进中文否决率）；反向风险组扩到 32 句（中 12 / 英 10 / 日 10），含「怎么才能不难过」。打分在旧规则 1 旁边多一列「+ 窄规则 1」（提问结构并且 Library C 的 `semanticIsProduct` 为真才不否决）。门槛仍按**不带规则**的否决率判。日文未经母语审，只报暂定，不拦本轮。

| 组 | 只加否决 | 否决 + 规则 1 | 否决 + 窄规则 1 | 门槛 | |
|---|---|---|---|---|---|
| 情绪 · 中 | 40/43 = 93.0% | 40/43 = 93.0% | 40/43 = 93.0% | ≥90% | 过 |
| 情绪 · 英 | 51/57 = 89.5% | 51/57 = 89.5% | 51/57 = 89.5% | ≥90%，且 ≥40 句 | **差 1 句**（52/57 才过） |
| 情绪 · 日 | 6/6 = 100% | 6/6 = 100% | 6/6 = 100% | ≥80% | **暂定**（6 句，未经母语审；不拦本轮） |
| 反向风险（32 句，期望否决） | 32/32 否决 | **9/32**，漏 23 句 | **9/32**，漏 23 句 | 只报数 | 窄规则与旧规则 1 相同 |
| 对照组（162 句） | 误否决 **2** | 误否决 **0** | 误否决 **0** | ≥40 句，误否决 0 | 只加否决不过；两条规则都过 |
| 冷启动 | +1141 ms（51 个情绪向量） | 同左 | 同左 | 报数 | — |

- **窄规则 1 在这 300 句上和旧规则 1 完全一样**（没有一句两个规则结果不同）。凡是今天会进诚实空态、又带提问结构的句子，Library C 分数都已经过现网最低分（0.42），`semanticIsProduct` 为真，所以「再要求指向产品」没有多拦住任何一句。
- **反向风险漏的 23 句**就是两条规则都放回诚实空态的那些（含「怎么又这样……」「怎么才能不难过」）。另外 9 句两边都显示否决，是因为**今天的基线已经是观察翼**（`baseline` 为 skip），不是窄规则多拦住的。其中「怎么才能不想喝酒」Library C 没过线（0.414），但基线本来就是 skip。
- **英文仍差在目录 / 近邻先命中**，否决按设计管不到，本轮不调否决。6 句：I'm just sitting here for a bit. / I just want something sweet to escape for a bit / I can't sit still today and I want to quit / I want to order a pizza and forget about everything / Practice felt pointless today / I keep replaying a conversation from years ago（最后这句是 `family_en_r3` 新加的，12 句里只有它被目录接走）。归 `task-entries/confide-kb-catalog-near-misfire.md`。
- **中文仍漏 3 句**（与第二轮相同，只是分母少了已挪走的「怎么又这样……」）：「不想再被各种会员推销缠着」目录先命中；「看那些开通入口就烦」「观察翼」产品分高于情绪分。
- **只加否决时的 2 句误否决**仍是混合句「太累了，怎么关提醒？」「疲れた、リマインダーはどう消す？」。两条规则都把它们放回产品答复（Library C 过线，所以窄规则同样放行）。
- 对照组今天就走观察翼的仍是「坐着 能不能 聊」1 句。
- margin 扫描（0 / 0.02 / 0.05）：误否决 2 / 2 / 2，中文否决 40 / 39 / 37，英文 51 / 51 / 48。**调 margin 仍解决不了。**

窄规则用的是现网「过不过 0.42」这一刀，切不开「功能问」和「带怎么的情绪句」。第二段仍不点头。本轮没有改阈值，也没有接发送链。第三轮之后的决定见下节：不再跑 Library C 分数同类实验室。

### PO 决定（实验室第三轮后 · 2026-10-13）

第三轮数字出来后，PO 已逐条拍板。仍是 A 类范围：只改本 Brief 与任务登记，不改任何用户可见回复，不改发送链。2b 继续 shadow。

| # | 决定 |
|---|---|
| 1 | **第二段不点头。** 不再跑 Library C 分数同类实验室（含再试更窄的一刀、再扫 margin） |
| 2 | 混合句误否决 2 句（「太累了，怎么关提醒？」「疲れた、リマインダーはどう消す？」）**暂时接受**。影子日志继续观察。否决形态保持「只加否决、不加规则 1」（旧规则 1 与窄规则 1 都不进发送链）。第二段仍不上线 |
| 3 | 英文 89.5%（51/57）**不调否决**。差在目录 / 近邻先命中的句子归下一行的正式 Brief |
| 4 | 日文请母语者审。**审前不上线日语路径**。当前影子阶段暂时放过（日文结果仍只算暂定，不拦已经在记的影子日志） |
| 5 | **2b 继续 shadow** |
| 6 | 目录 / 近邻误命中情绪句升级为正式 Brief，含「徽章≠寅币」。方向：目录或近邻命中之后，再过一道「这句是不是情绪自述」的复核。本决定只锁 Brief，不实现。见 [`task-confide-kb-catalog-near-misfire.md`](./task-confide-kb-catalog-near-misfire.md) |

## 拍板（已由上文「PO 决定」定案；本表保留当时选项供追溯）

| 项 | 选项 | 我认为最合理的 |
|---|---|---|
| 新库还是复用 Library B | (a) 新建 MOOD_ASIDE 库；(b) 直接拿 B 的向量比分 | **(a)**。B 是 Stage 2 粗分流的情绪原型，往里加日文和生活自述会改变现网粗分流；新库只影响产品闸 |
| 2b 抬桶那条路是否一并接否决 | (a) 本 Brief 第二段一起接（2b 抬桶前先查 `moodOutranksProduct`）；(b) 另开单 | **(a)**。同一个信号、同一个根因；2b 现网是 shadow，接上不改今天的用户体验，等 2b 切 live 时已带着否决 |
| 日文门槛 | 80% / 与中英同为 90% | **80%**，理由见上表；第二段后再补日文原型拉齐 |

## 冲突扫描（对照 `SCENARIO_TESTS.md`）

- **场景 AE · KB 诚实空态**：真产品问未命中、产品抱怨仍诚实空态；验证集「误否决 0」锁住，强度不变。
- **CI-00/02 练习事实**：「我练了多久」类在验证集里要求不否决；且练习事实路由在产品闸之前，本刀不碰。
- **观察翼语气**：否决后走现有 generate + sanitize，与 #1188 三族同路，不新增人设句。
- **Stage 2 粗分流**：不改 Library A / B，不改 `applyConfideStage2Route`。
- **Stage 2b**：若选「一并接」，只会让 2b **少**抬桶，不会多抬；负例表要求本就是不抬。

**结论**：无未拍板冲突（上表三项是方案选择，不是冲突）。第三轮后第二段不点头，现网回复不变；实验室里那 2 句混合句误否决只留在影子观察，不改场景 AE。

## 明确不做

- 不改 Library C 阈值（`DEFAULT_CONFIDE_PRODUCT_KNOWLEDGE_MIN_SCORE`）和近邻中段（`decideKbNearMatch`）
- 不改诚实空态文案（Help Center 两刀已合 #1183 / #1185）
- 不改危机 / 攻击他人路由
- 不删 #1188 的字面豁免
- 不把 Stage 2b 切 live

## 回滚

第二段：去掉 `resolveProductKnowledgeGateAction` 里的 `moodOutranksProduct` 分支即回到 #1188 行为；第一段只多打日志，可直接留着。
