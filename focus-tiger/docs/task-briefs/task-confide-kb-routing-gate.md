# Task Brief · Confide 知识库路由闸门（语义识别 + 未命中诚实空态）

> **状态（2026-09-22）**：**PO 已点头**（方案 B + 未命中空态 + 同刀上线 + 授权改场景 AE；**第 4 条改锁**：冷启动未就绪 **不得** fail-open 到 generate）。  
> **仍禁止在本 Chat / 未见开工口令时写运行时。** Brief 已锁 ≠ 已接线。实现须 **新开 Chat**，口令「按知识库路由闸门 Brief 开工」。  
> **任务类**：B 类。`WORKFLOW.md`「用户可见改动：Brief 开工门禁」。  
> **交叉引用**：`task-confide-kb-retrieval-wiring.md`（Q1/Q2/Q4/Q5 仍有效；**本文件覆盖该 Brief 的 Q3**）· `product-knowledge-base.md` · `task-confide-semantic-routing-option-d.md` · `task-confide-stage2-semantic-cutover.md` · `SCENARIO_TESTS.md` 场景 AE

---

## 0. 大白话（给拍板用）

用户在倾诉里问「按钮在哪 / 这个功能怎么进」时，应先查已经审核过的本地短答。查到就按原话念；查不到就诚实说不确定、建议去菜单里找——**不要**让陪伴生成再编一套说明书。  
判断「这句像不像在问产品」必须用现有语义能力，不能再堆关键词。  
本 Brief 已把这三件事写死。用户现在收到的回复要等开工实现后才变。

---

## 一、目标

在 **同一刀检索接线**上补齐路由顺序，而不是另开一条产品线：

1. **闸门**：用 embedding 语义判断「像在问产品 / 知识」，复用已装的 **Qwen3-Embedding-0.6B**；禁止为本闸新建字面关键词/正则列表作正式分类器。  
2. **命中**：只出已通过短答（原样 / 已拍板的模板壳），与检索接线 Q1 一致。  
3. **未命中（硬闸）**：产品类提问一旦进了本闸且库里没有合格条目 → **禁止**滑回观察翼 / 闲聊生成 / Read Hybrid 自由答。必须走诚实空态（同类设计：`reflective_honesty`）。未命中日志是回流手段，**不是**对用户的处理完毕。

### 路由顺序（骨架已认可，本 Brief 钉职责）

| 顺序 | 层 | 典型句 | 本闸 |
|---|---|---|---|
| 1 | 安全 / 危机 / 他人攻击 | `I don't want to live` / `我想打人` | **不可达**。正则仍在语义之前。 |
| 2 | 边界 / 只陪着 / 口头忘记 | `I'd rather not get into that.` / `Can you just sit next to me` / `Don't keep this one.` | **不可达**。 |
| 3 | 已有个人事实 | `我练了多久` / 情绪标签趋势 / `列出记忆` | **不可达**。走 `practice_facts` / `presence_facts` / `memory_list` / 诚实账本，**不是**说明书。 |
| 4 | 产品 / 知识提问 | `Sit 按钮在哪` / `这个按钮是干嘛的` / `怎么开始坐` | **本闸**：语义判定为产品问 → 只查已通过短答。 |
| 5 | 其余倾诉 / 闲聊 | `太累了` / `有点烦` / `谁是胖墩？` | **不进本闸**。现有语义分流 + corpus / 观察翼 / chat 翼照旧。 |

---

## 二、非目标

- 不把急救型、未审核、`yin_may_retrieve: 否`、内部排障、云备份禁用条目变成可检索（Q4 闸门不变）。  
- 不把「练了多久」改去知识库。  
- 不在本闸用生成转述短答（Q1 禁止 paraphrase）。  
- 不把 Stage 2 三桶（functional / emotional / gray）整包重训成四桶而不经拍板（见第三节）。  
- 不在 embedding 冷启动时让用户干等；**也不**把 Stage 2「未就绪 fail-open 到字面/生成」套用到本闸——编错操作步骤的伤害不可接受。  
- 本文件已锁 ≠ 实现开工。

---

## 三、问题 1 · 「像在问产品/知识」怎么判断？

现网旁支 `feature/confide-kb-retrieval-wiring`（相对 `origin/develop` **ahead 1**，**尚未**当作 develop 事实）里，闸门是 `PRODUCT_KNOWLEDGE_QUESTION_RES`（how/where/怎么/在哪…）+ 关键词打分。这正是分析师要堵的地雷：换说法（「这个按钮是干嘛的」vs「怎么开始坐」）会漏判或误判。

