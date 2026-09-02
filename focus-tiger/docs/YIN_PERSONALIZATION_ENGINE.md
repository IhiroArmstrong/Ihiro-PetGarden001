# Yin Personalization Engine Architecture V1

> **状态（2026-08-26）**：**L0 + L1 运行时已开工**。本文件仍是编排产品 SSOT。  
> **工作名称**：Yin Personalization Engine（YPE）。**不是**模型、**不是** Memory store、**不是**品味层、**不是**练习云备份。  
> **已做**：L0 门闩收口；L1 本地检索契约 / Journey 计数 insight / 三档政策（可关回 `default`）。  
> **L2 契约（2026-08-26 产品会 · 收口版）**：H.3 **V1 五键**白名单 + Pack 字段集 **已拍板**（文档 · #454）。Consent：**关即删** + 三语附录有条件通过（`task-briefs/task-l2-personalization-consent.md`；**未**写入 locale）。身份键 **已拍**（`task-briefs/task-l2-personalization-identity.md`；本机随机 `ype_profile_id`）。算法契约 **已拍**（`task-briefs/task-l2-personalization-algorithm.md`；V1 为五键→Pack 闭包）。L2 **Worker ingest / delete / Pack 签发源码已合**。Privacy 第四条开关已接线。**未开工**：YPE **V2** 秘密闭包（`task-ype-v2-secret-transform.md`）。  
> **命名**：YPE **L2** = 云端 State Pack 层。**≠** 桌面陪伴 L2（Electron 本机 generate）。离线必须可用的是 **Local Runtime**（YPE L0/L1 + 桌面 generate），不是 YPE L2。  
> **仍禁**：Speak 概率；与 Qwen L0 下载 / Checkout 混 PR。

从属（硬）：`YIN_PERSONAL_MEMORY.md` · `PRODUCT_POSITIONING.md`「禅意倾听者」· `LOCAL_AI_SCENARIOS_V1.md` · `task-cloud-taste-layer.md`（品味层四问）· `task-practice-memory-cloud-backup-a.md` · `PRIVACY_NOTICE.md` · `PRINCIPLES.md`（观照者、不诊断、agency）· `task-briefs/task-l2-personalization-consent.md` · `task-briefs/task-l2-personalization-identity.md` · 场景 Y / Z / AE / AF / AG。

**核心原则（英 / 中，同等效力）：**

> **The cloud may make Yin wiser. It must never make Yin unavailable.**  
> **云端可以让阿寅越来越聪明，但不能让阿寅因为没有网络而消失。**

**架构不变量（L2 硬约束 · 2026-08-26 拍板）：**

> **Cloud personalization is asynchronous enhancement, never a runtime dependency.**  
> 云端个人化是异步增强，**永远不是**运行时依赖。

禁止：每次完成 Focus / 每次开口 → 上传 → 等服务器 → 阿寅才更新。允许：本地交互照常 → 有网且已同意时后台更新 Pack → 本地缓存最近一次**有效** Pack → 没网仍用 L0/L1（及桌面 generate）。拉取须答 `BACKGROUND_NETWORK.md` 三问。

---

## 0. 冲突扫描（实现前 · 本回合已写入边界）

对照 `SCENARIO_TESTS.md`。本文件**不**扩大 2026-08-18 窄例外，**不**把仪式 generate 当已拍板。

| 轴 | 相邻场景 | 风险 | 本文件处置 |
|---|---|---|---|
| **a. 强度** | Sit / Arrival；Y Whisper；AE Confide | 云端「每次开口先问服务器」会比坐更重；学习型开口会变成教导 Banner | 云是**异步 overlay**；失败用本地政策；Whisper **不**改成 Speak probability |
| **b. 人设** | 观照者；Safety；情绪桶；Wellness 免责 | Presence「Distracted」= 心理诊断；Adaptive Policy = 教练督促 | 状态 = **产品交互**；政策档可解释、可关；禁止临床标签 |
| **c. 职责** | AG Memory；Z Journey；AF Presence；品味层；练习备份 6 key；`turns.jsonl` | 六套「聪明」并存，用户分不清；备份同意被拿去喂算法 | 下文 **§0.1 分桶**；L2 须**第四条独立同意**；默认 **不上** Confide 原文 / Memory 摘要 |

