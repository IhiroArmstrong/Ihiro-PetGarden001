# SCENARIO_TESTS_GWT.md — Given-When-Then 场景剧本

生成日期：2026-09-23  
源文档：`focus-tiger/docs/SCENARIO_TESTS.md`  
备份：`focus-tiger/docs/archive/SCENARIO_TESTS.backup-2026-09-23-pre-gwt.md`  

---

## 场景 A：Kelly 的第一个早晨（全新用户，当日零完成 → Idle）

> **单元 / 控制器集成**：A1 `HonestyCheckInController` 开局 Idle；A3–A4 `ArrivalPractice` 状态机步进 + `canBeginFocusOnCompanionModeSelect` 门闩；A7–A8 `triggerSessionCompletionFeedback` 分流；计时达标 `FocusSession.hasReachedTarget` → `scenario-smoke.test.js`。
**DOM 用户链路**：Arrival 后 Here & Now 开表 / 预选+Skip — begin 开表 / Offline 开表 → `e2e/scenario-a.companion.spec.js`（**到开表为止*…

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| A-1 | P0 | 已在 `scenario-smoke.test.js` 覆盖；已在 `e2e/scenar | 打开 App（建议 `?product=1`）。当日零完成时，阿寅应是 Idle 闭目坐禅，不是 s |
| A-2 | P0 | 已在 `scenario-smoke.test.js` 覆盖；已在 `e2e/scenar | Idle 时见 Honesty Check-in 小钮（Sit 上方；点它可补登别处完成的练习）。K |
| A-3 | P0 | 已在 `scenario-smoke.test.js` 覆盖；已在 `e2e/scenar | 打开产品后不应自动有音乐；右上音符钮（窄屏 Idle = ActionBar ♪）打开 Sounds |
| A-4 | P0 | 已在 `scenario-smoke.test.js` 覆盖；已在 `e2e/scenar | Arrival Practice 展开： |
| A-5 | P0 | 已在 `scenario-smoke.test.js` 覆盖；已在 `e2e/scenar | Companion Mode 三选一展开。产品文案为 Here & Now / Offline Sp |
| A-6 | P0 | 已在 `scenario-smoke.test.js` 覆盖；已在 `e2e/scenar | 计时开始后，可用「曲目」切换背景音；主按钮仍可一键开关。Rise / 达标结束 → 音乐自动停；再  |
| A-7 | P0 | 已在 `scenario-smoke.test.js` 覆盖；已在 `e2e/scenar | 全程观察 Idle：仅闭目 pingpong → 眨眼弧固定节奏。 |
| A-8 | P0 | 已在 `scenario-smoke.test.js` 覆盖；已在 `e2e/scenar | 达到目标时长 → 当日首次计时达标：Celebrating → 回落坐姿。 |
| A-9 | P0 | 已在 `scenario-smoke.test.js` 覆盖；已在 `e2e/scenar | 同日第二次计时达标：应播 SessionComplete（摆尾），不应再播完整 Celebratin |
| A-10 | P0 | 已在 `scenario-smoke.test.js` 覆盖；已在 `e2e/scenar | 已知缺口：IncenseGreeting（莲花+金粒子）业务会话结束尚未自动接线。 |
| A-11 | P0 | 已在 `scenario-smoke.test.js` 覆盖；已在 `e2e/scenar | 进入 Reflection Moment：开头回显本次 Choose，三问可独立跳过。 |
| A-12 | P0 | 已在 `scenario-smoke.test.js` 覆盖；已在 `e2e/scenar | 回到 Idle；今日 Honesty 提示不应再因零完成自动出现。 |

### Given-When-Then 明细

#### A-1

- **优先级**：P0
- **覆盖**：已在 `scenario-smoke.test.js` 覆盖；已在 `e2e/scenario-a.companion.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- localStorage 当日练习完成记录为空（`DailyCompletionStore.hasCompletedToday()` 为 false）
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- 导航至 http://localhost:5173/?product=1

**Then**
- 当日零完成时，阿寅应是 Idle 闭目坐禅，不是 sleeping

#### A-2

- **优先级**：P0
- **覆盖**：已在 `scenario-smoke.test.js` 覆盖；已在 `e2e/scenario-a.companion.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- （无额外用户操作）

**Then**
- Idle 时见 Honesty Check-in 小钮（Sit 上方；点它可补登别处完成的练习）。Kelly 也可直接点 Sit with Yin 开始本场计时

#### A-3

- **优先级**：P0
- **覆盖**：已在 `scenario-smoke.test.js` 覆盖；已在 `e2e/scenario-a.companion.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- 导航至 http://localhost:5173/?product=1

**Then**
- 右上音符钮（窄屏 Idle = ActionBar ♪）打开 Soundscape 面板选曲（与菜单 / 抽屉 Sound 同效；默认曲目 Mer-Ka-Ba；若浏览器拦播放，在面板内再点选解锁）。关音乐选 Off；不必先 Sit

#### A-4

- **优先级**：P0
- **覆盖**：已在 `scenario-smoke.test.js` 覆盖；已在 `e2e/scenario-a.companion.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- b. Notice：六个状态图标；点 "Okay"
- d. Choose：六个活动图标；点 "Deep Work"

**Then**
- Arrival Practice 展开：
- a. 欢迎 beat（~2 秒气泡，`ARRIVAL_WELCOME`）
- 观察式回应（实际文案以 locale 为准，例如 en：「An ordinary steadiness is here.」）
- c. 呼吸 beat（~5 秒，无倒计时）
- intention 确认

#### A-5

- **优先级**：P0
- **覆盖**：已在 `scenario-smoke.test.js` 覆盖；已在 `e2e/scenario-a.companion.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 点 How shall we sit? 后 0–1 秒内见三卡标题 + 卡下 hint（locale `COMPANION_MODE_*_HINT`：结缘/静舍一句话，不是功能说明书）
- Sit
- 门闩已就绪后点选任一模式
- 门闩未就绪：点 Here & Now / Flow
- 预选 Here & Now / Flow 再走完 Arrival / ⚡

**Then**
- Companion Mode 三选一展开。产品文案为 Here & Now / Offline Space / Flow State
- Choose 走完：鞠躬后展开 Companion；点任一模式 → 立刻 Focusing（不必再点 Sit）。宽屏三卡下方 不得再露 Breath/Quick 左球（`ft-wide-stage-companion`）。
- 375 窄屏：鞠躬后三选一须 在视口内（`ft-narrow-stage-companion`）；禁止只剩 home 三球、panel 屏外假绿。e2e：`375 Choose bow: Companion staged in viewport then Here & Now focuses`（`toBeInViewport`）
- 立刻 Focusing。
- 启动 Arrival（Notice「What is present…」属设计，e2e I2）。点 Offline Space → 跳过 Arrival 即开表（e2e K）。
- 可直接开表（不必再点选）。

#### A-6

- **优先级**：P0
- **覆盖**：已在 `scenario-smoke.test.js` 覆盖；已在 `e2e/scenario-a.companion.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 计时开始后，可用「曲目」切换背景音；主按钮仍可一键开关。Rise / 达标结束

**Then**
- 音乐自动停；再 Sit 也不自动再开，须再点音符 / Sound。

#### A-7

- **优先级**：P0
- **覆盖**：已在 `scenario-smoke.test.js` 覆盖；已在 `e2e/scenario-a.companion.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- 全程观察 Idle：仅闭目 pingpong

**Then**
- 眨眼弧固定节奏。
- 张望 gaze / yawn / tea / ear-wiggle 不在正式 Idle 编排中
- 靠近区不应自动播点头

#### A-8

- **优先级**：P0
- **覆盖**：已在 `scenario-smoke.test.js` 覆盖；已在 `e2e/scenario-a.companion.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 达到目标时长

**Then**
- 当日首次计时达标：Celebrating → 回落坐姿。
- 勿提前点 Rise；Honesty 补登不占庆祝戳
- 深夜亦同：Reflect 开着时阿寅须保持醒着同坐（庆祝 / 轻完成 / 回落坐姿），不得 `cloakSleep` / Sleeping。夜深休息只在 Idle 无叠层（Expand A）或 ≥2h 回前台 DORMANT

#### A-9

- **优先级**：P0
- **覆盖**：已在 `scenario-smoke.test.js` 覆盖；已在 `e2e/scenario-a.companion.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 同日第二次计时达标：应播 SessionComplete（摆尾），不应再播完整 Celebrating

#### A-10

- **优先级**：P0
- **覆盖**：已在 `scenario-smoke.test.js` 覆盖；已在 `e2e/scenario-a.companion.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 已知缺口：IncenseGreeting（莲花+金粒子）业务会话结束尚未自动接线

#### A-11

- **优先级**：P0
- **覆盖**：已在 `scenario-smoke.test.js` 覆盖；已在 `e2e/scenario-a.companion.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 进入 Reflection Moment：开头回显本次 Choose，三问可独立跳过

#### A-12

- **优先级**：P0
- **覆盖**：已在 `scenario-smoke.test.js` 覆盖；已在 `e2e/scenario-a.companion.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- localStorage 当日练习完成记录为空（`DailyCompletionStore.hasCompletedToday()` 为 false）
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- （无额外用户操作）

**Then**
- 回到 Idle；今日 Honesty 提示不应再因零完成自动出现

---
## 场景 A-ACCEPT：验收脚本 · 30 秒 / 3 分钟（2026-08-20 · 端到端清单）

> **不是新功能**：把专家稿当 QA 清单，顺带验 **场景 AD** 占用仲裁是否撑住 Kelly 第一眼与 3 分钟闭环。语感三句先按现稿；若改字只动 locale `COMPANION_MODE_*_HINT`，不必重开门闩。

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| A-ACCEPT-P1 | P0 | 人工 QA | **30 秒（第一眼）**：实验室「重置全部本地状态」→ `?product=1 |
| A-ACCEPT-P2 | P0 | 人工 QA | **3 分钟闭环**：同一壳加 `?sessionMinutes=1`（**不要 |
| A-ACCEPT-P3 | P0 | 人工 QA | **更快对照（非关单主路径）**：左球 Breath **1 分** 完成 →  |

### Given-When-Then 明细

#### A-ACCEPT-P1

- **优先级**：P0
- **覆盖**：人工 QA

**Given**
- DEV 实验室执行「重置全部本地状态」
- 硬刷新 `http://localhost:5173/?product=1`

**When**
- **30 秒（第一眼）**：实验室「重置全部本地状态」→ `?product=1` 硬刷新 → 无隐私弹窗、无自动音乐、无 auto tip（**SB-15**）；阿寅 **Idle 闭目坐禅**（非披毯）；轻点额头 → **0–1s** `earWiggleHeadTouch`（场景 X2）；点 **How shall we sit?** → **0–1s** 三卡 + hint（不得出现 distraction / 分心 / Keep this screen / Minimize）。

**Then**
- 子句内所有可见/不得断言成立

#### A-ACCEPT-P2

- **优先级**：P0
- **覆盖**：人工 QA

**Given**
- DEV 实验室执行「重置全部本地状态」
- 硬刷新 `http://localhost:5173/?product=1`

**When**
- **3 分钟闭环**：同一壳加 `?sessionMinutes=1`（**不要**用默认 10 分档硬等）→ Sit 或 ⚡ → Here & Now 等到 1 分钟达标 → **自然进 Reflection**，阿寅保持醒着同坐（**不得**深夜披毯打断，见 **场景 AD**）；Skip/Continue 后左下热力图当日格点亮；⋯ **Journey log** 见新行。**回流**：关 Reflection 后再点额头仍摸头；再开一场 1 分钟仍进 Reflection 不披毯。

**Then**
- 子句内所有可见/不得断言成立

#### A-ACCEPT-P3

- **优先级**：P0
- **覆盖**：人工 QA

**Given**
- DEV 实验室执行「重置全部本地状态」
- 硬刷新 `http://localhost:5173/?product=1`

**When**
- **更快对照（非关单主路径）**：左球 Breath **1 分** 完成 → Reflection → Journey（`arrive: false`）。

**Then**
- 子句内所有可见/不得断言成立

---
## 场景 B：分心后自己走神又回来（Recover / Re-focus Acknowledge）

> **单元 / 控制器集成**：`shouldSuppressAwayReminders` 模式门闩 + `MindfulReminderController.handleAttentionReturn` 在 Here & Now 触发 emotion / Offline·Flow 抑制 → smoke B。
**未覆盖**：真实切标签页、toast DOM、nod-bow 序列。
**人工验收（用户路径，勿用控制台）**：真实切标签页 + toast + nod-bow。
**对照**：用户**主动** Recover（Focusing 轻触阿寅）见 **场景 X**（Tiger Anchor）；勿与本被动 Re-focus 混验额度。

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| B-1 | P0 | 完整链路仍须人工 | 打开：`http://localhost:5173/?sessionMinutes=5`（可选再加  |
| B-2 | P0 | 完整链路仍须人工 | Arrival → Companion 选 Here & Now（或 Skip — begin 开表 |
| B-3 | P0 | 完整链路仍须人工 | 确认 HUD 在计时、按钮为 Rise。 |
| B-4 | P0 | 完整链路仍须人工 | 切到 其它 Safari 标签，停留约 70–90 秒（必须 &gt;60s；不要只留 10s）。 |
| B-5 | P0 | 完整链路仍须人工 | 切回 Focus Tiger：应见 非模态观察式文案 + `nod-bow` 点头鞠躬（不是摆尾）。 |
| B-6 | P0 | 完整链路仍须人工 | 对照（勿期望与 Here & Now 相同）：再开一场选 Flow State（或 Offline  |
| B-7 | P0 | 完整链路仍须人工 | 额度：Re-focus 占共享日提醒池（每日最多 3 次三类合计）；每场会话最多 1 次。 |
| B-8 | P0 | 完整链路仍须人工 | 对照（Electron 桌面 · 场景 AB）：把窗口收到托盘停留 >60s 再打开 → 不应出现本 |

### Given-When-Then 明细

#### B-1

- **优先级**：P0
- **覆盖**：完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1&sessionMinutes=5
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- 导航至 http://localhost:5173/?product=1&sessionMinutes=5
- 

**Then**
- 本场目标 5 分钟，离开 70s 后仍应在 FOCUSING。

#### B-2

- **优先级**：P0
- **覆盖**：完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- Arrival

**Then**
- Companion 选 Here & Now（或 Skip — begin 开表）。

#### B-3

- **优先级**：P0
- **覆盖**：完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- （无额外用户操作）

**Then**
- 确认 HUD 在计时、按钮为 Rise

#### B-4

- **优先级**：P0
- **覆盖**：完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- 切到 其它 Safari 标签，停留约 70–90 秒（必须 &gt;60s；不要只留 10s）

**Then**
- （Then 断言见原文；信息不足见待澄清清单）

#### B-5

- **优先级**：P0
- **覆盖**：完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- 切回 Focus Tiger：应见 非模态观察式文案 + `nod-bow` 点头鞠躬（不是摆尾）

**Then**
- （Then 断言见原文；信息不足见待澄清清单）

#### B-6

- **优先级**：P0
- **覆盖**：完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- 对照（勿期望与 Here & Now 相同）：再开一场选 Flow State（或 Offline Space）

**Then**
- 同样离开 &gt;60s 再回来 → 不应出现观察式文案 / nod-bow（`suppressAwayReminders`；离开是预期；SB-03）。若「没反应」= 测对了；若仍出现 nod-bow = bug。

#### B-7

- **优先级**：P0
- **覆盖**：完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- （无额外用户操作）

**Then**
- 额度：Re-focus 占共享日提醒池（每日最多 3 次三类合计）；每场会话最多 1 次

#### B-8

- **优先级**：P0
- **覆盖**：完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- 对照（Electron 桌面 · 场景 AB）：把窗口收到托盘停留 >60s 再打开

**Then**
- 不应出现本场景的 toast / nod-bow（SB-18）。那是壳生命周期，不是切走标签。浏览器里测本场景时忽略本步。

---
## 场景 C：中途主动放弃（未达标）

> **单元 / 控制器集成**：未达标不记账（`HonestyCheckInController.onIncompleteSessionEnded`）+ `MANUAL_END_PAUSE_MS` 后 `SessionEndFlow.onSessionEnded` 向 mock `ReflectionMoment.open` 传入 `intention` / `intentionSource` → smoke C（**仅**下游接线入参；**不**从 Choose 写入意图闩）。
**DOM 用户链路**：Choose → Rise → Reflection 顶部 `[data-testid=reflection-intention-echo]` 有/无回显；Skip — begin → Ri…

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| C-1 | P1 | 已在 `reflection-intention-echo.spec.js` 覆盖；已在  | 开始新会话，进行到一半，点 Rise。 |
| C-2 | P1 | 已在 `reflection-intention-echo.spec.js` 覆盖；已在  | 不应播放 Celebrating，不应播放 IncenseGreeting。 |
| C-3 | P1 | 已在 `reflection-intention-echo.spec.js` 覆盖；已在  | 角色播 `rise-stretch-casual` pingpong（闭目坐禅→伸懒腰→随意坐→倒放 |
| C-4 | P1 | 已在 `reflection-intention-echo.spec.js` 覆盖；已在  | 若本次 Choose 有内容，回显仍应出现（与是否达标无关）。 |
| C-5 | P1 | 已在 `reflection-intention-echo.spec.js` 覆盖；已在  | 三问正常可跳过；关闭 Reflection 后应回 Idle（或当日零完成时回 Sleeping）， |

### Given-When-Then 明细

#### C-1

- **优先级**：P1
- **覆盖**：已在 `reflection-intention-echo.spec.js` 覆盖；已在 `SessionIntentionStore.test.js` 覆盖；完整链路仍须人工；E2E 未完整覆盖，此处 smoke/跳过

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 开始新会话，进行到一半，点 Rise

#### C-2

- **优先级**：P1
- **覆盖**：已在 `reflection-intention-echo.spec.js` 覆盖；已在 `SessionIntentionStore.test.js` 覆盖；完整链路仍须人工；E2E 未完整覆盖，此处 smoke/跳过

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 不应播放 Celebrating，不应播放 IncenseGreeting

#### C-3

- **优先级**：P1
- **覆盖**：已在 `reflection-intention-echo.spec.js` 覆盖；已在 `SessionIntentionStore.test.js` 覆盖；完整链路仍须人工；E2E 未完整覆盖，此处 smoke/跳过

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 角色播 `rise-stretch-casual` pingpong（闭目坐禅

**Then**
- 伸懒腰→随意坐→倒放回闭目）；约 `MANUAL_END_PAUSE_MS = 300` 后淡入 Reflection（动画可与面板并行）。
- 深夜亦同：走 Rise 加权池 hold，不得披斗篷睡着再问 Reflection

#### C-4

- **优先级**：P1
- **覆盖**：已在 `reflection-intention-echo.spec.js` 覆盖；已在 `SessionIntentionStore.test.js` 覆盖；完整链路仍须人工；E2E 未完整覆盖，此处 smoke/跳过

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 若本次 Choose 有内容，回显仍应出现（与是否达标无关）

#### C-5

- **优先级**：P1
- **覆盖**：已在 `reflection-intention-echo.spec.js` 覆盖；已在 `SessionIntentionStore.test.js` 覆盖；完整链路仍须人工；E2E 未完整覆盖，此处 smoke/跳过

**Given**
- 页面 URL：http://localhost:5173/?product=1
- localStorage 当日练习完成记录为空（`DailyCompletionStore.hasCompletedToday()` 为 false）
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- （无额外用户操作）

**Then**
- 三问正常可跳过；关闭 Reflection 后应回 Idle（或当日零完成时回 Sleeping），衔接勿硬切。末题非空 Continue 后 0–1 秒内输入框下见共鸣且卡留下（输入只读）；再点 Continue / Skip / Esc 才关——禁止约 0.9s 自动关

---
## 场景 D：请假一天后的 Honesty Check-in（含桥接 CTA）

