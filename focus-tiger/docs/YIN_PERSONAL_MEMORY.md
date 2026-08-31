# Yin Personal Memory Architecture V1

> **状态（2026-08-24）**：**方向锁 · 只设计，不写存取代码。** 本文件是「阿寅关于这个人逐渐知道了什么」的产品 SSOT。  
> **不是**：练习记忆云备份、Journey Log、Confide `turns.jsonl`、用户微调 / LoRA、全面运行时对话。  
> **Don't save / opt-out 政策**：`YIN_PERSONAL_MEMORY_PERSISTENCE_POLICY.md`（Slice 1f · PO 2026-08-30）
> **口令**：实现另下「开工 Yin Personal Memory」；**禁止**本文件合入后默认开工 store / UI / prompt 接线。  
> **前置**：1.7B 生产默认接线 + 场景 AE 关单级「能聊」过关之后，再排 Remember / Use / Forget。现在把记忆写成一等公民，是为了以后不必回头补。

从属：`PRODUCT_POSITIONING.md`「禅意倾听者」· Brief `task-desktop-on-device-companion.md` · 场景 AE / Y / Z · `task-practice-memory-cloud-backup-a.md`（**对照、禁止混桶**）· `PRIVACY_NOTICE.md` · `PRINCIPLES.md`（观照者、不诊断、不制造焦虑、agency）。

---

## 0. 冲突扫描（实现前 · 本回合已写入边界）

对照 `SCENARIO_TESTS.md`。本文件**不**扩大 2026-08-18 窄例外。

| 轴 | 相邻场景 | 风险 | 本文件处置 |
|---|---|---|---|
| **a. 强度** | AE Confide；Y Whisper；Reflection | 记忆面板若比倾诉/完成仪式更重，会把陪伴做成档案柜 | V1 查看/Forget 为次级、自愿；**禁止**冷启动弹窗逼同意 |
| **b. 人设** | 观照者；安全阀 safety-01；情绪桶 corpus | 「阿寅记得你抑郁」= 诊断标签；编造事实 = 假生命感 | 危机/情绪桶永不入库；Memory ≠ 事实断言；不确定则不引用 |
| **c. 职责** | Z Journey Log；练习云备份 6 key；L2 `turns.jsonl` | 三套「记得」并存，用户分不清 | 下文 **§0.1 三套边界** 写死 |

**未拍板（禁止当路线图默认项）**：把 generate 接到 Reflection / Morning Check-in / Focus 完成 / Moment Whisper / Journey Log 润色。这些可以是**候选生命感场景**，须**单独扩权拍板**。见 §13。

---

## 0.1 Memory vs Journey Log vs `turns.jsonl`（硬边界）

三套都「留下痕迹」，职责不同。**禁止**互相冒充。

| | **Personal Memory**（本文件） | **Journey Log**（场景 Z） | **`turns.jsonl`**（L2 调试） |
|---|---|---|---|
| **用户看到什么** | 「阿寅记得什么」——可查看 / 改正 / Forget | 练习留痕列表（分钟、Arrive/Reflect、洞察小符号） | **默认不给用户看** |
| **记什么** | 抽取后的结构化条目：偏好、模式、有意义时刻、关系线索 | 「发生过什么练习」 | 该面板会话的原始回合（跑偏调 prompt） |
| **谁写** | 同意后的 Remember 管道（实现后） | Focus / Breath 完成且 Reflection 关闭 | Electron 主进程 companion L2 |
| **谁读** | 仅层 3 短生成前的检索注入；Forget UI | 人读；练习备份 6 key 之一 | 研发调试（`companion-debug`：禁止主张可读完整目录） |
| **云** | **永远 local-only**；**禁止**进练习快照 | 可进免费练习云备份 | **禁止**进备份、禁止上云 |
| **生命感** | 「它记得我」 | 「我坐过」 | 无产品叙事 |

一句话：Log 记**事**；Memory 记**怎么对待这个人更自在**；jsonl 记**模型刚才说了什么**（工程）。

---

## 1. 产品定位（专有陪伴从哪来）

专有陪伴 **不是**「用户在训练一个小模型」。V1 **禁止** fine-tune / 每用户 adapter。

