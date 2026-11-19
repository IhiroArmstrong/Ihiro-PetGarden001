# Phase 0b · 未见英文问法为什么低（只读）

日期：2026-11-19。基线 = 现有 Qwen3-Embedding-0.6B（Q8_0）。没有改路由、阈值、文案或模型。没有打开已作废的封存文件，没有下载新模型。

本报告不宣布根因已确认。

依据的模型卡：<https://huggingface.co/Qwen/Qwen3-Embedding-0.6B> （README，Apache 2.0）。下面「官方」都指这份 README 的 Usage 一节：查询侧加 `Instruct: {task}\nQuery:{text}`，文档侧不加；`last_token_pool`；`F.normalize` 之后做点积（余弦）；批处理建议 `padding_side='left'`；示例 `max_length=8192`。README 写：查询侧不用指令，检索大多会掉大约 1%–5%。

## 1. 任务 A · 向量管线核对

| 项 | 结论 | 证据 |
|---|---|---|
| 查询侧任务指令 | **不符合** | 官方要求查询加 Instruct、文档不加。生产 `embedText` 对用户句和卡片都只走 `formatQwen3EmbeddingInput`，不加 Instruct。`formatQwen3EmbeddingQuery` 已写好，发送链没调用。见 `l1EmbeddingHold.js:102-104`、`l1EmbeddingHold.js:166-169`、`l1EmbeddingHold.js:222`；查询函数在 `confideSemanticRouting.js:149-165`。 |
| 文档侧不加指令 | **符合** | 卡片短语同样走 `formatQwen3EmbeddingInput`，没有 Instruct。`l1EmbeddingHold.js:166-169`。 |
| 两侧是否按官方分开处理 | **不符合** | 两侧一致地都没用指令。这和官方「只给查询加」不是同一种一致。 |
| EOS | **不符合** | 生产把字符串 `<\|endoftext\|>` 接到正文后面（`confideSemanticRouting.js:142-146`）。`node-llama-cpp` 的 `tokenizeInput` 用 `specialTokens=false`（`desktop/node_modules/node-llama-cpp/dist/utils/tokenizeInput.js:5`）。本机对探针句实测：该字符串被切成普通词，尾部 token 是 `427,91,29`，不是 EOS `151643`。同一次加载 `shouldAppendEosToken=true`，库会再追加真正的 EOS `151643`（`LlamaEmbeddingContext.js:39-42`）。送进模型的是「正文 + 字面 `<\|endoftext\|>` + 真 EOS」。 |
| 池化 | **无法确定是否等于官方 last token** | 官方示例是 `last_token_pool`。本库在求值后调用 `getEmbedding(resolvedInput.length)`（`LlamaEmbeddingContext.js:44-49`）。下标是否正好是最后一枚真 EOS，绑定层没有写明。未改代码去对照。 |
| L2 与余弦 | **相似度符合** | 打分用 `cosineSimilarity`：点积除以两侧范数（`confideSemanticRouting.js:21-36`）。这和「先 L2 再点积」等价。向量在取出时有没有已经归一化，未验证。 |
| 最大长度 | **短句符合；截断策略不同** | 上下文写死 512（`l0EmbeddingConfig.js:26-27`）。官方上下文 32k，示例截到 8192。本库超长是直接抛错（`LlamaEmbeddingContext.js:26-28`），不是截断。事实卡短语远短于 512。 |
| 批填充方向 | **不适用** | 生产一次只嵌一条，没有把多句垫进同一批。官方左填充是批处理建议。 |
| 卡片向量怎么造 | **符合代码，覆盖面窄** | 有 `factKeyEn` 时只用这一句，能力说明和短答不进向量（`kbNearMatch.js:82-84`）。关键词不进向量（同文件 `69-72` 的注释，以及 `82-84` 的早退）。0037 的表面形式是一句问法（`productKnowledgeCatalog.json:775-776`）。0038 同样只有一句（`productKnowledgeCatalog.json:793-794`）。本机加载：41 张可检索卡，41 条短语，每卡一条。 |
| Q8 相对更高精度 | **未验证** | 本机只有 `Qwen3-Embedding-0.6B-Q8_0.gguf`（约 610 MB）。没有 fp16 / F16 文件。若要对比，需要另下一份更高精度权重，大约 1.2 GB。未下载。 |

