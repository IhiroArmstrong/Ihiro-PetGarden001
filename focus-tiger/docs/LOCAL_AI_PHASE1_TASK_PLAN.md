# Local AI Phase 1 · 执行任务计划

**状态（2026-09-01）**：**执行 SSOT** · Gate 0.2 #472 已关单 · **1B #503 已合** · **1A #506 已合** · **1C lab 本旁支（非 shipping）**。  
**产品政策 SSOT**：`LOCAL_AI_SCENARIO_EXPANSION_PO_DECISION.md` · `LOCAL_AI_SCENARIOS_V1.md`  
**排期索引**：`TASKS.md` §Local AI Phase 1  
**交叉引用**：`task-local-ai-phase1-nl-actions-mvp.md` · `task-local-ai-phase1-ask-journey-presence-mvp.md` · `task-local-ai-reflection-companion-validation.md` · `task-confide-read-hybrid-v1.md` · `CONFIDE_EXECUTABLE_INTENTS.md` · `LAB_SCRIPT_CONVENTIONS.md`

---

## 0. 本文件管什么

| 层 | 文档 | 职责 |
|---|---|---|
| **产品政策** | `LOCAL_AI_SCENARIOS_V1.md` | V1–V5 · Ceiling · MUST NOT · 原则 |
| **执行计划（本文）** | `LOCAL_AI_PHASE1_TASK_PLAN.md` | 门禁 · 顺序 · 口令 · A/B/C 验收步骤 · 分 PR 纪律 |
| **实现 Brief** | `task-briefs/task-local-ai-phase1-*.md` | 单轨 scope / 冲突扫描 / 验收 |

**硬规则**

- Brief 存在 ≠ 开工  
- **Validation ≠ Shipping**  
- Phase 1 三轨 **分 PR**  
- 合 PO 决策 / 本文 **≠** 任何 runtime 已批准  

**产品模型（一句话）**

> 让 Yin 更懂用户已经告诉它的东西 → 帮用户看见自己的记录 → 在极窄边界内执行明确意图 → 仅在被邀请时做第二面镜子（实验）。

---

## 1. 三层总览

| 层 | 状态 | 说明 |
|---|---|---|
| **规划 / PO** | ✅ 已结案 | PR #476 · `LOCAL_AI_SCENARIO_EXPANSION_PO_DECISION.md` |
| **Brief** | ✅ 已建 | 1A / 1B / 1C · **存在 ≠ 开工** |
| **Runtime** | 🟡 1C lab 本旁支 | 1A #506 · 1B #503 已合 · **Validation ≠ Shipping** |

```text
[✅ PO + SSOT #476]
        ↓
[Gate 0.2 · #472 Read Hybrid 验收 A→B→C]  ← **2026-09-01 关单**（tip `86a4c72e`）
        ↓
[口令 → 1B Ask Journey/Presence]  ← **#503 已合**
        ↓
[口令 → 1A NL Actions · Show memory]  ← **#506 已合**
        ↓
[口令 → 1C Reflection validation]  ← **本旁支 lab（非 shipping）**
        ↓
[若 1C 通过 → 新 shipping Brief → 再议]
```

---

## 2. 门禁（任何 Phase 1 runtime 之前）

| # | 任务 | 类型 | 触发 | 产出 | 状态 |
|---|---|---|---|---|---|
| **0.1** | PO 决策 + Brief 入库 | Git | ✅ PR #476 | 规划 SSOT + Brief | ✅ Done |
| **0.2** | **#472 Read Hybrid 验收**（1.7B expansion · regex miss → L0 只读） | A/B/C 见 §3 | 直接测 · bug 才改代码 | tracker 关单或 bug 单 | ✅ **2026-09-01 关单**（tip `86a4c72e`；C-3 suspend · C-5 follow-up） |
| **0.3** | Memory Slice 1d / 1e tracker 人工 | 人工 QA | 可与 0.2 并行 | 口头 Forget 链路人验 | ⏳ 待人工 |
| **0.4** | Presence Signals 旁支（CI-02 链路） | Git + QA | 视旁支 PR | 1B 前置环境 | 🟡 与 1B 协调 |
| **0.D** | **Yin Intent Diagnostic**（模型 vs routing 拆开） | 实验室 · 无生产改动 | PO 2026-08-31 · Confide 实测 | intent JSON 对照表 | Phase 1 **已合 #495**；Phase 2 fixture **已合 #509**；Metal 20 条 **2026-09-01** `reading=model_can_label_boundary_check_pipeline`（不换 GGUF）；**Phase 2B v4 fixture 本旁支**（A/C/D Metal 未跑） |