**用户书面（2026-08-26）**：评估后开工本架构（方向锁）。同日口令「开工 Yin Personalization Engine」→ L0。同日书面：L1 与 AG/AF 人工验收无耦合，口令「开工 L1」。同日产品会：**按收口版拍板** H.3 V1 五键 + Pack 契约 + 异步不变量（#454）。同日拍板 YPE 云个人化 **关即删**、HINT+可展开 DETAIL、三语附录有条件通过（`task-l2-personalization-consent.md`；**不**写 locale）。同日拍板 V1 身份 = 本机随机 opaque `ype_profile_id`（`task-l2-personalization-identity.md`）。Worker / 「开工 L2 UI」/「开工 L2」仍须另口令。

**未拍板（禁止当路线图默认项）**：

- 仪式场景 generate（Whisper / Recover / Reflection / 完成后主动开口）——仍见 `YIN_PERSONAL_MEMORY.md` §13。
- 把 Personal Memory 或 Confide 原文送上云做 ranking。
- Pack 下发 `rankHint` 分数，或 V1 下发 `memoryHints` / `eligibleMemoryIds`（记忆排序 **V1 全本地 L1**）。
- 把 `interventionStyle` 做成与 `companionStyle` 并列的第二套 Pack 真源。
- 云端 V1 下发 `morning_settle`（H.3 V1 不含时段特征，算不出）。
- per-user Qwen fine-tune / LoRA。
- opaque `policy_token`（V1 **不做**；调试与 QA 优先于逆向难度）。
- 用标签页可见性推断「分心」（Companion Mode 已禁系统性误判）。
- Worker / ingest / Pack 运行时（契约已锁；代码未授权）。

---

## 0.1 分桶（硬 · YPE 不替代任一桶）

| 层 | SSOT | 记什么 | 云？ |
|---|---|---|---|
| **YPE**（本文件） | 编排：何时沉默、取哪几条、政策档 | **不**存原文 | L2 仅 State Pack（契约已拍；运行时未开工） |
| **Personal Memory** | `YIN_PERSONAL_MEMORY.md` | 四类摘要；Consent / Remember / Forget | **永远 local-only** |
| **Journey Log** | 场景 Z | 练习留痕（分钟 / arrived / reflected） | 可进**练习备份** 6 key |
| **Presence Signals** | 场景 AF | Notice / Ritual / Reflection 观察账本 | **不进**备份；**不进** Memory；**V1 不进** YPE Pack |
| **Qwen 1.7B** | 桌面 Brief / AE | 层 3 **表达器** | 模型在本机；**不是**护城河 |
| **品味层** | `task-cloud-taste-layer.md` | **全局**冻结权重 + 日签池 | 可选 overlay；**不是**个人政策 |
| **练习备份** | 免费 A 快照 | 6 key 白名单 | OTP；**禁止**混入 Memory / turns / YPE 原文 |
| **`turns.jsonl`** | companion-debug | 调试回合 | **禁止**上云、禁止当 Memory |

一句话：Log 记**事**；Presence 记**路上点过什么**；Memory 记**怎么对待这个人更自在**；YPE 决定 **现在该不该动、动哪一层**；品味层只调 **全站手感表**。

支付云 ≠ 品味云 ≠ 备份云 ≠ **YPE 云（若将来有）**。**四条约定、四套同意**（Memory · YPE 云个人化 · 练习备份 · 意愿漏斗）。禁止借用漏斗 opt-in 或备份 Enable 当作 YPE 同意。

---

## 1. 产品定位：陪伴智能，不是高级功能开关

YPE **不是**塞进某一个 UI 的「高级算法」。

它横跨：

```text
Presence → Memory → Journey → Moment → Yin Response
```

别人可以抄计时器、接 Qwen、做 Memory 表、甚至抄 Five Moments。难抄的是：

