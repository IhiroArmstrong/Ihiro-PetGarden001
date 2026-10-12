# Task Brief · Confide Stage 2 语义切真路由

> **状态（2026-09-21）**：Brief 已按分析师阻塞项加锁。Electron 默认 `live`；`FT_CONFIDE_SEMANTIC_ROUTING=shadow` 回滚 Stage 1。  
> **口令**：本 Brief。  
> **权威实现**：`confideSemanticStage2.js` · `ConfideToYinUI._applyLiveSemanticThenDispatch` · `l1Runtime.semanticLiveClassify`  
> **范围声明**：这是 Stage 2 的**第一刀（先窄后宽）**，不是把「真实有利分歧 6 条」整包重放。

## 做什么

在安全 / 他人攻击正则**之后**、功能 handler **之前**，仅当 embedding **已经 ready** 时读取粗桶：

- 语义 `functional` + 字面**情绪桶** → 改走 `fallback`，让 `practice_facts` / Hybrid / honesty 有机会命中（「累积了多久」类误伤的安全网）
- 语义失败 / gray / 情绪自述灰区 / 字面本就是 gray → **不改**字面路由（`有点烦` / `睡不着` 仍可 generate 观察翼）
- Web / 无 IPC：行为与 Stage 1 相同

## 阻塞级不变量 · embedding 未就绪不得挡回复

Live 路径**禁止**等待 embedding 冷启动或加载完成。Stage 1 影子是 fire-and-forget；Stage 2 切真之后，可用性仍高于多等几秒的精准度。

| 发送时 embedding 状态 | Live 必须做什么 |
|---|---|
| `ready` | 可等**这一次**粗桶计算；失败 / 超时 → 立刻按字面路由发出（fail-open） |
| `unknown` / `loading` / `error` | **立刻**按字面路由发出，**不等** `waitForReady`。可在后台 `ensure-embedding`，供下一句用 |

禁止把 Prompt 11 的 15s 影子分类预算拿来让用户干等冷启动。用户点发送后 0–1 秒内仍须看到发送钮 disabled +「正在听」或立刻出 corpus；冷启动第一句若命中本刀规则，表现必须与切前字面路由相同，不得多卡数秒。

## 与「真实有利分歧 6 条」的落差（写清楚，避免事后以为修好了）

拍板用过的证据是 **Real 6（门槛 5）**：影子 CSV 1 条 + 现网肉测 KEEP 5 条。制造机公式是「字面 ≠ golden 且语义 = golden」，现网这 6 条**字面都是 gray，不是字面情绪桶**。

本刀只处理 **字面情绪桶 ∩ 语义 functional**。因此：

| 句子 | 字面粗桶 | 本刀会不会改现网行为 |
|---|---|---|
| 我有点不高兴 | 字面灰（影子 KEEP） | **不会**（切前切后都走原字面） |
| 有点烦 / 睡不着 | 字面灰 | **不会**（仍可 generate） |
| I need some practice. | 字面灰、语义 functional | **不会**（不会被抬去练习账本） |
| 其余现网肉测 KEEP（如「为什么开始做这件事？」「我今天不想练习了。」等） | 字面灰 | **不会** |

制造机 60 条 KEEP 在现网字面上同样全是 gray：0 条会被本刀改路由。  
「累积了多久」已是 patched 锚点（字面已 functional）；本刀是同类**尚未**被正则收口的情绪桶误伤的安全网，不是 6 条证据的完整实现。后续刀（gray→功能桶等）另开 Brief。

## 明确不做

- 不改 `confideClassify` 词表
- 不把闲聊金标准拧成功能桶
- 不切观察翼答句护栏
- 制造机脚本仍不得打印「可以切 Stage 2」
- 不在 live 路径上等待 embedding 变 ready

## 回滚

Electron 主进程环境变量 `FT_CONFIDE_SEMANTIC_ROUTING=shadow`（或 `off` / `stage1`）。设回后：同样三句验收句必须回到切前行为（不等粗桶、不改路由）。

## 验收

