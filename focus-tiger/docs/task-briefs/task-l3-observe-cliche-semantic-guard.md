# Task Brief · L3 观察翼陈词滥调 · 语义相似度护栏

> **状态（2026-09-20）**：**已锁待开工** — 本文件是 #823 下一刀规格。字面拒收只作止血，**禁止**再靠扩正则追模型改写。  
> **任务线**：Epic [#639](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/639) Confide · 切片 [#823](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/823)  
> **前置已合**：方案 B 打乱配对 · 问句 chat 翼 **#874** · 观察翼第一人称耳/尾/爪字面拒收 **#876**（本旁支再补中文「耳朵一抖 / 尾巴一甩 / 爪子搁地」）。  
> **复用**：Stage 1 已装的 **Qwen3-Embedding-0.6B** + `cosineSimilarity` / `scoreLibraryTopK`（`confideSemanticRouting.js`）。**禁止**再引入第二个 embedding 模型。  
> **口令**：`开工观察翼语义陈词滥调护栏`（本 Brief 入库 ≠ 已接线运行时）。

---

## 一、问题

观察翼坏输出是**可互换幼虎套势**，不是「该不该进 generate」。冻表 / `test:confide-acceptance` 锁的是路由门闩，**测不出**「生成出来像不像套话」。

字面拒收表挡得住已抓到的 `My ears twitch` / `尾巴一甩`，挡不住下一句 `耳朵微微一动` / `胡须颤了一下` / `爪子往后缩`。这和「用户输入靠子串分类」是同一类病：清单永远追不上改写空间。

**本刀药**：给一批已知坏例子算 embedding；新 generate 句若与坏例子向量过近 → 判陈词滥调 → 拒收后最多再生成一次，否则 corpus fallback。业界公开做法即「坏消息样例向量护栏」（同类产品化描述：Arize Dataset Embeddings Guard）。

---

## 二、边界（强制）

| 做 | 不做 |
|---|---|
| **只**观察翼 `companion.generate` 候选答句 | 不改问句 chat 翼（#874）；不把 §4.2 独白改去问答 |
| 复用现成 Qwen3-Embedding-0.6B | 不接 EmbeddingGemma / 不换 L3 生成 GGUF |
| 坏例子库 + 阈值 + 单测纯函数 | 不无限扩 `GENERIC_CUB_THEATER_PATTERNS`（止血表冻结，新漏洞进坏例子库） |
| embedding 不可用时 **fail-open**：仍走现有字面 sanitize | 不因 embedding 下载/加载挡住 Confide 发送 |
| 可选影子日志 `observe_cliche_shadow` | 不切换 Stage 2 用户句语义路由；≠ `semantic_shadow_classify` |

**共用机制核对**：本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层，核对跳过。

**后台网络**：若沿用已有 embedding 本机 GGUF（已下载则无新请求）。首次缺失时的下载须排在 Arrival / Honesty / Reflection 叠化与 Idle 呼吸开始之后，与现网 L0/L1 下载纪律相同；**禁止**为护栏单独新开后台拉模型通道。

---

## 三、切片（开工后按口令拆 PR）

### Slice 0 · 已在本旁支（止血，不是本 Brief 的运行时）

- 字面表保留 #876 英文族 + 中文「耳朵一抖 / 尾巴一甩 / 爪子搁地」。
- 此后**默认禁止**再往 `l2Sanitize.js` 加同族肢体正则；漏网句写入 Slice 1 坏例子库。

### Slice 1 · 纯函数护栏（可先合、不接线 generate）

1. 新模块（建议）`desktop/companion/l3ObserveClicheGuard.js`：
   - `L3_OBSERVE_CLICHE_BAD_EXAMPLES`：从 `L3_GENERIC_CUB_THEATER_FAILS` 起步，可再收田野改写（含分析师举例：耳朵微微一动 / 胡须颤了一下 / 爪子往后缩）。每条 ≤ 80 字。
   - `scoreObserveCliche(replyVector, libraryVectors, { topK, threshold })`：复用 `scoreLibraryTopK`；`score >= threshold` → 陈词滥调。
2. 单测用**固定假向量**锁阈值方向（近坏例 fail、贴本句主题的观察句 pass）。**不**在 smoke 里加载 GGUF。
3. 阈值默认建议与语义分流解耦：`FT_L3_OBSERVE_CLICHE_THRESHOLD`（标定前可先 `0.82` 量级，以实验室 leave-one-out 为准，禁止拍脑袋写死进业务 if/else 树）。

### Slice 2 · 观察翼接线（Electron · 现网 sanitize 之后）

1. 仅当 `buildCompanionL2Prompt` 走观察翼（`isCompanionChatGenerateLine === false`）且字面 sanitize **未**已拒收时，对候选答句 `getEmbeddingFor`。
2. 命中陈词滥调：丢弃 → **最多再 generate 一次** → 仍中则 corpus fallback（与现网拒收空话同一可见路径）。
3. 问句翼、corpus、安全/情绪桶：**不跑**本护栏。
4. embedding `unavailable` / `embed_failed`：跳过本层，只留字面表。
5. **禁止**把护栏耗时画进 Confide 状态条（对标 #876 前「embedding 不进 status strip」）。

### Slice 3 · 实验室标定（不进 smoke）

- 真 GGUF：坏例子 leave-one-out 应判中；`The cub cannot settle into sleep tonight.` 一类贴睡不着的观察句应判负。
- 脚本挂 `LAB_SCRIPT_CONVENTIONS.md`，接入方式同 Prompt 7：仓库 npm script + `/tmp/ft-l0-lab/`，**无** GitHub nightly。
- 过关仍须 Electron 打乱配对 ≥8/12（质量关单不改成「正则又加了几条」）。

---

## 四、冲突扫描（实现前）

对照 `SCENARIO_TESTS.md` 场景 AE（Electron L2 generate）。

| 轴 | 判断 |
|---|---|
| **强度** | 用户仍是发一句等一句；拒收后的 corpus 回落是既有路径，不比安全/攻击桶更重。 |
| **人设** | 继续观照、禁止套势填空；不把情绪自述改口成问答。 |
| **职责** | 护栏管**答句像不像幼虎套话**；语义分流管**用户句进哪一桶**。两套库、两次 embed 调用点不同，禁止合成一个分类器。 |

无冲突疑点。保护面：#874 问句翼答句、`companion_greeting`、aggression、reflective_honesty、memory_list。

---

## 五、验收

| 层 | 锁什么 |
|---|---|
| 单测 | 假向量打分；观察翼才调用护栏；chat 翼不调用；embed 失败 fail-open |
| 字面止血 | `l3ObserveShuffleGate.test.js` 已锁中英田野句（本旁支） |
| 实验室 | Slice 3 GGUF；不进 `test:smoke` |
| 人工 | Electron 三句独白不得再出可互换耳/尾/爪（含改写）；问句对照仍 chat 翼 |

**点击反馈**：不涉及新控件。发 Share 后 0–1 秒内仍是既有「正在听」；护栏失败不得空白。

---

## 六、已好清单 / 保护面

- 问句「谁是胖墩 / today / 胖粉」继续当对话答（#874）。
- 情绪自述仍观察翼，不改路由。
- 冻表 100 句路由门闩不因本刀重跑才能下结论。
- 字面表可作为第一道便宜闸；**新漏网只进坏例子库**。
