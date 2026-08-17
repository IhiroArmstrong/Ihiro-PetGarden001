# PRODUCT_MOMENTS.md — Five Moments 产品叙事框架

创建日期：2026-07-18
产品语义层级：位于 PRODUCT_POSITIONING.md 之下、TASKS.md 之上——即"为什么做这些功能"与"具体做哪个任务"之间缺的那一层。不推翻已有实现，只是给已有功能和未来功能一个统一的归类方式。

---

## 一、背景与目的

现有的功能推进是按任务清单（Companion Mode、Honesty Check-in、Reflection Moment……）逐项完成的，每项本身语义清晰，但缺一条把它们串成"一天"的叙事线。Five Moments 提供的正是这条线：**Focus Tiger 不是"开始专注时才打开的工具"，而是可以自然嵌入一天中多个关键时刻的陪伴者**。

这一层叙事不改变任何已完成功能的实现，只是重新命名、归类，并标出真正的空白。

---

## 二、与既有核心模型的关系

2026-07-16 已确立的核心逻辑「觉察 Awareness → 专注 Focus → 心流 Flow → 内在成长 Growth」是**单次专注体验内部的心理弧线**，回答"一次专注是怎么发生的"。

Five Moments 是**一天当中的时间轴**，回答"用户什么时候会想起阿寅"。两者不冲突，是不同粒度：Five Moments 里的每一个 Moment（尤其 Focus）内部仍然遵循觉察→专注→心流→成长这条弧线；Five Moments 解决的是"除了专注之外，阿寅还能在哪些时刻出现"。

---

## 三、Five Moments 核心模型

| Moment | 用户状态 | 阿寅的角色 | 现状 |
|---|---|---|---|
| **Arrive** | 一天开始，或准备开始一项任务 | 帮助用户觉察当前状态 | ✅ Arrival Practice v2（Sit→欢迎/Notice/呼吸/Choose→Companion Mode）；Honesty Check-in 按天并存 |
| **Focus** | 正在专注 | 安静陪伴，不打扰，提供稳定感 | 已完整——FocusSession / Companion Mode / Sit with Yin |
| **Recover** | 分心、焦虑、卡住 | 帮助用户回到当下，而非责备 | 被动 Re-focus ✅；**主动 Recover（Tiger Anchor）已落地**（Focusing 轻触阿寅；不占被动额度；180s 冷却）。`welcomeBack` **不是** Recover（见下） |
| **Transition** | 在任务/会议/学习/休息之间切换 | 帮助用户完成心理上的"重置" | **空白**——完全未设计 |
| **Reflect** | 完成一次专注或一天后 | 回顾觉察与成长，而非只统计数字 | 已完整——Tiger Reflection Moment 三问 |

**关键判断**：Transition 仍是真正的新增空白。Recover 被动侧（Re-focus）与主动侧（Tiger Anchor）均已落地——打磨重点转为观感与冷却手感，而非「占位日志」。
**动画接线**：各 Moment 应对哪一档角色动画，见 **`SCENE_ANIMATION_WIRING.md`**（v1.0.0 先交付 Slice A：语言切换问候 + Honesty Idle 短认可；微仪式完成已接线）。

---

## 四、逐 Moment 详细说明

### 4.1 Arrive（Honesty Check-in + Arrival Practice v2）

- **定义**：一天开始，或准备开始一项新任务前，先花几秒钟觉察当前状态，而不是立刻扎进专注计时。
- **对应现有实现**：
  - Honesty Check-in / DORMANT 唤醒仪式（按天、可忽略）——与 Arrival Practice **并存、不改名**。
  - **Honesty 桥接 CTA**（2026-07-19，见 `HONESTY_BRIDGE_CTA.md`）：每次补登结束后**立刻**出现邀请（顶行 thanks 回显 +「要不要现在也坐一会儿？」）；Yes → 完整 Arrival → Companion（**不**直接开表 / Ambient）；No → idle。允许当天多次补登、多次桥接。桥接**不是** Honesty 流程的一部分。
  - Arrival Practice（TASKS.md 任务十，✅ v2）：点击 Sit with Yin 后 → 欢迎 / Notice 状态点选（不落库）/ ~5s 呼吸 / Choose（图标+次要打字，落库回显）→ Companion Mode → 再 Sit 计时。全程可跳过。详规见 `ARRIVE_MOMENT_DESIGN.md`；会话粒度见 `CORE_LOOP.md`。
- **不做什么**：不做「每日打卡义务」式强制入口；Notice 不做跨会话情绪统计；不加角色语音；**不**把 Honesty 改成选时长即开计时。

### 4.2 Focus（已完整，本次不动）

现有 FocusSession / Companion Mode 三选一 / Sit with Yin 交互已完整覆盖，Five Moments 框架只是把它正式归入这条时间轴的第二格，不涉及改动。

### 4.3 Recover（会话内注意力回归；主动入口待做）