**正式分类器必须是语义。** 字面表只允许作为实验室夹具 / 防呆注释，不得再当 live 闸门。

### 方案 A · 在现有三桶上加第四桶 `product_knowledge`

把产品问句做成 Library C，与 A（functional）/ B（emotional）一起算质心或 top-k，四选一。

| 优点 | 缺点 |
|---|---|
| 与现有 `confideSemanticRouting` 同一套打分 | A 库已含练习账本、记忆列表、诚实开放问——和「Sit 在哪」不是一类意图，四桶会抢分 |
| 少一次独立调用 | 会扰动 Stage 2 已锁的 functional∩情绪桶安全网，阈值要重校 |
| | gray 闲聊问句（「今天做什么」）可能被吸进产品桶 |

### 方案 B · 独立二分类器（是 / 不是产品问题）

安全 / 边界 / 个人事实 **已经排除之后**，再用同一 embedding 把当前句对 **Library C（产品/说明书问法）** 打分；过阈值才检索。不过阈值 → 当作「不是产品问」，走现有层 5。

| 优点 | 缺点 |
|---|---|
| 不改 Stage 2 三桶阈值 | 多一次（可与已算向量复用，实现时禁止对同一句重复 embed） |
| 职责清：C 库只收「怎么用这个 App」，不收「我练了多久」 | 要单独维护 C 库例句与阈值 |
| 漏判可补例句，不必动 A/B | 未就绪窗口走空态，不另开分类器 |

**PO 已选方案 B（独立二分类，复用同一 embedding，不改三桶）。**  
原因：产品问 ≠ 现有 `functional`（functional 主要是个人账本 / 工具类）。绑成第四桶会重开「练多久 vs Sit 在哪」职责打架，并迫使 Stage 2 重校。弱方案是方案 A；更弱的是继续用现网正则当 live 闸——**（不合理）**，会把已证伪的字面病种到新层。

C 库起点（实现时写入 `confideSemanticExamples` 一类数据文件，本 Brief 不定死全文）：

- 正例：怎么开始坐、Sit 在哪、接地练习入口、Breath 和 Sit 区别、倾诉怎么关、备份在哪、这个按钮是干嘛的、How do I start a sitting、Where is Ground exercise  
- 负例（须判否，交给层 3 或层 5）：练了多久、列出记忆、太累了、有点烦、谁是胖墩、天气怎么样、不想活  

阈值：可调参数，先给保守默认（宁可不进闸、让真情绪句走陪伴，也不要把独白判成产品问）。校准用影子分可另开 A 类任务，**不**阻塞本 Brief 拍板。

---

## 四、问题 2 · 查知识库未命中之后怎么回？

**覆盖** `task-confide-kb-retrieval-wiring.md` **Q3** 里「未命中走现有 Confide 策略（含 L3 generate）」——**仅当本闸已判定为产品/知识提问时**。

| 本闸判定 | 检索结果 | 用户应收到 |
|---|---|---|
| 否（情绪 / 闲聊 / 个人事实已分流） | 不检索 | **不变**：corpus / generate / 事实工具照旧 |
| 是 | 命中已通过短答 | 原样 / 模板壳；`data-source=product_knowledge`；不 L3 转述 |
| 是 | 半命中（问步骤，库里只有入口） | 只指路短答；禁止念 `RESET_GROUND_*` / `RESET_BREATH_*` 等引导语 |
| 是 | 未命中 / 低于命中门槛 / 禁答标记挡下 | **诚实空态**；**禁止** generate、禁止观察翼、禁止 chat 翼编说明书 |
| 语义未完成（embedding 未就绪 / 超时 / 失败） | 允许 catalog 命中短答；否则视同未命中 | **同一套诚实空态**；**禁止** fail-open 到 generate |
| 总开关 `FT_CONFIDE_KB_RETRIEVAL=off` | 不检索 | 回退「阿寅不做产品问答」= 现网层 5（含生成）。关闸是产品选择，不是未命中后门 |

### 诚实空态口径（文案可在实现时入 locale，PO 可改字，不可改性质）

参照 `CONFIDE_REFLECTIVE_HONESTY`：承认没有这份笔记，给一个**已有界面**去向（`⋯` / Practice / Preferences），不编步骤、不假装专业客服。

