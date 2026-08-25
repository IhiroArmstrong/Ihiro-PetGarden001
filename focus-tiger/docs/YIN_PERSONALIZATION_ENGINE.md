# Yin Personalization Engine Architecture V1

> **状态（2026-08-26）**：**L0 + L1 运行时已开工**。本文件仍是编排产品 SSOT。  
> **工作名称**：Yin Personalization Engine（YPE）。**不是**模型、**不是** Memory store、**不是**品味层、**不是**练习云备份。  
> **已做**：L0 门闩收口；L1 本地检索契约 / Journey 计数 insight / 三档政策（可关回 `default`）。  
> **仍禁**：L2 State Pack / Worker / Speak 概率 **未拍板**。禁止与 Qwen L0 下载 / Checkout 混 PR。

从属（硬）：`YIN_PERSONAL_MEMORY.md` · `PRODUCT_POSITIONING.md`「禅意倾听者」· `LOCAL_AI_SCENARIOS_V1.md` · `task-cloud-taste-layer.md`（品味层四问）· `task-practice-memory-cloud-backup-a.md` · `PRIVACY_NOTICE.md` · `PRINCIPLES.md`（观照者、不诊断、agency）· 场景 Y / Z / AE / AF / AG。

**核心原则（英 / 中，同等效力）：**

> **The cloud may make Yin wiser. It must never make Yin unavailable.**  
> **云端可以让阿寅越来越聪明，但不能让阿寅因为没有网络而消失。**

---

## 0. 冲突扫描（实现前 · 本回合已写入边界）

对照 `SCENARIO_TESTS.md`。本文件**不**扩大 2026-08-18 窄例外，**不**把仪式 generate 当已拍板。

| 轴 | 相邻场景 | 风险 | 本文件处置 |
|---|---|---|---|
| **a. 强度** | Sit / Arrival；Y Whisper；AE Confide | 云端「每次开口先问服务器」会比坐更重；学习型开口会变成教导 Banner | 云是**异步 overlay**；失败用本地政策；Whisper **不**改成 Speak probability |
| **b. 人设** | 观照者；Safety；情绪桶；Wellness 免责 | Presence「Distracted」= 心理诊断；Adaptive Policy = 教练督促 | 状态 = **产品交互**；政策档可解释、可关；禁止临床标签 |
| **c. 职责** | AG Memory；Z Journey；AF Presence；品味层；练习备份 6 key；`turns.jsonl` | 六套「聪明」并存，用户分不清；备份同意被拿去喂算法 | 下文 **§0.1 分桶**；L2 须**新同意**；默认 **不上** Confide 原文 / Memory 摘要 |

**用户书面（2026-08-26）**：评估后开工本架构（方向锁）。同日口令「开工 Yin Personalization Engine」→ L0。同日书面：L1 与 AG/AF 人工验收无耦合，口令「开工 L1」。L2 仍见 §5。

**未拍板（禁止当路线图默认项）**：

- 仪式场景 generate（Whisper / Recover / Reflection / 完成后主动开口）——仍见 `YIN_PERSONAL_MEMORY.md` §13。
- 把 Personal Memory 或 Confide 原文送上云做 ranking。
- per-user Qwen fine-tune / LoRA。
- opaque `policy_token`（V1 **不做**；调试与 QA 优先于逆向难度）。
- 用标签页可见性推断「分心」（Companion Mode 已禁系统性误判）。

---

## 0.1 分桶（硬 · YPE 不替代任一桶）

| 层 | SSOT | 记什么 | 云？ |
|---|---|---|---|
| **YPE**（本文件） | 编排：何时沉默、取哪几条、政策档 | **不**存原文 | L2 仅 State Pack（未拍板） |
| **Personal Memory** | `YIN_PERSONAL_MEMORY.md` | 四类摘要；Consent / Remember / Forget | **永远 local-only** |
| **Journey Log** | 场景 Z | 练习留痕（分钟 / arrived / reflected） | 可进**练习备份** 6 key |
| **Presence Signals** | 场景 AF | Notice / Ritual / Reflection 观察账本 | **不进**备份；**不进** Memory |
| **Qwen 1.7B** | 桌面 Brief / AE | 层 3 **表达器** | 模型在本机；**不是**护城河 |
| **品味层** | `task-cloud-taste-layer.md` | **全局**冻结权重 + 日签池 | 可选 overlay；**不是**个人政策 |
| **练习备份** | 免费 A 快照 | 6 key 白名单 | OTP；**禁止**混入 Memory / turns / YPE 原文 |
| **`turns.jsonl`** | companion-debug | 调试回合 | **禁止**上云、禁止当 Memory |