加载时 `node-llama-cpp` 打印：控制样式 token `128247 </s>` 不是 control 类型，库把它改判了。这是库对这份 GGUF 的警告，本回合没有把它当成已经证实的分数错误。

## 2. 任务 B · 失败排名

### 2.1 未见封存题：没有逐条排名

20%–45% 来自已作废、禁止再打开的封存文件。仓库里没有这些题的逐条名次。2026-10-18 的任务片只留了一句旧结论：换说法时正确卡经常已经排第一，但分数卡在 0.80；给查询加 Instruct 后，0.80 更差（`docs/task-entries/confide-g2-fact-rank-margin-diag.md:10`）。那次 JSON 在仓外，本回合未读。所以下面的四分类**不是**那批未见题。

### 2.2 本回合实际跑的：仓库里的可见开发集

文件：`src/core/confide/fixtures/g2-fact-rank-visible-devset.json`（`set_id` `g2-fact-rank-visible-dev-2026-10-17`）。10 条，其中 8 条应落到事实卡，2 条不应落卡。用本机已有的 Q8 文件、与生产相同的 `formatQwen3EmbeddingInput` + `createEmbeddingContext(512)` + `cosineSimilarity`。没有读作废文件。

当前生效阈值：`DEFAULT_KB_NEAR_HIT_MIN = 0.8`（`kbNearMatch.js:22`）。0.62 是远距带，不是这条命中线（`kbNearMatch.js:25`）。

8 条应落卡，按生产路径（不加 Instruct）：

| 类别 | 条数 | 代表（不足 5 条就全列） |
|---|---|---|
| (i) 正确卡第 1，分数低于 0.80 | 2 | `vis-0003-a` → KB-EDU-0003，0.7684，第二名 KB-FUNC-0012 为 0.7466。`vis-0037-b` → KB-FUNC-0037，0.7922，第二名 KB-FUNC-0005 为 0.5674。 |
| (ii) 正确卡在前 3，但不是第 1 | 1 | `vis-0011-a` → KB-FUNC-0011 排第 2，0.6454；第 1 是 KB-FUNC-0001，0.7346。 |
| (iii) 正确卡不在前 10 | 0 | 无 |
| 正确卡第 1 且 ≥ 0.80 | 5 | `vis-0038-a` 0.9352；`vis-0038-b` 0.8084；`vis-0003-b` 0.8213；`vis-0037-a` 0.9269；`vis-0020-a` 0.9332。 |
| (iv) 标签歧义或没有这张卡 | 0 | 这 8 条的期望卡都在目录里。 |

2 条不应落卡：`vis-chat-a` 最高 0.4488；`vis-chat-b` 最高 0.6681（KB-FUNC-0005）。在 0.80 都不会命中。

0.80 下，8 条应落卡命中 5 条。这是贴近现有 fact key 的可见改写，**不能**拿来解释封存未见题的 0/20 或 4/20。

同一 10 条若查询侧改用官方 Instruct、卡片仍不加：0.80 命中从 5/8 降到 3/8。名次几乎不变，分数变低。例如 `vis-0038-b` 从 0.8084 降到 0.7002。这和旧任务片「现网不要加 Instruct」方向一致，但是在可见集上新测的，不是未见集。

### 2.3 阈值扫描（只报告，不改配置）

「命中」= 正确卡排第 1 且分数 ≥ 阈值。无卡误命中 = 不应落卡的句子最高分 ≥ 阈值。生产路径：

| 阈值 | 应落卡命中 | 无卡误命中 |
|---|---|---|
| 0.62 | 7/8 | 1/2 |
| 0.68 | 7/8 | 0/2 |
| 0.76 | 7/8 | 0/2 |
| 0.78 | 6/8 | 0/2 |
| 0.80（现网） | 5/8 | 0/2 |
| 0.90 | 3/8 | 0/2 |

掉在 0.76 和 0.80 之间的，就是上面两条 (i)。`vis-0011-a` 不是第 1，把阈值降到 0.64 也接不住。无卡只有 2 条，不能用来证明降低阈值是安全的。