```text
                    Yin
                     │
          ┌──────────┴──────────┐
          │                     │
    Local language layer   Personal Memory
    (Qwen 1.7B = 表达器)   (这个人的外部记忆)
          │                     │
          └──────────┬──────────┘
                     │
              Long-term Bond
         「Yin 越来越懂我」≠ 「Yin 在优化我」
```

内部用语：**Personalization** / **Yin learns about you**。禁止对用户说 training / fine-tune / 你的数据在教模型。

生命感三问（实现后才测第 3 问）：

1. **接住了吗？** unmatched 闲聊是否贴原句（AE 关单栏杆）。
2. **还像阿寅吗？** 短、承接、不建议、不诊断；危机与情绪桶零生成。
3. **像记得我吗？** 隔周同类情境出现**可核对**的回指；用户能在「阿寅记得什么」里看到同一条，并能 Forget。

第 3 问对应「理解我」。**共同成长**须守观照者：Memory 是「看见你的节奏」，不是教练进化系统。

---

## 2. 设计师 12 点（本文件逐条锁死）

| # | 题 | 口径 |
|---|---|---|
| 1 | 什么可以记 | 仅四类：Preference / Pattern / Meaningful Moment / Relationship cue。须可展示给用户。见 §3。 |
| 2 | 什么绝对不记 | 危机原文与转介；情绪桶命中的倾诉正文；诊断标签；未同意内容；模型编造；全文聊天默认全存。见 §4。 |
| 3 | Schema | 一条记忆 = 类型 + 可展示摘要 + 证据指针（非原文堆）+ confidence + freshness + 状态。见 §5。 |
| 4 | 生命周期 | proposed → active → superseded / forgotten。可修正，不是永久 key-value。见 §6。 |
| 5 | Confidence / freshness | 观察次数与新近度；低置信不注入生成；过期降权，不偷偷当事实。见 §7。 |
| 6 | 何时触发记忆 | 仅用户主动倾诉且已过安全/语料闸之后的候选；或系统**已有字段**（时长、模式计数）。禁止后台偷听全局。见 §8。 |
| 7 | 何时检索 | **只**在已经决定走层 3 短生成时。安全阀 / 语料桶命中 = **不检索、不注入**。见 §9。 |
| 8 | 如何注入 Qwen | 最多 N 条短摘要进 prompt；事实由系统给；禁止把 Memory 写成「用户就是抑郁症」。见 §10。 |
| 9 | 用户如何查看 | 明示同意后的「What Yin remembers」列表；Why 一句。见 §11。 |
| 10 | 用户如何 Forget | 列表 Forget + 用户口头「别再记这个」须真删。见 §11。 |
| 11 | Local-only 的数据边界 | 只留本机 Electron userData（实现时）；**不进**练习云备份 6 key；**不上**品味层 / 漏斗 / 支付云。见 §12。 |
| 12 | Memory 与 safety / corpus / Qwen 的优先级 | **Safety > Corpus > Memory 检索 > Qwen**。Memory **不得**抬过语料或安全阀。见 §9。 |

---

## 3. 什么可以记（V1 仅 4 类）

| 类型 | 记什么 | 可展示例句（语气） | 不记成 |
|---|---|---|---|
| **Preference** | 用户说过或反复表现出的对待方式 | You prefer quiet, short reflections. | 「用户性格内向」（标签） |
| **Pattern** | 重复出现的情境节奏（观察，可修正） | Mondays have often felt crowded for you. | 「User hates Mondays」（永恒事实） |
| **Meaningful Moment** | 系统或用户可核对的里程 | You completed a first 45-minute sit. | 编造「你在画创业项目」 |
| **Relationship cue** | 互动偏好（短句、不要马上给建议） | You like when Yin does not jump to advice. | 「依赖型人格」 |

操作只有三个：**Remember / Use / Forget**。V1 不做图谱 UI、不做社交分享、不做跨设备合并。

---

## 4. 什么绝对不记（硬）

下列内容 **永不**成为 Memory 条目，也不得作抽取源：

