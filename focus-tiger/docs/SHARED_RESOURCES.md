# SHARED_RESOURCES.md — 共享资源对照表

> **地位**：与 `DEV_WORKFLOW_QUALITY.md` §2.3 **高风险面**互补，不是替代。  
> - §2.3 = 已知踩过坑的具体点（事故清单）  
> - 本表 = 当前共享资源分别被谁用（开工查波及面）  
> **维护**：新增 emotion key / localStorage key / Idle 编排入口时顺手补一行（R3）。  
> **创建**：2026-07-20

---

## 1. localStorage keys

| Key | 模块 | 谁读写 / 影响场景 |
|---|---|---|
| `focus-tiger.daily-completions.v1` | `DailyCompletionStore` | DORMANT / Honesty / 首次 Celebrating vs SessionComplete / 场景 A·D·L |
| `focus-tiger.honesty-bridge.v1` | `HonestyBridgeStore` | 桥接 CTA 诊断标记（不限次出现）；场景 D·N |
| `focus-tiger.intentions.v1` | `SessionIntentionStore` | Choose 意图历史；Reflection 回显 |
| `focus-tiger.reflections.v1` | `SessionEndFlow` | Reflection 非空答案最近 5 条 |
| `focus-tiger.companion-mode.v1` | `CompanionModePicker` / `FocusSession` | 上次 Companion 模式记忆 |
| `focus-tiger.reminder-quota.v1` | `ReminderQuotaManager` | Mindful / Re-focus / stretch 共享日额度（3） |
| `focus-tiger.hints-seen.v1` | `OnboardingHintsStore` | 分散式提示已读；实验室可单清 |
| `focus-tiger.ambient-nudge.seen.v1` | `AmbientSoundscapeUI` | Ambient 首次轻提示已读 |

一键清空：DEV「重置全部本地状态」→ `clearAllFocusTigerLocalState()`（`src/core/localStateKeys.js`）。

---

## 2. EmotionController / `playEmotion`

| 资源 | 主要调用方 | 波及 |
|---|---|---|
| `EmotionController` 单例（`main.js` 注入） | `MoodController`、Honesty、MindfulReminder、PointerInteraction、调试面板、会话完成反馈 | 改优先级 / holdPose / 回落 idle 会影响全部响应情绪 |
| `idle` / IdleOrchestrator 接管 | `MoodController` IDLE、`IdleOrchestrator` | 呼吸×5→眨眼；勿另开 Idle 变体池 |
| `sleeping` | DORMANT / `MoodController` | 场景 A 开局睡着观感 |
| `dormantWake` | `HonestyCheckInController` | 补登睡→坐；holdPose；离开后溶解 |
| `celebrating` / `sessionComplete` | `triggerSessionCompletionFeedback` | 当日首次 vs 二次达标 |
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
| `IdleOrchestrator` | `EmotionController` idle 路径 | 呼吸×N→眨眼；切入须 `crossFade` + `freezeUntilCrossFadeEnds`（7/20 Idle 闪一下事故） |
| `SpriteSequencePlayer.play` | Emotion / Idle / 调试 | CapCut 溶解、`_resetCrossFade` 顺序、pingpong `frameHolds` |
| `CAPCUT_DISSOLVE_MS` (~1s) | Choose / Rise / IntentionSet 等不衔接切 | 禁止无故改短已调停顿 |
| `companionGestureCatalog` | 候选手势清单 | **不**进 Idle 随机池 |

---

## 4. 门闩 / 叠层共享状态（非 storage）

| 状态 | 谁设 / 谁读 | 波及 |
|---|---|---|
| `arrivalGateReady` | Arrival 完成 / Skip | Companion 点选是否可 begin |
| `setPostSessionOverlayActive` | Honesty / Reflection / Arrival 叠层 | hint 是否 ignore；Sit 抢点 |
| `canBeginFocusOnCompanionModeSelect` | Companion 点选 | Here & Now / Flow 即开；Offline 再 Sit |
| `resolveCompanionHintClick` | 「How shall we sit?」 | needArrival vs toggle；禁静默 |

---

## 5. 用法（开工）

1. 本次改动 touch 上表哪一行？  
2. 「谁用」列还有谁 → 写入保护面并复测。  
3. 若属 §2.3 事故点 → 额外跑冒烟 + 对应 TEST_TRACKER 观感行。