> 阿寅为什么今天对这个人说这一句、昨天选择沉默；为什么三个月前的一件小事今天被想起；为什么对用户 A 和用户 B，长期以后陪伴方式不同——且仍像观照者，而不是教练。

内部用语：**Personalization** / **Companion Intelligence**。禁止对用户说 training / 你的数据在教模型 / 云端大脑正在分析你。

**IP 预期须现实：** 客户端可见输出不是绝对保密。保护方式是 **秘密变换留在服务端 + 客户端只持有 Pack / overlay 结果 + 原文默认不出设备 + 不下发 ranking 数值**。不追求「别人绝对无法复制」。云端拿**算法需要的最小统计特征**，不拿「足以重建一个人的行为画像」的数据。

**冻表 vs 现网（2026-09-02）**：仓库里的 V1 闭包 / Pack 形状是公开兜底。真正会调的阈值与映射只应活在已部署 Worker（`algorithmVersion` 不下发）。细则 `ANTI_PLAGIARISM_LAYER.md` §3.1。V1 现网仍是回声选档，**还没有**可藏的灵魂参数；那是 V2 的工作。

---

## 2. 系统草图（Cloud Brain / Local Runtime）

**禁止**把每次 interaction 做成：User → Cloud → Algorithm → Yin。断网则阿寅变笨 = 违反核心原则。

```text
             CLOUD（YPE L2 · 契约已拍 · 运行时未开工 · 可选 · 异步）
┌─────────────────────────────────────┐
│ Secret Personalization Engine       │
│ （V1：政策档；不做 Memory ranking overlay）│
│ companion policy update             │
│ （算法正文不进客户端）                │
└──────────────────┬──────────────────┘
                   │ Personalization State Pack
                   ▼
┌─────────────────────────────────────┐
│ LOCAL Runtime（L0/L1 已开工）         │
│ 计时 / 状态机 / Journey / Presence    │
│ Memory store + L1 确定性检索         │
│ Whisper / overlay 门闩               │
│ Qwen 1.7B + 语料 + Safety            │
│ 本地政策真源 + 云 overlay（失败则丢包）│
└─────────────────────────────────────┘
```

循环（意图，非现网）：

```text
Local interaction
       ↓
Local state / memory / L1 retrieve
       ↓
[when network is available AND YPE cloud consent is on]
       ↓
upload H.3 V1 features only
       ↓
Cloud personalization update
       ↓
new State Pack → Local cache
       ↓
still Offline-capable: sit, confide, generate (desktop)
```

云端 **不**决定「现在说这一句」。它最多定期更新 **政策档**。下一句仍由本地层序锁死：

```text
Safety > Corpus / 仪式已审文案 > Memory 检索 > Qwen
```

Memory 检索 **只**活在层 3 之前。第 0 / 1 / 2 层命中 = YPE **不得**为了「更懂你」而抬过安全阀或情绪桶。

---

## 3. 实现分层（防止一次画六台引擎）

| 层 | 名称 | 做什么 | 何时 |
|---|---|---|---|
| **L0** | 本地政策运行时 | 把**已有**门闩收成 Companion Policy 接口：busy / overlay / 一生一次 Whisper / 层序 / 用户主动才生成 | **已开工**：`src/core/yinPersonalizationEngine.js`；不得改仪式 generate |
| **L1** | 本地智能 | 检索契约（≤3 条）；Remember 门槛用现有 confidence / 重复 / freshness；Journey **计数型** insight 对象；有限政策档 | **已开工**（全本地）：`ypeRetrieveMemories` / `ypeBuildJourneyInsights` / What Yin remembers 邻接三档 |
| **L2** | 云端秘密层 | State Pack overlay；只收 §H.3 **V1 五键** | **契约已拍**；Worker/runtime **未开工**；不进 `v1.0.0` 核心路径；须第四条同意 + `schemaVersion` 降级 |

设计师列出的六个算法，映射如下——**不是六条并行开工线**：

