# Task Brief · Confide Stage 2b 灰度 live（gray→功能桶）

> **状态（2026-10-12）**：**已点头（补三处后锁）**。门闩数字已过（#1175 / #1176 · 3b 已确认）。本文件是 **B 类**规格。  
> **运行时禁止在写 Brief 的会话里做。** 另开 Chat、换模型。口令：`按这份 Brief 开工 Stage 2b 灰度 live`。  
> **前置**：Stage 2 窄刀已 live（字面情绪桶 ∩ 语义 functional → fallback）。Stage 2b 影子已合（只写 `stage2bWouldPromote`，不改回复）。  
> **权威将接线**：`confideSemanticStage2b.js` · `confideSemanticStage2.js` · Electron `semanticLiveClassify` / `_applyLiveSemanticThenDispatch`  
> **抽审 / 负例 SSOT**：[`confide-stage2b-negative-control-sheet.md`](../confide-stage2b-negative-control-sheet.md)

## 本条验收的是 / 不代表

- **本条验收的是**：PO 本机 Electron 打开 2b live 后，实验室 7 族功能问能离开观察翼，进功能链（KB / 练习账本 / 菜单指路等已有 handler）；情绪句「最近老是想起以前」仍走观察翼。  
- **不代表**：默认给所有用户开 2b live；不代表语言/菜单问法被接住；不代表 with-prior 一并扩面。

## 门闩（已过 · 实验室口径）

| 项 | 要求 | 现状 |
|---|---|---|
| 抽审 | KEEP≥12 | 第一轮 KEEP 19；§3b 20 条 PO 确认没问题 |
| 负例 | ≥20 且误拉 <2 | 41 句，误拉 1 |
| 意图族 | ≥6 | 7 族（开始练习 / 结束练习 / 找以前的记录 / 寅币 / 备份 / 提醒 / 付费订阅） |

第 7 行旧句「有没有适合现在停一下的练习？」**退役**（不通，不 KEEP 也不 DROP）。替句「有没有适合现在缓一缓的短练习？」生效。

## 做什么

在 **安全 / 他人攻击之后**、已有功能 handler 之前，仅当 embedding **已经 ready**，且 **2b 开关为 live** 时：

现有影子判定 `decideConfideStage2bShadow` 为真（literal=gray ∧ semantic=functional ∧ 来源 `generate`/`corpus`）**并且通过下面硬约束** → 把字面 `fallback` 上的观察翼/闲聊生成改走功能链（与 Stage 2 一样：给 `practice_facts` / KB / honesty / 已有工具一次机会）。

未 ready / 失败 / 2b 开关不是 live → **立刻**按现在的字面回复，不等冷启动。

### 硬约束 1 · 「找以前的记录」族：功能词 + 同句邻近

负例里唯一误拉是「最近老是想起以前」：情绪回忆被抬进「找以前的记录」。切 live 后这一族最容易伤人。

仅当句子像在问**以前的记录 / 阿寅记下的东西**（邻域词：`以前` / `之前` / `过去` / `想起` / `记得`），**必须**再带至少一个功能词，且功能词与邻域词 **同句邻近**，才允许 2b 抬桶。

功能词（删掉光秃的「打开」）：

`记录` · `练习` · `哪里看` · `从哪` · `从哪里` · `记下` · `还记得` · `导出` · `拷走`

允许的组合（不是单独的「打开」）：`打开记录` · `还能打开`（后者必须与 `记录` 或 `练习` 落在同一小句）。禁止用光秃「打开」放行「想打开心扉聊聊以前的事」。

**同句邻近**：邻域词与功能词须在同一小句内（按逗号、顿号、分号、句号、问号、叹号切开），且两者之间不超过 **8 个汉字**（英文 ≤ 4 个词）。禁止「同句里两个地方各出现过就算」。

邻域命中但没有邻近功能词 → **禁止抬桶**，理由码建议 `past_recall_without_function_word`。  
「想看看之前做过的练习」「之前留下的练习记录在哪里」仍允许抬。

英文同语义：邻域 `the past` / `used to` / `remember` 须与 `record` / `practice` / `where` / `log` 同小句邻近；否则禁止。不要靠扩一张情绪句黑名单过日子。

### 硬约束 2 · 负例整表 + 各族邻近情绪句，必须不抬桶

**不只钉一句。** [`lab-inputs/stage2b-negative-control.txt`](../lab-inputs/stage2b-negative-control.txt) **全部非注释行**做成回归断言：期望 **不抬桶**（`wouldPromote=false`）。原冻结 41 句不得删；后补的邻近情绪句一并断言。约束一改时整表都要绿。

其他 6 族（开始练习 / 结束练习 / 寅币 / 备份 / 提醒 / 付费订阅）**不加词表**。每族至少 1–2 条邻近情绪句必须不抬桶：

| 族 | 邻近情绪句（回归 · 不抬桶） |
|---|---|
| 开始练习 | 呼吸有点急，心跳也快 · 专注不了，脑子很乱 |
| 结束练习 | 刚停下来心里还是空 · 练完了还是静不下来 |
| 找以前的记录 | 最近老是想起以前 · 以前的事不想再提了 · 想打开心扉聊聊以前的事 |
| 寅币 | 我感觉自己今天一点都不值钱 · 攒了半天好像什么都没留下 |
| 备份 | 这些心情我想先放下，不想再存着 · 不想把今天的事再记一份 |
| 提醒 | 身体一直在叫我该休息了 · 最近总忘了提醒自己休息 |
| 付费订阅 | 不想再被各种会员推销缠着 · 看那些开通入口就烦 |

