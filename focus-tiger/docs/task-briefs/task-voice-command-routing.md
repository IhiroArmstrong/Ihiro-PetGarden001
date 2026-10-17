# Task Brief B · Voice Command Routing（说一句话 → 白名单动作）

> **状态**：PO 已拍板入口与边界（2026-09-28）。**无运行时。** 依赖 Brief A。  
> **不是** STT 的顺手延伸。转写进文本框仍是 Voice Input V1；本能力是新的命令路由。

## 已拍板（2026-09-28）

| 项 | 口径 |
|---|---|
| 入口 | **曾拍：独立于 Confide**（D1-A）。倾诉人格永不执行 Operating；命令文字不进倾诉语料。 **2026-10-17 T10**：改为与 Confide 内称呼词捷径**并存**（称呼词第一刀、独立入口第二刀）。见 [`task-yin-voice-command-entry.md`](./task-yin-voice-command-entry.md)。 |
| V1 动作 | **只做开始专注**（含时长、含 Open-ended）。 |
| 解析 | **规则**（关键词 + 时长 + 同义词）。不调本机陪伴模型。 |
| 「L2 不含语音」 | **不触碰**。路径是 STT → 规则 → 既有开始专注入口。无 TTS、无对话。与 [`tts-v1-decision-memo.md`](../decisions/tts-v1-decision-memo.md) 决策 3 同一解释。 |
| 缺时长 | **追问一句**（25 / 50 / Open-ended）。不静默猜，也不默认沿用上次时长。 |
| 听写 | 复用 macOS Speech on-device。禁止云 STT。仅英语。仅 Electron / macOS 宽屏。日语界面与 Web 不露出。 |
| 不确定 | unknown 或带情绪的句子不执行。 |
| 低风险 | 开始计时直接执行，并给可撤销提示。 |

入口在界面上的位置、撤销条停留时长：**时长板 V1 仍待设计**。时长板这条路径 **V1 不做全局快捷键**。**T10** 第一刀按键说话（Confide 称呼词通道）另锁，见 [`task-yin-voice-command-entry.md`](./task-yin-voice-command-entry.md) §12。

## 现网核对（2026-09-28）

| 项 | 现网 |
|---|---|
| Voice Input V1 | Brief [`task-voice-input-v1.md`](./task-voice-input-v1.md)：只挂 Confide、Arrival 手写意图、Reflection。麦克风仅点击后开。命令入口不得塞进这三处。 |
| Confide | 时长板命令麦 **不得**塞进倾诉听写。**T10**：称呼词门闩加在发送路径前，不是把时长板解析器塞进倾诉组件。 |
| 开始专注 | 场景 T：chip 点选后进入 Focusing。语音只能调用同一入口，不绕过 Arrival / Skip。 |
| 新浮层 | Voice Input 禁止新 overlay。命令入口优先做成既有面板里的控件；若做成独立浮层，须先登记 z-index / overlay，并停下来改本 Brief。 |

## 句式（V1 golden set · 解析器尚未写）

| 用户说 | 结果 |
|---|---|
| Start a 25-minute focus | 专注 25 分钟 |
| I need to focus for an hour | 专注 60 分钟 |
| Start a pomodoro / Pomodoro | 专注 25 分钟 |
| Start focusing / I need to focus | 缺时长 → 追问 |
| Focus with no time limit / Start open-ended focus | Open-ended |
| Focus for ninety minutes | 专注 90 分钟 |
| I just want to stop everything | 不执行 |
| Stop / Cancel | V1 不支持，提示不执行 |

超过 24 小时的解析结果拒绝。这张表是 Brief C 文案的唯一来源。

## Slices

| Slice | 状态 |
|---|---|
| 0 · RuleParser 单测 | 已合：`parseVoiceCommandDuration` 只判断坐多久 |
| 1 · 入口 + STT + 开始专注 + 撤销 | **本分支**：`#focus-duration-picker` 标题行 🎙（英语 + Electron 宽屏）；STT → 规则 → `beginFocusWithMode` + Undo 条 |
| 2 · 追问与失败文案 | **本分支**：缺时长 → 追问句 + chip **25 / 50 / Open-ended**（点选即开表 + Undo）；拒绝 / Stop 仍红字 |
| 3 · 更多动作 | [`task-voice-command-slice3.md`](./task-voice-command-slice3.md) 已点头：坐着说结束 = 点 Rise |

## 明确不做

时长板 V1：无 TTS、无连续对话、无全局快捷键、不清空/发送/删除、无云端解析、无日语或中文命令、不把命令写入倾诉语料。  
**T10 另锁**（不改上列时长板 V1）：称呼词捷径、按键说话、指令结果必声、备份 B 档。