一句话：Log 记**事**；Presence 记**路上点过什么**；Memory 记**怎么对待这个人更自在**；YPE 决定 **现在该不该动、动哪一层**；品味层只调 **全站手感表**。

支付云 ≠ 品味云 ≠ 备份云 ≠ **YPE 云（若将来有）**。四条约定、四套同意。禁止借用漏斗 opt-in 或备份 Enable 当作 YPE 同意。

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

**IP 预期须现实：** 客户端可见输出不是绝对保密。保护方式是 **秘密算法留在服务端（L2 未拍板）+ 客户端只持有运行所需结果 + 原文默认不出设备**。不追求「别人绝对无法复制」。

---

## 2. 系统草图（Cloud Brain / Local Runtime）

**禁止**把每次 interaction 做成：User → Cloud → Algorithm → Yin。断网则阿寅变笨 = 违反核心原则。

```text
             CLOUD（L2 · 未拍板 · 可选 · 异步）
┌─────────────────────────────────────┐
│ Secret Personalization Engine       │
│ pattern detection / memory ranking  │
│ companion policy update             │
│ （算法正文不进客户端）                │
└──────────────────┬──────────────────┘
                   │ Personalization State Pack
                   ▼
┌─────────────────────────────────────┐
│ LOCAL Runtime（L0 永远；L1 可后做）  │
│ 计时 / 状态机 / Journey / Presence    │
│ Memory store + 确定性检索            │
│ Whisper / overlay 门闩               │
│ Qwen 1.7B + 语料 + Safety            │
│ 本地 Policy Pack 真源 + 云 overlay   │
└─────────────────────────────────────┘
```

循环（意图，非现网）：

```text
Offline 本地交互 → 本地 Memory / Qwen
        →（有网且已同意）上传 §H 白名单特征
        → 云端更新 Pack
        → 下载 overlay
        → 再 Offline：略更懂这个人，但没网仍能坐、能陪
```

云端 **不**决定「现在说这一句」。它最多定期更新 **政策与排序提示**。下一句仍由本地层序锁死：

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
| **L2** | 云端秘密层 | State Pack overlay；只收 §H 特征 | **未拍板**；不进 `v1.0.0` 核心路径；须新同意 + `schemaVersion` 降级 |

设计师列出的六个算法，映射如下——**不是六条并行开工线**：

| 算法 | 归层 | V1 口径 |
|---|---|---|
| Memory Formation / Forgetting | Memory SSOT + L1 | 已有 Consent / Remember / Forget；单次闲聊默认低置信 |
| Memory Relevance / Ranking | L1 接口；L2 仅可覆盖 **rank 提示** | 本机算；云不得拿走摘要原文 |
| Yin Timing / Intervention | L0 确定性沉默 | **禁止** Speak probability；仪式开口仍未拍板 |
| Presence State Inference | 交互状态枚举（可选 L1） | Arrived / Engaged / Quiet Leave 等；**不是**医学结论；**禁止** Distracted←visibility |
| Longitudinal / Journey Pattern | L1 计数；L2 未拍板 | 先结构化 insight，再交给模板或（仅层 3）Qwen 润色已有事实 |
| Adaptive Companion Policy | L0 默认档；L1 可切换；L2 未拍板 | 有限档（更安静 / 默认 / 稍多承认）；须可展示、可关；禁止督促 |

---

## A. Personal Signals（输入）

YPE **只读**下列已存在或已锁的信号；**不**新建第五本日记。

| 源 | 例子 | 给 YPE 时的形态 |
|---|---|---|
| Focus / 会话 | 时长、完成/Rise、Companion 模式（用户声明） | 计数与时段桶 |
| Reflection | 是否 reflected；**不要**把 Q 原文当默认特征 | 布尔 / 次数；freeText 仍 90 天本地 |
| Presence | Notice 封闭标签、Ritual Leave、chip | 标签计数；**描述性**，不诊断 |
| Confide | 路由命中层、是否 unmatched | **不是**原文；危机/情绪桶 **永不**进特征 |
| Memory | `kind` / confidence / freshness / id | 检索侧；摘要留本机 |
| Moments | Whisper 已见键、busy suppress | 门闩布尔 |
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

