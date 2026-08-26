# Local AI Layer — Scenario Expansion Design Review

**状态（2026-08-26）**：会审工作表 · **未拍板** · 不改写现锁政策。  
**会议名**：Local AI Layer — Scenario Expansion Design Review  
**目标**：确定 Local AI 应进入哪些**已有用户时刻**，以及进入后增加什么**用户价值**。  
**不是**：再列几个 CI 指令；也不是「L3 已经能 generate，还能接到哪」。

**规划工程 SSOT（拍板后才改）**：`LOCAL_AI_SCENARIOS_V1.md` · `CONFIDE_EXECUTABLE_INTENTS.md`  
**邻接剧本**：`SCENARIO_TESTS.md` 场景 Y / X / X2 / Z / AE / AF / AG / S  
**人设**：`PRODUCT_POSITIONING.md`「禅意倾听者」· `EMOTION_BIBLE.md`

---

## 0. 会审分层（顺序强制）

| 层 | 谁拍 | 问题 |
|---|---|---|
| **1 · 产品** | 设计师 / 产品 | 用户需要什么？哪些时刻**只有「理解用户」才有增量**？ |
| **2 · 设计** | 设计师 | 回答 / 检索 / 执行 / 主动？强度与发起权？ |
| **3 · 工程** | 实现 | 才映射到轨道 **A CI** / **B L3 注入** / **C 仪式 generate** |

禁止倒过来：禁止「已有 generate 能力 → 找场景接进去」。

---

## 0.1 命名：不要和现有 L0/L1/L2/L3 混谈

| 本表能力阶梯 | 含义 | **不是** |
|---|---|---|
| **C0 Understand** | 只理解，不说话、不改数据 | YPE L0 门闩 |
| **C1 Respond** | 理解后给阿寅一句回应 | Electron 陪伴 **L2** 壳 |
| **C2 Retrieve** | 读用户自己的本地账本，模板或短句 | 路由层 **L3** 短生成 |
| **C3 Execute** | 改本地数据（Forget / 关 Consent 等） | YPE L2 Pack |
| **C4 Autonomous** | 系统自己判断「现在该说/该做」 | — |

现网路由仍是：`Safety → 仪式语料 → 情绪桶 → CI 白名单 → L3`。本表 **C0–C4** 只描述**产品权限**。

---

## 1. 五个根本问题（先书面答完，再填场景表）

### Q1 · 用户最终把 Local AI 理解成什么？

三选一（**不是一回事**）：

| 角色 | 一句话 | 主要入口 |
|---|---|---|
| **Confide Assistant** | 用户想说话时，阿寅能听懂、回答、记住 | 几乎只在 Confide |
| **Personal Companion Intelligence** | 用户不一定打开 Confide，阿寅也能理解当刻并极轻回应 | Reflection / Recover / Journey 等 |
| **Natural Language Control Layer** | 用户不必学 UI，直接告诉阿寅要做什么 | 「忘掉」「别记」「删今天这条」 |

**设计师填**：□ 助手  □ 理解层  □ 控制层  □ 其它：________  
**一句产品定义**：________________________________

对照草案（**非锁**）：「Local AI 不是一个 AI 功能，而是阿寅的理解层；Confide 只是最明显的入口。」  
对照现锁：`LOCAL_AI_SCENARIOS_V1.md` 仍写 **桌面窄例外**、**≠ 全 App Operating Layer**。若选「控制层」或「全产品理解层」，须**明示推翻或收窄**该句，不能两份口径并存。

---

### Q2 · 不要问「AI 能去哪」，问「用户在哪里需要被理解」

对每个时刻：固定 UI / 已审语料是否已经够？是否存在**只有理解用户才能解**的需求？  
不够 → 才允许 AI。够 → **不要为了 AI 而生成化**（例：X2 摸头、Recover 点头+观察短句）。

---

### Q3 · 若不用 AI，普通 UI + 固定语料能否很好解决？

能 → 不进 Local AI。  
典型「固定语料很难」的例子（供对照，非清单）：「最近是不是一直很焦虑？」（仍禁止诊断）、「昨天那句我改主意了」、「这句话不要记住」、「这两周是不是越来越容易专注？」（只允许描述性账本，禁止进步百分比）。

---

### Q4 · Local AI 的权限天花板？

**设计师填（建议：MVP 只到 C2 + 少量 C3）**：

