# Task Brief · System TTS V1（系统播报 + 全局声音开关 · macOS）

> **状态（2026-09-26）**：产品口径已拍板；**Slice 0 探针已开工**（实验室 `companion:system-tts-probe`）；产品播报点仍待探针及格口令。  
> 决策纪要：`decisions/tts-v1-decision-memo.md`  
> 挂线：Epic **#5** 苹果 DMG（与 Voice Input 同壳；**不**另开语音 Epic）。  
> 实现须另口令。建议顺序：「开工 System TTS 探针」→（探针及格）「开工 System TTS 播报」。  
> **禁止**未过探针就挂产品播报点。

---

## 拍板（硬 · 2026-09-26）

| 项 | 口径 |
|---|---|
| **产品形态** | **System TTS**。把已有 i18n 系统短句用 macOS 本机合成念出来；**不是** Voice Agent、**不是**语音通话、**不是**阿寅对口型说话。 |
| **本期范围** | 仅**功能性播报**（专注结束、仪式提示等）+ **全局声音开关（默认关）**。 |
| **本期不做** | Confide 回复朗读 → 下一期 backlog（原则已改完，另开 Brief）。 |
| **壳** | **仅 Electron / macOS DMG。** Web / PWA / 窄屏 **不露出**朗读。 |
| **语言** | 朗读语言 **跟随界面语言**（英/日优先）；不默认中文音色。 |
| **安全** | 危机句、安全转介 **不朗读**，继续纯文字。 |
| **与 STT** | 共用 `macos-speech-helper.swift` native 桥；**开关独立**（听写开 ≠ 朗读开）。 |

**一句话**：电脑版里，用户主动打开全局声音后，专注结束等时刻会听到简短系统话（可配木鱼/颂钵）；默认安静。

---

## 冲突扫描（实现前 · 本回合文档）

对照 `SCENARIO_TESTS.md`。本回合无运行时。实现口令时须再扫一遍。

| 相邻 | 三轴 | 结论 |
|---|---|---|
| **Voice Input V1（STT）** | 职责 | **无冲突（须守）**。共用 native 桥；TTS 不需麦克风权限；开关分离。 |
| **task-desktop-on-device-companion「不含语音」** | 职责 | **无冲突**。锁的是 L2 **不**做语音对话；本能力是系统播报，不是对话。 |
| **PRINCIPLES「语音边界原则」** | 人设 | **无冲突（须守）**。禁止对口型；系统声 ≠ 阿寅在说话。 |
| **场景 · Focusing 结束** | 强度 | **无冲突（须守）**。播报须柔和、短句；默认关；不得惊吓式音量。 |
| **场景 · Confide / 危机阀** | 职责 | **无冲突（切开）**。本期不朗读 Confide；未来第二期仍 **跳过** crisis / safety 文案。 |
| **Ambient Soundscape** | 强度 | **无冲突（须守）**。木鱼/颂钵与 ambient 可同时存在时须 ducking 或互斥策略，实现时 Brief 补一句。 |

---

## 分层（实现时锁死）

```text
全局声音开关（默认 off，localStorage 或既有设置面）
  → 用户打开后
  → 产品事件（专注结束、仪式提示……）
  → TextToSpeech Provider
       └── V1 唯一：macOS AVSpeechSynthesizer（via macos-speech-helper speak）
  → 可选：木鱼/颂钵音效（现有 audio 资产或短 sample）
```

禁止：`朗读 → LLM`；禁止 Chrome `speechSynthesis` 作产品主路径；禁止默认自动开声。

---

## Slice 0 · 探针（第一口令）

**范围**：`focus-tiger/desktop/` 在 `macos-speech-helper.swift` 加 `speak` 子命令 + 实验室入口。**禁止**改专注结束等产品路径。

必须验证：

1. 实验室「Speak test」→ 0–1 秒内开始朗读；英/日各一句样本。
2. 语速偏慢（禅意、不机械）；可停/可打断（`stopSpeaking`）。
3. 无网络依赖；文字不出设备。
4. 与 STT 探针 **不同时**抢麦；TTS **不需要**麦克风 entitlement。
5. 与本机陪伴模型同时存在时记 RSS；Focusing 中不偷偷常驻 TTS 进程。

及格 → 才允许 Slice 1。不及格 → 停，把样本交给 PO。

---

## Slice 1 · 产品挂载（探针及格后另口令）

| 挂载点 | 说明 | 硬约束 |
|---|---|---|
| **全局开关** | 设置或 ⋯ 菜单内；默认 **关** | 关时 **零** TTS；须有 0–1s 可见反馈 |
| **专注结束** | 现有 i18n 短句之一 | 仅宽屏 Electron；开关开才播 |
| **仪式提示（可选 V1.1）** | Recover / 一炷香等已审短句 | 同开关；禁止长段落 |

**0–1 秒（可点击）**：打开开关 → 可见 on 状态。专注结束 → 听到短句（或木鱼+短句）。关开关 → 之后静默。

**已好清单（实现时不得踩）**：菜单逃生舱；Web 无朗读；危机句不朗读；Sit/Rise 文案节奏；Celebrating 强度不被语音盖过。

---

## 明确不做（V1）

- Confide 回复朗读（下一期）
- 真人配音 / lip-sync
- 语音通话 / Voice Agent
- 默认自动朗读
- Web 朗读
- 危机句 / 安全转介朗读
- 与 STT 合并成一个「语音总开关」

`PRIVACY_NOTICE`：产品挂载 PR **同批**补一句 System TTS（本机合成、默认关、非语音对话）。探针不必改隐私页。

---

## 验收（按口令）

**探针**：Mac `desktop:dev`；英/日各一句；可打断。TRACKER 标「仅实验室 / 待人工」。

**Slice 1**：Electron 宽屏；开关默认关；开开关后专注结束可听；Web `?product=1` **无**朗读；关开关后回流静默。

自动化：原生 speak **以人工 + 桌面单测 mock Provider 为主**；禁止把真扬声器绑进 CI smoke。
