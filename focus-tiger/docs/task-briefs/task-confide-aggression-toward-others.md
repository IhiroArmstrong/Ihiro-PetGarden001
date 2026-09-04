# Task Brief · Confide 攻击他人意图单独分类

> **状态（2026-09-04）**：方案 **已拍板**（§10）· PR #563 · 实现待 `fix/confide-l3-repeat-fallback` 合 develop。  
> **背景**：PR #561（复读锁）已合；本任务与其无关，单独开分支。  
> **触发**：Confide 人工测试 — `I want to beat people.` → `Heard. Yin nods quietly.`（fallback-01）判定不妥。  
> **SSOT 邻接**：`task-confide-to-yin-v1.md`（危机 `safety_redirect` 优先层）· `confideClassify.js` · `confideSafetyKeywords.js` · `confideCorpus.js`

---

## 一、问题陈述

| 项 | 口径 |
|---|---|
| 现象 | 用户表达**针对他人的攻击/伤害意图**时，系统落入通用 `fallback`，回复含「Heard」「Yin nods quietly」等安抚句式 |
| 风险 | 字面读起来像对暴力意图的**默许/确认**；属安全/合规风险，非普通语料质量问题 |
| 根因 | 自伤/自杀已有独立 `safety_redirect` 路由；**对他人的攻击意图**无独立分类，与「我只是想倾诉负面情绪」共用 fallback 池 |
| 与 #561 关系 | **无**；复读锁只管连续相同回复，不碰分类 |

---

## 二、范围界定

### 2.1 属于本分类（需新路由）

- 明确表达对他人的攻击/伤害意图或幻想：  
  `I want to beat people` · `I want to hurt him` · `I want to punch someone` · `thinking about hurting her` 等
- 强烈愤怒 **且** 伴随针对他人的暴力意象（动词 + 人向对象）  
  例：`I'm so angry I want to hit him` ✓ · `I'm furious` ✗

**判断核心**：是否存在**针对他人（含泛指 someone/people）的暴力意象或攻击意图**；**不是**情绪强度。

### 2.2 不属于本分类（保持现状）

| 输入类型 | 现有路由 | 动作 |
|---|---|---|
| 自伤/自杀意图 | `safety_redirect` | **不动** |
| 单纯负面情绪，无攻击对象/无暴力意象 | 情绪桶或 `fallback` | **不动** |
| 日常愤怒/抱怨（`I hate my job` · `I'm so frustrated`） | 情绪桶或 `fallback` | **不动** |
| 对物发泄（`punch a wall` · `scream into a pillow`） | `fallback` 或情绪桶 | **本轮不升格**（无「他人」对象） |

### 2.3 多语言范围（方案建议 · 待拍板）

| 选项 | 说明 | 建议 |
|---|---|---|
| **A · 本轮仅英文** | 与人工测试触发句一致；规则表 + 单测先锁 EN | **✓ 推荐** |
| B · 本轮 EN + ZH | 与 `safety_redirect` 对称；须人审短语表后再合 | 可作为 fast-follow 小 PR |
| C · 本轮 EN + ZH + JA | 三语同步 | **不推荐**首轮：误判成本高，缺人工测试锚点 |

**我认为最合理的**：**A** — 本轮英文规则 + 占位语料三语键同构（ZH/JA 占位 `[TBD]`），中文识别短语表另开 fast-follow，经人审后合入。

---

## 三、路由设计

### 3.1 路由标识

```text
route id: aggression_toward_others
常量名: CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS
```

与现有 `safety_redirect` 同级：**优先安全层**，**不是**情绪桶（不进 `CONFIDE_EMOTION_BUCKETS` / `CONFIDE_EMOTION_PRIORITY`）。

### 3.2 分类流水线（实现时锁死顺序）

```text
空文本 → null（禁用发送）
  → safety_redirect（自伤/自杀 · 已有）
  → aggression_toward_others（攻击他人 · 新增）
  → 情绪桶（anxious / tired / stuck / sad / scattered）
  → fallback
```

