# SHARED_RESOURCES.md — 共享资源对照表

> **地位**：与 `DEV_WORKFLOW_QUALITY.md` §2.3 **高风险面**互补，不是替代。  
> - §2.3 = 已知踩过坑的具体点（事故清单）  
> - 本表 = 当前共享资源分别被谁用（开工查波及面）  
> **维护**：新增 emotion key / localStorage key / Idle 编排入口时顺手补一行（R3）。  
> **§4 机器块**：由 `sessionUiGateContractRegistry.js` 生成；`npm run gate:doc-sync`；详见 `DOC_CODE_CONTRACT.md`。  
> **更新**：2026-07-22（§4 文档-代码对齐机器块）

---

## 1. localStorage keys

| Key | 模块 | 谁读写 / 影响场景 |
|---|---|---|
| `focus-tiger.daily-completions.v1` | `DailyCompletionStore` | **仅保留当日**（换本地日后惰性整表重置）；Honesty / 计时 / **微仪式**共用 `sessions[]`（无 source）；`celebrated` 戳（Celebrating vs SessionComplete；Honesty / 微仪式 **不**置戳）。字段见下 §1.1。**不足以**直接画「本周 7 格」热力图 |
| `focus-tiger.focus-session-end.v1` | `FocusSessionEndStore` | 最近一次专注结束 epoch ms；DORMANT 滚动窗口起点（达标 / Rise 写入；Honesty **不**写） |
| `focus-tiger.practice-days.v1` | `PracticeDaysStore` | 近日同坐（最多 **90** 条）；条目 `{ date, totalMinutes }`（见 §1.2）；HUD `streak-meter` + Idle `#weekly-practice-heatmap`（`getLastNDays`）；计时 / Honesty / **微仪式**经 `markToday(minutes)`；无断签惩罚文案。与 DailyCompletion **分 key** |)
| `focus-tiger.honesty-bridge.v1` | `HonestyBridgeStore` | 桥接 CTA 诊断标记（不限次出现）；场景 D·N |
| `focus-tiger.retention-funnel.v1` | `RetentionFunnelStore` | 留存漏斗占位戳：`firstOpenAt` / dayN 已打标记 / `firstSessionCompleteAt`；仅 `console.log` sink，无第三方。见 `RETENTION_FUNNEL.md` |
| `focus-tiger.intentions.v1` | `SessionIntentionStore` | Choose 意图历史；Reflection 回显。本场闩在 `main`：`onReady` 写入、`beginFocus` 空 pending **不抹**已闩意图（`resolveSessionIntentionLatch`） |
| `focus-tiger.reflections.v1` | `SessionEndFlow` | Reflection 非空答案最近 5 条 |
| `focus-tiger.companion-mode.v1` | `CompanionModePicker` / `FocusSession` | 上次 Companion 模式记忆 |
| `focus-tiger.reminder-quota.v1` | `ReminderQuotaManager` | Mindful / Re-focus / stretch 共享日额度（3） |
| `focus-tiger.reminder-preference.v1` | `reminderPreference` + `ReminderPreferenceUI`（右上角，方案 A）+ `InAppReminderBannerUI`（`#ui-overlay` 顶部居中）+ `InAppReminderBannerController` | 应用内提醒时间偏好 `{ hour, minute }` 或 `null`（**无 `enabled` 字段**——存在即开启）；`evaluateInAppReminderBanner` 返回候选（boolean + `reminder.gentle_waiting`）；不占浏览器 Notification；「今日已完成」含 Honesty / 微仪式；忙碌（Arrival/Focusing/Celebrate/Reflection/微仪式）默认 `busyPolicy:'suppress'`（隐藏不排队，方案 B `defer` 备选未启用） |
| `focus-tiger.hints-seen.v1` | `OnboardingHintsStore` | 分散式提示已读；实验室可单清 |
| `focus-tiger.ambient-nudge.seen.v1` | `AmbientSoundscapeUI` | Ambient 首次轻提示已读 |
| `focus-tiger.ambient-pref.v1` | `AmbientSoundscapeController` | 背景音乐开关偏好 + 上次曲目（默认 Mer-Ka-Ba 开） |

一键清空：DEV「重置全部本地状态」→ `clearAllFocusTigerLocalState()`（`src/core/localStateKeys.js`）。  
**验收**：L-logic（`localStateKeys.test.js` / `npm run test:smoke`），勿人工逐 key。

### 1.1 DailyCompletionStore 字段快照（2026-07-22 只读调研）

持久化形状（`DailyCompletionState` + `CompletionSession`，见 `src/core/DailyCompletionStore.js`）：