| 算法 | 归层 | V1 口径 |
|---|---|---|
| Memory Formation / Forgetting | Memory SSOT + L1 | 已有 Consent / Remember / Forget；单次闲聊默认低置信 |
| Memory Relevance / Ranking | **仅 L1** | 本机算；云 **V1 不做** ranking overlay（无摘要则无法诚实排序；不下发分数） |
| Yin Timing / Intervention | L0 确定性沉默 | **禁止** Speak probability；仪式开口仍未拍板 |
| Presence State Inference | 交互状态枚举（可选 L1） | Arrived / Engaged / Quiet Leave 等；**不是**医学结论；**禁止** Distracted←visibility；标签计数 **V1 不上云** |
| Longitudinal / Journey Pattern | **L1 计数为本** | `morning_settle` 等由本机 Journey 计数产生；云 V1 **不得**用五键假装算出时段 insight |
| Adaptive Companion Policy | L0 默认档；L1 可切换；L2 可 overlay **同一套三档** | 有限档（更安静 / 默认 / 稍多承认）；须可展示、可关；禁止督促；**用户本机刚改的档优先于过期 Pack** |

---

## A. Personal Signals（输入）

YPE **只读**下列已存在或已锁的信号；**不**新建第五本日记。

| 源 | 例子 | 给 YPE 时的形态 |
|---|---|---|
| Focus / 会话 | 时长、完成/Rise、Companion 模式（用户声明） | 计数与时段桶（时段桶 **本机**；V1 **不上云**） |
| Reflection | 是否 reflected；**不要**把 Q 原文当默认特征 | 布尔 / 次数；freeText 仍 90 天本地 |
| Presence | Notice 封闭标签、Ritual Leave、chip | 标签计数；**描述性**，不诊断；**V1 不上云** |
| Confide | 路由命中层、是否 unmatched | **不是**原文；危机/情绪桶 **永不**进特征 |
| Memory | `kind` / confidence / freshness / id | 检索侧；摘要留本机 |
| Moments | Whisper 已见键、busy suppress | 门闩布尔；**V1 不上云** |
| Journey | 日期 + 分钟 + arrived + reflected + insightSpark | 留痕计数（上限约 30 是产品裁旧，不是「数据不够再上传原文」的理由） |

**诚实边界：** 今日数据量只够规则与计数，不够稳定的八因子学习。L2 若开，也是稀疏 overlay，不是「已经有训练集群」。

---

## B. Memory Intelligence（从属 Memory 文档）

Remember / Use / Forget 的产品规则 **以 `YIN_PERSONAL_MEMORY.md` 为准**。YPE 只加编排契约：

### B.1 值不值得记（Formation）

禁止 `Monday → stressful` 这种诊断键值。

V1 本地启发式（逻辑，非公式保密秀）：

- 单次口头偏好 → `low`，**不**注入。
- 数周内同类观察重复 + 用户明确说过 + 非情绪桶 / 非危机 → 才考虑 `medium` / Pattern。
- 用户 Forget = 真删，**禁止**云端复活。

设计师的八项连乘（relevance × recurrence × …）是 **L2 候选（未拍板）**，不是 L0/L1 必做。L1 用已有 `confidence` + `lastSeenAt` + 主题重叠即可。

### B.2 取哪 1–3 条（Retrieval · 现在就冻接口）

```text
retrieve(currentContext) → 最多 3 条 active summary
  主题相关
  + confidence 过门槛（low 不进）
  + freshness
  + 本会话「不要复读同一条」
  + 与当前意图相关（倾诉主题，不是教练目标）
```

无相关记忆 = **不硬插**。禁止为了「显得记得」而塞无关旧条。

**V1：** 排序与取三条 **只**走 L1。云端未见 Memory `summary`，不得假装对 `memoryId` 打分。  
**否决（V1）**：Pack 下发 `{ memoryId, rankHint: 0.87 }`（分数泄漏算法）；Pack 下发仅 `{ memoryId }` 的 `memoryHints`（无摘要则空壳，列表顺序仍泄漏）。  
L1 检索实现里若仍有可选本地 `rankHint` 参数，那是本机接口，**不是**云 overlay。客户端在任何 Pack 下都必须能用 L1 规则取三条。候选项（须另会）：在仍不上摘要的前提下是否做「无序 eligible id 集合」——**默认不做**。

---

