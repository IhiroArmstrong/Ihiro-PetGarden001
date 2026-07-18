# TEST_TRACKER.md — 功能验收追踪表

维护规则：Cursor 每完成一项具有用户可感知效果的改动，必须在下方表格新增一行，
状态默认设为「待人工测试」，并在消息里明确说「这项需要你测试」。纯后端/逻辑改动
（无 UI 变化）登记为「仅单元测试覆盖」，不需要用户测试，但仍要登记，防止遗漏。

**权威路径**：`focus-tiger/docs/TEST_TRACKER.md`（勿在仓库根目录另建副本）。

**本地开发**：`cd focus-tiger && npm run dev` → 通常 `http://127.0.0.1:5173/`。  
演示会话时长当前为 **`DEMO_SESSION_MINUTES = 1`**（`src/main.js`）。  
右上角 `#emotion-debug-ui` 情绪调试面板常驻；DEV 下可用 `window.__*` 全局句柄。

---

## 状态定义

- **仅单元测试覆盖**：无用户可见变化，逻辑对错已由自动化测试验证，用户不需要点开看。
- **待人工测试**：已实现，单元测试（如有）已通过，但视觉/体验效果需要用户亲自看一遍才能确认。
- **已通过**：用户亲自测试确认没问题。
- **有问题**：用户测试后发现瑕疵，需写清楚问题内容，退回处理。

---

## 功能清单

> 首次回溯盘点：2026-07-18。凡用户从未书面确认「已通过」的 UI 项一律标「待人工测试」。