草稿（**非**最终验收句，实现前可改）：

- en：`Yin doesn't keep a manual for that. Try the menu — Practice or Preferences — instead of waiting for Yin to invent the steps.`  
- 禁止：编按钮路径、编「观察翼/闲聊」式在场描写、把未收录功能讲成已上线。

未命中仍须写 `kb_retrieval_miss`（或现网已有事件）供双周补条目。日志 **不能**代替上面那句回复。

### 验收锚点雏形（实现 Issue 可直搬；最终句以 locale 为准）

| # | 用户句 | 期望 |
|---|---|---|
| H1 | `怎么开始坐` / `Where is Sit with Yin?` | 命中 KB-FUNC-0001 短答（或同等已通过 Sit 入口条） |
| H2 | `接地练习在哪` / `Where is the Ground exercise?` | 命中 KB-FUNC-0002 类入口短答 |
| H3 | `Breath 和 Sit 有什么区别` | 命中已通过对照短答（命中已通过对照短答 **0011**（0006 为盘点参考 · 不进 catalog）或未命中空态） |
| S1 | `带我做一遍接地练习` / `Walk me through Ground exercise steps` | 半命中：只指路，不念引导语正文 |
| M1 | `观察翼是什么` / `What is the observation wing?`（库未收录内部名） | 产品闸=是 → **诚实空态**；`data-source` 不得为 `generate` |
| M2 | 问一项菜单里暂时没有、库也没有的功能 | 同上；禁止生成「可以去某某还不存在的按钮」 |
| N1 | `我太累了` | **不进本闸**；tired **语料**照旧（不依赖 embedding） |
| N1b | `有点烦`（embedding **已 ready**） | 观察翼 generate 照旧 |
| C1 | `Sit 按钮在哪` 或本会进 L3 的产品问（embedding **未就绪**） | **诚实空态**，与未命中同一套；`data-source` 不得为 `generate` |
| N2 | `我练了多久` / `How long have I been practicing?` | `practice_facts`，**不是**知识库 |
| N3 | `谁是胖墩？`（embedding **已 ready**） | chat 翼；**不是**知识库。未就绪且本会进 L3 → 同 C1 空态 |
| N4 | `I don't want to live` | safety-01；知识库路径不可达 |

---

## 五、问题 3 · 知识库现在到哪一步？本闸何时才能上线？

**地面真相（2026-09-22 · `origin/develop` 含 Merge #924 `390e59cd`）**：

| 层 | 状态 |
|---|---|
| 条目权威 | `product-knowledge-base.md`：**18 条** `审核状态: 已通过` 可进检索闸门；0006 盘点参考（**PO spot-check 已通过** · `yin_may_retrieve: 否` · 不进 catalog）、0009 云备份仍未审核 |
| 检索运行时 | **已合入 develop（#924）**：关键词 catalog（`confideProductKnowledge.js` + `productKnowledgeCatalog.json`） |
| 问句闸门 | **仍是正则**，与本 Brief 目标冲突 |
| 未命中 | #924 仍按旧 Q3 走 corpus / generate —— 本闸要堵的后门 |

**上线门槛（须同时满足，禁止空转闸门）**：

1. 可检索条目 ≥ 第一批已通过规模（当前口径：**至少 15 条已通过**；急救型 / 0009 仍不可达）。  
2. 检索函数已存在且只索引 `yin_may_retrieve: 是` ∧ `审核状态: 已通过`（#924 已满足）。  
3. **本闸语义分类已接上**，live 路径不再用问句正则当分类器。  
4. 产品问未命中 **以及** embedding 未就绪 / 分类失败超时 → 诚实空态单测为红绿对照，禁止 generate。  

**禁止**：「闸门先接语义、库还是空的」或「库接上了、未命中仍 generate」。  
检索接线已合入，本闸实现走新旁支，基于当时 `origin/develop`。

向量检索条目（短答 embedding）**不是**本闸上线门槛。v1 仍可关键词匹配条目正文；要换向量索引另议。本闸只负责 **要不要查 / 查不到怎么回**，不负责 **条目打分算法升级**。

---

## 六、embedding 未就绪 / 失败（PO 改锁 · 2026-09-22）