**双命中**：`safety_redirect` **始终优先**。  
例：`I want to kill myself` → `safety_redirect`；`I want to kill him` → `aggression_toward_others`。

### 3.3 红线（回应语料 · 产品审定前占位亦须遵守）

| 禁止 | 原因 |
|---|---|
| 点头、确认、认同（`Heard` · `Yin nods` · `I understand why you'd…`） | 易被读成对暴力意图的接纳 |
| 评判、说教、指责（`That's wrong` · `You shouldn't`） | 关闭对话；非 Yin 角色 |
| 危机转介句式（crisis line · `too heavy to hold alone`） | 那是自伤/自杀场景；用错显答非所问 |
| 庆祝/玩笑姿态 | 与场景严重错位 |
| L2 短生成 | 与 `safety_redirect` 一致：**语料检索，禁止 generate** |

### 3.4 回应方向与语料优先级（分析师拍板 · 2026-09-04）

**首选调性**（`aggression-02`）：口语、不动声色、不直接贴情绪标签；与 Confide 现有克制/留白风格一致。  
**备选**（`aggression-01`）：承认情绪强度、不承认行为；偏「咨询式」直白，池中第二条，不与 02 平权。

| id | 优先级 | en（占位 · draft） | 风格备注 |
|---|---|---|---|
| `aggression-02` | **首选** | `Something's really gotten to you.` | 聚焦「发生了什么」，不涉及暴力意象 |
| `aggression-01` | 备选 | `That sounds like a lot of anger to carry.` | 点名 anger；教科书感较强，非默认语气 |

zh/ja 同向占位见 §5.1 · 附录 A。`review: 'draft'` 直至产品书面审定；**禁止**仅 2 条就标 `ok` 上线（见 §5.3）。

### 3.5 是否附加轻量安全提示语（待产品确认 · 本轮不实现）

| 选项 | 示例方向 | 建议 |
|---|---|---|
| 不附加 | 仅中性承接句 | 最简；与现有 confide 短句风格一致 |
| 极轻转介 | 句末另起：`If this feeling keeps building, someone you trust might help you carry it.` | **无** crisis line / 电话；克制版「找人聊聊」 |
| 与 safety 同级转介 | 含热线资源 | **禁止** — 严重等级不匹配 |

**我认为最合理的**：方案阶段先写进 Brief，**默认不实现**；产品若选「极轻转介」，作为审定后第二句独立语料行（`aggression-02`），不与首句绑死。

### 3.6 姿态与 UI（分析师拍板 · 2026-09-04）

**精灵动画 — 拍板：候选 A**

现网 Confide `onReplied`（`main.js`）：`safety_redirect` → `nodBow`；其它路由 → `mindfulAcknowledge`。  
`mindfulAcknowledge` **内部即 `nod-bow` 13 帧 pingpong×1**（`EMOTIONController.js`）——与本次 bug「文字点头 + 动作点头」双重误读同源。**攻击他人路由：不调用 `playEmotion`**，Yin 保持 Idle 闭目呼吸。

| 候选 | 结论 |
|---|---|
| **A** | **✓ 采用** — 零 oneshot |
| B 抿茶 | ✗ 仍有「云淡风轻认可」风险 |
| C 新 oneshot | ✗ 范围膨胀 |

**回复竖线色 — 拍板：Agg-2 `#8b6f5c`**

| 键 | 色值 | 用于 |
|---|---|---|
| fallback | `#d4a24a` | 禅意 fallback |
| safety | `#7a5340` | 危机转介 |
| **aggression** | **`#8b6f5c`** | `aggression_toward_others` |

**人工验收注意**：`#8b6f5c` 与 safety `#7a5340` 同属棕系、hex 接近——实现后须 **并排截图** 历史记录中两种回复，确认用户能一眼区分「危机转介」vs「攻击他人路由」，不能仅靠色值表过关。

