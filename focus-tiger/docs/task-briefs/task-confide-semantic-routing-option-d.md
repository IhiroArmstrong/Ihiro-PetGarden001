# Task Brief · Confide 语义向量前置分流（Option D · Stage 1 影子模式）

> **状态（2026-09-19）**：Stage 1 已开工——建设施 + 影子日志；**不切换**任何现网路由。  
> **前置诊断**：字面子串堆叠（`textMatchesAnyPhrase` 等）造成多起误判（例：「累积了多久」里的「累」→ `tired`；「忙啥」未命中「忙什么」正则）。  
> **权威实现**：`confideSemanticRouting.js` · `confideSemanticExamples.js` · `l1EmbeddingHold.js` · `l0EmbeddingProfiles.js`

---

## 做什么（Stage 1）

1. 新增 **Qwen3-Embedding-0.6B** 独立 embedding context（`node-llama-cpp` · `createEmbeddingContext` / `getEmbeddingFor`），**不复用** Gemma4-E4B 权重。
2. 离线 A/B 例句库 + 可调阈值打分逻辑（纯函数，可单测）。
3. **影子模式**：每条真实用户消息在现有路由给出回复后，**异步**跑语义粗分桶，把「字面管线粗桶」vs「语义粗桶」写入 `turns.jsonl`（`kind: semantic_shadow_classify`，**必含 `text` 字段**）。
4. 单测覆盖已知误判句 + embedding 层失败降级（Confide 主路径不受影响）。

## 明确不做（Stage 1）

- 不切换生产路由；用户收到的回复与上线前完全一致。
- 不碰 `safety_redirect` / `aggression_toward_others`（确定性拦截仍跑在语义层之前；这两条 **不跑** 影子语义）。
- 不迁移 `reflective_honesty` / 情绪桶子串 / `memory_list` 快捷规则到语义匹配（下一阶段独立议题）。
- 不接 EmbeddingGemma 或其他候选模型。
- 不做设备分级 / 并行双通道生成。

---

## 粗分桶定义（仅 shadow 对比用）

| 桶 id | 含义 | 典型来源 |
|---|---|---|
| `functional` | 功能性提问 / 练习操作 / 读账本 | `practice_facts` · `presence_facts` · `memory_list` · `reflective_honesty` · CI 工具类 paraphrase |
| `emotional` | 情绪倾诉 | `confideClassify` 情绪桶（`anxious` … `scattered`）+ corpus 情绪回复 |
| `gray` | 灰色模糊 / 闲聊 / fallback | `fallback` corpus · L3 generate · 其他模板层 |

**字面粗桶**由 `{ route, source }` 映射（`confideSemanticCoarseMap.js`），**不**改写 `confideClassify`。

**语义粗桶**由 embedding 相似度判定（`confideSemanticRouting.js`）。

---

## 离线示例库怎么建

### A 库 · 功能性 / 练习操作（目标 30–50 条）

覆盖 CI / 测试语料与已知误判正例，**每条 ≤ 80 字**（embedding context 安全余量）：

| 主题 | 例句（节选） |
|---|---|
| 练习时长 · **误判锚** | 「累积了多久」「练了多久」「我练习多长时间了」「how long have I been practicing」 |
| 忙什么 · **误判锚** | 「忙啥」「忙什么」「我最近在忙什么」「what have I been busy with」 |
| 记忆列表 | 「列出记忆」「帮我回忆一下」「list what you remember about me」 |
| 在场趋势 | 「最近状态怎么样」「presence trend lately」 |
| 练习事实 paraphrase | 「这周坐了多少次」「how many sessions this week」 |
| 动机 / 开始原因 | 「为什么开始做这件事」「why did I start practicing」 |

完整列表见 `confideSemanticExamples.js` → `CONFIDE_SEMANTIC_LIBRARY_A`。

### B 库 · 情绪倾诉（目标 30–50 条）

| 主题 | 例句（节选） |
|---|---|
| 疲惫 · 真情绪 | 「太累了」「撑不住了」「I'm exhausted」 |
| 焦虑 | 「好焦虑」「can't stop worrying」 |
| 难过 / 抑郁情绪 | 「很难过」「feel depressed today」 |
| 卡住 | 「完全没思路」「stuck and blocked」 |
| 散乱 | 「心乱静不下来」「mind won't settle」 |

**注意**：A 库故意含「累积了多久」等带「累」字的**功能句**；B 库含「太累了」等**真情绪句**，供 embedding 区分字面子串误判。

