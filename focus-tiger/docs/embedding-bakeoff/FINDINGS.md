# Confide embedding 对照实验 · Phase 0 核对

日期：2026-11-18。只读。没有改生产路由，没有改评测集，没有跑封存盲测，没有下载模型。

## 结论

提示里的实验现在不能开。两处前提和仓库事实不一致。按提示第 6 条：桶的标签对不上时停下询问，不编造数据，也不在这套桶上比模型。

## 前提 1：基线不是「Qwen 1.6B 同时做向量和分类」

仓库里没有名为 Qwen 1.6B 的模型。现在是两条分开的模型：

| 职责 | 现在用的模型 | 代码 |
|---|---|---|
| 向量（倾诉语义粗分、语义危机层、事实卡近义） | Qwen3-Embedding-0.6B，Q8_0，约 639 MB，Apache 2.0 | [l0EmbeddingProfiles.js](../../desktop/companion/l0EmbeddingProfiles.js) |
| 生成回复（对不上固定句库时） | 默认 Gemma-4-E4B；旧的 Qwen3-1.7B 只是回退 | [l0ModelProfiles.js](../../desktop/companion/l0ModelProfiles.js) |

2026-09-19 已书面锁定专用向量模型，并且写明不接 EmbeddingGemma。见 [task-confide-semantic-routing-option-d.md](../task-briefs/task-confide-semantic-routing-option-d.md)。

提示候选里的 Qwen3-Embedding-0.6B **就是当前基线**，不是一个尚未试用的新模型。

## 前提 2：仓库里没有这六个桶

提示要评的桶：专注困扰、杂念、疲惫、好奇公案、闲聊、危险内容。全仓没有这组标签，也没有对应的训练 / 开发 / 新题集。

现有路由是另一套，见 [confideRoutes.js](../../src/core/confide/confideRoutes.js)：

- 情绪桶：`anxious`、`tired`、`stuck`、`sad`、`scattered`
- 安全层（不是情绪桶）：`safety_redirect`、`safety_care`、`aggression_toward_others`
- 其余：`fallback`、`language_not_yet_open`
- 生成回复的标记 `generate` 不是分类输出

语义向量粗分是三档，不是六档：`functional` / `emotional` / `gray`。危险内容走独立的语义危机层（余弦阈值默认 0.78），排在情绪分桶之前，不是六个桶里的一票。

非英文已有 `language_not_yet_open`，以及未覆盖语言的求助说明。提示里的「语言闸门」要先对照这条，不能另起一套。

## 「20%–45%」指的是哪件事

这个区间对得上的是**未见过的英文问法，能不能落到正确事实卡**，不是六桶分类准确率，也不是 1.6B 基座的原生向量。

已写入验收记录、且对应文件已作废、禁止再跑：

- 背景音乐事实卡：合入后一批 4/20（20%）；更早一批 6/20（30%）
- 「要不要打卡」事实卡：0/20（0%）
- 吃饭闲聊不得进诚实空态：20/20（100%）
- 另一组未见事实诊断：9/33（27.3%）；其后一小批 4/10（40%）

过关线写在同一批记录里：换说法要到 85%。没过。这些数字不能当成「换一个 embedding 就能把六桶从 20% 抬上去」的证据。

本回合没有打开仓外封存句，也没有重跑。那些文件有次数额度，重跑会把题烧掉。

## 因此没做的事

- 没有做训练 / 开发 / 新题集的泄漏检查：六个桶没有可检查的标注集。
- 没有测延迟、内存、体积。
- 没有把 jina、EmbeddingGemma、MiniLM、bge 接进脚本。
- 没有写 Phase 1 代码。

## 若以后仍要做对照，应先改的任务定义

1. 基线写成 Qwen3-Embedding-0.6B，不要写成 Qwen 1.6B。
2. 先指定要提升的是哪一条现有失败：事实卡未见英文问法，或语义危机的未见说法，或三档粗分。不要新造六个桶。
3. 开发集、新题集的文件位置和标签定义由产品给出。给不出就继续停。
4. 新题集仍只许每个最终方案跑一次；已作废的封存文件不得再跑。
5. EmbeddingGemma 的分发条款、jina 的商用条款，仍须在写进推荐之前核对。现有锁定是不接 EmbeddingGemma。

## 后续实验的基线（2026-11-19 锁定）

以后凡是对照或诊断，基线都写成：**现有 Qwen3-Embedding-0.6B（Q8_0）**。不把 Qwen 1.6B 写成基线。换模型不是当前第一步。

Phase 0b 的只读诊断见 [FINDINGS_2.md](./FINDINGS_2.md)。结尾标记只测量、不改生产，见 [FINDINGS_3.md](./FINDINGS_3.md)。危险层未见评测集的存放与 PO 采纳（无原句）见 [CRISIS_UNSEEN_SET.md](./CRISIS_UNSEEN_SET.md)。

## 待确认

见对话里的「待你决定」。确认之前不进入换模型对照。