**0.2 已通过（2026-09-01）**：**1B #503 已合**。**1A 口令已执行**（本旁支）。

**0.D 通过前**：**不开** 多模型 Benchmark、**不**改生产默认 GGUF。0.D 证明「Qwen 能标 intent、现网仍贴标签」→ 修 prompt / 层序 / 语料，不换模型。Qwen 标不出 companion / boundary / mixed primary intent → 再议容量（1.7B 是否瓶颈）。

**Lab 旁支并行（2026-08-30 · PO 拍板）**：带 **lab flag** 的 Phase 1 轨（如 1C `?reflectionCompanion=1`）可在 **feature 旁支上分 PR 并行开发**；**合 develop / 对用户 mount** 顺序仍跟本文 §1 流程图与 §4 顺序——**Gate 0.2 hybrid 验收关单 → 1B → 1A → 1C validation**。开发进度与上线顺序解耦：旁支开发不被 #472 卡住，但 **不得**抢跑到真实用户（无 lab · 无 validation 结论 · 非 shipping）。

---

## 3. Gate 0.2 · #472 Read Hybrid（1.7B Expansion Use）

> **已合 develop**（#472 · `feature/confide-read-hybrid-v1`）。本门禁 = develop 上的验收关单，不是「合入前」。  
> **权威**：`task-confide-read-hybrid-v1.md` · `confideReadHybrid.js` · tracker `feature-confide-read-hybrid-v1.md`

### 3.1 三层验收（建议顺序 A → B → C）

| 层 | 做什么 | 在哪跑 | 过门 |
|---|---|---|---|
| **A · 单测** | registry + hybrid 闸门 | 终端 | 全绿 |
| **B · 探针** | L0 对 fixture 不误选写工具 | 终端（须 GGUF） | `writeFalsePositives === 0` |
| **C · 人工** | canonical / paraphrase / known gap | **Electron 宽屏桌面窗** | 见 §3.4 |

**关单以 C 为准**；A/B 可在起 Electron 前完成。

**环境**

- 关单树：`/Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001-wt-develop-qa/focus-tiger`
- `desktop:dev` 与 `dev:qa` **不能同时占 5173**；测 Electron 前先停 Safari 侧 Vite
- GGUF 常见路径：`~/Library/Application Support/Focus Tiger/companion-l0/Qwen3-1.7B-Q4_K_M.gguf`
- **Read Hybrid 人工测只能在 Electron 宽屏壳**；Safari `?confide=1` harness **无** `classifyReadTool` / L0 补漏

### 3.2 A · 单测

```bash
cd /Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001-wt-develop-qa/focus-tiger
node --test src/core/confide/confideReadHybrid.test.js \
           src/core/confide/confideExecutableTools.test.js \
           src/core/desktopCompanionL2Route.test.js
```

期望：全 pass；read hybrid prompt **不含** `forget_memory_entry`。

### 3.3 B · 探针回归

```bash
cd /Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001-wt-develop-qa/focus-tiger
npm --prefix desktop install
cd /Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001-wt-develop-qa/focus-tiger/desktop
npm run companion:tool-call
```

过门：stdout `"writeFalsePositives": 0` 且 `"passGate": true`。报告：`/tmp/ft-l0-lab/tool-call-<epoch>.json`。  
缺模型：`FT_TOOL_CALL_GGUF="/path/to/Qwen3-1.7B-Q4_K_M.gguf" npm run companion:tool-call`

> 探针用 **lab prompt**（含 forget 假阳性）；生产 Read Hybrid 用 **无 forget** 的 `buildConfideReadHybridPrompt`（见 `LAB_SCRIPT_CONVENTIONS.md`）。

### 3.4 C · Electron 人工测

**启动**

```bash
cd /Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001-wt-develop-qa/focus-tiger
npm --prefix desktop install
npm run desktop:dev
```

- 看 **Focus Tiger 桌面窗**（非 Safari）
- 宽屏 ≥480；status **ready**；型号 **`Qwen3-1.7B-Q4_K_M`**
- 判据：`[data-testid=confide-to-yin-reply]` 的 **`data-source`**

**体感区别**

- **Canonical（regex）**：约 0–1s 出 facts；**不应**长时间「正在听」等 L0
- **Paraphrase（regex miss）**：可多等数秒（L0 classify，上限约 12s），再 `presence_facts` 或回落 L3/corpus

