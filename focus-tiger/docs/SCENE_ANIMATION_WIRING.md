# SCENE_ANIMATION_WIRING.md — 场景 → 动画接线表

创建日期：2026-07-31  
**最后修订**：2026-08-01（设计师建议整合 + 库存全业务接线政策）  
产品语义层级：位于 `PRODUCT_MOMENTS.md` / `EMOTION_BIBLE.md` 之下、实现 Brief 之上——回答「**哪个用户时刻该播哪一档动画**」。  
情绪键定义、优先级、时长档位仍以 **`EMOTION_BIBLE.md`** 为唯一权威；素材盘点以 **`ASSET_INVENTORY.md`** 为准。本文不另造情绪键，只定**接线契约**。

---

## 一、为什么要有这张表

仓库里已有多套 2D 序列（点头、合十、摆尾、挥手、喝茶、伸懒腰、张望、金辉等），但正式产品路径只接了其中一部分；其余多停在调试面板。  
目标：**在真实用户场景里用对档的短响应**，让伙伴感更活跃动人——同时遵守宁静型游戏化、反馈分级、「不打扰」。

**不是**：有动画就播、设置页跳庆祝舞、Focus 中频繁讨好。

**产品意图（2026-08-01 用户 + 设计师）**：不希望已入库动画大部分静悄悄派不上用场；Five Moments / Honesty / i18n / 微仪式等场景应**主动消化库存**。详见 §九「库存 → 业务接线政策」。

---

## 二、强度档位（与圣经对齐 · 禁止混档）

| 档位 | 约时长 | 典型键 / 素材 | 语义 |
|---|---|---|---|
| **micro** | ≤2s | 短眨眼 / 微表情 | 几乎无打断 |
| **ack** | 3.5–7s | `mindfulAcknowledge`（`nod-bow`）、`intentionSet` / 合十、`nodGreeting`、`welcomeBack` | 被看见 / 问候 / 合十鞠躬 |
| **light** | ~3.5s | `sessionComplete` | 一次练习完成的轻量确认 |
| **celebrate** | 完整弧线 | `celebrating`（dance / dance-v2） | **仅**当日首次计时达标 |
| **ritual** | ~10s | `milestoneGlow` / `haloBreathing`（长补登可选） | 长期里程碑或平静满载感；勿当日常完成舞 |

冲突与优先级见 `EMOTION_BIBLE` 第二部分。本表新增触发**不得**越级使用更高档（例：切语言绝不用 `Celebrating`）。

---

## 三、全局约束

1. **响应 > 自主**；Focusing 中默认少播；用户主动入口（Honesty / 微仪式 / 切语言）可 ack。  
2. **同日限频**：问候类（语言切换、首次打开挥手等）建议「同目标语言 / 同场景每日最多 1 次」；与 MindfulAcknowledge 共享提醒池**分开记账**（语言切换不扣提醒池）。  
3. **Celebrating / MilestoneGlow** 触发面不变；本表只补「缺动画的时刻」与**同档加权随机**（不得把 celebrate 档塞进 light/ack 场景）。  
4. **先接线现有素材**；新片仅当表中标注「需新片」且另立美术任务。  
5. **序列衔接**：无法像素衔接时用 `CAPCUT_DISSOLVE_MS` + 定格；禁止闪切。  
6. **冷却（Cooldown）**：生命感 / 深夜 / 茶歇等自主动作须设冷却（建议默认 **≥60 min** 同类最多 1 次；同日总自主打扰上限另计），避免破禅意。

---

## 四、v1.0.0 纳入策略（如何进第一版）

全表是长期产品 SSOT；**第一版不能一次接完全表**。采用切片：

