# Confide · `observation_honesty` 桶枚举审计 + C2 确定性 rollup 扩容结论

创建日期：2026-09-06  
权威路径：`focus-tiger/docs/confide-observation-honesty-bucket-audit.md`  
Task Brief：`task-briefs/task-confide-observation-honesty-audit.md`  
关联：C1 `#587` · CI-00 · CI-02 · CI-03 · `CONFIDE_EXECUTABLE_INTENTS.md`

---

## 0. 执行摘要

| 结论 | 说明 |
|---|---|
| **无运行时自由判断层** | 任何升级必须是**显式 regex 枚举** + **确定性 handler**；禁止「有数据就自动改答」的通用语义层（方案 C）。 |
| **诚实边界桶应系统性变窄** | 可映射到 Journey / Presence ledger 的问法 → 新开或扩展现有 CI regex；不可映射的人格/综合判断 → 永久 `observation_honesty`。 |
| **Kelly 两句默认仍属 meta** | `What have you noticed about me?` / `I wonder what patterns you've picked up on.` 的**语义**是模式总结，不是 CI 事实问；C1 诚实拒答**仍正确**。 |
| **C2 可选增强（CI-04）** | 若 PO 批准：对**冻结的 Kelly 句型列表**在 rollup 数据足够时并列输出 CI-00/02 已有模板片段；不足时**回退 C1**——不是 L3，不是百分比/进步评判。 |
| **用户举例的「50% / 比上周开心」** | **禁止**作为产品答句；练习用两窗并列（CI-00 `COMPARE`）；情绪用标签分布并列（CI-02 `COMPARE`），不用「happy / improved / 50%」。 |

---

## 1. 枚举清单（现网 + 测试锚 + 可预见变体）

来源：`confideObservationHonesty.js` · `confideObservationHonesty.test.js` · C1 Brief · Phase 2B B9/B10 · Phase 1B 负例 · `LOCAL_AI_SCENARIOS_V1.md` observation-boundary 标注 · ISSUE_LEDGER 行 22 · 本会话 PO 反馈。

### 1A · 已入现网 `OBSERVATION_META_QUERY_RES`（7 条 regex 族）

| id | 代表句（en/zh/ja） | 现网路由 |
|---|---|---|
| O1 | `What have you noticed about me?` | `observation_honesty` |
| O2 | `I wonder what patterns you've picked up on.` | `observation_honesty` |
| O3 | `What have you noticed lately?` | `observation_honesty` |
| O4 | `what you've noticed about me` | `observation_honesty` |
| O5 | `patterns you've picked up`（无 wonder 前缀） | `observation_honesty` |
| O6 | `你观察到我什么` / `你观察的什么` | `observation_honesty` |
| O7 | `你摸到…模式` | `observation_honesty` |
| O8 | `どんなパターン/傾向…気づ/掴` | `observation_honesty` |

### 1B · 相邻已测句型（**不**在 observation regex，但用户常混问）

| id | 代表句 | 现网路由 | 与 observation 桶关系 |
|---|---|---|---|
| N1 | `How has my mood been over the last couple of weeks?` | `presence_facts` | Phase 1B 负例 · **不得**进 observation |
| N2 | `Have I been showing up consistently?` | `practice_facts` | Phase 1B 负例 |
| N3 | `Show me what you remember` | `memory_list` | CI-03 |
| N4 | `What have you learned about my preferences so far?` | `preference_honesty` | 偏好诚实 |
| N5 | `Am I practicing longer than before?` | `practice_facts` | 用户期望的「增减」应问此句，非 Kelly |
| N6 | `What has my mood looked like recently?` | `presence_facts` | 用户期望的「情绪趋势」应问此句 |
| N7 | `Have I been more steady lately?` | `presence_facts` | 两窗并列，禁「你更稳了」 |

### 1C · 可预见变体（尚未入 regex · 本轮追加到审计）

| id | 代表句 | 备注 |
|---|---|---|
| F1 | `What have you noticed about me lately?` | O1+时间副词；语义仍 meta |
| F2 | `What patterns have you noticed in how I practice?` | 域限定「练习」→ 可数据化 |
| F3 | `What have you noticed about my mood?` | 域限定「情绪」→ 可数据化 |
| F4 | `What kind of person am I to you?` | 人格综合 · 不可数据化 |
| F5 | `Do you think I'm getting better?` | 进步评判 · 不可数据化 |
| F6 | `你比上周开心吗` / `Am I happier than last week?` | PO 红线 · 不可数据化 |
| F7 | `你最近状态怎么样` / `How am I doing overall?` | **灰区** · 本轮保守 → 待 PO |
| F8 | `What have you learned about me?`（非 preference） | 综合人格 · 不可数据化 |
| F9 | `Summarize what you know about me` | 模式总结 · 不可数据化 |
| F10 | `你对我有什么印象` | 人格印象 · 不可数据化 |

