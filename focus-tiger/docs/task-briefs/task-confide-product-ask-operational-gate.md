# Task Brief · 产品问收窄为「操作问法 ∧ 产品对象」

> **状态（2026-10-15）**：**PO 已点头**（「立刻安排，同意」本口径）。本文件只锁规格。**不改发送链。** 实现须另说「按这份 Brief 开工」。
> **类别**：B 类（会改变用户听到的英文回复来源）。
> **跟进号**：**CR-47**。危机修辞不在本条，见另行 Brief（CR-48）。
> **分支建议**：实现一刀 `fix/confide-product-ask-operational-gate`，单 PR。本规格 PR 用 `docs/confide-product-ask-operational-gate`。
> **来源**：2026-10-15 Electron 宽屏抽测（`sync:qa-develop` 后）。评测语言已锁在 `PRINCIPLES.md` R-0。账：`issue-entries/docs-confide-en-first-qa.md`。

## 背景

现网宽屏、向量就绪时：句子和「产品问例句库」足够像，就被当成产品问；目录没有近条，就禁止生成，只许诚实空态（“Yin doesn't keep a manual…”）。这是场景 AE / K-1 的原意：**真功能问不许现编步骤**。

错在把「像」当成「就是」。带 practice / meditation / focus 的动机、抗拒、躲开练习、陈述想练，被送进空态。中文「想喝酒」能躲开，是因为 `isConfideMoodAsideFromProductKnowledge` 里有中文词。英文没有这份词表。

按话题再开白名单（为何要练 / 不想练 / 想喝酒躲开）补不完。明天会换成背景音乐、打卡、换铃声。

## 拍板（2026-10-15 已同意）

只改判定，不改空态文案，不改危机层。

**一句话**：先问「这是在问产品怎么用吗？」不是，就生成。是，才查目录：有近条就短答，没有才诚实空态。

「是产品问」必须两条同时成立，缺一则不是：

1. **操作问法**（封闭集合，可以增形状，不可以增话题）：怎么 / 在哪 / 如何关 / 关不掉 / 找不到 / 坏了 / which button / how do I / how can I / where is / can I turn off / won't stop / doesn't work / missing。
2. **产品对象**：提醒、设置、菜单、抽屉、Help Center、接地练习这个入口、Sit 按钮、备份、导出、账号、订阅、栖居、会员、Quiet Line 等**产品里的东西**。

practice / meditation / focus / breathing 这些**活动词本身不是产品对象**，也不是触发器。

| 句子（已见，只作回归） | 操作问法 | 产品对象 | 判定 |
|---|---|---|---|
| How can I do some ground exercise | 有 | 有（Ground exercise 入口） | 短答 |
| 怎么关提醒 / how do I turn the reminder off | 有 | 有 | 短答或该条已有路径 |
| What is the observation wing / 观察翼是什么 | 有（在问这个功能是什么） | 有 | 目录没有 → **诚实空态**（不许现编） |
| Sit 按钮在哪 / the reminder won't stop | 有 | 有 | 短答或诚实空态，**不许生成步骤** |
| Why should I do some meditation? | 无（为什么 = 动机） | 无 | **生成** |
| I don't want to practice anymore | 无 | 无 | **生成** |
| I want to drink some beer… and I don't like to practice | 无 | 无 | **生成** |
| Today I'm quite happy. I want to do some focus practice | 无（陈述意愿） | 无 | **生成**（若已有「开始坐」口头动作命中，走那个动作；本 Brief 不新加动作） |
| How can I meditate?（没有点名产品入口） | 有 | 无 | **不许生成步骤**。有指针条目就短答；没有就诚实空态。这不是动机句 |

拿不准（向量觉得像产品问，但没有操作问法）→ **生成**，不进空态。两种错的代价不对称：真功能问被放去生成，最坏是答得泛，还有目录和「不许念步骤」兜着；闲聊被送进空态，用户直接感到没被听懂。

**明确不做**

- 禁止往 `isConfideMoodAsideFromProductKnowledge` 加中文或英文词。旧三族正则本刀不删、不扩。
- 禁止把「为何练 / 不想练 / 想喝酒」写成话题白名单。
- 禁止用两张话题关键词表实现本条。问法集合可以是封闭的；话题必须是开放的。
- 不改危机转介、不改 safety-01、不改竖线。那是 CR-48。
- 不改诚实空态句子本身。
- 不改 Stage 2b（仍 shadow）。2b 抬桶绕过本闸是另一条账，本刀不顺手修。
- 窄屏 / 网页仍不做向量与生成（CR-40）。

## 落地时怎么判（实现会话照此写，本 PR 不写代码）

改 `resolveProductKnowledgeGateAction`（`confideProductKnowledgeSemantic.js`）及其冷启动探针，而不是再加豁免函数。

