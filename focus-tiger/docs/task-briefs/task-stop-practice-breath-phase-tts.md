# Task Brief · T27 练习中停 inhale / exhale 语音

> **状态（2026-10-20）**：**待 PO 点头。** 点头后新 Chat 开工 `fix/stop-practice-breath-phase-tts`。  
> **类**：**B**（练习进行中不再听到吸气/呼气播报）。  
> **代号**：**T27**。**不是**关掉全部 Voice announcements，**不是**停结束句。  
> **拍板入口**：2026-10-20 用户书面：任何练习中间都无需语音播放 inhale, exhale。其它播放可以。

## 一句话

所有练习进行中，系统语音不再念 Inhale / Exhale。专注结束句、仪式完成句、其它已有播报保留。全局 Voice announcements 开关仍管那些「其它播放」。

## 已经定下的做法

1. **停的只有相位句。** 入口是 `maybeSpeakBreathPhaseCue`（locale `HONESTY_BREATH_INHALE` / `HONESTY_BREATH_EXHALE`）。四处调用：Arrival、Honesty 呼吸段、Ritual、MicroRitual。本刀让该函数不再发声（调用方可留，以免漏接；单测锁「返回 false 且不 speak」）。
2. **保留**：`maybeSpeakPracticeAnnouncement` / `maybeSpeakFocusEndAnnouncement`；Confide 朗读（独立开关）；Voice announcements 菜单行与偏好存储。
3. **范围**：任何练习中间。不按种类再开例外。Web / 窄屏本来就不能系统 TTS（`canUseSystemTts`），行为已是静音，保持。
4. **不改**呼吸动画、计时、文案字幕（若界面上仍有吸呼字，那是视觉，不是本刀 TTS）。

## 变体矩阵

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| Arrival 呼吸段 | Electron 宽屏、Voice announcements 开 | 进行中无 inhale/exhale 声 | 本刀补 `maybeSpeakBreathPhaseCue` 单测 |
| Honesty 呼吸 | 同上 | 同上 | 同上（scope 分开也不念） |
| Ritual 呼吸 | 同上 | 同上 | 同上 |
| MicroRitual 呼吸 | 同上 | 同上 | 同上 |
| 专注结束 | 开关开 | 结束句仍可播 | 现有 focus-end 测试保持 |
| 仪式完成等其它 cue | 开关开 | 仍可播 | 现有公告测试保持 |
| 开关关 | 任意练习 | 零系统 TTS（现网） | 现有 preference 测试 |
| Web / 窄屏 | 无桌面 TTS 桥 | 仍无相位声 | 现网 `canUseSystemTts` |
| Confide 朗读 | 倾诉回复 | 不受本刀影响 | 不改 Confide TTS 路径 |

## 点击反馈（0–1 秒）

| 控件 / 入口 | 点击后 0–1 秒内用户看到什么 | 持久化时：挂起 / 成功 / 失败 |
|---|---|---|
| Voice announcements 开关 | 与现网相同（开/关可见） | 仍写现有 preference |
| 开始练习 | 计时/呼吸画面照常；**不再**因相位 TTS 出声 | 不写盘 |

本次不新增可点击控件。开关与练习开始的反馈不改，只去掉进行中的相位声。

## 边缘状态

| 边缘状态 | 预期（含 0–1 秒反馈） |
|---|---|
| 开关开 + 练习中 | 无 inhale/exhale；结束时仍可有结束句 |
| 开关关 | 全程无系统 TTS |
| 连续两场练习 | 第二场中间仍不念相位 |
| 中文界面 | 相位句本来就可能无中文音色；本刀后中英日中间都不念 |

## 冲突扫描

对照 System TTS V1、Voice announcements 开关、Confide TTS、呼吸练习画面。

| 轴 | 判断 |
|---|---|
| 强度 | 更安静，不加重。 |
| 语气 | 不新增句子。 |
| 职责 | 系统播报仍不是阿寅对口型。倾诉朗读切开。 |

无未决冲突。有意改掉的现网行为：开关开时练习中的吸呼相位 TTS。

## 共用机制核对

本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层，核对跳过。HUD 呼吸计时画面保留；只停 TTS 句，不拆呼吸驱动者表。

## 范围（out）

- 不默认关掉 Voice announcements。
- 不停结束句和其它非相位公告。
- 不改 Confide。
- 不并进 T25 / T26。

## 开工闸

须 PO 书面点头本页。口令「立刻开工」不能跳过。点头后新 Chat 实现。
