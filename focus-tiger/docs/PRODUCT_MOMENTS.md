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
| **Recover** | 分心、焦虑、卡住 | 帮助用户回到当下，而非责备 | 被动侧已有 Re-focus；**主动 Recover 仍空白**。`welcomeBack` **不是** Recover（见下） |
| **Transition** | 在任务/会议/学习/休息之间切换 | 帮助用户完成心理上的"重置" | **空白**——完全未设计 |
| **Reflect** | 完成一次专注或一天后 | 回顾觉察与成长，而非只统计数字 | 已完整——Tiger Reflection Moment 三问 |

**关键判断**：Recover 和 Transition 是真正的新增空白，且 Recover 很可能是全产品里使用频率最高的入口——多数人一天里"分心→想拉回来"的次数，远多于"完整走完一次 25 分钟专注"的次数。这意味着 Recover 的打磨优先级应该被重新评估，不能停留在现在"占位日志"的状态。

---

## 四、逐 Moment 详细说明

### 4.1 Arrive（Honesty Check-in + Arrival Practice v2）

- **定义**：一天开始，或准备开始一项新任务前，先花几秒钟觉察当前状态，而不是立刻扎进专注计时。
- **对应现有实现**：
  - Honesty Check-in / DORMANT 唤醒仪式（按天、可忽略）——与 Arrival Practice **并存、不改名**。
  - **Honesty 桥接 CTA**（2026-07-19 拍板，见 `HONESTY_BRIDGE_CTA.md`）：补登仪式结束后可出现一次轻量邀请「要不要现在也坐一会儿？」；Yes → 完整 Arrival Practice → Companion Mode（**不**跳过、**不**直接开表、**不**自动开 Ambient）；No / 忽略 → idle，当天不再弹出。桥接**不是** Honesty 流程的一部分，Honesty 本身仍仅补登。
  - Arrival Practice（TASKS.md 任务十，✅ v2）：点击 Sit with Yin 后 → 欢迎 / Notice 状态点选（不落库）/ ~5s 呼吸 / Choose（图标+次要打字，落库回显）→ Companion Mode → 再 Sit 计时。全程可跳过。详规见 `ARRIVE_MOMENT_DESIGN.md`；会话粒度见 `CORE_LOOP.md`。
- **不做什么**：不做「每日打卡义务」式强制入口；Notice 不做跨会话情绪统计；不加角色语音；**不**把 Honesty 改成选时长即开计时。

### 4.2 Focus（已完整，本次不动）

现有 FocusSession / Companion Mode 三选一 / Sit with Yin 交互已完整覆盖，Five Moments 框架只是把它正式归入这条时间轴的第二格，不涉及改动。

### 4.3 Recover（会话内注意力回归；主动入口待做）

> **已拍板（2026-07-18）**：Recover = 会话内、与分心/注意力相关的回归。家族成员：**Re-focus Acknowledge**（已有）+ **未来用户主动发起的 Recover**。`welcomeBack`（约 10 分钟无互动后的 wave-hello）是 Idle **生命感偶遇**，**明确不进** Recover 家族。代码键、触发器、限频池继续分开——统一的是叙事边界，不是合并实现。详见 `CORE_LOOP.md`「Recover 与 welcomeBack 边界」。

- **定义**：用户已经分心、刷了手机、感到焦虑或不知所措，想要"用最短路径回到当下"，而不是重新发起一次完整专注。
- **与现有功能的区别**：
  - Re-focus Acknowledge：被动触发，离开页面超过 60 秒返回时出现；属 Recover 家族的被动强度。
  - 未来主动 Recover：用户主动发起，不依赖检测；属同一家族的主动入口（尚未实现）。
  - `welcomeBack`：页内无互动后的偶遇挥手；**不是** Recover，不得按分心回归叙事改写。
- **建议设计方向**（主动入口只定方向，交互细节留待下一步单独设计）：
  - 独立会话类型，不是 FocusSession 的缩短版——无目标时长、无完成判定、无统计计入达标。
  - 复用 Honesty Check-in 已验证的"呼吸引导"模式（10 秒呼吸引导 → 观察式一句文案 → 结束），时长可以拉长到 1-2 分钟，但仍保持"进来就能用、用完就走"。
  - 结束后不触发 Celebrating / sessionComplete 这类"完成感"反馈——Recover 的产品语义是"没关系，回来就好"，不是"完成了一项任务"，避免和达标反馈的分量混淆。

### 4.4 Transition（新增，触发方式需要重新设计）

- **定义**：在两项性质不同的活动之间（会议→写代码、专注→休息、上班→下班）完成一次短暂的心理重置。
- **关键约束**：Focus Tiger **无法感知**"会议结束了"这类真实世界事件——这是 Companion Mode 已经踩过的坑（Focus Confidence"标签可见=专注"的系统性误判）。Transition 会遇到同样的问题，且更难判定。
- **建议设计方向**：
  - 不做自动检测，改为**用户主动触发**的常驻入口（例如界面角落一个轻量按钮），符合项目已确立的"诚实机制"（用户自主声明而非技术探测）。
  - 与 Recover 的区别：Recover 是"我分心了，需要拉回来"；Transition 是"我状态没问题，只是要换任务了"——两者语义不同，但可能共用同一套呼吸引导的底层实现，UI 入口和文案需要分开。
  - 一次交互应该极短（一次深呼吸量级），不应该演变成第二个 FocusSession。

### 4.5 Reflect（已完整，本次不动）

Tiger Reflection Moment 三问已完整覆盖 Five Moments 的最后一格，不涉及改动。

### 4.6 Grow Together（会话循环节点；粒度见 CORE_LOOP）

Five Moments 按「一天」叙事；单次会话末尾的 **Grow Together**（老虎成长 = 用户成长映射）写在 `CORE_LOOP.md`。候选纪念物解锁视觉：`lotus-chest-halo`（胸口莲花 + 脑后金光，10 帧）已入库，可作为纪念物解锁那一刻的正式呈现候选；具体接入等 Backlog「纪念奖励系统」排期再定——不在此决定「什么算一次里程碑」。

---

## 五、定位话术更新

在 PRODUCT_POSITIONING.md 现有的中英文一句话定位（"不是又一个番茄钟 App，而是……正念陪伴伙伴"）基础上，补充一条面向 Digital Minimalists 人群的表达角度，**不是新增功能，是新增一种理解产品的入口**：

> 中文：对于想要减少手机依赖、找回生活主导权的人，Focus Tiger 不是又一个"提效工具"，而是帮助你重新练习"如何安放注意力"的陪伴者。
> EN: For people trying to spend less time on their phones and more time present in their own lives, Focus Tiger isn't another productivity tool — it's a companion for re-learning where to place your attention.

这条建议直接并入 PRODUCT_POSITIONING.md 现有定位段落，与"不是又一个番茄钟 App"那句并列呈现，不需要单独开发任务支撑。

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