| 触点 | 设计 |
|---|---|
| `data-route` | `aggression_toward_others` |
| companion presence / boundary / CI 工具 | 本路由 **不触发** |

---

## 四、识别规则设计（英文 · 规则起步）

### 4.1 模块

新文件 `src/core/confide/confideAggressionKeywords.js`（镜像 `confideSafetyKeywords.js` 结构）：

- `matchesAggressionTowardOthers(text)` → `boolean`
- 复用 `foldConfideSafetyText` 或同等 apostrophe 折叠
- **正则优先**（动词 + 人向对象），辅以保守短语表

### 4.2 正例规则（拟实现）

**组 A — 意图动词 + 暴力动词 + 人向对象**

```text
\b(?:want|wanna|wish|need|going|gonna)\s+to\s+
  (?:beat|hurt|hit|punch|kick|attack|kill|stab|shoot)\s+
  (?:him|her|them|someone|somebody|people|everyone|that\s+(?:guy|man|woman|person)|this\s+(?:guy|man|woman|person))\b
```

**组 B — 暴力动词 + 人向代词/名词（无 want）**

```text
\b(?:beat|hurt|hit|punch|kick|attack|kill)\s+
  (?:him|her|them|up|someone|somebody|people)\b
```

**组 C — 幻想/念头 + 暴力 + 人向**

```text
\b(?:fantas(?:y|ies|izing)|thinking)\s+about\s+
  (?:hurting|beating|hitting|punching|killing)\s+
  (?:him|her|them|someone|people)\b
```

**组 D — 保守短语（低误判）**

```text
beat people
hurt someone
punch someone
want to hurt him
want to beat her
```

### 4.3 排除规则（误判规避）

在正例命中后，若同时命中下列排除，则 **不** 路由本分类（回落至 `fallback` 或情绪桶）：

| 类别 | 排除模式 / 思路 | 例句 |
|---|---|---|
| 自伤 | `myself` · `me`（作伤害对象）· 已有 `hurt myself` → `safety_redirect` 先拦 | `I want to hurt myself` |
| 游戏 | `beat (this\|the\|my) (level\|boss\|game\|score\|high\s*score)` | `I want to beat this level` |
| 竞技（非人身伤害） | `beat (him\|her\|them) at` · `beat the (other\|opposing)?\s*team` · `beat my (record\|time\|personal\s*best)` | `beat him at chess` · `beat the other team` |
| 习语 / 夸张 | `kill for (a\|an\|some)` · `beat around the bush` · `beat the (clock\|deadline\|eggs\|drums)` | `I'd kill for a coffee` |
| 对物非人 | 暴力动词 + 非人对象（`wall` · `door` · `pillow`） | `punch a wall` |
| 纯情绪 | 仅 `angry`/`furious`/`hate` 无暴力动词+人向对象 | `I hate my job today` |

**实现策略**：`matchesAggressionTowardOthers` = 正例命中 **且** 未命中排除表；排除表单测逐条锁死。

### 4.4 已知误判风险（方案登记）

| 风险句 | 可能误判为 | 规避 |
|---|---|---|
| `I want to beat this level` | 攻击他人 | 游戏排除 |
| `We need to beat the other team` | 攻击他人 | team / at 排除 |
| `I could kill for a nap` | 攻击他人 | kill for 排除 |
| `I'm going to beat him at pool` | 攻击他人 | `at` 竞技排除 |
| `I want to hurt his feelings` | 攻击他人 | **灰区** — 非物理暴力；**本轮不匹配**（无 beat/hit/punch 物理动词表） |
| `I want to destroy him`（隐喻/辱骂） | 漏判 fallback | **已知漏判** — 首轮不加 `destroy`；语料扩充后再评估 |

---

## 五、语料池骨架

### 5.1 结构（实现轮可先 2+2 占位；上线前须扩池）