1. **危机 / `safety_redirect`**：含自杀、自伤、热线转介句、用户危机原文。阿寅在此只有固定 safety-01，**没有**「记得你那段低谷」。
2. **情绪桶命中全文**（anxious / tired / stuck / sad / scattered；`depressed` → `sad`）：这些回合走已审语料，**禁止**把「我好累 / 我抑郁」写成长期档案。
3. 临床 / 诊断标签（depression、ADHD、disorder…）——即使用户口头说过，V1 **也不**结构化入库。
4. 未点 Memory Consent 之前的任何抽取。
5. 模型幻觉：系统没有的字段（职业、作品名、家人）不得 Remember。
6. Confide / 仪式的**默认全文日志**当 Memory（那是 jsonl 或根本不存）。
7. 支付、邮箱、OTP、练习备份 token。
8. 未成年人相关推断（产品也不是儿童伴侣）。

**Remember 失败时静默不建条**，不要用 toast 说「没能记住你的痛苦」。

---

## 5. Memory Schema（逻辑形状 · 非实现）

实现时再定文件格式。逻辑上每一条 **active** 记忆至少包含：

| 字段 | 含义 |
|---|---|
| `id` | 稳定 id（Forget 用） |
| `kind` | `preference` \| `pattern` \| `moment` \| `relationship` |
| `summary` | **给用户看、也给模型看**的一句观察式摘要（不是诊断） |
| `evidence` | 指向「用户说过 / 系统记过」的**字段名或回合 id**，**禁止**默认内嵌危机原文 |
| `confidence` | `low` \| `medium` \| `high`（重复观察可升；单次闲聊默认 low） |
| `firstSeenAt` / `lastSeenAt` | freshness |
| `status` | `proposed` \| `active` \| `superseded` \| `forgotten` |
| `sourceRoute` | 须为允许源（例：`confide_fallback` / `system_session_fact`）；**禁止** `safety_redirect` / 情绪桶 route |

**Memory ≠ Fact**：用户说 “I hate Mondays” → 存「曾多次把周一描述得挤」，confidence 随重复上升；三个月后 “I kind of like Mondays now” → **supersede**，不是并排两条互斥真理。

条目上限（产品意图）：宁可少。建议量级 **数十条 active**，不是无限聊天库。超出则只保留高 confidence + 新近。

---

## 6. 生命周期

```text
（Consent on）
候选抽取 → proposed（用户可在列表里确认；V1 也可自动升 active，但必须能 Forget）
         → active
         → 新观察矛盾 → superseded（旧条保留状态，不再 Use）
         → 用户 Forget → forgotten（真删摘要与证据，禁止软删复活）
```

卸载 App / 清 userData = 记忆没了。这与练习云备份**故意不同**：Memory **不**提供云恢复。产品文案以后若写「阿寅记得你」，须同时诚实：**只在这台桌面设备上**。

---

## 7. Confidence 与 freshness

| 规则 | 口径 |
|---|---|
| 注入门槛 | `low` **不**进 Qwen；`medium` 仅当本轮用户话与摘要主题明显相关；`high` 仍须主题相关 |
| 过期 | 长期无再次观察 → 降 confidence，不继续当「现在仍如此」 |
| 禁止 | 用高 confidence 覆盖安全阀；用过期 Pattern 说教「你总是周一崩溃」 |

---

## 8. 何时触发 Remember（抽取）

V1 **允许的抽取时机**（仍不写代码，只锁门闩）：

- Electron 宽屏 Confide，且本轮路由已是 **层 3 候选或已生成**（安全/情绪桶**未**命中）。
- 系统已有、可核对的字段：例如达标时长档、首次 45 分（须真有 session 记录）。
- 用户在 Memory UI **主动**改写一条（那是 Remember 的人写路径）。

**禁止**：Arrival / Whisper / Recover / 提醒 / 情绪桶语料回合上的自动抽取；Focusing 中后台抽；Web / 窄屏 / 低配（那些路径根本没有层 3）。

抽取可用小模型，但抽取器 **不得**把诊断词写进 `summary`。宁可不记。

### V1 运行时抽取规则（透明清单 · 2026-09-01）

