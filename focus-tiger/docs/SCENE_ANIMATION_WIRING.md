# SCENE_ANIMATION_WIRING.md — 场景 → 动画接线表

创建日期：2026-07-31  
产品语义层级：位于 `PRODUCT_MOMENTS.md` / `EMOTION_BIBLE.md` 之下、实现 Brief 之上——回答「**哪个用户时刻该播哪一档动画**」。  
情绪键定义、优先级、时长档位仍以 **`EMOTION_BIBLE.md`** 为唯一权威；素材盘点以 **`ASSET_INVENTORY.md`** 为准。本文不另造情绪键，只定**接线契约**。

---

## 一、为什么要有这张表

仓库里已有多套 2D 序列（点头、合十、摆尾、挥手、喝茶、伸懒腰、张望、金辉等），但正式产品路径只接了其中一部分；其余多停在调试面板。  
目标：**在真实用户场景里用对档的短响应**，让伙伴感更活跃动人——同时遵守宁静型游戏化、反馈分级、「不打扰」。

**不是**：有动画就播、设置页跳庆祝舞、Focus 中频繁讨好。

---

## 二、强度档位（与圣经对齐 · 禁止混档）

| 档位 | 约时长 | 典型键 / 素材 | 语义 |
|---|---|---|---|
| **micro** | ≤2s | 短眨眼 / 微表情 | 几乎无打断 |
| **ack** | 3.5–7s | `mindfulAcknowledge`（`nod-bow`）、`intentionSet`（`palms-together`）、`nodGreeting`、`welcomeBack` | 被看见 / 问候 / 合十鞠躬 |
| **light** | ~3.5s | `sessionComplete` | 一次练习完成的轻量确认 |
| **celebrate** | 完整弧线 | `celebrating`（dance / dance-v2） | **仅**当日首次计时达标 |
| **ritual** | ~10s | `milestoneGlow` | 长期里程碑；与纪念奖励 Backlog / Brief 对齐 |

冲突与优先级见 `EMOTION_BIBLE` 第二部分。本表新增触发**不得**越级使用更高档（例：切语言绝不用 `Celebrating`）。

---

## 三、全局约束

1. **响应 > 自主**；Focusing 中默认少播；用户主动入口（Honesty / 微仪式 / 切语言）可 ack。  
2. **同日限频**：问候类（语言切换、首次打开挥手等）建议「同目标语言 / 同场景每日最多 1 次」；与 MindfulAcknowledge 共享提醒池**分开记账**（语言切换不扣提醒池）。  
3. **Celebrating / MilestoneGlow** 触发面不变；本表只补「缺动画的时刻」。  
4. **先接线现有素材**；新片仅当表中标注「需新片」且另立美术任务。  
5. **序列衔接**：无法像素衔接时用 `CAPCUT_DISSOLVE_MS` + 定格；禁止闪切。

---

## 四、v1.0.0 纳入策略（如何进第一版）

全表是长期产品 SSOT；**第一版不能一次接完全表**。采用切片：

| 切片 | 范围 | 与 v1.0.0 关系 |
|---|---|---|
| **Slice A（必交付）** | 语言切换问候 + Honesty Idle 补登成功短认可；一分钟呼吸完成反馈**核对已接线** | **`v1.0.0` 功能冻结前须交付**（无新抽帧；只接现有键） |
| **Slice B（冻结后 / v1.0.x）** | Reflection 收尾点头、清晨伸懒腰、Idle 生命感（tea / yawn / 偶发 gaze）等 | Backlog 排队；不挡 tag |
| **Slice C（大 Backlog）** | Transition 入口、MilestoneGlow 正式节点、荷花成长、摸头 ear-wiggle 等 | 见既有纪念奖励 / MilestoneGlow Brief 等 |

**拍板（2026-07-31）**：

- 同意写入正式产品稿并进 Backlog；**Slice A 升格为 v1.0.0 必交付**。  
- 语言切换要做；**日语用鞠躬/合十**（不用庆祝舞）。

实现 Brief：`docs/task-briefs/task-scene-animation-wiring-v1-slice-a.md`。

---

## 五、接线总表

图例：**已接线** = 产品壳已触发；**Slice A** = v1.0.0 必做；**Slice B/C** = 后续；**勿接** = 明确禁止或已拆除。

### 5.1 Arrive

| 用户场景 | 建议键 / 素材 | 档位 | 状态 | 备注 |
|---|---|---|---|---|
| Arrival Choose 确认 | `intentionSet` → `palms-together` / nod-bow 路径（以圣经现状为准） | ack | **已接线** | 与门闩并行，不挡 Companion |
| Arrival Welcome | `smiling` / blink-smile | — | **已接线** | |
| Honesty · 睡态选时长 | `dormantWake`（cloak 倒放） | ack | **已接线** | 呼吸同期；暂不自动接 halo |
| Honesty · **Idle** 选时长并呼吸结束成功记账 | `mindfulAcknowledge`（`nod-bow`）与 toast 并行 | ack | **Slice A · 已实现** | 睡态路径不叠 nod；**禁止** Celebrating |
| Honesty 桥接 Yes → Arrival | 不另插庆祝 | — | **已接线** | 进 Arrival 既有序列即可 |
| 一分钟呼吸（微仪式）完成 | `sessionComplete` | light | **已接线**（v1 核对） | 从不 Celebrating；见 `MICRO_RITUAL_PLAN.md` |
| 语言切换 → **日本語** | `intentionSet`（`palms-together` 合十） | ack | **Slice A · 已实现** | 仅 `locale` **实际变化**时；同日同目标语最多 1 次；Focusing / Celebrating / 叠层忙碌时跳过不补发 |
| 语言切换 → **English**（及日后其它 ready） | `mindfulAcknowledge`（`nod-bow` 鞠躬） | ack | **Slice A · 已实现** | 同上限频；不用 dance |
| 当日首次冷启动问候 | `welcomeBack` / `nodGreeting` | ack | Slice B | 须限频；勿每次刷新 |

