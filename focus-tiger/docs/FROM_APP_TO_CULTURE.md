# Focus Tiger · From App to Culture

> **状态：方向锁（2026-08-27 · 2026-09-04 PO 修订）** — 长期方向，不是发版承诺，也不是「本 Sprint 已开工」清单。  
> **本文件不改运行时、不改 UI、不新增 entitlement。** 开工仍须独立 Brief / 口令（一次一任务）。  
> **内部战略名**：From App to Culture。  
> **探索句（内部，非对外 slogan 锁）**：Focus Tiger is exploring a quiet digital culture around conscious practice, gentle growth, and shared presence.

**层级**：从属于 `PRODUCT_POSITIONING.md` 与 `PRINCIPLES.md`。本文件**不得**绕过「用户体验第一」「不制造焦虑」「诚实机制」「宁静型游戏化」「经济可持续」「一般身心练习不是诊疗」。品牌对外一句话仍以定位稿为准。

**因果方向（2026-09-04 · Product Owner 废除「证据后才产品化」）**：App 内的安静社交与共修能力**会**影响用户在 Slack 实验室里怎么相处。产品先把「我不是一个人、也没有被社交绑架」做进 App；Slack 是炉火与语言实验室，**不是** App 能否产品化的前置证据门。旧 §4.2 / §10.3「有 Slack 信号才允许产品化」**作废**——那不是 PO 要求，不得再当硬闸。

**一句话**：现在不要建设一个吵闹的文化平台；现在要在 App 里创造可关、可选、诚实的共享在场，让安静连接有机会从使用中长出来。

```text
Culture ≠ Social Network
Culture ≠ More AI
Culture ≠ More Gamification
Culture ≠ UGC Platform
```

---

## 0. 冲突扫描（文档锁 · 无运行时）

对照 `SCENARIO_TESTS.md`：场景 Z Journey、Collections / 寅币、Stay in touch / Join our community、Confide / Memory。

| 轴 | 判断 |
|---|---|
| **a. 强度** | 本锁不增加点击或仪式。无冲突。 |
| **b. 人设** | 与「陪伴非监督 / 觉察非评分」同向。无冲突。 |
| **c. 职责** | Practice Identity / 故事型 Objects **不得**与练习徽章、芥子印、清供 8 再开第三套互相攀比的运行时（职责表见 §13）。Join our community 已接线 Slack 邀请外链（`communityLink.js`）。Slack **不**替代 App 社交。 |

---

## 1. 我们到底想创造什么

Focus Tiger **不应该**长期竞争成「又一个 mindfulness app」，也**不应该**主要竞争「谁的 AI 更聪明」。

真正值得探索的壁垒是：

> **一种生活方式 + 一种审美 + 一种实践文化 + 一种人与人之间的温和连接。**

### 1.1 探索定位（内部）

> A quiet digital culture for people who want to live more consciously.

可作宣传站/副标**候选**，**不是**现网 App 已交付的社区能力声明。

可考虑的对外分层：

| 层 | 句子 | 现网是否可声称 |
|---|---|---|
| 个人实践 | Practice alone. Grow quietly. | **可以**（与定位稿使命一致） |
| 共享在场 | Meet others who do the same. | **现在不行**（指向 Slack 实验室 / 未来 Lanterns，禁止写成已上线 App 社交） |

### 1.2 明确不锁的品牌名

下列**不是**正式文化运动名、用户身份头衔或 Slack 服务器对外品牌：

- **The Yin Way**（运动名）
- **Awakeners** / Awakener

已接线的身份水印 **Walking the Yin Way?**（Collections 副标 / 首次 Reflect / Quiet Line 导出）**继续有效**，见 `PRODUCT_POSITIONING.md`「品牌精神句」。那是产品表面印记，**不等于**把「The Yin Way」升格为社区/文化官方名称。用户若在 Slack **自发**使用这些词，记入验证信号；产品**不**带头锁死。

### 1.3 我们不是什么（功能闸）

每增加一个功能，先问：会不会把我们变成下面之一？

