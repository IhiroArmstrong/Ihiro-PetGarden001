# COMPANION_CONTRACT.md — Yin 陪伴契约（措辞与开口 SSOT）

> **代号**：**T55** · 状态 **排队中** · 槽位 **可选**（不以「立即做」写本任务）。独立于 **T54**（仍搁置 · 未排期）。**不挡 T34**。  
> **类**：A 类（文档 + 后续 PR-3/4 静态检查；**本文件不改运行时**）。  
> **索引**：`RULES_INDEX.md` → `companion-contract`。  
> **Brief**：[`task-briefs/task-companion-contract.md`](./task-briefs/task-companion-contract.md)。  
> **PR-1 代码锚点盘点**：[`companion-contract-inventory.md`](./companion-contract-inventory.md)（按通道；禁止改成 L0–L3 阶梯）。  
> **日期**：2026-10-25（PR-2 契约正文；PR-3 字面检查）。

---

## 0. 大白话

Yin 什么时候可以开口、开口多轻、绝不该说什么，现网散在 DESIGN、编排器、文案池与 Confide 边界里。本文件是**唯一契约 SSOT**：十条红线、并行开口通道、措辞与字面检查边界。换模型、加文案、加介入点前须对照本文。通过未来的字面检查 **不等于** 模型不会越界，也 **不得** 对外声称「已验证的分级干预规范」。

现网是**并行通道**，不是一级升一级；禁止把产品写成「只升不跳」的阶梯。

---

## §A 红线（Yin 不做什么）

红线编号 C-01–C-10 为 PO 2026-10-25 拍板；条文本身不改。说明列写入契约，供 PR-3 检查器与写稿对照。

| 编号 | 红线 | 说明 |
|---|---|---|
| **C-01** | 不诊断、不定性 | 不说用户「焦虑 / 抑郁 / 注意力有问题」，不给情绪贴病理标签。 |
| **C-02** | 不打分、不排名、不报指数 | 不出现分数、心流指数、百分比**评价人**。**练习事实**（近日同坐环、莲花计入分钟、今日同坐进度条）是「这天有没有坐 / 坐了多久」，不是给人打分；字面检查器**不得**误伤。内部 `focusLevel` / `#hud-level` 与 Focusing 壳层计时见盘点 §3.2，**不是**常驻表现分。 |
| **C-03** | 不替用户下结论 | 不说「你今天状态不好」；只描述可观察的事，且用观察语气。 |
| **C-04** | 不催促、不制造愧疚 | **允许问候，禁止带缺席、天数、愧疚账。** 不拿连续天数、缺席、「你错过了」施压。归来问候锚句见 §B「归来问候」；**专注中邀请**与**离开后再聚焦提示**同样受 C-04 约束（可拒绝、不追问、不把切走说成罪过）。 |
| **C-05** | 不承诺疗效 | 不说「这会治愈你 / 让你好起来」。 |
| **C-06** | 不冒充专业 | 不以治疗师 / 医生 / 导师身份说话。 |
| **C-07** | 不制造依赖或排他 | 不说「只有我懂你」；不留人，不挽留。 |
| **C-08** | 不替用户做决定 | 邀请必须可拒绝；拒绝后不追问、不重复。 |
| **C-09** | 不外泄内部状态估计 | **硬规则。** 系统内部对用户状态的估计（含现网 `SETTLED` / `DRIFTING` / `STRUGGLING` 及编排态 `NEUTRAL` / `FLOW_PROTECT` / `AWAY_INVITE` / `LONG_SIT_INVITE` 等）**不得以任何形式显示给用户**；以后也不许接到界面上。只偏置结束低语选句与姿态。 |
| **C-10** | 危机话题不由陪伴话术承接 | 交给 Confide **安全线**；契约只写「交接点」，不重写安全逻辑、不并入危机样本。 |

**Confide 交接（只引用，不收编）**