## C. Pattern Intelligence

短周期：本场 / 今日（本地计数）。  
长周期：数十次 Journey / Presence 标签（仍本地）。

允许的产出是 **结构化 insight 对象**，例如：

```text
{ id: "morning_settle", window: "last_30_sits",
  claim: "completion_rate_morning > completion_rate_late",
  evidence: { morningN, lateN },
  tone: "observation" }
```

然后：模板句 **或**（仅层 3）Qwen 把已有 `claim` 写成阿寅的话。**禁止**让模型自己「分析」日志并发明系统没有的事实。

**可以：** `morning_settle` + `strength` 这类**产品行为** id（本机 L1：满 10 次坐才可能出）。  
**不可以：** `user has poor sleep discipline`。  
**更不可以：** `user suffers from anxiety` / 人格类型 / 医疗判断。

`morning_settle` 依赖上午 vs 晚间完成对比。H.3 V1 **不含** `morning_consistency` / `late_session_completion`，故 **云端 V1 不得下发该 insight**。本机 L1 仍可计算并（仅 `warm`）注入层 3。Pack 的 `patternInsights` 在云端 V1 **必须为空数组**（字段保留为前向兼容）。将来逐项把时段特征加入 H.3 后，再另会批准云端 insight id 白名单。

---

## D. Companion Policy（Talk / Silent / Encourage / Reflect / Recall）

政策回答：**这个人更适合怎样被陪**——仍是观照者。

V1 **仅三档**（可改名，不可暗中变成连续「干预概率」）：

| 档 | 含义 | 禁止滑向 |
|---|---|---|
| `quiet` | 低干预、短句、高沉默容忍 | 消失 / 装死（核心路径仍响应点击） |
| `default` | 现网已审仪式 + Confide 层序 | — |
| `warm` | 稍多承认（里程碑、回指） | 督促、return cue 轰炸、教练清单 |

用户须能在「What Yin remembers」邻接或 Privacy **看见并关掉**个人化（退回 `default`）。**禁止**把政策做成不可解释的黑盒人格。

**真源：** 本机 `focus-tiger.ype-companion-style.v1`（L1）。Pack 的 `companionStyle` 是 overlay。用户刚改成 `quiet` / `default`（关掉个人化）→ **过期 Pack 不得改回**。

**不要**在 Pack 再单开 `interventionStyle: low|medium` 第二套真源。若云端内部映射干预力度，须由 `companionStyle` 派生（例：`quiet`→low；`default`/`warm`→medium），**不得**与用户选档打架。H.3 上传键 `intervention_preference` 是给云的**输入特征**（由本机档派生），不是 UI 第三套开关。

**Timing：** 「真正的陪伴知道何时不说话」落在 **L0 确定性规则**（已有：一生一次 Whisper、busy suppress、Focusing 不 generate、安全/情绪桶不检索 Memory）。**不要**用 `Speak probability = 0.18` 替代这些门闩。Whisper seen 掩码 **留本地**（除非将来另会拍「跨设备同步 Whisper」——默认不做）。

---

## E. Cloud Secret Layer（哪些只存在 Server）

执行层：`task-briefs/task-l2-personalization-algorithm.md`。

**仅 YPE L2** 可把下列留在服务端：

- 该 `ype_profile_id` 上的 H.3 V1 五键（同意开启期间）  
- `algorithmVersion` 与内部映射表（**不下发** Pack；V2 才有可分叉的秘密）  

**V1 公开变换（锁死 · 现网）：** Pack.`companionStyle` = 用户上传的 `companion_style_preference`（非法则 `default`）。`patternInsights` = `[]`。**禁止**用完成率 / 反思频率 / 练习日数改档。样本不足则不签发 overlay。拷仓库即可复现 V1——这是刻意的公开兜底，不是漏洞清单漏项。

**V2（已排期 · 运行时未开工）：** 同一五键上的闭包；允许白名单 `patternInsights` token；仍禁止完成率改档、禁止用户可见打分。口令「开工 YPE V2」· Brief `task-ype-v2-secret-transform.md`。阈值允许与 git 验收锚分叉（§3.1）。