> **已拍板（2026-07-18）**：Recover = 会话内、与分心/注意力相关的回归。家族成员：**Re-focus Acknowledge**（已有）+ **未来用户主动发起的 Recover**。`welcomeBack`（约 10 分钟无互动后的 wave-hello）是 Idle **生命感偶遇**，**明确不进** Recover 家族。代码键、触发器、限频池继续分开——统一的是叙事边界，不是合并实现。详见 `CORE_LOOP.md`「Recover 与 welcomeBack 边界」。

- **定义**：用户已经分心、刷了手机、感到焦虑或不知所措，想要"用最短路径回到当下"，而不是重新发起一次完整专注。
- **与现有功能的区别**：
  - Re-focus Acknowledge：被动触发，离开页面超过 60 秒返回时出现；属 Recover 家族的被动强度；占共享提醒日额度 + 每会话最多 1 次。
  - **主动 Recover（Tiger Anchor · 已落地）**：Focusing 中轻触阿寅（或幽灵提示）；播 `nod-bow` + 中置观察式 toast（~3s）+ LightProgression Recover 扰动；**不**暂停计时、**不**进 MicroRitual / Reflection / 记账；**不**占被动提醒池；触发后触点 **180s** 冷却隐退。
  - `welcomeBack`：页内无互动后的偶遇挥手；**不是** Recover，不得按分心回归叙事改写。
- **主动入口实现要点**（交互 Brief 2026-08-09）：
  - 零次级菜单：Focusing 无菜单槽位 → 以阿寅本人为触点。
  - 分级限频：被动硬额度；主动无限次 + 冷却（非「额度用尽」挫败文案）。
  - 代码：`MindfulReminderController.triggerActiveRecover()` + `ActiveRecoverAnchorUI`。
- ~~建议设计方向（旧草案）~~：独立会话 / 1–2 分钟呼吸引导 — **已由上述零 MicroRitual 路径取代**，勿再按旧草案排期。
### 4.4 Transition（新增，触发方式需要重新设计）

- **定义**：在两项性质不同的活动之间（会议→写代码、专注→休息、上班→下班）完成一次短暂的心理重置。
- **关键约束**：Focus Tiger **无法感知**"会议结束了"这类真实世界事件——这是 Companion Mode 已经踩过的坑（Focus Confidence"标签可见=专注"的系统性误判）。Transition 会遇到同样的问题，且更难判定。
- **建议设计方向**：
  - 不做自动检测，改为**用户主动触发**的常驻入口（例如界面角落一个轻量按钮），符合项目已确立的"诚实机制"（用户自主声明而非技术探测）。
  - 与 Recover 的区别：Recover 是"我分心了，需要拉回来"；Transition 是"我状态没问题，只是要换任务了"——两者语义不同，但可能共用同一套呼吸引导的底层实现，UI 入口和文案需要分开。
  - 一次交互应该极短（一次深呼吸量级），不应该演变成第二个 FocusSession。

### 4.5 Reflect（已完整，本次不动）

Tiger Reflection Moment 三问已完整覆盖 Five Moments 的最后一格，不涉及改动。

**相邻规划（2026-08-10 · 非本 Moment 改动；2026-08-18 桌面窄例外）**：**向阿寅倾诉**为 Idle 主动倾听入口，与会话后 Reflection **分轨**；不替代三问，也不并入 Reflect 表面排期。默认检索不生成；仅桌面端在语料未接住时允许受约束短生成（见 `PRODUCT_POSITIONING.md`「禅意倾听者」）。Web Brief `task-confide-to-yin-v1.md`；桌面 Brief `task-desktop-on-device-companion.md`。

**相邻规划（2026-08-11 · 非 Five Moments 改动）**：**节日主题引擎**为跨时刻的 B 轨氛围层（可叠在 Arrive/Focus/Idle 的视觉上），**不**新增第六 Moment，也**不**改各 Moment 状态机。权威：`task-briefs/task-seasonal-theme-engine-v1.md`。

### 4.6 Grow Together（会话循环节点；粒度见 CORE_LOOP）

Five Moments 按「一天」叙事；单次会话末尾的 **Grow Together**（老虎成长 = 用户成长映射）写在 `CORE_LOOP.md`。候选纪念物解锁视觉：`lotus-chest-halo`（胸口莲花 + 脑后金光，10 帧）已入库，可作为纪念物解锁那一刻的正式呈现候选；具体接入等 Backlog「纪念奖励系统」排期再定——不在此决定「什么算一次里程碑」。

---

## 五、定位话术更新

在 PRODUCT_POSITIONING.md 现有的中英文一句话定位（"不是又一个番茄钟 App，而是……正念陪伴伙伴"）基础上，补充一条面向 Digital Minimalists 人群的表达角度，**不是新增功能，是新增一种理解产品的入口**：

> 中文：对于想要减少手机依赖、找回生活主导权的人，Focus Tiger 不是又一个"提效工具"，而是帮助你重新练习"如何安放注意力"的陪伴者。
> EN: For people trying to spend less time on their phones and more time present in their own lives, Focus Tiger isn't another productivity tool — it's a companion for re-learning where to place your attention.

这条建议直接并入 PRODUCT_POSITIONING.md 现有定位段落，与"不是又一个番茄钟 App"那句并列呈现，不需要单独开发任务支撑。

---