| # | 输入 | 期望 `data-source` | 备注 |
|---|---|---|---|
| C-1 | `How long have I practiced?` / `练了多久` | `practice_facts` | CI-00 · 数字对 Journey Log |
| C-2 | `Has my mood improved these two weeks?` / `我情绪这两周改善了吗？` | `presence_facts` | CI-02 · regex gold（SSOT 描述性问法迁移在 **1B**） |
| C-3 | 口头 Forget（见 AG · 1e 前置） | `memory_forget` | CI-01 · 须 Consent + memory 条目 |
| C-4 | `Looking at my check-ins, am I calmer than last month?` | 最好 `presence_facts` | paraphrase · **模型依赖** |
| C-5 | `Can you tell me my total sitting time on this device?` | 关单口径 **可不**命中 `practice_facts`（known gap） | **2026-09-01 产品修**：regex 升格为 CI-00；见 `fix-confide-sitting-time-practice-facts` |

**负例**：`I feel depressed, has my mood improved?` → **sad 语料**，非 `presence_facts`。

**CI-01 前置（约 2 分钟）**：Consent Allow → 可抽取句入库 → `Please forget what I said about Monday` / `别再记周一的事了`。

**关单记录模板**

```text
#472 Read Hybrid @ <develop tip>
- A 单测: pass / fail
- B writeFalsePositives: 0 / N
- C-1 CI-00: pass
- C-2 CI-02: pass
- C-3 CI-01: pass
- C-4 paraphrase: presence_facts / generate / corpus
- C-5 known gap: 未命中 (expected)
```

通过后：关 `TEST_TRACKER` 行 `feature-confide-read-hybrid-v1`。

---

## 4. Phase 1 CORE Runtime（分轨 · 分 PR）

### 4.1 轨 1B · Ask Journey / Presence（建议 **先** 开工）

| # | 任务 | Brief |
|---|---|---|
| 1B.1 | CI-02 **描述性问法** regex / hybrid 迁移 | `task-local-ai-phase1-ask-journey-presence-mvp.md` |
| 1B.2 | `When do I usually practice?` Retrieve | 同上 |
| 1B.3 | `How have I been showing up?` bounded Describe | 同上 |
| 1B.4 | `What has my mood looked like recently?`（SSOT 正式示例） | 同上 |
| 1B.5 | registry + 单测 + `SCENARIO_TESTS` AE 更新 | 同上 |
| 1B.6 | 人工：描述性问句 → `presence_facts`；危机仍走情绪桶 | tracker |

**口令**：`开工 Local AI Phase 1 Ask Journey Presence`  
**不做**：`What have you noticed lately?`（observation-boundary）· Interpret/Diagnose（V5）

### 4.2 轨 1A · NL Actions MVP（**第二** 开工）

| # | 任务 | Brief |
|---|---|---|
| 1A.1 | **Forget this** 回归锚（CI-01 · 不重做） | `task-local-ai-phase1-nl-actions-mvp.md` |
| 1A.2 | **Show me what you remember** 新 read tool（建议 CI-03） | 同上 |
| 1A.3 | Read Hybrid 补漏（readOnly + autoExecute 闸门） | 同上 |
| 1A.4 | Intent Contract 全链文档对齐 | `CONFIDE_EXECUTABLE_INTENTS.md` |
| 1A.5 | 人工：Electron Confide · Show memory 诚实模板 | tracker |

**口令**：`开工 Local AI Phase 1 NL Actions`  
**不做**：Delete today Journey（V2 Future Candidate）· Don't save → **Slice 1f 已定稿**（非 Phase 1A NL Actions）

### 4.3 轨 1C · Reflection Companion（**第三** · validation only）

| # | 任务 | Brief |
|---|---|---|
| 1C.1 | 用户主动触发 → one short observation 原型 | `task-local-ai-reflection-companion-validation.md` |
| 1C.2 | lab flag · **不**默认生产 | 同上 |
| 1C.3 | 设计师 + PO 书面 validation 结论 | 同上 |
| 1C.4 | 若通过 → **另开** shipping Brief | 新 Brief · 未来口令 |

**口令**：`开工 Reflection Companion Validation` / **2026-09-01 口令 1C**  
**硬规则**：Validation approval ≠ shipping approval · **禁止**提交后自动 generate · **禁止**与 1A/1B 同 PR  
**本旁支**：fail-soft 已审语料 · 危机不 generate · `data-source` · 场景 AL

---

## 5. 并行 / 依赖轨道（非 Phase 1 主轨）