设计师的八项连乘（relevance × recurrence × …）是 **L2 候选**，不是 L0/L1 必做。L1 用已有 `confidence` + `lastSeenAt` + 主题重叠即可。

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

L2 若拍板：云可下发 `{ memoryId, rankHint }`，**不下发**摘要正文、**不**把算法权重表打进客户端。客户端仍必须能在无 `rankHint` 时用 L1 规则取三条。

---

## C. Pattern Intelligence

短周期：本场 / 今日（本地计数）。  
长周期：数十次 Journey / Presence 标签（仍本地；L2 未拍板）。

允许的产出是 **结构化 insight 对象**，例如：

```text
{ id: "morning_settle", window: "last_30_sits",
  claim: "completion_rate_morning > completion_rate_late",
  evidence: { morningN, lateN },
  tone: "observation" }
```

然后：模板句 **或**（仅层 3）Qwen 把已有 `claim` 写成阿寅的话。**禁止**让模型自己「分析」日志并发明系统没有的事实。

禁止的 insight：焦虑缓解、ADHD、你总是失败、该惩罚式提醒。

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

**Timing：** 「真正的陪伴知道何时不说话」落在 **L0 确定性规则**（已有：一生一次 Whisper、busy suppress、Focusing 不 generate、安全/情绪桶不检索 Memory）。**不要**用 `Speak probability = 0.18` 替代这些门闩。

---

## E. Cloud Secret Layer（哪些只存在 Server）

**仅 L2（未拍板）** 可把下列留在服务端：

- Memory rank 的完整加权式  
- 长期模式检测正文  
- 政策档如何从特征推出  

客户端可见的永远是 **结果**：档位名、`rankHint`、insight id、`packVersion`。

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
| Qwen 1.7B | Electron 宽屏；Web / 窄屏 / ≤8GB 仍检索不生成 |
| 语料 fallback + Safety | **不能**依赖网络 |
| L0 政策默认档 | 包内真源；云 overlay 失败则用它 |

Web 用户的「聪明」= 规则机 + 已审文案 +（可选）练习备份。**禁止**为了 YPE 把 Web 做成半残 AI。

后台若将来拉 Pack：须答 `BACKGROUND_NETWORK.md` 三问（避开 Arrival / Honesty / 呼吸窗；相同内容不写盘；慢网不卡动效）。点击 OTP / Checkout **不**算本条。

---

## G. State Pack 草图（Cloud → Local）

逻辑形状，**非**实现 JSON 文件名。未知 `schemaVersion` → **整包丢弃**，沿用本地真源（对齐品味层）。

```text
PersonalizationStatePack v1 (sketch)
{
  schemaVersion: 1,
  packVersion: 27,          // 单调；仅用于去重
  issuedAt: ISO-8601,
  expiresAt: ISO-8601,      // 过期 → 忽略 overlay，不锁 Sit
  companionStyle: "quiet" | "default" | "warm",
  timing: {
    whisperFrequency: "once_lifetime",  // V1 只允许与现网门闩兼容的值
    postFocusReflection: "unchanged"    // 不得偷偷打开仪式 generate
  },
  memoryRankHints: [
    { memoryId: "…", rankHint: 0.87 }   // 无摘要；无 id 则忽略该行
  ],
  patternInsights: [
    { id: "morning_settle", strength: "strong" }
  ]
}
```

**禁止写入 Pack 的：** Confide 原文、Memory `summary`、危机内容、邮箱、支付、诊断字符串、完整加权公式、`intervention_probability`、现在开口指令。

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

### H.3 L2 若拍板 · 可上传的结构化特征（白名单）

须 **独立明示同意**（≠ 备份 OTP ≠ 漏斗 ≠ Memory Consent ≠ Newsletter）。默认关。拒绝 = 永不建 Pack，本地 L0/L1 照常。

允许（计数 / 比例 / 档位，**无原文**）：

| 特征键（逻辑名） | 含义 | 禁止升格为 |
|---|---|---|
| `focus_return_rate` | 有记录窗口内完成相对开始的比例 | 「意志力差」 |
| `morning_consistency` | 上午时段完成占比 | 作息诊断 |
| `late_session_completion` | 晚间完成占比 | 「你不该熬夜练」 |
| `reflection_frequency` | reflected 次数 / 完成次数 | 反省不够 |
| `arrival_notice_tag_counts` | 封闭标签计数（calm / stressed / …） | 情绪病名 |
| `ritual_leave_rate` | 某仪式 Leave vs 完成 | 懒惰 |
| `whisper_seen_mask` | 哪些 Moment 已见（布尔） | — |
| `companion_style_preference` | 用户选过的档，或默认 `default` | 人格类型 |
| `intervention_preference` | `low` \| `medium` 与 quiet/default/warm 对齐 | 连续概率 |
| `practice_day_count_window` | 窗口内练习日数（无具体日记正文） | — |