结束练习两句、「想打开心扉聊聊以前的事」、「最近总忘了提醒自己休息」写进同一负例文件（41 之外的补行）。切 live 前后这些句子须仍走情绪/观察翼或闲聊，**不得**变成功能短答。撤掉任一条断言就必须红。

灰度里新发现的误拉原句（日志 K-4 后只留 hash）由 PO 记下，再补进本表。

### 灰度，不是一步全量

| 开关 | 默认 | 作用 |
|---|---|---|
| `FT_CONFIDE_STAGE2B_ROUTING` | **`shadow`** | `shadow`/`缺省`：只写影子栏，回复与现在相同。`live`：PO 本机灰度才改回复。`off`：2b 连影子判定也可关掉（可选；默认不必） |
| `FT_CONFIDE_SEMANTIC_ROUTING=shadow` | 保留 | 总回滚绳：Stage 2 与 2b live **一起**退回切前。2b 不得另做一条「只能关 2、关不掉 2b」的路径 |

**第一刀运行时合入后，Electron 默认仍是 2b shadow。** 全量默认 live 另开 Brief，须 PO 本机看过几天 `semantic_live_classify` / `semantic_shadow_classify` 分歧、且没有「情绪句进功能桶」再议。

PO 灰度：本机主进程设 `FT_CONFIDE_STAGE2B_ROUTING=live`，正常用几天。每天看 `semantic_live_classify` 与 shadow 分歧行，**只盯一件事**：有没有情绪句进了功能桶。出现一次 → 立刻改回 `shadow`（或总绳 `FT_CONFIDE_SEMANTIC_ROUTING=shadow`），并把**当时发的原句**记下来补进负例回归（日志后段只留 hash，事后查不出原文）。本机用量看不出稀有误拉，**负例整表回归的广度比灰度天数更重要**。自然样本只做验证，不是门槛。

影子继续并行：live 打开时仍写 `stage2bWouldPromote` / `stage2bReason`（约束拦截的句子 wouldPromote=false）。

## 明确不做

- 不改 `confideClassify` 词表来硬收 7 族
- 不动情绪 / 闲聊主路径（`有点烦` / `睡不着` / `今天想去骑车` 仍观察翼或闲聊）
- 不把语言/菜单问法并进 Stage 2b（分类器几乎判 gray；另记后续，不在本刀硬凑）
- 不扩 with-prior
- 不把实验室 KEEP 池整表打进 Confide
- 不在 live 路径等待 embedding ready
- 不把 2b 默认改成全用户 live
- 不改答句文案 / 观察翼护栏 / Safety

## 冲突扫描（实现前 · 点头后仍有效）

对照 `SCENARIO_TESTS.md`：

- **AE 倾诉 / 观察翼**：本刀只动「字面 gray、语义 functional、Yin 正在闲聊」的句子。`有点烦` 等情绪自述不在抬桶集合。强度上，接住功能问比继续观察翼更轻；误拉情绪句则更重——用硬约束 1（邻近功能词）和硬约束 2（负例整表 + 各族邻近句）压住。
- **AG 练习事实 / 记忆列表**：正当「找记录 / 练了多久」仍走已有 handler；禁止用 2b 代替 CI-03 去答「想起以前」类情绪句。
- **AD 睡态**：不改开面板 / `dormantWake`。
- **人设**：阿寅仍是观照者。功能短答应已有 KB/工具模板，禁止编造「已备份 / 已设提醒」。

**结论**：无未拍板冲突。误拉风险已写成硬约束，不另开产品二选一。

## 共用机制核对

本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层，核对跳过。

## 点击后 0–1 秒

发送后仍须立刻看到发送钮 disabled +「正在听」或已有 corpus。2b **不得**因 embedding 未 ready 多卡。ready 时这次粗桶可算；失败 fail-open 到字面回复。

## 验收（运行时会话做）

单测（撤掉即红）：

1. 负例 txt **全部非注释行**（原 41 + 补行）→ 全部不抬桶（读文件断言，禁止只测那一句）
2. 硬约束 2 表里各族邻近情绪句 → 全部不抬桶（含「想打开心扉聊聊以前的事」「最近总忘了提醒自己休息」）
3. 「之前留下的练习记录在哪里」→ 允许抬（同小句邻近功能词）
4. 「想打开心扉聊聊以前的事」→ 不抬（光秃「打开」不得放行）
5. 「有点烦」→ 不抬，仍可 generate
6. 「累积了多久」→ 仍 `practice_facts`（Stage 2，不是 2b）
7. 默认环境（无 `FT_CONFIDE_STAGE2B_ROUTING=live`）→ `apply*` 不改 gray 句回复
8. `FT_CONFIDE_SEMANTIC_ROUTING=shadow` → Stage 2 与 2b live 都不改路由

人工（PO 本机、2b=live、embedding ready）：

- 替句「有没有适合现在缓一缓的短练习？」离开观察翼
- 「练完之后寅币去哪儿看」离开观察翼
- 「最近老是想起以前」仍观察翼
- 回滚后三句回到切前

## 后续（不在本 Brief）

语言/菜单问法：现网用户会问，embedding 几乎判闲聊。单独记分类器后续，不并入 2b 扩面。

## 回滚

1. 只关 2b：`FT_CONFIDE_STAGE2B_ROUTING=shadow`  
2. 全关语义 live：`FT_CONFIDE_SEMANTIC_ROUTING=shadow`
