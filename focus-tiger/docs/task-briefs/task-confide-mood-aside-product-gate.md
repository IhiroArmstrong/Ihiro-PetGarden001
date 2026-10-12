# Task Brief · 情绪句不得误入产品闸（诚实空态）

> **状态（2026-10-13）**：**PO 已点头**（「立刻按这份 Brief 开工」）· 实现在 `fix/confide-mood-aside-product-gate`。
> **实现补注**：加宽的提问例外（记录 / 多久 / 吗 / ？）只作用于新三族；原「有点烦 / 会不会好一点」判定不变，「会不会好一点？」仍豁免。
> **类别**：B 类（改变用户可见回复来源）。
> **分支建议**：实现一刀 `fix/confide-mood-aside-product-gate`，单 PR。
> **来源**：`ISSUE_LEDGER.md`「根因扇出 · Confide 把生活/情绪句判成产品问」（2026-10-13 Electron 宽屏 · `turns.jsonl`）。

## 背景

2026-10-13 Electron 灰度，三句情绪/生活自述被阿寅答成「Yin doesn't keep a manual…」诚实空态，像功能问答失败：

| 原句 | 当晚日志 | 根因 |
|---|---|---|
| 最近老是想起以前 | 粗桶 `functional` · `kb_retrieval_miss` · 回复 `product_knowledge_honesty`；2b `wouldPromote=false`（already_handled） | 知识库语义闸，不是 2b 抬桶 |
| 我今天练习的太久啦。 | 粗桶 `functional` + 诚实空态 | 「练习」把句子拉近 Library C |
| 我不想练习，想喝酒。 | 粗桶 `gray` 仍诚实空态 | 同上，Library C 分数过线 |

终端复现（2026-10-13，`origin/develop` `adb841fd`）：三句 catalog 都 `no_keyword_match`，冷启动探针都不命中；只有在 **embedding 就绪 + 语义判「像产品问」** 时，`resolveProductKnowledgeGateAction` 返回 `honesty`。冷启动、字面路由都正常放行到 generate。

现有豁免 `isConfideMoodAsideFromProductKnowledge` 只认「有点烦 / 会不会好一点」，三句都不在内。

## 拍板（待你点头）

| 项 | 口径 |
|---|---|
| 改哪里 | 只扩 `isConfideMoodAsideFromProductKnowledge`（`confideProductKnowledgeSemantic.js`）。它在闸里排在 catalog 命中之后、语义判定之前：命中短答照常答，豁免只拦「没命中 → 诚实空态」这一步 |
| 加哪几族 | **回忆**：想起以前 / 想起过去 / 怀念以前 / 以前的事；**想喝酒/逃避**：想喝酒 / 喝一杯 / 不想练（习）；**练太久/疲惫**：练（习）(的/得)太久 / 太累 / 好累 / 累了。保留原「有点烦 / 会不会好一点」 |
| 提问形状仍算产品问 | 句中有 怎么 / 如何 / 在哪 / 哪里 / 提醒 / 记录 / 多久 / 吗 / ？/ ? 时**不豁免**（沿用现有 `怎么|如何|在哪|哪里|提醒` 例外再补 `记录|多久|吗|？|\?`）。所以「想起以前那些事，练习记录在哪里」「我练了多久」仍走原路 |
| 豁免后去哪 | 闸返回 `skip` → 原样进 generate 观察翼（与「有点烦」同路），**不新增**回复文案 |
| 明确不做 | 不改 Library C / 分数阈值；不改 2b（默认仍 shadow，`stage2bLivePromote` 分支另议）；不加英文/日文同义句（本刀只锁当晚三句的中文族）；不改危机 / 攻击他人路由；不改诚实空态文案 |

**我认为最合理的**：按上表「列族 + 提问形状例外」做。备选「凡是陈述句一律不进诚实空态」更省事，但会把「Sit 按钮不见了」「备份失败了」这类产品抱怨放回自由生成，等于撤掉 K-1（不许现编功能说明），不推荐。

## 冲突扫描（对照 `SCENARIO_TESTS.md`）

- **场景 AE · KB 诚实空态**：只把三族情绪自述挡在空态外；真产品问未命中（「观察翼是什么」）、冷启动产品问（「Sit 按钮在哪」）仍诚实空态。强度不变。
- **CI-00/02 练习事实**：「我练了多久」「累积了多久」有「多久」→ 不豁免，仍 `practice_facts`。「练太久」是感受，不是查时长，走观察翼。
- **观察翼语气**：豁免后走现有 generate + sanitize，与「有点烦」同一条路，不新增人设句。
- **Stage 2b**：负例「最近老是想起以前」本就要求留观察翼，本刀与之一致；不碰 2b 抬桶逻辑。

**结论**：无未拍板冲突。

## 回归集（今晚三句进集）

修前会红、修后会绿的那一条是 (1)：

1. `confideDesktopRoutingAnchors.test.js` 新增一组：三句在 `embeddingState: 'ready'`、`semanticIsProduct: true`、`catalogHit: false` 下 `resolveProductKnowledgeGateAction` 须为 `skip`；`nearAction: 'honesty'` 变体同样 `skip`。**修前三句都返回 `honesty`，所以会红。**
2. 同文件正向护栏：「观察翼是什么」仍 `honesty`；「想起以前那些事，练习记录在哪里」不豁免；「我练了多久」不豁免。
3. `confideKbRoutingMatrix.js` 加三行 `must-miss` · `generate`（确定性路由锁，修前也是绿，只防以后字面路由回退）。
4. `confideProductKnowledgeSemantic.test.js` 给 `isConfideMoodAsideFromProductKnowledge` 补三句 true + 提问形状 false。

命令：`cd focus-tiger && node --test src/core/confide/confideDesktopRoutingAnchors.test.js src/core/confide/confideProductKnowledgeSemantic.test.js src/core/confide/confideKbRoutingMatrix.test.js`，再跑 `npm run test:smoke`。

## 人工验收（实现合入后 · Electron 宽屏 · embedding 就绪）

1. 发「最近老是想起以前」「我今天练习的太久啦。」「我不想练习，想喝酒。」→ 都不得出现 “doesn't keep a manual”，`data-source` 为 `generate`（或 sanitize 拒收后的 corpus fallback）。
2. 对照：「观察翼是什么」仍诚实空态；「怎么开始坐」仍知识库短答；「我练了多久」仍练习事实。

**本条验收的是**三句情绪自述离开诚实空态；**不代表**观察翼回复质量已过关（那仍归观察翼计分）。

## 回滚

把 `isConfideMoodAsideFromProductKnowledge` 正则还原为「有点烦 / 会不会好一点」两族；回归用例 (1) 会随之变红，提示回滚生效。