| 切片 | 范围 | 与 v1.0.0 关系 |
|---|---|---|
| **Slice A（必交付 · 已实现代码）** | 语言切换问候 + Honesty Idle 补登成功短认可；一分钟呼吸完成反馈**核对已接线** | **已合 develop**（PR #59） |
| **Slice A′ + B（一批实现 · 库存消化）** | **A′** 日语真合十 + **B** 设计师清单其余项（见 §十）+ **中央 Animation Dispatcher**（事件 / 加权池 / 冷却） | **一批落地**（不拆成许多小 feature）；口令见 Brief |
| **Slice C（仪式 / 成长）** | Transition 入口、荷花 `lotus-*`、Grow Together | 须产品面；MilestoneGlow **已接线**（勿重复立项） |

**为何曾分片、现改一批（2026-08-01 澄清）**：

- `playEmotion` 本身对状态机冲击通常不高；真正要管的是**档位混用、冷却、Focusing 跳过、序列衔接**——用 **Dispatcher 一次做对**，比拆十个「各播一个动画」的 PR 更干净。  
- 因此：**除已驳回混档、已取代勿接、Slice C 缺产品面之外**，设计师清单**批量纳入 A′+B 同一实现批次**，不再人为拆碎。  
- 仍单独标出的仅是：**已接线免重做**、**驳回项**、**勿接目录**、**荷花待 Grow**。

**拍板（2026-07-31）**：

- 同意写入正式产品稿并进 Backlog；**Slice A 升格为 v1.0.0 必交付**。  
- 语言切换要做；**日语用鞠躬/合十**（不用庆祝舞）。

**拍板（2026-08-01 · 用户书面）**：

- 设计师建议写入本文与 `ASSET_INVENTORY` / `PROCESS`；库存须进业务。  
- **Honesty 时长分界锁定**：补登 **≤20 min** → `nod-bow`（`mindfulAcknowledge`）；**≥30 min** → `halo-breathing`（或 `breathHaloHq` 变体）。21–29 min 归短档（nod），避免空洞。  
- **日语 = 合十**（`palms-together`）规格正确；代码漂移须 A′ 修。  
- **勿接**已取代目录（旧 dormant-wake / sleeping / tilt-think / blink-breathe 主路径）。  
- **采纳中央 Animation Dispatcher**（语义事件 + 加权映射 + 冷却，默认生命感 **≥60 min** 同类最多 1 次）。  
- **一批安排**设计师清单其余项（§十）；**驳回**同日非首次完成池混入 `celebrate-dance*`（改同档 ack/light 变体）。

实现 Brief：`docs/task-briefs/task-scene-animation-wiring-v1-slice-a.md`（A）；**A′+B 一批**：`task-scene-animation-inventory-wire-slice-b.md`。

---

## 五、接线总表

图例：**已接线** = 产品壳已触发；**Slice A/A′/B/C** = 排期；**勿接** = 明确禁止或已拆除/已取代。

### 5.1 Arrive

