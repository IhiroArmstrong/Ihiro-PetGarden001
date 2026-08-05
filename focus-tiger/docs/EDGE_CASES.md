# EDGE_CASES.md — 已知边角 / 静默失败观察清单

> **地位**：审计与排期用的观察册，**不是**立刻开工的 Task Brief。  
> 与 `SHARED_RESOURCES.md`（谁用共享资源）、`DEV_WORKFLOW_QUALITY.md` §2.3（已踩坑高风险面）互补。  
> **维护**：新发现边角写入本表；开修时迁入 Task / TEST_TRACKER，并在此标「已排期 / 已修」。  
> **创建**：2026-07-22（源自静默失败全面排查）

---

## 使用说明

| 优先级 | 含义 |
|---|---|
| **P0 / 已排期** | 用户已批准分批修复（见下「当前批次」） |
| **P1** | 中等；验收稳定后再排 |
| **P2** | 小 / 已文档化；先观察，不主动开修 |

---

## 当前批次（2026-07-22 用户拍板 · 2026-08-05 续）

| 批次 | 项 | 状态 |
|---|---|---|
| 1 | #6 StateManager 合法转移 warn（不阻断） | **已做** |
| 2 | #4 Honesty `?? 30` → warn + abort + toast + 重开时长 | **已做**（待人工测） |
| 3 | #1/#2/#3/#7/#10 门闩一体包 | **已做**（待人工验收 Companion→计时） |
| 4 | #5 Sit @ completionPending 禁用 + #17–19 playEmotion 可观测小步 | **已做**（`fix/logged-debt-batch-134` · 2026-08-05） |
| 4b | Visibility 原 `gap-*` 四行收 `locked` | **已做**（同批） |
| 5 | 其余中项（非法 mode coerce、Re-focus 静默等） | 仍先不修 |

---

## P1 · 中等（批次 5 候选，先不修）

| 原 # | 摘要 | 位置 | 备注 |
|---|---|---|---|
| 5 | ~~`completionPending` 时 Sit `return false`，按钮未禁用~~ | `main.js` · `SessionUiGate` | **已修（批 4）**：`shouldEnableFocusChromeButton` + resync 禁 Sit；e2e `completionPending disables Sit` |
| 8 | 非法 `companionMode` 静默 coerc 为 `stay` | `FocusSession.start` | 建议改 warn，勿静默 |
| 9 | Re-focus 先占名额再因强情绪/额度静默 | `MindfulReminderController` | 有意设计；可补用户可感知说明 |
| 11–13 | Storage / Store `catch` 无 warn；非法分钟 `return null` | `Storage.js`、各 Store | 隐私模式合理；缺可观测性 |
| 14–15 | Emotion `!started` / `smiling` 无 sprite 静默 | `EmotionController` | **部分**：companion oneshot `!started` 已 warn；其余仍散 |
| 16 | Mood IDLE 对 hold 情绪静默 return | `MoodController` | 保护 holdPose；漏回落时难查 |
| 17–19 | `playEmotion` 返回值常忽略；hold/强情绪 key 散落 | 多模块 | **部分（批 4）**：`DEBUG_HOLD_POSE_EMOTION_KEYS` SSOT + 单测；调用方仍可忽略 boolean |
| 20–23 | `onDone` 包装顺序；`pendingAutoStart*` 闭包；完成路径耦合 | `main.js` 等 | 大重构仍暂不处理 |

---

## P2 · 小 / 已文档化（观察，不主动开修）

| 原 # | 摘要 | 位置 | 备注 |
|---|---|---|---|
| 24 | 非法 `?sessionMinutes=` → 默认 1 | `FocusSession` | 演示参数写错易误判 |
| 25 | Intention / Ambient / Hints `normalize*` 静默 coerce | 各 Store / UI | 脏数据被洗合法 |
| 26 | Companion overlay 时 `return`、选项未 `disabled` | `CompanionModePicker` | 叠层标志正确时通常已收起；与批 3 overlay 相关 |
| 27 | `_showReminder(type)` 无 default | `MindfulReminderController` | 错 type → throw |
| 28 | Pointer 3D root 几何在 2D 主线可能 silently 无效 | `PointerInteraction` | |
| 29–30 | Emotion / Idle / keys / practice-days 双写 | SHARED §1–3 | **已文档化**；改一处须查 SHARED |
| — | `dormantTrigger`：无结束记录永不 dormant | `dormantTrigger.js` | 产品有意，易被误读为 bug |
| — | locale key 缺失时露出 key | Companion / i18n | |

---

## 已处理（本排查后续）

| 原 # | 摘要 | 处理 |
|---|---|---|
| 6 | StateManager 无合法转移校验 | warn-only；见 `StateManager.js` + `StateManager.test.js`；**BREAK 枚举已删**（无生产引用） |
| 4 | Honesty `_pendingMinutes ?? 30` | abort + `HONESTY_PENDING_LOST` toast + 重开时长；`openDurationChoices({force})` 先 `ui.hide()` 清呼吸计时 |
| 1/2/3/7/10 | 门闩双检 / overlay 双 writer / Bridge 静默 | `resyncSessionChrome` + Picker 真门闩 + 未通过不写 storage |

---

## 相关

- 排查原文：对话「静默失败」审计清单  
- 门闩权威：`SHARED_RESOURCES.md` §4（批 3 方案将补「单一聚合源」缺口）
