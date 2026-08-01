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
| **Slice A（必交付 · 已实现代码）** | 语言切换问候 + Honesty Idle 补登成功短认可；一分钟呼吸完成反馈**核对已接线** | **`v1.0.0` 功能冻结前须交付**（无新抽帧；只接现有键）· PR #59 |
| **Slice A′（合十语义修复）** | 日语切语须播真合十 `palms-together`（见 §5.1 漂移注） | **建议冻结前修**；否则验收「合十」与画面不一致 |
| **Slice B（库存消化 · 活跃陪伴）** | 欢迎/完成**同档**随机池；Honesty 按时长分档鼓励；微仪式轻量变体；清晨/深夜/茶歇/张望/摸头（均带冷却）；可选中央 Dispatcher | v1.0.x / 冻结后优先；**消化「仅调试」库存** |
| **Slice C（仪式 / 成长）** | Transition 入口、荷花 `lotus-*`、Grow Together | 纪念奖励 / 大 Backlog；MilestoneGlow 产品路径已另 Brief 接线 |

**拍板（2026-07-31）**：

- 同意写入正式产品稿并进 Backlog；**Slice A 升格为 v1.0.0 必交付**。  
- 语言切换要做；**日语用鞠躬/合十**（不用庆祝舞）。

**拍板（2026-08-01 · 用户 + 设计师整合）**：

- 同意把设计师「场景 × 动画」建议写入本文与 `ASSET_INVENTORY` / `PROCESS` Backlog。  
- **库存政策**：凡未标「已取代 / 勿接」的入库序列，须落入本表某一产品触发（可分 Slice B/C），禁止长期仅调试。  
- **驳回混档**：同日非首次完成**不得**随机进 `celebrate-dance*`（违反反馈分级）；完成变体池只许 light/ack 档。

实现 Brief：`docs/task-briefs/task-scene-animation-wiring-v1-slice-a.md`（A）；Slice B 见 `task-scene-animation-inventory-wire-slice-b.md`。

---

## 五、接线总表

图例：**已接线** = 产品壳已触发；**Slice A/A′/B/C** = 排期；**勿接** = 明确禁止或已拆除/已取代。

### 5.1 Arrive

| 用户场景 | 建议键 / 素材 | 档位 | 状态 | 备注 |
|---|---|---|---|---|
| Arrival Choose 确认 | `intentionSet` → **`intentionNod`（nod-bow pingpong）** | ack | **已接线** | 与门闩并行；合十曾作 Choose 视觉，现改 nod（画幅衔接） |
| Arrival Welcome | `smiling` / blink-smile | — | **已接线** | |
| Honesty · 睡态选时长 | `dormantWake`（cloak 倒放） | ack | **已接线** | 呼吸同期；暂不自动接 halo |
| Honesty · **Idle** 选时长并呼吸结束成功记账 | **短时长**（建议 ≤20 min）：`mindfulAcknowledge`（`nod-bow`）；**长时长**（建议 ≥30 min）：`haloBreathing` 或 `breathHaloHq`（平静满载，**非** Celebrating） | ack / ritual-lite | **短：Slice A 已实现**；长分档 **Slice B** | 睡态路径不叠 nod；**禁止** Celebrating |
| Honesty 桥接 Yes → Arrival | 不另插庆祝 | — | **已接线** | 进 Arrival 既有序列即可 |
| 一分钟呼吸（微仪式）完成 | 主：`sessionComplete`；可选同档池：`blink-smile` / 短 `haloBreathing`（加权，日限） | light / ack | **主路径已接线**；变体池 **Slice B** | 从不 Celebrating；见 `MICRO_RITUAL_PLAN.md` |
| 语言切换 → **日本語** | **真合十** `palmsTogether` / 专用键（**不是** nod-bow） | ack | **Slice A 代码已接 `intentionSet`** · **语义漂移 → Slice A′** | 仅 `locale` **实际变化**；同日同目标语最多 1 次；Focusing / Celebrating / 叠层忙碌跳过不补发 |
| 语言切换 → **English**（及日后其它 ready） | `mindfulAcknowledge`（`nod-bow`） | ack | **Slice A · 已实现** | 同上限频；不用 dance |
| 当日首次冷启动问候 | 加权池：`welcomeBack`（wave-hello **~60%**）· `nodGreeting`（**~40%**） | ack | Slice B | 须限频；勿每次刷新；`nodGreeting` 靠近自动仍 **勿接** |