Allow 只开抽取门闩。列表 **不是** 聊天记录，也 **不是** L3 答句。当前实现是 `matchYinMemoryRememberRule`（`yinPersonalMemoryRemember.js`）：只读**用户句**，命中下面**很少几条英文规则**才写入 `memories[]`。对不上 = L3 仍可回答，**不**入库。

| ruleId | 用户句须同时满足（英文，大小写不敏感） | 写入 kind / summary |
|---|---|---|
| `relationship-no-advice` | don't/do not/rather not … advice/fix/solutions，或 no advice / not looking for advice | relationship · You like when Yin does not jump to advice. |
| `preference-quiet-short` | prefer/like/want/need/love **或** keep it/stay … **且** quiet/short/gentle/simple/soft/brief | preference · You prefer quiet, short reflections. |
| `pattern-monday-crowded` | 含 monday(s) **且** hard/tough/crowded/heavy/rough/stress(ed/ful)/overwhelm | pattern · Mondays have often felt crowded for you. |
| `pattern-monday` | 含 monday(s)，但没有上一行的拥挤词 | pattern · Mondays have come up when you check in. |
| `pattern-need-reset` | need(s/ed) 与 reset 在约 32 字内互见 | pattern · You have named needing a reset. |
| `pattern-not-focusing-today` | don't/do not … feel like/want to/up for … focus | pattern · Some days focusing has not felt available. |
| `pattern-morning-shift` | until this morning，**或** was doing/going … well/ok/fine … until/before | pattern · A morning has shifted after things had been going well. |

**仍不写**：危机/诊断词；情绪桶路由；练多久等事实工具；中文闲聊（如「彤彤儿爱吃什么」）；请求当下陪伴但不是关于「你是怎样的人」的句（如 `Can we just sit here for a minute?`）；把 Yin **答句**当成记忆。

**中文抽取排期（2026-09-01）**：**V1 有意不做**（英文规则表不是漏测）。下一 Slice 触发：英文 AG 面板/抽取人工复测过关后，开独立 `feature/yin-memory-zh-extract`。L3 答句始终不入库。

面板若已打开，Remember 成功后须 **刷新列表**（与 Forget 对称），不得让用户关了再开才看见。

---

## 9. 何时检索 · 生成注入优先级（硬）

生成路径锁死为：

```text
Safety（固定转介；不调模型、不读 Memory）
  > Corpus / 情绪桶（已审句；不读 Memory）
  > Memory 检索（仅此时）
  > Qwen 1.7B 短生成
```

对应现有四层：0 安全 → 1 仪式已审文案 → 2 Confide 语料桶 → 3 仅 Electron 宽屏短生成。

**Memory 只活在第 3 层之前的那一小步。** 第 0 / 1 / 2 层命中 = 检索器不运行。失败 / 人设违禁仍回语料 fallback，**禁止**用 Memory 硬撑一句生成。

层 1 仪式场景 **仍检索不生成**（2026-08-18）。即使将来 Memory 已有条目，也 **不得**用记忆去改 Whisper / Recover / Reflection 已审句——除非 §13 扩权拍板。

---

## 10. 如何注入 Qwen prompt

只在层 3：

1. 取本轮用户句 + 最多 **3** 条相关 `active` 且过门槛的 `summary`。
2. 指令仍是：短、暖、承接、不建议、不诊断、不呼吸教练、不编造 Memory 里没有的事实。
3. 允许的回指例：「Monday again. I remember these tend to feel a little crowded for you.」
4. 禁止：「As your therapist who diagnosed…」；禁止引用危机原文；禁止把 Pattern 说成永恒缺陷。

无相关记忆 = 今天的 unmatched 短生成，**不要**硬插无关旧条（那是假懂你）。

---

## 11. Consent、查看、Forget

**Consent（必须先有，再 Remember）**

- 明示：Yin remembers a few things that help me understand you better — **on this device only**。
- 默认关或首次 Confide 层 3 前轻问一次；拒绝 = 永不抽取。
- **禁止**把练习备份同意、Privacy 漏斗 opt-in、Newsletter 当成 Memory 同意。

**查看**

- 「What Yin remembers」列表：摘要 + 类型；可选 Why（「from what you said on … / from a sit you finished」）。
- Edit = 改摘要或 Forget 后重写；用户改的比模型抽取优先。

