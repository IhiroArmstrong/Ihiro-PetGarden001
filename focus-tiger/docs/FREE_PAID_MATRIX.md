# Focus Tiger · 功能 × 免费/付费对照表

> **状态：方向锁 / SSOT（2026-08-10）** — 功能×档位×接线差距对账的权威表；产品策略红线仍以 `MVP_PRODUCT_DEFINITION.md` §五为准，本表负责对账与落地差距可视化。  
> **范围**：整理「功能归属 + 文档口径 + 代码接线现状」；**不含**价格列（$9.99 / $89.99 等为展示用、未锁定，另处跟踪）。  
> **禁止**：改本表任务不改 `FEATURE_CATALOG` / 运行时；改档位先改产品文档再改代码。

## 权威从属

| 层 | 文件 | 管什么 |
|---|---|---|
| 产品策略 / 红线 | `MVP_PRODUCT_DEFINITION.md` §五 | 双轨心智、免费底线、不卖清单 |
| 工程商业化细则 | `task-briefs/task-tech-direction-v1-shell-monetization.md` | A/B 入口、零耦合、到期降级 |
| 工程 catalog | `src/core/entitlement/entitlementRegistry.js`（`FEATURE_CATALOG`） | featureKey → requiredTier / type |
| **本表（方向锁 / SSOT）** | `FREE_PAID_MATRIX.md` | 功能×档位×接线差距对账 |

## 心智模型（硬 · 与 #216 对齐）

仍称 **双轨**，**禁止**「三档并存」表述：

| 轨 | 含义 |
|---|---|
| **A · Buy Yin a Tea** | 打赏；可选徽章 / 茶室留痕；**不解锁任何内容** |
| **B · 进阶内容解锁** | 深度音效 / 高级表现 / 尊贵徽章 / 进阶仪式等 |

B 下两种**付费方式**（同一套进阶权益，不是两套内容层级）：

- **Sanctuary Lifetime** — 一次买断  
- **Yin Membership** — 订阅  

全局规则：**lifetime ∪ subscription 互相覆盖**。  
**到期降级**：已生成内容（历史、已解锁纪念物、已播放仪式）永久可看；到期只停「新内容持续解锁」与「进阶功能继续使用」。

### 本表档位取值

| 取值 | 含义 |
|---|---|
| `free` | 免费；不得付费墙 |
| `tip-only` | A 轨；打赏相关，**非**内容解锁档 |
| `lifetime∪subscription` | B 轨进阶；买断或订阅同等访问 |

若 catalog 字面 `requiredTier: 'subscription'`，产品档位仍写 `lifetime∪subscription`，并在「Catalog / gate」注明字面值 + 全局互覆盖。

### 「代码落地」取值

| 取值 | 含义 |
|---|---|
| **已接线** | 产品路径会按档位真拦或真放行（含菜单锁 / `isEntitled` 消费） |
| **部分接线** | catalog / gate / UI 有一部分，但消费不全或场景未挂 |
| **未接线** | 文档或 catalog 已定，产品路径尚未按档位拦/放 |
| **不适用** | 无 entitlement key；默认开放或明确非内容 gate |

**读表原则**：勿把「文档说要收费」与「代码已经真的拦了」混为一谈——看「差距说明」列。

---

## 表 A · 功能 × 档位 × 接线现状

### A1 · 免费底线（不得付费墙）

