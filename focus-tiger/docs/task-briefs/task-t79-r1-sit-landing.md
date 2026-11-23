# Task Brief · T79-R1 带着问题坐 · 坐画面问题行 + 落地屏主次

> **状态（2026-11-23）**：**Brief 已点头**（PO：倒计时不要分秒；四条锁定；同意 sitting-picture 轻量方案）。  
> **代号**：T79-R1。人话：带着问题坐的那几分钟，栖居里只留问题一行；提前结束后的落地屏不再像被推进接地练习。  
> **类**：**B**（文案、按钮主次、坐步可见字、HUD 日进度观感）。  
> **槽位**：可选。拆 **docs 本 PR** + **PR1 落地** + **PR2 坐步/HUD**。  
> **不是**：FocusSession / `beginFocusWithMode` / 莲花分钟 / 练习日。**不是** 删掉每轮落地。**不是** 复用正式和寅坐会话。

父 Brief：[`task-t79-contemplative-inquiry.md`](./task-t79-contemplative-inquiry.md)。坐画面对齐（已合 #1824）：[`task-t79-sitting-picture-parity.md`](./task-t79-sitting-picture-parity.md)。  
刀 Brief：[`task-t79-r1-landing-copy.md`](./task-t79-r1-landing-copy.md) · [`task-t79-r1-sit-question-hud.md`](./task-t79-r1-sit-question-hud.md)。

---

## 0. 大白话

「带着问题坐」已经和主静坐同一套栖居画面（卡片透明、HUD 不跳秒）。还缺三件：坐的时候看不见那句问题；落地后主按钮会打开接地；左上角日进度条会把这五分钟画进去（账本没写）。这次修这三件。不把这场算成正式专注。

**图一 4:44：** 2026-11-20 22:34 左右的测试截图是当时实时产品。sitting-picture（#1824）合入时间是 **2026-11-21 01:13 +0800**。截图早于合入，所以当时现网仍是大号倒计时卡；不是「乱猜旧构建」，也不是 11-23 的 `origin/develop` tip。

**倒计时（PO 2026-11-23）**：**不要**可见分秒。屏上只留问题一行 + 很淡的 End early。五分钟到时淡入第 4 步。间隔钵/结束轻响不进本修订。

---

## 1. 已拍板

| 项 | 口径 |
|---|---|
| 画面 | 保持现网 sitting-picture（栖居 + 寅）。不调用 `beginFocusWithMode`、`FocusSession`、开坐即播、间隔钵。 |
| 计时 | 5 分钟独立墙钟；HUD 藏秒；屏上不分秒。 |
| 文案 | 坐步只显示本轮问题一行。 |
| 退出 | End early；不问为什么离开；仍直达落地（跳过感受步）。 |
| 音乐 | 不主动播。用户已在播是否暂停/降音量：PR2 评估，不写 `focus-tiger.ambient-pref.v1`。 |
| 统计 | 不进 Focus 芯片、练习日、莲花、成长旅程。HUD 日进度条 **不计入** 这 5 分钟。 |
| 落地 | 每轮必落地。标题「回到当下」类。主按钮完成/关闭。次按钮感受地面 → 现有 Ground 选择层。 |

---

## 2. 冲突扫描（对照 `SCENARIO_TESTS`）

相邻：主静坐 / T45 藏秒、接地练习、T51 觉照邀请、Quiet Line、T79 防火墙。

| 轴 | 结论 |
|---|---|
| a. 强度 | 落地文案变短、主按钮只关卡，比「必须走接地」更轻。坐步仍约五分钟，仅用户点进。 |
| b. 语气 | 去掉预设不适长句；不教练、不功效。 |
| c. 职责 | 不替代和寅坐与 Quiet Line。接地仍可达，只降为次按钮。不进成长账本。 |

无冲突疑点；与 T45 一致（不跳秒）。

---

## 3. §sit 步（替换原 T79 坐条款）

- 画面：sitting-picture。不复用 Focus 会话。  
- 计时：独立 5 分钟墙钟；HUD 藏秒；屏上不分秒。  
- 文案：本轮问题一行，不加讲解。  
- 退出：End early，不问离开原因。  
- 音乐：不主动播放。  
- 统计：HUD 日进度条不计入这 5 分钟。

## 4. §landing 步（替换原 T79 落地条款）

- 每轮必落地；提前结束直达落地。  
- 标题「回到当下」类。  
- 文案一两句可选邀请，不预设不适。  
- 主按钮完成/关闭。次按钮感受地面 → `onLand` → `groundExerciseChoiceUI.open()`。  
- `onLand` 与成长账本无关。

**不变：** 防火墙 → 抛问 → 邀请闭眼 → 约 5 分钟 → 可选感受四选项 → 落地；不走倾诉生成；不替代主按钮和寅坐与 Quiet Line。

---

## 5. 变体矩阵（A10）

| 变体 | 预期 | 自动化 |
|---|---|---|
| en/ja/zh 落地 | 三语标题/短文案/完成+感受地面 | locale 切片 + 单测键 |
| 提前结束 | 跳过感受步，进落地 | `_goLanding('')`；e2e PR1 |
| 坐满 | 第 4 步 → 落地 | e2e PR2（缩短墙钟） |
| 宽/窄 | 同一卡 | 无分叉 |
| 正式 Focusing | 日进度仍计入正在进行的专注 | 单测：inquiry 置 0 不影响 Focusing |

---

## 6. 点击反馈（0–1 秒）（A14）

| 控件 | 0–1 秒 | 持久化 |
|---|---|---|
| End early | 落地卡展开；不问为什么 | 回访 +1（现网 landing） |
| 完成 | 卡收，回 Idle | 无账本 |
| 感受地面 | 卡收，Ground 选择层可见 | 无账本 |
| 坐步空白 | **不**关整场（遮罩已收；Esc 仍可关） | — |

---

## 7. 边缘状态（A14）

| 边缘 | 预期 |
|---|---|
| 专注进行中点本行 | 仍先 Rise（现网 yield）；本修订不改 |
| 用户 Idle 已开音乐 | 不写偏好键；本刀默认不 pause（PR2 评估可跳过） |
| Support 开着 | 不压付款卡 |
| 5 分钟到 | 淡入第 4 步，不是接地 |

---

## 8. 共用机制核对

- overlayBusy：坐步仍 `contemplativeInquiryOpen` / `inquirySitting`。不新开 overlay 文件。  
- HUD：`liveClockOverlay: !inquirySitting` 保持；**inquiry 路径 `liveSessionMinutes` 为 0**。正式 Focusing 不变。  
- z-index：仍玻璃卡；坐步透明。禁止 inline 压 Support。  
- O-04：不新增 `OVERLAY_UI_SURFACE` 行；PR1 建议把 `ContemplativeInquiryUI.js` 的 e2eOverlap / trackerCoverage 指向新 spec。

---

## 9. 已好清单

- Quiet Line、T51、Focus 芯片 10/15/25/45 不变。  
- Support FAB / 付款可点。  
- 菜单逃生舱。  
- 正式和寅坐：开坐即播、间隔钵、练习日/莲花写入不变。  
- sitting-picture：栖居可见、HUD 不跳秒。  
- 提前结束仍落地；第四选项仍 Exit B。

---

## 10. 拆 PR

1. **docs-only**：本文件 + 两刀 Brief + 父 Brief 坐/落地条款指向 R1。  
2. **PR1**：只改落地标题/文案/按钮主次。  
3. **PR2**：问题一行可见；HUD 日进度不计入；不恢复大号倒计时。

间隔钵/结束轻响 = 后续议题，不进 R1。