| We are NOT | 已有红线 / 邻接 |
|---|---|
| Social network（Follow / Like / Feed / DM / 粉丝） | `PRINCIPLES` 不制造焦虑；Finch 式社交反噬 |
| Productivity tracker | 定位稿：不是待办/效率监工 |
| AI therapist / AI life coach | 禅意倾听者；Wellness disclaimer |
| Meditation content library | 不做 Calm/Headspace 内容军备 |
| Competitive fitness / streak machine | 宁静型游戏化；禁止强迫签到 |
| Slack community disguised as an app | Slack = 炉火实验室，不是产品本体；**反向也不成立**：不得把 Slack 伪装成「App 社交必须先在这里验证」的闸 |
| Habit streak / 财富排行 / Level 升级 | 寅币不是社交货币；Identity ≠ Level |

---

## 2. Culture Principles（六条）

与 `PRINCIPLES.md` 硬红线互补：硬红线管「绝不能做」；本表管「文化层怎么选」。冲突时：**用户体验第一**（`PRINCIPLES.md`）胜文化表；保护性硬红线仍胜「为了热闹而社交」。

| # | 原则 | 含义 | 设计时禁止 |
|---|---|---|---|
| **01** | Quiet over noisy | 不追求信息量 | 红点轰炸、信息流、trending |
| **02** | Presence over performance | 不强调表现 | 排行榜、谁练得最好、公开分钟数对比 |
| **03** | Growth without judgment | 成长但不评分 | Level、真假专注分、人格评级 |
| **04** | Personal before social | 个人体验优先于社交 | 为社交改写核心 Sit / Confide / Memory |
| **05** | Participation over consumption | 鼓励创造，而非只消费 | 把用户只当内容受众；过早开放不可审 UGC |
| **06** | Connection without obligation | 连接，但没有社交压力 | 关注义务、回赞、FOMO 共修、不可关的在场 |

**06 是社区设计的核心原则。** App 内若做共享在场，必须可关、匿名聚合、诚实数据。

---

## 3. 已有种子（串起来，而不是再堆功能）

| 种子 | 权威 | 文化角色 |
|---|---|---|
| Yin / 正念伙伴 | `PRODUCT_POSITIONING` · `CHARACTER_BIBLE` | 关系，不是宠物 KPI |
| Five Moments | `PRODUCT_MOMENTS` | 一天的实践语法 |
| Journey | `DESIGN` / 场景 Z | 安静回顾，不是成绩单 |
| Insight Spark / Quiet Line | PROCESS / Briefs | 可带走的语言碎片 |
| 寅币 | `FOCUS_COINS.md` | **个人象征货币**（自觉相处过的时间），不是 Shop |
| Yin's Collections / 清供 8 | 同上 | 案头雅物；可加 meaning layer，不推翻现表 |
| Ambient + **本地上传** | `task-user-ambient-upload-v1` | 私域创造入口；**不是** SoundCloud |
| Local-first / 练习备份 | 备份 Briefs | 隐私与永不消失的地基 |
| Confide / Memory / YPE | 各自 SSOT | 被理解，不是被优化；**平行主线**（§7） |
| Join our community | `NEWSLETTER_CAPTURE.md` | 已接线 Slack 邀请外链（`communityLink.js`） |
| Global Lanterns | `PROCESS.md` Backlog | Alone, together 的**优先产品切片**；排期由口令 / Brief，**不**再等 Slack 证据门 |

文化工作的价值是给这些种子一个**可验证的意义系统**，不是再开一条功能轨。

---

## 4. 四档：已采纳运营 / 产品方向已锁 / 远期 / 禁止

### 4.1 已采纳，可运营 / 可设计（默认仍不在本文件写运行时）

| 项 | 做什么 | 不做什么 |
|---|---|---|
| 本方向锁 | 本文 + 定位/寅币/社群交叉引用 | 白皮书膨胀、未立项改 UI |
| Slack 实验室 | Join our community 已接线 Slack 邀请外链；目标 ≈ **100 个真正在乎的人**，不是 5000 挂名 | 当客服论坛；15 个频道；大规模宣传「社区平台」；**当作 App 社交的开工许可证** |
| Culture prototypes（设计师） | Objects / Identity / Quiet Social 概念稿；PO 评审见 §13 | 把概念稿当成已上线；一次 PR 做完全部社交栈 |
| 寅币语义 | 文档层：时间被收藏；余额不在 Profile 炫耀 | 改发点公式、改清供价、改商店口吻 |

