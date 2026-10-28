# 深夜相关行为只读盘点（T56 跟进 · A 类）

> **日期**：2026-10-27。  
> **类**：A 类 · **只报告、不改运行时、不改 locale**。  
> **从属**：[`CO_PRACTICE_POSITIONING.md`](./CO_PRACTICE_POSITIONING.md)（口径表「作息提醒」行）。  
> **基线**：`origin/develop` tip `92f0bd34`（#1442）。  
> **不是**：**T58** 代码、用户自设收工时间实现、练习纸晚间事实、睡眠诊断。

PO 拍板：人机共修里的「作息」**只陪用户自己定的目标**，不做「Yin 自己发现熬夜并提醒」。本文件盘清现网已经会在深夜做什么，以及能不能直接拿来承接「用户自设收工时间」。

---

## 0. 结论（先看这四句）

1. **现网没有「熬夜小时数」账本。** 只有「现在是不是本地 23:00–05:59」和「最近一次专注结束时刻」。推不出「本周连续熬夜 X 小时」。
2. **深夜披毯 / 0–6 免责 / Work Transition / 提醒族都不能直接当成收工时间。** 语义分别是：阿寅自己休息、身心免责、下班边界仪式、到点来坐。没有一条等于「用户说过几点收工」。
3. **可复用的只有形状：** 提醒族已经会存用户手设的 `{ hour, minute }` 并在到点出现。收工时间若做，应**另开存储键与文案**，禁止写进现有提醒键。
4. **晚间练习事实进七天练习纸：暂不做。** 需要新的「几点坐的」记录；与 [`PRACTICE_PAPER.md`](./PRACTICE_PAPER.md)「不加新计数器」冲突；须另 Brief、隐私披露、进删除名单、不进研究分享。

---

## 1. 现网四块各在哪

| 块 | 用户看见什么 | 触发（本地钟） | 存什么 | 代码锚点 | 场景 / 测试 |
|---|---|---|---|---|---|
| **深夜披毯（DORMANT）** | 阿寅披斗篷睡着。冷启动可出底栏 toast：en *It's late. I'm resting under the cloak — you can rest too.*（`WELLNESS_LATE_NIGHT_REST`）。白天长时间挂机披毯已关。 | Idle 且本地 **≥23 或 &lt;6**（与 wellness 对齐）；或标签页藏 ≥2h 回前台且距上次专注结束 ≥2h。叠层 / 付款致谢 / 吹花 / Welcome / 短切 tab **压过**披毯。Reflect 开着不得披毯。 | 不记「熬夜」。DORMANT 窗口只用 **最近一次** 专注结束戳 `focus-tiger.focus-session-end.v1`（Honesty 补登不写）。 | `lateNightHour.js`；`companionRestPolicy.js`；`spriteChannelArbitration.js`（wellness-late / late-night-boot）；`FocusSessionEndStore.js`；`main.js` Expand A | 场景 **D**、**AD**；`lateNightHour.test.js`；`companionRestPolicy.test.js`；`spriteChannelArbitration.test.js` |
| **0–6 点免责 / wellness** | 默认**不**自动弹出第一张吓人卡。问号 → 身心说明。深夜窗与披毯共用同一小时定义。早晨 6–10 可走「一起醒」toast（`WELLNESS_MORNING_WAKE`），不是睡眠建议通道。 | 小时定义：`isLateNightHour`。第一张卡仅 `?wellnessFirst=1`。 | `focus-tiger.wellness-disclaimer-seen.v1`（看过免责）。 | `wellnessDisclaimerGate.js`；`OnboardingHintsUI.js`；`cloakVariant.js` `WELLNESS_DAY_BANDS`；场景 **W** | 产品定位 Wellness disclaimer；`wellnessDisclaimerGate` |
| **Work Transition 仪式** | ⋯ → Rituals → Work Transition（会员 / Sanctuary）。欢迎 → 30s 呼吸 → 两问 chip（什么留在工作、什么带回家）→ 结束。**没有钟、没有收工时刻。** 与 Five Moments 的 Transition 轻提示不是同一入口。 | 用户自己点开。不按钟点弹出。 | 仪式完成记录 `RitualCompletionStore`（进阶仪式，不走练习日账本）。 | `RitualFlow.js` `work-transition`；`RitualFlowUI.js`；KB-FUNC-0026 | `RitualFlow.test.js`；菜单 `ritual-work-transition` |
| **提醒族** | 用户可设**每天一个时分**；到点且今日尚未练完 → 应用内横幅「来坐」（存在感，不施压）。无值 = 关。注释写明不走浏览器 Notification 权限。 | 本地时分 ≥ 所设时分，且 `DailyCompletionStore.hasCompletedToday()` 为假。 | `focus-tiger.reminder-preference.v1` = `{ hour, minute }` 或删除。 | `reminderPreference.js`；`ReminderPreferenceUI.js`；`InAppReminderBannerUI.js` | `reminderPreference.test.js` |

相邻、本盘点不当主行：**T48** 夜间略降亮度（#1414，视觉，不是作息教练）；**T51/T52** 觉照邀请与微打卡；长坐舒展邀请（已有，维持）；单日软封顶（练习过量，维持、不加新提醒）。

---

