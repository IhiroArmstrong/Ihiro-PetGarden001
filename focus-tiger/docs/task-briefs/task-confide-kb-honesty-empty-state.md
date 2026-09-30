# Task Brief · Confide 知识库未命中一律走诚实空态（K-1 + K-2）

> **状态（2026-09-30）**：PO 书面拍板，见第七节引用原话。**K-1 / K-2 属 B 类**（改变用户实际收到的回复）；K-4 属 A 类（只改影子日志内容），随同实现但不占本 Brief 的拍板面。
> **来源**：`adversarial-audit-2026-09-30.md` K-1 / K-2 / K-4 · Issue #1037（K-4）
> **交叉引用**：`task-confide-kb-embedding-near-match.md`（本 Brief 收敛它的自相矛盾）· `task-confide-kb-routing-gate.md`（方案 B）· `task-confide-kb-routing-matrix.md`（71% / 10% 门槛）· `product-knowledge-base.md`（检索不生成）

---

## 0. 大白话（给拍板用）

用户问了一个关于产品的问题，而知识库里没有答案时，阿寅应该说「我没有这方面的手册，去菜单看看」，而不是让本地模型现编一个听起来很像真的产品答案。

今天有两个口子会让它现编或者半编：

1. 语义闸已经判定「这是产品问题」了，但向量最近邻离得远，系统就改口说「那算了，不是产品问题」，放去自由生成。
2. 关键词只匹配上一个词（分数 1，声明的最低命中分是 2）且没有并列时，直接把那条短答当成命中返回。

这份 Brief 把两个口子都堵上：**判定为产品问题 + 没有够格的条目 = 诚实空态**，两种情况都不许滑回自由生成。

> **实现后更新（同日）**：第 2 条真跑下来发现审计判错了——分数 1 不是漏网，而是知识库 **27 条已锁锚点赖以命中**的正常情况。所以第 2 条**只改注释、不改行为**，详见 4.3 节。最终落地的用户可见变化**只有第 1 条**：产品问题查不到时不再现编，改说没有手册。原先预告的「`backup` 从短答变诚实空态」没有发生。

---

## 一、目标

让「检索不生成」这条产品底线在**两条路径上都成立**，而不只是在关键词命中那条路径上成立。

| 编号 | 位置 | 今天 | 改成 |
|---|---|---|---|
| K-1 | `confideProductKnowledgeSemantic.js` `resolveProductKnowledgeGateAction` | `embeddingState==='ready'` 时先看 `nearAction`，`'skip'` 直接返回 `'skip'`，`semanticIsProduct` 根本没被读到 | 先看 `semanticIsProduct`。语义闸说是产品问题 → 最差也只能到 `'honesty'`，不得返回 `'skip'` |
| K-2 | `confideProductKnowledge.js` `pickProductKnowledgeHit` | `top.score < MIN_SCORE` 分支里，分数 1 且无并列会掉出分支、被当成命中 | ~~分数低于 `MIN_SCORE` 一律 `null`~~ **实测后撤回，改为只修文档，见第 4.3 节** |

---

## 二、非目标

- **不改知识库短答正文**，不加、不删、不改条目。
- **不改阈值数字**：`hitMin` 0.80 / `farMax` 0.62 / `MIN_SCORE` 2 / `MIN_MARGIN` 1 全部保持原值。本 Brief 只改「信号打架时谁说了算」，不调参。
- 不改安全 / 边界 / 情绪三桶的分流。
- 不动 `isBackupContentQuestion` 那条显式例外（它是写明白的特例，不是漏网）。
- 不改危机改写句的分类范围（另一份 Brief）。
- 不碰 Stripe 价格、不碰 Reflection 启动。

---

## 三、K-1 的决定性证据：旧断言与近义匹配 Brief 的验收锚点直接对撞

审计初稿说 K-1 是疏漏，后来更正为「文档 vs 已提交测试冲突」。复核到最后，冲突其实是**单向**的：

`confideProductKnowledgeSemantic.test.js:53-62` 钉住的那条断言，用的输入是 **`'观察翼是什么'`**，期望 `'skip'`（= 去自由生成）。