### 4.2 产品方向已锁 · 排期由 PO / 口令决定（2026-09-04 废除证据门）

> **作废**：旧表「若 Slack / 研究出现 X，才考虑产品化 Y」。  
> **现行**：下列能力**允许**按体验优先级产品化。观察 Slack 仍有用（语言、自发仪式），只作**事后理解**，不作前置闸。诚实人数、可关、Social 可选、无排行——这些是体验约束，不是证据门。

| 能力 | 产品化姿态 |
|---|---|
| **Global Lanterns / Quiet Together** | **优先切片**（真实人数或诚实「灯火」、可关、禁止假共修冒充） |
| Collections meaning layer + **Practice Identity** v0（≤8，非 Level） | 设计方向采纳；运行时须职责表，另 Brief |
| **Quiet Circles / Focus Circle**（3–8，无聊天） | 社交基础设施；排在匿名同坐之后或紧随 |
| 系统 **Shared Ritual**（如 Sunday Reset） | 先于用户自建仪式创建器 |
| **User-created Rituals** | 方向采纳；复杂度高，勿与第一刀同 PR |
| Curated Ambient / 公开库 | 仍高版权与审核风险；可排期讨论，**默认不做 Gallery / 评论** |

### 4.3 长期 Backlog（不自动开工）

Shared Yin / 共同数字物、Creator ecosystem、公开 Ambient 库、Yin's Gentle Match。继续受 `PROCESS.md` UGC 约束与 §13 风险表。

### 4.4 明确禁止（本探索期内）

- App 内 Follow / Feed / Chat / Groups / Comments / DM  
- 寅币当社交货币或公开财富  
- Identity 写成「因为你完成了 287 场所以你是 Deep Listener」  
- 伪造在场人数  
- 把 Memory / Journey / Confide / 情绪数据送进 Slack  
- 为文化项目捆绑大改 Local AI  
- Gallery / 排行 / Creator 分成 / Slack 假扮成 App

---

## 5. 潜在演进路径（产品判断，不是 Slack 许可证）

```text
Personal Practice（现网主线，必须始终完整可独处）
        ↓
Shared Presence（Lanterns / Quiet Together · 优先 App）
        ↓
Small Circle（Focus / Quiet Circles · 熟人基础设施）
        ↓
Identity（behavior reflection，非升级）
        ↓
Shared / user Rituals（先系统仪式，后创建器）
        ↓
Slack 实验室（被 App 行为塑造，而非反向发卡）
        ↓
UGC（Private Ambient → Export → Curated；最晚）
```

飞轮假设：practice → 感到并非独自一人 → 少数人同坐 → 偶尔创造/分享 → Slack 里出现共同语言。个人 Yin relationship + Practice + AI + Journey **不得**被社交做成必选项。

---

## 6. PHASE 地图（排期纪律）

```text
PHASE 0  战略定义          ← 本文（含 2026-09-04 因果纠正）
PHASE 1  文化原型 + PO 评审 ← 设计师稿；§13 已评一版
PHASE 2  Slack 实验室      ← 并行运营；观察，不作开工门闩
PHASE 3  产品化            ← 按 §13 优先级切片（先 Presence，后 Circle…）；须 Brief
PHASE 4  生态化            ← Ambient UGC 公开层等；最晚、最高风险
```

**PHASE 1 不是三个工程任务。** 工程切片仍一次一任务。

**近程工程主线**仍可以是 Confide、Memory、YPE、Checkout、Collections QA；**安静社交不再「默认暂停直到 Evidence Review」**。插队仍须口令，避免与地基抢同一 PR。

---

## 7. Local AI 是平行主线

文化战略**只规定 AI 应服务什么文化**，不规定「文化项目开始后 AI 一起大改」。

| 文化期望 | AI 不该变成 |
|---|---|
| 被看见、被记住（经同意） | 更聪明的监工 / 治疗师 / 生活教练 |
| 观察式短句 | 无约束生成仪式文案（仍未拍板） |
| 本地优先：没网阿寅仍在 | 云端才能陪伴 |