| id | 优先级 | review | en（占位） | zh（占位） | ja |
|---|---|---|---|---|---|
| `aggression-02` | **首选** | `draft` | `Something's really gotten to you.` | `一定有什么让你很难受。` | `[TBD]` |
| `aggression-01` | 备选 | `draft` | `That sounds like a lot of anger to carry.` | `听起来你背负了很多怒气。` | `[TBD]` |
| `aggression-03` | 扩池 | `draft` | `[TBD — 口语/留白，不贴 anger 标签]` | `[TBD]` | `[TBD]` |
| `aggression-04` | 扩池 | `draft` | `[TBD — 同上]` | `[TBD]` | `[TBD]` |

- **独立池**；不与 `fallback-01` 等共用。  
- `pickConfideLine`：池空时 **禁止** 回落禅意 `fallback`（与 `safety_redirect` 同 guard）。  
- 与 #561 复读锁协同：池仅 2 条时，连续触发本路由会在两句间交替，虽不违反「连续不得同字面」，但体验上仍显可预测——**扩池是上线门禁，不是可选项**。  
- 审定后同步 `docs/confide-corpus-seed.md` + `cloud/src/lib/tasteConfideCopyFreeze.ts`（若 overlay 需要）。

### 5.2 措辞约束（继承 confide 红线）

1. **无「听见了」/ Heard** — 在本路由视为确认风险。  
2. **无点头动作描写**。  
3. **不建议、不评判、不诊断**；避免咨询式「anger」贴标签（首选走 02 调性）。  
4. 短、中性、观察式；意象留白优先于情绪命名。

### 5.3 扩池门禁（分析师 · 2026-09-04）

| 阶段 | 池规模 | 说明 |
|---|---|---|
| **实现 PR** | ≥2 条审定向 + ≥2 条 `[TBD]` 占位 | 骨架 + 分类 + 单测可先合；占位 id 预留 |
| **标 `review: ok` / 对用户可见** | **≥4 条** 同调性短句 | 产品审定替换 03/04；禁止 2 条定型上线 |
| **人工测** | 连续发 3+ 条同类暴力句 | 不得只在 2 句间 ping-pong；须 feels 非机械 |

---

## 六、技术接线清单（实现阶段 · 方案确认后）

| 文件 | 变更 |
|---|---|
| `confideRoutes.js` | `AGGRESSION_TOWARD_OTHERS: 'aggression_toward_others'` |
| `confideAggressionKeywords.js` | **新建** · 正例/排除 · `matchesAggressionTowardOthers` |
| `confideClassify.js` | safety 之后插入 aggression 层 |
| `confideClassify.test.js` | 正例 + 负例（见 §七） |
| `confideCorpus.js` | `aggression-02/01` + `aggression-03/04` 占位（§5.3） |
| `confideCorpus.test.js` | 池隔离 · 禁止回落 fallback |
| `confideReplyFlow.test.js` | 端到端：`I want to beat people` → 新路由 |
| `desktopCompanionL2Route.js` | `shouldUseDesktopCompanionGenerate` 排除新路由 |
| `confideCompanionPresence.js` | `shouldHandleConfideCompanionPresence` 排除新路由 |
| `main.js` | `onReplied`：新路由 **跳过** `playEmotion`（Idle only） |
| `ConfideToYinUI.js` | `data-route` 竖线 `#8b6f5c`；验收与 safety 并排可辨 |
| `SCENARIO_TESTS.md` | 新安全邻接场景步 |
| `docs/confide-corpus-seed.md` | 登记新池 |

**不改动**：`confideSafetyKeywords.js` · 情绪关键词表 · PR #561 复读锁 · `still.` 语料质量项。

---

## 七、单元测试计划（实现阶段）

### 7.1 正例（必须 → `aggression_toward_others`）

```text
I want to beat people.
I want to hurt him.
I want to punch someone.
thinking about hurting her
I wanna hit them
```

### 7.2 负例（不得 → `aggression_toward_others`）

