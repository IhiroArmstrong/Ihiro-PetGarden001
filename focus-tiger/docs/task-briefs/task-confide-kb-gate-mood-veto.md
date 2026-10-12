# Task Brief · 知识库产品闸加「情绪 / 生活自述」否决（根因方案 · 中英日）

> **状态（2026-10-13）**：**第一段已点头**（PO 决定见下文「PO 决定（2026-10-13 · 第一段已点头）」）。第二段（切 live）**未点头**，等实验室数字出来另行点头。
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

### 待 PO 决定（第二段点头前）

1. 是否把「带功能问法就不否决」作为第二段规则的一部分（解决混合句，PO 决定 5）。
2. 「累积了 多久」这类练习事实句：现网不会进产品闸，要不要从对照组里移出，还是要求闸本身也挡住。
3. 英文差 1 句的根因是目录误命中，属另一刀（「目录 / 近邻误命中情绪句」），要不要单独立项。
4. 日文 16 句原型（`CONFIDE_SEMANTIC_LIBRARY_MOOD_ASIDE`）+ 6 句情绪验证句 + 4 句对照句（抱怨 2 / 混合 1 / 练习事实 1）待母语审；审后用 `FT_KB_MOOD_VETO_JA_REVIEWED=1` 重跑才算正式。

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

**结论**：无未拍板冲突（上表三项是方案选择，不是冲突）。

## 明确不做

- 不改 Library C 阈值（`DEFAULT_CONFIDE_PRODUCT_KNOWLEDGE_MIN_SCORE`）和近邻中段（`decideKbNearMatch`）
- 不改诚实空态文案（Help Center 两刀已合 #1183 / #1185）
- 不改危机 / 攻击他人路由
- 不删 #1188 的字面豁免
- 不把 Stage 2b 切 live

## 回滚

第二段：去掉 `resolveProductKnowledgeGateAction` 里的 `moodOutranksProduct` 分支即回到 #1188 行为；第一段只多打日志，可直接留着。