| 用户场景 | 建议键 / 素材 | 档位 | 状态 | 备注 |
|---|---|---|---|---|
| Arrival Choose 确认 | `intentionSet` → **`intentionNod`（nod-bow pingpong）** | ack | **已接线** | 与门闩并行；合十曾作 Choose 视觉，现改 nod（画幅衔接） |
| Arrival Welcome | `smiling` / blink-smile | — | **已接线** | |
| Honesty · 睡态选时长 | `dormantWake`（`starlight-cloak-wake`） | ack | **已接线** | 呼吸同期；暂不自动接 halo |
| Honesty · **Idle** 选时长并呼吸结束成功记账 | **≤20 min**（含 21–29）：`mindfulAcknowledge`（**pingpong×1** + CapCut）；**≥30 min**：`goldenHaloPalms`（试验；`breathHaloHq` 仍调试） | ack / ritual-lite | **已实现**（Dispatcher） | 睡态不叠；**禁止** Celebrating |
| Honesty 桥接 Yes → Arrival | 不另插庆祝 | — | **已接线** | 进 Arrival 既有序列即可 |
| 一分钟呼吸（微仪式）完成 | 同档池：`sessionComplete` ~65% · `mindfulAcknowledge` ~28% · **`parrotEarVisit` 稀有 ~7%**（**无** `curiousTilt`/blink-smile） | light / ack / messenger | **已实现**（Dispatcher） | 从不 Celebrating；呼吸期已是 smiling，再抽 blink 几乎像没播（2026-08-03 撤出） |
| 语言切换 → **日本語** | `bookReading`（单程看书、**无倒放**；末约 **1s CapCut** Idle） | ack | **Slice A · 已实现**（2026-08-02：入库 `book-reading`；告别合十过密） | 仅 `locale` **实际变化**；同日同目标语最多 1 次（**播成功后**再记配额）；≠ `magic-book-reading` |
| 语言切换 → **English**（及日后其它 ready） | `teaDrinking`（单程喝茶、**无倒放**；末约 **1s CapCut** Idle） | ack | **Slice A · 已实现**（2026-08-02：EN 茶 QA OK） | 同上限频；深夜池同素材亦用茶 |
| 当日首次冷启动问候 | **加权池试验**：`magicBookReading` 60% · `nodGreeting` 40%（同日 1 次） | ack | **试验接线**（Dispatcher） | 靠近自动仍 **勿接**。**新旧挥手暂时停接线**（2026-08-02 拍板；`welcomeBack` 空实现）。`magicBookReading` **硬切** Idle；`nodGreeting` CapCut。**冷启动互斥**：欢迎 `play===true` 时**同 tick 不播**深夜（茶/哈欠）；欢迎已跳过才可 boot 深夜。回前台仍检深夜 |

> **A′ 演进（2026-08-02）**：切语 ja 曾 `palmsTogether` → 现 `bookReading`（入库单程看书 + CapCut）。切语 en：`magicBookReading` 硬切（QA OK）→ `teaDrinking` + CapCut（QA OK）。`palmsTogether` 仍调试可播。

### 5.2 Focus

| 用户场景 | 建议键 / 素材 | 档位 | 状态 | 备注 |
|---|---|---|---|---|
| Sit 开始 | 保持 idle / smiling 路径 | — | **已接线** | 不另加舞蹈 |
| 墙钟 ~20 min | `mindfulAcknowledge` | ack | **已接线** | 共享提醒池 |
| 活跃 ~2h | stretch 池：`stretchReminder` / `yawnStretch` | ack | **已实现**（Dispatcher） | 勿叠 celebrate |
| Re-focus 回来 | `mindfulAcknowledge` subtype refocus | ack | **已接线** | |
| 中途 Rise | **加权池** `riseStretchCasual` 60% · `teaDrinking` 25% · `bookReading` 15% | ack | **已接线** | 正放一次 + `holdPose`；关 Reflection → Idle。**禁止** `magicBookReading` / yawn / celebrate；`blinkBreathe` 勿回主路径 |
| 每次计时完成（非当日首达标） | 同档池：`sessionComplete` ~65% · nod ~28% · **`parrotEarVisit` 稀有 ~7%**（**无** blink/`curiousTilt`） | light / ack / messenger | **已实现**（Dispatcher） | **禁止** `celebrate-dance*`；鹦鹉不进 Celebrating |
| 当日首次计时达标 | `celebrating`（已有 dance / dance-v2 **50/50**） | celebrate | **已接线** | 唯一允许舞蹈档 |

### 5.3 Recover / Transition / Reflect

| 用户场景 | 建议键 / 素材 | 档位 | 状态 | 备注 |
|---|---|---|---|---|
| 主动 Recover 结束 | `nod-bow` / blink-smile | ack | Slice B | **禁止** sessionComplete / Celebrating（见 `PRODUCT_MOMENTS`） |
| 用户主动 Transition 一次深呼吸 | `palms-together` 或短光环 | ack | Slice C | 入口未做 |
| Reflection 三问答完 | `mindfulAcknowledge` | ack | Slice B | 可选；勿加长仪式 |

### 5.4 生命感 / 库存素材（主界面克制 · 冷却强制）