而 `task-confide-kb-embedding-near-match.md` 第四节的验收锚点表里：

| # | 用户句 | 期望来源 | 期望条目 |
|---|---|---|---|
| A10 | What is the observation wing? | **诚实空态** | 无（库里没有这条） |

**同一句话**，Brief 的锁定验收写「诚实空态」，测试断言写「自由生成」。这条断言不是在保护某个未写进 Brief 的设计，它是在违反同一份 Brief 已锁的验收锚点。

至于 §三 表格第 3 行「都远 → 不当成产品问题，去现写」：那一行描述的是**两个信号一致**的情形（离所有条目都远，且不像产品问题）。它没有授权「语义闸说是产品问题、但向量说远」时由向量单方面推翻语义闸。§五 对这种情形写得很明确：「已经判定为产品 / 知识问题，近义之后仍没有够近的条目 → 诚实空态。**禁止**滑回自由生成。」

**结论**：改代码，删旧断言，并在 PR 里写明理由（本节）。

---

## 四、改完之后谁会变

### K-1 的影响面

只影响同时满足以下三条的输入：

1. `embeddingState === 'ready'`（嵌入模型已就绪）
2. `semanticIsProduct === true`（二分类器说这是产品问题）
3. `nearAction === 'skip'`（最近邻余弦 < `farMax` 0.62）

闲聊、半句话（锚点 A1–A4）不受影响，它们的 `semanticIsProduct` 是 `false`，仍旧 `'skip'` → 现写。
`'有点烦'` 那条经 `isConfideMoodAsideFromProductKnowledge` 在更前面就被拦掉，不受影响。
A10「观察翼是什么」从现写变成诚实空态——**这正是本次要的**。

### 4.2 与 `lifeOutranksProduct` 的交互（2026-09-30 合并 develop 时补）

本 Brief 实现期间，develop 合入了 `6a95fb92`「split the KB middle band so life chat can be written」：在中段（`nearAction === 'honesty'`）若日常生活语料的相似度压过产品库（`lifeChatOutranksProductLibrary`），就放去现写。

这和 K-1 是**同一个风险的两面**：K-1 收紧「像产品问题就不许现编」，而 `lifeOutranksProduct` 正是「看着像产品问题、其实是生活闲聊」的逃生口——恰好是 K-1 收紧后最容易误伤的那一类。

合并后的最终顺序（`resolveProductKnowledgeGateAction`，`embeddingState === 'ready'`）：

1. `nearAction === 'honesty'` → 生活闲聊压过产品库就现写，否则诚实空态（**develop 原样保留**）
2. `semanticIsProduct` → 生活闲聊压过产品库就现写，否则诚实空态（**K-1 在这里生效**）
3. 其余 → 现写

也就是说，逃生口在**所有段**一致生效，而不只在中段。与 develop 相比唯一的行为变化仍是 K-1 那一条：`semanticIsProduct=true` + `nearAction='skip'` + 非生活闲聊，由现写改为诚实空态。已加用例 `lets life chat out of the honesty line in every band` 逐段锁住逃生口。

### 4.3 K-2 的影响面 —— 实测后撤回运行时改动

**审计结论在这条上是错的，实现时被实测推翻，已按证据撤回。**

原计划是把 `MIN_SCORE = 2` 当成硬地板执行。真跑下来，`confideKbRoutingMatrix` 里 **27 条已锁锚点**当场从「命中知识库」掉成「诚实空态」：

```
kb-0001-how-zh / kb-0001-how-en / kb-0002-where-zh / kb-0002-where-en /
kb-0002-what-is / kb-0003-where-zh / kb-0004-what-hud / kb-0005-cancel /
kb-0008-what / kb-0011-diff-zh / kb-0011-diff-en / kb-0012-where-zh /
kb-0013-where-zh / kb-0014-where-zh / kb-0014-how / kb-0016-unload-zh /
kb-0017-desktop / kb-0018-coins-word-order-spaces / kb-0020-honesty-short-zh /
kb-0020-honesty-en / kb-0021-daily-quote-short-zh / kb-0023-wallpapers-zh /
kb-0023-wallpapers-en / kb-0025-emotional-reset-short-zh /
kb-0027-quiet-together-zh / kb-0028-focus-circle-zh / kb-0030-sanctuary-nav-en
```