| 层级 | 字段 | 类型 | 含义 |
|---|---|---|---|
| 日态 | `dateKey` | `string` | 本地自然日 `YYYY-MM-DD`（`getLocalDateKey`） |
| 日态 | `sessions` | `CompletionSession[]` | 当日完成列表（计时与 Honesty **同一列表、无 source**） |
| 日态 | `celebrated` | `boolean`（可选，读时归一） | 当日是否已播过完整 Celebrating；与「有无完成」解耦 |
| 会话 | `completedAt` | `number` | 完成时刻 epoch ms |
| 会话 | `durationMinutes` | `number` | 正数分钟；≤0 不入账 |

公开读 API：`hasCompletedToday()`、`hasCelebratedToday()`、`getTodaySessions()`、`getTodayTotalMinutes()`、`getState()`。  
**无**：多日历史、按周查询、`达标` 布尔、会话来源标签。换日后旧日 `sessions` **被覆盖丢弃**。

相邻对照：多日陪伴节奏与时长见 **§1.2 `PracticeDaysStore`**（`getLastNDays`）；DailyCompletion **仍仅当日**，勿假设可画周热力图。

### 1.2 PracticeDaysStore 字段（2026-07-22 · 热力图 Store 层）

持久化 key 仍为 `focus-tiger.practice-days.v1`（原地迁移，不升 v2 key）。

| 字段 | 类型 | 含义 |
|---|---|---|
| `days` | `PracticeDayEntry[]` | 最多 **90** 条；按 `date` 升序；`slice(-90)` 裁剪 |
| `days[].date` | `string` | 本地自然日 `YYYY-MM-DD` |
| `days[].totalMinutes` | `number \| null` | 当日计时+Honesty **累计**分钟；`null` = 旧版 `string[]` 迁移（有练过、时长未知）；缺口日**不入库** |

公开 API：`markToday(durationMinutes?)`（同日累加）、`getRecentStreakDays()` / `getRingFilled()`（仍按「有条目」计连续日）、`getLastNDays(n)`（含今天共 n 天，**缺日补** `{ date, totalMinutes: 0 }`，旧→新）。  
迁移：`migratePracticeDaysEntries`；读到旧 `days: string[]` 时转 `{ date, totalMinutes: null }` 并写回。  
UI：Idle 常驻 `#weekly-practice-heatmap`（亮 = `null \|\| >0`）；非 Idle 隐藏。

---

## 2. EmotionController / `playEmotion`

| 资源 | 主要调用方 | 波及 |
|---|---|---|
| `EmotionController` 单例（`main.js` 注入） | `MoodController`、Honesty、MindfulReminder、PointerInteraction、调试面板、会话完成反馈 | 改优先级 / holdPose / 回落 idle 会影响全部响应情绪 |
| `idle` / IdleOrchestrator 接管 | `MoodController` IDLE、`IdleOrchestrator` | 呼吸×5→眨眼；勿另开 Idle 变体池 |
| `sleeping` | 调试「睡着了」/ 显式 DORMANT | **不再**作零完成开场；开场默认 Idle |
| `dormantWake` | `HonestyCheckInController` | 补登睡→坐；holdPose；离开后溶解 |
| `celebrating` / `sessionComplete` | `triggerSessionCompletionFeedback`；微仪式直接 `playEmotion('sessionComplete')` | `hasCelebratedToday`：首次**计时**达标 Celebrating；已庆祝过 → SessionComplete；Honesty / **微仪式**不占戳、永不 Celebrating |
| `riseStretchCasual` | Rise 路径 | 主动结束转场；勿与 blinkBreathe 混淆 |
| `intentionNod`（intentionSet） | Arrival Choose 确认 | 与 Companion 展开时序 |
| `mindfulAcknowledge` / `stretchReminder` | `MindfulReminderController` | 共享额度；Offline/Flow 抑制离开类 |
| `nodGreeting` | **仅调试**；靠近自动已拆 | 勿接回默认靠近 |
| 调试试播全表 | `#emotion-debug-ui` / `__spritePlayer` | 不含生产调度 |

完整键见 `EmotionController.js` 的 `EMOTIONS` / `EMOTION_KEYS`；情绪语义权威仍为 `EMOTION_BIBLE.md`。

---

## 3. IdleOrchestrator / SpriteSequencePlayer

| 资源 | 谁用 | 改动时保护 |
|---|---|---|
| `IdleOrchestrator` | `EmotionController` idle 路径 | 呼吸×N→一瞥；**同姿衔接硬切**（crossFadeMs=0）；叠化仅用于与其它情绪回落 idle |
| `SpriteSequencePlayer.play` | Emotion / Idle / 调试 | CapCut 溶解、`_resetCrossFade` 顺序、pingpong `frameHolds` |
| `CAPCUT_DISSOLVE_MS` (~1s) | Choose / Rise / IntentionSet 等不衔接切 | 禁止无故改短已调停顿 |
| `companionGestureCatalog` | 候选手势清单 | **不**进 Idle 随机池 |

---