| 用户场景 | 建议键 / 素材 | 档位 | 状态 | 备注 |
|---|---|---|---|---|
| 清晨首次打开 | `yawn-stretch` / `stretchReminder` 加权 | ack | Slice B | 日限 1；本地时区早晨窗 |
| 深夜久坐 / Idle（≥23:00） | `yawnStretch` / `teaDrinking` | 生命感 | **已实现**（回前台再检；冷却 1h） | 非焦虑文案。**勿**与冷启动欢迎同 tick 叠播（`shouldAttemptLateNightOnBoot`） |
| Idle 好奇 / 悬停较久 | ≤5% `earWiggleHeadTouch` / `gazeLookAround` | 自主 | **已实现**（Pointer 靠近静止 → Dispatcher） | `earWiggle`：正+倒一次 + ~1s CapCut；**禁止** IdleOrchestrator 默认池 |
| 无互动 ~10 min | 70% 静坐 / 30% 挥手（`welcomeBack`） | 自主 | **挥手暂时停接线**；计时触发仍未接 | 以后另议 |
| 靠近自动点头 | `nodGreeting` | — | **勿接** | 2026-07-19 已拆除；欢迎池可复用素材 |
| 长期里程碑 | `milestoneGlow`：`streak-7` **50/50** 蝴蝶/`parrotEarVisit` · `streak-21`/`100` 琉璃星石；`breathHaloHq` 仍调试 | ritual | **产品路径已接线** | Brief `task-milestone-glow-product-wire` / `task-parrot-ear-visit` |
| 应用内轻提醒横幅 | `parrotEarVisit`（禅意信使）+ 顶部 `#in-app-reminder-banner` | messenger | **已接线**（2026-08-03） | 横幅首次可见本页播一次；文案仍 `reminder.gentle_waiting` |
| 荷花成长 / 莲花解锁 | `lotus-front-rising` / `lotus-chest-halo` | ritual | Slice C | 须先有 Grow / 纪念奖励产品面 |
| 旧 `dormant-wake/` 正放 | — | — | **勿接** | 已由 `starlight-cloak-wake` 取代；目录保留 |
| 旧 `cloak-sleep/` 34 帧 | — | — | **勿接** | 已由 `starlight-cloak-sleep` / `-wake` 取代 |
| 旧 `sleeping/` 8 帧 | — | — | **勿接** | 主线用 starlight-cloak-sleep 067–063 |
| `tilt-think` | — | — | **勿接主路径** | curiousTilt 已改 blink-smile；可调试 |
| `blink-breathe` | — | — | **勿接主路径** | Rise 已改 rise-stretch-casual |

---

## 六、Slice A 验收口径（产品）

1. **Language**：`?product=1` → Language → 日本語 → 阿寅播**单程看书**（`bookReading` + CapCut）→ 回 Idle；再切 English → **喝茶**（`teaDrinking` + CapCut）；同日重复切同一语**不**反复播。  
2. **Honesty Idle**：非睡态 → ≤29 短点头 / ≥30 `goldenHaloPalms`（试验）→ toast → 桥接；睡态仅 dormantWake，**不**叠 Celebrating。  
3. **微仪式 / 非首次完成**：同档轻量池（可 sessionComplete / nod / blink）；中置 toast 仍在。  
4. **禁止**：切语言或 Honesty / 轻量完成触发 `celebrating`。

自动化建议（实现时）：unit 锁「locale 变化 → 选键 / 同日限频 / Focusing 跳过」；e2e 扩 `language-switch.spec.js` 断言播放态或等价 data 钩；Honesty 回流一条。

---

## 七、架构（A′+B 一批 · Animation Dispatcher · 已拍板）

设计师建议已**采纳为实现约束**（2026-08-01），与现有 `EmotionController` / `companionGestureCatalog` 对齐：