- 单测：`confideSemanticStage2.test.js`（含「未 ready 不得 await」）· `confideReplyFlow.test.js` · `desktopCompanionL2Route.test.js` IPC 锁 · `FT_CONFIDE_SEMANTIC_ROUTING=shadow` 时 `applyConfideStage2Route` 不改情绪桶
- 人工（Electron 宽屏 ready）：`累积了多久` 仍须 `practice_facts`；`有点烦` 仍可 generate；`I don't want to live` 仍 safety-01、不等 embedding
- **冷启动 / 未就绪**：companion 刚起、embedding 尚未 `ready` 时发一句若在 ready 后会走本刀的功能句（或测试替身：字面情绪桶 + 语义 functional），确认**立刻**字面路由、不卡在「正在听」数秒。回滚开关打开时同一句也必须是切前行为
- **回滚开关实测**：主进程 `FT_CONFIDE_SEMANTIC_ROUTING=shadow` 后重跑上面三句，行为与 Stage 1 相同
- **就绪延迟**：embedding 已 ready 时，记一条 live 粗桶墙钟（现成 `timing.wallMs` / `embedMs`）。只记录数字，不在本刀调阈值；15s 影子超时不得出现在用户可感知等待里

## Stage 2b（gray→功能桶）门闩（2026-10-12 · PO 书面改锁）

本刀只处理字面情绪桶 ∩ 语义 functional。gray→功能桶**不是** KB 问法矩阵能生成的证据。

**2026-10-12 PO**：旧门闩「自然对话互异句 ≥25」卡在偶遇上，且把实验室筛出的正例连发进 Confide 是循环论证（同一套分类器同意自己）+ 意图族过少，测不出误拉。改为下面这张表。**切 live 才受本表约束。影子模式实现不改用户可见回复，可另开会话开工，不需要等本表数字。**

| 项 | 门闩 |
|---|---|
| 正例 M | PO 手打或确认的互异句 **≥25**，覆盖 **至少 6 个意图族**；日志标 `source: po_seeded`，**不与自然样本混算** |
| 负例对照 | 另备 **≥20** 条本该留在情绪 / 闲聊 / gray 的句子（如「有点烦」「今天想去骑车」「累死了」），**误拉 <2** |
| 抽审 | 从正例抽 **20** 条标 KEEP（该被功能桶接住）/ DROP（该留灰或 generate）；KEEP ≥ 12 **且** 误拉情绪/闲聊少于 2（与负例对照并列，负例误拉 <2） |
| 自然样本 | 继续攒，作为 **上线后验证**，不再作为开工 / 切 live 门槛 |
| 不算 M | 制造机 KEEP、实验室 `M_CANDIDATE` 整表连发进 Confide、未标 `po_seeded` 的刷词句 |
| 回滚 | 切 live 后仍保留 `FT_CONFIDE_SEMANTIC_ROUTING=shadow` |

57 句实验室正例：不整表连发进 Confide；由脚本批量跑 + PO 手标 KEEP/DROP。负例从历史 jsonl 情绪/闲聊句挑，再补缺。

**才切 Stage 2b live**：正例门闩 + 负例误拉 <2 + 抽审 KEEP≥12。任一项不够 → 书面 defer，禁止默默悬着。

### Stage 2b 影子（2026-10-12 · 只写日志 · 不改回复）

每条 `semantic_shadow_classify` 行多三栏（回复已显示之后才写，路由与回复不变）：

| 字段 | 含义 |
|---|---|
| `stage2bWouldPromote` | 若切 2b，这一句会不会离开现在的回复。只有 **literal=gray ∧ semantic=functional ∧ 最终来源是 `generate` / `corpus`**（Yin 在聊、没在答）才为真 |
| `stage2bReason` | `gray_to_functional` / `already_handled`（KB、练习账本等已接住）/ `semantic_not_functional` / `semantic_missing`（embedding 未就绪）/ `literal_not_gray`（归窄刀 Stage 2）/ `protected_route`（安全、他人攻击，永不动） |
| `seedSource` | `po_seeded` 或 `natural`。**只有主进程**环境变量 `FT_CONFIDE_SEED_SOURCE=po_seeded` 能打上；renderer 无法伪造。门闩里的 `source: po_seeded` 即本栏 |

PO 手打正例：`FT_CONFIDE_SEED_SOURCE=po_seeded npm run desktop:dev`，在 Confide 里逐句发；平常启动不带这个变量，行即为 `natural`（上线后验证用）。

实现：`desktop/companion/l1SemanticStage2bShadow.js`（打包内自含，不引 `src/`）· 镜像 `src/core/confide/confideSemanticStage2b.js` · 单测 `confideSemanticStage2b.test.js`（含两份一致、shadow/live 模式均不改路由）。未做：按 `po_seeded` 统计门闩的审计脚本（另登记）。