## 4. 门闩 / 叠层共享状态（非 storage）

<!-- session-ui-gate-contract:begin -->

> **机器块 · 勿手改**。真源：`src/core/sessionUiGateContractRegistry.js`。刷新：`npm run gate:doc-sync`。

### 门闩字段（可变态）

| id | setter | readers | impact |
|---|---|---|---|
| `arrivalGateReady` | `setArrivalGateReady` | Gate ↔ Companion `setArrivalReady`（UI 投影） | Companion 点选是否可 begin；Sit 未就绪 → Arrival |
| `completionPending` | `setCompletionPending` | Gate；达标庆祝路径 | 禁止打断 / 禁止二次 begin；Companion 选项禁用 |
| `postSessionOverlayActive` | `setPostSessionOverlayActive` | main `resyncSessionChrome()` → `computePostSessionOverlayActive(sources)` | hint 是否 ignore；选项禁用。源含 Arrival / Reflection / 微仪式；Honesty 不列入 |

### 行为契约（失败即 bug）

| contractId | api | when | must | testAnchor |
|---|---|---|---|---|
| `begin-focus-arrival-not-ready` | `canBeginFocusOnCompanionModeSelect` | arrivalGateReady === false | return false（禁止静默开表；UI 应启动 Arrival 或禁用） | `SessionUiGate.test.js` |
| `begin-focus-gates-block` | `canBeginFocusOnCompanionModeSelect` | completionPending || arrivalOpen || isFocusing | return false | `SessionUiGate.test.js` |
| `sit-idle-not-ready` | `resolveSitClickWhenIdle` | arrivalGateReady === false | return 'start-arrival'（不得 'begin-focus'） | `SessionUiGate.test.js` |
| `auto-start-needs-arrival` | `resolveAutoStartNeedsArrival` | 自动开表模式 && arrivalGateReady === false | return 'start-arrival' | `SessionUiGate.test.js` |
| `hint-overlay-ignore` | `resolveCompanionHintClick` | postSessionOverlayActive === true | return 'ignore'（UI 应禁用，禁止可点无反馈） | `SessionUiGate.test.js` |
| `companion-commit-reject` | `resolveCompanionModeSelectCommit` | canBegin === false && needsArrivalAction === ignore | return 'reject'（禁止写 companion-mode storage） | `SessionUiGate.test.js` |
| `overlay-aggregate-some` | `computePostSessionOverlayActive` | 任一源为 true | return true（扩展第三叠层只追加源，不改聚合函数） | `SessionUiGate.test.js` |

### `resolveCompanionModeSelectCommit` 合法结果

- `commit-begin`
- `commit-arrival`
- `reject`

<!-- session-ui-gate-contract:end -->

| 状态 | 谁设 / 谁读 | 波及 |
|---|---|---|
| **`SessionUiGate`**（权威可变源） | `main.js` 装配；DEV `__sessionUiGate` | Arrival 门闩 / 完成中 / 叠层占用；单测见 `SessionUiGate.test.js` |
| `arrivalGateReady` | Gate `setArrivalGateReady` ↔ Companion `setArrivalReady`（UI 投影） | Companion 点选是否可 begin；Sit 未就绪 → Arrival |
| `completionPending` | Gate；达标庆祝路径 | 禁止打断 / 禁止二次 begin；Companion 选项禁用 |
| `postSessionOverlayActive` | **单一入口** `main.js` `resyncSessionChrome()`：`computePostSessionOverlayActive(sources)`（数组 + `some()`）→ Gate + Companion | hint 是否 ignore；选项禁用。源默认含 Arrival / Reflection / **微仪式**；**Honesty 不列入**（仍可点 hint）。禁止 Reflection-only 与 Arrival-only 双路互盖 |
| `canBeginFocusOnCompanionModeSelect` | `FocusSession` 纯函数 + Gate 包装；Picker 经 handlers 注入真门闩 | Here & Now / Flow / Offline 即开；**未就绪必须 false** |
| Companion 点选写 storage | **仅** Gate 通过后（`commit-begin` / `commit-arrival`） | **禁止**先写 storage 再静默 return（`resolveCompanionModeSelectCommit`） |
| `resolveCompanionHintClick` | `FocusSession` + Gate 包装 | toggle 展开三选一；禁静默 ignore |
| `resolveSitClickWhenIdle` | Gate | 未就绪 → `start-arrival`；就绪 → `begin-focus` |

扩展第三种叠层：在 `getPostSessionOverlaySources()` 数组追加 `() => other.isOpen()`，**不必**改 `computePostSessionOverlayActive`。

---

## 5. 用法（开工）

1. 本次改动 touch 上表哪一行？  
2. 「谁用」列还有谁 → 写入保护面并复测。  
3. 若属 §2.3 事故点 → 额外跑冒烟 + 对应 TEST_TRACKER 观感行。