## 2. 能不能承接「用户自设收工时间」

原则：Yin 只提醒用户**自己说过想做到的事**；不替用户定义好作息；可拒绝、拒绝后不追问。

| 现网块 | 直接复用？ | 原因 |
|---|---|---|
| 深夜披毯 | **否** | 钟点是产品写死的 23–6，不是用户目标。开口主语是「我休息」，不是「你说过要收工」。把披毯改成收工提醒会改已验收的 D/AD。 |
| 0–6 免责 / 深夜 toast | **否** | 免责是「不是医疗」。`WELLNESS_LATE_NIGHT_REST` 已有一句「你也可以休息」，落在陪伴休息，**不是**熬夜诊断。收工功能不要叠成第二句睡眠建议（C-04 / C-06）。 |
| Work Transition | **不作为钟** | 它是用户点开的下班边界仪式，适合作为收工邀请被点头之后的**可选去处**（另 Brief），不能代替「用户设的那个时刻」。且现网要会员。 |
| 提醒族 | **只复用形状，不复用键** | 已有「用户手设时分 + 到点轻轻出现 + 可关」。但现网语义是「到点来练（今日还没练才出）」。收工语义是「到你说的点，问要不要收尾」，即使今天已经练过也可能出。写入同一 `reminder-preference` 会在睡前催人来坐。 |

**推荐承接点（尚未实现，须 T58 之后单独 B 类 Brief）：**

- 新键只存用户设的收工时分（可空 = 关）。不新增坐姿时间序列。
- 到点前轻问一句，对照用户自己的话；可拒绝、不追问。
- 时钟控件可参照 `ReminderPreferenceUI`，文案与存储必须分开。
- 点头后是否打开 Work Transition：可选、另写，且须处理未解锁。

合规对照（不当现网文案）：

- 陪伴式（仅当用户设了收工时间）：「你说想 11 点前收工，现在 10:45。要不要一小段收尾？」
- 回顾式（练习纸 · **暂不做**）：「这周有 3 个晚上，坐在凌晨 1 点之后。」

禁止现网与对外说：「本周您连续熬夜 X 小时」「是否考虑改善作息习惯」——不知睡眠、下结论（C-03）、催改（C-04）、滑向健康建议（C-06），且与 T58「只许更安静」相反。

---

## 3. 晚间练习事实（暂不做）

「这周有几个晚上在凌晨 1 点之后还坐着」需要按日保存坐下/结束的本地时分。现网没有这份表：

- `practice-days.v1`：练习日有无，无小时。
- `focus-session-end.v1`：只有**最近一次**结束戳，不够数「3 个晚上」。
- 练习观察纸方向锁：**不新增计数器**。

若将来做：登记 **T62**（与 **T61** 分开）；单独 Brief；同意与披露；进重置/删除名单（吸取 T60）；**不**进 T54 研究分享；只作练习事实、不推送、不带建议。本槽位不做。

---

## 4. 其它习惯场景（本盘点顺带对照，不开工）

| 场景 | 现状 | 本槽位 |
|---|---|---|
| 用户自设收工 / 睡前过渡 | **T61 已合** #1455/#1456；Work Transition 仍可作点头后可选去处 | **T61** 维护 / 验收另排；**不是** T62 |
| 固定练习时间（某事之后坐一次） | 提醒族已有每日时分，不是「某事之后」 | 可排队，让用户自选锚点 |
| 中断后重新开始 | 已在计划（中断后两条路） | 维持 |
| 久坐后伸展 | 已有长坐舒展邀请 | 维持 |
| 练习过量 / 内卷打卡 | 单日软封顶已有 | 保持，不加新催促 |
| 饮食、体重、用药、情绪低落监测 | 无 | **不做**（C-01、C-06） |

**T54** 90 天实验仍搁置。不得暗示睡眠或作息已被评估改善。

---

## 5. 冲突扫描（本文件）

对照场景 **D**（睡→醒）、**AD**（该不该披毯）、**W**（身心免责）、提醒保存、Work Transition、练习纸节奏句、**T52** 三态。

- **强度**：本文件无新开口、无新仪式。
- **语气**：口径禁止「看出熬夜」；与 C-03 / C-04 / C-06 / C-11 一致。现网深夜 toast 维持原句，本步不改。
- **职责**：披毯是阿寅休息；提醒是来坐；收工是用户自己的目标（未实现）。三者不得并成一句睡眠教练。

无用户路径变更。

---

## 6. 给后续 Brief 的约束（**T61**）

以下写入 [`task-user-set-work-end-time.md`](./task-briefs/task-user-set-work-end-time.md)（Brief 待点头），实现不得另造一套：

1. **收工邀请 = T57 邀请族的新种类，并受 T58 暂停规则约束。** 它是新的主动开口通道；用户忽略或拒绝若干次后须暂停数天，不能成为绕开「只许更安静」的后门。
2. **专注进行中让位；每日至多一次。** 用户正在静坐/专注时（例如 10:45 仍坐着），收工邀请须等本场结束再出现；与现有叠层让位、提醒族约一小时一次的限频对齐，不得并行第二套频控。
3. **Work Transition 仅作点头后的可选去处**；须处理未解锁会员的死路（盘点 §2）。