| 功能 / 资产 | 产品档位 | 付费方式备注 | Catalog / gate | 文档口径 | 代码落地 | 差距说明 |
|---|---|---|---|---|---|---|
| Yin 陪伴 / 基础 Idle（闭目呼吸→眨眼） | `free` | — | 无 key（主线默认） | 不得付费墙 | **已接线** | 主线开放；无付费门 |
| Arrival Practice | `free` | — | 无 key | 不得付费墙 | **已接线** | — |
| Focus Timer / Sit→Focusing / Rise | `free` | — | 无 key | 不得付费墙 | **已接线** | — |
| Honesty Check-in | `free` | — | 无 key | 不得付费墙 | **已接线** | — |
| 每日首次庆祝 / 轻完成反馈 | `free` | — | 无 key（庆祝主路径） | 不得付费墙 | **已接线** | — |
| Basic Reflection（结束反思 + 共鸣短句） | `free` | — | 无 key | 免费；禁 AI / 付费 CTA | **已接线** | — |
| Breath Practice（首页左球） | `free` | — | 无 key | 与进阶仪式分立；免费 | **已接线** | — |
| Journey Log（基础 · D′） | `free` | Daily Card 存图亦免费 | `journey.log`（free / persistent） | 免费基础留痕 | **部分接线** | UI/store 已合。**Daily Card** Brief `task-journey-daily-card.md`。**上限：免费/付费统一 30（有意取舍，不做付费更高上限）**；永久档案靠 Save image；B 勿卖「无限历史」。云端兜底见下行「练习记忆 · 云端快照备份」 |
| 练习记忆 · 云端快照备份 / 恢复（防丢失） | `free` | **非** B 内容解锁；邮箱 OTP + practice-backup deviceToken | Brief + Worker `PRACTICE_BACKUP_KV` | A 档静默整包快照（6 key）+ 空库恢复；关闭=删云端 | **已接线** | **#272** tip `a195584`；生产 Worker redeploy Version `f9755950-49c9-4677-99d6-76fd2d9d7012`（含 `PRACTICE_BACKUP_KV` / `OTP_KV`）。**2026-08-13**：生产已补 `RESTORE_OTP_PEPPER` + `RESEND_API_KEY`；用户书面绑邮箱收到码且 Enable 成功（非关单）。未绑/未同意=无兜底。TRACKER 仍待空库恢复 / 关备份。 |
| Daily Wisdom（每日一句） | `free`（基础句）+ B 可叠静默印花 | 印花 = lifetime∪subscription | `content.daily-wisdom`（free / ongoing） | 免费句；Sanctuary 印花委婉 | **部分接线** | `resolveTodayWisdom` 内已 `isEntitled`；**Phase A 已挂 Reflection 底**；Phase B 印花未做。Brief：`task-daily-wisdom-reflection-mount.md` |

| MilestoneGlow 播放记账 | `free` | — | `milestone.glow.played`（free / persistent） | 免费里程碑表现 | **部分接线** | catalog 有；产品 Glow 路径已存在；ownership 是否处处 claim 视实现，非 B 门 |

### A2 · A 轨 · Buy Yin a Tea（打赏 · 不解锁）

| 功能 / 资产 | 产品档位 | 付费方式备注 | Catalog / gate | 文档口径 | 代码落地 | 差距说明 |
|---|---|---|---|---|---|---|
| Tip / Tea Checkout | `tip-only` | 一次性 tip；可多次 | `tipJarGate`（**非** FEATURE_CATALOG） | A；不解锁内容 | **已接线** | Unlock UI + Worker；与 Sanctuary 零耦合 |
| 善意徽章（Tea） | `tip-only` | 打赏后按练习授枚 | tip `badgeIds` | 可选纪念；不解锁 | **已接线** | 与 Sanctuary 章视觉分立 |
| Tea Log / 再 tip 致谢动画 | `tip-only` | — | tip schema | 情绪反馈 | **已接线** | — |
| Support Yin Modal · Tea 卡 | `tip-only` | 入口 | Support Modal | 统一入口之一 | **已接线** | 场景化请茶气泡见下（增长 UX，非 B 缺口） |
| 场景化请茶气泡 | `tip-only` | 入口 | ContextualTeaTipBubble | 达标 / 里程碑轻气泡 → TipJar | **已接线** | 本地日一次；可忽略；不挡主路径；不解锁 |

### A3 · B 轨 · 进阶解锁（Lifetime ∪ Membership）

> Catalog 字面多为 `requiredTier: 'subscription'`；产品档位一律 `lifetime∪subscription`（全局互覆盖）。