### 维护纪律

1. 新增 CI 误判样本 → 先补进 A 或 B，再调阈值；禁止只加 regex。
2. 每季度对照 `confideClassify.test.js` / `confideReadHybrid.test.js` / ISSUE_LEDGER 扇出补例。
3. 例句须与 `EMOTION_BIBLE` / 产品语气一致；禁止攻击性或安全触发的训练句进库（安全仍走 regex）。

---

## 相似度打分逻辑

1. **输入**：用户原文 `text`（trim；Qwen3 侧追加 `<|endoftext|>`）。
2. **向量化**：`getEmbeddingFor` → `userVector`（1024-dim，Qwen3-Embedding-0.6B）。
3. **库向量**：进程首次加载 embedding 模型时，对 A/B 全量例句各 embed 一次并 **内存缓存**（不写入 turns.jsonl）。
4. **得分**（默认 **top-k 均值**，k=3）：
   - `scoreA = mean(topK(cosine(userVector, each A_i)))`
   - `scoreB = mean(topK(cosine(userVector, each B_i)))`
5. **判定**：
   - 若 `|scoreA - scoreB| < grayMargin` → `gray`
   - 否则 `scoreA > scoreB` → `functional`；反之为 `emotional`

**质心方案（备选 · 未默认启用）**：可对 A/B 向量各求算术平均质心，用 `cosine(user, centroidA)` vs `cosine(user, centroidB)`；对 paraphrase 更钝、对离群例句更敏。Stage 1 以 top-k 为主，Stage 2 可 A/B 质心与 top-k 做 ensemble。

---

## 灰色阈值怎么定

| 参数 | 默认 | 环境变量 | 说明 |
|---|---|---|---|
| `grayMargin` | `0.08` | `FT_CONFIDE_SEMANTIC_GRAY_MARGIN` | \|scoreA − scoreB\| 低于此值判 `gray` |
| `topK` | `3` | `FT_CONFIDE_SEMANTIC_TOP_K` | 每库取 top-k 相似度均值 |

**标定流程（Stage 1 后 · 人工）**：

1. 跑 ≥50 条真实 Confide 句（含 ISSUE_LEDGER 误判集），读 `semantic_shadow_classify` 行。
2. 统计「字面粗桶 ≠ 语义粗桶」且语义更符合 PO 意图的比例。
3. 网格搜索 `grayMargin ∈ [0.04, 0.14]`，优先 **降功能句误判进 emotional**（A 库召回），其次控制 gray 率。
4. 阈值只通过 env / config 调整，**禁止**写死在业务分支。

---

## 影子日志 schema（`turns.jsonl`）

```json
{
  "at": "ISO-8601",
  "kind": "semantic_shadow_classify",
  "text": "用户原句（≤400 chars，必填）",
  "route": "confideClassify 输出的 route id",
  "source": "实际回复 source（practice_facts / corpus / …）",
  "literalCoarse": "functional | emotional | gray",
  "semanticCoarse": "functional | emotional | gray | null",
  "scoreA": 0.42,
  "scoreB": 0.31,
  "grayMargin": 0.08,
  "ok": true,
  "reason": "ok | skipped_safety | embed_unavailable | embed_failed | …",
  "timing": { "wallMs": 120, "embedMs": 95 }
}
```

---

## 降级

| 条件 | 行为 |
|---|---|
| 非 Electron / 无 `semanticShadowClassify` IPC | 不写日志或 `ok:false reason:unavailable` |
| embedding 模型未下载 / 加载失败 | `ok:false`；Confide 主路径不变 |
| `getEmbeddingFor` 抛错 | 捕获；`reason:embed_failed` |
| `safety_redirect` / `aggression_toward_others` | `reason:skipped_safety`；不加载 embedding |

---

## 冲突扫描

| 轴 | 判断 |
|---|---|
| **强度** | 影子层零用户可见变化 |
| **人设** | 不改变任何回复文案 |
| **职责** | 仅审计分流；≠ Read Hybrid；≠ 安全层 |

---

## 验收

- 单测：`confideSemanticRouting.test.js` · `confideSemanticCoarseMap.test.js` · `l0EmbeddingProfiles.test.js`
- 结构：`desktopCompanionL2Route.test.js` 锁 IPC + `_showReply` 影子接线
- 人工（Stage 2 前）：Electron 宽屏发「累积了多久」「忙啥」→ `turns.jsonl` 含 `semantic_shadow_classify` 且带 `text`