| 级 | 允许？ | 备注 |
|---|---|---|
| C0 Understand | □ 是 □ 否 | |
| C1 Respond | □ 是 □ 否 | |
| C2 Retrieve | □ 是 □ 否 | |
| C3 Execute | □ 是 □ 否 · 哪些动作：________ | |
| C4 Autonomous | □ 是 □ 否 | 对照草案：**现在不要开放** |

---

### Q5 · 哪些场景允许阿寅主动说话？

四档（从体验问，不从 generate 问）：

| 主动程度 | 设计师 | 对照草案 |
|---|---|---|
| 用户打开 Confide | □ | ✅ |
| 用户点击 Recover / 提交 Reflection | □ | ✅ |
| 用户正在填 Reflection，AI 根据内容回应 | □ | ✅ 可考虑 |
| 阿寅自己判断「现在该跟你说点什么」 | □ | ⚠️ 暂不开放 |

原则草案：「AI 可以增强用户主动打开的时刻，但暂时不要获得寻找用户说话的权力。」  
现锁已禁止把桌面窄例外扩大到 **Web / Whisper / Recover generate / 主动开口 / 窄屏**（见 `FEATURE_CONFLICT_REVIEW.md`「检索不生成 vs 桌面陪伴」）。若本会批准 Recover/Reflection **生成**，须**单独书面推翻**该条的对应子项。

---

## 2. 场景表（本会主交付 · 逐格填）

**AI 做什么**只填：对话 / 反映 / 查询解释 / 个性化一句 / 描述趋势 / Remember-Forget / 不需要。  
**MVP**：✅ 本季做 / ? 候选 / ❌ 不进入。

| Existing Moment | 用户现在想完成什么？ | 当前 UI 是否已经足够？ | AI 是否增加独特价值？（★） | AI 做什么？ | 用户主动还是阿寅主动？ | 读取什么？ | 能否修改数据？ | MVP |
|---|---|---|---|---|---|---|---|---|
| Confide | 被理解 / 表达 | | | | | | | |
| Memory（面板 + 口头） | 管理记忆 | | | | | | | |
| Presence | 理解最近状态 | | | | | | | |
| Journey | 理解自己的轨迹 | | | | | | | |
| Reflection | 回顾自己 | | | | | | | |
| Recover（主动点阿寅） | 找回注意力 | | | | | | | |
| Arrival | 开始一天 | | | | | | | |
| Breath | 仪式体验 | | | | | | | |
| Moment Whisper | 仪式感（一生一次） | | | | | | | |
| Celebrating | 完成确认 | | | | | | | |
| Focusing（基础陪伴） | 同坐 | | | | | | | |
| （可加行） | | | | | | | | |

对照草案（**仅供会上对比，不是填好的答案**）：

| 时刻 | 草案价值 | 草案 MVP |
|---|---|---|
| Confide / Memory | ★★★★★ · 对话 + Remember/Forget | ✅ |
| Reflection | ★★★★ · 照见，不给建议 | ? |
| Journey / Presence | ★★★★ · 帮你看自己的记录 | ? |
| Recover | ★★ · 个性化一句 | ? |
| Arrival / Whisper / Breath / Celebrating / 基础 Focusing | ★ · 仪式本身 | ❌ **AI MUST NOT ENTER** |

---

## 3. 四个会后交付物（填完才算会开完）

### Deliverable 1 · Local AI Scenario Map

- **Core（进）**：
- **Candidate（候选）**：
- **Do not enter（AI MUST NOT ENTER）**：

### Deliverable 2 · AI Capability Ladder

MVP 天花板：C____  
禁止：C____  
C3 白名单动作（若有）：

### Deliverable 3 · AI Interaction Principles（建议至少锁两句）

草案（可改）：

1. **AI should help Yin understand the user, not make Yin more talkative.**
2. **AI should make existing moments deeper, not turn every moment into an AI conversation.**

设计师定稿：

1. 
2. 
3. （可选）

### Deliverable 4 · Top 3 MVP Scenarios

只选三个。每个写：**用户故事一句话** + **C 级** + **映射轨道 A/B/C**（第三层，会末 15 分钟填）。

| # | 场景 | 用户故事（一句话验收） | C 级 | 轨道 |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

对照草案 Top 3（非锁）：

1. **自然语言动作**：「Forget this.」/「Show me what you remember.」/「Delete this Journey entry.」  
2. **Ask Your Journey / Presence**：「What have you noticed about me lately?」——描述性观察，禁止诊断与百分比。  
3. **Reflection Companion**：用户写完 → 一句极短观察式回应；禁止任务拆解 / coach。

---

## 4. 会末才映射工程轨道（15 分钟）

产品格填完后，主持按格打钩（可空）：