| 功能 / 资产 | 产品档位 | 付费方式备注 | Catalog / gate | 文档口径 | 代码落地 | 差距说明 |
|---|---|---|---|---|---|---|
| Sanctuary Lifetime Unlock UI / Checkout | `lifetime∪subscription` | **买断 SKU** | `sanctuaryEntitlementGate` → entitlement lifetime 信号 | B 买断方式 | **已接线** | 支付/UI 已合；**≠** 下游 Ambient 已按锁消费 |
| Yin Membership 订阅产品化 | `lifetime∪subscription` | **订阅 SKU** | entitlement `subscription` cache + `membershipCheckout` + cloud provider | B 订阅方式；v1 纳入 | **部分接线** | Checkout / confirm / OTP verify / Unlock UI Manage / Support 卡已接；成功页写 entitlement cache。续费/取消 webhook（Prompt 9）+ provider/Portal（Prompt 10 · **#240 已合 tip `755d465`**）；**生产 redeploy** 待 Resend/OTP secrets；须 `STRIPE_MEMBERSHIP_PRICE_ID` + 真实 `MEMBERSHIP_KV` / `OTP_KV` |
| 统一 entitlement gate 地基 | `lifetime∪subscription` | 互覆盖引擎 | `src/core/entitlement/` | 正式产品决定 | **部分接线** | 单测 + mock 已合；**多数产品 UI 未统一改读** `isEntitled`（仪式菜单除外） |
| Morning Ritual（进阶） | `lifetime∪subscription` | Lifetime 或 Membership | `ritual.morning.access`（字面 subscription / ongoing） | B | **已接线** | Idle ⋯/抽屉 Rituals 行 `isEntitled` 锁；未授权 disabled |
| Emotional Reset Ritual | `lifetime∪subscription` | 同上 | `ritual.emotional-reset.access` | B | **已接线** | 同上 |
| Work Transition Ritual | `lifetime∪subscription` | 同上 | `ritual.work-transition.access` | B | **已接线** | 同上 |
| 仪式完成 → history / memento / copy / sfx ownership | `lifetime∪subscription` | 到期后 persistent 仍可看 | `ritual.*.history|memento|copy-unlocked|sfx-unlocked`（字面 subscription / persistent） | 到期降级策略 | **部分接线** | 完成时 `claimFeatureOwned` 已写；**独立「回看历史/纪念物」产品 UI** 是否齐全另计；无 entitlement 时无法新开仪式 |
| 深度音效全库（`ambient.deep.play`） | `lifetime∪subscription` | 免费温暖子集 **5** 首：`singing-bowl`（Mer-Ka-Ba）· `divine-life-society` · `somnia-variation-3` · `dreamland` · `frozen-in-love`；其余内置曲 B；用户自传仍免费 | `ambient.deep.play`（字面 subscription / ongoing） | B 核心权益之一 | **已接线**（#251）+ **15s 试听**（`feature/ambient-deep-audition-15s`） | Gate：`ambientEntitlement.js` + `setTrack` 硬拒 + 面板锁行。**试听**：未授权点 Deep → 约 15s（`?ambientAuditionMs=` 可缩短）→ fade out → 可忽略 Unlock 提示；**不**持久 preferred=deep；零 tip 耦合 |
| 高级情绪动画 / 场景（`emotion.premium.trigger`） | `lifetime∪subscription` | 非核心；名单另定 | `emotion.premium.trigger` | B | **未接线** | catalog 占位；dispatcher **未**按 key 拦高级表现 |
| 进阶每日解锁内容（`content.advanced.daily-unlock`） | `lifetime∪subscription` | — | `content.advanced.daily-unlock` | B 占位 | **未接线** | catalog 有；**无**产品消费者 |
| Sanctuary 尊贵徽章 | `lifetime∪subscription` | 付费/preview 起授 | Sanctuary `badgeIds`（非 FEATURE_CATALOG key） | B | **已接线** | Idle `#yin-tip-kindness-badges`：Lifetime **或** Membership 起授 ≥3（`idlePracticeBadges`）；**不**把 Sanctuary SKU `unlocked` 标真。**页面左下角 Enso**：`#yin-sanctuary-enso-mark` 已接线（lifetime∪subscription；零 tip；Focusing 淡化；装饰层不开店） |
| Support Yin Modal · Sanctuary 卡 | `lifetime∪subscription` | 买断入口 | Support → Sanctuary Checkout | B 入口 | **已接线** | — |
| Support Yin Modal · Membership 卡 | `lifetime∪subscription` | 订阅入口 | Support → Membership Checkout | B 入口 | **已接线** | 与 Sanctuary / Tea 并列；展示图暂复用 Sanctuary preview |
| 节日主题引擎（Seasonal Theme） | `lifetime∪subscription` | Lifetime 或 Membership；官方节日 `subscriberOnly: true` | `theme.seasonal.access`（字面 subscription / **ongoing**） | B；时段氛围非纪念物 | **部分接线** | catalog + 引擎 + Phase 3 UI **已合 #238**（wash + 一日一句）；总开关开 / 圣诞节 `contentReady=true`；**未购无主题**；无新 PNG 姿态 |
| 练习记忆 · 多端无缝同步（主动跨端体验） | `lifetime∪subscription` | Sanctuary Lifetime 或 Membership；**≠** 免费 A 档快照兜底 | 待立项（近实时 / 多端一致；须冲突策略） | B 档 = 「体验更好」；手机↔平板等无缝陪伴记忆 | **未接线** | **文档拍板已合 develop（#266 tip `4698348`）**。排在免费快照备份之后；合理性/可行性评估过关再排期。**禁止**把「防丢失」塞进付费墙；亦**禁止**把完整无缝同步默认做成全体免费基础设施（经济可持续）。身份仍复用邮箱 OTP，**不做**匿名 device id 跨端 |

