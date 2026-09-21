# Confide 语义影子 · 上一轮上下文实验（Prompt 6）

> **状态（2026-09-21）**：影子对照日志接线已落地；**不改**用户看到的回复与 Stage 2 路由。live 分类在发送前用 `priorConfideTurnForLiveClassify` 取上一轮；**不**在 Thinking 等待里做第二路 embedding。影子若需要 with-prior 而 live 缓存没有，则禁止复用缓存、回复后补跑。  
> **不是**持久化会话摘要模块。Web / 窄屏 **无** 内存历史，本轮不覆盖。

## 覆盖缺口

| 路径 | `_l2Turns` | 本轮行为 |
|---|---|---|
| Electron 宽屏 Confide | 有（面板开着；关面板清空） | live：发送前看见上一完整轮，但仍只 embed 当前句做路由。影子：有上一轮时 **再 embed 一次**「上一轮 user+yin + 当前句」 |
| Web / 窄屏 | 无可用历史给影子 | 不跑桌面影子 IPC（与 Stage 1 相同） |

## 日志怎么读

同一行 `kind: semantic_shadow_classify`：

- `text` / `semanticCoarse` / `scoreA` / `scoreB` = **只看当前句**（原 Stage 1）
- `hadPriorTurn` / `contextualText` / `semanticCoarseWithPrior` / `scoreAWithPrior` / `scoreBWithPrior` = **看了上一轮**

第一轮或没有完整上一对 user+yin 时：`hadPriorTurn: false`，with-prior 字段为 `null`。

Stage 2 live 若只按「回复已写入后」的影子助手去取上一轮，发送当下历史只有两行，会被当成没有上文；若再按当前句复用 live 缓存，影子行会出现 `hadPriorTurn: true` 但 with-prior 分数全空。修复：live 用发送前助手；缓存复用须上下文一致且（需要时）已有 with-prior。

## 对照样本（机制，不是 Qwen 实测）

单测用合成向量锁住「输入变了、桶可以变」；**不能**代替本机 embedding 模型的真实打分。

| id | 上一轮用户句 | 本轮 | 只看当前句（合成） | 看了上一轮（合成） | 用意 |
|---|---|---|---|---|---|
| F1 | 今天什么都不想做，心里很闷 | 好累 | gray（A/B 同分） | emotional | 架构师「诉苦后说好累」 |
| F2 | 累积了多久 | 好累 | gray | functional | 轻量拼接也可能把功能句上下文带偏——对照污染 |
| F3 | （无） | 好累 | gray | 不跑第二路 | 第一轮无历史 |

## 本机真实对比（须 Electron + embedding 模型）

1. 宽屏 Confide 先发一句情绪独白，再发「好累」。
2. 打开 `userData/companion-l2/turns.jsonl` 最近一条 `semantic_shadow_classify`。
3. 看 `semanticCoarse` vs `semanticCoarseWithPrior` 是否不同、后者是否更像 `emotional`。
4. 再测「功能句 → 好累」，看 with-prior 会不会误拉去 `functional`。

**本轮不声称**真实模型已经救回「好累」。单测只证明对照日志和拼接逻辑成立。

## 不对称规则回放（2026-09-21）

分析师建议：只允许 gray→明确桶（help），不允许明确桶被拼回 gray（harm）。  
命令：`npm run audit:confide-prior-asymmetric`。Prompt：`task-confide-prior-asymmetric-replay.md`。

本机 `focus-tiger-desktop/.../turns.jsonl`（脚本摘要，未把整文件读进 Chat）：

| | naive 一律 with-prior | 不对称规则后 |
|---|---|---|
| eligible（有上一轮且两列都有值） | 24 | 24 |
| help（gray→emotional/functional） | 3 | 3 |
| harm（emotional/functional→gray） | 3 | **0** |
| other（桶对调等） | 0 | 0 |
| same | 18 | — |
| help÷(help+harm) | 0.50 | **1.00** |

**harm 三条（规则会丢掉 with-prior、保住当前句）**：`我有点不高兴`；`今天什么都不想做，心里很闷」`；接在闷后面的 `好累`（与合成 F1 相反）。  
**help 三条（规则会采用 with-prior）**：`I'm here, but my mind really isn't.`；`刚刚和甲方…心好累`；`好吧`。

**读法**：这条规则能滤掉今天看到的稀释；本批 **没有** emotional↔functional / F2 功能污染样本。样本仍少，**不**据此改 live。若要进真路由须另开 Stage 2b Brief。

## 已知风险（轻量实验）

把上一轮原文拼进当前句，可能让明确的功能短句被上一轮情绪（或反过来）带偏。这正是对照日志要回答的问题，不是本轮要修的生产路由。

## 观察备忘（待补样本 · 2026-09-20）

> 以下两条**只记录、不下结论**；等 Prompt 6 / Prompt 8 样本更多时再对照。

### Prompt 6 ·「拼上一轮会稀释判断」（观察项）

本机 2026-09-19 唯一 Prompt 8 分歧句「我有点不高兴」：

| 字段 | 值 |
|---|---|
| 字面粗桶 | `gray` |
| 语义粗桶（只看当前句） | `emotional` |
| 语义粗桶（带上一轮） | `gray` |

带上一轮后语义从 `emotional` 回到 `gray`，与字面一致——可能是上下文把本来较清楚的句稀释回模糊。**目前仅 1 条**，标为观察项；PO 倾向将该分歧标 `favorable_disagreement=yes`（字面偏保守、无语境语义更贴近句意），与 with-prior 是否「帮倒忙」是两条线。

### Prompt 8 · B 对照 · embedding 冷启动丢样本（2026-09-19）

16 条 `semantic_shadow_classify` 中 5 条（31%）因 **15s 硬超时** 丢弃（`reason:timeout`），**不是**逐会话首句各自超时，而是：

- **同一次宽屏 Confide 面板**内约 4 分钟连发 5 句；
- 整段窗口内 embedding（Qwen3-Embedding）**一直未就绪**；
- 每句 shadow 独立等满 ~15s 后失败；
- 与 Prompt 10「首句触发 embedding 下载/加载」为**同一冷启动根因**在不同链路上的体现，不是新的独立 bug。

**恢复信号**：最后一笔 timeout 约 **41 分钟后**，下一批 shadow 成功（`wallMs≈3.5s`）。

**Prompt 11（2026-09-20）**：shadow 改为等 embedding 就绪再分类；15s 超时**仅**限制就绪后的相似度计算，不把冷加载等待算进超时。详见 `l1SemanticShadowEmbeddingGate.js` / `l1Runtime.js`。