| 产品决定 | 轨道 A · CI 口头可执行 | 轨道 B · L3 只读注入 | 轨道 C · 仪式 generate |
|---|---|---|---|
| Confide 说人话 → 动作 | | — | — |
| Ask Presence / Journey | | 若在 Confide 闲聊注入 | — |
| Memory 自然语言管理 | CI-01 已有 Forget | 1d 已有 | — |
| Reflection 照见 | — | 观察块？ | **生成新句？** |
| Recover 个性化一句 | — | — | **生成？** |
| Whisper / Arrival / Breath / Celebrating | — | — | 草案：**不进** |

**混 PR 禁止**：Core 的 CI 扩展、Presence 入账、仪式 generate **不得**同一 PR。YPE（何时沉默、政策档）**仍不是**本会场景扩权。

---

## 5. 与现锁冲突 · 本会必须单独唱名（不能含糊「都要更智能」）

冲突扫描对照：Y Whisper · X Recover · X2 摸头 · S Breath · Z Journey · AE Confide · AF Presence · AG Memory。  
实现前规则：`FEATURE_CONFLICT_REVIEW.md`。下列疑点 **未获书面拍板前禁止改运行时与权威锁句**。

| # | 轴 | 疑点 | 现锁 | 设计师草案 | 本会须答 |
|---|---|---|---|---|---|
| **V1** | 职责 | 全产品「理解层」vs 桌面窄例外 | Local AI = Electron 宽屏 Confide 为主；Web/窄屏检索不生成 | 理解层，Confide 只是入口 | 角色选哪一格？窄例外是否仍成立？ |
| **V2** | 职责 | 口头删 Journey / 关提醒 vs ≠ Operating Layer | 备份/更新/bulk wipe **不进** CI；Confide 非全 App CLI | 「Delete today's Journey entry」「以后少提醒我」 | 控制层做多深？Journey 删是否仍走 Log UI？ |
| **V3** | 人设 | Reflection「照见」句 | 仪式 UI **无** generate IPC；文案已审 i18n | 写完后一句观察式短句 | 这是轨道 **C** 还是只读注入 **B**？失败是否必须回落语料？ |
| **V4** | 强度 | Recover / Whisper / Celebrating 生成 | 禁止把窄例外扩到仪式文案；Focusing 卸载模型 | MUST NOT ENTER（草案同意仪式侧） | 书面确认 MUST NOT 清单 |
| **V5** | 人设 | 「你这两周进步了吗」 | 观照者；CI-02 只允许描述性 breakdown | 禁止评价与诊断 | 重申红线是否全球统一（含危机桶） |

---

## 6. 建议会程（120 分钟）

我认为最合理的是：**先 5 问 + 场景表，最后 15 分钟才碰 A/B/C**。

| 段 | 时长 | 内容 |
|---|---|---|
| 1 | 20 min | Q1 角色 + Q4 天花板 + Q5 主动权（含 V1） |
| 2 | 50 min | 填 §2 场景表 → 产出 Core / Candidate / MUST NOT |
| 3 | 25 min | Top 3 + 每条一句话验收（含 V2 Journey 删、V3 Reflection） |
| 4 | 15 min | 映射 A/B/C；重申混 PR 禁止 |
| 5 | 10 min | 排期：未关的 Memory 1d/1e / CI-02 人工 vs 新 Core |

**较弱**：一上来用工程三轨道当议程（容易变成能力找场景）。

---

## 7. 会前材料（仍发，但标「第三层」）

| 文档 | 会中用法 |
|---|---|
| **本文** | 第一层填表 |
| `LOCAL_AI_SCENARIOS_V1.md` | 第三层轨道与在途清单 |
| `CONFIDE_EXECUTABLE_INTENTS.md` | 已有 CI-00/01/02 边界 |
| `PRODUCT_POSITIONING.md` | 禅意倾听者 |
| `task-desktop-on-device-companion.md` | 四层路由；仪式无 IPC |
| `YIN_PERSONALIZATION_ENGINE.md` §0–1 | YPE ≠ 本会扩场景 |
| `SCENARIO_TESTS.md` Y / AE / AF / AG / X / Z | 邻接强度与职责 |

---

## 8. 给会议主持的一句话

> **1e 关的是 Confide 里怎么删一条记忆。这场会关的是：在已经很满的用户时刻里，哪些问题只有「能理解用户的 Local AI」才值得存在——先画 Core / Candidate / MUST NOT 和权限天花板，再决定接 CI、注入还是仪式 generate。不能笼统说「都要更智能」。**