## 3. 任务 C · 语义危机层现状

锚点：15 条，英文 8、中文 7，没有日文。文件 `confideSemanticCrisisExamples.js:13-28`。加载时每条单独嵌一次（`l1EmbeddingHold.js:196-200`），用的也是不加 Instruct 的那条路径。

阈值：默认余弦 0.78（`confideSemanticCrisisLayer.js:36-41`）。代码写明来自实现 PR 的失败分布，可用环境变量改，禁止为了刷通过率下调。Brief 原先不把数字写死，实现时锁成 0.78（`docs/task-briefs/task-confide-semantic-crisis-layer.md:101-103`）。日文含假名则这层不做（`confideSemanticCrisisLayer.js:47-48`）。命中之后还有修辞确认，确认不靠把 0.78 降下来。

评测：

- 关单用的「未见说法」在仓外封存，每份文件只许跑一次。本回合未打开。**没有可以引用的、未见说法上的召回或误报数字。**
- 仓库里有一份 15 条桌面闸门表，原句不在文件里：`docs/audit/findings/2026-11-07/evidence/r2-pre-remediation-crisis-desktop.md`。那是整改前的固定探针，不是未见改写集，也不能当成召回分母。表上字面未接住、向量把结果升成安全的有 C03、C05、C06、C14、C15。字面未接住且没有升成安全的有 C04、C07、C10、C11、C13。C07 标的是修辞夸张，没有升级。C13 是日语未开放。这些是分桶（`ge_70` 表示 ≥0.70 且 <0.80，见 `confideSemanticCrisisLayer.js:80-86`），不是逐条余弦。

建议以后由人来写的评测集字段（本回合没有编句子，也没有编标签）：

- `id`
- `lang`（en / de / fr / es / other）
- `label`：明确自伤、修辞或夸张、疲惫或生活压力、非英文
- `expected_route`：`safety_redirect` 或保持原路由
- `seen_in_prototype_bank`：是否与现有 15 条锚点同句
- 不要把原句放进仓库

## 4. 现象 → 最可能原因 → 建议下一步

| 现象 | 最可能原因（未确认） | 建议下一步（不执行） |
|---|---|---|
| 查询和文档都没加官方 Instruct；本机可见集上加上后，0.80 命中 5/8 → 3/8 | 在「卡片本身就是一句问法」时，官方检索指令把查询推离了卡片。也可能被下面的 EOS 噪声放大。 | 先不要按模型卡改生产。要试也只在可见集上试，不改 0.80。 |
| 字符串 `<\|endoftext\|>` 被当成普通词，库再追加真 EOS | 最后一层看到的上文和官方「以 EOS 收尾」不一致。对分数的影响本回合没做对照。 | 下一小步只做这个对照：同一可见集，去掉字面 EOS，只留库追加的真 EOS。仍不改生产。 |
| 可见集里 2 条正确卡第 1 但低于 0.80 | 阈值偏严，在这 2 条上成立。无卡样本只有 2 条。 | 不改阈值。旧诊断说过，单靠放宽或余量会把无卡句接成卡；那份证据在作废集上，本回合未复核。 |
| 可见集 1 条正确卡排第 2（0011 vs 0001） | 更像两张卡的说法太近，不是阈值。 | 先看这两张卡的 fact key 是否抢同一类问法。不换模型。 |
| 封存未见题 20%–45%，逐条名次不在仓库 | 可能是卡片只有一句 fact key，离得远的说法进不了前几名。本回合无法分成 (i)(ii)(iii)。 | 先补一份**新的、未封存、允许重复跑**的诊断集。不要打开作废文件。换模型仍排在这之后。 |
| 危险层没有未见说法的召回数字 | 评测集不在仓库。 | 由产品和有临床经验的人写标注集。不要让实现会话生成危险句。 |

更高精度权重：未测。需要下载约 1.2 GB 时再请批准。

## 未验证

- 去掉字面 EOS 之后，可见集分数变不变。
- `getEmbedding(tokenCount)` 是不是官方的 last-token 向量。
- Q8 相对 fp16 的分差。
- 作废未见题上，正确卡的名次分布。旧任务片的一句话没有在本回合重跑。