**V1 不把 Memory ranking 公式放到云端「再下发结果」**——没有摘要就排不了；下发分数或有序 id 都会泄漏。Ranking **留 L1**。

客户端可见的永远是 **结果**：`companionStyle`、空的 insight 数组、`packVersion`。**不下发** `rankHint`、权重表、`intervention_probability`、现在开口指令。

**V1 不做** opaque token。若将来要增加逆向成本，另拍板；不得阻塞 QA。

品味层继续只调全局 Rise/欢迎/完成权重。**禁止**把个人 `companion_style` 塞进 `/api/emotion-weight`。

---

## F. Local Layer（没网必须仍能做）

| 必须 Local | 说明 |
|---|---|
| 核心 Focus Timer | 不绑云请求 |
| 会话状态机 | Arrive → Focus → Rise → Reflection |
| Journey Log 写入 | 继续记 |
| Presence 入账 | 继续记 |
| Memory 读写 / Forget | Electron userData；Web 无层 3 则无此能力（故意不对等） |
| Qwen 1.7B（桌面陪伴 generate） | Electron 宽屏；Web / 窄屏 / ≤8GB 仍检索不生成 |
| 语料 fallback + Safety | **不能**依赖网络 |
| L0/L1 政策与检索 | 包内真源；云 overlay 失败 / 过期则用它 |

Web 用户的「聪明」= 规则机 + 已审文案 +（可选）练习备份。**禁止**为了 YPE 把 Web 做成半残 AI。

后台若将来拉 Pack：须答 `BACKGROUND_NETWORK.md` 三问（避开 Arrival / Honesty / 呼吸窗；相同内容不写盘；慢网不卡动效）。点击 OTP / Checkout **不**算本条。

---

## G. State Pack V1（Cloud → Local · 2026-08-26 拍板）

逻辑形状，**非**实现 JSON 文件名。未知 `schemaVersion` → **整包丢弃**，沿用本地真源（对齐品味层）。

```text
PersonalizationStatePack v1
{
  schemaVersion: 1,
  packVersion: 27,          // 单调；仅用于去重
  issuedAt: ISO-8601,
  expiresAt: ISO-8601,      // 过期 → 忽略 overlay，不锁 Sit
  companionStyle: "quiet" | "default" | "warm",
  patternInsights: []       // 云端 V1 必须为空；见 §C
}
```

**V1 不要出现在 Pack 里的：** `rankHint` / `memoryRankHints` / `memoryHints` / `eligibleMemoryIds` / `interventionStyle` / `intervention_probability` / `timing` 改门闩 / Whisper 频率。

**禁止写入 Pack 的：** Confide 原文、Memory `summary` / evidence 正文、`turns.jsonl`、危机内容、邮箱、支付、诊断字符串、完整加权公式、算法权重、精确行为分数、现在开口指令（「现在该说什么」会把云变成阿寅遥控器）。

云端 **可以**保存算法版本（例：`rankingAlgorithm: 17`）——那是服务器私有元数据，**不要**下发到 Pack。

---

## H. Privacy（特征白名单 · 默认最小）

### H.1 永远不出设备（默认）

- Confide / 仪式用户原文  
- Memory `summary` 与 evidence 指针指向的倾诉正文  
- `turns.jsonl`  
- 危机 / 情绪桶命中回合  
- 临床词、未成年人推断  

「为了训练算法把所有倾诉上传」= **否决**。会破坏 AG 的 *on this device only* 故事。

### H.2 仅本机、可进检索、不进备份、不进 Pack

- `yin-personal-memory.json` 全文  
- Presence `freeText`（90 天剥离后即无）  
- Presence 封闭标签计数、时段完成占比、仪式 Leave 率、Whisper seen 掩码（见 H.3 候选项）

### H.3 L2 可上传的结构化特征（白名单）