> **漂移注（2026-08-01）**：Slice A 规格与设计师均要求日语 = **合十**（`palms-together`）。当前实现：`emotionKeyForLocaleGreeting('ja')` → `intentionSet`，而 `EmotionController.intentionSet` 播的是 **`intentionNod`（nod-bow）**——画面上是鞠躬不是合十。`palmsTogether` 仍仅调试。**A′ 修复**：切语 ja 改为播 `palmsTogether`（或新键 `localeGreetingJa`），与 Arrival Choose 的 `intentionSet`/nod 解耦；单测锁「ja → palms 素材目录」。

### 5.2 Focus

| 用户场景 | 建议键 / 素材 | 档位 | 状态 | 备注 |
|---|---|---|---|---|
| Sit 开始 | 保持 idle / smiling 路径 | — | **已接线** | 不另加舞蹈 |
| 墙钟 ~20 min | `mindfulAcknowledge` | ack | **已接线** | 共享提醒池 |
| 活跃 ~2h | `stretchReminder` | ack | **已接线** | 可与 yawn 组成**同档**提醒池（Slice B），勿叠 celebrate |
| Re-focus 回来 | `mindfulAcknowledge` subtype refocus | ack | **已接线** | |
| 中途 Rise | `riseStretchCasual` | ack | **已接线** | 不播完成舞；`blinkBreathe` 勿回主路径 |
| 每次计时完成（非当日首达标） | 加权池：`sessionComplete`（**~60%**）· 同档 ack 变体（如短 `nod-bow` / `blink-smile`，**~40%**） | light / ack | 主：`sessionComplete` **已接线**；池 **Slice B** | **禁止** `celebrate-dance*` |
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
| 深夜久坐 / Idle（≥23:00） | `yawn-stretch` 或 `tea-drinking` | 生命感 | Slice B | 冷却 ≥60 min；柔和休息暗示，非焦虑文案 |
| 茶歇偶遇（Idle 稀有） | `tea-drinking` | 生命感 | Slice B | 极低频；不打扰 |
| 摸头较长 | `ear-wiggle-head-touch` | 响应 | Slice B | 素材在；递进规则见圣经 |
| Idle 好奇 / 悬停较久 | 极低概率 gaze-p1～p4 或 ear-wiggle（如 ≤5%） | 自主 | Slice B | **禁止**挂回 IdleOrchestrator 默认池；须独立稀有调度 + 冷却 |
| 无互动 ~10 min | 70% 静坐 / 30% 挥手（`welcomeBack`） | 自主 | 口径已定；挥手触发核对属 Slice B | 见圣经时间表 |
| 靠近自动点头 | `nodGreeting` | — | **勿接** | 2026-07-19 已拆除；欢迎池可复用素材 |
| 长期里程碑 | `milestoneGlow`（主）· `breathHaloHq`（备选变体） | ritual | **Glow 产品路径已接线**；HQ 备选 **Slice B/C** | Brief `task-milestone-glow-product-wire.md` |
| 荷花成长 / 莲花解锁 | `lotus-front-rising` / `lotus-chest-halo` | ritual | Slice C | 须先有 Grow / 纪念奖励产品面 |
| 旧 `dormant-wake/` 正放 | — | — | **勿接** | 已由 cloak 倒放取代；目录保留 |
| 旧 `sleeping/` 8 帧 | — | — | **勿接** | 主线用 cloak 030–034 |
| `tilt-think` | — | — | **勿接主路径** | curiousTilt 已改 blink-smile；可调试 |
| `blink-breathe` | — | — | **勿接主路径** | Rise 已改 rise-stretch-casual |

---

## 六、Slice A 验收口径（产品）

1. **Language**：`?product=1` → Language → 日本語 → 阿寅播**合十**（`palms-together`）→ 回 Idle；再切 English → 播鞠躬（`nod-bow`）；同日重复切同一语**不**反复播。  
   - *现状缺口*：ja 实际播 nod-bow → 记入 Slice A′ / TEST_TRACKER 复测。  
2. **Honesty Idle**：非睡态 → 选时长 → 呼吸结束 → toast **且**短点头鞠躬 → 桥接；睡态路径仍 dormantWake，记账后**不**再叠 Celebrating。  
3. **微仪式**：完成仍为 `sessionComplete` + 中置 toast（回归确认，非新需求）。  
4. **禁止**：切语言或 Honesty 补登触发 `celebrating` / 把 celebrate 档塞进 ack。