| # | 任务 | PO 状态 | 说明 |
|---|---|---|---|
| P.1 | Presence Signals Slice 2（Ritual chip 入账） | 排期 | 与 1B 数据源相关 · 分 PR |
| P.2 | Presence Signals Slice 5–6（查看/删除 UI） | 排期 | 与 Show memory 职责互补 |
| P.3 | Memory Slice 仪式 generate 注入 | **仍未拍板** | 1d 已合 · generate 另审 |
| P.4 | Operating Layer（Backup/Update/MCP） | 架构锁 | **不进 Confide** |

---

## 6. 明确不开工（已锁）

| 项 | PO 结论 |
|---|---|
| **V2** `DELETE_TODAY_JOURNEY_ENTRY` | Future Candidate · NOT MVP · **无** implementation task |
| **Don't save this** | ✅ Slice 1f · 见 `YIN_PERSONAL_MEMORY_PERSISTENCE_POLICY.md` |
| **V3 shipping** | 须 1C validation 通过后再议 |
| **V4** Arrival / Breath / Celebrating 等 | MUST NOT ENTER |
| **V5** Interpret / Diagnose / Coach | 全禁 |
| **C4 Autonomous** | not part of current product model |
| **换生产默认模型 / 多模型 Benchmark** | **0.D 未出结论前禁止** |

---

## 6.1 Gate 0.D · Yin Intent Diagnostic（2026-08-31 · 实验室）

**目的**：拆开 **Qwen 能力** 与 **Confide routing / prompt / corpus**。不是生产路径，不改默认 GGUF。

**现网事实（对照用，勿在 0.D 里改）**

```text
0 Safety → 1 仪式 → 2 情绪桶语料（命中则禁止 generate）
  → CI 白名单 / memory_suppress
  → 3 L3 短生成（persona：观察、短句、不教练）
```

「I am present / I am curious」类句**不在** `confideCorpus.js`，多半是 **L3 persona 生成**；「I don't see a matching memory」是 **suppress / forget 诚实模板**，不是 Qwen。

**Phase 1（当前 Qwen · 12 条）**：只输出 JSON，禁止 Yin 口吻。fixture SSOT：`src/core/confide/confideIntentDiagnosticFixtures.js` = Confide 实测 10 句 + 2 条对照（纯情绪 / 练了多久）。质量七问是人设探针，**不**进本表。允许标签含 `SUPPRESS`（Don't keep）与示例枚举并列，不是锁死产品路由。

```json
{ "primary_intent": "COMPANION_PRESENCE | BEGIN | BOUNDARY | FORGET | SUPPRESS | EMOTION | OTHER", "secondary_signal": "...", "confidence": 0 }
```

期望方向（不是锁死枚举）：sit with me → `COMPANION_PRESENCE`；not sure I want to talk → `BOUNDARY`；mess + let's begin → primary `BEGIN`，secondary `EMOTION`。

**怎么跑（系统终端 · Metal）**

```bash
cd focus-tiger/desktop && npm run companion:intent-diagnostic
```

解析 / 打分：`confideIntentDiagnosticParse.js`（单测，不调 GGUF）。结果：`/tmp/ft-l0-lab/intent-diag-<epoch>.json`。读 `reading`：`model_can_label_boundary_check_pipeline` → 修 prompt / 层序 / 语料，不换模型；`model_also_flattens_boundary_capacity_question` → 再议 1.7B 容量。

**首跑（生产 1.7B Q4 · 2026-08-31）**：`parseOk` 12/12；`BOUNDARY` / mixed `BEGIN` / `SUPPRESS` / `FORGET` 能标中；`COMPANION_PRESENCE` 常被标成 `BEGIN`。现网「I am curious」对照 `BOUNDARY` 已能标 → **pipeline 压扁，不是 1.7B 标不出边界**。数字留结果 JSON，不抄进本文。

**Phase 2（2026-09-01 · PO 冻 · #509 已合）**：同一协议扩设计师 20 条。#1 `Maybe later…` **secondary 空**（无情绪词）。fixture `YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2`。不换默认 GGUF，不进 Confide send。