---

## 2. 三分类结论表

图例：**P** = 练习数据 · **M** = 情绪/Presence 数据 · **X** = 不可覆盖（诚实拒答） · **G** = 灰区待 PO · **→CI** = 建议新开/扩展 CI · **保持** = 维持 `observation_honesty`

| id | 归类 | 理由 | 建议动作 | 优先级 |
|---|---|---|---|---|
| O1 | **X**（meta） | 问的是「你对我的综合模式」，不是 Journey/Presence 字段 | C1 **保持**；可选 C2 CI-04 rollup（见 §4） | PO 裁定 |
| O2 | **X**（meta） | 同上 · B10 | 同 O1 | PO 裁定 |
| O3 | **X**（meta） | 「lately」修饰的是 Yin 的观察，不是用户 self-report mood；Phase 1B 已锁为不得 CI | **保持** observation_honesty | — |
| O4 | **X** | O1 变体 | **保持** | — |
| O5 | **X** | O2 变体 | **保持** | — |
| O6 | **X** | 中文 meta 综合 | **保持** | — |
| O7 | **X** | 「模式」= 人格模式，非 ledger 统计 | **保持** | — |
| O8 | **X** | 日文 meta | **保持** | — |
| F1 | **X** | O1 + lately | **保持** | — |
| F2 | **P** | 域 = practice · 可取 Journey 两窗/ showing up | **→CI-05** 新 regex → `practice_facts` 家族 | P2 |
| F3 | **M** | 域 = mood · 可取 Presence ledger | **→CI-06** 新 regex → `presence_facts` TREND | P2 |
| F4 | **X** | 人格类型问 | **保持** · 不进 CI | — |
| F5 | **X** | 进步评判 | **保持** | — |
| F6 | **X** | PO 红线 happy/improved | **保持** | — |
| F7 | **G** | 可能 = practice+mood 混合或人格 | **待 PO**；默认 **保持** | P3 |
| F8 | **X** | 综合「了解我」 | **保持** | — |
| F9 | **X** | summarize = 模式引擎 | **保持** | — |
| F10 | **X** | 印象 = 人格 | **保持** | — |
| N5 | **P** | 已有 CI-00 | **无需动** · 引导用户改问法 | P0 发现性 |
| N6 | **P/M** | 已有 CI-02 | **无需动** | P0 |
| N7 | **M** | 已有 CI-02 COMPARE | **无需动** | P0 |

---

## 3. 永久留在 `observation_honesty` 的句型（PO 拍板前默认）

以下**不应**因「账本有数据」自动升级为数据答句（除非 PO 单独批准 CI-04 仅覆盖 O1/O2 子集）：

- O1–O8 全部现网 regex 族（含 `What have you noticed lately?`）
- F1、F4–F6、F8–F10
- 灰区 F7（默认保守）

**C1 审定句不变**：承认无模式总结引擎 · 指向 What Yin remembers · 不是模式报告。

---

## 4. C2 确定性 rollup · 新 CI 模板设计草案（仅设计 · 不实现）

### 4.1 CI-04 · `query_observation_rollup`（C2 · 可选）

| 字段 | 设计 |
|---|---|
| **触发** | **冻结枚举** regex 列表——默认仅 O1+O2（Kelly）；**不得**用「任意 meta 句 + 运行时判数据」 |
| **数据源** | 复用 `buildPracticeFactsReply`（`COMPARE_VOLUME` 或 `SHOWING_UP` kind）+ `buildPresenceFactsReply`（`TREND` 或 `COMPARE` kind）；**只读** Journey + `presence-signals.v1` |
| **输出** | 0–1s 模板拼接：段 1 练习事实（若有）+ 段 2 Presence 事实（若有）；**禁止**合成第三段「总结」；**禁止** L3 |
| **阈值** | 练习：`PRACTICE_USUAL_MIN_SESSIONS` 或 compare 两窗各 ≥1 条（与 CI-00 一致）；Presence：`PRESENCE_SIGNALS_MIN_TREND_COUNT`（与 CI-02 一致） |
| **空态/不足** | **回退** `formatConfideObservationHonestyReply`（C1 审定句）——**不是**编造 |
| **data-source** | 建议 `observation_rollup`（与 `observation_honesty` 区分，便于 tracker） |
| **措辞约束** | 仅允许 CI-00/02 已有 locale 键的 fill 文本；**禁止**新增「50%」「happier」「getting better」「你更稳了」 |
| **层序** | `preference_honesty` 之后 · 在 `matchConfideExecutableTool` 之前；**仅**当 regex 命中 CI-04 列表 |

**draft en 结构（示意 · PO 改字）**：

```text
[Optional practice paragraph from CONFIDE_PRACTICE_FACTS_COMPARE or SHOWING]
[Optional presence paragraph from CONFIDE_PRESENCE_FACTS_SUMMARY or COMPARE]
[If both missing: full CONFIDE_OBSERVATION_HONESTY only]
```