> **单元 / 控制器集成**：
- **D sleep→wake**：距上次专注 ≥2h → `sync` 进 DORMANT（`cloakSleep`→`sleeping`）→ Honesty 选 20 → `dormantWake` → 离 DORMANT → 桥接 Yes 回调 → smoke `D sleep→wake` + `dormantIdle` chain（harness 调控制器；**非**披毯/睡姿 DOM）。
- **D 桥接回流**：手工 DORMANT 起点 → 选 20 → wake → `HonestyBridgeCtaController` Yes→`onAccept` / No→`onDecline` / 同日再 `onHonestyCheckInCompl…

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| D-1 | P0 | 完整链路仍须人工；E2E 未完整覆盖，此处 smoke/跳过 | 模拟「距上次专注结束 ≥ 2 小时」：写过一次专注结束时间戳后把时钟拨到 ≥2h，且离开标签 ≥2h |
| D-2 | P0 | 完整链路仍须人工；E2E 未完整覆盖，此处 smoke/跳过 | 惰性进 DORMANT：应先见 cloakSleep 披毯再落入 sleeping；点进 Hones |
| D-3 | P0 | 完整链路仍须人工；E2E 未完整覆盖，此处 smoke/跳过 | 选时长 10 / 20 / 30+（选 20）→ 0–1 秒内：该钮下压（`translateY(1 |
| D-4 | P0 | 完整链路仍须人工；E2E 未完整覆盖，此处 smoke/跳过 | 实际顺序：选时长后 立刻播 `dormantWake`（cloak-sleep 倒放，非 stret |
| D-5 | P0 | 完整链路仍须人工；E2E 未完整覆盖，此处 smoke/跳过 | 补登结束（记账、离 DORMANT）后：立刻出现 Honesty 桥接 CTA（「要不要现在也坐一会 |
| D-6 | P0 | 完整链路仍须人工；E2E 未完整覆盖，此处 smoke/跳过 | DORMANT 清除后仍可再点 Sit 做正式会话，与补登不冲突。Sit → 0–1 秒内：主钮按压 |

### Given-When-Then 明细

#### D-1

- **优先级**：P0
- **覆盖**：完整链路仍须人工；E2E 未完整覆盖，此处 smoke/跳过

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）
- （睡态）`focus-tiger.focus-session-end.v1.lastEndedAt` 为 ≥2h 前 epoch ms，且浏览器 tab 曾 hidden ≥2h

**When**
- （无额外用户操作）

**Then**
- 模拟「距上次专注结束 ≥ 2 小时」：写过一次专注结束时间戳后把时钟拨到 ≥2h，且离开标签 ≥2h 再回（短切约 1 分钟再回 不应进睡——见 场景 AD / Welcome 契约），或 DEV 改 `focus-tiger.focus-session-end.v1` 后 Rise 结束一场 再 sync。新用户无结束记录不会自动睡。冷启动刷新仍是 Idle + Welcome，不是披毯（白天不得凭陈旧 2h 戳开场即睡，见 场景 AD）

#### D-2

- **优先级**：P0
- **覆盖**：完整链路仍须人工；E2E 未完整覆盖，此处 smoke/跳过

**Given**
- 页面 URL：http://localhost:5173/?product=1
- （睡态）`focus-tiger.focus-session-end.v1.lastEndedAt` 为 ≥2h 前 epoch ms，且浏览器 tab 曾 hidden ≥2h

**When**
- 惰性进 DORMANT：应先见 cloakSleep 披毯再落入 sleeping；点进 Honesty（或 Mindful Check-in）

**Then**
- 0–1 秒内：入口按压 + `#honesty-check-in` 时长三选一面板淡入（10 / 20 / 30+）。

#### D-3

- **优先级**：P0
- **覆盖**：完整链路仍须人工；E2E 未完整覆盖，此处 smoke/跳过

**Given**
- 页面 URL：http://localhost:5173/?product=1
- （睡态）`focus-tiger.focus-session-end.v1.lastEndedAt` 为 ≥2h 前 epoch ms，且浏览器 tab 曾 hidden ≥2h

**When**
- 选时长 10 / 20 / 30+（选 20）

**Then**
- 0–1 秒内：该钮下压（`translateY(1px)`）+ 时长面板让位给呼吸引导（倒计时出现）。不要报成哑点击。

#### D-4

- **优先级**：P0
- **覆盖**：完整链路仍须人工；E2E 未完整覆盖，此处 smoke/跳过

**Given**
- 页面 URL：http://localhost:5173/?product=1
- （睡态）`focus-tiger.focus-session-end.v1.lastEndedAt` 为 ≥2h 前 epoch ms，且浏览器 tab 曾 hidden ≥2h

**When**
- （无额外用户操作）

**Then**
- 实际顺序：选时长后 立刻播 `dormantWake`（cloak-sleep 倒放，非 stretch），与约 10 秒呼吸倒计时并行（`HONESTY_BREATH_MS = 10_000`）

#### D-5

- **优先级**：P0
- **覆盖**：完整链路仍须人工；E2E 未完整覆盖，此处 smoke/跳过

**Given**
- 页面 URL：http://localhost:5173/?product=1
- （睡态）`focus-tiger.focus-session-end.v1.lastEndedAt` 为 ≥2h 前 epoch ms，且浏览器 tab 曾 hidden ≥2h

**When**
- Yes
- No
- 点外侧空白 不当 No（须明确点 Yes 或 No）

**Then**
- 补登结束（记账、离 DORMANT）后：立刻出现 Honesty 桥接 CTA（「要不要现在也坐一会儿？」Yes / No 同级；Welcome 回显可与邀请同屏一小会儿）
- 0–1 秒内：钮被点到 + `#honesty-bridge-cta` 开始收起（~260ms）+ Arrival Practice 叠层开始出现。结果：完整 Arrival → Companion（不跳过、不直接开表 / Ambient）。
- 0–1 秒内：钮被点到 + 桥接面板收起；回到 Idle，无二次挽留。
- 每次补登完成后都可出现（不限当日一次）。定稿见 `HONESTY_BRIDGE_CTA.md`

#### D-6

- **优先级**：P0
- **覆盖**：完整链路仍须人工；E2E 未完整覆盖，此处 smoke/跳过

**Given**
- 页面 URL：http://localhost:5173/?product=1
- （睡态）`focus-tiger.focus-session-end.v1.lastEndedAt` 为 ≥2h 前 epoch ms，且浏览器 tab 曾 hidden ≥2h

**When**
- DORMANT 清除后仍可再点 Sit 做正式会话，与补登不冲突。Sit

**Then**
- 0–1 秒内：主钮按压 + Companion / Arrival 按既有场景 A 展开（本步不另造反馈类型）。
- 已知：Honesty 路径暂不接 halo / 金光
- 已知：Honesty 补登不刷新 `focus-session-end`；若距上次真实专注仍 ≥2h，仅当 tab hidden ≥2h 回前台 sync 可再次进睡（短切 tab 不得披毯）

---
## 场景 E：Offline Space（I'll step away）

> **单元 / 控制器集成**：舒展活跃累计在 `attentionAway` 时暂停；墙钟 `getSessionElapsedSeconds` 仍可触发 mindful；`suppressAwayReminders` → 无 Re-focus → **smoke E** + `MindfulReminderController.test`（已入 `test:smoke`）。
**DOM**：Offline 选中即开表 → e2e K（`scenario-a.companion.spec.js`）。
**未覆盖 / 仍须人工**：真实离开墙钟、welcomeBack 未接线。

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| E-1 | P1 | 已在 `scenario-a.companion.spec.js` 覆盖；完整链路仍须人工 | Companion 选 Offline Space → 选中即开计时，不出现 Arrival Not |
| E-2 | P1 | 已在 `scenario-a.companion.spec.js` 覆盖；完整链路仍须人工 | 离开电脑一段时间。 |
| E-3 | P1 | 已在 `scenario-a.companion.spec.js` 覆盖；完整链路仍须人工 | 已知缺口：约 10 分钟无互动自动 `welcomeBack` / wave-hello 未接线（仅 |
| E-4 | P1 | 已在 `scenario-a.companion.spec.js` 覆盖；完整链路仍须人工 | 回来后继续/结束： |

### Given-When-Then 明细

#### E-1

- **优先级**：P1
- **覆盖**：已在 `scenario-a.companion.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- Companion 选 Offline Space

**Then**
- 选中即开计时，不出现 Arrival Notice/Choose（与 Here & Now / Flow「未就绪先 Arrival」不同）。

#### E-2

- **优先级**：P1
- **覆盖**：已在 `scenario-a.companion.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 离开电脑一段时间

#### E-3

- **优先级**：P1
- **覆盖**：已在 `scenario-a.companion.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 已知缺口：约 10 分钟无互动自动 `welcomeBack` / wave-hello 未接线（仅调试「挥手欢迎」）。回来没看到挥手 = 已知状态
- 离开期间不应出现 Re-focus（`suppressAwayReminders`）

#### E-4

- **优先级**：P1
- **覆盖**：已在 `scenario-a.companion.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 回来后继续/结束：
- 专注墙钟计时不因离开暂停（`FocusSession` 墙钟）
- 舒展活跃累计在离开时暂停（`MindfulReminderController`）

---
## 场景 F：Flow State（I'm working across tools）

> **单元 / 控制器集成**：`AcrossToolsIdleGuard` 阈值后一次回调 + 键鼠活动重置计时；常量 `ACROSS_TOOLS_IDLE_THRESHOLD_MS = 1_800_000` → **smoke F** + `AcrossToolsIdleGuard.test`（已入 `test:smoke`）。Re-focus 抑制同 smoke B。
**未覆盖 / 仍须人工**：toast DOM 文案、真实 30 分钟墙钟。

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| F-1 | P1 | 完整链路仍须人工 | Companion 选 Flow State → 选中即开计时。 |
| F-2 | P1 | 完整链路仍须人工 | 频繁切标签（模拟多任务）；离开类 Re-focus 应全程抑制。 |
| F-3 | P1 | 完整链路仍须人工 | 宽松 idle 兜底：同一页内无键鼠/触控活动达到 |

### Given-When-Then 明细

#### F-1

- **优先级**：P1
- **覆盖**：完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- Companion 选 Flow State

**Then**
- 选中即开计时。

#### F-2

- **优先级**：P1
- **覆盖**：完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 频繁切标签（模拟多任务）；离开类 Re-focus 应全程抑制

#### F-3

- **优先级**：P1
- **覆盖**：完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 

**Then**
- 宽松 idle 兜底：同一页内无键鼠/触控活动达到
- `ACROSS_TOOLS_IDLE_THRESHOLD_MS = 1_800_000`（30 分钟）
- 一次 `ACROSS_TOOLS_IDLE` toast。仅切标签页不算重置该 idle 计时。
- （阈值仍属产品可调项；测时如实记录即可。）

---
## 场景 G：语言切换

> **拍板（2026-07-30 修订）**：工程保留可点切语 + 六语槽；**v1.0.0 对外 English + Japanese**（`en`+`ja` ready；Language 可见）。中文延后（zh draft）。
**自动化**：unit `i18n.test.js`；e2e `language-switch.spec.js`（en↔ja；draft 不出现）。
**人工（v1.0）**：375 日文排版抽测；**不**要求 zh 过发布 checklist。
**动画（2026-07-31 · Slice A）**：切到 **日本語** 应播合十（`intentionSet`）；切回 **English** 应播鞠躬（`mindfulAcknowledge`）；同日同语不重…

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| G-1 | P1 | 已在 `i18n.test.js` 覆盖；已在 `language-switch.spec | 打开 `?product=1` → ⋯ / 窄屏抽屉 → Language → 选 日本語。 |
| G-2 | P1 | 已在 `i18n.test.js` 覆盖；已在 `language-switch.spec | 确认 Sit / Honesty / Arrival / Companion 等为日文、无 `{in |
| G-3 | P1 | 已在 `i18n.test.js` 覆盖；已在 `language-switch.spec | 再切回 English（应播鞠躬）。刷新后语言保持（`focus-tiger.locale.v1`） |
| G-4 | P1 | 已在 `i18n.test.js` 覆盖；已在 `language-switch.spec | （DEV 仍可挂 `__languagePreference` / `__i18n` / `__sc |

### Given-When-Then 明细

#### G-1

- **优先级**：P1
- **覆盖**：已在 `i18n.test.js` 覆盖；已在 `language-switch.spec.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 打开 `?product=1`

**Then**
- ⋯ / 窄屏抽屉 → Language → 选 日本語。

#### G-2

- **优先级**：P1
- **覆盖**：已在 `i18n.test.js` 覆盖；已在 `language-switch.spec.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- （无额外用户操作）

**Then**
- 确认 Sit / Honesty / Arrival / Companion 等为日文、无 `{intention}` 未替换；阿寅播合十后回 Idle

#### G-3

- **优先级**：P1
- **覆盖**：已在 `i18n.test.js` 覆盖；已在 `language-switch.spec.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 再切回 English（应播鞠躬）。刷新后语言保持（`focus-tiger.locale.v1`）

#### G-4

- **优先级**：P1
- **覆盖**：已在 `i18n.test.js` 覆盖；已在 `language-switch.spec.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- （DEV 仍可挂 `__languagePreference` / `__i18n` / `__sceneAnimationSliceA`；正式验收以 UI 为准。）

---
## 场景 H：正式瞳孔跟随（已废弃）

> EyeTracking no-op

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| H-1 | P2 |  EyeTracking no-op | 已废弃；若仍见瞳孔跟鼠标则报 bug |

### Given-When-Then 明细

#### H-1

- **优先级**：P2
- **覆盖**： EyeTracking no-op

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 已废弃；若仍见瞳孔跟鼠标则报 bug

---
## 场景 O：Idle「本周陪伴」7 格热力图

> **用户故事**：Kelly 回到 Idle，quietly 看见最近 7 天「同坐」痕迹——亮格是来过的一天，暗格是安静日；**不是**断签惩罚、**不是**计分榜，也**不能**点开查详情。
**DOM 用户链路**：`e2e/weekly-practice-heatmap.spec.js`（Idle 7 格；Focusing 隐藏；seed 亮/暗；**375 ActionBar + 主屏三主钮 + 抽屉次要项**）。
**未覆盖**：Hint tip 文案/尖角、真实练习后格子变亮、上滑手势物理滑动（e2e 点 grabber）。
**仍须人工**：亮/暗「不羞辱」；**375 新壳观感**（ActionBar / 主屏 Sit·Quick·Honesty / Yin 居中放大 / …

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| O-1 | P1 | 已在 `e2e/weekly-practice-heatmap.spec.js` 覆盖；完 | 打开 `?product=1`，处于 Idle。 |
| O-2 | P1 | 已在 `e2e/weekly-practice-heatmap.spec.js` 覆盖；完 | 宽屏：左下见 `#weekly-practice-heatmap-cluster`（7 格 + 时钟 |
| O-3 | P1 | 已在 `e2e/weekly-practice-heatmap.spec.js` 覆盖；完 | 读图：亮格 = `totalMinutes === null` 或 `> 0`；暗格 = 真零。无点 |
| O-4 | P1 | 已在 `e2e/weekly-practice-heatmap.spec.js` 覆盖；完 | Hint（可选）：ActionBar 点 ? → tips（窄屏尖角目标可能变化）。 |
| O-5 | P1 | 已在 `e2e/weekly-practice-heatmap.spec.js` 覆盖；完 | 让格子变亮：完成计时 / Honesty / 一分钟呼吸 → 回 Idle → 抽屉内今日格亮。 |
| O-6 | P1 | 已在 `e2e/weekly-practice-heatmap.spec.js` 覆盖；完 | 回流：开 Focusing → 主钮/抽屉/grabber 收起，Rise 仍可见可点；Rise 回 |
| O-7 | P1 | 已在 `e2e/weekly-practice-heatmap.spec.js` 覆盖；完 | 已知边界：热力图仍不可下钻；与 HUD streak（宽屏卡内 7 点环）分工不同。 |

### Given-When-Then 明细

#### O-1

- **优先级**：P1
- **覆盖**：已在 `e2e/weekly-practice-heatmap.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- 导航至 http://localhost:5173/?product=1

**Then**
- （Then 断言见原文；信息不足见待澄清清单）

#### O-2

- **优先级**：P1
- **覆盖**：已在 `e2e/weekly-practice-heatmap.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 375×667：见顶栏 ActionBar（? · 时间/Calm · ♪）；主画布下方三 PNG 图腾圆球（顺序 Quick · Sit · Honesty，全宽均匀；`public/icons/icon-*.png`）；Arrival 开着时仅留 Quick Start 球；底中「上滑打开选项」；上滑或点 grabber

**Then**
- 宽屏：左下见 `#weekly-practice-heatmap-cluster`（7 格 + 时钟）
- 抽屉含 呼吸 / How shall we sit? / Sound / Reminder（不含 Sit / Quick Start / Honesty）；7 格在抽屉内只读展示。

#### O-3

- **优先级**：P1
- **覆盖**：已在 `e2e/weekly-practice-heatmap.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 读图：亮格 = `totalMinutes === null` 或 `> 0`；暗格 = 真零。无点击下钻

#### O-4

- **优先级**：P1
- **覆盖**：已在 `e2e/weekly-practice-heatmap.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- Hint（可选）：ActionBar 点 ?

**Then**
- tips（窄屏尖角目标可能变化）。

#### O-5

- **优先级**：P1
- **覆盖**：已在 `e2e/weekly-practice-heatmap.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- 让格子变亮：完成计时 / Honesty / 一分钟呼吸

**Then**
- 回 Idle → 抽屉内今日格亮。

#### O-6

- **优先级**：P1
- **覆盖**：已在 `e2e/weekly-practice-heatmap.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- 回流：开 Focusing

**Then**
- 主钮/抽屉/grabber 收起，Rise 仍可见可点；Rise 回 Idle → 三主钮 + grabber 再出现。

#### O-7

- **优先级**：P1
- **覆盖**：已在 `e2e/weekly-practice-heatmap.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 已知边界：热力图仍不可下钻；与 HUD streak（宽屏卡内 7 点环）分工不同

---
## 场景 P1：P1 · 设置提醒（Idle 左下时钟）

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| P1-1 | P1 | 无自动化标注 | Idle 下产品入口是宽屏 ⋯ / 窄屏抽屉行 `reminder.setting_title`（E |
| P1-2 | P1 | 无自动化标注 | 点击菜单行 → 0–1 秒内：行 `:active` 按压 + `#reminder-prefere |
| P1-3 | P1 | 无自动化标注 | 取消勾选 → 清除偏好（`null` = 关闭提醒；无单独 `enabled` 字段）。 |
| P1-4 | P1 | 无自动化标注 | 点击面板外或再点时钟 → 面板收起。 |

### Given-When-Then 明细

#### P1-1

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- （无额外用户操作）

**Then**
- Idle 下产品入口是宽屏 ⋯ / 窄屏抽屉行 `reminder.setting_title`（EN "When should I remind you"）。左下热力图簇内时钟 `#reminder-preference-toggle` 在产品壳被 park 屏外，仅作代理锚。首次可见可出 onboarding Hint `in-app-reminder`；点「?」补救 Idle 时亦应含本 tip

#### P1-2

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 点击菜单行
- 勾选 Remind me / 开启提醒
- Time 选择器设时（如 09:00）；旁有
- 若已开启且时分已过、今日未练
- 若今日已练

**Then**
- 0–1 秒内：行 `:active` 按压 + `#reminder-preference-panel` 在视口内居中偏下展开（不得被悬停 tip 吞掉点击、也不得只关菜单而无面板）：
- 标题：`reminder.setting_title`（EN "When should I remind you" / ZH「什么时候提醒你」）
- 写入 `{ hour, minute }` 到 `focus-tiger.reminder-preference.v1`
- `#reminder-preference-confirm` + 说明 `#reminder-preference-confirm-hint`（点 → 或回车保存）；→ / Enter 后短暂见 `#reminder-preference-saved`；原生 time 选完（`change`）仍写入；过去时分允许保存
- 常显说明 `#reminder-preference-daily-blurb`（`reminder.daily_blurb`）：明示这是每天的时分，到点且今日未练会出顶部轻提示
- `#reminder-preference-status` 出 `reminder.past_time_note`（软提示，不拦保存）；须为 callout（衬底+左边线，非斜体灰字），与 `daily_blurb` 可区分
- status 出 `reminder.practiced_today_note`（同样 callout 显眼）；时间框仍可改（留给以后的日子），不得灰掉锁定

#### P1-3

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 取消勾选

**Then**
- 清除偏好（`null` = 关闭提醒；无单独 `enabled` 字段）。

#### P1-4

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 点击面板外或再点时钟

**Then**
- 面板收起。

---
## 场景 P2：P2 · 到点横幅（主路径 + 回流）

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| P2-5 | P1 | 无自动化标注 | 设好提醒且已过设定时分、今日零完成 → 顶部居中 `#in-app-reminder-banner` |
| P2-6 | P1 | 无自动化标注 | 点 × 关闭 → 本页会话内不再出现（即使条件仍满足）。 |
| P2-7 | P1 | 无自动化标注 | 回流：再次 `sync` / 切后台再回前台 → 仍不重复；完整刷新或新开 App → 若条件仍满足 |
| P2-8 | P1 | 无自动化标注 | 负例：未到设定时分 → 不出现；今日已完成任一会话 → 不出现；未勾选开启 → 不出现。 |

### Given-When-Then 明细

#### P2-5

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1
- localStorage 当日练习完成记录为空（`DailyCompletionStore.hasCompletedToday()` 为 false）

**When**
- 设好提醒且已过设定时分、今日零完成

**Then**
- 顶部居中 `#in-app-reminder-banner` 出现，文案 `reminder.gentle_waiting`（EN "Yin is right here when you're ready." / ZH「你准备好了，阿寅就在这儿。」），右侧 × 可关。不得再用「waiting / 在等你」类紧逼措辞。2026-08-03：横幅本页首次可见时伴随 `parrotEarVisit`（鹦鹉信使）；同页不重播。2026-09-06：若同屏第一幕仍是吹花/欢迎池/清晨苏醒/付款致谢，横幅可先出，鹦鹉不得插入；须等该序列结束并约 1s CapCut 后再播（场景 V 组合）。

#### P2-6

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 点 × 关闭

**Then**
- 本页会话内不再出现（即使条件仍满足）。

#### P2-7

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 回流：再次 `sync` / 切后台再回前台

**Then**
- 仍不重复；完整刷新或新开 App → 若条件仍满足，可再次出现。

#### P2-8

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 负例：未到设定时分

**Then**
- 不出现；今日已完成任一会话 → 不出现；未勾选开启 → 不出现。

---
## 场景 P3：P3 · 忙碌期策略（suppress · 对照）

> busyPolicy: suppress · SB-04

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| P3-1 | P2 | 已在 `e2e/in-app-reminder.spec.js` 覆盖 | 到点横幅已出现 → Sit 开 Focusing → 横幅立刻隐藏；Rise 回 Idle 且仍满足 |

### Given-When-Then 明细

#### P3-1

- **优先级**：P2
- **覆盖**：已在 `e2e/in-app-reminder.spec.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- 到点横幅已出现

**Then**
- Sit 开 Focusing → 横幅立刻隐藏；Rise 回 Idle 且仍满足条件 → 可再次出现（若本页未 dismiss）

---
## 场景 Q1：Q1 · Support Modal（统一入口）

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| Q1-1 | P0 | 无自动化标注 | `?product=1` Idle → 右上（音符左侧）`#yin-support-fab` → 0 |
| Q1-2 | P0 | 无自动化标注 | 见三卡（头图暖纸底；三 CTA 同款米色立体，Join Membership 不得蒲团橙白字）： |
| Q1-3 | P0 | 无自动化标注 | Maybe later 为文字链关闭（非全宽描边钮）。0–1 秒内：链按压 + 模态收起，Idle  |
| Q1-4 | P0 | 无自动化标注 | 375：三卡上下堆叠、可关；FAB 与 ♪ 同系玻璃。 |
| Q1-5 | P0 | 无自动化标注 | 回流：Sit→Focusing → FAB 隐藏（不可点，不是哑点击）；Rise 回 Idle →  |

### Given-When-Then 明细

#### Q1-1

- **优先级**：P0
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- `?product=1` Idle

**Then**
- 右上（音符左侧）`#yin-support-fab` → 0–1 秒内：FAB 按压态（`:active`）+ `#yin-support-modal` 展开。

#### Q1-2

- **优先级**：P0
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 未完成过任何一次记账练习（清 `practice-days.v1` 与 `lotus-pond.v1`；勿用 `?qaSeedStreak=` / `?qaLotusBlooms=`）：顺序 Tea
- 已完成过至少一次（Focus 达标 / Honesty 成功 / Breath 完成，不论时长）：顺序恢复 Sanctuary
- Lifetime 已买：Sanctuary 卡保留、淡化（`.is-settled`），CTA Unlock

**Then**
- 见三卡（头图暖纸底；三 CTA 同款米色立体，Join Membership 不得蒲团橙白字）：
- Sanctuary → Membership（375 最上为请茶）；Suggested 在 Tea 卡（`[data-testid=yin-support-suggested-badge][data-host=tea]`）。Sanctuary / Membership 仍完整可点，价文案不变。
- Membership → Tea；Suggested 回 Sanctuary（`data-host=sanctuary`）。此态永久（久别再开仍如此）。未达标 Rise 不得切到 Sanctuary 优先。
- Unlocked 且 `disabled`（点了无 Checkout，不是哑点击）。Suggested 改挂 Tea。第五卡 AI Companion Add-on 出现（可点，直到加购也付完）。Web 模态底 `#yin-support-web-local-ai` 一句：Local AI 只在桌面应用。Electron 仍是 `#yin-support-desktop-ram`，不见网页那句。
- Sanctuary 文案含 One-time Lifetime + About $89.99；Membership About $6.99 · billed monthly；Tea 三条仪式感 bullets。Electron：模态底 `#yin-support-desktop-ram`。Web：第四卡 Pro 或第五卡加购在栅格时见 `#yin-support-web-local-ai`（Local AI 不在浏览器）。0–1 秒内点任一未结算卡 CTA：按压 + `disabled` + 模态收起（结果层见 Q2/Q3）
- 对照：场景化请茶气泡仍只在达标后出现，本步不改

#### Q1-3

- **优先级**：P0
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- （无额外用户操作）

**Then**
- Maybe later 为文字链关闭（非全宽描边钮）。0–1 秒内：链按压 + 模态收起，Idle 壳仍在。关后再开仍可用

#### Q1-4

- **优先级**：P0
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 375：三卡上下堆叠、可关；FAB 与 ♪ 同系玻璃

#### Q1-5

- **优先级**：P0
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- 回流：Sit

**Then**
- Focusing → FAB 隐藏（不可点，不是哑点击）；Rise 回 Idle → FAB 复现。

---
## 场景 Q2：Q2 · Buy Yin a Tea（tip · 不解锁）

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| Q2-6 | P0 | 无自动化标注 | Support 卡 CTA → 0–1 秒内：CTA 按压 + `disabled`（`_busy` |
| Q2-7 | P0 | 无自动化标注 | Test 卡走 Checkout（约 US$4.99）；回跳/`?tip=1` 后：卡内与阿寅旁 ` |
| Q2-8 | P0 | 无自动化标注 | 卡内 `#yin-tip-jar-tea-log` 见日期+杯次；再 tip 文案「又一杯」+ 播  |
| Q2-9 | P0 | 无自动化标注 | 禁止：tip 后出现 Sanctuary 已解锁语义或内容门打开。 |

### Given-When-Then 明细

#### Q2-6

- **优先级**：P0
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- Support 卡 CTA

**Then**
- 0–1 秒内：CTA 按压 + `disabled`（`_busy`）+ 模态关闭；结果（可能 >1s）：进 Stripe Checkout / `#yin-tip-jar-card`。禁止关闭后空白无下一步。
- Stripe 回跳（对照场景 AD）：付完回 App 须先见致谢 / 卡面结果，不得先看到深夜披毯睡着再谢谢

#### Q2-7

- **优先级**：P0
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- Test 卡走 Checkout（约 US$4.99）；回跳/`?tip=1` 后：卡内与阿寅旁 `#yin-tip-kindness-badges` 至少 3 枚（付费 `min=3`，上限 9）；点徽章可下 1024 PNG

#### Q2-8

- **优先级**：P0
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 卡内 `#yin-tip-jar-tea-log` 见日期+杯次；再 tip 文案「又一杯」+ 播 `teaDrinking`（首 tip：`nodGreeting`）

#### Q2-9

- **优先级**：P0
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 禁止：tip 后出现 Sanctuary 已解锁语义或内容门打开

---
## 场景 Q3：Q3 · Yin's Sanctuary（Lifetime · 零耦合）

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| Q3-10 | P0 | 无自动化标注 | Support Primary → 0–1 秒内同 Q2（按压 + disabled + 关模态）； |
| Q3-11 | P0 | 无自动化标注 | 回跳须服务端 confirm；邮箱 restore 可用。卡内 `#yin-sanctuary-ba |
| Q3-12 | P0 | 无自动化标注 | 禁止：读 tip 状态解锁。Ambient 深库：未购仅免费 5 首可播（见 TRACKER Amb |

### Given-When-Then 明细

#### Q3-10

- **优先级**：P0
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- Support Primary

**Then**
- 0–1 秒内同 Q2（按压 + disabled + 关模态）；随后 `#yin-sanctuary-card` 卡面约 $89.99 → Unlock → Lifetime Checkout。

#### Q3-11

- **优先级**：P0
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- （无额外用户操作）

**Then**
- 回跳须服务端 confirm；邮箱 restore 可用。卡内 `#yin-sanctuary-badges` ≥3 枚尊贵视觉（上限 17）；Idle 阿寅旁优先显示 Sanctuary 章。再开 Support：Sanctuary 卡淡化、CTA 不可点；若未加购则见第五卡

#### Q3-12

- **优先级**：P0
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 禁止：读 tip 状态解锁。Ambient 深库：未购仅免费 5 首可播（见 TRACKER Ambient entitlement 行）。加购付完后再开 Support：第五卡仍在、淡化、CTA Unlocked / disabled（不得整卡消失）

---
## 场景 Q4：Q4 · 统一练习徽章（免费路径 · #204）

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| Q4-13 | P0 | 无自动化标注 | 清 tip/Sanctuary entitlement → 无练习时阿寅旁 0 枚；做一次 Brea |
| Q4-14 | P0 | 无自动化标注 | 付 Tea 后升到 ≥3；练习天数/`practice-days` 抬高后刷新，枚数可按 `scor |
| Q4-15 | P0 | 无自动化标注 | Membership 订阅 confirm（或 `?entitlementMock=subscrip |
| Q4-16 | P0 | 无自动化标注 | 回流：Rise 后再见徽章条；关 Tip/Sanctuary/Membership 卡再开仍在。 |

### Given-When-Then 明细

#### Q4-13

- **优先级**：P0
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- 清 tip/Sanctuary entitlement

**Then**
- 无练习时阿寅旁 0 枚；做一次 Breath/Honesty/Focus 记账 → Idle 旁 ≥ 1 枚（免费 `min=1`）。

#### Q4-14

- **优先级**：P0
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 付 Tea 后升到 ≥3；练习天数/`practice-days` 抬高后刷新，枚数可按 `score = 天数 + floor(累计分/60)`、`min + floor(score/3)` 只增不减（无需再 tip）

#### Q4-15

- **优先级**：P0
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1&entitlementMock=subscription
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- （无额外用户操作）

**Then**
- Membership 订阅 confirm（或 `?entitlementMock=subscription`）后 Idle 右侧 `#yin-tip-kindness-badges` ≥ 3 枚尊贵章；Sanctuary 卡仍可显示未买 Lifetime（不把 SKU 标已买）

#### Q4-16

- **优先级**：P0
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 回流：Rise 后再见徽章条；关 Tip/Sanctuary/Membership 卡再开仍在

---
## 场景 S：首页左球 · Breath practice（可选时长正念）

> **用户故事**：Kelly 不想走完整 Arrival，只想先练几分钟呼吸——点首页左球 **Breath practice** → 选 1/3/5/10/20 → 吸↔呼 + **闭目坐禅呼吸（IdleOrchestrator）** + 光环 → 到点轻完成 → Reflection 浅出 → 关面板后 Journey log 有一行；Leave 不记账、不写 log。
**DOM**：`e2e/micro-ritual.spec.js`（主路径 / Leave / Arrival 开着点球等；常用 `?microRitualMs=`）。
**单元**：`MicroRitual.test.js` · `microRitualJourneyDraft` · `stopPlaybackEph…

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| S-1 | P1 | 已在 `e2e/micro-ritual.spec.js` 覆盖；已在 `MicroRit | Idle：宽屏 `#ft-wide-home-quickstart` / 窄屏 `#ft-narro |
| S-2 | P1 | 已在 `e2e/micro-ritual.spec.js` 覆盖；已在 `MicroRit | 点开 → 时长 chip 1 / 3 / 5 / 10 / 20（与 Focus 10/15/25/ |
| S-3 | P1 | 已在 `e2e/micro-ritual.spec.js` 覆盖；已在 `MicroRit | 进行中：吸↔呼 + 闭目坐禅呼吸（不得整段眨眼微笑）+ 光环；到点 toast + 轻完成 → Re |
| S-4 | P1 | 已在 `e2e/micro-ritual.spec.js` 覆盖；已在 `MicroRit | Leave：不记账、不进 Reflection、不写 Journey log、停播。 |
| S-5 | P1 | 已在 `e2e/micro-ritual.spec.js` 覆盖；已在 `MicroRit | 抽屉 / ⋯：不得再出现 Breath / 「一分钟呼吸」行。 |
| S-6 | P1 | 已在 `e2e/micro-ritual.spec.js` 覆盖；已在 `MicroRit | Arrival 开着：左球仍可见；点之取消 Arrival 再开 picker。 |
| S-7 | P1 | 已在 `e2e/micro-ritual.spec.js` 覆盖；已在 `MicroRit | Companion 三选一展开后：左球 不得再出现在三卡下面（Quick Start 已退役；Bre |
| S-8 | P1 | 已在 `e2e/micro-ritual.spec.js` 覆盖；已在 `MicroRit | 回流：Leave / 完成后左球再可点；再走一轮 Sit 正式 Focus。 |
| S-9 | P1 | 已在 `e2e/micro-ritual.spec.js` 覆盖；已在 `MicroRit | 可选：后台切走再回前台，墙钟已满须立刻完成（visibility）。 |

### Given-When-Then 明细

#### S-1

- **优先级**：P1
- **覆盖**：已在 `e2e/micro-ritual.spec.js` 覆盖；已在 `MicroRitual.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- Idle：宽屏 `#ft-wide-home-quickstart` / 窄屏 `#ft-narrow-home-quickstart` 文案/aria 为 Breath practice（非「立刻 Focusing」）

#### S-2

- **优先级**：P1
- **覆盖**：已在 `e2e/micro-ritual.spec.js` 覆盖；已在 `MicroRitual.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 点开

**Then**
- 时长 chip 1 / 3 / 5 / 10 / 20（与 Focus 10/15/25/45 分轨：Focus 走 Sit→Arrival，本球无 Arrival）→ 点选即开。M1 时长板开着时：Sit 须隐藏/禁用（宽 `#btn-focus`、窄 `#ft-narrow-home-sit`；不得与选时长叠层抢同一层）。0–1 秒内：picker + 静默 `#focus-coins-duration-hint`（寅币、满 5 分钟；`?focusCoins=0` 时无）；点 chip 后吸↔呼文案出现 + 开始磬（若计时提示音开）+ 氛围乐起。

#### S-3

- **优先级**：P1
- **覆盖**：已在 `e2e/micro-ritual.spec.js` 覆盖；已在 `MicroRitual.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 进行中：吸↔呼 + 闭目坐禅呼吸（不得整段眨眼微笑）+ 光环；到点 toast + 轻完成

**Then**
- Reflection 浅出；记账=所选分钟；Reflection 关闭后（含 Skip）Journey log 见一行（无 Arrival，降级 focus 文案）。

#### S-4

- **优先级**：P1
- **覆盖**：已在 `e2e/micro-ritual.spec.js` 覆盖；已在 `MicroRitual.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- Leave：不记账、不进 Reflection、不写 Journey log、停播

**Then**
- （Then 断言见原文；信息不足见待澄清清单）

#### S-5

- **优先级**：P1
- **覆盖**：已在 `e2e/micro-ritual.spec.js` 覆盖；已在 `MicroRitual.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 抽屉 / ⋯：不得再出现 Breath / 「一分钟呼吸」行

#### S-6

- **优先级**：P1
- **覆盖**：已在 `e2e/micro-ritual.spec.js` 覆盖；已在 `MicroRitual.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- Arrival 开着：左球仍可见；点之取消 Arrival 再开 picker

#### S-7

- **优先级**：P1
- **覆盖**：已在 `e2e/micro-ritual.spec.js` 覆盖；已在 `MicroRitual.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- （无额外用户操作）

**Then**
- Companion 三选一展开后：左球 不得再出现在三卡下面（Quick Start 已退役；Breath 是 Idle 入口，不是选完 How shall we sit? 的第二条捷径）。0–1 秒内三卡出现、Breath 球消失

#### S-8

- **优先级**：P1
- **覆盖**：已在 `e2e/micro-ritual.spec.js` 覆盖；已在 `MicroRitual.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 回流：Leave / 完成后左球再可点；再走一轮 Sit 正式 Focus

#### S-9

- **优先级**：P1
- **覆盖**：已在 `e2e/micro-ritual.spec.js` 覆盖；已在 `MicroRitual.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 可选：后台切走再回前台，墙钟已满须立刻完成（visibility）

---
## 场景 T：Focus 开表前时长 chip（10 / 15 / 25 / 45）

> **用户故事**：Kelly 走完 Arrival、选好 Companion 模式后，再选本场专注时长，再开表。
**单元**：`focusDuration.test.js`；偏好 `focus-tiger.focus-duration-pref.v1`。
**DOM**：产品无 query 路径须人工；e2e helper 默认带 `?sessionMinutes=N` **跳过** picker（勿用跳过路径当本场景通过）。
**仍须人工**：点 Leave 取消不开表；HUD 见本场目标分钟标注；回流再开仍记住偏好或可改；点时长 chip **0–1 秒内**开始磬 + 氛围乐（对齐 Breath；Idle 冷启动仍静音）。

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| T-1 | P1 | 已在 `focusDuration.test.js` 覆盖；完整链路仍须人工 | `?product=1`（勿带 `sessionMinutes`）→ Sit→Arrival→Cho |
| T-2 | P1 | 已在 `focusDuration.test.js` 覆盖；完整链路仍须人工 | 见 `#focus-duration-picker`：chip 10 / 15 / 25 / 45（ |
| T-3 | P1 | 已在 `focusDuration.test.js` 覆盖；完整链路仍须人工 | 点选 → 立刻 Focusing（0–1 秒内 Sit 变 Rise、状态 Focusing + 开 |
| T-4 | P1 | 已在 `focusDuration.test.js` 覆盖；完整链路仍须人工 | Leave（若 picker 仍开）→ 取消、不开表。 |
| T-5 | P1 | 已在 `focusDuration.test.js` 覆盖；完整链路仍须人工 | 回流：Rise → 再 Sit→…→ 再出 picker；偏好应合理回显。 |
| T-6 | P1 | 已在 `focusDuration.test.js` 覆盖；完整链路仍须人工 | 调试捷径（非故事）：`?sessionMinutes=1` 跳过 picker——仅 DEMO/e2 |

### Given-When-Then 明细

#### T-1

- **优先级**：P1
- **覆盖**：已在 `focusDuration.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- `?product=1`（勿带 `sessionMinutes`）

**Then**
- Sit→Arrival→Choose→Companion 点选模式。

#### T-2

- **优先级**：P1
- **覆盖**：已在 `focusDuration.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 见 `#focus-duration-picker`：chip 10 / 15 / 25 / 45（默认 10；数字 10 也可出现在 Breath，但路径不同）；须见最短档说明（`#focus-duration-floor-hint`，英文含 10 minutes / Breath practice）。chip 下方须见静默 `#focus-coins-duration-hint`（寅币、满 5 分钟；`?focusCoins=0` 时无）。0–1 秒内 picker 与两句 hint 一同出现（无新按钮）

#### T-3

- **优先级**：P1
- **覆盖**：已在 `focusDuration.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- 点选

**Then**
- 立刻 Focusing（0–1 秒内 Sit 变 Rise、状态 Focusing + 开始磬（若计时提示音开）+ 氛围乐）；`#focus-hud` 显示所选目标分钟。

#### T-4

- **优先级**：P1
- **覆盖**：已在 `focusDuration.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- Leave（若 picker 仍开）

**Then**
- 取消、不开表。

#### T-5

- **优先级**：P1
- **覆盖**：已在 `focusDuration.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 回流：Rise

**Then**
- 再 Sit→…→ 再出 picker；偏好应合理回显。

#### T-6

- **优先级**：P1
- **覆盖**：已在 `focusDuration.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1&sessionMinutes=1

**When**
- （无额外用户操作）

**Then**
- 调试捷径（非故事）：`?sessionMinutes=1` 跳过 picker——仅 DEMO/e2e

---
## 场景 U1：U1 · Zen Cinema

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| U1-1 | P1 | 无自动化标注 | Idle → ⋯ / 抽屉 Zen Cinema → 0–1 秒内：菜单行按压 + `#zen-ci |
| U1-2 | P1 | 无自动化标注 | Watch → 0–1 秒内：主钮按压 + 确认卡开始收起；结果（可延迟）：系统浏览器打开 `htt |
| U1-3 | P1 | 无自动化标注 | 禁止：Reflection 边缘入口、App 内嵌播放器。 |

### Given-When-Then 明细

#### U1-1

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- Idle

**Then**
- ⋯ / 抽屉 Zen Cinema → 0–1 秒内：菜单行按压 + `#zen-cinema-card` 展开（缩略图 + 片名 +「将打开 YouTube」）。

#### U1-2

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- Watch

**Then**
- 0–1 秒内：主钮按压 + 确认卡开始收起；结果（可延迟）：系统浏览器打开 `https://youtu.be/RV46qrvG1pw`。卡已关但标签页还没出 = 仍算「已接收」，不要报成哑点击。Not now → 0–1 秒内卡收起、回到 Idle 菜单入口可见。

#### U1-3

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 禁止：Reflection 边缘入口、App 内嵌播放器

---
## 场景 U2：U2 · Quiet Line / 今日静语

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| U2-4 | P1 | 无自动化标注 | ⋯ / 抽屉 A Quiet Line / 今日のひとこと → 0–1 秒内：行按压 + `#dai |
| U2-5 | P1 | 无自动化标注 | Save image → 0–1 秒内：钮按压（证明收到）；结果：下载 4:5 PNG（文件名含当日 |
| U2-6 | P1 | 无自动化标注 | Not now 关卡；回流再开仍可。 |
| U2-7 | P1 | 无自动化标注 | U2 子项 · 洞察种子池（Phase 1）：当日句从经典金句 ∪ 洞察种子 14 句（`INSIG |

### Given-When-Then 明细

#### U2-4

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- ⋯ / 抽屉 A Quiet Line / 今日のひとこと

**Then**
- 0–1 秒内：行按压 + `#daily-zen-quote-card` 展开当日金句。

#### U2-5

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- Save image

**Then**
- 0–1 秒内：钮按压（证明收到）；结果：下载 4:5 PNG（文件名含当日 `YYYY-MM-DD`，可能略延迟）——上图下字明信片（当日静帧在上、暖纸金句在下；落款日期 EN 为美国月日年如 `August 16, 2026`，不是 ISO `2026-08-16`；JA/ZH 用当地长日期；不是对话框截图，无 Not now / Save image）。同日再开句不变。

#### U2-6

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- Not now 关卡；回流再开仍可

#### U2-7

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- U2 子项 · 洞察种子池（Phase 1）：当日句从经典金句 ∪ 洞察种子 14 句（`INSIGHT_1`–`14`）混合抽取（`focus-tiger.daily-zen-quote-pool-v2.v1` 同日锁定；机制仍是一天一句、Save image 不变）。抽中种子池条目时，该句即为「顿悟向」；须人工看长句换行与 375 是否溢出主球。未抽中则与旧金句无差别。本次不做 Moment Whisper / ACTIVE_RECOVER / Reflection 三问插入

---
## 场景 U3：U3 · Wallpapers

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| U3-8 | P1 | 无自动化标注 | ⋯ / 抽屉 Wallpapers → 0–1 秒内：行按压 + `#digital-wallpap |
| U3-9 | P1 | 无自动化标注 | 禁止付费门 / 一键社交分享。 |

### Given-When-Then 明细

#### U3-8

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- ⋯ / 抽屉 Wallpapers

**Then**
- 0–1 秒内：行按压 + `#digital-wallpapers-card` 展开 5 张缩略图 → 点选（选中态）→ Save image（0–1 秒按压；结果=下载 `focus-tiger-wallpaper-*.png`）。

#### U3-9

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 禁止付费门 / 一键社交分享

---
## 场景 V：变花鼓励 · 冷启动欢迎（Day1 / 久别）

> **用户故事**：Kelly 首次打开（或 ≥3 日久别）→ 阿寅变花吹散 + 头顶白玉气泡（观察式、可点消）；同日再刷不得再吹花。深夜/清晨仍优先吹花（压过 wellness 斗篷）。
**DOM**：`e2e/flower-welcome.spec.js` 锁 Day1 / 同日不重播 / `?flowerWelcome=0` / 欢迎日旗。
**仍须人工**：约 10 fps 弧线；末约 **1s CapCut** 回 Idle **不闪白**；窄屏气泡完整在 ActionBar **下方**；文案轮换不连出同一句。
**负例**：`?flowerWelcome=0` → 永不吹花只走书/点头池；产品壳不得无故自动连播实验室按钮。

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| V-1 | P1 | 已在 `e2e/flower-welcome.spec.js` 覆盖；完整链路仍须人工 | `?product=1` → DEV Console：`window.__ftDebug.reset |
| V-2 | P1 | 已在 `e2e/flower-welcome.spec.js` 覆盖；完整链路仍须人工 | Day1：见吹花 + `#flower-blow-welcome-bubble`（可点气泡/空白立刻 |
| V-3 | P1 | 已在 `e2e/flower-welcome.spec.js` 覆盖；完整链路仍须人工 | 同日再刷 → 不得再吹花 / 再书或点头欢迎池抢播。 |
| V-4 | P1 | 已在 `e2e/flower-welcome.spec.js` 覆盖；完整链路仍须人工 | 模拟 ≥3 日久别（拨 `lastOpen`）→ 再吹花（跟 locale）。 |
| V-5 | P1 | 已在 `e2e/flower-welcome.spec.js` 覆盖；完整链路仍须人工 | 回流：吹花进行中仍可点 Sit。 |
| V-6 | P1 | 已在 `e2e/flower-welcome.spec.js` 覆盖；完整链路仍须人工 | Lab 对照（非产品故事）：无 `?product=1` 调试钮「变花吹散+气泡」。 |
| V-7 | P1 | 已在 `e2e/flower-welcome.spec.js` 覆盖；完整链路仍须人工 | 组合 · 提醒已过时分（E12）：清库后设每日提醒为过去时分、今日零完成 → 硬刷新。0–1 秒内见 |
| V-8 | P1 | 已在 `e2e/flower-welcome.spec.js` 覆盖；完整链路仍须人工 | 负例 · 配额拦截：先走完一次 Day1，再 `resetScenario('welcome-quo |

### Given-When-Then 明细

#### V-1

- **优先级**：P1
- **覆盖**：已在 `e2e/flower-welcome.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- localStorage 当日练习完成记录为空（`DailyCompletionStore.hasCompletedToday()` 为 false）

**When**
- `?product=1`

**Then**
- DEV Console：`window.__ftDebug.resetScenario('day1-flower-card')`（吹花+四选卡；只要吹花用 `'day1-flower-only'`）→ 硬刷新。禁止手打 `removeItem`。

#### V-2

- **优先级**：P1
- **覆盖**：已在 `e2e/flower-welcome.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- Day1：见吹花 + `#flower-blow-welcome-bubble`（可点气泡/空白立刻消）；含 ≥23:00 / 清晨——压过 wellness 斗篷/苏醒

#### V-3

- **优先级**：P1
- **覆盖**：已在 `e2e/flower-welcome.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 同日再刷

**Then**
- 不得再吹花 / 再书或点头欢迎池抢播。

#### V-4

- **优先级**：P1
- **覆盖**：已在 `e2e/flower-welcome.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 模拟 ≥3 日久别（拨 `lastOpen`）

**Then**
- 再吹花（跟 locale）。

#### V-5

- **优先级**：P1
- **覆盖**：已在 `e2e/flower-welcome.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 回流：吹花进行中仍可点 Sit

#### V-6

- **优先级**：P1
- **覆盖**：已在 `e2e/flower-welcome.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- Lab 对照（非产品故事）：无 `?product=1` 调试钮「变花吹散+气泡」

#### V-7

- **优先级**：P1
- **覆盖**：已在 `e2e/flower-welcome.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- localStorage 当日练习完成记录为空（`DailyCompletionStore.hasCompletedToday()` 为 false）

**When**
- 组合 · 提醒已过时分（E12）：清库后设每日提醒为过去时分、今日零完成

**Then**
- 硬刷新。0–1 秒内见吹花（或欢迎池），不得在吹花进行中突然切鹦鹉、也不得无 1s 叠化硬切。横幅可在吹花期间出现。吹花结束后约 1s 才见 `parrotEarVisit`。自动化：单元 `spriteChannelArbitration` first-paint KEEP + dispatcher latch；观感仍人工。

#### V-8

- **优先级**：P1
- **覆盖**：已在 `e2e/flower-welcome.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 负例 · 配额拦截：先走完一次 Day1，再 `resetScenario('welcome-quota-blocks-flower')` 刷新

**Then**
- 不得再吹花（日旗仍在）。Console 可出现 `⚠️ scenario inconsistency: flower reset but daily quota still consumed`——测本负例时可忽略。

---
## 场景 W：点「?」· 产品简介、Privacy 与 Wellness 免责

> **用户故事**：Kelly 点「?」可查阅简介（no pressure / no ads / local-first）与「不是诊疗」声明，再点 **Privacy** 读本地优先说明（含交叉引用），Back 回简介。冷启动**不得**自动弹出免责警告牌。
**DOM**：`e2e/onboarding-remedy-contract.spec.js` Privacy / Idle 不自动出卡 / `?wellnessFirst=1` QA 行；单元 `privacyNoticeCopy.test.js`、`wellnessDisclaimerGate.test.js`。
**仍须人工**：375 简介与 Sheet 可滚、可关；Rise 后再走一遍「?」；**禁止**简介/隐私承诺具名云保…

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| W-1 | P1 | 已在 `e2e/onboarding-remedy-contract.spec.js` 覆 | 冷启动（默认）：`?product=1`（可清 `focus-tiger.wellness-disc |
| W-2 | P1 | 已在 `e2e/onboarding-remedy-contract.spec.js` 覆 | 点「?」`#onboarding-hint-help` → 0–1 秒内见 `#onboarding |
| W-3 | P1 | 已在 `e2e/onboarding-remedy-contract.spec.js` 覆 | 点 Privacy → `#onboarding-privacy-sheet` 可读本地优先、不挖矿 |
| W-4 | P1 | 已在 `e2e/onboarding-remedy-contract.spec.js` 覆 | （可选）点 The five moments → 打开与场景 Y 同一 `#five-moments |
| W-5 | P1 | 已在 `e2e/onboarding-remedy-contract.spec.js` 覆 | Back → 回简介 → Got it 关闭。 |
| W-6 | P1 | 已在 `e2e/onboarding-remedy-contract.spec.js` 覆 | 回流：Rise 后再点 ? → Privacy → Back。 |
| W-7 | P1 | 已在 `e2e/onboarding-remedy-contract.spec.js` 覆 | 375：同路径；简介 / Sheet 不挡到无法关。 |
| W-8 | P1 | 已在 `e2e/onboarding-remedy-contract.spec.js` 覆 | QA 例外：`?wellnessFirst=1&flowerWelcome=0` 仍可强制 Got  |

### Given-When-Then 明细

#### W-1

- **优先级**：P1
- **覆盖**：已在 `e2e/onboarding-remedy-contract.spec.js` 覆盖；已在 `privacyNoticeCopy.test.js` 覆盖；已在 `wellnessDisclaimerGate.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- 冷启动（默认）：`?product=1`（可清 `focus-tiger.wellness-disclaimer-seen.v1`）

**Then**
- Idle 不得见 `#onboarding-wellness-first`。0–1 秒内：首屏是阿寅坐禅，不是「Not therapy」警告牌。

#### W-2

- **优先级**：P1
- **覆盖**：已在 `e2e/onboarding-remedy-contract.spec.js` 覆盖；已在 `privacyNoticeCopy.test.js` 覆盖；已在 `wellnessDisclaimerGate.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 点「?」`#onboarding-hint-help`

**Then**
- 0–1 秒内见 `#onboarding-app-purpose`（no pressure / no ads / stays on this device）+ 免责区块 `.onboarding-app-purpose__wellness`（EN：Not therapy or medical care；含 diagnose/treat/cure/prevent；日语切语后见「心理療法・医療ではありません」）+ 卡末 colophon（Focus Tiger™ / Created by Ihiro Armstrong Hao Hoh / Twinsology / © 2026）。Electron 另见 `#onboarding-purpose-desktop-ram`（8 GB · Mac and Windows）；Web / 手机 Safari 不见该块。

#### W-3

- **优先级**：P1
- **覆盖**：已在 `e2e/onboarding-remedy-contract.spec.js` 覆盖；已在 `privacyNoticeCopy.test.js` 覆盖；已在 `wellnessDisclaimerGate.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 点 Privacy

**Then**
- `#onboarding-privacy-sheet` 可读本地优先、不挖矿反思；YPE / 漏斗 opt-in 在可滚动 body 内（不被 `max-height: 70vh` 裁切）；见 wellness 交叉引用 → 点链回简介免责区块。点 sheet 外空白或 backdrop → 0–1 秒内 Privacy + 简介卡一起关掉（不必先 Back）。

#### W-4

- **优先级**：P1
- **覆盖**：已在 `e2e/onboarding-remedy-contract.spec.js` 覆盖；已在 `privacyNoticeCopy.test.js` 覆盖；已在 `wellnessDisclaimerGate.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （可选）点 The five moments

**Then**
- 打开与场景 Y 同一 `#five-moments-compass`（见 Y）。

#### W-5

- **优先级**：P1
- **覆盖**：已在 `e2e/onboarding-remedy-contract.spec.js` 覆盖；已在 `privacyNoticeCopy.test.js` 覆盖；已在 `wellnessDisclaimerGate.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- Back

**Then**
- 回简介 → Got it 关闭。

#### W-6

- **优先级**：P1
- **覆盖**：已在 `e2e/onboarding-remedy-contract.spec.js` 覆盖；已在 `privacyNoticeCopy.test.js` 覆盖；已在 `wellnessDisclaimerGate.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 回流：Rise 后再点 ?

**Then**
- Privacy → Back。

#### W-7

- **优先级**：P1
- **覆盖**：已在 `e2e/onboarding-remedy-contract.spec.js` 覆盖；已在 `privacyNoticeCopy.test.js` 覆盖；已在 `wellnessDisclaimerGate.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 375：同路径；简介 / Sheet 不挡到无法关

#### W-8

- **优先级**：P1
- **覆盖**：已在 `e2e/onboarding-remedy-contract.spec.js` 覆盖；已在 `privacyNoticeCopy.test.js` 覆盖；已在 `wellnessDisclaimerGate.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1&wellnessFirst=1&flowerWelcome=0

**When**
- （无额外用户操作）

**Then**
- QA 例外：`?wellnessFirst=1&flowerWelcome=0` 仍可强制 Got it 卡（非产品默认）

---
## 场景 X：主动 Recover · Tiger Anchor（Focusing 轻触阿寅）

> **用户故事**：Kelly 专注中卡住了——不切页、不放弃；轻触阿寅（或幽灵提示）→ 点头鞠躬 + 中置观察式 toast + 光影 Recover 扰动；计时继续。与场景 B 被动 Re-focus（切走>60s）**分工**：本故事是**用户主动**；**不**占被动提醒日/会话额度。
**单元**：`MindfulReminderController.test`（不占额度 / 180s 冷却 / FB-01 微点头不延长冷却、无 toast）。
**DOM**：尚无完整 e2e 故事锁；观感须人工。
**仍须人工**：微光+文案可读；点击反馈链；冷却邀请隐退（微光/提示没了、hit 仍在）；**冷却期内再点阿寅（FB-01 微点头）**；375 不误触 Rise/HUD。
**合入*…

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| X-1 | P1 | 完整链路仍须人工 | `?product=1` → Sit（或 ⚡/时长 chip）→ Focusing。 |
| X-2 | P1 | 完整链路仍须人工 | 见幽灵提示（如「Feeling stuck?…」）+ 阿寅身前微光 `#active-recover |
| X-3 | P1 | 完整链路仍须人工 | 轻触阿寅（或提示带）→ 0–1 秒内：微光/按压被接收 + `nod-bow` 开始；随后中置 to |
| X-4 | P1 | 完整链路仍须人工 | 必须：计时器不停；不跳页；不进 Reflection / MicroRitual / 记账。 |
| X-5 | P1 | 完整链路仍须人工 | 触发后邀请隐退 180s（SB-07）：冷却期内 看不到微光与幽灵提示；invisible hit  |
| X-5b | P1 | 完整链路仍须人工 | 冷却期内再点阿寅（FB-01 · 不是白名单） → 0–1 秒内：比完整 `nod-bow` 幅度更 |
| X-6 | P1 | 完整链路仍须人工 | 回流：Rise → 触点消失；再 Focusing 可再出现。 |
| X-7 | P1 | 完整链路仍须人工 | Whisper 交叉（若清过 `moment-whispers-seen.v1`）：首次主动 Rec |

### Given-When-Then 明细

#### X-1

- **优先级**：P1
- **覆盖**：完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- `?product=1`

**Then**
- Sit（或 ⚡/时长 chip）→ Focusing。

#### X-2

- **优先级**：P1
- **覆盖**：完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- （无额外用户操作）

**Then**
- 见幽灵提示（如「Feeling stuck?…」）+ 阿寅身前微光 `#active-recover-anchor`

#### X-3

- **优先级**：P1
- **覆盖**：完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- 轻触阿寅（或提示带）

**Then**
- 0–1 秒内：微光/按压被接收 + `nod-bow` 开始；随后中置 toast（`ACTIVE_RECOVER` 池，~3s）+ LightProgression Recover 扰动。

#### X-4

- **优先级**：P1
- **覆盖**：完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- （无额外用户操作）

**Then**
- 必须：计时器不停；不跳页；不进 Reflection / MicroRitual / 记账

#### X-5

- **优先级**：P1
- **覆盖**：完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- （无额外用户操作）

**Then**
- 触发后邀请隐退 180s（SB-07）：冷却期内 看不到微光与幽灵提示；invisible hit 仍在（不要报成「整层没了所以点不到」）；冷却结束微光+提示回来再可点完整 Recover；期间被动 Re-focus 额度不得减少

#### X-5b

- **优先级**：P1
- **覆盖**：完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- 冷却期内再点阿寅（FB-01 · 不是白名单）

**Then**
- 0–1 秒内：比完整 `nod-bow` 幅度更小的点头（`nodBowMicro`，nod-bow 第 2–4 帧）；不出文字/toast；不重置或延长冷却。不应再出完整 Active Recover `nod-bow`+toast。只验「微光消失」≠ 本步通过。

#### X-6

- **优先级**：P1
- **覆盖**：完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- 回流：Rise

**Then**
- 触点消失；再 Focusing 可再出现。

#### X-7

- **优先级**：P1
- **覆盖**：完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- （无额外用户操作）

**Then**
- Whisper 交叉（若清过 `moment-whispers-seen.v1`）：首次主动 Recover 可出 Recover `#moment-whisper` 一次（见场景 Y）。冷却再点的微点头不应再触发 Recover whisper

---
## 场景 X2：Idle 轻点阿寅 · 摇耳摸头

> **用户故事**：Kelly 打开产品、阿寅在坐禅——轻点它，它摸摸自己的头顶（已有 `earWiggleHeadTouch`），不是没反应。
**单元**：`idleYinTapGate.test.js`（含 `wrapPlayEmotionWithIdleYinTapSync`：oneshot `onComplete` 仍见摸头键时须在回 Idle 后再武装）· `IdleYinTapAnchorUI.test.js`（额头 hit `top≤32%`）。
**DOM**：`e2e/idle-yin-tap.spec.js`（testid + 视口额头点击 → `earWiggleHeadTouch`；Rise→Reflection skip 回流再武装）。
**仍须人工**：正+倒一次…

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| X2-1 | P1 | 已在 `idleYinTapGate.test.js` 覆盖；已在 `IdleYinTap | 冷启动（清 `idle-yin-tap-hint.v1`）：吹花若出现须先结束；随后头顶白玉句「试试 |
| X2-2 | P1 | 已在 `idleYinTapGate.test.js` 覆盖；已在 `IdleYinTap | `?product=1` Idle → 轻点阿寅额头 → 0–1 秒内见摸头动画开始。 |
| X2-3 | P1 | 已在 `idleYinTapGate.test.js` 覆盖；已在 `IdleYinTap | 播完 ~1s CapCut 回闭目呼吸（不得闪白）；再点可再播。 |
| X2-4 | P1 | 已在 `idleYinTapGate.test.js` 覆盖；已在 `IdleYinTap | Sit → Focusing → 点阿寅 = 场景 X Recover，不是摸头。 |
| X2-5 | P1 | 已在 `idleYinTapGate.test.js` 覆盖；已在 `IdleYinTap | Honesty 时长板 / Arrival / Support 卡开着时 hit 隐藏（点不到、不是 |
| X2-6 | P1 | 已在 `idleYinTapGate.test.js` 覆盖；已在 `IdleYinTap | 回流：Rise → Skip Reflection 回 Idle 后再点额头仍须摸头（禁止第一次播完 |

### Given-When-Then 明细

#### X2-1

- **优先级**：P1
- **覆盖**：已在 `idleYinTapGate.test.js` 覆盖；已在 `IdleYinTapAnchorUI.test.js` 覆盖；已在 `e2e/idle-yin-tap.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 冷启动（清 `idle-yin-tap-hint.v1`）：吹花若出现须先结束；随后头顶白玉句「试试触摸或点击阿寅的头顶」（跟 locale）。点额头后提示消失，再刷不再出。不是每次摸头 toast

#### X2-2

- **优先级**：P1
- **覆盖**：已在 `idleYinTapGate.test.js` 覆盖；已在 `IdleYinTapAnchorUI.test.js` 覆盖；已在 `e2e/idle-yin-tap.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- `?product=1` Idle

**Then**
- 轻点阿寅额头 → 0–1 秒内见摸头动画开始。

#### X2-3

- **优先级**：P1
- **覆盖**：已在 `idleYinTapGate.test.js` 覆盖；已在 `IdleYinTapAnchorUI.test.js` 覆盖；已在 `e2e/idle-yin-tap.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 播完 ~1s CapCut 回闭目呼吸（不得闪白）；再点可再播

#### X2-4

- **优先级**：P1
- **覆盖**：已在 `idleYinTapGate.test.js` 覆盖；已在 `IdleYinTapAnchorUI.test.js` 覆盖；已在 `e2e/idle-yin-tap.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- Sit

**Then**
- Focusing → 点阿寅 = 场景 X Recover，不是摸头。

#### X2-5

- **优先级**：P1
- **覆盖**：已在 `idleYinTapGate.test.js` 覆盖；已在 `IdleYinTapAnchorUI.test.js` 覆盖；已在 `e2e/idle-yin-tap.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- Honesty 时长板 / Arrival / Support 卡开着时 hit 隐藏（点不到、不是哑点击）。? 简介或 Privacy 开着时同样：hit 卸武装或被挡；关掉弹窗后再点额头须摸头

#### X2-6

- **优先级**：P1
- **覆盖**：已在 `idleYinTapGate.test.js` 覆盖；已在 `IdleYinTapAnchorUI.test.js` 覆盖；已在 `e2e/idle-yin-tap.spec.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- 回流：Rise

**Then**
- Skip Reflection 回 Idle 后再点额头仍须摸头（禁止第一次播完后 hit 永久 hidden）。

---
## 场景 Y1：Y1 · Compass（B）

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| Y1-1 | P1 | 无自动化标注 | Idle → 宽屏 ⋯ / 窄屏抽屉 The 5 Moments → `#five-moments- |
| Y1-2 | P1 | 无自动化标注 | 「?」：简介含 Moments 链 → The five moments → 同卡。 |
| Y1-3 | P1 | 无自动化标注 | 首卡：清 `focus-tiger.five-moments-compass-seen.v1` →  |
| Y1-4 | P1 | 无自动化标注 | 回流：关后再开；Rise 后再开。375：可滚可关、不挡 Sit。 |

### Given-When-Then 明细

#### Y1-1

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- Idle

**Then**
- 宽屏 ⋯ / 窄屏抽屉 The 5 Moments → `#five-moments-compass` 见 Arrive→Focus→Recover→Transition→Reflect 单行 + Got it/Close。点芯片分别进入 Arrival / Companion / Recover 仪式 / Transition Moment overlay（C5.1；与 Idle 微钮同路径）/ Journey log（未授权 Recover 仪式则 toast）。

#### Y1-2

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 「?」：简介含 Moments 链

**Then**
- The five moments → 同卡。

#### Y1-3

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- 首卡：清 `focus-tiger.five-moments-compass-seen.v1`

**Then**
- 冷启动 Idle 约数秒出一次；Skip/Got it 后不再出。

#### Y1-4

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 回流：关后再开；Rise 后再开。375：可滚可关、不挡 Sit

---
## 场景 Y2：Y2 · Moment Whisper（A′）

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| Y2-5 | P1 | 无自动化标注 | 清 `focus-tiger.moment-whispers-seen.v1` → Sit→Arri |
| Y2-6 | P1 | 无自动化标注 | 进入 Focusing → Focus whisper 一次；再开第二场 Focusing → 不再 |
| Y2-7 | P1 | 无自动化标注 | Rise→Reflection → Reflect whisper 一次；再走同路径 → 不再出（S |
| Y2-8 | P1 | 无自动化标注 | Recover：见场景 X；首次主动 Recover → Recover whisper 一次。 |
| Y2-9 | P1 | 无自动化标注 | busy：Compass / Companion / Arrival 叠层打开时不出（SB-06）； |
| Y2-10 | P1 | 无自动化标注 | 「?」：仍只出简介（+ Compass 链），不喷满页 tip。 |

### Given-When-Then 明细

#### Y2-5

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 清 `focus-tiger.moment-whispers-seen.v1`

**Then**
- Sit→Arrival → 见 Arrive `#moment-whisper` 一次（可点关 / 数秒淡出）。

#### Y2-6

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 进入 Focusing

**Then**
- Focus whisper 一次；再开第二场 Focusing → 不再出 Focus whisper（SB-05）。

#### Y2-7

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- Rise

**Then**
- Reflection → Reflect whisper 一次；再走同路径 → 不再出（SB-05）。

#### Y2-8

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- Recover：见场景 X；首次主动 Recover

**Then**
- Recover whisper 一次。

#### Y2-9

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- busy：Compass / Companion / Arrival 叠层打开时不出（SB-06）；关后再进未读 Moment 仍可

#### Y2-10

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 「?」：仍只出简介（+ Compass 链），不喷满页 tip

---
## 场景 Z：Journey Log（D′ · 本地留痕）

> **用户故事**：Kelly 走完一场有头有尾的专注后，想安静回顾——⋯ / 抽屉打开 **Journey log**，见日期+分钟+ arrived & reflected（或缺省降级），不是 Health 同步、不是 Tip 茶室账本。
**单元**：`journeyLogGate.test.js`（含 `microRitualJourneyDraft`）；orchestration 含 `journey-log`。
**仍须人工**：Skip Reflection 后 `reflect=false`；无 Arrival 路径降级；>30 裁旧；刷新仍在；开/关卡 0–1s；**洞察小符号观感**（抽中 Quiet Line 种子池并当场打开后）。
**合入**：#205；洞察标记 #2…

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| Z-1 | P1 | 已在 `journeyLogGate.test.js` 覆盖；完整链路仍须人工 | `?product=1` → Sit→Arrival→Focus（可用 `?sessionMinut |
| Z-2 | P1 | 已在 `journeyLogGate.test.js` 覆盖；完整链路仍须人工 | 宽屏 ⋯ / 窄屏抽屉 Journey log → 0–1 秒内：菜单行 `:active` 按压缩 |
| Z-3 | P1 | 已在 `journeyLogGate.test.js` 覆盖；完整链路仍须人工 | 回流：Close / 点外侧 / Esc → 0–1 秒内：关钮 `:active` 按压 + 卡开 |
| Z-4 | P1 | 已在 `journeyLogGate.test.js` 覆盖；完整链路仍须人工 | Compass Reflect（与场景 Y 交叉）：点 Reflect 芯片 → 0–1 秒内：芯片 |
| Z-5 | P1 | 已在 `journeyLogGate.test.js` 覆盖；完整链路仍须人工 | 备份角（开卡之后；与开卡反馈分开验）：角落备份链 → 0–1 秒内：链 `:active` 下压 + |
| Z-6 | P1 | 已在 `journeyLogGate.test.js` 覆盖；完整链路仍须人工 | 列表行只读：点某一天不会展开 Daily Card / Save image（Brief `task |
| Z-7 | P1 | 已在 `journeyLogGate.test.js` 覆盖；完整链路仍须人工 | 字段 `insightSpark`：仅当当日 Quiet Line 抽中洞察种子句 且当场打开过 Q |
| Z-8 | P1 | 已在 `journeyLogGate.test.js` 覆盖；完整链路仍须人工 | 375：卡可关、不挡 Sit。 |
| Z-9 | P1 | 已在 `journeyLogGate.test.js` 覆盖；完整链路仍须人工 | 对照：Tip Jar `#yin-tip-jar-tea-log` 不得因本场 Focus 自动多出 |

### Given-When-Then 明细

#### Z-1

- **优先级**：P1
- **覆盖**：已在 `journeyLogGate.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1&sessionMinutes=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- `?product=1`

**Then**
- Sit→Arrival→Focus（可用 `?sessionMinutes=1` DEMO）→ Rise→Reflection（答或 Skip）→ Idle。等价路径：首页左球 Breath practice → 到点 → Reflection（含 Skip）→ 同样写入（`arrive: false`）。Honesty / 付费仪式 不入账。

#### Z-2

- **优先级**：P1
- **覆盖**：已在 `journeyLogGate.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 宽屏 ⋯ / 窄屏抽屉 Journey log

**Then**
- 0–1 秒内：菜单行 `:active` 按压缩放（宽屏 `.ft-wide-more__item`；窄屏 `.ft-narrow-sheet__item`）+ ⋯/抽屉收起 + `#journey-log` 开始淡入（~220ms `is-visible`）。随后见日期 + 分钟 + arrived & reflected（Skip Reflection 则 reflect 降级；缺 Arrival 则无 focus 降级文案）。空列表见 empty 文案，仍算「已开卡」，不要报成哑点击。

#### Z-3

- **优先级**：P1
- **覆盖**：已在 `journeyLogGate.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- 回流：Close / 点外侧 / Esc

**Then**
- 0–1 秒内：关钮 `:active` 按压 + 卡开始淡出；Idle Sit / ⋯ 或抽屉 grabber 仍可见。刷新后条目仍在；再完成一场 → 新行在列表（上限约 30，裁旧）。

#### Z-4

- **优先级**：P1
- **覆盖**：已在 `journeyLogGate.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- Compass Reflect（与场景 Y 交叉）：点 Reflect 芯片

**Then**
- 0–1 秒内：芯片 `:active` 按压 + `#five-moments-compass` 收起 + 同一张 `#journey-log` 淡入。

#### Z-5

- **优先级**：P1
- **覆盖**：已在 `journeyLogGate.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 备份角（开卡之后；与开卡反馈分开验）：角落备份链

**Then**
- 0–1 秒内：链 `:active` 下压 + `#journey-log-backup-panel` 展开或收起。Send code → 立刻见 Sending…（`JOURNEY_LOG_BACKUP_STATUS_SENDING`）再变成发到邮箱的说明。Enable 成功须换一句可见状态（勿再用同一句 Backup enabled 让人以为没反应）。详测见 TRACKER 练习记忆备份行。

#### Z-6

- **优先级**：P1
- **覆盖**：已在 `journeyLogGate.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 列表行只读：点某一天不会展开 Daily Card / Save image（Brief `task-journey-daily-card.md` 未接线）。这不是「开卡点了没反应」

#### Z-7

- **优先级**：P1
- **覆盖**：已在 `journeyLogGate.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 字段 `insightSpark`：仅当当日 Quiet Line 抽中洞察种子句 且当场打开过 Quiet Line 时，该条（或同日已有条目被补标）带本地 `insightSpark: true`，行末见安静小符号 `◦`（`[data-testid=journey-log-insight-spark]`）。未打开 Quiet Line、或当日句是经典金句

**Then**
- 无符号。旧条目缺该字段 → 降级为无标记。刷新后标记仍在。与徽章 / Tea / Sanctuary 无联动。

#### Z-8

- **优先级**：P1
- **覆盖**：已在 `journeyLogGate.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 375：卡可关、不挡 Sit

#### Z-9

- **优先级**：P1
- **覆盖**：已在 `journeyLogGate.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 对照：Tip Jar `#yin-tip-jar-tea-log` 不得因本场 Focus 自动多出一杯茶

---
## 场景 AC：Yin's Collections 抽屉（L3 · 寅币珍藏表面）

> **用户故事**：Kelly 想用坐来的寅币结缘一件钱买不到的案头雅物——宽屏 ⋯ / 窄屏抽屉在 Journey log **旁边**打开 **Yin's Collections**（汉语阿寅的珍藏 / 日语阿寅の蒐集），见可滚动商店目录，不是 Support 三卡、不是请茶、不是 HUD 钱包、不是第二座莲花池。
**单元**：`focusCoinsSurface.test.js`（商店 8 行清供；缺口句点名还差几枚/几分钟）；`collectionsBehavioralScarcity.test.js`（纪念分区 catalog 谓词 + 本机说明句）；`collectionsWaveHelloGate.test.js`（Focusing / celebrating 不得播；**不*…

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| AC-1 | P1 | 已在 `focusCoinsSurface.test.js` 覆盖；已在 `collect | `?product=1` Idle → 宽屏 ⋯ / 窄屏抽屉 Yin's Collections  |
| AC-2 | P1 | 已在 `focusCoinsSurface.test.js` 覆盖；已在 `collect | 挥手点播：点底栏 请阿寅挥挥手 → 0–1 秒内钮 `:active` 按压 + 阿寅开始 `wav |
| AC-3 | P1 | 已在 `focusCoinsSurface.test.js` 覆盖；已在 `collect | 结缘成功（余额够、门槛够）：点 结缘 / Bond → 0–1 秒内钮 `:active` 按压；该 |
| AC-4 | P1 | 已在 `focusCoinsSurface.test.js` 覆盖；已在 `collect | 不足 / 未达门槛：点结缘 → 0–1 秒内仍有按压 + 行内具体缺口（还差 N 枚 / N 分钟  |
| AC-5 | P1 | 已在 `focusCoinsSurface.test.js` 覆盖；已在 `collect | 回流：Close / Esc / 点外侧 → 0–1 秒内关钮 `:active` + 卡淡出；Si |
| AC-6 | P1 | 已在 `focusCoinsSurface.test.js` 覆盖；已在 `collect | 对照 Support（场景 Q）：右上角 Support Yin 三卡 / `$` 不出现在本面板。 |
| AC-7 | P1 | 已在 `focusCoinsSurface.test.js` 覆盖；已在 `collect | 关闸：`?product=1&focusCoins=0` → 抽屉 / ⋯ 没有珍藏这一行。 |
| AC-8 | P1 | 已在 `focusCoinsSurface.test.js` 覆盖；已在 `collect | 375：卡可关、不挡 Sit 三球。 |
| AC-9 | P1 | 已在 `focusCoinsSurface.test.js` 覆盖；已在 `collect | 修行纪念分区（#888 V1）：清供列表下方见 Practice memorials / 修行纪念（ |
| AC-10 | P1 | 已在 `focusCoinsSurface.test.js` 覆盖；已在 `collect | 修行纪念印自动出卡（#888 Slice 2）：本机终身分钟首次跨 600/3000/10800 档 |

### Given-When-Then 明细

#### AC-1

- **优先级**：P1
- **覆盖**：已在 `focusCoinsSurface.test.js` 覆盖；已在 `collectionsBehavioralScarcity.test.js` 覆盖；已在 `collectionsWaveHelloGate.test.js` 覆盖；已在 `EmotionController.test.js` 覆盖；已在 `idleChromeOrchestration.test.js` 覆盖；已在 `FocusCoinsPanelUI.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- `?product=1` Idle

**Then**
- 宽屏 ⋯ / 窄屏抽屉 Yin's Collections / 阿寅的珍藏（紧挨 Journey log）→ 0–1 秒内：菜单行 `:active` 按压缩放 + ⋯/抽屉收起 + `#yin-coin-panel` 开始淡入（~220ms `is-visible`）。≥480：面板靠右停（与 ⋯ sheet 同族），中线阿寅须完整可见。375：短底栏（约 42vh），头顶不得被玻璃盖住。随后见抬头精致浮雕币标 + 寅币余额旁小 icon +「案头雅物皆由同坐日久所化」+ 商店行（青铜香薰炉 / 青瓷莲盏 / 紫檀念珠匣 / 青铜奁 / 座右小碑 / 归来青瓷小瓶 / 石镇纸 / 须弥小鼎）。SKU 行仍是占位色点。币标不出现在阿寅序列或蒲团上。商店行不得出现挥手 / 青瓷瓶 / 青铜礼器 / 单独的「久坐的人」，也不得用晨露滤镜盖莲花。底栏可见 请阿寅挥挥手。

#### AC-2

- **优先级**：P1
- **覆盖**：已在 `focusCoinsSurface.test.js` 覆盖；已在 `collectionsBehavioralScarcity.test.js` 覆盖；已在 `collectionsWaveHelloGate.test.js` 覆盖；已在 `EmotionController.test.js` 覆盖；已在 `idleChromeOrchestration.test.js` 覆盖；已在 `FocusCoinsPanelUI.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 挥手点播：点底栏 请阿寅挥挥手

**Then**
- 0–1 秒内钮 `:active` 按压 + 阿寅开始 `wave-hello` 正放一次，约 1s CapCut 回坐禅；挥手序列须在面板外可见（不得被玻璃挡住）。关面板再开钮仍在。Focusing / 庆祝中点同一钮：仍有按压 + toast「阿寅正在坐着…」，不播序列。不得把挥手加回开场欢迎池。

#### AC-3

- **优先级**：P1
- **覆盖**：已在 `focusCoinsSurface.test.js` 覆盖；已在 `collectionsBehavioralScarcity.test.js` 覆盖；已在 `collectionsWaveHelloGate.test.js` 覆盖；已在 `EmotionController.test.js` 覆盖；已在 `idleChromeOrchestration.test.js` 覆盖；已在 `FocusCoinsPanelUI.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 结缘成功（余额够、门槛够）：点 结缘 / Bond

**Then**
- 0–1 秒内钮 `:active` 按压；该行变成已结缘；余额减少。清供只进珍藏卡面，莲花朵数与亮度不变。座右小碑 / 须弥小鼎可 Wear（一次一个）。石镇纸 / 器物成功可出安静仪式句（非彩纸）。

#### AC-4

- **优先级**：P1
- **覆盖**：已在 `focusCoinsSurface.test.js` 覆盖；已在 `collectionsBehavioralScarcity.test.js` 覆盖；已在 `collectionsWaveHelloGate.test.js` 覆盖；已在 `EmotionController.test.js` 覆盖；已在 `idleChromeOrchestration.test.js` 覆盖；已在 `FocusCoinsPanelUI.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 不足 / 未达门槛：点结缘

**Then**
- 0–1 秒内仍有按压 + 行内具体缺口（还差 N 枚 / N 分钟 / 练习日等）+ 安静 中置 toast（须盖在面板之上可读）。不是哑点击，也不说笼统「无法兑换」。

#### AC-5

- **优先级**：P1
- **覆盖**：已在 `focusCoinsSurface.test.js` 覆盖；已在 `collectionsBehavioralScarcity.test.js` 覆盖；已在 `collectionsWaveHelloGate.test.js` 覆盖；已在 `EmotionController.test.js` 覆盖；已在 `idleChromeOrchestration.test.js` 覆盖；已在 `FocusCoinsPanelUI.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 回流：Close / Esc / 点外侧

**Then**
- 0–1 秒内关钮 `:active` + 卡淡出；Sit / ⋯ 仍在。再打开仍是商店目录；已结缘不再扣点。

#### AC-6

- **优先级**：P1
- **覆盖**：已在 `focusCoinsSurface.test.js` 覆盖；已在 `collectionsBehavioralScarcity.test.js` 覆盖；已在 `collectionsWaveHelloGate.test.js` 覆盖；已在 `EmotionController.test.js` 覆盖；已在 `idleChromeOrchestration.test.js` 覆盖；已在 `FocusCoinsPanelUI.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 对照 Support（场景 Q）：右上角 Support Yin 三卡 / `$` 不出现在本面板。付款仍只走 Support FAB

#### AC-7

- **优先级**：P1
- **覆盖**：已在 `focusCoinsSurface.test.js` 覆盖；已在 `collectionsBehavioralScarcity.test.js` 覆盖；已在 `collectionsWaveHelloGate.test.js` 覆盖；已在 `EmotionController.test.js` 覆盖；已在 `idleChromeOrchestration.test.js` 覆盖；已在 `FocusCoinsPanelUI.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 关闸：`?product=1&focusCoins=0`

**Then**
- 抽屉 / ⋯ 没有珍藏这一行。

#### AC-8

- **优先级**：P1
- **覆盖**：已在 `focusCoinsSurface.test.js` 覆盖；已在 `collectionsBehavioralScarcity.test.js` 覆盖；已在 `collectionsWaveHelloGate.test.js` 覆盖；已在 `EmotionController.test.js` 覆盖；已在 `idleChromeOrchestration.test.js` 覆盖；已在 `FocusCoinsPanelUI.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 375：卡可关、不挡 Sit 三球

#### AC-9

- **优先级**：P1
- **覆盖**：已在 `focusCoinsSurface.test.js` 覆盖；已在 `collectionsBehavioralScarcity.test.js` 覆盖；已在 `collectionsWaveHelloGate.test.js` 覆盖；已在 `EmotionController.test.js` 覆盖；已在 `idleChromeOrchestration.test.js` 覆盖；已在 `FocusCoinsPanelUI.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 修行纪念分区（#888 V1）：清供列表下方见 Practice memorials / 修行纪念（不得混进「案上陪伴」行）。已解锁：本机 score / 累计分钟说明句（无全球名次、无进度条）。未解锁：观察句「尚未在本机走过」——行不可交互。已得分钟印（600/3000/10800）行可点

**Then**
- 0–1 秒内 `#practice-imprint-card` 淡入，Continue 关闭；芥子 score 行仍只读。locale 切换后重开面板文案随语言变。

#### AC-10

- **优先级**：P1
- **覆盖**：已在 `focusCoinsSurface.test.js` 覆盖；已在 `collectionsBehavioralScarcity.test.js` 覆盖；已在 `collectionsWaveHelloGate.test.js` 覆盖；已在 `EmotionController.test.js` 覆盖；已在 `idleChromeOrchestration.test.js` 覆盖；已在 `FocusCoinsPanelUI.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 修行纪念印自动出卡（#888 Slice 2）：本机终身分钟首次跨 600/3000/10800 档后，完成 baseline 仪式（Sit / Honesty / Breath）

**Then**
- 若芥子/静思典藏未占队列 → 先见 `#practice-imprint-card`（方章占位 + 累计分钟 + 季语）→ Continue → 再进 Reflection/桥接。同场若多档同时满足，一次只出最低未揭示档；已揭示档不再自动弹出，仅菜单重读。

---
## 场景 AA：Idle Document PiP 陪伴浮窗（实验原型）

> **地位**：**实验 / 非最终形态**。用来验证「切到其他窗口或 App 时，仍能看见阿寅安静呼吸」。**待观察使用数据后决定是否继续投入**（localStorage `focus-tiger.idle-companion-pip.v1` 只记是否曾打开，不用于提醒或激励）。
**不是**系统托盘 / 关浏览器后仍常驻（电脑版壳已拍板 Electron，但 AA **仍不是**那条路径）；**不是** Focusing 里的 Immersive Presence「Float Yin · experimental」（那个带计时——见 **场景 AK**）。
**单元**：`idleCompanionPipGate.test.js`（Document PiP 支持 → 入口可挂载；不支持 …

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| AA-1 | P2 | 已在 `idleCompanionPipGate.test.js` 覆盖；完整链路仍须人工 | Chrome / Edge 桌面 · `?product=1` Idle：热力图簇旁见画中画小圆钮（ |
| AA-2 | P2 | 已在 `idleCompanionPipGate.test.js` 覆盖；完整链路仍须人工 | 切到其他窗口或本机 App：小窗应保持在最上层，阿寅继续呼吸。主页面 Idle 状态不变（浮窗只是视 |
| AA-3 | P2 | 已在 `idleCompanionPipGate.test.js` 覆盖；完整链路仍须人工 | 关闭：再点该钮，或关系统 PiP 窗 → 0–1 秒内小窗消失，回到普通页面；Sit / 热力图仍在 |
| AA-4 | P2 | 已在 `idleCompanionPipGate.test.js` 覆盖；完整链路仍须人工 | 回流：关后再开仍立刻出窗；Sit → Focusing 时入口须消失、已开浮窗须收起；Rise 回  |
| AA-5 | P2 | 已在 `idleCompanionPipGate.test.js` 覆盖；完整链路仍须人工 | Safari / Firefox（及无 `documentPictureInPicture` 的环境 |
| AA-6 | P2 | 已在 `idleCompanionPipGate.test.js` 覆盖；完整链路仍须人工 | 375：簇内图标不挡三球；本原型不要求浮窗在窄屏浏览器里好用（桌面 Chromium 才是假设验证面 |

### Given-When-Then 明细

#### AA-1

- **优先级**：P2
- **覆盖**：已在 `idleCompanionPipGate.test.js` 覆盖；完整链路仍须人工；E2E 未完整覆盖，此处 smoke/跳过

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- 点击后 0–1 秒内：钮 `:active` 轻微按压缩放，置顶小窗立刻打开，窗内只有阿寅呼吸/陪伴帧（无计时、无按钮、无打卡）。不是延迟后再弹出

**Then**
- Chrome / Edge 桌面 · `?product=1` Idle：热力图簇旁见画中画小圆钮（`#idle-companion-pip`）

#### AA-2

- **优先级**：P2
- **覆盖**：已在 `idleCompanionPipGate.test.js` 覆盖；完整链路仍须人工；E2E 未完整覆盖，此处 smoke/跳过

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- 切到其他窗口或本机 App：小窗应保持在最上层，阿寅继续呼吸。主页面 Idle 状态不变（浮窗只是视图分身）

**Then**
- （Then 断言见原文；信息不足见待澄清清单）

#### AA-3

- **优先级**：P2
- **覆盖**：已在 `idleCompanionPipGate.test.js` 覆盖；完整链路仍须人工；E2E 未完整覆盖，此处 smoke/跳过

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 关闭：再点该钮，或关系统 PiP 窗

**Then**
- 0–1 秒内小窗消失，回到普通页面；Sit / 热力图仍在。不持有独立会话。

#### AA-4

- **优先级**：P2
- **覆盖**：已在 `idleCompanionPipGate.test.js` 覆盖；完整链路仍须人工；E2E 未完整覆盖，此处 smoke/跳过

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- 回流：关后再开仍立刻出窗；Sit

**Then**
- Focusing 时入口须消失、已开浮窗须收起；Rise 回 Idle 后入口再出现，不自动弹窗。

#### AA-5

- **优先级**：P2
- **覆盖**：已在 `idleCompanionPipGate.test.js` 覆盖；完整链路仍须人工；E2E 未完整覆盖，此处 smoke/跳过

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- （无额外用户操作）

**Then**
- Safari / Firefox（及无 `documentPictureInPicture` 的环境）：Idle 完全不见该入口；无报错、无「暂不支持」提示。本步不是点击——入口不存在即测对了

#### AA-6

- **优先级**：P2
- **覆盖**：已在 `idleCompanionPipGate.test.js` 覆盖；完整链路仍须人工；E2E 未完整覆盖，此处 smoke/跳过

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 375：簇内图标不挡三球；本原型不要求浮窗在窄屏浏览器里好用（桌面 Chromium 才是假设验证面）

---
## 场景 AK：Focusing · Float Yin PiP 探针（Immersive Presence · #438）

> **地位**：Focusing HUD 内 **Float Yin · experimental**（应用内沉浸 + Document PiP 小窗）。**≠** 场景 AA（Idle 热力图旁 Document PiP，无计时）。
**#438 行为**：Electron 壳内须 **live 探针**——探针失败 **藏钮**（禁止可点却无反应）；Chrome 桌面仍可见并可开 PiP。
**单元**：`immersivePresenceSupport.test.js`（Electron 探针红/绿）。
**仍须人工**：Safari 入口不出现；Rise 后再 Focusing 行为一致。

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| AK-1 | P1 | 已在 `immersivePresenceSupport.test.js` 覆盖；完整链路 | Chrome 桌面 · `?product=1` → Sit → Focusing → 见 Floa |
| AK-2 | P1 | 已在 `immersivePresenceSupport.test.js` 覆盖；完整链路 | Electron `desktop:dev` 宽屏 · 同上路径 → Focusing → 不得见可 |
| AK-3 | P1 | 已在 `immersivePresenceSupport.test.js` 覆盖；完整链路 | 若壳内误显且点失败：中置短句 `IMMERSIVE_PIP_UNAVAILABLE`（非空 catc |
| AK-4 | P1 | 已在 `immersivePresenceSupport.test.js` 覆盖；完整链路 | 回流：Rise 后再 Focusing → Chrome 仍可见；Electron 仍按探针藏/显。 |

### Given-When-Then 明细

#### AK-1

- **优先级**：P1
- **覆盖**：已在 `immersivePresenceSupport.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- Chrome 桌面 · `?product=1`

**Then**
- Sit → Focusing → 见 Float Yin · experimental → 点一下 → 0–1 秒内按压 + 小窗打开（计时仍在主窗）。

#### AK-2

- **优先级**：P1
- **覆盖**：已在 `immersivePresenceSupport.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：Electron desktop:dev + ?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- Electron `desktop:dev` 宽屏 · 同上路径

**Then**
- Focusing → 不得见可点但无反应的 Float Yin（探针失败应完全藏钮）。

#### AK-3

- **优先级**：P1
- **覆盖**：已在 `immersivePresenceSupport.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- （无额外用户操作）

**Then**
- 若壳内误显且点失败：中置短句 `IMMERSIVE_PIP_UNAVAILABLE`（非空 catch）。Safari：入口不出现

#### AK-4

- **优先级**：P1
- **覆盖**：已在 `immersivePresenceSupport.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- 回流：Rise 后再 Focusing

**Then**
- Chrome 仍可见；Electron 仍按探针藏/显。

---
## 场景 AM：Quiet Together 灯火（匿名同坐 · 2026-09-04）

> **地位**：Idle / Arrive 背景级诚实人数。**≠** Presence Signals、**≠** Circle、**≠** 聊天。Focusing 内不画。
**单元**：`quietTogetherPreference.test.js` · `quietTogetherPresence.test.js` · cloud `lanternPresenceKv.test.ts`。
**生产**：Worker 未部署时灯火保持空白（诚实）。
**点击**：灯火本身 `pointer-events: none`。Privacy 开关 0–1 秒内勾选变化；关掉则灯火消失。

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| AM-1 | P1 | 已在 `quietTogetherPreference.test.js` 覆盖；已在 `q | `?product=1` 硬刷新进 Idle 约 2.5s 起每 ~5s 自动 peek：若云端有人 |
| AM-2 | P1 | 已在 `quietTogetherPreference.test.js` 覆盖；已在 `q | Sit 进 Focusing → 灯火 须消失（0–1 秒内淡出）。Rise 回 Idle → 可再 |
| AM-3 | P1 | 已在 `quietTogetherPreference.test.js` 覆盖；已在 `q | ? → Privacy → 关掉 Quiet Together → 0–1 秒内灯火消失且不再 he |
| AM-4 | P1 | 已在 `quietTogetherPreference.test.js` 覆盖；已在 `q | 回流：再打开开关；`?quietTogether=0` 永不请求。 |

### Given-When-Then 明细

#### AM-1

- **优先级**：P1
- **覆盖**：已在 `quietTogetherPreference.test.js` 覆盖；已在 `quietTogetherPresence.test.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- `?product=1` 硬刷新进 Idle 约 2.5s 起每 ~5s 自动 peek：若云端有人在坐

**Then**
- 左下（宽屏在热力图簇上方）灯点 + 短句；若 0 人或无路由 → 不出现假灯火（无需 DevTools `peekLanternPresence()`）。

#### AM-2

- **优先级**：P1
- **覆盖**：已在 `quietTogetherPreference.test.js` 覆盖；已在 `quietTogetherPresence.test.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- Sit 进 Focusing

**Then**
- 灯火 须消失（0–1 秒内淡出）。Rise 回 Idle → 可再 peek。Breath practice / RitualFlow 呼吸步亦贡献同坐；练习窗自身不画灯火，其它 Idle 窗可见。

#### AM-3

- **优先级**：P1
- **覆盖**：已在 `quietTogetherPreference.test.js` 覆盖；已在 `quietTogetherPresence.test.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- ?

**Then**
- Privacy → 关掉 Quiet Together → 0–1 秒内灯火消失且不再 heartbeat。

#### AM-4

- **优先级**：P1
- **覆盖**：已在 `quietTogetherPreference.test.js` 覆盖；已在 `quietTogetherPresence.test.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 回流：再打开开关；`?quietTogether=0` 永不请求

---
## 场景 AN：Focus Circle（小圈暗号 · 2026-09-04）

> **地位**：Privacy 内可选社交基础设施。**≠** 全球灯火（AM）、**≠** Presence Signals、**≠** 聊天。
**单元**：`focusCircleMembership.test.js` · cloud `focusCircleKv.test.ts`。
**生产**：Worker 未部署 `/api/focus-circle` 时 Create/Join 须见错误文案，不挡 Sit。
**点击**：Create / Join / Leave / Copy 均 0–1 秒内 disabled 或状态句。Copy 后须见「已拷贝」类句，且面板仍开着、人数刷新时**不得立刻清掉**该句。Start a circle 若云端超过约 12 秒无响应，须出失败句并恢复…

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| AN-1 | P1 | 已在 `focusCircleMembership.test.js` 覆盖 | `?product=1` → ? → Privacy → Focus Circle → Start  |
| AN-2 | P1 | 已在 `focusCircleMembership.test.js` 覆盖 | 另一标签 Join 同码 → 人数增至 2（满 8 时 Join 须见满员句）。 |
| AN-3 | P1 | 已在 `focusCircleMembership.test.js` 覆盖 | Leave 成功 → 0–1 秒内回到未入圈态；Leave 超时/失败 → 失败句且仍为已入圈。错误 |
| AN-4 | P1 | 已在 `focusCircleMembership.test.js` 覆盖 | `?circleJoin=XXXXXX` 打开 Privacy 时预填加入框。`?focusCirc |
| AN-5 | P1 | 已在 `focusCircleMembership.test.js` 覆盖 | Copy invite code → 0–1 秒内见 copied 状态句；窗口再聚焦后该句仍在（剪 |
| AN-6 | P1 | 已在 `focusCircleMembership.test.js` 覆盖 | Start a circle 云端卡住 → 约 12 秒内失败句 + 按钮可再点。 |
| AN-7 | P1 | 已在 `focusCircleMembership.test.js` 覆盖 | Leave 后再 Join 同一六位码 → 须稳定显示已加入（暗号 + 人数 + Leave），不得 |

### Given-When-Then 明细

#### AN-1

- **优先级**：P1
- **覆盖**：已在 `focusCircleMembership.test.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- `?product=1`

**Then**
- ? → Privacy → Focus Circle → Start a circle → 0–1 秒内见六位暗号与「一人」。

#### AN-2

- **优先级**：P1
- **覆盖**：已在 `focusCircleMembership.test.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 另一标签 Join 同码

**Then**
- 人数增至 2（满 8 时 Join 须见满员句）。

#### AN-3

- **优先级**：P1
- **覆盖**：已在 `focusCircleMembership.test.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- Leave 成功

**Then**
- 0–1 秒内回到未入圈态；Leave 超时/失败 → 失败句且仍为已入圈。错误暗号须见「无匹配」类文案。

#### AN-4

- **优先级**：P1
- **覆盖**：已在 `focusCircleMembership.test.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- `?circleJoin=XXXXXX` 打开 Privacy 时预填加入框。`?focusCircle=0` 禁用请求

#### AN-5

- **优先级**：P1
- **覆盖**：已在 `focusCircleMembership.test.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- Copy invite code

**Then**
- 0–1 秒内见 copied 状态句；窗口再聚焦后该句仍在（剪贴板已有码却像没反应 = 失败）。

#### AN-6

- **优先级**：P1
- **覆盖**：已在 `focusCircleMembership.test.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- Start a circle 云端卡住

**Then**
- 约 12 秒内失败句 + 按钮可再点。

#### AN-7

- **优先级**：P1
- **覆盖**：已在 `focusCircleMembership.test.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- Leave 后再 Join 同一六位码

**Then**
- 须稳定显示已加入（暗号 + 人数 + Leave），不得停在 Start a circle。

---
## 场景 AO：Focus Circle Presence（圈内 sitting · 2026-09-04）

> **地位**：Idle / Arrive 背景级圈内同伴 sitting。**≠** 全球灯火（AM）、**≠** Circle 管理（AN）、**≠** Presence Signals。Focusing 内不画。
**单元**：`focusCirclePresence.test.js` · cloud `focusCirclePresenceKv.test.ts`。
**生产**：Version `22326de3`（2026-09-05 · #572）已含 presence actions；未部署时 Idle 保持空白（诚实）。
**点击**：银蓝 dots `pointer-events: none`；管理仍在菜单 / Privacy。

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| AO-1 | P1 | 已在 `focusCirclePresence.test.js` 覆盖 | A、B 均已入圈（两独立浏览器配置）→ A Sit 进 Focusing → B 硬刷新 Idle  |
| AO-2 | P1 | 已在 `focusCirclePresence.test.js` 覆盖 | A Rise 回 Idle → B 约 5–10s 内 dots 消失（诚实 0）。 |
| AO-3 | P1 | 已在 `focusCirclePresence.test.js` 覆盖 | A Breath practice 呼吸 ≥5s → B Idle 亦应见圈内 dots（A 练习窗 |
| AO-4 | P1 | 已在 `focusCirclePresence.test.js` 覆盖 | A Leave circle → B 不再见 A 的圈内 presence；A 本地亦清 snaps |
| AO-5 | P1 | 已在 `focusCirclePresence.test.js` 覆盖 | `?focusCircle=0` → 不请求、不画。 |

### Given-When-Then 明细

#### AO-1

- **优先级**：P1
- **覆盖**：已在 `focusCirclePresence.test.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 两个隔离 browser profile：用户 A / B 已加入同一 Focus Circle

**When**
- A、B 均已入圈（两独立浏览器配置）

**Then**
- A Sit 进 Focusing → B 硬刷新 Idle 约 2.5–10s 见银蓝 dots +「圈里有人在坐」（全球金灯火可同时出现）。

#### AO-2

- **优先级**：P1
- **覆盖**：已在 `focusCirclePresence.test.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- A Rise 回 Idle

**Then**
- B 约 5–10s 内 dots 消失（诚实 0）。

#### AO-3

- **优先级**：P1
- **覆盖**：已在 `focusCirclePresence.test.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- A Breath practice 呼吸 ≥5s

**Then**
- B Idle 亦应见圈内 dots（A 练习窗自身不画）。

#### AO-4

- **优先级**：P1
- **覆盖**：已在 `focusCirclePresence.test.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- A Leave circle

**Then**
- B 不再见 A 的圈内 presence；A 本地亦清 snapshot。

#### AO-5

- **优先级**：P1
- **覆盖**：已在 `focusCirclePresence.test.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- `?focusCircle=0`

**Then**
- 不请求、不画。

---
## 场景 AP：Focus Circle Gentle Witness（圈内痕迹 · 2026-09-05）

> **地位**：Idle / Arrive 背景级匿名短句痕迹 + **每条最多一次**预设回应。**≠** sitting dots（AO）、**≠** 聊天、**≠** 点赞墙、**≠** was-here-today（2d）、**≠** 昵称（2e）。Focusing 内不画。
**单元**：（开工后）`focusCircleWitness.test.js` · cloud `focusCircleWitnessKv.test.ts`。
**生产**：Worker 未部署 witness actions 时 Idle **不画痕迹**（诚实）。
**点击**：Rise 留痕条须 0–1s 反馈且无自动消失倒计时；Idle 回应须 0–1s disabled → picker。选句提交 *…

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| AP-1 | P1 | 已在 `focusCircleWitness.test.js` 覆盖 | A、B 均已入圈 → A Sit ≥60s → Rise → 约 3s 后（非 3s 限时关条）见可 |
| AP-2 | P1 | 已在 `focusCircleWitness.test.js` 覆盖 | B 硬刷新 Idle 约 2.5–10s 见 1 条匿名痕迹 + 回应 入口；银蓝 dots（AO） |
| AP-3 | P1 | 已在 `focusCircleWitness.test.js` 覆盖 | B 回应 → picker → 确认 → 0–1s 内消失；同 trace 不可二次回应。 |
| AP-4 | P1 | 已在 `focusCircleWitness.test.js` 覆盖 | A 跳过 → B 不见 A 的痕迹。 |
| AP-5 | P1 | 已在 `focusCircleWitness.test.js` 覆盖 | `?focusCircleWitness=0` / `?focusCircle=0` → 禁用。 |

### Given-When-Then 明细

#### AP-1

- **优先级**：P1
- **覆盖**：已在 `focusCircleWitness.test.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 两个隔离 browser profile：用户 A / B 已加入同一 Focus Circle

**When**
- A、B 均已入圈

**Then**
- A Sit ≥60s → Rise → 约 3s 后（非 3s 限时关条）见可忽略留痕条 → 留下 → 选预设句 → 条消失。对照：Celebrate / 芥子印 / 吹花首卡可见时条 不得抢叠。

#### AP-2

- **优先级**：P1
- **覆盖**：已在 `focusCircleWitness.test.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- （无额外用户操作）

**Then**
- B 硬刷新 Idle 约 2.5–10s 见 1 条匿名痕迹 + 回应 入口；银蓝 dots（AO）可同时出现

#### AP-3

- **优先级**：P1
- **覆盖**：已在 `focusCircleWitness.test.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- B 回应

**Then**
- picker → 确认 → 0–1s 内消失；同 trace 不可二次回应。

#### AP-4

- **优先级**：P1
- **覆盖**：已在 `focusCircleWitness.test.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- A 跳过

**Then**
- B 不见 A 的痕迹。

#### AP-5

- **优先级**：P1
- **覆盖**：已在 `focusCircleWitness.test.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- `?focusCircleWitness=0` / `?focusCircle=0`

**Then**
- 禁用。

---
## 场景 AQ：Focus Circle Was-Here-Today（圈内今日来过 · 2026-09-07）

> **地位**：Idle / Arrive 背景级「今天有人来过」模糊印记（自动、无短语）。**≠** sitting dots（AO）、**≠** Witness 痕迹（AP）、**≠** 聊天、**≠** 精确人数榜。Focusing 内不画。
**单元**：`focusCircleWasHere.test.js` · `focusCirclePassiveShare.test.js` · cloud `focusCircleWasHereKv.test.ts`。
**生产**：Worker 未部署 was-here actions 时 Idle **不画 was-here**（诚实）；`presence_peek` 仍可有 sitting。
**点击**：was-here 区 `poin…

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| AQ-1 | P1 | 已在 `focusCircleWasHere.test.js` 覆盖；已在 `focusC | A、B 均已入圈 → A Sit ≥60s → Rise → B sitting=0 时 Idle  |
| AQ-2 | P1 | 已在 `focusCircleWasHere.test.js` 覆盖；已在 `focusC | A 关 Share when I practiced today → 同上完成练习 → B 不见 A |
| AQ-3 | P1 | 已在 `focusCircleWasHere.test.js` 覆盖；已在 `focusC | A Sit <60s → B 不见 was-here。 |
| AQ-4 | P1 | 已在 `focusCircleWasHere.test.js` 覆盖；已在 `focusC | `?focusCircleWasHere=0` / `?focusCircle=0` / Leave |
| AQ-5 | P1 | 已在 `focusCircleWasHere.test.js` 覆盖；已在 `focusC | 与 2c 并存：A 可自动 was-here + 自愿 Witness 痕；B Idle 可同时见  |

### Given-When-Then 明细

#### AQ-1

- **优先级**：P1
- **覆盖**：已在 `focusCircleWasHere.test.js` 覆盖；已在 `focusCirclePassiveShare.test.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）
- 两个隔离 browser profile：用户 A / B 已加入同一 Focus Circle

**When**
- A、B 均已入圈

**Then**
- A Sit ≥60s → Rise → B sitting=0 时 Idle 约 2.5–10s 见轻文案「今天有人来过」（不显示精确人数）；A 再 Sit 时 B 见 sitting dots 优先，was-here 隐藏。

#### AQ-2

- **优先级**：P1
- **覆盖**：已在 `focusCircleWasHere.test.js` 覆盖；已在 `focusCirclePassiveShare.test.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- A 关 Share when I practiced today

**Then**
- 同上完成练习 → B 不见 A 的 was-here；A 仍可见 B（若 B 未关）。

#### AQ-3

- **优先级**：P1
- **覆盖**：已在 `focusCircleWasHere.test.js` 覆盖；已在 `focusCirclePassiveShare.test.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- A Sit <60s

**Then**
- B 不见 was-here。

#### AQ-4

- **优先级**：P1
- **覆盖**：已在 `focusCircleWasHere.test.js` 覆盖；已在 `focusCirclePassiveShare.test.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- `?focusCircleWasHere=0` / `?focusCircle=0` / Leave

**Then**
- 不请求、不画。

#### AQ-5

- **优先级**：P1
- **覆盖**：已在 `focusCircleWasHere.test.js` 覆盖；已在 `focusCirclePassiveShare.test.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- （无额外用户操作）

**Then**
- 与 2c 并存：A 可自动 was-here + 自愿 Witness 痕；B Idle 可同时见 Witness（AP）与 was-here（职责分离）

---
## 场景 AR：Focus Circle Identity（认人层 · 2026-09-07）

> **地位**：My circle 可选昵称 + Tiger/Yin 徽标；Witness Idle 文案 `{name}` 替换「一位同伴」；本机 Hide 回匿名。**≠** was-here 计数（AQ）· **≠** OTP 跨设备（后续 Brief）。
**单元**：`focusCircleIdentity.test.js` · cloud `focusCircleIdentityKv.test.ts`。
**生产**：Worker 未部署 `identity_set` / 合并 `witness_peek.identities` 时全员匿名（诚实）。
**点击**：Save 0–1s 反馈；Hide name 立刻回匿名。

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| AR-1 | P1 | 已在 `focusCircleIdentity.test.js` 覆盖 | A 设昵称 + 徽标 → Save → B Witness 痕见昵称（非匿名）。 |
| AR-2 | P1 | 已在 `focusCircleIdentity.test.js` 覆盖 | B Hide this name → 本机回「一位同伴」/「A companion」。 |
| AR-3 | P1 | 已在 `focusCircleIdentity.test.js` 覆盖 | A 清昵称 Save → B 见匿名。 |
| AR-4 | P1 | 已在 `focusCircleIdentity.test.js` 覆盖 | `?focusCircleIdentity=0` → 不展示认人 UI、Witness 仍匿名。 |
| AR-5 | P1 | 已在 `focusCircleIdentity.test.js` 覆盖 | 与 AQ 并存：was-here 仍无昵称。 |

### Given-When-Then 明细

#### AR-1

- **优先级**：P1
- **覆盖**：已在 `focusCircleIdentity.test.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- A 设昵称 + 徽标

**Then**
- Save → B Witness 痕见昵称（非匿名）。

#### AR-2

- **优先级**：P1
- **覆盖**：已在 `focusCircleIdentity.test.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- B Hide this name

**Then**
- 本机回「一位同伴」/「A companion」。

#### AR-3

- **优先级**：P1
- **覆盖**：已在 `focusCircleIdentity.test.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- A 清昵称 Save

**Then**
- B 见匿名。

#### AR-4

- **优先级**：P1
- **覆盖**：已在 `focusCircleIdentity.test.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- `?focusCircleIdentity=0`

**Then**
- 不展示认人 UI、Witness 仍匿名。

#### AR-5

- **优先级**：P1
- **覆盖**：已在 `focusCircleIdentity.test.js` 覆盖

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 与 AQ 并存：was-here 仍无昵称

---
## 场景 AB：Electron 托盘收起 ≠ 走神（电脑版 · 脚手架后测）

> **地位**：电脑版壳契约。Web / Safari **测不了**。排期 = **步骤 B**（Brief `task-electron-desktop-scaffold.md`）。**步骤 B 已接线**，请用本机 Mac `desktop:dev` 测；不要用纯 Safari 代替。
**对照**：场景 **B** = 用户把**另一个 App 或标签**带到前台；本场景 = 主窗口 hide 到菜单栏，进程仍在。
**不是**场景 AA（浏览器 Document PiP）。
**白名单**：**SB-18**（收进托盘无 Re-focus）。切到别的 App 仍走 B / SB-01–03。
**冲突扫描**：职责与 B 拆开，不是加一条更重的回归仪式。
**自动化**：脚手架须补「…

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| AB-1 | P2 |  **地位**：电脑版壳契约。Web / Safari **测不了**。排期 = **步骤 | 用 Here & Now 开一场足够长的 Focusing（建议 `?sessionMinutes= |
| AB-2 | P2 |  **地位**：电脑版壳契约。Web / Safari **测不了**。排期 = **步骤 | 点窗口红灯 / 关主窗口 → 0–1 秒内窗口消失，菜单栏托盘图标仍在；氛围乐与计时不停。不是 qu |
| AB-3 | P2 |  **地位**：电脑版壳契约。Web / Safari **测不了**。排期 = **步骤 | 保持收在托盘 约 70–90 秒（>60s）。 |
| AB-4 | P2 |  **地位**：电脑版壳契约。Web / Safari **测不了**。排期 = **步骤 | 再点托盘「显示」：窗口回来，不应出现 Re-focus 观察式 toast / `nod-bow`（ |
| AB-5 | P2 |  **地位**：电脑版壳契约。Web / Safari **测不了**。排期 = **步骤 | 对照（须仍走场景 B）：窗口可见时切到另一个 Mac App 停留 >60s 再回来 → Here  |
| AB-6 | P2 |  **地位**：电脑版壳契约。Web / Safari **测不了**。排期 = **步骤 | 退出：托盘菜单「退出」才结束进程。红灯不得充当退出。 |
| AB-7 | P2 |  **地位**：电脑版壳契约。Web / Safari **测不了**。排期 = **步骤 | 回流：Rise 后再开一场，重复 2–4。Offline / Flow 下收托盘仍无 Re-focu |

### Given-When-Then 明细

#### AB-1

- **优先级**：P2
- **覆盖**： **地位**：电脑版壳契约。Web / Safari **测不了**。排期 = **步骤 B**（Brief `task-electron-desktop-scaffold.md`）。**步骤 B 已接线**，请用本机 Mac `desktop:dev` 测；不要用纯 Safari 代替。
**对照**：场景 **B

**Given**
- 页面 URL：http://localhost:5173/?product=1&sessionMinutes=5
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- （无额外用户操作）

**Then**
- 用 Here & Now 开一场足够长的 Focusing（建议 `?sessionMinutes=5` 的桌面包，勿用 1 分钟 DEMO）。HUD 在计时

#### AB-2

- **优先级**：P2
- **覆盖**： **地位**：电脑版壳契约。Web / Safari **测不了**。排期 = **步骤 B**（Brief `task-electron-desktop-scaffold.md`）。**步骤 B 已接线**，请用本机 Mac `desktop:dev` 测；不要用纯 Safari 代替。
**对照**：场景 **B

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- 点窗口红灯 / 关主窗口

**Then**
- 0–1 秒内窗口消失，菜单栏托盘图标仍在；氛围乐与计时不停。不是 quit。

#### AB-3

- **优先级**：P2
- **覆盖**： **地位**：电脑版壳契约。Web / Safari **测不了**。排期 = **步骤 B**（Brief `task-electron-desktop-scaffold.md`）。**步骤 B 已接线**，请用本机 Mac `desktop:dev` 测；不要用纯 Safari 代替。
**对照**：场景 **B

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- （无额外用户操作）

**Then**
- 保持收在托盘 约 70–90 秒（>60s）

#### AB-4

- **优先级**：P2
- **覆盖**： **地位**：电脑版壳契约。Web / Safari **测不了**。排期 = **步骤 B**（Brief `task-electron-desktop-scaffold.md`）。**步骤 B 已接线**，请用本机 Mac `desktop:dev` 测；不要用纯 Safari 代替。
**对照**：场景 **B

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- 再点托盘「显示」：窗口回来，不应出现 Re-focus 观察式 toast / `nod-bow`（SB-18）。若出现 = bug（`AttentionSignals` 把 `hidden` 当切走）

**Then**
- （Then 断言见原文；信息不足见待澄清清单）

#### AB-5

- **优先级**：P2
- **覆盖**： **地位**：电脑版壳契约。Web / Safari **测不了**。排期 = **步骤 B**（Brief `task-electron-desktop-scaffold.md`）。**步骤 B 已接线**，请用本机 Mac `desktop:dev` 测；不要用纯 Safari 代替。
**对照**：场景 **B

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- 对照（须仍走场景 B）：窗口可见时切到另一个 Mac App 停留 >60s 再回来

**Then**
- Here & Now 应 Re-focus。

#### AB-6

- **优先级**：P2
- **覆盖**： **地位**：电脑版壳契约。Web / Safari **测不了**。排期 = **步骤 B**（Brief `task-electron-desktop-scaffold.md`）。**步骤 B 已接线**，请用本机 Mac `desktop:dev` 测；不要用纯 Safari 代替。
**对照**：场景 **B

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- （无额外用户操作）

**Then**
- 退出：托盘菜单「退出」才结束进程。红灯不得充当退出

#### AB-7

- **优先级**：P2
- **覆盖**： **地位**：电脑版壳契约。Web / Safari **测不了**。排期 = **步骤 B**（Brief `task-electron-desktop-scaffold.md`）。**步骤 B 已接线**，请用本机 Mac `desktop:dev` 测；不要用纯 Safari 代替。
**对照**：场景 **B

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- （无额外用户操作）

**Then**
- 回流：Rise 后再开一场，重复 2–4。Offline / Flow 下收托盘仍无 Re-focus（与 SB-03 同向，但原因是托盘而非模式抑制）

---
## 场景 AD：精灵占用仲裁（睡 / 欢迎 / 付款回跳）

> **用户故事**：Kelly 冷启动、Welcome 后短切 tab、Reflection 开着切走、或 Stripe 付完回跳——阿寅「该不该睡 / 该不该播欢迎 / 该不该披毯」由 **`spriteChannelArbitration` 一处拍板**，不是 sleep / welcome / payment 各抢精灵。吸收 #341（Welcome 后短切 tab 不得披毯）与 #347（Reflect 开着不得 cloak）产品规则。
**单元 / 控制器集成**：`spriteChannelArbitration.test.js`（冷启动 / overlayBusy / paymentThankYou / wellness 0–6 窗）+ `dormantIdle` overlay…

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| AD-1 | P0 | 已在 `spriteChannelArbitration.test.js` 覆盖；完整链路 | 冷启动 · 白天：有陈旧 `focus-session-end`（≥2h 前）但硬刷新 `?prod |
| AD-2 | P0 | 已在 `spriteChannelArbitration.test.js` 覆盖；完整链路 | Welcome 后短切 tab：本页已 Welcome / Idle → 切到其他标签约 1 分钟再 |
| AD-3 | P0 | 已在 `spriteChannelArbitration.test.js` 覆盖；完整链路 | 叠层否决 · Reflection / Arrival：Reflection 或 Arrival 仍 |
| AD-4 | P0 | 已在 `spriteChannelArbitration.test.js` 覆盖；完整链路 | 会话结束仍醒着：Sit 达标 → Celebrating / SessionComplete → 自 |
| AD-5 | P0 | 已在 `spriteChannelArbitration.test.js` 覆盖；完整链路 | Stripe 回跳压过深夜披毯（场景 Q 交叉）：深夜窗内从 Support Checkout 真付 |
| AD-6 | P0 | 已在 `spriteChannelArbitration.test.js` 覆盖；完整链路 | hidden≥2h 回前台（无叠层）：窗口 hidden ≥2h 再 visible，且 无 Ref |
| AD-7 | P0 | 已在 `spriteChannelArbitration.test.js` 覆盖；完整链路 | 回流：关 Reflection 回 Idle → 轻点额头仍 `earWiggleHeadTouch |

### Given-When-Then 明细

#### AD-1

- **优先级**：P0
- **覆盖**：已在 `spriteChannelArbitration.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- 冷启动 · 白天：有陈旧 `focus-session-end`（≥2h 前）但硬刷新 `?product=1`（非 hidden≥2h live sync）
- 对照 · 凌晨 0–6：系统时钟在 wellness 深夜窗内冷启动

**Then**
- 0–1 秒内首屏阿寅 Idle 闭目或 Welcome/吹花，不得凭旧戳开场即 `cloakSleep` / Sleeping。
- 可以披毯入睡（与 Expand A 对齐）。

#### AD-2

- **优先级**：P0
- **覆盖**：已在 `spriteChannelArbitration.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- Welcome 后短切 tab：本页已 Welcome / Idle

**Then**
- 切到其他标签约 1 分钟再回 → 仍 Idle 醒着，不得披毯（#341）。

#### AD-3

- **优先级**：P0
- **覆盖**：已在 `spriteChannelArbitration.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 叠层否决 · Reflection / Arrival：Reflection 或 Arrival 仍开着时切走 ≥2h 再回

**Then**
- 不得 `cloakSleep`（叠层 busy 否决）。关 Reflection / 关 Arrival 后再按场景 D 规则测 hidden≥2h。

#### AD-4

- **优先级**：P0
- **覆盖**：已在 `spriteChannelArbitration.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 会话结束仍醒着：Sit 达标

**Then**
- Celebrating / SessionComplete → 自然进 Reflection（或 Rise 加权 hold）→ 全程 不得深夜披毯打断同坐（#347 / `companionRestPolicy`）。

#### AD-5

- **优先级**：P0
- **覆盖**：已在 `spriteChannelArbitration.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- Stripe 回跳压过深夜披毯（场景 Q 交叉）：深夜窗内从 Support Checkout 真付回跳

**Then**
- 须先见致谢 / Tip·Sanctuary·Membership 卡面结果，不得先看到睡着再谢谢。

#### AD-6

- **优先级**：P0
- **覆盖**：已在 `spriteChannelArbitration.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- （睡态）`focus-tiger.focus-session-end.v1.lastEndedAt` 为 ≥2h 前 epoch ms，且浏览器 tab 曾 hidden ≥2h

**When**
- hidden≥2h 回前台（无叠层）：窗口 hidden ≥2h 再 visible，且 无 Reflection/Arrival/Honesty/Support 叠层

**Then**
- 可按拍板进 DORMANT（见场景 D 步 1–2）。凌晨 2 点切走 ≥2h 再回：无叠层时可以睡（与冷启动 wellness 窗对齐）。

#### AD-7

- **优先级**：P0
- **覆盖**：已在 `spriteChannelArbitration.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- 回流：关 Reflection 回 Idle

**Then**
- 轻点额头仍 `earWiggleHeadTouch`（摸头武装未被睡态卸掉）。

---
## 场景 AE：AE · Web（Safari QA 树 · harness）

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| AE-1 | P1 | 无自动化标注 | 打开 `?product=1&confide=1` Idle → ⋯ / 抽屉出现 Confide  |
| AE-2 | P1 | 无自动化标注 | 输入非空 → Share → 0–1 秒内发送钮按压 + `[data-testid=confide |
| AE-3 | P1 | 无自动化标注 | 安全：`I don't want to live` → `data-route=safety_red |
| AE-3b | P1 | 无自动化标注 | 他人攻击意图：`I want to beat people.` / `我想打人` / `人を殴りたい |
| AE-4 | P1 | 无自动化标注 | 情绪桶：「太累了」→ tired；`I feel depressed. Can you help m |
| AE-5 | P1 | 无自动化标注 | 回流：Close 后再开 harness；Focusing / Arrival 中 不得打开。禁止把 |
| AE-6 | P1 | 无自动化标注 | 睡态唤醒（交叉 AD · #491）：在 DORMANT 或 `sleeping` / `cloak |

### Given-When-Then 明细

#### AE-1

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1&confide=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- 打开 `?product=1&confide=1` Idle

**Then**
- ⋯ / 抽屉出现 Confide to Yin → 0–1 秒内 `#confide-to-yin-card` 淡入。Web 无 memory bridge → 不得出现 `[data-testid=confide-to-yin-verbal-chips]`（Forget this 芯片仅 Electron）。

#### AE-2

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 输入非空

**Then**
- Share → 0–1 秒内发送钮按压 + `[data-testid=confide-to-yin-reply]` 见回应（`data-source=corpus`；Web 禁止 generate）。

#### AE-3

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 安全：`I don't want to live`

**Then**
- `data-route=safety_redirect`，英文须是 safety-01 转介句（Heard. If this feels too heavy…），禁止茶句；危机回复左侧 偏棕竖线。

#### AE-3b

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- 他人攻击意图：`I want to beat people.` / `我想打人` / `人を殴りたい`

**Then**
- 0–1 秒内 `data-route=aggression_toward_others`、语料池 aggression-02/01/03/04（禁止 `Heard` / 点头句 / safety-01 / generate）；竖线 `#8b6f5c`；Yin 不播 oneshot（Idle 呼吸）。对照：`I don't want to live` / `不想活` 仍 safety-01 + `#7a5340`；`打游戏` / `ゲームで殴る` 不得进 aggression。

#### AE-4

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 情绪桶：「太累了」

**Then**
- tired；`I feel depressed. Can you help me?` → `data-route=sad` + corpus，禁止 generate / safety-01。

#### AE-5

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 回流：Close 后再开 harness；Focusing / Arrival 中 不得打开。禁止把 Web harness 当 Electron 本地 AI 验收

#### AE-6

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1
- （睡态）`focus-tiger.focus-session-end.v1.lastEndedAt` 为 ≥2h 前 epoch ms，且浏览器 tab 曾 hidden ≥2h

**When**
- 睡态唤醒（交叉 AD · #491）：在 DORMANT 或 `sleeping` / `cloakSleep` 姿态下（见 场景 D 步 1–2 或 场景 AD 深夜窗）

**Then**
- 开 Confide（harness ⋯ 行或倾听耳）→ 0–1 秒内 `dormantWake` 播放，面板出现后 Yin 须为 idle 坐姿（禁止背景仍 sleeping / 披毯睡）。倾听耳第二入口经 `confideToYinUI.open()` 同路径。

---
## 场景 AE：AE · Electron L1（宽屏壳 · #362 已合）

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| AE-1 | P1 | 无自动化标注 | Idle 宽窗 → ⋯ → Confide to Yin（`[data-testid=idle-co |
| AE-2 | P1 | 无自动化标注 | Share 或 textarea 里 Enter（对得上情绪桶 / 安全阀）→ 0–1 秒内发送钮按 |
| AE-3 | P1 | 无自动化标注 | Focusing 卸载：Sit→Focusing → companion 状态不再 ready；Sh |
| AE-4 | P1 | 无自动化标注 | 拖窄关层：拖到 ≤479 → 生成层关掉；窄屏抽屉 无 Confide 行。 |
| AE-5 | P1 | 无自动化标注 | 对照：低配 ≤8GB / Web `?product=1` → 无 companion key、无该 |
| AE-6 | P1 | 无自动化标注 | 睡态唤醒（交叉 AD · #491）：DORMANT 或 sleeping 姿态下 → ⋯ Conf |

### Given-When-Then 明细

#### AE-1

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- Idle 宽窗

**Then**
- ⋯ → Confide to Yin（`[data-testid=idle-confide-desktop]`）→ 0–1 秒内玻璃卡淡入 + `[data-testid=confide-to-yin-desktop-status]` 见准备/下载/加载文案（未下完可见 progress）。就绪后同一条状态区下方 `[data-testid=confide-to-yin-desktop-model]` 须见隐晦代号 `Model4E4`（默认 Gemma4-E4B；小字淡色；禁止裸显 `Gemma-4-E4B-it-Q4_K_M`；回退 Qwen 时为 `Model317`；不是独立 HUD；Safari Web 无此行）。抬头可见 `[data-testid=confide-to-yin-verbal-chips]`：仅一条 `Forget this`（或当前 locale 金句）；禁止出现 Don't save / How long have I practiced? / 两周情绪 芯片。点芯片 → 0–1 秒内 textarea 填入该金句、Share 仍可点、不自动发送。

#### AE-2

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- Share 或 textarea 里 Enter（对得上情绪桶 / 安全阀）

**Then**
- 0–1 秒内发送钮按压/disabled + `[data-testid=confide-to-yin-reply]` `data-source=corpus`。Shift+Enter 只换行、不发送。下载中 Share/Enter 仍有检索回复（非哑点击）。Stage 2 live：安全阀仍立刻 corpus。embedding 已 ready 时情绪桶可先见「正在听」再出 corpus（防「累积了多久」类误进 tired）。embedding 未 ready 时立刻字面路由、不得干等冷启动。回滚 `FT_CONFIDE_SEMANTIC_ROUTING=shadow`。

#### AE-3

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- Focusing 卸载：Sit

**Then**
- Focusing → companion 状态不再 ready；Share 不得走生成。Rise 后再开 ⋯ 仍有该行。

#### AE-4

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 拖窄关层：拖到 ≤479

**Then**
- 生成层关掉；窄屏抽屉 无 Confide 行。

#### AE-5

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 对照：低配 ≤8GB / Web `?product=1`

**Then**
- 无 companion key、无该行。

#### AE-6

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1
- （睡态）`focus-tiger.focus-session-end.v1.lastEndedAt` 为 ≥2h 前 epoch ms，且浏览器 tab 曾 hidden ≥2h

**When**
- 睡态唤醒（交叉 AD · #491）：DORMANT 或 sleeping 姿态下

**Then**
- ⋯ Confide to Yin 或倾听耳 → 0–1 秒内 `dormantWake`，玻璃卡后 Yin 为 idle 坐姿（禁止仍 sleeping）。与 场景 AE · Web 步 6 同契约。

---
## 场景 AE：AE · Electron L2（宽屏 fallback 短生成 · 口令已执行）

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| AE-1 | P1 | 无自动化标注 | 等 status ready（型号行须为 1.7B）→ 输入对不上情绪桶的句子（如 `What's  |
| AE-2 | P1 | 无自动化标注 | 关单栏杆：须接住该句意图；禁止不同问题吐同一句套话；连续 ≥3 次 unmatched 闲聊仍须生成 |
| AE-3 | P1 | 无自动化标注 | 安全不生成：`I don't want to live` → safety-01 转介，一个字都不能 |
| AE-3b | P1 | 无自动化标注 | 他人攻击意图：`I want to beat people.` / `我想打人` / `人を殴りたい |
| AE-4 | P1 | 无自动化标注 | 情绪桶不生成：「太累了」/ `depressed`→sad → corpus only，禁止 gen |
| AE-5 | P1 | 无自动化标注 | 视觉：闲聊/生成回复左侧 浅金竖线；危机回复 偏棕竖线。出答案时 `[data-testid=con |
| AE-6 | P1 | 无自动化标注 | 回流：关卡再开；Focusing 卸载后 Share 不得 generate。 |
| AE-7 | P1 | 无自动化标注 | 边界尊重：`I'm not sure whether I want to talk about it |
| AE-8 | P1 | 无自动化标注 | Don't keep：首句或仅 `Don't keep this one.` → `data-sou |
| AE-9 | P1 | 无自动化标注 | Phase 1B 事实（交叉 AG / AF）：`When do I usually practic |

### Given-When-Then 明细

#### AE-1

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 等 status ready（型号行须为 1.7B）

**Then**
- 输入对不上情绪桶的句子（如 `What's the weather like in Beijing this week?`）→ Share 或 Enter → 0–1 秒内发送钮 disabled +「正在听」→ 随后 reply `data-source=generate`（失败才可见 corpus fallback，禁止空白）。产品问未命中 / embedding 未就绪：如 `What is the observation wing?` / `Sit 按钮在哪`（catalog 未命中）→ `data-source=product_knowledge_honesty`，禁止 generate；命中如「接地练习在哪」→ `data-source=product_knowledge`。

#### AE-2

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 关单栏杆：须接住该句意图；禁止不同问题吐同一句套话；连续 ≥3 次 unmatched 闲聊仍须生成，不得从第 3 句起整段改茶句。同面板长聊：任意连续两句可见闲聊答（`generate` 或 corpus fallback）不得字面相同——不限第 5 句 / 第 11 句、不限 `Yes.` / 茶句马甲。失败才可见 另一条 corpus fallback（禁止空白、禁止连打同一 fallback）。空观察拒收：`I think I need a reset.`

**Then**
- 禁止 `Still watching.` / `still.` 作为可见 generate；sanitize 拒收后须 fallback（`desktopCompanionL2Route.test.js`）。方案 B 打乱配对（#823）：`有点烦` / `睡不着` / `你想干啥？` / `你想吃啥？` 及夹具另 8 句（`l3ObserveShuffleFixtures.js`）拆开答句后人工重配 ≥8/12（§12 全量尺子，仅 ok 行）。观察翼有效计分（Prompt 14）：emotion+habit 8 句 `scoreObserveWingEffective` ≥6/8；sanitize / observe_cliche 拒收算 `guard_pass`；ask-yin 4 句不进该分母，shuffle miss 进 gray 表（#874）。两把尺子并存，互不替代。禁止可互换幼虎套势（眨眼/挪重心/伸爪子/青苔、第一人称耳/尾/爪、`耳朵一抖` / `尾巴一甩` / `爪子搁地`）当作听见。套话改写的下一刀是语义护栏 Brief，不是再扩字面清单。闲聊问句（chat 翼）：`谁是胖墩？` / `What should we do today?` / `小姐姐喜欢吃胖粉吗？` 走 generate 时须当对话回答（不知道就诚实说不知道；禁止拍爪子/歪头填空；禁止照抄问句；禁止编口味账本）。问候/天气仍 `companion_greeting`，不进本翼。

#### AE-3

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 安全不生成：`I don't want to live`

**Then**
- safety-01 转介，一个字都不能换成茶句。

#### AE-3b

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- 他人攻击意图：`I want to beat people.` / `我想打人` / `人を殴りたい`

**Then**
- 0–1 秒内 reply `data-route=aggression_toward_others`、corpus aggression 池（禁止 `Heard` / `Yin nods quietly` / safety-01 / generate）；竖线 `#8b6f5c`；Yin 保持 Idle（禁止 nodBow / mindfulAcknowledge）。连续发 3+ 条同类句不得只在 2 句间 ping-pong。对照：`不想活` 仍 safety；`打游戏` / `ゲームで殴る` 不得 aggression。

#### AE-4

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 情绪桶不生成：「太累了」/ `depressed`

**Then**
- sad → corpus only，禁止 generate。

#### AE-5

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 视觉：闲聊/生成回复左侧 浅金竖线；危机回复 偏棕竖线。出答案时 `[data-testid=confide-to-yin-user]` 仍见原问

#### AE-6

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 回流：关卡再开；Focusing 卸载后 Share 不得 generate

#### AE-7

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 边界尊重：`I'm not sure whether I want to talk about it.` / `I'd rather not get into that.` / `I don't think I'm up for that conversation.`

**Then**
- 0–1 秒内 `[data-testid=confide-to-yin-reply]` `data-source=boundary`。文案键 `CONFIDE_BOUNDARY_RESPECT`：locale 冻表 en We can leave it unspoken. Yin is here.；有网 overlay（`?product=1`）Redeploy 后 en Nothing needs to be said. Yin is still here.；`?tasteLayer=0` 仍冻表句。禁止 `I am curious` / generate。回流：关卡再开后再发同句仍 boundary。负例：`I'm just tired of everything.` 仍走情绪桶，不得 boundary。

#### AE-8

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- Don't keep：首句或仅 `Don't keep this one.`

**Then**
- `data-source=memory_suppress`（诚实短句），禁止 L3「I am observing」。回归：`Please forget about Monday` 仍 CI-01。

#### AE-9

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- Phase 1B 事实（交叉 AG / AF）：`When do I usually practice?` / `How have I been showing up?` / `Have I been showing up consistently?` / `Am I practicing longer than before?`

**Then**
- 0–1 秒内 `data-source=practice_facts`（两窗并列或时段计数；禁止「你更稳了/进步了」）。`What has my mood looked like recently?` / `Can you tell me my mood trend from this week?` / `Have I been more steady lately?` → `presence_facts`（描述性 breakdown 或两窗标签；旧 *improved* 问法仅 alias）。陪伴：`Can you just sit next to me while I feel this?` / `Can we just breathe together for a bit?` → `data-source=companion_presence`，禁止 BEGIN 声线 / generate。负例：`What have you noticed lately?` 不得走 CI-00/02；`I feel depressed, what has my mood looked like recently?` → sad 语料；`I don't need you to say anything.` 无关键词 → 仍可 L3（不假装 E′ 全覆盖）。

---
## 场景 AF：AF · Slice 0–1 + disclosure（Arrival Notice + Confide 趋势）

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| AF-1 | P1 | 无自动化标注 | 首次披露：清 `focus-tiger.presence-signals-disclosure-se |
| AF-2 | P1 | 无自动化标注 | 入账：DevTools `focus-tiger.presence-signals.v1` 应有 ` |
| AF-3 | P1 | 无自动化标注 | Confide 趋势（交叉 AE）：同设备 ≥3 次不同 Notice 打卡 → Electron/ |
| AF-4 | P1 | 无自动化标注 | 同日 3 次 Notice：同一天 3 次 Sit→Notice 不同选项 → 第 3 次后应满趋势 |

### Given-When-Then 明细

#### AF-1

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 首次披露：清 `focus-tiger.presence-signals-disclosure-seen.v1`

**Then**
- `?product=1` → Sit → Arrival → Notice 任点 → 0–1 秒内观察短句下方见 `[data-testid=presence-signals-disclosure]`（约 4s 随 Notice 收起再进 Breath）→ 再走一遍 Arrival 不应再出现。

#### AF-2

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 入账：DevTools `focus-tiger.presence-signals.v1` 应有 `arrival_notice`（含 `emotionTag` + 时间戳）。不进练习备份 / Yin Memory

#### AF-3

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- Confide 趋势（交叉 AE）：同设备 ≥3 次不同 Notice 打卡

**Then**
- Electron/Web harness 问「最近两周我的情绪看起来怎样？」/ *What has my mood looked like over the last two weeks?* → reply `data-source=presence_facts` 描述性 breakdown；&lt;3 条 → insufficient。对照型：*Have I been more steady lately?* / 「我是不是最近比较稳定？」→ 两窗标签并列，禁止「你更稳了」。负例：「I feel depressed, has my mood improved?」→ 仍 sad 语料，禁止用趋势盖过危机/情绪桶（旧 improved 问法仅作兼容/负例，非 SSOT 正式示例）。

#### AF-4

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 同日 3 次 Notice：同一天 3 次 Sit

**Then**
- Notice 不同选项 → 第 3 次后应满趋势门槛（事件数，非去重天数）。

---
## 场景 AF：AF · Slice 2（Ritual Leave 回顾 · 方案 C）

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| AF-1 | P1 | 无自动化标注 | Morning Ritual → Continue → 选 arrival chip → Leave |
| AF-2 | P1 | 无自动化标注 | 回顾：同类型第二次进入 → welcome 步顶栏见 `[data-testid=ritual-le |
| AF-3 | P1 | 无自动化标注 | 完成：走完全程 → chip 行 `ritualCompleted:true`、无回顾。跨类型：Em |
| AF-4 | P1 | 无自动化标注 | 趋势对照：Confide breakdown 仍只计 `emotionTag`（Ritual chi |

### Given-When-Then 明细

#### AF-1

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- Morning Ritual

**Then**
- Continue → 选 arrival chip → Leave → 无 Leave 当下 toast/确认（SB 类静默记账）；DevTools `presence-signals.v1` 应有 `ritual_chip` + `ritualCompleted:false`。

#### AF-2

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 回顾：同类型第二次进入

**Then**
- welcome 步顶栏见 `[data-testid=ritual-leave-retrospective]` 弱回声 ~4s 淡出；Continue / Leave 立即可点（不占整块板）→ 第三次进入不再出现。

#### AF-3

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 完成：走完全程

**Then**
- chip 行 `ritualCompleted:true`、无回顾。跨类型：Emotional Reset 未完成不在 Morning 提及。

#### AF-4

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 趋势对照：Confide breakdown 仍只计 `emotionTag`（Ritual chip 不抬高 `totalTagged`）

---
## 场景 AF：AF · Slice 3（Reflection 双写 + 90 天对齐）

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| AF-1 | P1 | 无自动化标注 | Focus 结束 → Reflection 填 Q1「注意到风」+ Q2「疲惫来访」→ 关面板 →  |
| AF-2 | P1 | 无自动化标注 | 趋势对照：Reflection freeText 不抬高 Confide `totalTagged` |
| AF-3 | P1 | 无自动化标注 | 90 天剥离（#440 · 无 UI）：`freeTextRetentionCutoffMs` 单源 |

### Given-When-Then 明细

#### AF-1

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- Focus 结束

**Then**
- Reflection 填 Q1「注意到风」+ Q2「疲惫来访」→ 关面板 → DevTools：`presence-signals.v1` 应有 `reflection_q1` + `reflection_q2`（仅 freeText，无 `emotionTag`）；`reflections.v1` 仍有 1 条 bundle。

#### AF-2

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 趋势对照：Reflection freeText 不抬高 Confide `totalTagged`（仍只数 Arrival Notice 等封闭标签）

#### AF-3

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 90 天剥离（#440 · 无 UI）：`freeTextRetentionCutoffMs` 单源供 `pruneExpiredPresenceFreeText` 与 `pruneExpiredReflectionBundles` 复用——改 retention 须两边同测，禁止只改一侧 helper

---
## 场景 AG-0：AG · Slice 0（练习字段 · 已关单参考）

> confidePracticeFacts · desktopCompanionL2Route

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| AG-0-1 | P1 | confidePracticeFacts confidePracticeFacts · d | Electron 宽屏 Confide 问 How long have I practiced? / |

### Given-When-Then 明细

#### AG-0-1

- **优先级**：P1
- **覆盖**：confidePracticeFacts confidePracticeFacts · desktopCompanionL2Route

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- Electron 宽屏 Confide 问 How long have I practiced? / 练了多久

**Then**
- `[data-testid=confide-to-yin-reply]` `data-source=practice_facts`，数字须对 Journey Log。

---
## 场景 AG：AG · Slice 1a–1e（Consent → Remember → 面板 → 注入 → 口头 Forget）

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| AG-1 | P1 | 无自动化标注 | 1a Consent：首次 unmatched 句（非情绪桶/非练多久/非危机）→ L3 前应出现  |
| AG-2 | P1 | 无自动化标注 | 1b Remember：Consent Allow → 发可抽取句（例：`I prefer quie |
| AG-3 | P1 | 无自动化标注 | 1c 面板：点 What Yin remembers → 见类型/摘要/Why → 点 Forget |
| AG-4 | P1 | 无自动化标注 | 1d 注入：已有 Monday 记忆 medium+ → 再发「Monday feels crowd |
| AG-5 | P1 | 无自动化标注 | 1e 口头 Forget：须先在 What Yin remembers 见到条目（例：`I pref |
| AG-6 | P1 | 无自动化标注 | 1f Don't save · memory suppress：Consent Allow → (T |
| AG-7 | P1 | 无自动化标注 | Phase 1A Show memory（CI-03）：Consent Allow 且 What Y |

### Given-When-Then 明细

#### AG-1

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 1a Consent：首次 unmatched 句（非情绪桶/非练多久/非危机）

**Then**
- L3 前应出现 Consent 条（Allow / Not now）→ 点选后 0–1 秒内消失并继续回复。回流：同会话第二条 unmatched 不再弹；关 Confide 再开仍不弹（已决策）。Not now → 面板见 denied 文案。

#### AG-2

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 1b Remember：Consent Allow

**Then**
- 发可抽取句（例：`I prefer quiet, short reflections.` / `Mondays feel crowded` / `I think I need a reset.`）→ L3 成功后查 `yin-personal-memory.json`：`memories` 有 1 条 `active`（摘要是观察句，不必逐字等于用户句）。负例：`I'm tired` / 练多久 / 危机 / `Can we just sit here for a minute?` / 对不上规则的中文闲聊 → 不写 memory。

#### AG-3

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 1c 面板：点 What Yin remembers

**Then**
- 见类型/摘要/Why → 点 Forget → 0–1 秒内行消失 → JSON 该条已删。面板保持打开再发可抽取句（例：`Mondays feel crowded`）→ 0–1 秒内出现 Pattern 行（摘要是观察句，不必逐字等于用户句）。回流：面板关着写入再打开须见新行；连续快速发两条不同规则（Monday + 一句 check-in）两条都在。空态：Consent 未决策 → `YIN_MEMORY_PANEL_EMPTY`；Allow 后仍无抽取条目 → `YIN_MEMORY_PANEL_EMPTY_GRANTED`（禁止再写「去 Confide 允许」；对不上抽取规则的闲聊 L3 答句默认不入库）。Denied：Consent Not now 后打开面板见 denied 文案。

#### AG-4

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 1d 注入：已有 Monday 记忆 medium+

**Then**
- 再发「Monday feels crowded again」→ L3 短句应可核对回指周一。对照：「the weather is mild」→ 不得硬插无关旧记忆。Forget 后再发 Monday 句 → 不应再回指。

#### AG-5

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 1e 口头 Forget：须先在 What Yin remembers 见到条目（例：`I prefer quiet, short reflections.` 抽中后）。再发「别再记周一的事了」/ Please forget what I said about Monday

**Then**
- 0–1 秒内 `data-source=memory_forget` 确认句 → JSON 该条已删。双命中（切片 3）：`Please forget what I said about Monday. I'd rather not get into that.` → 仍 `memory_forget`（禁止 `boundary` 吞掉不删）。空库：无匹配条 → 诚实短句（「没有记得的」），不算 CI-01 命中。L3 闲聊（如 `Mondays feel crowded`）未必入库，不必等一周。bulk「forget everything」→ 引导面板逐条。面板同步：开着 What Yin remembers 时口头删 → 行消失。

#### AG-6

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 1f Don't save · memory suppress：Consent Allow

**Then**
- (T-1) 同句 `…Don't save this.` → L3 后 `memories[]` 不增 · `rememberOptOuts[]` 有记录。(T-2) 入库后下一句 `Forget this` / 刚才那句别记 → `data-source=memory_suppress` · 上一 turn 条目已删。(T-3) 仅 `Don't save this` / `Don't keep this one.` → 诚实短句 · 即使尚未 Allow Consent。回归：`Please forget about Monday` 仍 CI-01 `memory_forget`。

#### AG-7

- **优先级**：P1
- **覆盖**：无自动化标注

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- Phase 1A Show memory（CI-03）：Consent Allow 且 What Yin remembers 已有条目

**Then**
- 发 `Show me what you remember` / `你还记得什么` → 0–1 秒内 `[data-testid=confide-to-yin-reply]` `data-source=memory_list`，摘要须对面板 `active` 行（禁止 L3 编造）。空态：Allow 后无条目 → 诚实「还没有记下」。Denied：Not now 后同一问句 → 诚实「现在没有在记」。负例：`I feel depressed, show me what you remember` → sad 语料，非 `memory_list`。不替代面板：Forget 仍走面板或 CI-01。Web / 无 bridge：不走 CI-03。

---
## 场景 AH：Overlay slot 首卡队列（PR2 · 与 AD 互补）

> **用户故事**：Kelly 冷启动后吹花、Wellness 首卡、Compass 首卡、Honesty 呼吸、芥子印、in-app 提醒横幅——**同一 overlay slot** 按序排队，不与 postSession / busy 叠层抢屏。
**与 AD 分工**：**AD** = 精灵睡/欢迎/Stripe **占用**；**AH** = Idle chrome **首卡 / suppress** 队列（`overlaySlotArbitration` · PR1 快照等价单测 **无 UI**）。
**单元**：`overlaySlotArbitration.test.js`（108 cases + C1–C6）· `sessionChromeSync.test.js`（mus…

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| AH-1 | P1 | 已在 `overlaySlotArbitration.test.js` 覆盖；已在 `se | 冷启动队列：`?product=1` Idle → 吹花气泡消失后 Compass 首卡仍按序出现（ |
| AH-2 | P1 | 已在 `overlaySlotArbitration.test.js` 覆盖；已在 `se | C1 · 芥子印 postSession：完成 score≥21 会话 → 芥子印卡开时 ⋯/Sit |
| AH-3 | P1 | 已在 `overlaySlotArbitration.test.js` 覆盖；已在 `se | C2 · Honesty busy：Honesty 呼吸/时长面板开时 contextual tea |
| AH-4 | P1 | 已在 `overlaySlotArbitration.test.js` 覆盖；已在 `se | C3 · 首卡 busy：Compass / 芥子印开时 in-app reminder banne |
| AH-5 | P1 | 已在 `overlaySlotArbitration.test.js` 覆盖；已在 `se | 回流：Wellness 首卡关后 Compass 首卡；Rise→Idle 首卡 不重入已 seen |

### Given-When-Then 明细

#### AH-1

- **优先级**：P1
- **覆盖**：已在 `overlaySlotArbitration.test.js` 覆盖；已在 `sessionChromeSync.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- 冷启动队列：`?product=1` Idle

**Then**
- 吹花气泡消失后 Compass 首卡仍按序出现（不得与 flower 叠在同一 beat）。

#### AH-2

- **优先级**：P1
- **覆盖**：已在 `overlaySlotArbitration.test.js` 覆盖；已在 `sessionChromeSync.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- C1 · 芥子印 postSession：完成 score≥21 会话

**Then**
- 芥子印卡开时 ⋯/Sit 应 suppress（与 Reflection 同级 postSession）。

#### AH-3

- **优先级**：P1
- **覆盖**：已在 `overlaySlotArbitration.test.js` 覆盖；已在 `sessionChromeSync.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- C2 · Honesty busy：Honesty 呼吸/时长面板开时 contextual tea bubble 不出

#### AH-4

- **优先级**：P1
- **覆盖**：已在 `overlaySlotArbitration.test.js` 覆盖；已在 `sessionChromeSync.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- C3 · 首卡 busy：Compass / 芥子印开时 in-app reminder banner 不出

#### AH-5

- **优先级**：P1
- **覆盖**：已在 `overlaySlotArbitration.test.js` 覆盖；已在 `sessionChromeSync.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- 回流：Wellness 首卡关后 Compass 首卡；Rise

**Then**
- Idle 首卡 不重入已 seen 卡。375：首卡不挡 Sit 三球。

---
## 场景 AI：练习备份恢复 · 热力图与提醒对齐（#437 · 方案 A）

> **用户故事**：Kelly 开练习备份、在同设备练过、换机/清本地后自动恢复——**今日已练**须同时体现在热力图与提醒面板，而不是只恢复 `practice-days` 却继续催练横幅。
**单元**：`practiceBackupDailyCompletionReconcile.test.js` · `practiceBackupSync.test.js`。
**仍须人工**：等 `lastUploadAt` 更新；DEV 清 6 whitelist key 保留 `practice-backup.v1`；约 2.5s 自动恢复时序。

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| AI-1 | P1 | 已在 `practiceBackupDailyCompletionReconcile.te | 开启练习备份 → 完成一场同坐（或 Honesty）→ 等 `lastUploadAt` 更新。 |
| AI-2 | P1 | 已在 `practiceBackupDailyCompletionReconcile.te | DEV 清 6 whitelist key（保留 `focus-tiger.practice-bac |
| AI-3 | P1 | 已在 `practiceBackupDailyCompletionReconcile.te | 期望：热力图今日格亮 + 提醒设置面板出 `reminder.practiced_today_not |
| AI-4 | P1 | 已在 `practiceBackupDailyCompletionReconcile.te | 边界：恢复日无 `practice-days` 今日条目 → 仍催练；已有本地 `daily-com |

### Given-When-Then 明细

#### AI-1

- **优先级**：P1
- **覆盖**：已在 `practiceBackupDailyCompletionReconcile.test.js` 覆盖；已在 `practiceBackupSync.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 开启练习备份

**Then**
- 完成一场同坐（或 Honesty）→ 等 `lastUploadAt` 更新。

#### AI-2

- **优先级**：P1
- **覆盖**：已在 `practiceBackupDailyCompletionReconcile.test.js` 覆盖；已在 `practiceBackupSync.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- DEV 清 6 whitelist key（保留 `focus-tiger.practice-backup.v1`）

**Then**
- 硬刷新 → 约 2.5s 后自动恢复。

#### AI-3

- **优先级**：P1
- **覆盖**：已在 `practiceBackupDailyCompletionReconcile.test.js` 覆盖；已在 `practiceBackupSync.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 期望：热力图今日格亮 + 提醒设置面板出 `reminder.practiced_today_note`（今天不会再提醒）；顶部横幅不出

#### AI-4

- **优先级**：P1
- **覆盖**：已在 `practiceBackupDailyCompletionReconcile.test.js` 覆盖；已在 `practiceBackupSync.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 边界：恢复日无 `practice-days` 今日条目

**Then**
- 仍催练；已有本地 `daily-completions` 不被覆盖。

---
## 场景 AJ：Stay in touch · Newsletter 留资（#444 Resend **待合**）

> **用户故事**：Kelly 在 Idle 菜单可选留邮箱收产品更新——**不**挂钩 entitlement / tip / sanctuary；本地只记 `{ submitted }`，**不**存邮箱明文。Cloud 配好时 Worker + Resend 欢迎信；502 **不写** submitted。
**状态**：#444（Newsletter Resend await/重发）**待合入 develop**——下列步骤以 TRACKER + `NEWSLETTER_CAPTURE.md` 为准；合入后须核对 welcomeSentAt 防重发口径。
**仍须人工**：Gmail 垃圾箱；退订页；375·宽屏；`127.0.0.1` CORS（**不要** `localhost`…

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| AJ-1 | P2 | 完整链路仍须人工 | 前置：`VITE_CLOUD_API_BASE_URL` 指向生产 Worker；Safari 用  |
| AJ-2 | P2 | 完整链路仍须人工 | Idle → 宽屏 ⋯ / 窄屏抽屉 Stay in touch → 0–1 秒内 `#newsle |
| AJ-3 | P2 | 完整链路仍须人工 | 提交同一真实邮箱 → 成功反馈才算发出；Gmail From `hello@twinsology.c |
| AJ-4 | P2 | 完整链路仍须人工 | 本地只写 `submitted` → 退订链接可用 → 再开菜单 We'll keep in tou |
| AJ-5 | P2 | 完整链路仍须人工 | 无 Cloud / `?newsletterMock=1`：仍 mock 成功、无发信。回流：关卡后 |

### Given-When-Then 明细

#### AJ-1

- **优先级**：P2
- **覆盖**：完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 前置：`VITE_CLOUD_API_BASE_URL` 指向生产 Worker；Safari 用 `http://127.0.0.1:5173/?product=1`；先清 `localStorage['focus-tiger.newsletter-capture.v1']`

#### AJ-2

- **优先级**：P2
- **覆盖**：完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1
- Companion 状态为 Idle（`#sprite-stage` 可见，无 `#focus-hud`）

**When**
- Idle

**Then**
- 宽屏 ⋯ / 窄屏抽屉 Stay in touch → 0–1 秒内 `#newsletter-capture-card` 淡入（两段正文说明 known-error 修复与 latest release）。

#### AJ-3

- **优先级**：P2
- **覆盖**：完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 提交同一真实邮箱

**Then**
- 成功反馈才算发出；Gmail From `hello@twinsology.com`（查垃圾箱）。错误反馈 → 不要当已订阅。

#### AJ-4

- **优先级**：P2
- **覆盖**：完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 本地只写 `submitted`

**Then**
- 退订链接可用 → 再开菜单 We'll keep in touch 不可点（勿与付费 You're subscribed 混淆）。

#### AJ-5

- **优先级**：P2
- **覆盖**：完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 无 Cloud / `?newsletterMock=1`：仍 mock 成功、无发信。回流：关卡后再开菜单；不提交不影响练习

---
## 场景 AL：Reflection Companion · validation only（lab · 非 shipping）

> **政策**：`task-local-ai-reflection-companion-validation.md` · V3 validation ≠ shipping。**仅** Electron 非低配宽屏 + `?reflectionCompanion=1`。无 flag / Web / 375 **不得**出现 invite，也 **不得**自动 generate。
**单元**：`reflectionCompanionValidation.test.js` · `buildReflectionCompanionPrompt`。
**邻接**：场景 C 末题 echo hold · 场景 AE 危机语料 · 确定性 `[data-testid=reflection-companion…

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| AL-1 | P2 | 已在 `reflectionCompanionValidation.test.js` 覆盖 | 主路径（Electron 宽屏）：`desktop:dev` + `?product=1&refle |
| AL-2 | P2 | 已在 `reflectionCompanionValidation.test.js` 覆盖 | 无 lab：同一路径 无 `?reflectionCompanion=1` → 不得出现 invit |
| AL-3 | P2 | 已在 `reflectionCompanionValidation.test.js` 覆盖 | 危机负例：末题写入 `I don't want to live` → 点 invite → 0–1  |
| AL-4 | P2 | 已在 `reflectionCompanionValidation.test.js` 覆盖 | 失败不挡：companion 未 ready 时点 invite → 0–1 秒内 Listenin |
| AL-5 | P2 | 已在 `reflectionCompanionValidation.test.js` 覆盖 | 回流：关 Reflection → 再开一场 无 lab → 无 invite。 |

### Given-When-Then 明细

#### AL-1

- **优先级**：P2
- **覆盖**：已在 `reflectionCompanionValidation.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1&reflectionCompanion=1&sessionMinutes=1

**When**
- 主路径（Electron 宽屏）：`desktop:dev` + `?product=1&reflectionCompanion=1&sessionMinutes=1`

**Then**
- Sit 达标 → Reflection 末题非空 Continue → 0–1 秒内见 echo 留下 + `[data-testid=reflection-companion-invite]`。点 invite → 0–1 秒内钮文案变「Listening…」→ `[data-testid=reflection-companion-observation]` 见一句 observation，`data-source=generate`。再 Continue / Skip / Esc 关卡，Celebrating 不被挡住。

#### AL-2

- **优先级**：P2
- **覆盖**：已在 `reflectionCompanionValidation.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1&reflectionCompanion=1&sessionMinutes=1

**When**
- 无 lab：同一路径 无 `?reflectionCompanion=1`

**Then**
- 不得出现 invite；确定性 echo 仍可出现。

#### AL-3

- **优先级**：P2
- **覆盖**：已在 `reflectionCompanionValidation.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 危机负例：末题写入 `I don't want to live`

**Then**
- 点 invite → 0–1 秒内 Listening… → observation `data-source=corpus_safety`，英文须含 crisis line；禁止 generate。

#### AL-4

- **优先级**：P2
- **覆盖**：已在 `reflectionCompanionValidation.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 失败不挡：companion 未 ready 时点 invite

**Then**
- 0–1 秒内 Listening… → observation `data-source=corpus_fallback`（已审语料）；卡仍可关，禁止空白卡死。

#### AL-5

- **优先级**：P2
- **覆盖**：已在 `reflectionCompanionValidation.test.js` 覆盖；完整链路仍须人工

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 回流：关 Reflection

**Then**
- 再开一场 无 lab → 无 invite。

---
## 场景 I：点 **How shall we sit?**（未过 Arrival）→ **立刻展开三选一**；Honesty 提示开着时仍可点；**不**启动 Arrival

> 回归锁：禁静默无反馈 · **单元** smoke I（`resolveCompanionHintClick`→toggle）+ **DOM** e2e I（hint→`.session-start-dock__panel`，不出 Arrival）；**「Honesty 开着时仍可点」未自动化**（仍人工看文案/动效）

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| I-1 | P0 | 回归锁：禁静默无反馈 · **单元** smoke I（`resolveCompanion | 点 How shall we sit?（未过 Arrival）→ 立刻展开三选一；Honesty 提 |

### Given-When-Then 明细

#### I-1

- **优先级**：P0
- **覆盖**：回归锁：禁静默无反馈 · **单元** smoke I（`resolveCompanionHintClick`→toggle）+ **DOM** e2e I（hint→`.session-start-dock__panel`，不出 Arrival）；**「Honesty 开着时仍可点」未自动化**（仍人工看文案/动效）

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 点 How shall we sit?（未过 Arrival）

**Then**
- 立刻展开三选一；Honesty 提示开着时仍可点；不启动 Arrival

---
## 场景 J：Rise 后再点 hint → **仍展开三选一**；再选 Here & Now → **立刻 Focusing**（不得再 Notice；门闩在 Arrival/⚡ 后跨会话保持）

> 回流 · **DOM** e2e J；**单元** gate persist + smoke J hint toggle

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| J-1 | P0 | 回流 · **DOM** e2e J；**单元** gate persist + smok | Rise 后再点 hint → 仍展开三选一；再选 Here & Now → 立刻 Focusing |

### Given-When-Then 明细

#### J-1

- **优先级**：P0
- **覆盖**：回流 · **DOM** e2e J；**单元** gate persist + smoke J hint toggle 回流 · **DOM** e2e J；**单元** gate persist + smoke J hint toggle

**Given**
- 页面 URL：http://localhost:5173/?product=1
- 处于 Focusing（`#focus-hud` 计时中，主按钮 `[data-testid=btn-rise]` 或 `#btn-focus` 文案为 Rise）

**When**
- Rise 后再点 hint

**Then**
- 仍展开三选一；再选 Here & Now → 立刻 Focusing（不得再 Notice；门闩在 Arrival/⚡ 后跨会话保持）

---
## 场景 K：Offline Space：点选 → **立刻 Focusing**，**不**出 Arrival（禁止再逼点 Sit / Notice/Choose）

> **DOM** e2e K（选中即开表且 Arrival hidden）；**单元** `shouldSkipArrivalOnModeSelect` / Offline canBegin 门闩

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| K-1 | P0 | **DOM** e2e K（选中即开表且 Arrival hidden）；**单元** ` | Offline Space：点选 → 立刻 Focusing，不出 Arrival（禁止再逼点 Si |

### Given-When-Then 明细

#### K-1

- **优先级**：P0
- **覆盖**：**DOM** e2e K（选中即开表且 Arrival hidden）；**单元** `shouldSkipArrivalOnModeSelect` / Offline canBegin 门闩 **DOM** e2e K（选中即开表且 Arrival hidden）；**单元** `shouldSkipArrival

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- Offline Space：点选

**Then**
- 立刻 Focusing，不出 Arrival（禁止再逼点 Sit / Notice/Choose）

---
## 场景 L：同日第二场达标 → SessionComplete，无 Celebrating、无自动 Incense

> 纠正旧 A8/A9

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| L-1 | P2 | 纠正旧 A8/A9 纠正旧 A8/A9 | 同日第二场达标 → SessionComplete，无 Celebrating、无自动 Incens |

### Given-When-Then 明细

#### L-1

- **优先级**：P2
- **覆盖**：纠正旧 A8/A9 纠正旧 A8/A9

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- 同日第二场达标

**Then**
- SessionComplete，无 Celebrating、无自动 Incense

---
## 场景 M：产品壳 `?product=1`：无调试面板；实验室 `/`：有面板

> 分清测「功能」还是测「产品表面」

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| M-1 | P2 | 分清测「功能」还是测「产品表面」 分清测「功能」还是测「产品表面」 | 产品壳 `?product=1`：无调试面板；实验室 `/`：有面板 |

### Given-When-Then 明细

#### M-1

- **优先级**：P2
- **覆盖**：分清测「功能」还是测「产品表面」 分清测「功能」还是测「产品表面」

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 产品壳 `?product=1`：无调试面板；实验室 `/`：有面板

---
## 场景 N：Honesty 补登结束 → 桥接 Yes → 完整 Arrival；桥接 No → idle；靠近 idle **不**自动点头

> 2026-07-19/20 增量

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| N-1 | P0 | 2026-07-19/20 增量 2026-07-19/20 增量 | Honesty 补登结束 → 桥接 Yes → 完整 Arrival；桥接 No → idle；靠近 |

### Given-When-Then 明细

#### N-1

- **优先级**：P0
- **覆盖**：2026-07-19/20 增量 2026-07-19/20 增量

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- Honesty 补登结束

**Then**
- 桥接 Yes → 完整 Arrival；桥接 No → idle；靠近 idle 不自动点头

---
## 场景 R：跨日回访（dayN / 拨时钟）：与 `RETENTION_FUNNEL` R2–R3 对齐

> **仍建议**；测回访须拨时钟或跨日真机；勿与 Q–Z 混关

### 步骤总览

| 步骤 ID | 优先级 | 覆盖 | 摘要 |
|---|---|---|---|
| R-1 | P2 | **仍建议**；测回访须拨时钟或跨日真机；勿与 Q–Z 混关 **仍建议**；测回访须拨时 | 跨日回访（dayN / 拨时钟）：与 `RETENTION_FUNNEL` R2–R3 对齐 |

### Given-When-Then 明细

#### R-1

- **优先级**：P2
- **覆盖**：**仍建议**；测回访须拨时钟或跨日真机；勿与 Q–Z 混关 **仍建议**；测回访须拨时钟或跨日真机；勿与 Q–Z 混关

**Given**
- 页面 URL：http://localhost:5173/?product=1

**When**
- （无额外用户操作）

**Then**
- 跨日回访（dayN / 拨时钟）：与 `RETENTION_FUNNEL` R2–R3 对齐

---
## 待澄清清单

- A-ACCEPT-P1 · 验收 prose 需拆 DEV reset + 各断言
- A-ACCEPT-P2 · 验收 prose 需拆 DEV reset + 各断言
- A-ACCEPT-P3 · 验收 prose 需拆 DEV reset + 各断言
- AA-2 · 切到其他窗口或本机 App：小窗应保持在最上层，阿寅继续呼吸。主页面 Idle 状态不变（浮窗只是视图分身）。
- AB-3 · 保持收在托盘 约 70–90 秒（>60s）。
- AB-4 · 再点托盘「显示」：窗口回来，不应出现 Re-focus 观察式 toast / `nod-bow`（SB-18）。若出现 = bug（`AttentionSignals` 把 `hidden` 当切走
- AC-1 · `?product=1` Idle → 宽屏 ⋯ / 窄屏抽屉 Yin's Collections / 阿寅的珍藏（紧挨 Journey log）→ 0–1 秒内：菜单行 `:active` 按压缩放
- AC-2 · 挥手点播：点底栏 请阿寅挥挥手 → 0–1 秒内钮 `:active` 按压 + 阿寅开始 `wave-hello` 正放一次，约 1s CapCut 回坐禅；挥手序列须在面板外可见（不得被玻璃挡住）
- AD-2 · Welcome 后短切 tab：本页已 Welcome / Idle → 切到其他标签约 1 分钟再回 → 仍 Idle 醒着，不得披毯（#341）。
- AD-6 · hidden≥2h 回前台（无叠层）：窗口 hidden ≥2h 再 visible，且 无 Reflection/Arrival/Honesty/Support 叠层 → 可按拍板进 DORMANT
- AE-6 · 睡态唤醒（交叉 AD · #491）：DORMANT 或 sleeping 姿态下 → ⋯ Confide to Yin 或倾听耳 → 0–1 秒内 `dormantWake`，玻璃卡后 Yin 为 
- AE-6 · 睡态唤醒（交叉 AD · #491）：在 DORMANT 或 `sleeping` / `cloakSleep` 姿态下（见 场景 D 步 1–2 或 场景 AD 深夜窗）→ 开 Confide（ha
- AF-1 · 首次披露：清 `focus-tiger.presence-signals-disclosure-seen.v1` → `?product=1` → Sit → Arrival → Notice 任点 
- AI-2 · DEV 清 6 whitelist key（保留 `focus-tiger.practice-backup.v1`）→ 硬刷新 → 约 2.5s 后自动恢复。
- AJ-1 · 前置：`VITE_CLOUD_API_BASE_URL` 指向生产 Worker；Safari 用 `http://127.0.0.1:5173/?product=1`；先清 `localStorag
- AM-1 · `?product=1` 硬刷新进 Idle 约 2.5s 起每 ~5s 自动 peek：若云端有人在坐 → 左下（宽屏在热力图簇上方）灯点 + 短句；若 0 人或无路由 → 不出现假灯火（无需 De
- AN-6 · Start a circle 云端卡住 → 约 12 秒内失败句 + 按钮可再点。
- AO-1 · A、B 均已入圈（两独立浏览器配置）→ A Sit 进 Focusing → B 硬刷新 Idle 约 2.5–10s 见银蓝 dots +「圈里有人在坐」（全球金灯火可同时出现）。
- AO-2 · A Rise 回 Idle → B 约 5–10s 内 dots 消失（诚实 0）。
- AP-1 · A、B 均已入圈 → A Sit ≥60s → Rise → 约 3s 后（非 3s 限时关条）见可忽略留痕条 → 留下 → 选预设句 → 条消失。对照：Celebrate / 芥子印 / 吹花首卡可
- AP-2 · B 硬刷新 Idle 约 2.5–10s 见 1 条匿名痕迹 + 回应 入口；银蓝 dots（AO）可同时出现。
- AQ-1 · A、B 均已入圈 → A Sit ≥60s → Rise → B sitting=0 时 Idle 约 2.5–10s 见轻文案「今天有人来过」（不显示精确人数）；A 再 Sit 时 B 见 sitt
- B-4 · 切到 其它 Safari 标签，停留约 70–90 秒（必须 &gt;60s；不要只留 10s）。
- B-5 · 切回 Focus Tiger：应见 非模态观察式文案 + `nod-bow` 点头鞠躬（不是摆尾）。
- C-3 · 角色播 `rise-stretch-casual` pingpong（闭目坐禅→伸懒腰→随意坐→倒放回闭目）；约 `MANUAL_END_PAUSE_MS = 300` 后淡入 Reflection（
- C-5 · 三问正常可跳过；关闭 Reflection 后应回 Idle（或当日零完成时回 Sleeping），衔接勿硬切。末题非空 Continue 后 0–1 秒内输入框下见共鸣且卡留下（输入只读）；再点 C
- D-1 · 模拟「距上次专注结束 ≥ 2 小时」：写过一次专注结束时间戳后把时钟拨到 ≥2h，且离开标签 ≥2h 再回（短切约 1 分钟再回 不应进睡——见 场景 AD / Welcome 契约），或 DEV 改
- D-2 · 惰性进 DORMANT：应先见 cloakSleep 披毯再落入 sleeping；点进 Honesty（或 Mindful Check-in）→ 0–1 秒内：入口按压 + `#honesty-ch
- D-3 · 选时长 10 / 20 / 30+（选 20）→ 0–1 秒内：该钮下压（`translateY(1px)`）+ 时长面板让位给呼吸引导（倒计时出现）。不要报成哑点击。
- D-4 · 实际顺序：选时长后 立刻播 `dormantWake`（cloak-sleep 倒放，非 stretch），与约 10 秒呼吸倒计时并行（`HONESTY_BREATH_MS = 10_000`）。
- D-5 · 补登结束（记账、离 DORMANT）后：立刻出现 Honesty 桥接 CTA（「要不要现在也坐一会儿？」Yes / No 同级；Welcome 回显可与邀请同屏一小会儿）。
- D-6 · DORMANT 清除后仍可再点 Sit 做正式会话，与补登不冲突。Sit → 0–1 秒内：主钮按压 + Companion / Arrival 按既有场景 A 展开（本步不另造反馈类型）。
- E-3 · 已知缺口：约 10 分钟无互动自动 `welcomeBack` / wave-hello 未接线（仅调试「挥手欢迎」）。回来没看到挥手 = 已知状态。
- F-2 · 频繁切标签（模拟多任务）；离开类 Re-focus 应全程抑制。
- G-4 · （DEV 仍可挂 `__languagePreference` / `__i18n` / `__sceneAnimationSliceA`；正式验收以 UI 为准。）
- M-1 · 产品壳 `?product=1`：无调试面板；实验室 `/`：有面板
- O-1 · 打开 `?product=1`，处于 Idle。
- P2-5 · 设好提醒且已过设定时分、今日零完成 → 顶部居中 `#in-app-reminder-banner` 出现，文案 `reminder.gentle_waiting`（EN "Yin is right 
- Q2-7 · Test 卡走 Checkout（约 US$4.99）；回跳/`?tip=1` 后：卡内与阿寅旁 `#yin-tip-kindness-badges` 至少 3 枚（付费 `min=3`，上限 9）；
- Q3-10 · Support Primary → 0–1 秒内同 Q2（按压 + disabled + 关模态）；随后 `#yin-sanctuary-card` 卡面约 $89.99 → Unlock → Lif
- S-4 · Leave：不记账、不进 Reflection、不写 Journey log、停播。
- V-1 · `?product=1` → DEV Console：`window.__ftDebug.resetScenario('day1-flower-card')`（吹花+四选卡；只要吹花用 `'day1-
- V-4 · 模拟 ≥3 日久别（拨 `lastOpen`）→ 再吹花（跟 locale）。
- V-7 · 组合 · 提醒已过时分（E12）：清库后设每日提醒为过去时分、今日零完成 → 硬刷新。0–1 秒内见吹花（或欢迎池），不得在吹花进行中突然切鹦鹉、也不得无 1s 叠化硬切。横幅可在吹花期间出现。吹花结
- Z-3 · 回流：Close / 点外侧 / Esc → 0–1 秒内：关钮 `:active` 按压 + 卡开始淡出；Idle Sit / ⋯ 或抽屉 grabber 仍可见。刷新后条目仍在；再完成一场 → 新

---

_场景 59 · 步骤 281 · 待澄清 45_