自动化建议（实现时）：unit 锁「locale 变化 → 选键 / 同日限频 / Focusing 跳过」；e2e 扩 `language-switch.spec.js` 断言播放态或等价 data 钩；Honesty 回流一条。

---

## 七、架构建议（Slice B · Animation Dispatcher）

设计师建议、与现有 `EmotionController` / `companionGestureCatalog` 对齐：

1. **业务只发语义事件**（如 `language_changed`、`honesty_recorded`、`micro_ritual_complete`、`idle_rare_life`）——禁止在 UI 控件里堆 `if (locale===ja) play…`。  
2. **中央映射表**（可落在 `sceneAnimationDispatcher.js` 或扩展 catalog）：场景 → 单一键 **或** 加权数组；读冷却 / 同日限频。  
3. **Cooldown + 档位门闩**：Dispatcher 内校验 Focusing / Celebrating / 叠层忙碌 / 档位，非法则 skip 不补发（与 Slice A 问候一致）。  
4. **不另造情绪状态枚举**；仍走 `playEmotion`；新键须先改 `EMOTION_BIBLE`。

Slice A 已有雏形：`localeGreeting.js`。Slice B 宜把 Honesty 分档、欢迎池、生命感冷却收进同一 Dispatcher，避免平行 if-else。

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
| `palms-together` | 日语切语合十（A′）；Transition 深呼吸可选 | A′ / C |
| `nod-greeting` | 冷启动欢迎加权池（非靠近） | B |
| `halo-breathing` | Honesty 长补登 / 微仪式轻量变体 | B |
| `breath-halo-hq` | MilestoneGlow 备选或长补登光环变体 | B |
| `tea-drinking` / `yawn-stretch` / gaze-p* / `ear-wiggle-head-touch` | 深夜·清晨·茶歇·好奇·摸头（均冷却） | B |
| `lotus-front-rising` / `lotus-chest-halo` | Grow / 纪念奖励解锁 | C |
| `milestone-glow` | 连续练习节点（已产品接线） | 已接线 |
| `dormant-wake` / 旧 `sleeping/` / `tilt-think` / `blink-breathe` | — | **勿接**（已取代） |

仍缺正式序列（`smileSquint` / `petHead` / `dizzyBlink` / `snoringZZZ`）→ 另立美术，不在「库存消化」范围。

---

## 十、设计师建议采纳对照（2026-08-01）

| 建议 | 采纳 | 说明 |
|---|---|---|
| 日语 → palms-together；英语 → nod-bow | **采纳** | 与 Slice A 产品口径一致；代码须 A′ 对齐真合十 |
| Honesty 短 nod / 长 halo | **采纳 · Slice B** | 阈值阈值待实现 Brief 钉死（建议 20 / 30） |
| 微仪式结束 blink-smile 或 halo | **部分采纳 · Slice B** | 主路径保持 `sessionComplete`；变体进同档加权池 |
| Welcome：wave 60% / nodGreeting 40% | **采纳 · Slice B** | 靠近自动仍勿接 |
| 同日完成：sessionComplete 60% + **dance-v2 40%** | **驳回混档** | dance 仅 Celebrating；改同档 ack/light 变体 |
| 唤醒池 stretch + yawn | **采纳 · Slice B** | 同档提醒，冷却 |
| 深夜 tea / yawn；Milestone glow；好奇 ear/gaze | **采纳 · B/C** | Glow 已接线；其余带冷却 |
| 中央 Animation Dispatcher | **采纳为 Slice B 架构方向** | 见 §七 |

---

## 十一、变更记录

| 日期 | 说明 |
|---|---|
| 2026-07-31 | 初版：全表 + v1.0.0 Slice A（语言合十/鞠躬、Honesty Idle 短认可、微仪式已接线核对）；用户拍板纳入第一版 |
| 2026-07-31 | Slice A 实现：`localeGreeting` + Honesty Idle `mindfulAcknowledge`；表内状态改为已实现 |
| 2026-08-01 | 整合设计师场景×动画建议；库存全业务接线政策；驳回完成池混入 celebrate；标注 ja 合十代码漂移（A′）；新增 Slice B Brief 指针与 Dispatcher 架构节 |