- 危机识别、安全资源、产品问题不走情绪回复 → **C-10 交接点**；默认安全分级仍关，仍须专业复核。  
- 复述护栏 → **T32**（措辞边界可引用，发送链不在本契约重写）。  
- **诚实边界（强制）**：§C 的字面检查与 PR-3 脚本只覆盖**发布出去的固定文案**（locale、切片、登记池）。**字面检查管不到倾诉里现场生成的句子**（Confide 本地模型输出）；那里最可能越界。通过检查 ≠ 模型不会越界。

---

## §B 开口通道（Yin 什么时候开口，开口多轻）

现网是**并行通道**，不是 L0→L3 一级升一级。下表与 [`companion-contract-inventory.md`](./companion-contract-inventory.md) §1 一致；行号与测试以盘点为准。

| 通道 | 触发条件（摘要） | 冷却 / 限频 | 用户不理时 | 代码锚点（入口） | 相关红线 |
|---|---|---|---|---|---|
| **结束低语** | （1）Rise 且 ≥30s：观察分钟句。（2）打开 Reflection：按 T50 内部标签选 Moment 键（标签名不进界面）。与邀请 / Re-focus **并行**于 `#moment-whisper`。 | （1）每场 Rise 可再出。（2）Moment 键一生一次（`momentWhispersGate`）。busy 叠层跳过。 | ~3.5s 淡出；可点消；无追问。 | `sessionEndObservedDuration.js`；`main.js`；`MomentWhisperUI.js` | C-02、C-03、**C-09** |
| **专注中邀请** | Focusing + Here & Now：离开达标且本场 Re-focus 槽已用后，可问停一下；Flow/Offline 离开不邀；到点可 extend；长坐舒展可 `LONG_SIT_INVITE`。托盘收起不出。 | 1h 最多 1 次；两次主动开口间隔 ≥10min；`yieldBusy` 让位。 | 10s 自消；「先不用」同退；**不**自动开练习。 | `InterventionOrchestrator.js`；`AwakenInviteUI.js`；`awaken-invite.json` | **C-01 / C-04 / C-08**、C-09 |
| **离开后再聚焦提示** | Here & Now：切走再回；&lt;20s 静默；20–60s 只记账；&gt;60s 观察 toast 池 `REFOCUS_ACKNOWLEDGE_*`。Flow/Offline/托盘无。主动 Recover（点阿寅）不占本槽。 | 每场最多 1 次；与 mindful/stretch 合计每日提醒池 3 次；强情绪在场静默让位。 | toast 现网时长后自消；无追问、不加码成邀请。 | `AttentionSignals.js`；`MindfulReminderController.js`；`en.json` `REFOCUS_ACKNOWLEDGE_1–3` | **C-01 / C-03 / C-04**（离诊断与愧疚边界最近；**不是**诊断） |
| **到达后的安静句** | Arrival Practice **完成**后、Companion/Sit 前（非 Quick Start 跳过）；当日 Arrive 池一条；延迟 520ms。 | 同一次 Arrival 只出一次；句 id 按日历日锁定。 | ~6.2s 后淡出；可点消；无追问。 | `CalmActionArriveCardUI.js`；`CalmActionArriveStore.js`；`calm-action-wisdom/` | C-03、C-04（许可、非打分） |
| **归来问候** | 练习日有空档后再坐：**三条并行表面**（非阶梯），文案本身不带缺席天数、不说「你错过了」。（1）Journey `JOURNEY_MEMORY_COME_BACK`。（2）观察纸节奏第 5 句 `PRACTICE_PAPER_RHYTHM_5`。（3）成长旅程 `GROWTH_JOURNEY_RETURNED`。 | 各子表面规则见盘点 §1；非限时淡出邀请。 | 写在 Journey/纸上；无追问。 | `journeyPracticeMemory.js`；`practicePaperFacts.js`；`growthJourneyDetail.js` | **C-04**（允许问候、禁止带账） |

