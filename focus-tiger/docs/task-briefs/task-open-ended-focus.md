# Task Brief A · Open-ended Focus（开放式计时 · 正计时）

> **状态**：Slice 0–1 已合入 develop（#1003 + slice1 PR）。B/C 仍待语音与冷启动文案。  
> **顺序**：A → B（命令路由）→ C（冷启动文案）。C 在 B 的解析器实测通过之前不得上线。

## 已拍板（2026-09-28 · 2026-09-29 复核）

| 项 | 口径 |
|---|---|
| 形态 | 固定时长之外新增 **Open-ended**：正计时，不假装倒计时。 |
| 硬上限 | **24 小时**，到点自动结束，走既有收尾。 |
| 温和提示 | **默认开启**。90 分钟、3 小时各一次。可关。非模态，不打断计时，不调 L2。 |
| 休眠 / 暂停 | 不计专注时长。同一扣除桶：手动暂停与系统休眠。 |
| 崩溃恢复 | 问一次：Resume，或 End at last active time。禁止按墙钟把死机空档补进时长。 |
| 奖励封顶 | **20 小时**。只封奖励与成长计入，不缩短用户看见的计时。 |
| 健康 | 24 小时是安全上限，文案不得夸奖「越久越好」。 |
| **Web** | **先不做**。仅 Electron / macOS DMG 露出 Open-ended chip。 |
| **Reflection** | **先不改**。超长会话仍走现有回顾关卡与文案。 |
| **入口语义** | Open-ended 是**独立分支**（`durationMode: open`），不是把 90 分钟上限调大，也不复用分钟 chip 的数值语义。 |

## 现网核对（2026-09-29）

| 项 | 现网 |
|---|---|
| 计时驱动 | `FocusSession.getElapsedSeconds()` 墙钟减 pause；open 模式封顶 24h。 |
| 固定时长 | chip **10 / 15 / 25 / 45**；`setTargetMinutes` 仍夹 1–90，且会切回 `fixed`。 |
| Slice 1 | 桌面壳时长选择器多 **Open-ended** chip；HUD 正计时（≥1h 显示 `H:MM:SS`）；目标行显示「Open-ended / 不限时长」。Rise 仍走未完成收尾；24h 自动达标收尾。 |
| 休眠检测 | 仍未接线 `powerMonitor`（Slice 3 或后续）。 |
| 温和提示 | 开放式 Focusing 满 90 分钟、3 小时各出一次静态短句。默认开，条上可关。不暂停计时，不调陪伴模型。验收可用 `?openEndedNudgePreview=90` 或 `=3h` 立刻看到对应一句，不替代正式时刻。 |
| 奖励 | `resolveTimedAwardMinutes()` 在 open 完成时按 20h 封顶计分钟；日寅币池规则不变。 |

## Slices

| Slice | 状态 | 内容 |
|---|---|---|
| **0 · 规则** | ✅ develop | `openEndedFocus.js` 单测 |
| **1 · 入口 + 正计时 UI** | ✅ develop | 独立 Open-ended chip（仅桌面）；HUD 正计时；24h 自动结束 |
| **2 · 温和提示** | 🚧 slice2 分支 | 90 分钟 / 3 小时各一次；默认可关；非模态 |
| **3 · 崩溃恢复** | 未做 | Resume / End at last active time UI |

## 明确不做（V1）

超过 24 小时；假倒计时；Web 端 Open-ended；Reflection 另写一套；提示时调用陪伴模型；与语音命令联动（Brief B）。