```text
I want to beat this level          → fallback
I want to beat the other team      → fallback
I'm so frustrated                  → fallback 或情绪桶
I hate my job today                → fallback
I want to hurt myself              → safety_redirect
I don't want to live               → safety_redirect
I feel depressed. Can you help me? → sad
punch a wall                       → fallback
I'd kill for a coffee              → fallback
beat him at chess                  → fallback
```

### 7.3 优先级

```text
I want to kill myself              → safety_redirect（aggression 不得抢）
anxious and I want to hurt someone → aggression_toward_others（安全层未命中时）
```

---

## 八、冲突扫描（实现前 · 方案阶段）

对照 `SCENARIO_TESTS.md` 邻接场景：

| 轴 | 邻接场景 | 结论 |
|---|---|---|
| **a. 强度** | Confide 安全：`I don't want to live` → `safety_redirect` + 转介句 + 棕线 | 新路由同级安全层、非更重仪式；**无冲突** |
| **b. 语气** | fallback 禅意点头 · sad 承接 · boundary 不贴标签 | 新池刻意**去掉** Heard/nods，比 fallback 更克制；**无冲突** |
| **c. 职责** | `safety_redirect` 管自伤；情绪桶管无暴力负面情绪 | 职责切分清晰：他人暴力意象 **独占** 新路由；**无冲突** |

**邻接注意**：实现时须补 `SCENARIO_TESTS` 一步，与现有「安全：危机句 → safety-01」并列，避免 QA 只测自伤不测攻击他人。

---

## 九、交付节奏

| 阶段 | 交付物 | 状态 |
|---|---|---|
| **1 · 方案** | 本文档（规则 + 误判 + 拍板） | **✓ 完成** |
| **2 · 实现** | `fix/confide-aggression-toward-others` · 分类 + 占位语料 + 单测 | **待 `fix/confide-l3-repeat-fallback` 合 develop 后开工** |
| **3 · 扩池审定** | 03/04 正式文案 · 池 ≥4 条 · `review: ok` | 实现后 · 上线门禁 |
| **4 · 人工测** | tracker · 含连续触发 + 色条并排 + 无点头动画 | 扩池后 |

**明确不做（本 PR）**：`still.` / `Still watching.` 语料扩充 · 中文识别规则（除非方案拍板改 A） · 安全提示第二句（除非产品选定 §3.5）。

---

## 十、拍板记录（分析师 · 2026-09-04）

| 项 | 结论 |
|---|---|
| 流水线分层 | `safety_redirect` → `aggression_toward_others` → 情绪桶 → fallback ✓ |
| 多语言 | 本轮仅 EN 规则；zh/ja 占位 `[TBD]`，中文 fast-follow ✓ |
| 轻量转介 | 默认不加 ✓ |
| 文案优先级 | **02 首选** · 01 备选（非平权）✓ |
| 扩池门禁 | 上线前池 **≥4 条**；实现可先 2+2 占位 ✓ |
| 竖线色 | **Agg-2 `#8b6f5c`**；须与 safety 并排验收可辨 ✓ |
| 动画 | **候选 A** — 不 `playEmotion`，Idle 呼吸 ✓ |

### 附录 A · 占位文案（审定用）

**aggression-02（首选）**

| locale | 草稿 |
|---|---|
| en | `Something's really gotten to you.` |
| zh | `一定有什么让你很难受。` |

**aggression-01（备选）**

| locale | 草稿 |
|---|---|
| en | `That sounds like a lot of anger to carry.` |
| zh | `听起来你背负了很多怒气。` |

**aggression-03 / 04（扩池 · 方向锁）**

- 口语、留白、不直接贴 `anger` 等标签；风格对齐 02，非 01 咨询腔。  
- 实现轮可用 `[TBD]` 占位 id；**标 ok 前须替换为审定正文**。

**刻意避免**：`Heard` · `I understand` · `Yin nods` · 点头动作 · 危机转介句式。

---

*方案作者：Cursor Agent · 2026-09-04 · 方案 PR #563 · 实现：待 `fix/confide-l3-repeat-fallback` 合入后 `fix/confide-aggression-toward-others`*
