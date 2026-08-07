# ARRIVE_MOMENT_DESIGN.md — Arrive 整合设计（v2：Arrival Practice，已实现）

创建日期：2026-07-18　最后更新：2026-07-24（第五节跳过改为 ⚡ Quick Start；UI 明确为轻量气泡非模态）

**给 Cursor 的重要提示**：如果已经按 v1 的 Cursor Prompt（纯自由文本输入版本）动手实现，
请先停下核对本文档第六节的变更范围，本版本改的是 Choose 步骤的输入方式和新增 Notice
的具体交互，Reflection 回显机制、本地存储 key 结构基本不变，大概率可以在现有基础上
增量修改，不需要推倒重来。

---

## 一、命名澄清（避免和现有功能混淆）

- **Honesty Check-in**（已实现，不改动）：仅在当日 DORMANT（尚无完成记录）时出现的
  可忽略提示，内容是"是否在别处练习过"，和下面的 Arrival Practice 是两件事，不要
  互相改名。
- **Arrival Practice**（本次新名字，采纳）：指点击 Sit with Yin 之后、真正开始计时
  之前的这一整套 10-20 秒轻量仪式（欢迎 → Notice 状态点选 → 一次呼吸 → Choose 今天
  做什么 → 开始）。这是 PRODUCT_MOMENTS.md 里 "Arrive" Moment 的具体交互实现，"Arrive"
  作为 Moment 名不变，"Arrival Practice" 是这个具体流程的名字。

---

## 二、完整流程

```
用户点击 Sit with Yin
  ↓（全程可跳过，见第五节）
欢迎（~2秒，纯文字气泡，无语音）
  "Welcome back." / "Let's begin our practice."
  ↓
Notice：状态点选（1次点击）
  🧘 Calm　🌤️ Okay　🌊 Busy Mind　🔥 Stressed　🌧️ Low Energy　😶 Not Sure
  Yin 回应一句观察式短句（约 0.9s，**仅短句、收起图标区**），不做分析、不做建议
  ↓
一次呼吸（~5秒；角色保持放慢的眨眼微笑，**不**切 idle-breathing / **不**播合十）
  "Let's arrive together."
  视觉：`blink-smile` @ **4 fps** pingpong（欢迎步仍为默认 8fps）；Choose 确认用 16:9 点头（不再合十）
  ↓
Choose：今天做什么（图标点选为主，次要打字入口）
  📖 Reading　💻 Deep Work　🎨 Creative Work　🧘 Meditation　📝 Writing　☕ Just One Small Step
  （或点"自己写"展开一行可选文本输入 + **→** 确认钮；说明「点右箭头或按回车」；空 Enter 仍可跳过 Choose）
  ↓（确认瞬间：立刻开门闩 + Companion；并行播 16:9 `intentionNod` 点头 + 坐垫光晕；跳过 Choose 不播）
  ↓（Arrival Practice 到此结束）
Companion Mode 三选一（独立组件，不合并进 Arrival Practice）
  ↓
确认 → 计时开始
  ↓
会话结束（达标或中途主动结束，两条路径都会） → Reflection Moment
  （开头回显 Choose 内容，两条路径都回显；Notice 状态永不回显、永不落库）
```

**Choose 确认视觉（2026-07-20）**：改用 **16:9 nod-bow**（不再合十）；Companion 门闩在确认瞬间打开（动画不挡流程）。Dolly 在点头回 idle 后拉回。跳过 Choose 时立刻清氛围并拉回。

---

## 三、Notice 的回应措辞原则

这是本次设计里最值得保留的一点：**Yin 的回应描述"状态"，不描述"用户"**，直接落实
PRINCIPLES 已有的"观照者而非情绪本身"原则：

- 用户点 🌊 Busy Mind → Yin："A busy mind is here today." **不是** "You are busy."
- 用户点 🔥 Stressed → Yin："There's some stress here." **不是** "You are stressed."