### 5.2 Focus

| 用户场景 | 建议键 / 素材 | 档位 | 状态 | 备注 |
|---|---|---|---|---|
| Sit 开始 | 保持 idle / smiling 路径 | — | **已接线** | 不另加舞蹈 |
| 墙钟 ~20 min | `mindfulAcknowledge` | ack | **已接线** | 共享提醒池 |
| 活跃 ~2h | `stretchReminder` | ack | **已接线** | |
| Re-focus 回来 | `mindfulAcknowledge` subtype refocus | ack | **已接线** | |
| 中途 Rise | `riseStretchCasual` | ack | **已接线** | 不播完成舞 |
| 每次计时完成（非当日首达标） | `sessionComplete` | light | **已接线** | |
| 当日首次计时达标 | `celebrating` | celebrate | **已接线** | |

### 5.3 Recover / Transition / Reflect

| 用户场景 | 建议键 / 素材 | 档位 | 状态 | 备注 |
|---|---|---|---|---|
| 主动 Recover 结束 | `nod-bow` / blink-smile | ack | Slice B | **禁止** sessionComplete / Celebrating（见 `PRODUCT_MOMENTS`） |
| 用户主动 Transition 一次深呼吸 | `palms-together` 或短光环 | ack | Slice C | 入口未做 |
| Reflection 三问答完 | `mindfulAcknowledge` | ack | Slice B | 可选；勿加长仪式 |

### 5.4 生命感 / 库存素材（主界面克制）

| 用户场景 | 建议键 / 素材 | 档位 | 状态 | 备注 |
|---|---|---|---|---|
| 清晨首次打开 | `yawn-stretch` / `stretchReminder` | ack | Slice B | 限频 |
| 茶歇偶遇（Idle 稀有） | `tea-drinking` | 生命感 | Slice B | 极低频；不打扰 |
| 摸头较长 | `ear-wiggle-head-touch` | 响应 | Slice B | 素材在；递进规则见圣经 |
| Idle 张望 | gaze-p1～p4 | 自主 | Slice B | 须守「不打扰」权重；曾关自动池 |
| 无互动 ~10 min | 70% 静坐 / 30% 挥手 | 自主 | 部分口径已定；挥手接线核对属 Slice B | 见圣经时间表 |
| 靠近自动点头 | `nodGreeting` | — | **勿接** | 2026-07-19 已拆除 |
| 长期里程碑 | `milestoneGlow` | ritual | 另 Brief | `task-milestone-glow-product-wire.md`；属纪念奖励大图，**不**并进 Slice A |
| 荷花成长 / 莲花解锁 | lotus-* | ritual | Slice C | 纪念奖励 |

---

## 六、Slice A 验收口径（产品）

1. **Language**：`?product=1` → Language → 日本語 → 阿寅播合十（`intentionSet` / palms-together）→ 回 Idle；再切 English → 播鞠躬（`nod-bow`）；同日重复切同一语**不**反复播。  
2. **Honesty Idle**：非睡态 → 选时长 → 呼吸结束 → toast **且**短点头鞠躬 → 桥接；睡态路径仍 dormantWake，记账后**不**再叠 Celebrating。  
3. **微仪式**：完成仍为 `sessionComplete` + 中置 toast（回归确认，非新需求）。  
4. **禁止**：切语言或 Honesty 补登触发 `celebrating` / `milestoneGlow`。

自动化建议（实现时）：unit 锁「locale 变化 → 选键 / 同日限频 / Focusing 跳过」；e2e 扩 `language-switch.spec.js` 断言播放态或等价 data 钩；Honesty 回流一条。

---

## 七、文档关系

| 文档 | 关系 |
|---|---|
| `EMOTION_BIBLE.md` | 键、优先级、互动清单；本表触发须可回指圣经行 |
| `ASSET_INVENTORY.md` | 素材是否入库 / 调试-only |
| `PRODUCT_MOMENTS.md` | Five Moments 叙事；本表按 Moment 填空 |
| `MICRO_RITUAL_PLAN.md` | 微仪式完成反馈细节 |
| `PROCESS.md` Backlog | 排期与 v1.0.0 Slice A 升格 |
| `task-briefs/task-scene-animation-wiring-v1-slice-a.md` | Slice A 实现规格 |

---

## 八、变更记录

| 日期 | 说明 |
|---|---|
| 2026-07-31 | 初版：全表 + v1.0.0 Slice A（语言合十/鞠躬、Honesty Idle 短认可、微仪式已接线核对）；用户拍板纳入第一版 |
| 2026-07-31 | Slice A 实现：`localeGreeting` + Honesty Idle `mindfulAcknowledge`；表内状态改为已实现 |