须 **独立明示同意**（≠ 备份 OTP ≠ 漏斗 ≠ Memory Consent ≠ Newsletter）。默认关。拒绝 = 永不建 Pack，本地 L0/L1 照常。用户可见保留：**关即删**（停止发送 + 删除本机 `ype_profile_id` 对应的云端个人化数据 + 作废本机 Pack 缓存）。禁止以 90 天 / 12 个月作为开关下文案。工程删除窗口不得自行写入 UI。离线关闭：先停发，联网后删云；UI 不得在服务端确认前声称「已删除」。

Privacy 文案 **不要**在架构未满足严格匿名化时写 anonymous / 匿名。准确用语：**limited structured signals**（少量结构化使用信号）。V1 绑定本机 personalization profile（随机 opaque ID），**不是**匿名。

#### H.3 V1（2026-08-26 拍板 · 仅这五键可上云）

允许（计数 / 比例 / 档位，**无原文**）：

| 特征键（逻辑名） | 含义 | 禁止升格为 |
|---|---|---|
| `focus_return_rate` | 有记录窗口内完成相对开始的比例 | 「意志力差」 |
| `reflection_frequency` | reflected 次数 / 完成次数 | 反省不够 |
| `companion_style_preference` | 用户选过的档，或默认 `default` | 人格类型 |
| `intervention_preference` | 由 `companionStyle` **派生**的 `low` \| `medium` | 连续概率；禁止做成第二套 UI 档 |
| `practice_day_count_window` | 窗口内练习日数（无具体日记正文） | — |

**灰度：** 不足样本（例：<10 次完成）→ 不下发 insight，不上传或上传 `insufficient: true` 而不带易去匿名化的稀疏组合。

可识别身份（邮箱）只走既有 OTP 备份通道，**禁止**做 YPE V1 主键。V1 主键见 **§H.5**。

#### H.3 候选项（历史保留 · V1 **不上云** · 可逐项再评估）

不是永久禁止。V1 遵循 data minimization：能在本地计算的，不为了算法方便上传。尤其避免长期组合形成过细行为/情绪画像。

| 特征键 | V1 | 理由（摘要） |
|---|---|---|
| `morning_consistency` | 不上云 | 易成作息画像；亦是云端 `morning_settle` 的前置，暂缓则云端不得发该 insight |
| `late_session_completion` | 不上云 | 同上 |
| `arrival_notice_tag_counts` | 不上云 | 封闭标签长期累积仍接近情绪画像；AF 本就不进备份 / Memory |
| `ritual_leave_rate` | 不上云 | 产品价值有限，隐私收益/风险比差 |
| `whisper_seen_mask` | 不上云 | 一生一次 Whisper 是本地状态机；跨设备同步须另会 |

### H.4 本机派生、可给 L1、默认仍不上云

- Memory 本地排序结果（含实现里可选的本地 `rankHint`）  
- insight 对象在展示给用户之前的草稿  

---


### H.5 YPE V1 Identity（2026-08-26 拍板）

执行层：`task-briefs/task-l2-personalization-identity.md`。

**Primitive：** `ype_profile_id` = 本机生成、本机存储的随机 opaque installation/profile ID。

禁止当作 V1 主键：邮箱 / 备份 OTP、MAC、广告 ID、硬件指纹、任何用于跨安装拼接的 device fingerprint。

**跨设备：** 不同安装 / 存储分区 = 不同 cloud 行。同一人在设备 2 开启 = **新档案**。关设备 1 只删 A，不删 B。再开启 = 新 ID，不复活已删行。

**删除范围（backend invariant）：** 只删该 `ype_profile_id` 的 YPE signals + personalization state/Pack + 本机 Pack 缓存。**禁止**连带练习备份、Memory、Confide、漏斗、其他本地数据。

**卸装：** 本机 ID 丢失后，客户端无法再出示该 key。未先 OFF 可能留下孤儿云行；不向用户承诺「卸装即全网删除」；内部 SLA 另定。不得用硬件指纹把孤儿拼回新人。

## I. Versioning（算法 v1 → v2 时用户 profile）