近期 AI 优先级（不在本文件开工）：P0 Confide + 自然语言执行（Forget / 记得什么）；P1 Ask Your Journey、Presence reflection；P2 Reflection 后一句观察；P3 Ritual generation 继续谨慎。权威仍是 `PRODUCT_POSITIONING` 禅意倾听者、`YIN_PERSONAL_MEMORY.md`、`YIN_PERSONALIZATION_ENGINE.md`、`CONFIDE_EXECUTABLE_INTENTS.md`。

---

## 8. Slack = culture laboratory（不是产品）

**已接线（2026-08-29）**：菜单 **Join our community** → `communityLink.js` 永不过期 Slack 邀请链接。成本低、可逆、验证价值高。

### 8.1 第一阶段目标

Find the first **100 people who care about what Focus Tiger stands for.**  
不是 1000 Slack members。对外可称 **Early Yin Community** / culture laboratory，**禁止**宣传成社区平台。

### 8.2 第一阶段：5-space architecture（2026-08-29 · Culture Design Review）

> **历史**：此前 §8.2 为扁平 5 频道表（`#welcome` / `#quiet-room` / `#ambient` / `#journeys` / `#the-den`）。**2026-08-29 由 Culture Design Review 更新**为下列心理旅程架构；Slack 频道须按此重组，**禁止**并列保留旧频道。

一级空间**最多 5 个**。不新增 `#general` / `#random` / `#off-topic` / `#announcements` / `#memes` / `#events` / `#support` / `#feedback`——若将来需要，一律作为二级 thread / collection 解决。

| 空间（Slack 频道建议名） | 心理层 | 用途 | 二级主题（thread / pinned / 子帖，非一级频道） |
|---|---|---|---|
| 🌱 **Newcomers** · `#newcomers` | **Arrive** | 入口：「我刚进来，该干什么？」**不是**长期闲聊区 | Welcome · How Focus Tiger Works · Meet the Community · Introduce Yourself |
| 🧭 **Journey** · `#journey` | **Grow** | 我的成长；安静回顾，不是成绩单 | My Journey · Small Wins（**不得**升为一级空间）· Reflections |
| 🧘 **Focus & Flow** · `#focus-and-flow` | **Practice** | 共同探索专注与心流；知识与实践社区 | Focus Sessions · Flow Stories · Focus Techniques · Questions & Insights（**仅实践类**问题） |
| 🌙 **Quiet Room** · `#quiet-room` | **Just Be** | 差异化空间：不必说话、不必回复、不必表现 | Just being here · A quiet place to pause · 允许只发 🌙 或 “Here for a moment.” |
| 🐯 **The Den** · `#the-den` | **Belong** | 社群归属；Yin 是 spirit / companion，不是管理员专栏 | Yin's Messages · Weekly Reflection · Community Chat · Casual Conversation |

**整合映射（旧 → 新）**

| 旧概念 | 归入 |
|---|---|
| 🌿 Start Here + Community → Introductions | 🌱 Newcomers |
| 🌱 Journey / My Journey / Small Wins / Share your progress | 🧭 Journey（Small Wins 为子主题） |
| Focus & Flow / Focus Sessions / Flow Stories | 🧘 Focus & Flow |
| 🌙 Quiet Room | 🌙 Quiet Room（定义加强） |
| 🐯 Yin's Corner / 🌎 Community 闲聊 | 🐯 The Den（**The Den** 取代 Yin's Corner 为一级名） |

### 8.3 心理旅程（比「频道分类」更重要）

```text
                    FOCUS TIGER
                    COMMUNITY
                         │
        ┌────────────────┼────────────────┐
        │                │                │
     ARRIVE           PRACTICE         GROW
        │                │                │
   🌱 Newcomers    🧘 Focus & Flow    🧭 Journey
        │                │                │
        │          🎧 Ambient Atelier   Small Wins
        │                │                │
        └────────────────┼────────────────┘
                         │
                    JUST BE
                         │
                  🌙 Quiet Room
                         │
                    BELONG
                         │
                    🐯 The Den
```

用户路径：**Arrive → Practice → Grow → Be → Belong**。设计的是 Focus Tiger 用户的心理旅程，不是 Discord 式频道堆叠。