1. 目录已经命中近条 → 仍短答（`hit`）。这条在操作问法判断之前。
2. 向量判「像产品问」**不够**进入空态。没有操作问法 → `skip`（生成）。
3. 有操作问法 **并且**（产品对象，或目录近邻已到命中线）→ 没有近条才 `honesty`。
4. 冷启动（向量没就绪）与上面同一套问法。收窄现有 `what is` / `是什么`：只有对象是产品实体才算操作问法。「What is the point of practice」「Why should I meditate」不得因为 `what is` 进空态。「What is the observation wing」仍算。
5. 故障句（won't stop / 关不掉 / missing / broken + 产品对象）算操作问法。
6. 「怎么做某种练习」但没有点名产品入口：不生成步骤；有指针走短答，否则空态。

K-1 保留，作用域改成：**确认是产品问且目录无近条**。场景 AE 里「产品问未命中禁止 generate」这句话，实现 PR 必须改成这个窄定义，并与代码同批。

## 冲突扫描（对照 `SCENARIO_TESTS.md`）

- **场景 AE · L2「产品问未命中禁止 generate」**：与「动机句走生成」曾是真冲突。PO 2026-10-15 拍板：空态只留给确认后的产品问。强度不变——真功能问仍不许现编。实现 PR 改剧本这一句，不另开场景字母。
- **#1188 中文三族**：仍 skip。本刀不靠加词维持它们。
- **CI 练习事实**：「我练了多久」有操作问法（查时长）+ 练习记录这个产品事实，仍走 `practice_facts`，不进生成闲聊。
- **观察翼语气**：`skip` 后走现有 generate + sanitize，不新写人设句。
- **危机层**：本刀不可达。先安全、再本闸。

**结论**：冲突已由 PO 拍板消解。无第二项待决。

## 共用机制核对

本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层，核对跳过。

## 点击

不新增控件。发送后 0–1 秒仍是现有等待指示；然后回复来源从 `product_knowledge_honesty` 变为 `generate`（或已有的开始动作）。设计上没有新的静默。

## 验收

英文是第一优先。中文句只作对照。

**关单口径（补在本 Brief，不单开任务）**：不得按「全部句子平均 ≥90%」把某一类整类送进空态稀释掉。按类别抽样，不按单句计分。下面每一类单独算。任一类抽到的句子进了诚实空态，该类不过；不得用其它类的高分平均成总通过率。已经见过的 2026-10-15 那几句只作回归，不作「已经泛化」的证据。

### 回归（可以写进仓库，因为已经公开）

修前会红、修后会绿：在 `embeddingState: 'ready'`、`semanticIsProduct: true`、`catalogHit: false` 时，下列句子 `resolveProductKnowledgeGateAction` 为 `skip`：

- I feel quite sleepy. I don't want to practice anymore.
- Why should I do some focus practicing? I don't like that.
- Why should I do some meditation?
- I want to drink some beer. I want to drink some alcohol and I don't like to practice.
- Today I'm quite happy. I want to do some focus practice.

护栏（不得变差）：

- How can I do some ground exercise → 短答，不是空态，也不是生成。
- What is the observation wing / 观察翼是什么 → 诚实空态。
- 怎么关提醒，以及一句英文 how do I turn the reminder off → 不得生成步骤。
- Sit 按钮在哪 → 不得生成步骤。
- the reminder won't stop → 不得生成步骤。
- How can I meditate? → 不得生成步骤。
- 我练了多久 → 仍是练习事实。

### 泛化（证明不是补丁）

另一次会话写 **至少 20 条**本 Brief 和实现会话都没见过的英文句，必须夹带 practice / meditation / focus。类别至少覆盖：动机、抗拒练习、借喝酒或其它事躲开练习、陈述想练、带这些词的情绪或闲聊。每一类至少 3 句。

这 20 条**不得**写进本 Brief、PR、单测或仓库。放进已有的封存盲测目录（gitignore，`PRINCIPLES.md` R-0）。实现会话只看按类别的通过/不通过，不看原句。全部不得进入诚实空态。产品问回归集不得变差。

命令（实现时）：`cd focus-tiger && node --test src/core/confide/confideProductKnowledgeSemantic.test.js src/core/confide/confideDesktopRoutingAnchors.test.js`，再 `npm run test:smoke`。盲测不在这条命令里。

## 人工（实现合入 develop 之后）

Electron 宽屏、向量就绪。英文先测。回归表里的英文句不得出现 “doesn't keep a manual”。接地练习仍是短答。观察翼是什么仍是空态。危机句本条不测（等 CR-48 之后再补竖线）。

## 回滚

恢复「向量判产品问且目录未命中 → honesty」。回归用例会变红，用来确认回滚生效。不要用加词的方式回滚。