### A4 · 增长赠品（当前按免费）

| 功能 / 资产 | 产品档位 | 付费方式备注 | Catalog / gate | 文档口径 | 代码落地 | 差距说明 |
|---|---|---|---|---|---|---|
| Digital Wallpapers | `free` | — | 无付费 gate | 免费赠送 | **已接线** | 禁止付费门 |
| Quiet Line（签文存图） | `free` | — | 无付费 gate | 增长包免费 | **已接线** | 与 Daily Wisdom 分池 |
| Zen Cinema / YouTube 入口 | `free` | — | 无付费 gate | 增长包免费 | **已接线** | — |
| Stay in touch / Newsletter | `free` | 可选留资；非账号 | 无付费 gate | 增长；不挂钩解锁 | **已接线**（Worker `fb568e27` 含 await 欢迎信） | 本地只记 `submitted`；名单在 `NEWSLETTER_KV`；退订同批。无 Cloud 时 mock。群发未接线。2026-08-15 用户书面：欢迎信已收到（一封曾进垃圾箱；无 `welcomeSentAt` 再提交会重发）。**2026-08-16**：再提交 + Dashboard `newsletter:v1:{email}` — **测试 OK**；`RB-20260815-L394` 已关 |
| 用户上传氛围乐 | `free` | — | 无付费 gate | v1 必交付；非 Sanctuary 门槛 | **已接线** | 不得因未购 B 禁用上传主路径 |
| 电子书 ②A 免费下载 | `free` | — | — | 延后排期 | **未接线** | 产品延后，非付费墙项 |
| 电子书 ②B 练习解锁 | — | — | — | **已取消** | **不适用** | 勿复活 streak/练习解锁 |

### A5 · C 轨 · 同坐点（练习货币 · 不解锁 B）

> **方向锁（2026-08-18）**。内部名 Focus Coins；对外 **同坐点**。权威：`FOCUS_COINS.md`。**不是**第三档付费，**不是** `requiredTier`。