### 4.2 CI-05 · `query_practice_pattern`（P2 · 域限定练习）

| 字段 | 设计 |
|---|---|
| **触发 regex（草案）** | `\bpatterns?\b.*\b(how\s+i\s+practi[cs]e|my\s+practice|showing\s+up)\b` · `/练习.*模式/` |
| **路由** | 扩展现有 `confidePracticeFacts.js` · `SHOWING_UP` 或 `COMPARE_VOLUME` kind |
| **data-source** | 现有 `practice_facts` |
| **空态** | 现有 `CONFIDE_PRACTICE_FACTS_*_INSUFFICIENT` |
| **与 observation 关系** | 命中后**移出** observation 桶（regex 互斥） |

### 4.3 CI-06 · `query_mood_observation`（P2 · 域限定情绪）

| 字段 | 设计 |
|---|---|
| **触发 regex（草案）** | `\bwhat\s+have\s+you\s+noticed\s+about\s+my\s+mood\b` · `/你观察.*我的?(情绪|心情)/` |
| **路由** | 扩展现有 `confidePresenceFacts.js` · `TREND` kind |
| **data-source** | 现有 `presence_facts` |
| **空态** | `CONFIDE_PRESENCE_FACTS_INSUFFICIENT` |
| **禁止** | 「比上周开心」类评判——即使 regex 误吸也必须 negative test 挡掉 |

---

## 5. 与用户反馈的对照

| 用户期望 | 审计结论 |
|---|---|
| 「练习时间增加了 50%」 | **不应**作为 Yin 句；应引导问 `Am I practicing longer than before?` → CI-00 两窗并列分钟/次数 |
| 「比上周开心」 | **禁止** · 维持 observation_honesty 或 CI-02 描述性 breakdown，不用 happy/improved |
| Kelly 句有数据时应答数据 | **仅**在 PO 批准 **CI-04** 且 regex **显式枚举** O1/O2 时可并列 CI-00/02 片段；否则 C1 正确 |
| 诚实边界桶变窄 | CI-05/06 把域限定句型迁出 meta 桶；meta 核心句型永久收窄或 optional rollup |

---

## 6. 冲突扫描（对照 `SCENARIO_TESTS.md`）

| 轴 | 相邻场景 | 判断 |
|---|---|---|
| **强度** | AE 步 9 Phase 1B · C1 行 | CI-04/05/06 仍为 0–1s 模板；不增加 L3 等待 · **无冲突** |
| **人设/语气** | CI-00/02 已有「禁止进步评判」 | 新草案**复用**已有 locale 键，不自创新语气 · **无冲突** |
| **职责** | `memory_list` / `preference_honesty` / `companion_presence` | 新 CI 只读 ledger；不 synthesize memory · **无冲突** |
| **方案 C 红线** | Gate 0.D · C1 Brief | 本设计**无**运行时自由判断、**无** L3 · **无冲突** |

---

## 7. PO 拍板清单（实现前必答）

| # | 问题 | 选项 |
|---|---|---|
| 1 | Kelly O1/O2 是否批准 **CI-04 rollup**？ | A 保持 C1 only · B 有数据时 CI-04 · C 延后 |
| 2 | **F2/F3** 是否批准 **CI-05/06** regex 扩面？ | Y/N 分批 |
| 3 | 灰区 **F7** 归哪类？ | observation_honesty / 待观察 / 拆成两句引导 |
| 4 | CI-04 是否单独 `data-source=observation_rollup`？ | 建议 Y（便于 tracker） |
| 5 | verbal chips 是否加「练习对比 / 情绪趋势」引导？ | 发现性 · 非本审计实现 |

---

## 8. 建议实现批次（审计后 · 每批独立 PR）

| 批次 | 范围 | 依赖 |
|---|---|---|
| **Batch 0** | verbal chips / Hint 指向 N5/N6（发现性） | 无 |
| **Batch 1** | CI-04 rollup（若 PO=1B）· O1/O2 only | C1 已 ship |
| **Batch 2** | CI-05 + CI-06 regex · 互斥 observation | Batch 1 或 PO 跳过 1 |
| **Batch 3** | F7 裁定 + i18n 全量 | PO 答案 |

**禁止**：把 Batch 1–3 与 C1 关单或本审计文档混进同一代码 PR。

---

## 9. 参考文件

- `src/core/confide/confideObservationHonesty.js`
- `src/core/confide/confidePracticeFacts.js`
- `src/core/confide/confidePresenceFacts.js`
- `docs/task-briefs/task-confide-observation-honesty-mvp.md`
- `docs/CONFIDE_EXECUTABLE_INTENTS.md`
- `docs/LOCAL_AI_SCENARIO_EXPANSION_PO_DECISION.md`（Bounded Temporal Compare 修正案）