也就是说：知识库**绝大多数正常问法本来就是靠分数 1 命中的**。`MIN_SCORE = 2` 从来不是命中地板，它是「有争议时才需要拉开差距」的那条线。真正的规则是：

- 分数 ≥ 2：直接命中（完全并列时走科普 / 功能逃生口）
- 分数 = 1 且**无人争**：命中——27 条锚点依赖这条
- 分数 = 1 且**有人争**（差距 < `MIN_MARGIN`）：逃生口或 `null`
- 分数 < 1：`null`

所以 K-2 不是逻辑 bug，是**常量的文档在说谎**（原注释写 "Minimum keyword score to treat as a hit (high bar)"）。修法相应改成：改正注释，并加一条用例把真实契约钉住，让下一个人不会再把它读成地板然后打穿知识库。**不动运行时行为。**

`backup` 这类裸产品名词仍会返回短答。要不要压掉它是**另一件事**，需要的判据不是分数（分数拦不住它，也拦不住那 27 条），而是「这句话像不像一个问句」。留作独立任务，不在本 Brief 内。

PO 原先同意的「`backup` 从短答变诚实空态」这一用户可见后果**因此没有发生**，本次没有任何知识库命中结果改变。

---

## 五、验收

1. 全量单测绿（改完后旧断言已替换为新断言，不得靠删测试凑绿）。
2. `npm run test:smoke` 绿，含 `audit:kb-live-entries` / `audit:kb-live-gap`。
3. 近义匹配 Brief 的锚点 A1–A11 方向不倒退：A1–A5 仍走现写 / 情绪，A6–A9 仍命中知识库，**A10 由现写改为诚实空态**（本次唯一有意的方向变化），A11 仍走现写 / 情绪。
4. 新增用例必须先红后绿，红的输出贴进 PR。

---

## 六、K-4（A 类 · 随同实现）

`buildKbRetrievalMissTurnLog` 的 docstring 声明「no user free text beyond query hash」，实现却把用户原话截 200 字写进 `turns.jsonl`。按 Issue #1037 已拍板的方案：**只留 query hash + 命中原因，去掉原文**。

哈希用仓库里已有的 FNV-1a 写法（`DailyWisdomStore.hashDateKey` 同款），不引新依赖、不引 `node:crypto`（这段代码要能在浏览器侧跑）。同时补上 `textLength`，保留「问句多长」这点诊断价值而不留内容。

---

## 七、已拍板（2026-09-30 · PO 原话）

```
K-1：按 Brief §五 改，诚实空态；改掉旧断言并在 PR 写理由
K-2：补 Brief，与 K-1 合成一份；拍板后贴回两条红用例
K-4：只留 query hash + 命中原因，去掉原文
危机改写句分类范围：先补 Brief，不改规则
```

K-2 的用户可见后果（`backup` 从短答变诚实空态）PO 已在同一条消息里书面确认知悉——但实测表明该改动会打穿知识库，已按 4.3 节撤回，**这个后果没有发生**。撤回属于「证据推翻计划」，不需要 PO 再拍一次板；若 PO 仍要压掉裸名词，按 4.3 节末尾另立任务。

---

## 八、冲突扫描（对照 `SCENARIO_TESTS.md`）

- **强度错位**：诚实空态的文案已存在且已审核（`Yin doesn't keep a manual for that.`），本次只改「什么时候用它」，不改语气强度。无冲突。
- **人设语气**：不新增文案。无冲突。
- **职责重叠**：安全 / 边界 / 情绪三桶都在产品闸**之前**分流，本次两处改动都在产品闸内部，不改分流顺序。`isConfideMoodAsideFromProductKnowledge` 仍在最前面。无冲突。

相邻场景比对：「练了多久」（CI-00，走个人事实，不进知识库）、「累了」（情绪固定回复）、「观察翼是什么」（本次从现写改为诚实空态，与 A10 一致）。无冲突疑点。