| 功能 | 类型（UI可见 / 纯后端） | 状态 | 测试步骤 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|
| Arrival Practice / 抵达练习（Welcome → Notice → Breath → Choose） | UI可见 | 待人工测试 | 1) 打开应用。2) 点 **Sit with Yin**。3) 欢迎气泡约 2s + 微笑序列。4) Notice：点选一个图标（或 Skip）→ 出现回复文案并前进。5) Breath：约 5s 吸呼引导。6) Choose：点图标，或「自写」+ Enter，或 Skip。7) 面板关闭后 Companion Mode 展开。8) 再点 **Sit with Yin** 才开始计时。Arrival 进行中主按钮文案为 **Skip — begin**。Notice 不落库；Choose 写入意图。 | `http://127.0.0.1:5173/` · 当日首次 Sit（`arrivalGateReady` 前）· DEV：`__arrivalPractice` | 2026-07-18 |
| Companion Mode / 陪伴模式三选一（Here & Now · Offline Space · Flow State） | UI可见 | 待人工测试 | Arrival 结束后底部 dock 出现 **How shall we sit?** → 展开 → 选一项（只预选、不开始）→ 面板收起 → 点 **Sit with Yin** 开计时。Stay：允许 Re-focus。Offline Space / Flow State：关闭离开类提醒。模式写入 `localStorage` `focus-tiger.companion-mode.v1`。 | 底部 Sit 旁 dock · Arrival/Reflection/Honesty 打开时不可选 · DEV：`__companionModePicker` | 2026-07-18 |
| Honesty Check-in / Mindful Check-in · DORMANT 唤醒 | UI可见 | 待人工测试 | 清空 `localStorage['focus-tiger.daily-completions.v1']` 后刷新 → 睡着 + 可忽略提示。点提示 → 选 10 / 20 / 30+ → 约 10s 呼吸（保持 sleeping）→ `dormantWake` → `haloBreathing` + 感谢文案 → 回 IDLE。当日零完成时未达标 Rise → 安静回 DORMANT、无失败文案。不占提醒额度。 | 零完成自动进入 · DEV：`__honestyCheckIn` / `__dailyCompletionStore` | 2026-07-18 |
| Tiger Reflection Moment / 结束反思 | UI可见 | 待人工测试 | 正常完成或主动 Rise 结束会话 → 留白约 400ms（完成）/ 300ms（主动）后淡入面板。可选回显本次意图。Q1–Q3：Continue / Skip / Skip all / Esc。非空答案写入 `focus-tiger.reflections.v1`（最近 5 条）；全跳过不落库。 | 会话结束后自动 · 单测：`TigerReflectionMoment.test.js` · DEV：`__reflectionMoment` | 2026-07-18 |
| 完成反馈 · 每日首次 Celebrating | UI可见 | 待人工测试 | 确保当日尚无完成记录 → Arrival + 选模式 → Sit → 等 **1 分钟**达标 → 播 `celebrate-dance`（约 57 帧）→ 回 idle-breathing → 进入 Reflection。 | 生产路径经 `triggerSessionCompletionFeedback` · 亦可调试面板「庆祝跳舞」 | 2026-07-18 |
| 完成反馈 · 同日后续 SessionComplete | UI可见 | 待人工测试 | 当日已有至少一次完成后，再跑一轮 1 分钟会话 → 只播 `session-complete` 摆尾（28 帧），**不**播 Celebrating → 回 idle → Reflection。 | 同上 · 调试面板「完成摆尾」可单看动作 | 2026-07-18 |
| IncenseComplete / 今日一炷香（莲花+金斑） | UI可见 | 待人工测试 | 右上角调试面板点「模拟一炷香」→ DOM 叠层莲花渐显 + 金色粒子（在 2D Yin 前方）。**业务会话结束尚未自动接线**（仅调试入口）。 | `#emotion-debug-ui` · `playEmotion('incenseComplete')` | 2026-07-18 |
| MilestoneGlow / 里程碑金辉 | UI可见 | 待人工测试 | 调试面板点「里程碑金辉」→ `milestone-glow` 27 帧（金光+蝴蝶已烧录）→ 末帧停约 2.5s → 回落。播放期归零实时金光。**真实里程碑判定属 Backlog，未接线。** | `#emotion-debug-ui` · `playEmotion('milestoneGlow')` | 2026-07-18 |
| MindfulAcknowledge / 20 分钟阶段确认 | UI可见 | 待人工测试 | Companion = Here & Now，开一场会话并保持页面 ≥ **20 分钟墙钟** → `nod-bow` + 非模态 toast（`MINDFUL_FOCUS_MILESTONE` 池）。与强反馈冲突时静默让位。共享日额度最多 3 次（`focus-tiger.reminder-quota.v1`）。演示会话仅 1 分钟时建议用调试按钮或 `__mindfulReminderController`。 | 生产长计时 / 调试面板正念确认 · DEV：`__mindfulReminderController` · `__reminderQuotaManager` | 2026-07-18 |
| Re-focus Acknowledge / 回归确认 | UI可见 | 待人工测试 | Here & Now 会话中：切走标签页 **>60s** 再回来 → 同 `mindfulAcknowledge`（`subtype: 'refocus'`）+ `REFOCUS_ACKNOWLEDGE` 文案 + LightProgression Recover 扰动（约 20% 亮度下降、约 5s 平复）。离开 20–60s：只记账不展示。Offline Space / Flow State：不触发。每会话最多 1 次。 | 生产路径 · DEV：`__attentionSignals` · 单测：`AttentionSignals` / `MindfulReminderController` | 2026-07-18 |
| stretchReminder / 舒展提醒 | UI可见 | 待人工测试 | 会话活跃累计满 **2 小时**（离开暂停；两场间隔 ≥30 分钟重置）→ `stretch-reminder` 17 帧 + toast。占共享日额度。演示短会话建议调试面板触发。 | 调试面板 / 生产长计时 · DEV：`__mindfulReminderController` | 2026-07-18 |
| Ambient Soundscape / 禅意背景音 | UI可见 | 待人工测试 | FOCUSING 时角落 **Sound** FAB → Off / Mer-Ka-Ba / Meditation Impromptu + 音量。可选首次 nudge。播放中 `presenceBoost`（≤0.2）叠到 focus 光效。会话结束停止。 | 仅 FOCUSING 可见 · DEV：`__ambientSoundscape` · 单测：`AmbientSoundscapeController.test.js` | 2026-07-18 |
| EyeTracking / 眼睛跟随（占位瞳孔） | UI可见 | 待人工测试 | 调试勾选「眼睛跟随鼠标」，播「坐禅微笑」→ 移动鼠标，深色占位瞳孔跟随。Idle 闭眼 / Sleeping / Celebrating 期间应隐藏。尚无正式瞳孔 PNG。 | `#eye-tracking-layer` · 调试勾选 · DEV：`__eyeTracking` | 2026-07-18 |
| PointerInteraction · 靠近点头 nodGreeting | UI可见 | 待人工测试 | 指针移入老虎靠近区 → `nod-greeting` 23 帧点头 → 播完回 idle-breathing。移出靠近区回 idle。Celebrating 期间摸头忽略。 | 全屏透明命中层 · DEV：`__pointerInteraction` | 2026-07-18 |
| PointerInteraction · 静止歪头 curiousTilt | UI可见 | 待人工测试 | 指针在靠近区内位移 ≤6px、静止 **4s** → `tilt-think` 20 帧；冷却 6s。不依赖后续 pointermove。 | 同上 | 2026-07-18 |
| PointerInteraction · 抚摸 / 轻点 / 绕圈（检测已接线、无正式精灵） | UI可见 | 待人工测试 | 头部拖动 ≥14px → `petHead`（控制台占位）。头部点击位移 ≤10px → `smileSquint`（占位）。约 1.4s 内绕圈 ~1.75π → `dizzyBlink`（占位）。确认检测触发即可；目前无完整 2D 动画。 | 同上 · 单测：`PointerInteraction.test.js` | 2026-07-18 |
| FocusSession + Focus HUD（Sit with Yin / Rise） | UI可见 | 待人工测试 | Arrival+模式后 Sit → 左上 HUD：Status Focusing、Focus %、Time MM:SS；金光/Rim 随 focusLevel 上升。提前 Rise → 停计时、无 Celebrating、进 Reflection（零完成则可能回 DORMANT）。达标即使稍后回页也会经 `visibilitychange` 校正完成。 | `#focus-hud` · 目标时长 **1 分钟**（演示）· 单测：`FocusSession.test.js` | 2026-07-18 |
| LightProgression / 光影物理渐进 | UI可见 | 待人工测试 | Arrival：冷→暖背景、Notice 升温、Breath 视差 Dolly（背景 1.06 / Yin 1.12）+ 呼吸光环、Choose 坐垫光晕。FOCUSING：DOM Rim 跟踪 focusLevel（+ ambient boost）与约 4s 呼吸脉冲。Re-focus：Recover 扰动后约 5s 平复。 | 随 Arrival / Re-focus 自动 · DEV：`__lightProgression` · 单测：`LightProgression.test.js` | 2026-07-18 |
| IdleOrchestrator / 自主闲置变体 | UI可见 | 待人工测试 | 保持 IDLE：基础 `idle-breathing` pingpong；约每 25–45s 插入 `idle-eye-glance` 或 `blink-smile`，再回基底。**无互动 10 分钟挥手尚未接线**（`welcomeBack` 仅调试）。 | DEV：`__idleOrchestrator` · 单测：`IdleOrchestrator.test.js` | 2026-07-18 |
| Sleeping / DORMANT 睡态循环 | UI可见 | 待人工测试 | 当日零完成进入 DORMANT → `sleeping` 8 帧循环。亦可调试面板播「睡着了」。 | 零完成自动 / `#emotion-debug-ui` | 2026-07-18 |
| AcrossToolsIdleGuard / Flow State 闲置 toast | UI可见 | 待人工测试 | Companion 选 Flow State → Sit → **30 分钟**无鼠标/键盘 → 一次 `ACROSS_TOOLS_IDLE` toast。仅切标签页不算 idle。 | 生产长等待 · DEV：`__acrossToolsIdleGuard` · 单测：`AcrossToolsIdleGuard.test.js` | 2026-07-18 |
| i18n（默认 en / 可切 zh） | UI可见 | 待人工测试 | 默认英文。控制台 `__i18n.setLocale('zh')` → 按钮、HUD、Arrival、Honesty、Companion、Reflection、Ambient、toast 刷新为中文；再 `setLocale('en')` 切回。**无应用内语言切换 UI。** | DEV：`window.__i18n` · `src/locales/{en,zh}.json` | 2026-07-18 |
| Emotion debug UI（右上角调试面板） | UI可见 | 待人工测试 | 打开页面后右上角可见按钮组：各情绪试播 + 旋转/呼吸/悬浮/眼睛跟随勾选。用于验收无生产入口的动作。 | `#emotion-debug-ui`（常驻，非 DEV 门控） | 2026-07-18 |
| idle / 坐禅闭眼呼吸基底 | UI可见 | 待人工测试 | 进入 IDLE 或 FOCUSING 默认态；离开靠近区后回落。应看到缓慢 `idle-breathing`。 | 默认态 / 调试「坐禅闭眼」 | 2026-07-18 |
| smiling / blink-smile（欢迎与调试） | UI可见 | 待人工测试 | Arrival Welcome 自动播；或调试「坐禅微笑」。pingpong。Celebrating 后持久 Smiling 基底**未接线**（回 Idle）。 | Arrival / 调试面板 | 2026-07-18 |
| welcomeBack / wave-hello 挥手 | UI可见 | 待人工测试 | 调试面板播「挥手欢迎」→ 19 帧 wave-hello（抬手顶点额外停留）。**10 分钟自主挥手未接线。** | `#emotion-debug-ui` · `playEmotion('welcomeBack')` | 2026-07-18 |
| dormantWake / Honesty 睡醒序列 | UI可见 | 待人工测试 | 走完 Honesty 呼吸，或调试面板播睡醒 → `dormant-wake` 16 帧 → 接 haloBreathing。sleeping↔wake 约 180ms cross-fade。 | Honesty 完成路径 / 调试面板 | 2026-07-18 |
| haloBreathing / 光环呼吸奖励 | UI可见 | 待人工测试 | Honesty 唤醒后自动，或调试面板。intro 后 pingpong。 | Honesty 后 / 调试面板 | 2026-07-18 |
| blink / 眨眼变体 | UI可见 | 待人工测试 | 调试面板「眨眼」；IdleOrchestrator 也可能插入 blink-smile 单次。 | 调试 / Idle 自主 | 2026-07-18 |
| tPose / 显示 3D 垫底（调试） | UI可见 | 待人工测试 | 调试面板 T-Pose → 短暂露出 3D canvas。确认 2D 主线默认隐藏 3D。 | `#emotion-debug-ui` | 2026-07-18 |
| ArrivalPractice 状态机 | 纯后端 | 仅单元测试覆盖 | `npm test` → `ArrivalPractice.test.js` | `src/core/ArrivalPractice.js` | 2026-07-18 |
| DailyCompletionStore | 纯后端 | 仅单元测试覆盖 | `DailyCompletionStore.test.js`；与 Honesty / 完成分流共用 | `src/core/DailyCompletionStore.js` | 2026-07-18 |
| SessionIntentionStore | 纯后端 | 仅单元测试覆盖 | `SessionIntentionStore.test.js`；Choose 写入 `intentions.v1` | `src/core/SessionIntentionStore.js` | 2026-07-18 |
| ReminderQuotaManager | 纯后端 | 仅单元测试覆盖 | `ReminderQuotaManager.test.js`；三类提醒共享自然日额度 | `src/core/ReminderQuotaManager.js` | 2026-07-18 |
| session-completion-feedback 分流逻辑 | 纯后端 | 仅单元测试覆盖 | `session-completion-feedback.test.js`；首日 Celebrating vs 同日 SessionComplete | `src/core/session-completion-feedback.js` | 2026-07-18 |
| AttentionSignals | 纯后端 | 仅单元测试覆盖 | `AttentionSignals.test.js`；20s 记账 / 60s 回归展示 | `src/input/AttentionSignals.js` | 2026-07-18 |
| CharacterConfig 路径拼接 | 纯后端 | 仅单元测试覆盖 | `CharacterConfig.test.js`；无换装 UI | `src/character/CharacterConfig.js` | 2026-07-18 |
| SpriteSequencePlayer | 纯后端+渲染 | 仅单元测试覆盖 | `SpriteSequencePlayer.test.js`；预加载/打断/帧停留/子序列 | `src/character/SpriteSequencePlayer.js` | 2026-07-18 |
| EmotionController 映射桥 | 纯后端+桥接 | 仅单元测试覆盖 | `EmotionController.test.js`；业务只调 `playEmotion` | `src/core/EmotionController.js` | 2026-07-18 |
| lookAtCursor / wakeUp / snoringZZZ 等占位键 | 纯后端 | 仅单元测试覆盖 | 无正式素材或未实现；调试 `wakeUp` 为 unimplemented 日志。勿当已验收动画。 | EmotionController 映射表 | 2026-07-18 |

