# TEST_TRACKER.md — 功能验收追踪表

维护规则：Cursor 每完成一项具有用户可感知效果的改动，必须在下方表格新增一行，
状态默认设为「待人工测试」，并在消息里明确说「这项需要你测试」。纯后端/逻辑改动
（无 UI 变化）登记为「仅单元测试覆盖」，不需要用户测试，但仍要登记，防止遗漏。

**权威路径**：`focus-tiger/docs/TEST_TRACKER.md`（勿在仓库根目录另建副本）。

**本地开发**：`cd focus-tiger && npm run dev` → 通常 `http://127.0.0.1:5173/`。  
演示会话时长当前为 **`DEMO_SESSION_MINUTES = 1`**（`src/main.js`）。  
右上角 `#emotion-debug-ui` 情绪调试面板常驻；DEV 下可用 `window.__*` 全局句柄。

### 用户测试反馈记入规则（2026-07-19 起）

凡用户书面反馈某功能相关界面/操作的测试意见（含「有问题」「建议改」「计划放弃」等），须记入功能清单表格的 **「用户反馈」列**（专用列），**禁止**混入「测试步骤」列。

对应功能行同时：

1. 状态改为「有问题」（或保留「待人工测试」若仅为建议/方向确认、尚未判定为缺陷）  
2. **用户反馈**列写清：**日期**（当天）+ **原话要点**（可压缩，勿改语义）  
3. 若已开修：在「用户反馈」同格注明「处理中 / 待复测」；修复后状态改回「待人工测试」，**禁止**自行标「已通过」  
4. 无书面反馈的行，「用户反馈」列填 `—`

### 防「修了又丢」回归锁（2026-07-19 · 方法级）

权威执行细则：`.cursor/rules/focus-tiger-regression-lock.mdc`（alwaysApply）+ `PROCESS.md`「回归锁工作法」。本表只记验收要点：

1. **交互门闩须可单测**：禁止只靠 `main.js` 静默 `return`；须抽纯函数并写**失败用例**（门闩未就绪 → false）。  
2. **UI 与门闩同开同关**：未就绪则禁用/隐藏，禁止「点了没反应」。  
3. **同主题行禁止互斥步骤**：Arrival / Companion / HUD 等对「是否再点 Sit」的描述必须一致。  
4. **测试步骤须含回流路径**：至少写清「主路径」+「Rise / 二次进入后再测」之一。  
5. **修复收尾自动本地 commit**：不必再问「要不要 commit」；**push 仍须用户明确要求**。

---

## 状态定义

- **仅单元测试覆盖**：无用户可见变化，逻辑对错已由自动化测试验证，用户不需要点开看。
- **待人工测试**：已实现，单元测试（如有）已通过，但视觉/体验效果需要用户亲自看一遍才能确认。
- **已通过**：用户亲自测试确认没问题。
- **有问题**：用户测试后发现瑕疵，需写清楚问题内容，退回处理。

---

## 功能清单

> 首次回溯盘点：2026-07-18。凡用户从未书面确认「已通过」的 UI 项一律标「待人工测试」。
> **列约定**：`测试步骤` = 怎么测；`用户反馈` = 用户书面测试意见（日期 + 原话要点）。二者禁止混写。