### 8.4 Ambient Atelier（体验层 · 不占一级空间）

🎧 **Ambient Atelier** 是 **Content / Experience Layer**，不是 Community Layer。性质是「听」，不是「聊」。

- **禁止**升为第六个一级 Slack 频道。
- **建议落点**：Slack 侧栏 **Home / Canvas** 或 workspace 描述区的**固定入口**（分隔线以下），与五个一级空间并列展示、但不占频道位。
- 内容方向：Ambient sounds · Focus music · Nature loops · Yin's soundscapes；用户进入后**可以不说话**。
- 与产品路径一致：`Private → Export/Share → Curated Community`（§11）。现网 App 本地上传已够个人创造；公开层因版权/审核风险默认不做，**不是**因为缺 Slack 证据。

若须在 Slack 内收纳链接，可用 `#focus-and-flow` 置顶帖指向 Atelier 合集，**不**单独开 `#ambient`。

### 8.5 禁止变成 Support Forum

Bug / payment / feature request / technical support **另走**（现有邮件 / Support FAB / GitHub，不在本锁规定新系统）。Slack 是「喜欢这种生活方式的人」，不是客服中心。

**禁止**把 Private reflections、Personal Memory、Journey 明细、AI 对话贴进 Slack。完整公约（Quiet Room 规则、Support 分流、隐私红线）见 **`SLACK_COMMUNITY_GUIDELINES.md`**。

---

## 9. PHASE 1 文化原型（只设计，不 Runtime）

Designer Brief，**禁止**本锁附带工程实现。

### Prototype A · Yin Objects（8–12）

给**现有**清供 / 珍藏增加 meaning layer，不推翻 `FOCUS_COINS.md` 清供 8。每件只填：

| 项 | 例 |
|---|---|
| Object | The Empty Cup |
| 获得条件 | 7 days of showing up（须可解释、非刷分） |
| 代表什么 | Learning to leave space |
| 一句文案 | For the days when you did less, and noticed more. |
| 可展示 | Yes |
| 可交易 | **No** |
| 与付费绑定 | **No** |

### Prototype B · Practice Identity（≤8）

**不要叫 Level，不要升级。** 身份 = reflection of behavior，让人觉得 “this somehow feels like me”，而不是完成场次换称号。候选气质（未锁文案）：Gentle Beginner、Quiet Returner、Morning Keeper、Night Wanderer、Deep Listener、Still Point。须与练习徽章 / 岁月印记做职责表，避免三套并行。

### Prototype C · Quiet Social

**第一刀优先匿名同坐（Lanterns / Quiet Together），再做 Circle。** 若做数字，必须**真实**；假人数违反诚实机制。与 Global Lanterns Backlog 同向。测的是「有人在、但不必说话」，不是技术秀。

---

## 10. Culture Observation（可选 · 不作开工门闩）

观察 **用户创造了什么**，以及 App 上线后 Slack 语言是否被塑造。不把下列指标当 DAU 替代 KPI 去优化刷数。**不得**用「还没观察到」否决已锁的产品方向。

### 10.1 Culture Signals（手工即可）

| 信号 | 意义 |
|---|---|
| Slack join rate（从 App 外链） | 是否愿意进一步连接 |
| 7-day active members | 是否真社区 |
| 主动发帖率 | 是否产生文化 |
| Ambient 分享数量 | 是否产生 UGC |
| 自发使用 Yin / Focus Tiger 术语 | 是否产生语言 |
| 主动分享 Objects / 身份说法 | 是否产生身份 |
| 用户发起共同练习 | 是否产生 Ritual |
| 用户邀请朋友 | 是否产生弱网络效应 |

**尤其看后三项**——用来理解文化是否在长，**不是**「没有就不做 App Social」。App Social 的目的之一，正是让后三项更可能发生。

### 10.2 强文化形成句（定性）

若出现类似：

- “I did my morning sit with Yin.”
- “I finally got my Empty Cup.”
- “Anyone joining the Sunday quiet hour?”
- “I haven't practiced for two weeks, but Yin was still there when I came back.”

用户开始用产品语言描述自己的生活。这比人数更重要。

### 10.3 Culture Observation Review（可选回顾，约运营数周后）