**灰度：** 不足样本（例：<10 次完成）→ 不下发 insight，不上传或上传 `insufficient: true` 而不带易去匿名化的稀疏组合。

可识别身份（邮箱）只走既有 OTP 备份通道，**不要**做 YPE 主键的默认方案。L2 身份须另拍板（很可能复用邮箱但 **用途分开披露**）。

### H.4 本机派生、可给 L1、默认仍不上云

- Memory `rankHint` 本地计算结果  
- insight 对象在展示给用户之前的草稿  

---

## I. Versioning（算法 v1 → v2 时用户 profile）

| 规则 | 口径 |
|---|---|
| Pack `schemaVersion` | 客户端不认识 → 静默用本地政策；禁止崩、禁止逼升级才许 Sit |
| `packVersion` | 仅去重；旧包不覆盖新本地用户选择（用户刚改成 `quiet` 则云不得用过期 Pack 改回） |
| 算法服务端升级 | 可换秘密公式；**须**保持 Pack 字段向后兼容，或升 schema 并双写一段时间 |
| Forget / 关同意 | 服务端对应特征与 Pack **删除**；本地 Memory 真删不依赖云确认 |
| 卸装 | 本机记忆没了（与 Memory 文档一致）；云端若曾有 Pack，关同意或账号删除时清 |

---

## J. Failure

| 故障 | 行为 |
|---|---|
| 云不可用 / 超时 / 4xx | Sit 与 Confide **不停**；沿用本地 Pack 真源或出厂 `default` |
| 未知 schema | 丢包 |
| Local AI 不可用（低配 / 窄屏 / 卸载） | 检索语料 + 已审仪式；YPE **不得**假装层 3 回指 |
| Memory 文件损坏 | 不注入、不编造；可空列表；**禁止**为恢复而自动上传残骸到云 |
| Pack 与本地 Memory id 对不上 | 忽略该 `rankHint` |
| 安全阀命中 | YPE 整段跳过（不检索、不改政策、不「温暖地」盖过转介句） |

---

## 4. 明确不做（V1 架构期）

- 写 Policy Pack 存取代码、Worker 新路由、retrieve 重写、Speak 概率（L0 **未做**这些）  
- 把 YPE 并进品味层 payload 或练习备份 6 key  
- 主动开口「我记得你该坐了」  
- 每用户微调 Qwen  
- 把 Journey 列表变成 Yin 的诊断报告  
- 用 YPE 改状态机合法转移  

---

## 5. 实现顺序（设计意图 · 非本 PR）

1. **本文方向锁**（#451）。  
2. 继续：AG 1d/1e 人工、AF 人工、Qwen runtime **另一条线**、品味层 Quiet Line **另一条云**。  
3. 口令「开工 Yin Personalization Engine」→ **L0 接口已开工**（现有门闩收口，行为不变）。  
4. 口令「开工 L1」→ **L1 检索契约已开工**（可单测、可 Forget、可离线）。  
5. **L2** 须单独产品会：同意文案、白名单、Worker、后台三问。未开会 = 不做。

生命感仍看 Memory 三问（接住了吗 / 还像阿寅吗 / 像记得我吗）。YPE 第四问（以后才测）：**像知道何时不说话吗？** ——用确定性沉默验收，不用概率。

---

## 权威交叉

- Memory：`YIN_PERSONAL_MEMORY.md`  
- 本地 AI 场景 / CI：`LOCAL_AI_SCENARIOS_V1.md` · `CONFIDE_EXECUTABLE_INTENTS.md`  
- 品味层（对照、禁止混桶）：`task-briefs/task-cloud-taste-layer.md` · `PROCESS.md` Backlog「云端品味层」  
- 练习备份（对照）：`task-briefs/task-practice-memory-cloud-backup-a.md`  
- 四层路由：`PRODUCT_POSITIONING.md`  
- 场景 Y / Z / AE / AF / AG：`SCENARIO_TESTS.md`  
- 后台网络：`BACKGROUND_NETWORK.md`  
- 冲突扫描：`FEATURE_CONFLICT_REVIEW.md`
