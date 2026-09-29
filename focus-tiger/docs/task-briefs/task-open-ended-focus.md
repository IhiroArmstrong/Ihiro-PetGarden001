# Task Brief A · Open-ended Focus（开放式计时 · 正计时）

> **状态**：PO 已拍板可开工的口径（2026-09-28）。Slice 0 纯逻辑已落地，**未接 UI**。  
> **顺序**：A → B（命令路由）→ C（冷启动文案）。C 在 B 的解析器实测通过之前不得上线。

## 已拍板（2026-09-28）

| 项 | 口径 |
|---|---|
| 形态 | 固定时长之外新增 **Open-ended**：正计时，不假装倒计时。 |
| 硬上限 | **24 小时**，到点自动结束，走既有收尾。 |
| 温和提示 | **默认开启**。90 分钟、3 小时各一次。可关。非模态，不打断计时，不调 L2。 |
| 休眠 / 暂停 | 不计专注时长。同一扣除桶：手动暂停与系统休眠。 |
| 崩溃恢复 | 问一次：Resume，或 End at last active time。禁止按墙钟把死机空档补进时长。 |
| 奖励封顶 | **20 小时**。只封奖励与成长计入，不缩短用户看见的计时。 |
| 健康 | 24 小时是安全上限，文案不得夸奖「越久越好」。 |

## 现网核对（2026-09-28）

| 草案里的「待核对」 | 现网 |
|---|---|
| 计时驱动 | `FocusSession.getElapsedSeconds()` 已是墙钟减 `pausedAccumulatedMs`，不是 `setInterval` 累加。开放式应沿用这套，不另做 ticker。 |
| 时长档 | `focusDuration.js`：chip **10 / 15 / 25 / 45**，默认 10。`setTargetMinutes` **夹在 1–90 分钟**。开放式不能走这个夹取。 |
| 手动暂停 | `FocusSession.pause()` / `resume()` 存在，完成达标时 `main.js` 会 `pause()`。没有独立的「专注中暂停」产品按钮。扣除规则与休眠共用。 |
| 休眠检测 | **没有** `powerMonitor`。Slice 0 只提供 `beginOpenGap` / `closeOpenGap`。Electron 休眠接线留到后面的 slice。 |
| 奖励 | `focusCoinsLedger.js`：Stay 每 5 分钟 1 点，日时长池顶 **36** 点，日总顶 **48** 点。20 小时封顶是**本场计入分钟**的新闸，尚未接到发币。 |
| HUD / overlay | Slice 0 **不**新增 overlay、不改呼吸计时。 |

## 数据模型（Slice 0 已锁）

```text
elapsed = min(24h, now − startedAt − pausedTotal − openGap)
rewardCredit = min(20h, elapsed)
```

实现：[`openEndedFocus.js`](../../src/core/openEndedFocus.js)。未接入 `FocusSession` 或界面。

## Slices

| Slice | 状态 | 内容 |
|---|---|---|
| **0 · 规则** | 已写单测 | 正计时、休眠/暂停扣除、跨午夜、24h 封顶、20h 奖励封顶、崩溃不补时、90 分钟与 3 小时提示点 |
| **1 · 入口 + 正计时 UI** | 未做 | 时长选择加 Open-ended；HUD 正计时；结束走既有收尾。固定时长零回归。 |
| **2 · 温和提示** | 未做 | 静态文案；可关闭并记住。无新 overlay。 |
| **3 · 崩溃恢复** | 未做 | 重启后的 Resume / End 界面。逻辑已在 Slice 0。 |

## 明确不做（V1）

超过 24 小时；假倒计时；提示时调用陪伴模型；无封顶奖励；与语音命令联动（属于 Brief B）。

## 仍待拍板

1. Web 端是否也提供 Open-ended。（我认为最合理：先只做 Electron / macOS，与语音命令同一壳；Web 固定时长保持不变。）
2. 超长会话结束后的 Reflection 文案是否区分。（我认为最合理：V1 不改 Reflection 关卡，文案不另写一套。）