| 功能 / 资产 | 产品档位 | 付费方式备注 | Catalog / gate | 文档口径 | 代码落地 | 差距说明 |
|---|---|---|---|---|---|---|
| 同坐点钱包 / 发点 | `free` 练习所得 | **禁止**请茶或会员充点 | **无** FEATURE_CATALOG key；禁止 `isEntitled` 读余额 | 只在入账完成时发；Honesty 半额+日限 1 次 | **L1 完成钩子已合 #338**；`?focusCoins=0` 关闸 | Brief `task-focus-coins.md`。不进练习备份 6 key |
| 兑换：空间变体 / 称号 / 稀有练习章 / 阿寅轻点缀 | 练习兑换 | **不可现金购买** | SKU `cosmetic.*` / `title.*` / `badge.rare.*` | 不拦截自动纪念物；≠ 换装柜 | **L2 内部兑换已接线**（`__focusCoins.redeem`；无抽屉）；莲叶晨露只叠已有朵 | 须弥坐 = 360 点 **且** `lifetimeMinutes ≥ 600`；L3 才做抽屉表面 |
| 用同坐点换 B 权益（仪式 / Deep Ambient / Seasonal / 多端同步 / Enso / 付费章包等） | — | — | — | **禁止** | **不适用** | 对照表 A3 逐条排除；见 `FOCUS_COINS.md` §3 |

---

## 表 B · 明确不卖 / 不做（防回潮）

下列**不得**因「可收费」自动进入付费清单或路线图。权威：`MVP_PRODUCT_DEFINITION.md` §五；商业化 Brief。

| 项 | 姿态 | 否决 / 约束要点 | 权威出处 |
|---|---|---|---|
| AI Focus Coach / AI reflection | **不进路线图** | 非陪伴卖点；隐私与观察式文案冲突 | MVP §五「不应因可收费…」；#216 拍板红线不变 |
| 情绪趋势 / 心理分析 / 成长评分 | **不进路线图** | 禁止评判人格与「真假专注」 | MVP §五 / 隐私承诺 |
| 复杂专注报表 | **不进路线图** | 数据是配角 | MVP §五 |
| 多角色收集 / 随机奖励 / 付费加速 | **不做** | 焦虑与街机化 | MVP §五；PRINCIPLES |
| 以连续 365 天为前提的成长路线 | **不做** | 禁止断签/连续作解锁 | MVP §五；商业化红线 |
| 大换装系统（常驻换装柜 / 用户自选衣柜） | **不做（v1）** | **≠** 节日主题引擎；Seasonal Theme（B）是时段氛围，允许 | monetization Brief §2.2；`task-seasonal-theme-engine-v1` |
| Apple Health / Widget 写成 v1 付费权益 | **不做（v1）** | 健康非 v1；纯 Web 不可用 | MVP §五；Brief |
| A tip 解锁 B 内容 | **禁止** | Gate 零耦合 | Brief §2.6 |
| A→B 请茶送 24h 体验卡 | **非 v1** | 阶段 2 候选 | Brief §2.8 |
| UGC Pro Pass 社区订阅 | **默认不做** | ≠ Yin Membership；无账号 / 平台复杂度 | PROCESS UGC Backlog |
| 抽奖 / 稀缺倒计时 / FOMO | **禁止** | 商业化红线 | MVP §五 |
| 同坐点兑换 B 轨效率/场域权益 | **禁止** | 练习货币 ≠ 会员；不得续期 `ongoing` | `FOCUS_COINS.md` §3；本表 A5 |

---

## 差距摘要（文档已定收费 / 占位 ≠ 代码真拦）

优先对照排期用（非完整 Backlog）：

