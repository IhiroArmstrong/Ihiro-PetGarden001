# Task Brief · 结束报时长（观察式）

> **状态（2026-10-24）**：PO 书面「Brief 无需点头、立刻连贯执行」。**与 T47 #1404 分 PR**。  
> **类**：**B**（会改 Rise / Reflection / 轻声 / 可选语音播报的结束句）。  
> **父语境**：T45 静坐画面已藏跳动分秒（#1402）；用户结束一场后需要**观察式**知道「大约坐了多久」，不把 HUD 数字找回来。  
> **不是**：T44（系统通知）、T47（收控件）、T50 Phase 1（标签偏置轻声）、新 HUD 开关、Confide 练多久问答。

## 一句话

定时同坐结束（达标或中途 Rise）时，用一句「这一场大约 N 分钟」挂在现有 Rise 后轻声、Reflection 卡片顶、以及 Voice announcements 的结束朗读里；不恢复 Focusing 跳秒。

## 地面真相（`origin/develop` · 2026-10-24）

1. T45：`#hud-time` 等 Focusing 期间视觉藏数字；`FocusSession.getElapsedSeconds()` 仍准。  
2. 达标：`maybeSpeakFocusEndAnnouncement()` 念固定 `system_tts.focus_end`；`SessionEndFlow` → `TigerReflectionMoment.open` 无时长行。  
3. 中途 Rise：`focusSession.stop()` 在 `onSessionEnded` 之前；**须在 stop 前**抓取 elapsed。Rise hold 后进 Reflection；无结束铃、默认无 TTS。  
4. `MomentWhisperUI` 五键一生一次；**本场时长**须走可重复展示的观察行，不得占用 `reflect` 等键的 seen 门闩。

## 已经定下的做法

1. **范围**：正式 `FocusSession` 计时同坐（含 Open-ended、Breath 共用这场 HUD 的 sit）。微仪式 overlay / Honesty 补登 **不**报。  
2. **分钟规则**：`elapsedSeconds < 30` → **不出**时长句（太短）。否则 `minutes = max(1, round(elapsedSeconds / 60))`（四舍五入到整分钟）。文案用「大约 / about」，禁止监工或评分语气。  
3. **Reflection**：`open({ sessionDurationMinutes })` 时在 intention echo **之上**显示一行 `data-testid=reflection-session-duration`（无 intention 时也显示）。  
4. **轻声（Rise 路径）**：Rise 结束、`sessionEndFlow` 调度 Reflection 之前，用 `MomentWhisperUI.tryShowObservationalLine` 展示同一句（不 mark seen；仍受 busy / YPE 总闸）。达标完成路径 **不**再叠轻声（已有庆祝 + Reflection 行 + TTS）。  
5. **语音**：Voice announcements 开时，结束朗读改为带 `{minutes}` 的模板（铃关不影响）。  
6. **不新开关**、不写盘偏好、不改账本 / Journey 字段。

## 变体矩阵

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| Web 固定时长 · 坐满 | 达标 → Reflection | Reflection 顶行「大约 N 分钟」；TTS 开则朗读含 N | 单测分钟规则 + TTS 模板 |
| Web · 中途 Rise ≥30s | Rise | 轻声一行 + Reflection 顶行同句；无结束铃 | 单测 + 可选 e2e 锚点 |
| Web · Rise &lt;30s | 很快起身 | 无时长行、无轻声 | 单测 |
| Open-ended · 坐满 | 正计时藏数字 | 同左，N 来自实际 elapsed | 单测 |
| Breath 共用 Focus HUD | 左球 Breath chip | 同 Focusing 规则 | 记「与 Focus 同模块」 |
| Voice 关 / 窄屏 | 达标 | Reflection 行仍有；TTS 不出 | 现有窄屏 TTS 测保留 |
| en / zh / ja | 同入口 | `session_end.observed_minutes` 三语 | locale 键单测 |
| 微仪式 1min breath | overlay | **不**出时长句 | 不触达路径 |

## 点击反馈（0–1 秒）

| 控件 / 入口 | 点击后 0–1 秒内用户看到什么 | 持久化 |
|---|---|---|
| 观察轻声行 | 同 Moment Whisper：可点消隐 | 不写盘 |
| Reflection 时长行 | 随面板淡入可见 | — |

## 边缘状态

| 边缘 | 行为 |
|---|---|
| Reflection 已开 / Confide busy | 轻声 `busy` 跳过；Reflection 行仍显示 |
| YPE 关 Moment Whisper | 轻声不出；Reflection + TTS（若开）仍可用 |
| 达标与 Rise 同秒竞态 | 以 `completed` 标志区分路径；仅 Rise 走轻声 |
| `getElapsedSeconds` 在 `stop()` 后为 0 | 实现须在 `stop()` **前**缓存秒数 |

## 共用机制核对

本次不新建可点击叠层；轻声复用 `#moment-whisper` 样式。核对后确认 **不**新增 overlayBusy 源；Support FAB / 倾听耳不被改 dim。HUD 驱动不改（只读 elapsed）。**不**改 `Z_INDEX.md`。

## 语气（产品）

观察句 only：「这一场大约 12 分钟。」禁止「你坐了不够久」「目标 25 你只有 10」。

## 验收

- `npm run test:unit -- sessionEndObservedDuration systemTtsAnnouncements TigerReflectionMoment`（或仓库等价命令）绿  
- 人工：`?product=1` 坐满 + Rise 各一场，看 Reflection 顶行与 Rise 轻声