1. **统一事件**：业务只发语义事件（如 `EVENT_LANGUAGE_CHANGED`、`EVENT_HONESTY_COMPLETED`、`EVENT_MICRO_RITUAL_COMPLETE`、`EVENT_IDLE_RARE_LIFE`）——禁止在 UI 里堆 `if (locale===ja) play…`。  
2. **随机与权重**：Dispatcher 内配置场景 → 单一键 **或** 加权数组；读冷却 / 同日限频。  
3. **Cooldown**：闲置类（哈欠、喝茶、稀有张望等）默认 **1 小时内同类最多 1 次**；问候类仍「同日同目标最多 1 次」。  
4. **档位门闩**：Focusing / Celebrating / 叠层忙碌 → skip 不补发；**禁止**越级 celebrate。  
5. **不另造情绪状态枚举**；仍走 `playEmotion`；新键须先改 `EMOTION_BIBLE`。

实现：`src/core/sceneAnimationDispatcher.js` + `main` `tryPlaySceneAnim` / `__sceneAnimationDispatch`。切语额度仍写 `localeGreeting` storage；欢迎写 `scene-anim-daily`；生命感写 `scene-anim-cooldown`。

---

## 八、文档关系

| 文档 | 关系 |
|---|---|
| `EMOTION_BIBLE.md` | 键、优先级、互动清单；本表触发须可回指圣经行 |
| `ASSET_INVENTORY.md` | 素材是否入库 / 调试-only / **目标业务场景** |
| `PRODUCT_MOMENTS.md` | Five Moments 叙事；本表按 Moment 填空 |
| `MICRO_RITUAL_PLAN.md` | 微仪式完成反馈细节 |
| `PROCESS.md` Backlog | 排期与切片升格 |
| `task-briefs/task-scene-animation-wiring-v1-slice-a.md` | Slice A 实现规格 |
| `task-briefs/task-scene-animation-inventory-wire-slice-b.md` | Slice B 库存消化规格 |

---

## 九、库存 → 业务接线政策（2026-08-01）

**原则**：已入库且未标「已取代 / 勿接」的序列，必须在本文有一条**产品触发**（已接线或排入 Slice B/C）；禁止无限期「仅调试」。

| 目录 / 键 | 目标业务场景 | 切片 |
|---|---|---|
| `palms-together` | 调试保留；日语切语已改 `book-reading`；Transition 深呼吸可选 | C |
| `nod-greeting` | 冷启动欢迎加权池（非靠近） | B |
| `halo-breathing` | Honesty 长补登 / 微仪式轻量变体 | B |
| `breath-halo-hq` | MilestoneGlow 备选或长补登光环变体 | B |
| `tea-drinking` / `yawn-stretch` / gaze-p* / `ear-wiggle-head-touch` | 深夜·清晨·茶歇·好奇·摸头（均冷却） | B |
| `lotus-front-rising` / `lotus-chest-halo` | Grow / 纪念奖励解锁 | C |
| `milestone-glow` | 连续练习节点（streak-7 · 与鹦鹉 50/50） | 已接线 |
| `meditation-star-reward` | 连续练习节点（streak-21 / streak-100） | 已接线（2026-08-03） |
| `parrot-ear-visit-feather` | 应用内轻提醒信使（A）· 轻完成稀有（B）· streak-7 仪式 50/50 | 已接线（2026-08-03）；**不做**羽毛残影 |
| `dormant-wake` / 旧 `sleeping/` / `tilt-think` / `blink-breathe` | — | **勿接**（已取代） |

仍缺正式序列（`smileSquint` / `petHead` / `dizzyBlink` / `snoringZZZ`）→ 另立美术，不在「库存消化」范围。

---

## 十、设计师建议采纳对照（2026-08-01 · 一批）