**文案池（不是升级阶梯）**

Quiet Line、Calm Action Wisdom、Moment Whisper 的露出方式、语气与禁扫描范围见 [`companion-contract-inventory.md`](./companion-contract-inventory.md) §2。Calm Action 内容细则仍 SSOT 于 [`CALM_ACTION_WISDOM.md`](./CALM_ACTION_WISDOM.md)。

### 通道硬规则

1. 被用户点头才进入短练习；邀请必须可拒绝（**C-08**）。  
2. 任何一条被忽略都只退、不加码（**C-04**、**C-08**）。  
3. **同一时刻只有一个开口**：保留为**目标**，标明**尚未实现**。现网多通道可并行；叠层让位走既有 `overlaySlotArbitration` / `yieldBusy` / `displayEligible` / `refocusSlotConsumed`；**本契约不另建、不改运行时仲裁**（盘点 S-03）。  
4. 邀请与 Re-focus 并行时靠门槛与让位错开，**不是**全局单开口锁。

---

## §C 措辞规则

### C.1 语气

- 观察式，不诊断式：描述发生了什么，不解释用户是什么人（**C-01**、**C-03**）。  
- 行动提示池（Calm Action）可许可、降门槛，不说教；观察式邻接仍以 `EMOTION_BIBLE.md` 为准。  
- 语言范围：**en 与 ja 为正式**，**zh 为草稿**（与对外只 claim en+ja 一致）。

### C.2 字面禁词（现网与 PR-3）

**现网已接线（窄）**——`AWAKEN_FORBIDDEN_COPY`，锚点 `InterventionOrchestrator.js`：

```text
/焦虑|分心诊断|心流指数|分数|\banxiety\b|\bflow index\b|\bscore\b/i
```

- **只**在 `InterventionOrchestrator.test.js` 扫 `locales/slices/awaken-invite.json`（en/zh/ja）。  
- **不是** C-01–C-10 全表。运行时邀请切片仍走这条窄正则。

**PR-3 字面检查（已接线 · 不改运行时）**

1. `npm run check:companion-contract`（并入 `docs:check`）：契约禁词表扫现网固定文案；存量命中走豁免表（只减不增）。  
2. **扫描顺序**：**先扫 Re-focus 池** `REFOCUS_ACKNOWLEDGE_*`，再 Quiet Line、Calm Action、Moment Whisper、结束分钟句、归来问候、邀请切片。  
3. 脚本每次输出须重复 §A「诚实边界」：**字面检查管不到倾诉里现场生成的句子**（Confide 本地模型输出）；通过检查 ≠ 已验证。  
4. 红线样本集见 §D：坏样本命中率与放行样本放行率分两行输出；合格线维持 1.0 / 1.0。比率是回归结果，不是覆盖率，也不是「已验证」；对外不能引用。

**存量报告（2026-10-25 · 本 PR 基线）**：Re-focus 9、邀请切片 15、Quiet Line 87、Calm Action 116、Moment Whisper 15、结束分钟句 3、归来问候 9。禁词命中 **0**。豁免表空（只减不增）。这不是「已验证」声明。

### C.3 允许的近邻说法（防误拦）

检查器与人工审稿须放行（非违规）：

| 近邻 | 为何放行 | 锚点 |
|---|---|---|
| 近日同坐环 / Recent days / 一天只亮一点 | 练习事实，非 C-02 打分 | `PracticeDaysStore.js`；盘点 §3.2 |
| 莲花计入分钟、成长旅程圆点 | 练习事实，非五维分数 | `LotusPondStore`；`GROWTH_JOURNEY.md` |
| 观察式「注意力出去走了一会儿」类 Re-focus 句 | 观察离座，非诊断、非愧疚账（PR-3 字面扫本池） | `REFOCUS_ACKNOWLEDGE_*` |
| 归来问候三锚句（Come back / Welcome back / You returned 及 zh/ja 对应） | **C-04**：允许问候、禁止带账 | 盘点 §1「归来问候」 |
| `GROWTH_JOURNEY_PAUSED`（歇过） | 练习事实空档标，不是问候带账 | `growthJourneyDetail.js` |
| 结束低语观察分钟 | 练习事实叙述（**C-02**） | `SESSION_END_OBSERVED_MINUTES` |

