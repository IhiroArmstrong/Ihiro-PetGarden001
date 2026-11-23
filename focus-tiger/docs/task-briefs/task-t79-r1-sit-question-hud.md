# Task Brief · T79-R1 PR2 sit 步问题一行 + HUD 日进度不计入

> **状态（2026-11-23）**：**Brief 已点头**（倒计时不要分秒）。**实现本 PR**。  
> **类**：**B**。  
> **不依赖 PR1**（可与落地文案并行；建议 PR1 先合）。  
> **不是**：`beginFocusWithMode` / `FocusSession` / 开坐即播 / 间隔钵 / 成长写入 / 恢复大号 4:44。

父 Brief：[`task-t79-r1-sit-landing.md`](./task-t79-r1-sit-landing.md)。

---

## 0. 大白话

开始坐之后，栖居还在，倒计时不要跳出来。把那句问题留在屏上。左上角今天的进度条不要把这五分钟算进去。

---

## 1. 改动

1. 取消对**问题一行**的 clip；sit 步 DOM 渲染问题（`contemplative-inquiry-question`）。钟仍可在 DOM 给墙钟用，视觉藏。  
2. End early 保留，样式更淡。sit 步空白点击不关整场。  
3. HUD：`inquirySitting` 时日进度 `liveSessionMinutes` 为 0。`treatAsFocusing` 仍可用于静坐画面。正式 Focusing 不变。  
4. 5 分钟到时：现网淡入第 4 步。  
5. 不调用 `startSittingMusic`。用户已在播：本刀 **不做** pause/duck（评估结论：Idle 默认静音，不写偏好键）。  
6. 禁止成长写入列表见父 Brief。

STYLE_ID 须升版（现网 `contemplative-inquiry-card-styles-v1` 注入后不更新），避免长会话仍用旧 CSS。

---

## 2. 冲突扫描

与 T45 藏秒一致。问题一行不是讲解。职责不叠正式专注。无冲突疑点。

---

## 3. 变体矩阵（A10）

| 变体 | 预期 |
|---|---|
| en/ja/zh 坐步 | 可见本轮问题；不可见 MM:SS |
| 宽/窄 | 同一 sitting-picture |
| 正式 Focusing | 日进度仍含本场 live 分钟 |

## 4. 点击反馈（A14）

开始坐：0–1s 玻璃收、见栖居 + 问题一行 + 淡 End early。提前结束：落地卡。空白：不关。

## 5. 边缘状态（A14）

专注中仍 yield。付款 z 不改。Esc 仍可关（现网 escape stack）。

## 6. 共用机制

- overlayBusy：仍计入。  
- HUD：藏秒保持；inquiry 不计入日进度条。  
- O-04：不新增行；读者字段可注明 sit 步空白不关。

## 7. 已好清单

正式和寅坐开坐即播与账本。T45 藏秒。提前结束仍落地。不进芯片。

## 8. 验收

- 坐时可见问题、不可见分秒。  
- 日进度条不涨。  
- 成长账本零写入。  
- 单测：sitting-picture 允许问题可见、禁 FocusSession；inquiry live minutes 0；Focusing 不受影响。  
- e2e：缩短墙钟后 坐满→第 4 步→落地（完成按钮若 PR1 未合则点现网关闭）。  
- overlay-contract 过。