这个措辞规则同样要用于 Choose 步骤如果用户自己打字输入时的任何回显文案。最终六句
回应台词，接入前需要过 EMOTION_BIBLE 的四项观察式自检。

---

## 四、数据存储与是否持久化（两步规则不同，容易搞混，务必分开处理）

- **Notice 状态点选**：**不存储、不做跨会话统计**。只用于挑选 Yin 当次的一句回应台词，
  用完即弃。这一步保留是为了完成"觉察当下"的体验，不是为了积累情绪数据——项目已经
  明确删除过"情绪分析/AI Coach"类表达，这里不能借着"顺便存一下"把那个方向绕回来。
- **Choose 选择**：沿用存储设计，仍然记录：
  ```
  localStorage key: focus-tiger.intentions.v1
  结构：[{ text: string, source: 'icon' | 'typed', timestamp: number }, ...]
  规则：仅非空才存；最多保留最近 5 条。
  source 字段区分是点了图标（存图标对应的标签文案，如 "Deep Work"）还是自己打的字。
  ```
- **提示文案（Cursor 定稿，已过 EMOTION_BIBLE 四项观察式自检）**：
  - 中文：注意力正要带向哪里？
  - EN: What are you bringing attention toward?
- **Reflection 回显文案（Cursor 定稿）**：
  - 中文：注意力所向：{selection}
  - EN: Attention toward: {selection}
  - **两条路径都回显**：达标结束和中途主动结束都会进入 Reflection Moment，Choose
    内容与是否达标无关，两条路径均回显；若当次跳过了 Choose，则不显示这句。
  - Notice 状态在任何路径下都不回显、不落库。

---

## 五、必须存在的跳过机制（快速开始；2026-07-24 修订）

v1 提议的原始流程里没有跳过点，这是必须修正的地方——项目至今没有任何强制、不可跳过
的交互（Reflection 三问可跳、Honesty Check-in 可忽略），Arrival Practice 不能开这个
先例，否则会正面违反"陪伴而非监督"的定位。

- **快速开始（产品路径）**：Idle dock 旁 **⚡ Quick Start** 极简图标（`#quick-start-focus`）。
  点击后跳过 Welcome / Notice / Breath / Choose（若 Arrival 已开则关闭），**用当前记忆的
  Companion 模式立刻开始计时**（按钮变 Rise）。Idle 且未开 Arrival 时同样可直接开表。
- Notice：以图标点选前进（含「不确定」）；**不再**提供每步 `Skip` 文案按钮。
- Choose：以图标点选或「自己写」前进；无意图时可走 ⚡ Quick Start。
- **已移除**：Arrival 面板内的 `Skip` / `Skip — begin` / `Skip all` 双钮，以及「Sit 二次点击
  = Skip — begin」捷径（避免与 ⚡ 双通道）。

> 历史方案 A（每步 Skip + 全程 Skip — begin，见第八节）已由本修订替代；Reflection 三问的
> Skip / Skip all **不在本文件范围**，仍按其自身设计保留。

---

## 六、触发时机：仍然挂在"点击 Sit with Yin"，不是"打开 App 就触发"

沿用 v1 判断：如果用户打开 App 只是想看看环境细节解锁进度或调设置，不应该被强制走
一遍 Arrival Practice。只有点击 Sit with Yin、明确表达"我要开始专注"的意图时，才
触发这套流程。这样"不限时段、每次都能重新抵达当下"的效果依然成立，但不会打扰不打算
专注的场景。

---

## 七、素材复用建议

- 欢迎beat（睁眼/微笑）可以复用 `blink-smile`（12 帧，已入库但至今未绑定任何 emotion
  key）——这正好是它第一个合适的落点，不需要新素材。
- 呼吸 beat 复用 Honesty Check-in 已有的呼吸引导动画逻辑，时长从 10 秒改成约 5 秒的
  变体即可，不需要重新设计动画本身。
- 全程文字气泡呈现，不加语音、不做 lip-sync——这是项目已确立的"无角色语音原则"，
  提醒 Cursor 不要顺手加上语音播报。