| # | 建议 | 状态 | 说明 |
|---|---|---|---|
| 1a | 日语 → book-reading | **已实现** | `bookReading`；曾 palmsTogether（A′） |
| 1b | 英语 → nod-bow | **已接线** | 免重做 |
| 2a | Honesty ≤20 nod / ≥30 goldenHaloPalms | **试验接线** | ≥30 → `goldenHaloPalms` oneshot；`breathHaloHq` 调试保留 |
| 2b | 微仪式同档变体 | **已实现** | LIGHT_COMPLETE_POOL |
| 3a | Welcome：wave 60% / nodGreeting 40% | **已实现** | 同日 1 次 |
| 3b | 完成池混入 dance-v2 | **驳回** | 已用同档 ack/light 池 |
| 3c | 舒展：stretch + yawn | **已实现** | MindfulReminder → Dispatcher |
| 4a | 深夜 ≥23:00 yawn / tea | **已实现** | 冷却 1h |
| 4b | Milestone glow | **已接线** | 免重做 |
| 4c | Curiosity ear / gaze ≤5% | **已实现** | Pointer Idle 靠近静止 |
| 4d | Stretch Break | **已接线** | 并入 3c 池 |
| — | Animation Dispatcher | **已实现** | §七 |
| — | lotus-* | **Slice C** | 缺 Grow 产品面 |

**批量安排结论**：A′+B 已在本实现分支落地；荷花仍属 Slice C。

---

## 十一、变更记录

| 日期 | 说明 |
|---|---|
| 2026-07-31 | 初版：全表 + v1.0.0 Slice A（语言合十/鞠躬、Honesty Idle 短认可、微仪式已接线核对）；用户拍板纳入第一版 |
| 2026-07-31 | Slice A 实现：`localeGreeting` + Honesty Idle `mindfulAcknowledge`；表内状态改为已实现 |
| 2026-08-01 | 整合设计师场景×动画建议；库存全业务接线政策；驳回完成池混入 celebrate；标注 ja 合十代码漂移（A′）；新增 Slice B Brief 指针与 Dispatcher 架构节 |
| 2026-08-01 | 用户拍板：Honesty 20/30；日语合十；勿接已取代；Dispatcher 必做；设计师其余项**一批**进 A′+B（非整碎小任务）；Milestone/stretch/en 鞠躬标已接线免重做 |
| 2026-08-01 | **实现**：`sceneAnimationDispatcher` + Emotion 合十/光环/陪伴手势；main / Honesty / 完成 / 微仪式 / 舒展 / 欢迎 / 深夜 / 好奇接线；unit + language-switch e2e 钩更新 |
| 2026-08-02 | 切语 EN：曾 `magicBookReading` 硬切（QA OK）→ 改 `teaDrinking` 单程 + CapCut（QA OK） |
| 2026-08-02 | 入库 `book-reading`；切语 ja → `bookReading` 单程 + CapCut |
| 2026-08-03 | 中途 Rise：加权池 stretch 60 / tea 25 / book 15（`RISE_INTERRUPT_POOL`）；勿接 magicBook |
| 2026-08-02 | **修**：冷启动欢迎与深夜同 tick 叠播 → tea/yawn 误盖开场；`shouldAttemptLateNightOnBoot` 互斥 + §6.9 |
| 2026-08-03 | 入库 `meditation-star-reward`；MilestoneGlow 按节点轮换（7=蝴蝶金辉 · 21/100=琉璃星石） |
| 2026-08-03 | `meditation-star-reward` **改用不抠图源**覆盖（用户反馈抠图毛边差；星空/白底整幅烧录） |
| 2026-08-03 | 入库 `parrot-ear-visit-feather`；场景 A 提醒横幅信使；场景 B `LIGHT_COMPLETE_POOL` 稀有 |
| 2026-08-03 | streak-7 MilestoneGlow：**50/50** 蝴蝶 ↔ 鹦鹉；不做羽毛残影 |
| 2026-08-03 | `LIGHT_COMPLETE_POOL` 撤出 `curiousTilt`；权重 → sessionComplete 70 / mindfulAcknowledge 30 / parrot 8 |
| 2026-08-03 | 跨动画短叠化（180/520ms）统一 `CAPCUT_DISSOLVE_MS` 1s；硬切 `0`（gaze 段间 / Idle 闭目↔睁眼 / 魔法书回 Idle）保持 |