1. **Ambient Deep 15s 试听** — **本支实现中** `feature/ambient-deep-audition-15s`（Gate #251 已合）。  
2. **`emotion.premium.trigger`** — catalog 有；产品未拦高级情绪。  
3. **`content.advanced.daily-unlock`** — catalog 有；无消费者（占位 · 待定义或废止）。  
4. **Yin Membership 订阅 Checkout** — create/confirm/OTP verify + Unlock UI Manage + cloud provider/Portal（**#240 已合 tip `755d465`**）；生产 redeploy 待 Resend/OTP secrets。  
5. **统一 `isEntitled` 全面替换散落 gate** — 地基有；进阶仪式 + Ambient 深库 + Seasonal 已用；高级情绪等未跟。  
6. **Daily Wisdom → Reflection + 静默印花** — Brief `task-daily-wisdom-reflection-mount.md`（Phase A/B 拆分）。  
7. **Journey Daily Card（Save image）** — Brief `task-journey-daily-card.md`；**Log 上限免费/付费统一 30（有意）**。  
8. **Sanctuary Enso Mark（页面左下角）** — **已接线** `#yin-sanctuary-enso-mark`（Brief `task-sanctuary-enso-mark.md`）。  
9. **付费转化路径梳理（获客向）** — Backlog：试听后 Unlock、锁项价值展示时刻等——勿让「经济可持续」只剩老用户彩蛋。  
10. **节日主题引擎 `theme.seasonal.access`** — Phase 3 UI **已合 #238**（wash/whisper）；仍无独立锁项菜单；**未购不应用**。  
11. **付费 · 意愿漏斗本地统计** — **已合**（#255；`MONETIZATION_INTENT_FUNNEL.md`；实验室面板）。
12. **付费 · 意愿漏斗 opt-in 回传** — **已合**（#262 tip `582e79f`；Privacy 明示同意；默认关；`POST /api/monetization-funnel-ingest`；Brief `task-monetization-intent-funnel-opt-in.md`）。
13. **练习记忆 · 云端快照备份 / 恢复（免费 A）** — #266 政策；**#272 已合** tip `a195584`（6 key 整包；关闭=删云端）；生产 Worker 已 redeploy（`f9755950-…`）；**OTP secrets 已补**（2026-08-13 用户书面绑邮箱收码 + Enable 成功；非关单）。TRACKER 仍待空库恢复 / 关备份。
14. **练习记忆 · 多端无缝同步（B · 可后排）** — 文档已合（#266）；运行时未接线；勿与免费快照兜底混为一谈。
15. **同坐点（C · 练习货币）** — 方向锁 2026-08-18；L0 #335 已合；**L1 发点本支**。无店。**禁止**用点满足 `isEntitled`。

**已相对对齐的 B 面**：三进阶仪式菜单锁 + 完成 claimOwned；Sanctuary Unlock UI；尊贵徽章授予；tip↔Sanctuary 零耦合；**Ambient 深度曲 `isEntitled('ambient.deep.play')`（免费 5 首温暖子集）**。

**阶段原则（2026-08-11）**：产品已非「只验证 MVP」心态；经济可持续见 `PRINCIPLES.md`——假收费与无付费动机设计须优先避免。

---

## 维护约定

1. 改「谁免费 / 谁进 B」→ 先 `MVP` / Brief，再改本表，最后改 `FEATURE_CATALOG` 与消费者。  
2. 接线状态随合入 PR 更新「代码落地」「差距说明」；禁止只改代码不改表。  
3. **本表已为方向锁 / SSOT**（2026-08-10 书面确认升格）；改档位或接线口径须同步本表，不得只改代码或旁注。  
4. 价格、具体曲目/动画分层名单：**不**写入本表。

## 相关索引

- `MVP_PRODUCT_DEFINITION.md` §五  
- `task-briefs/task-tech-direction-v1-shell-monetization.md`  
- `YIN_SANCTUARY.md` / `YIN_TIP_JAR.md`  
- `SHARED_RESOURCES.md`（entitlement / sanctuary / tip keys）  
- `TEST_TRACKER.md`（RitualFlow / entitlement / Sanctuary / Daily Wisdom 行）  
- `FOCUS_COINS.md`（同坐点语义）· `task-briefs/task-focus-coins.md`  