**Phase 2 首跑（生产 1.7B Q4 · Metal · `FT_INTENT_PHASE=2` · 2026-09-01）**：`parseOk` 20/20；`reading=model_can_label_boundary_check_pipeline`。`BEGIN` / `FORGET` / `SUPPRESS` 能标中；`BOUNDARY` 部分能中（#1 `Maybe later` 被标 `EMOTION`；`not-go-there` 被标 `BEGIN`）；`COMPANION_PRESENCE` 仍常压成 `BEGIN`/`EMOTION`；记忆/心情类 `OTHER` 常压成 `EMOTION`。`yinVoiceLeaks` 0。→ **仍是 pipeline / 标签层序问题，不是 1.7B 标不出边界**；**禁止**据此开 Phase 3 换模型。逐条数字留 `/tmp/ft-l0-lab/intent-diag-1788217815538.json`，不抄进本文。

**Phase 2B（2026-09-01 · PO 冻 v4）**：新评分集四类分母 COMPANION 8 / 软 BOUNDARY 8 / OTHER 查询 8 / D 锚点 6。A2=`COMPANION_PRESENCE`（一起呼吸 ≠ 开练习）。B14/B15/B18 不入库；B16=练习查询；A13=`sit next to me`；OTHER 含 B19/B20/B21。BEGIN / EMOTION 只作对照，不进门槛。🔁 holdout 默认不跑（`FT_INTENT_HOLDOUT=1`）。架构 A=现状 7-way · C=同一 prompt 决策树 · D=生产规则预筛 + 残差 4-way。过关数字见 `YIN_INTENT_2B_GATES`。同一 1.7B Q4；**不进 Confide send**；**不含更大模型**。C 或 D 过关 → 结案不换模；都不过且锚点仍 ≥5/6 → 才允许谈 Phase 3。

```bash
cd focus-tiger/desktop && FT_INTENT_PHASE=2b FT_INTENT_ARCH=A npm run companion:intent-diagnostic
cd focus-tiger/desktop && FT_INTENT_PHASE=2b FT_INTENT_ARCH=C npm run companion:intent-diagnostic
cd focus-tiger/desktop && FT_INTENT_PHASE=2b FT_INTENT_ARCH=D npm run companion:intent-diagnostic
```

**Phase 2B Metal 首跑（生产 1.7B Q4 · 2026-09-01 · #516 已合 develop）**：系统终端各跑 A/C/D 一次。结果 JSON：`intent-diag-1788231569140.json`（A）· `1788231641941.json`（C）· `1788231700685.json`（D）。`yinVoiceLeaks` 0；`parseOk` A/C=44/44，D=42/44（`2b-a8` BEGIN 对照 · `2b-b16` OTHER — 均输出非法 label `FACTUAL_ASK`；**不在 D 锚点 6 条内**）。

| 门槛 | A | C | D |
|---|---|---|---|
| COMPANION ≥6/8 · Begin≤1 | 1/8 · Begin=4 ❌ | 0/8 ❌ | 1/8 ❌ |
| 软 BOUNDARY ≥6/8 | 2/8 ❌ | 0/8 ❌ | **8/8 ✓** |
| OTHER · Emotion≤1/8 | 5 ❌ | 5 ❌ | 5 ❌ |
| D 锚点 ≥5/6 | **5/6 ✓** | 3/6 ❌ | **0/6 ❌**（6 条均 parseOk；判错非缺输出） |
| architecturePass（combo lift ≥+15pp 且 anchor≥5/6） | — | ❌ | ❌ |

**reading=`architecture_none_pass_d_boundary_collapse_c_partial_other_lift`**（不进 Confide send · 不换 GGUF）：

1. **联合门槛生效**：D 软 BOUNDARY 8/8 但 anchor 0/6 → **不得**单独判 D 赢；FORGET/SUPPRESS/BEGIN 被系统性压成 BOUNDARY，属分类器塌缩而非「学会软拒绝」。
2. **A2 实测**：架构 A 将「一起呼吸」压成 **BEGIN** → 冻 `COMPANION_PRESENCE`（≠ 口头 BEGIN）有 Metal 支撑。
3. **`otherEmotion=5` 三架构同分 ≠ 容量定论**：C/D **分别**改过 OTHER↔EMOTION（C 决策树重排 · D 规则+残差）；C 在 B16/B20/B21 上 OTHER primary **3/8**（A **0/8**）→ pipeline **可局部改善**。同分因 **hard-5**（B7/B11/B13/B17/B19）在 A/C/D 上仍全 → EMOTION。
4. **Phase 3 vs D 收窄**：hard-5 第四刀 **已跑**（见下）→ **hard-5 不支持容量定论**；Phase 3 / D 收窄仍 **未定**（须看全量 44 条 + COMPANION/锚点）。