### C.4 存量缺口

S-01 / S-02（无契约级扫描）由本 PR 的检查器覆盖。S-03–S-05 仍见盘点 §5。改用户可见文案属 B 类，另走 Brief 与点头。

---

## §D 红线样本集规格（PR-4）

PR-4 交付 **42 条**回归样本（英文为主、日文夹英次之、一条中文草稿禁词），**不含危机类**（危机归安全线）。真源：`scripts/companion-contract-samples.js`。每条字段：`id` / 语言 / 场景 / 类别 / 绝不该说的话（`expect=hit` 的 `utterance`） / 方向（该怎么回，描述方向而非唯一句）。

**34/34 是回归结果，不是覆盖率，也不是「已验证」。** 样本按禁词表写成该拦就拦、该放就放；全中只说明防线还在，不能说明检查器覆盖得好。这个数字对外不能引用。放宽 1.0 / 1.0 会让误放行或误拦截悄悄溜走，故合格线维持两比率各 **1.0**（坏样本 **34/34**、放行样本 **8/8**），等 PO 书面改口前按此闸。

**日文目前实际上未覆盖。** 现有 `lang: ja` 行是日语夹着英文原词，为了命中 PR-3 已有英文字面；不声称覆盖日语口语。真正的日文样本要另做，并与日文文案同样走人审。中文一条仅作草稿。

检查器对样本集报告：**坏样本命中率**与**放行样本放行率**分开报告，不合成一个数。样本仅用于回归，不是盲测。样本卫生见 Brief §4。

| 类别 | 目标条数 |
|---|---|
| 诊断/定性（C-01） | 6 |
| 打分/指数（C-02） | 4 |
| 催促/愧疚（C-04） | 6 |
| 疗效承诺/冒充专业（C-05/06） | 5 |
| 依赖/排他（C-07） | 5 |
| 替人下结论/越权（C-03/08） | 5 |
| 内部状态外泄（C-09） | 3 |
| **边界邻近的正常说法（必须放行）** | 8 |

近邻放行须含：**近日同坐环悬停说明**（一天一个亮点，不是一场一个）与 **一条练习事实的分钟或天数句**，专门测 **C-02** 不误伤。归来问候锚句仍保留，但不能当作近邻的全部。

「已知漏网」（换说法的违规、字面抓不住）**不进合格线**，另开小任务，本步不做。

---

## 计划 → 现状 → 还差 → 下一步

| | |
|---|---|
| **计划** | PR-4 合入后补丁：近邻再加 2 条（同坐环悬停 + 分钟/天数练习事实）；§D 写明 34/34 是回归不是覆盖率/验证、对外不引用；写明日文未覆盖。 |
| **现状** | 42 条回归样本；闸 1.0 / 1.0（34/34 与 8/8）；零 `src/` 运行时改动。 |
| **还差** | 「已知漏网」一栏另开小任务，不挡本补丁；真正日文样本另做并走人审。 |
| **下一步** | 合入本补丁后，T55 文档+字面检查第一步收口。不挡 T34。不改队列热点文件。 |

---

## 冲突扫描（PR-4 样本集）

对照 [`FEATURE_CONFLICT_REVIEW.md`](./FEATURE_CONFLICT_REVIEW.md) 与场景 **B**（Re-focus）、近日同坐环 HUD 悬停、结束分钟句、归来问候。本补丁只加回归样本与口径，**不**把样本接到界面。**强度**：无新仪式。**语气**：无新用户可见文案。**职责**：通道仍并行。样本不是盲测、不是日文覆盖、不是安全线。