**禁止**为了本闸让用户干等冷启动。  
**禁止**把 Stage 2「未就绪 fail-open 到字面/生成」套用到本闸：编错 Sit / 菜单路径是产品事实伤害，不是语气不够贴。新用户第一句常是「这个怎么用」，窗口不窄。

| 发送时 embedding | 本闸（硬性） |
|---|---|
| `ready` | 跑二分类。分类失败 / 超时 / 未过阈值但已进入「本会检索或本会 L3」的剩余路径 → **同一套诚实空态**，不得 generate |
| `unknown` / `loading` / `error` | **立刻**不跑语义、不 await。不得用正则顶替 live 分类器去**放行 generate**。安全 / 危机 / 边界 / 情绪**语料** / 个人事实仍走现网确定性路径。其余本会进 L3 的句子：允许不依赖 embedding 的 catalog **命中**短答；**未命中或不够分 → 与知识库未命中同一套诚实空态**。打日志。 |

实现 Issue 须单测：未 ready **不得 await**；未 ready 的产品问（如 `Sit 按钮在哪`）**不得** `data-source=generate`。

---

## 七、冲突扫描（场景 AE）

对照 `SCENARIO_TESTS.md` 场景 AE · Electron L2：

- **强度**：命中短答应 **0–1 秒内**可见（与事实工具同类，快于 generate）。未命中空态同样立刻出句，不得先转一圈 L3。不重于危机语料。  
- **语气**：指路短答 / 诚实空态 = 观照者承认不知道；禁止教练式逐步教学。与 `reflective_honesty` 相邻，不与观察翼肢体描写混用。  
- **职责**：与 AE 步 9 个人事实、步 7 边界、步 3 安全 **无替代关系**，只是在 fallback 生成之前插入一层。  
- **PO 已授权改剧本**：AE L2 步 1「对不上情绪桶则 generate」在开工时改为：产品问未命中、以及 embedding 未就绪且本会进 L3 → 诚实空态。**本锁定期仍不改** `SCENARIO_TESTS.md`（留给实现 PR）。  
- **保护面**：Web harness 仍检索不生成；窄屏不开本闸；Focusing 卸载后仍不得 generate；chat 翼「谁是胖墩」不进知识库。

无「强度高于危机」疑点。职责重叠已在路由表写清，不另开入口。

### 共用机制核对

本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层，核对跳过。

### 后台网络

不新增网络通道。复用本机已有 embedding GGUF；缺失时的下载纪律与现网 L0/L1 相同，且 **不得**把本闸第一次分类变成用户可感知的「正在下载」。

### 点击反馈（实现时 PR 必答）

Share 后 0–1 秒内：发送钮 disabled + 命中则短答出现，或未命中则诚实空态出现；禁止空白。本 Brief 阶段无可点击改动。

---

## 八、实现范围备忘（点头之后，不是现在）

- Electron 宽屏 + 意图门闩；非每轮检索。  
- 避开同坐卸载与 embedding 工作闸冲突（`confide-embedding-lifecycle-arbitration.md`）。  
- 总开关保持 `FT_CONFIDE_KB_RETRIEVAL`。  
- 单测：闸门改写句、命中/半命中/未命中、个人事实负例、安全不可达、开关、**embedding 未就绪不得 generate**。  
- 文档：场景 AE 补「产品问句 → 知识库 → 未命中 / 未就绪空态」。

---

## 九、下一步（给后续接手的人，含未来的 Cursor）

1. **规格已锁**（见下「已拍板」）。本回合 **只改 Brief，不写运行时**（#924 已合入，须 **新开 Chat** 再实现）。  
2. 实现口令须明示按 **本 Brief** 开工（B 类）。  
3. **看到本文件已点头就在合入会话里写代码 = 违规。**

---

## 已拍板（2026-09-22 PO）

1. **闸门形态**：方案 B 独立二分类。方案 A 第四桶不做。  
2. **未命中硬闸**：产品问未命中只诚实空态、永不 generate。空态英文可先用第四节草稿，实现时润色。  
3. **上线门槛**：语义闸 + 未命中空态接到已合入的 15 条检索上，不把闸门/检索再拆成两次用户可见放行。  
4. **冷启动**：**不同意** fail-open 到 generate。未命中与 embedding 未就绪 **同一套诚实空态**；不干等；不用正则顶替分类器去放行生成。  
5. **场景 AE**：授权开工时改 L2「未匹配 → 一定 generate」为未命中 / 未就绪空态。