**Forget**

- 列表 Forget：**真删**。
- 用户说 “I don't want Yin to remember that.” → 对应条 forgotten，回复只需承认忘掉，不讲教。
- forgotten 条 **禁止**再进检索。

0–1 秒：点 Forget 须立刻从列表消失或进入确认中状态；不得点了没反应。实现时再挂控件。**本文件不新增可点运行时。**

---

## 12. Local-only 数据边界（硬）

| 可以 | 不可以 |
|---|---|
| 本机 Electron userData（实现时另定目录名，ASCII kebab-case） | `PRACTICE_BACKUP_KV` / 练习快照 6 key |
| 用户本机 Forget / 卸装清除 | 品味层、意愿漏斗、支付 OTP、Newsletter |
| 与 Web Safari 分库（换壳空库是预期） | 匿名 device id 把 Memory 同步到第二台 |

练习备份白名单 **不得**默默加上 Memory 或 `turns.jsonl`。若未来有人提议「Memory 也要防 ITP 丢失」，那是**新产品决策**（会削弱「倾诉留在设备上」），须另拍板，默认 **不**做。

Privacy 卖点继续是：Some conversations can stay on your device. **不是**「我们用了 1.7B」。

---

## 13. 仪式场景生成 · 未拍板

下列 **适合 1.7B 能力圈**，但 **2026-08-18 仍禁止 generate**。本架构把它们标为候选，**不是** Phase 3 自动开工：

- Reflection 后一句共鸣
- Morning Check-in 短回应
- Focus 完成后微型回应
- Moment Whisper 个性化变体
- Journey Log 一句摘要（且不得生成系统没有的事实）

**我认为最合理的是：** 先用 Confide 层 3 +（实现后的）Memory 回指证明生命感，再单独问要不要把窄例外扩到仪式润色。
较弱：现在按设计师 Phase 3–6 排期写生成——会把「阿寅乱说话」从一条入口扩到一整天。

从仪式**抽取** Memory（例如用系统字段「完成了 25 分」记 Meaningful Moment）**可以**在不扩 generate 的前提下另议；从仪式**用户散文**抽取须更严，且仍禁情绪桶/危机。未另下口令 = **不做**。

---

## 14. 明确不做（V1）

- 用户微调 Qwen / 每用户 adapter（可留 V2/V3 一句话，不占任务位）
- 开放域问答、心理咨询、让模型改状态机
- Web / 窄屏 / ≤8GB 上的 Memory+生成
- 主动开口「我记得你该坐了」（提醒文案仍已审）
- 把 Memory UI 做成第二本日记或替代 Journey Log
- 实现本文件的 store / IPC / 面板（须口令）

---

## 15. 实现顺序（设计意图 · 非本 PR）

1. 1.7B runtime spike（并行工程；不改本文件职责）。
2. 生产默认切 1.7B + AE「能聊」关单。
3. 口令「开工 Yin Personal Memory」：
   - **Slice 0（2026-08-25 开工）**：Confide「How long have I practiced? / 练了多久」用本机练习字段（`PracticeDaysStore` 天数 / 累计分钟）精确应答；禁止 Qwen 编造时长。Brief `task-yin-memory-slice-0-practice-facts.md`。不另建账本、不进练习云备份。
   - 其后：Consent + 4 类 schema + Remember/Use/Forget + 仅层 3 注入。
4. **另拍板**才考虑仪式润色。

生命感验收不看「AI 功能数量」，看三问。

---

## 权威交叉

- 禅意倾听者 / 四层路由：`PRODUCT_POSITIONING.md`
- 桌面窄例外：`task-briefs/task-desktop-on-device-companion.md`
- 练习云备份（对照禁混）：`task-briefs/task-practice-memory-cloud-backup-a.md` · `SHARED_RESOURCES.md`
- 场景 AE / Y / Z：`SCENARIO_TESTS.md`
- 编排层（何时沉默 / 政策档 / State Pack）：`YIN_PERSONALIZATION_ENGINE.md`（2026-08-26 方向锁；不替代本文 store 规则）
- 调试 jsonl：`.cursor/rules/focus-tiger-companion-debug.mdc`