| 功能 | 类型（UI可见 / 纯后端） | 状态 | 测试步骤 | 用户反馈 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|
| Arrival Practice / 抵达练习（Welcome → Notice → Breath → Choose） | UI可见 | 待人工测试 | 1) 打开应用。2) 点 **Sit with Yin**。3) 欢迎气泡约 2s + 微笑序列。4) Notice：点选一个图标（或 Skip）→ 出现回复文案并前进。5) Breath：约 5s 吸呼引导。6) Choose：点图标，或「自写」+ Enter，或 Skip。7) 面板关闭后 Companion Mode 展开。8) **Here & Now / Flow State：点选即开计时**；**Offline Space：再点 Sit**。Arrival 进行中主按钮文案为 **Skip — begin**。Notice 不落库；Choose 写入意图。**重点复测**：Choose 合十边缘是否干净（无灰白斑）。 | 2026-07-19（图4）：Choose「合十」抠图有灰白斑 → **2026-07-19 12:56 已用新算法重出并替换**，请复测。 | `http://127.0.0.1:5173/` · 当日首次 Sit（`arrivalGateReady` 前）· DEV：`__arrivalPractice` · 素材 `palms-together/` | 2026-07-19 |
| 14 套新抠图算法整批替换 | UI可见 | 待人工测试 | 用调试面板或对应触发点抽查：`palms-together`、`celebrate-dance-v2`、`session-complete`、`nod-bow`、`stretch-reminder`、`milestone-glow`、gaze-p1～p4、`yawn-stretch`、`breath-halo-expand`、lotus-*。确认角色边缘无灰白斑/脏底，四角透明。帧数与接线不变。 | 2026-07-19：用户用新算法重跑全部 14 套并统一重打包；旧版已全部替换。 | `#emotion-debug-ui` · 路径见 `ASSET_INVENTORY.md` 增量表 | 2026-07-19 |
| Companion Mode / 陪伴模式三选一（Here & Now · Offline Space · Flow State） | UI可见 | 待人工测试 | **主路径**：Sit 或点 **How shall we sit?** → Arrival → 结束后 hint 展开三选一。**Here & Now / Flow State：点选后立即 Focus+计时**；**Offline Space：再点 Sit**。**回流**：Rise 后再点 hint → 应启动 Arrival（有反馈），不得静默。Honesty 提示开着时 hint 仍可点并启动 Arrival。样式：hint 为暖米金立体次要钮，与 Sit 朱红和谐。 | 2026-07-19：选模式计时不动→曾修门闩；同日再反馈「点 How shall we sit? 无响应 + 式样扁平」→根因：①门闩把 hint 禁死；②Honesty 叠层也禁 hint；③半透明冲掉立体感（**非**未 commit 丢改）。已改 needArrival + 拆 Honesty 门闩 + 立体样式。请复测。 | 底部 Sit 旁 dock · DEV：`__companionModePicker` | 2026-07-19 |
| Honesty Check-in / Mindful Check-in · DORMANT 唤醒 | UI可见 | 待人工测试 | 零完成刷新 → 睡着 + 提示 → 选时长 → **立刻** `dormant-wake` 坐起（**3 fps**，倒计时同期）→ **定格末帧**至倒计时结束 → 记账离 DORMANT（**暂无**闭眼呼吸淡入 / 金光 / halo）。DEV「Honesty唤醒」直接打开时长三选一。 | 2026-07-19：淡入闭眼坐禅呼吸衔接不成→去掉该转场；坐起再慢 2×（6→3 fps）。请复测。 | 零完成自动 · DEV：`#emotion-debug-ui` / `__honestyCheckIn.openDurationChoices()` | 2026-07-19 |
| Tiger Reflection Moment / 结束反思 | UI可见 | 待人工测试 | 正常完成或主动 Rise 结束会话 → 留白约 400ms（完成）/ 300ms（主动）后淡入面板。可选回显本次意图。Q1–Q3：Continue / Skip / Skip all / Esc。非空答案写入 `focus-tiger.reflections.v1`（最近 5 条）；全跳过不落库。 | — | 会话结束后自动 · 单测：`TigerReflectionMoment.test.js` · DEV：`__reflectionMoment` | 2026-07-18 |
| 完成反馈 · 每日首次 Celebrating | UI可见 | 待人工测试 | 确保当日尚无完成记录 → Arrival + 选模式 → Sit → 等 **1 分钟**达标 → 播 `celebrate-dance`（约 57 帧）→ 回 idle-breathing → 进入 Reflection。 | — | 生产路径经 `triggerSessionCompletionFeedback` · 亦可调试面板「庆祝跳舞」 | 2026-07-18 |
| 完成反馈 · 同日后续 SessionComplete | UI可见 | 待人工测试 | 当日已有至少一次完成后，再跑一轮 1 分钟会话 → 只播 `session-complete` 摆尾（28 帧），**不**播 Celebrating → 回 idle → Reflection。 | — | 同上 · 调试面板「完成摆尾」可单看动作 | 2026-07-18 |
| IncenseComplete / 今日一炷香（莲花+金斑） | UI可见 | 待人工测试 | 右上角调试面板点「模拟一炷香」→ DOM 叠层莲花渐显 + 金色粒子（在 2D Yin 前方）。**业务会话结束尚未自动接线**（仅调试入口）。 | 2026-07-19：立体荷花 + 金光斑点浮动效果**建议保留**，并用于后续「荷花持续增加、最终布满画面」的成长场景（Backlog 成长场景须复用本效果，勿删）。产品方向已记入 EMOTION_BIBLE。请确认调试效果手感。 | `#emotion-debug-ui` · `playEmotion('incenseComplete')` · 实现：`IncenseGreeting.js` DOM 叠层 | 2026-07-19 |
| MilestoneGlow / 里程碑金辉 | UI可见 | 有问题 | 调试面板点「里程碑金辉」→ `milestone-glow` 27 帧（金光+蝴蝶）→ 末帧停约 2.5s → 回落。播放期归零实时金光。真实里程碑判定属 Backlog。 | 2026-07-19：金光蝴蝶须放慢 2×→已改 **4 fps**（原 8），请复测。 | `#emotion-debug-ui` · `playEmotion('milestoneGlow')` | 2026-07-19 |
| MindfulAcknowledge / 20 分钟阶段确认 | UI可见 | 待人工测试 | Companion = Here & Now，开一场会话并保持页面 ≥ **20 分钟墙钟** → `nod-bow` + 非模态 toast（`MINDFUL_FOCUS_MILESTONE` 池）。与强反馈冲突时静默让位。共享日额度最多 3 次（`focus-tiger.reminder-quota.v1`）。演示会话仅 1 分钟时建议用调试按钮或 `__mindfulReminderController`。 | — | 生产长计时 / 调试面板正念确认 · DEV：`__mindfulReminderController` · `__reminderQuotaManager` | 2026-07-18 |
| Re-focus Acknowledge / 回归确认 | UI可见 | 待人工测试 | Here & Now 会话中：切走标签页 **>60s** 再回来 → 同 `mindfulAcknowledge`（`subtype: 'refocus'`）+ `REFOCUS_ACKNOWLEDGE` 文案 + LightProgression Recover 扰动（约 20% 亮度下降、约 5s 平复）。离开 20–60s：只记账不展示。Offline Space / Flow State：不触发。每会话最多 1 次。 | — | 生产路径 · DEV：`__attentionSignals` · 单测：`AttentionSignals` / `MindfulReminderController` | 2026-07-18 |
| stretchReminder / 舒展提醒 | UI可见 | 待人工测试 | 会话活跃累计满 **2 小时**（离开暂停；两场间隔 ≥30 分钟重置）→ `stretch-reminder` 17 帧 + toast。占共享日额度。演示短会话建议调试面板触发。 | — | 调试面板 / 生产长计时 · DEV：`__mindfulReminderController` | 2026-07-18 |
| Ambient Soundscape / 禅意背景音 | UI可见 | 有问题 | 进应用右下角即有 **Sound**；未开计时点按→英文提示须先进入专注模式，不展开面板。FOCUSING 后可正常选曲。演示会话 **`DEMO_SESSION_MINUTES=1`**，约 1 分钟达标会停计时并进 Reflection——非音乐故障。 | 2026-07-19：找不到；要始终有按钮→已改常驻 Sound。请复测入口可见性与未计时时的提示。 | 右下角 · `__ambientSoundscapeUI` | 2026-07-19 |
| EyeTracking / 正式瞳孔 PNG | UI可见 | 有问题 | 运行时已卸下 `pupil-left/right` 叠加跟随；调试勾选已移除。Idle 张望 gaze-p1～p4 **不受影响**。 | 2026-07-19 实测截图：瞳孔叠图错位（楔形/月牙状色块，含闭目帧幽灵瞳孔）；**已决定放弃，不再返工**。结论见 `CORE_LOOP.md`「已废弃：EyeTracking 实时瞳孔跟随鼠标」。 | 已废弃 · 历史素材可留 `/textures/eye-pupils/` 但不接线 | 2026-07-19 |
| PointerInteraction · 靠近点头 nodGreeting | UI可见 | 待人工测试 | 指针移入靠近区 → `nod-greeting`（**6 fps**，末帧约多停 2 拍）点头 → 回 idle。不应像打瞌睡点头。 | 2026-07-19：须放慢频率 + 末帧多重复 2 次→已改，请复测。 | 全屏命中层 · DEV：`__pointerInteraction` | 2026-07-19 |
| PointerInteraction · 静止好奇 curiousTilt | UI可见 | 待人工测试 | 靠近区静止 **4s** → 播 **blink-smile** 单次（已替换托腮 tilt-think）→ 180ms 淡回 idle。冷却 6s。 | 2026-07-19：打坐↔托腮仍很跳→已换眨眼类；请确认衔接是否顺。 | 全屏命中层 · DEV：`__pointerInteraction` | 2026-07-19 |
| PointerInteraction · 抚摸 / 轻点 / 绕圈（检测已接线、无正式精灵） | UI可见 | 待人工测试 | 头部拖动 ≥14px → `petHead`（控制台占位）。头部点击位移 ≤10px → `smileSquint`（占位）。约 1.4s 内绕圈 ~1.75π → `dizzyBlink`（占位）。确认检测触发即可；目前无完整 2D 动画。 | — | 同上 · 单测：`PointerInteraction.test.js` | 2026-07-18 |
| FocusSession + Focus HUD（Sit with Yin / Rise） | UI可见 | 有问题 | Arrival 后选 Here & Now / Flow State → HUD 走动；主按钮应变 **Rise**。演示 **1 分钟**达标→庆祝/摆尾→Reflection。 | 2026-07-19：自动开计时时曾漏切 Rise 文案→已补 `beginFocusing`，请复测。 | `#focus-hud` · 演示 1 分钟 | 2026-07-19 |
| LightProgression / 光影物理渐进 | UI可见 | 待人工测试 | Arrival：冷→暖背景、Notice 升温、Breath 视差 Dolly（背景 1.06 / Yin 1.12）+ 呼吸光环、Choose 坐垫光晕。FOCUSING：DOM Rim 跟踪 focusLevel（+ ambient boost）与约 4s 呼吸脉冲。Re-focus：Recover 扰动后约 5s 平复。 | — | 随 Arrival / Re-focus 自动 · DEV：`__lightProgression` · 单测：`LightProgression.test.js` | 2026-07-18 |
| IdleOrchestrator / 自主闲置变体 | UI可见 | 有问题 | 默认约 **80s** 才第一次眨眼（2.5fps×5 完整 pingpong）。调试点「坐禅闭眼」强制 `restart`。加速：`__idleOrchestrator.setTiming({breathCyclesBeforeBlink:1})` 后看 `getStatus()`。 | 2026-07-19：测时未看到节奏→已修：勿被状态机/好奇歪头反复重启。请复测。 | DEV：`__idleOrchestrator.getStatus()` · 单测 | 2026-07-19 |
| Idle 张望 A（gaze-p1+p2） | UI可见 | 有问题 | **正式 Idle 已删除调度**；素材留库，调试可手工播。 | 2026-07-19：从正式 Idle 节奏中移除（产品决定）。 | 默认不出现 | 2026-07-19 |
| Idle 张望 B（gaze-p3+p4） | UI可见 | 有问题 | **正式 Idle 已删除调度**。 | 2026-07-19：从正式 Idle 节奏中移除（产品决定）。 | 默认不出现 | 2026-07-19 |
| Idle 犯困 yawn-stretch | UI可见 | 有问题 | **正式 Idle 已删除**；不再自动出现。 | 2026-07-19：从正式 Idle 节奏中移除（产品决定）。 | 默认不出现 | 2026-07-19 |
| Sleeping / DORMANT 睡态循环 | UI可见 | 有问题 | 当日零完成或调试「睡着了」→ `sleeping` 8 帧循环（**1 fps**）。 | 2026-07-19：播放太快须至少放慢 3×→已改 **1 fps**（原 4），请复测是否够慢、安宁。 | 零完成自动 / `#emotion-debug-ui` | 2026-07-19 |
| AcrossToolsIdleGuard / Flow State 闲置 toast | UI可见 | 待人工测试 | Companion 选 Flow State → Sit → **30 分钟**无鼠标/键盘 → 一次 `ACROSS_TOOLS_IDLE` toast。仅切标签页不算 idle。 | — | 生产长等待 · DEV：`__acrossToolsIdleGuard` · 单测：`AcrossToolsIdleGuard.test.js` | 2026-07-18 |
| i18n（默认 en / 可切 zh） | UI可见 | 待人工测试 | 默认英文。控制台 `__i18n.setLocale('zh')` → 按钮、HUD、Arrival、Honesty、Companion、Reflection、Ambient、toast 刷新为中文；再 `setLocale('en')` 切回。**无应用内语言切换 UI。** | — | DEV：`window.__i18n` · `src/locales/{en,zh}.json` | 2026-07-18 |
| Emotion debug UI（右上角调试面板） | UI可见 | 待人工测试 | 逐个点一次性姿态：播完应**定格末帧**，不硬切默认闭目呼吸；点「坐禅闭眼」才回 idle 循环。循环态（睡着/微笑/光环）照常循环。面板底部**不应**再出现「动态效果层」（绕 Y 轴旋转 / 呼吸起伏 / 悬浮）三项勾选。 | 2026-07-19：勿刻板切回默认闭目；不连贯则停末帧→已按此改调试 `holdPose`。同日：动态效果层属 3D 奖励柜旧功能，须从 2D 界面删除→已移除，请确认面板无该区块。 | `#emotion-debug-ui` | 2026-07-19 |
| idle / 坐禅闭眼呼吸基底 | UI可见 | 有问题 | 点「坐禅闭眼」后须明显变慢；完整呼吸×5（约1–1.5分钟）后应眨眼；可用 `breathCyclesBeforeBlink:1` 加速确认。鼠标靠近触发点头后应回到该节奏。idle 下不再触发 curiousTilt。 | 2026-07-19 复测要求：确认变慢与呼吸×5→眨眼节奏可见。 | 调试「坐禅闭眼」 · `__idleOrchestrator.getStatus()` | 2026-07-19 |
| smiling / blink-smile（欢迎与调试） | UI可见 | 待人工测试 | Arrival Welcome 自动播；或调试「坐禅微笑」。pingpong。Celebrating 后持久 Smiling 基底**未接线**（回 Idle）。 | — | Arrival / 调试面板 | 2026-07-18 |
| welcomeBack / wave-hello 挥手 | UI可见 | 待人工测试 | 调试面板播「挥手欢迎」→ 抬手 → 顶点摇摆 008–012 **播两遍** → 放手（共约 24 拍播放列表）；**无**最高点单帧 hold。**10 分钟自主挥手未接线。** | 2026-07-19：最高处完全重复那一帧须删；最高处左右摇摆须多重复一遍再放手。已改，请复测。 | `#emotion-debug-ui` · `playEmotion('welcomeBack')` | 2026-07-19 |
| dormantWake / Honesty 睡醒序列 | UI可见 | 待人工测试 | 调试「Honesty唤醒」或走完 Honesty → **`dormant-wake` 16 帧**（**3 fps**）→ 定格末帧；**不**淡入闭眼呼吸、**不**自动接光环金光。与「唤醒(伸懒腰)」**视觉不同**。 | 2026-07-19：去掉闭眼呼吸转场；再慢 2×。请复测。 | Honesty / `#emotion-debug-ui` | 2026-07-19 |
| lookAtCursor / wakeUp / snoringZZZ 等 | 纯后端+调试 | 有问题 | `wakeUp` 播伸懒腰（`stretch-reminder` 同源，调试标「唤醒(伸懒腰)」）；Honesty 独占 `dormant-wake`。`lookAtCursor` 仍空操作；snoringZZZ 仍占位。 | 2026-07-19：唤醒与 Honesty 动画重复→已改 `wakeUp` 接伸懒腰。请对比两按钮确认不同。库内尚无第二套「侧卧睡醒」素材。 | EmotionController 调试面板 | 2026-07-19 |
| haloBreathing / 光环呼吸奖励 | UI可见 | 待人工测试 | 调试面板播「光环呼吸奖励」：intro + loop。**fps 已放慢 2×**（intro 5 / loop 4，原 10/8）。Honesty 路径暂不自动接。 | 2026-07-19：播放太快须至少放慢 2×→已改，请复测。 | `#emotion-debug-ui` | 2026-07-19 |
| blink / 眨眼变体 | UI可见 | 待人工测试 | 调试可手工播；**Idle 每 5 次呼吸后自动插一次**（偶尔看看）。 | — | 调试 / Idle 固定节奏 | 2026-07-19 |
| tPose / 显示 3D 垫底（调试） | UI可见 | 待人工测试 | 调试面板 T-Pose → 短暂露出 3D canvas。确认 2D 主线默认隐藏 3D。 | — | `#emotion-debug-ui` | 2026-07-18 |
| ArrivalPractice 状态机 | 纯后端 | 仅单元测试覆盖 | `npm test` → `ArrivalPractice.test.js` | — | `src/core/ArrivalPractice.js` | 2026-07-18 |
| DailyCompletionStore | 纯后端 | 仅单元测试覆盖 | `DailyCompletionStore.test.js`；与 Honesty / 完成分流共用 | — | `src/core/DailyCompletionStore.js` | 2026-07-18 |
| SessionIntentionStore | 纯后端 | 仅单元测试覆盖 | `SessionIntentionStore.test.js`；Choose 写入 `intentions.v1` | — | `src/core/SessionIntentionStore.js` | 2026-07-18 |
| ReminderQuotaManager | 纯后端 | 仅单元测试覆盖 | `ReminderQuotaManager.test.js`；三类提醒共享自然日额度 | — | `src/core/ReminderQuotaManager.js` | 2026-07-18 |
| session-completion-feedback 分流逻辑 | 纯后端 | 仅单元测试覆盖 | `session-completion-feedback.test.js`；首日 Celebrating vs 同日 SessionComplete | — | `src/core/session-completion-feedback.js` | 2026-07-18 |
| AttentionSignals | 纯后端 | 仅单元测试覆盖 | `AttentionSignals.test.js`；20s 记账 / 60s 回归展示 | — | `src/input/AttentionSignals.js` | 2026-07-18 |
| CharacterConfig 路径拼接 | 纯后端 | 仅单元测试覆盖 | `CharacterConfig.test.js`；无换装 UI | — | `src/character/CharacterConfig.js` | 2026-07-18 |
| SpriteSequencePlayer | 纯后端+渲染 | 仅单元测试覆盖 | `SpriteSequencePlayer.test.js`；预加载/打断/帧停留/子序列 | — | `src/character/SpriteSequencePlayer.js` | 2026-07-18 |
| EmotionController 映射桥 | 纯后端+桥接 | 仅单元测试覆盖 | `EmotionController.test.js`；业务只调 `playEmotion` | — | `src/core/EmotionController.js` | 2026-07-18 |
| 3D Idle GLB 换装（无红边单色灰棉麻） | UI可见 | 待人工测试 | 1) `npm run dev` 打开应用。2) 调试面板点 **T-Pose**（或临时让 PoseManager 显示 canvas）以露出 3D 垫底。3) 确认阿寅闭目坐禅袍为**单色暖浅灰棉麻 / 茶服风**，**无深红镶边/红里子**；棉麻织纹应清晰（勿呈糊成一团的过度压缩感）。4) 刷新后默认 2D 主线仍隐藏 3D；路径仍为 `/models/tiger-meditate-closed.glb`（约 **1.6MB**，非 292KB）。 | — | `http://127.0.0.1:5173/` · `#emotion-debug-ui` T-Pose · 源：`yin-meditate-closed-monochrome-grey-cotton-linen-robe.source.glb` | 2026-07-19 |

---

## 明确未纳入本表（尚未实现，勿当已交付）

- Focus Confidence V1（可信度分值 / idle 检测完整链路）
- 鼻子 Boop / 拉尾巴 / 抚摸分阶段递进
- 无互动约 10 分钟自主 `welcomeBack` 挥手
- IncenseComplete / MilestoneGlow 的业务触发（非调试）
- SessionComplete 非模态观察式文案
- 角色/装扮可选 UI
- RewardToast / Screenshot（空桩）

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
  大概等多久、应该看到什么）。**只写怎么测，不写用户意见。**
- 「用户反馈」：仅安置用户书面测试意见（日期 + 原话要点）；无则填 `—`。
  **禁止**与「测试步骤」混写。
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
5. 如果用户测试后反馈问题，把对应行状态改成"有问题"，并只在「用户反馈」
   列写入日期 + 原话要点（可附处理中/待复测）；**禁止**写进「测试步骤」。
   处理完成后再改回"待人工测试"等待用户复测，不要自行改成"已通过"。
6. 从 2026-07-19 起：凡用户书面反馈某功能相关界面/操作的测试意见，
   即使本回合未立刻开修，也必须记入对应行的「用户反馈」列；见文首
   「用户测试反馈记入规则」。
```