## 5.5 分散式即时提示 + 常驻「?」补救（2026-07-19）

不做集中式引导浮层 / coachmark / 分步说明书。理由：强迫读说明书会破坏 Arrive 的安静感；新用户真正需要的是**此刻下一步点哪里**。

机制见仓库根目录 / `docs/ONBOARDING_HINTS.md`：

1. **即时提示**：各关键界面首次出现时，阿寅旁一行小字气泡；完成该步操作后记入 `focus-tiger.hints-seen.v1` 并隐藏。**点击气泡本身须立刻消失**（自动条同时记已读）。
2. **补救「?」**：左下角常驻，按当前场景复述对应一句，不受已读限制；点开后的气泡同样可点击立刻关闭。

覆盖 SCENARIO_TESTS 主路径与回流（DORMANT、Honesty 可略过、Sit / How shall we sit?、Arrival 各步、Companion、Sound、Rise、Reflection 等）。产品壳 `?product=1` 仍显示提示与「?」（属产品表面）；实验室另有「清空引导提示已读」。

> **产品面收窄后（2026-08-04）**：运行时 Hint 只保留脉冲悬停 tip +「?」简介卡；**不再** auto 喷洒。Five Moments 显性化不得借机复活喷洒——见下 §5.6。

---

## 5.6 Five Moments 用户可感表面（2026-08-09 拍板 · 排期）

目标：把 Five Moments 从后台叙事升级为用户可感灵魂，同时遵守 §5.5 / Hints 收窄与 Focus「不打扰」。

| 序 | 代号 | 内容 | Brief | 状态 |
|---|---|---|---|---|
| 1 | **B** | Compass：⋯/Settings + 可跳过首卡 +「?」可开同一指南；五时刻芯片可点跳到已有功能 | `task-briefs/task-five-moments-compass-b.md` | **已合**（#201）；操作故事 **SCENARIO Y1**；2026-08-13 芯片可点 |
| 2 | **A′** | Moment Whisper（每 Moment 键一生一次，阿寅旁淡出句）+「?」桥接 | `task-briefs/task-five-moments-whisper-a.md` | **已合**（#203）；操作故事 **SCENARIO Y2** |
| 3 | **D′** | Journey Log（应用内本地留痕，Tea Log 模式；**非** HealthKit） | `task-briefs/task-journey-log-d.md` | **已合**（#205）；操作故事 **SCENARIO Z** |

父决策全文：`task-briefs/task-five-moments-surface-plan.md`。

**明确不做（本排期）**：常驻 5-Dot Compass Bar；每次切换顶部教导 Banner；HealthKit / Health Connect 写入；把 Rise 叙事成 Transition。

**A′ 为何不是「原 Banner」**：原 Contextual Banner 易变说明书且撞 Focus 隐退。万全之策 = **「?」永远可查** + **Whisper 一生一次认出** + **B 完整地图自愿查阅**。

---

## 六、Family Edition — 存档至 Backlog（本次不展开设计）

记录用户提出的方向，供未来单独立项时参考，**本文档不做交互设计**：

- **市场判断**：目标人群不是"孩子"，而是"父母/老师"，他们的需求是培养孩子的专注力、情绪管理、正念习惯；远期可发展为"一起养 Focus Tiger"的 Family Edition（例如爸爸和孩子共同维护同一个阿寅）。
- **必须先解决的风险，而非先做的功能**：产品对象一旦包含儿童，现有"陪伴而非监督、只增不减的纪念奖励"这类机制的安全标准会发生质变。项目已经明确拒绝"喂养/健康退化"叙事，原因是这类机制可能诱发强迫性使用——这条判断对成人用户是体验偏好，对儿童用户会直接变成设计伦理红线。尤其"家长可见孩子的专注数据"这一条，本质上和已拒绝的"照料责任叙事"是同一类风险，只是换了监督对象。
- **处理方式**：作为独立 Backlog 分支存档，不并入当前 MVP 核心循环。待 Five Moments 单人体验成熟后，再回头单独设计 Family Edition 需要的额外原则（家长视角的克制程度、孩子端是否隐藏统计数字、"共同经历"如何避免变成攀比或监督）。

---

## 七、本次遗留的开放决策

- Recover 和 Transition 是否共用同一套呼吸引导 UI 组件（仅换文案/时长），还是各自独立实现——影响后续开发工作量，需要在具体交互设计阶段（下一步）决定。
- Recover / Transition 是否需要独立的会话数据结构（区别于 FocusSession 的持久化记录），或者完全不落记录——需先明确这两类交互是否要出现在任何统计/回顾里。
- Transition 的常驻入口具体放在界面什么位置、什么视觉分量，避免和 Sit with Yin 主按钮抢注意力——留待交互设计阶段解决。

---

## 八、本次不在范围内（防止范围蔓延）

- 不改动任何已完成功能的实现或触发逻辑（Focus / Reflect / Companion Mode / Honesty Check-in 均不动）。
- 不展开 Family Edition 的具体交互、数据模型或商业模式设计。
- 不在本文档内决定 Recover / Transition 的具体 UI 文案、动画素材或代码实现——这些留给下一步的交互设计任务。