| Q | 问 |
|---|---|
| Q1 | 用户是否主动讨论理念？ |
| Q2 | 是否主动分享 Ambient？ |
| Q3 | 是否愿意共同练习？ |
| Q4 | 是否使用 Yin / Objects / Practice 等语言？ |
| Q5 | 有没有用户自己发起 Ritual？ |
| Q6 | 有没有用户主动邀请朋友？ |

用来调整**下一刀切片与文案**，**禁止**写成「无信号 → 不做 Social」。独处体验仍必须完整（Social optional）。

---

## 11. PHASE 3 产品化时仍须守住的心智

寅币路径若接 meaning layer：

```text
Practice → Yin Coins → Meaningful Object → Story → Identity
```

寅币保持 **personal symbolic currency**。Profile 若将来做，优先 Objects / Days returned / Practice identity，**不**强调 Yin Coins: 4,827。余额可继续存在于 Collections 抽屉（现网），禁止做成社交财富。

Global Lanterns：Presence without exposure；必须可关。**第一刀**只在 Idle / Arrive 背景级（与 `PROCESS.md` Backlog 一致），避免抢 Focusing。若日后要做极慢静态呼吸感背景，须单独评视觉抢戏，**不是**用「文化红线」永久封死。

Ambient：**Private → Export/Share → Curated Community**。公开层会立刻碰到版权、审核、排序、存储、分成。现网本地上传已够 PHASE 1。不要急着变成 SoundCloud。

---

## 12. 下一步（本锁之后 · 非本 PR 自动开工）

1. ~~**设计师**输出 Prototype A–C + Slack 概念 → Culture Design Review。~~ **五空间 IA 已锁**（§8.2，2026-08-29）；公约草案见 `SLACK_COMMUNITY_GUIDELINES.md`。设计师 Quiet Social / Identity / Rituals / 8 条 Social 主意的 **PO 评审见 §13**。  
2. **Slack workspace 运营**：按 §8.2 重组频道 + 贴公约 pinned 文案；Join our community **App 外链已接线**（`communityLink.js`，2026-08-29）。App 社交上线后，用 Slack **观察**语言变化，不反向发卡。  
3. **工程**：安静社交第一刀须独立口令 + Brief（建议：**Quiet Together / Global Lanterns 匿名同坐 MVP**）。未口令不得把 Lanterns / Circle / Identity / Gallery 塞进地基 PR。

口令示例：「评估 / 开工 Global Lanterns」或「开工 Quiet Together MVP」。**不再**要求 Evidence Review 豁免。

---

## 13. Product Owner 评审（2026-09-04）· 设计师 Quiet Social 包

对照：`PRODUCT_POSITIONING` 陪伴/同坐；`PRINCIPLES` 用户体验第一、不制造焦虑、宁静型游戏化、Social 必须可关；现网 Join our community、Support / Buy Yin a Tea、Presence Signals、Reflection、Journey、Confide、Stay in touch。**本文件不改运行时。**

总判断：产品**不适合**做成传统 Productivity 社区。应增强「我不是一个人在坚持，也没有被社交压力绑架」。设计师两套稿**气质同向、条目大量重叠**，须合并成一条路线，禁止按清单平行开工。

### 13.1 应整体采纳的设计哲学（五条）

这些是**体验约束**，不是「不顾体验的红线」：

1. Presence > Interaction（默认无聊天室）
2. Recognition > Performance（看见出现，不表演成绩）
3. Collective Creation > Competition（共同场景，不要分钟排行）
4. Small Circle > Public Network（先 3–8，不要广场 / Feed）
5. Social Should Be Optional（一个人用必须完整）

### 13.2 条目裁决