---

## 明确未纳入本表（尚未实现，勿当已交付）

- Focus Confidence V1（可信度分值 / idle 检测完整链路）
- 鼻子 Boop / 拉尾巴 / 抚摸分阶段递进
- 无互动约 10 分钟自主 `welcomeBack` 挥手
- IncenseComplete / MilestoneGlow 的业务触发（非调试）
- SessionComplete 非模态观察式文案
- 角色/装扮可选 UI
- RewardToast / Screenshot（空桩）
- 正式瞳孔 PNG

---

## 给 Cursor 的 Prompt（分两部分：先回溯盘点，再建立日常维护习惯）

### Part 1：首次回溯盘点（现在就执行一次）

```
请对 focus-tiger 项目当前已实现的所有功能做一次完整回溯盘点，逐项填入
TEST_TRACKER.md 的表格，不要遗漏，也不要用示例/占位数据代替——每一行
必须对应一个真实存在的功能。

盘点范围包括但不限于：Arrival Practice（欢迎/Notice/呼吸/Choose 各环节）、
Companion Mode 三选一、Honesty Check-in、Reflection Moment、Celebrating、
Recover / Re-focus Acknowledge、Ambient Soundscape、EyeTracking、
PointerInteraction 各交互、以及所有已入库但可能只有调试入口的 emotion key。

每一行请如实判断：
- 「类型」：这项改动用户能不能在界面上看到/感受到差异，还是纯粹是数据
  存储、状态判断等无 UI 表现的逻辑。
- 「状态」：如果只有单元测试覆盖过、用户从未亲自验证过视觉效果，一律
  标"待人工测试"，不要因为单元测试通过就标"已通过"——这两者不是
  一回事。
- 「测试步骤」：写到用户不需要问你就能照着操作的程度（点哪个按钮、
  大概等多久、应该看到什么）。
- 「本地访问路径」：dev server 的具体入口，如果需要特定前置条件才能
  触发（比如离开页面 60 秒、连续多天累计），请写清楚前置条件。

完成后回复一句总的盘点结论（一共多少项、其中多少项待人工测试、多少项
  仅后端），不需要长篇解释。
```

### Part 2：日常维护（此后每次任务都遵循）

```
从现在起，每次完成一项包含用户可见变化（UI、动画、文案、交互）的任务后：
1. 在 TEST_TRACKER.md 新增一行，状态填"待人工测试"，写清楚具体测试
   步骤和本地访问路径，「最后更新日期」填当天日期。
2. 纯后端/逻辑改动登记为"仅单元测试覆盖"，不需要用户测试，但仍要登记。
3. 完成任务的消息里，明确说明"本次有 N 项需要你测试，已更新
   TEST_TRACKER.md"，不要只说"已完成"就结束。
4. 不要把"单元测试通过"等同于"功能没问题"并汇报为完全完成——涉及
   视觉/体验效果的项目，在用户确认之前，状态就是"待人工测试"，不能
   写"已完成"或"已验收"。
5. 如果用户测试后反馈问题，把对应行状态改成"有问题"，并在同一行或
   下方补充问题描述，处理完成后再改回"待人工测试"等待用户复测，不要
   自行改成"已通过"。
```