| 规则 | 口径 |
|---|---|
| Pack `schemaVersion` | 客户端不认识 → 静默用本地政策；禁止崩、禁止逼升级才许 Sit |
| `packVersion` | 仅去重；旧包不覆盖新本地用户选择（用户刚改成 `quiet` 则云不得用过期 Pack 改回） |
| 算法服务端升级 | 可换秘密公式；**须**保持 Pack 字段向后兼容，或升 schema 并双写一段时间 |
| Forget / 关同意 | 服务端删除该 `ype_profile_id` 的 YPE 特征与 Pack；本机缓存 Pack **丢弃**；本地 Memory **不**随 YPE OFF 删除。用户可见语义见 Consent brief。V1 **不得**暗示全账号 / 全设备 |
| 卸装 | 本机 Memory / YPE profile ID 随安装消失；云端 YPE 行仅在 OFF 删除确认（或将来账户删除）时清；未 OFF 的孤儿行不向用户承诺 |

---

## J. Failure

| 故障 | 行为 |
|---|---|
| 云不可用 / 超时 / 4xx | Sit 与 Confide **不停**；沿用本地政策真源或出厂 `default` |
| 未知 schema | 丢包 |
| Local AI 不可用（低配 / 窄屏 / 卸载） | 检索语料 + 已审仪式；YPE **不得**假装层 3 回指 |
| Memory 文件损坏 | 不注入、不编造；可空列表；**禁止**为恢复而自动上传残骸到云 |
| Pack 含 `rankHint` / `memoryHints` / 非空云端 insight | **整包丢弃**或忽略非法字段（实现时锁：宁可丢包，不执行云端记忆排序） |
| 安全阀命中 | YPE 整段跳过（不检索、不改政策、不「温暖地」盖过转介句） |

---

## 4. 明确不做（本切片 / 未开工 L2 运行时）

- 写 Policy Pack 存取代码、Worker 新路由、Speak 概率  
- 把 YPE 并进品味层 payload 或练习备份 6 key  
- 主动开口「我记得你该坐了」  
- 每用户微调 Qwen  
- 把 Journey 列表变成 Yin 的诊断报告  
- 用 YPE 改状态机合法转移  
- 改 L0/L1 production runtime 来「对齐」尚未存在的 Pack 文件  

---

## 5. 实现顺序

1. **本文方向锁**（#451）。  
2. 继续：AG 1d/1e 人工、AF 人工、Qwen runtime **另一条线**、品味层 Quiet Line **另一条云**。  
3. 口令「开工 Yin Personalization Engine」→ **L0 接口已开工**（现有门闩收口，行为不变）。  
4. 口令「开工 L1」→ **L1 检索契约已开工**（可单测、可 Forget、可离线）。  
5. **L2 契约收口**（本文件 2026-08-26）：白名单 V1 → Pack V1（#454）→ Consent / 身份 / V1 算法契约已拍 → L2 UI + Worker ingest **源码已合**。下一刀算法：**口令「开工 YPE V2」**（防剽窃层序 2）。未口令 = 不改签发闭包 / 不放开非空 insight。

生命感仍看 Memory 三问（接住了吗 / 还像阿寅吗 / 像记得我吗）。YPE 第四问（以后才测）：**像知道何时不说话吗？** ——用确定性沉默验收，不用概率。

---

## 权威交叉

- Memory：`YIN_PERSONAL_MEMORY.md`  
- L2 同意文案需求：`task-briefs/task-l2-personalization-consent.md`  
- L2 身份键：`task-briefs/task-l2-personalization-identity.md`  
- L2 算法契约：`task-briefs/task-l2-personalization-algorithm.md`  
- 本地 AI 场景 / CI：`LOCAL_AI_SCENARIOS_V1.md` · `CONFIDE_EXECUTABLE_INTENTS.md`  
- 品味层（对照、禁止混桶）：`task-briefs/task-cloud-taste-layer.md` · `PROCESS.md` Backlog「云端品味层」  
- 练习备份（对照）：`task-briefs/task-practice-memory-cloud-backup-a.md`  
- 四层路由：`PRODUCT_POSITIONING.md`  
- 场景 Y / Z / AE / AF / AG：`SCENARIO_TESTS.md`  
- 后台网络：`BACKGROUND_NETWORK.md`  
- 冲突扫描：`FEATURE_CONFLICT_REVIEW.md`