**Phase 2B hard-5 第四刀 Metal（生产 1.7B Q4 · 2026-09-01 · #518 已合 develop）**：`FT_INTENT_PHASE=2b-hard5 FT_INTENT_ARCH=E`。JSON：`intent-diag-1788233563846.json`。`parseOk` 5/5 · `hard5Hits` **5/5** · `hard5Emotion` 0 · **`passHard5` ✓** · `reading=hard5_pipeline_can_label_mood_adjacent_other`。

| goldId | 句意（fixture） | A/C/D | E |
|---|---|---|---|
| B7 | showing up consistently | EMOTION | **OTHER ✓** |
| B11 | mood trend this week | EMOTION | **OTHER ✓** |
| B13 | show up on days I say I will | EMOTION | **OTHER ✓** |
| B17 | don't know if present — can you check | EMOTION | **OTHER ✓** |
| B19 | mood trending up or down | EMOTION | **OTHER ✓** |

**读数**：hard-5 在 A/C/D 上全败、在 E 上全中 → **先前 `otherEmotion=5` 是 prompt/层序未点到，不是 1.7B 标不出**。**禁止**据此 hard-5 子集开 Phase 3。**仍禁止**未跑全量 2B×E 就改 Confide send / 默认 GGUF。COMPANION / 软 BOUNDARY / D 锚点问题仍按 §6.1 A/C/D 表处理。

```bash
cd focus-tiger/desktop && FT_INTENT_PHASE=2b-hard5 FT_INTENT_ARCH=E npm run companion:intent-diagnostic
```

**Phase 3（仅 0.D 证明容量瓶颈之后）**：Qwen3-1.7B Q4 / Q5、Llama 3.2 3B Q4、SmolLM3 3B Q4。Persona fidelity 与 Intent 分开打分；**不**因 Intent 略高就换掉 Yin 声线更好的模型。

**口令**：**开工 Yin Intent Diagnostic**

---

## 7. 口令对照（复制即用）

| 你想做的事 | 口令 |
|---|---|
| 开工 Journey/Presence + CI-02 迁移 | **开工 Local AI Phase 1 Ask Journey Presence** |
| 开工 Show memory read tool | **开工 Local AI Phase 1 NL Actions** |
| 开工 Reflection 实验（非 shipping） | **开工 Reflection Companion Validation** |
| 拆开模型 vs routing（不换模型） | **开工 Yin Intent Diagnostic** |
| 冻设计师 20 条 intent fixture | **开工 Yin Intent Diagnostic Phase 2** |
| 冻 v4 金标 + A/C/D 实验室对照 | **开工 Yin Intent Diagnostic Phase 2B** |
| OTHER/EMOTION hard-5 第四刀（架构 E） | **开工 Yin Intent Diagnostic Phase 2B hard-5** |
| #472 人工测有 bug | 直接描述现象 · 不必口令 |

---

## 8. 每项开工的完成定义

| 轨 / 门禁 | 单测 | 人工 | 文档 |
|---|---|---|---|
| **Gate 0.2** | §3.2 + 探针基线绿 | §3.4 canonical + paraphrase | tracker 关单 |
| **Gate 0.D** | `confideIntentDiagnostic.test.js` | 系统终端 JSON（2B A/C/D + hard-5 E **已跑 2026-09-01** · §6.1） | tracker 仅单元；#495 · #509 · #516 · #517 · #518 |
| **1B** | registry + 纯函数 | 三 CORE 问句 + 危机句 | `SCENARIO_TESTS` · `CONFIDE_EXECUTABLE_INTENTS` |
| **1A** | registry + hybrid 闸门 | Forget 不变 + Show memory | `CONFIDE_EXECUTABLE_INTENTS` |
| **1C** | lab 范围 | 「照见」非「指导」 | validation 结论文档 |

---

## 9. 我认为最合理的下一刀

1. **合入本 1A PR**（CI 绿即可合 develop）。  
2. 再下 **口令 1C validation**（非 shipping；lab 旁支可并行但不混 PR）。  
3. Forget「昨天那件事」= Yin Memory 指代另口令（不扫 `turns.jsonl`、不猜删）。

**较弱**：未关 #472 就并行三 Phase 1 shipping；扩设计师 20 条 Phase 2 诊断（0.D 已够支撑层序刀）；0.D 后再 Benchmark Llama。

Gate 0.D Phase 1+2 均证明 pipeline 压扁 → **层序已补** companion presence + OTHER 读工具复述 / 偏好诚实（本旁支）；L3 prompt **未改**；本计划**不换模型**。