---

## 八、开放决策（2026-07-18 定稿并已实现）

1. **UI 结构**：不另建 Begin Panel 大面板。CompanionModePicker 保持独立组件；
   Arrival Practice（欢迎→Notice→呼吸→Choose）走完之后，再单独展开 Companion
   Mode 三选一，不合并成一个面板。
2. **未达标是否回显**：要回显。Choose/意图内容与是否达标无关，达标结束和中途
   主动结束两条路径都会进入 Reflection Moment，且都回显 Choose 内容；Notice
   状态永不回显、永不落库，这条不受影响。
3. **文案**：已过 EMOTION_BIBLE 四项观察式自检，定稿见第四节。
4. **跳过交互（2026-07-24 修订）**：
   - **现行**：⚡ Quick Start（`#quick-start-focus`）跳过整段仪式并立刻 Focusing；Arrival UI 为
     **轻量气泡 / 字幕 + 图标点选**，**不是**重型暖色模态卡片；**无**面板内 Skip / Skip — begin。
   - **点外侧取消（2026-07-25）**：Notice / Choose **选择格**打开时，点框外空白 → **取消本轮
     Arrival 回 Idle**（不开表、不等于 ⚡）。Welcome / Notice 观察短句 / Breath 进行中不因此关闭。
   - ~~方案 A（旧实现）~~：每步 `Skip` + 全程 `Skip — begin` —— 易被感受为「弹窗1→2→3」，已移除。
   - 方案 B（未采用）：超时自动跳过为主、无显式入口——发现性较差。

> 光影氛围层见 `LIGHT_PROGRESSION_DESIGN.md`（Arrival / Recover 的 2D DOM/CSS 渐进，不改本流程逻辑）。

---

## 九、Cursor 实现 Prompt（替换 v1 版本）

```
基于 ARRIVE_MOMENT_DESIGN.md v2，实现 Arrival Practice（Notice + Choose），
如果已按 v1 Prompt 动手，请先对照本文档第六节确认改动范围，非全部推倒重来：

1. 新建 Arrival Practice 流程容器，插在"点击 Sit with Yin"和"Companion Mode
   三选一"之间：欢迎 beat（复用 blink-smile 素材，纯文字气泡，无语音）→ Notice
   状态点选（6 图标，单选，不记录不持久化）→ 呼吸 beat（复用 Honesty Check-in
   呼吸引导逻辑，时长改为约 5 秒）→ Choose（6 图标点选为主 + "自己写"次要文本
   入口）→ 进入现有 Companion Mode 三选一 → 确认开始计时。

2. 全程必须提供跳过路径（见设计文档第五节）：整体跳过入口 + Notice/Choose 各自
   独立可跳过，不设强制必选项。具体交互形式请先给 1-2 个方案，不要直接实现。

3. Notice 状态点选严格不落库、不做跨会话统计，只用于选择 Yin 当次的一句回应
   台词（六句文案见设计文档第三节初稿，接入前需过 EMOTION_BIBLE 四项观察式
   自检）。

4. Choose 沿用/调整本地存储 focus-tiger.intentions.v1，新增 source 字段区分
   'icon' | 'typed'，结构见设计文档第四节。Reflection Moment 开头的回显逻辑
   按来源区分文案（"你选择的是" vs "你写下的是"），若跳过则不显示。

5. 确认中途主动结束（未达标）路径下 Choose 回显是否仍展示（见设计文档第八节
   第2条），如现有代码耦合复杂，先给方案不要直接实现。

6. 补充单元测试：Notice 点选不产生任何持久化写入；Choose 为空时不存储不回显；
   Choose 非空时按来源正确存储且仅保留最近 5 条；跳过路径下不阻塞后续流程。

7. 更新 TASKS.md 任务十状态、EMOTION_BIBLE 与 PRODUCT_MOMENTS.md 中 Arrive
   一节的实现状态，注明本次为 v2（点选为主）设计。
```