| 主意 | 合理性 | 可行性 | 主要风险 | 裁决 |
|---|---|---|---|---|
| **Global Lanterns**（异步灯火） | 高；Alone, together | 中：匿名聚合后端 + 可关 + 诚实人数 | 假灯火；Idle 抢戏；Focusing 抢戏 | **采纳为第一刀方向**。MVP：开启专注即点灯 + Idle/Arrive 存在感 + 人数或灯火隐喻；轻触涟漪可第二刀。Focusing 内背景**不当第一刀** |
| **Quiet Together**（实时同坐人数） | 高；与灯火同一心理 | 中：与灯火应**共用** presence 计数，勿两套全球房间 | 实时房间暗示聊天；离开关播 | **与 Lanterns 合并成一个 MVP**（匿名加入、结束自动离开、不聊天、不广播离开） |
| **Quiet Circles / Focus Circle**（3–8） | 高；长期关系基础设施 | 中高：暗号/深链、成员、隐私、无账号基线冲突 | 变成微信群；在线精确追踪；无账号难邀请 | **采纳方向，第二阶段**。邀请走外部渠道；无聊天；状态只模糊（sitting / was here today）；必须隐身 |
| **Focus Presence**（圈内环境感知） | 高 | 依赖 Circle | 精确时长比较 | **挂在 Circle 上**，不单独做全球好友在线 |
| **Gentle Witness** | 高、成本相对低 | 低–中：固定短语 + 一次回应 | 变相点赞墙 | **Circle 之后立刻做**。固定痕迹，每条最多一次回应 |
| **User-created Rituals** | 方向对，过重 | 低（近期）：流程编排 + 日程 + 通知 + RSVP + 纪念卡 | 通知压力；UGC 审核；与现有微仪式抢职责 | **方向采纳，不进前两阶段**。先做**系统** Shared Ritual（Sunday Reset 一类），再考虑创建器 |
| **Shared Ritual**（P2-7） | 高；比用户创建器更适合 | 中 | 缺席羞辱 | **第三阶段**；允许不同时、不完成；禁止 challenge failed |
| **Practice Identity ≤8** | 高；正念镜像，反 Level | 中：14 天窗口要行为数据；与徽章/印记/清供职责重叠 | 收集癖；社交比较称号；部分身份依赖尚未存在的社交 | **采纳设计锁**：平权、无经验条、不展示未触发列表、可锁定。运行时**晚于** Presence；Gatherer / Ritual Weaver 等依赖社交的身份随对应能力再亮 |
| **Async Companion** | 中高 | 中 | 与灯火轻触、Witness、茶饮祝福三重叠 | **并入** Circle 轻量痕迹 / 灯火致意，不单开长文本 |
| **Collective Echo** | 高（归属而非比较） | 中：k-匿名、最小样本 | 小样本Deanonymize；评价性文案 | **有足够聚合量再做**；接 Arrival Notice，禁止百分位比较 |
| **茶饮祝福 + Buy Yin a Tea** | 中；接现有 A 轨 | 中：预审、随机展示 | 挡结账；审核；变相留言板 | **增强现有 Support**，不新建社交图。结账路径保持一键；寄语可选且默许匿名；祝福卡可关 |
| **Yin's Gentle Match** | 长期差异化 | 低（近期） | 账号、匹配伦理、Tinder 联想 | **远期**；第一阶段禁止「加好友漏斗」 |

### 13.3 明确不采纳或须改掉的细节

- 全球排行、精确专注分钟对比、离开房间广播、默认聊天、8/8 身份收集条、未参加者点名、Circle challenge failed。
- 第一阶段自由长文本（审核 + 回复义务）。
- 把 Slack 实验室当成产品化许可证。
- 与练习徽章 / 岁月印记 / 清供 8 **再开一套可攀比的成就墙**（Identity 只反射，不升级）。

### 13.4 建议路线（最佳安排）

```text
刀 0  本文政策（本 PR）——废除证据门；锁哲学与优先级
刀 1  Quiet Together ∪ Global Lanterns MVP（匿名同坐人数 + Idle/Arrive 灯火；可关；结束离开）
刀 2  Focus Circle + Focus Presence + Gentle Witness（3–8；暗号邀请；模糊状态）
刀 3  Support：可选匿名单句 + 可关的茶饮祝福；Buy Yin a Tea 仍一键支付
刀 4  系统 Shared Ritual + Practice Identity 反射（无收集条）
刀 5  用户仪式创建器 / Collective Echo / Gentle Match —— 各需独立 Brief
```

**我认为最合理的第一工程口令**是刀 1（Quiet Together ∪ Lanterns），而不是先做 Circle 或仪式平台：一个人打开 App 就能感到「有人在」，且不要求通讯录、账号图谱或通知系统。

