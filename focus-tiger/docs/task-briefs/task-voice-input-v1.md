# Task Brief · Voice Input V1（Speak to type · Electron / macOS）

> **状态（2026-09-24）**：产品口径已拍板；**本回合只锁 Brief，无运行时。**  
> 挂线：Epic **#5** 苹果 DMG（与壳/公证同发版面；**不**另开语音 Epic）。  
> 实现须另口令。建议顺序：「开工 Voice Input 探针」→（探针及格）「开工 Voice Input 倾诉」→「开工 Voice Input 意图+回顾」。  
> **禁止**未过探针就写产品麦克风、就比较 Whisper / AssemblyAI / Deepgram 准确率表。倾诉强制本机后，云厂商表对倾诉主路径没有投票权。

---

## 拍板（硬 · 2026-09-24）

| 项 | 口径 |
|---|---|
| **产品形态** | **Speak to type**（Voice Input）。转写结果进入当前文本框，用户可改、可再说一遍。**不是**语音消息、不是实时语音对话、不是 Voice Agent。 |
| **架构** | 全产品共用一层输入能力（键盘 ∪ 语音 → 同一段文字）。禁止每个输入框各自接一遍麦克风。 |
| **首发挂载** | **只三处**：① 倾诉 Confide 输入框 ② Arrival Choose **手写意图**（`#arrival-choose-typed-input`）③ Reflection Q1–Q3 文本框。图标点选意图、搜索、标签、设置、反馈、其它框 **不进 V1**。 |
| **壳** | **仅 Electron / macOS DMG。** Web / PWA / 窄屏抽屉 **不露出**麦克风。 |
| **听写语言** | **仅英语。** `PRODUCT_POSITIONING.md` 的英日界面切换不变；日语界面用户仍用键盘。日语听写须市场/PO 另下一句，禁止本任务替定位做决定。 |
| **倾诉转写** | **强制本机。** 倾诉组件实例 **不得注入** Cloud STT Provider（构造期硬约束，不是设置项、不是文案约定）。录音 = 倾诉内容的另一种编码；送云 = 破坏「倾诉不出设备」。 |
| **意图 / 回顾云端** | 仅当本机听写系统性不够 **且** 用户明确同意后，才允许整段云转写。与倾诉隔离。V1 探针阶段 **不上云**。 |
| **计费** | Voice Input **不单独收费**。STT 成本与 Confide / L3 推理成本分开记账。 |
| **监听** | 仅用户点麦克风后开麦；停录即关麦。禁止打开 App / 打开面板后常开监听。 |

**一句话**：电脑版里，用户在倾诉、手写意图、练习后回顾这三处可以说英语，字进原来的框；倾诉的声音不出设备。

---

## 冲突扫描（实现前 · 本回合文档）

对照 `SCENARIO_TESTS.md`。本回合无运行时。实现口令时须再扫一遍。

| 相邻 | 三轴 | 结论 |
|---|---|---|
| **AE Confide** | 职责 | **无冲突**。麦克风只加快打字；发送、危机阀、语料桶、桌面 L2 生成路由不变。禁止把倾诉变成「对阿寅说话的语音通话」。 |
| **AE · Electron 陪伴** | 强度 / 资源 | **无冲突（须守）**。V1 默认 **macOS Speech**，禁止为听写再加载 Whisper/GGUF 与 llama 抢统一内存。Focusing 仍卸载陪伴模型；听写不得在 Focusing 偷偷常驻。 |
| **场景 A / Arrival Choose** | 职责 | **无冲突**。麦克风只出现在 **Write your own** 手写行，不替代六个活动图标，不取消 Skip — begin。 |
| **场景 A / C Reflection** | 职责 / 强度 | **无冲突（须守）**。不改 Skip / Continue / Skip all / wisdom-hold 关卡。转写填入现有 `input`；禁止新模态压过 Reflection。末题共鸣与 `data-wisdom-hold` 契约不动。 |
| **场景 G 日语 UI** | 语气 | **无冲突（切开）**。界面仍可日本語；Speak to type **只声称英语**。禁止日语 locale 下假装能听日语。 |
| **场景 AD 睡态 × Confide** | 人设 | **无冲突**。不新建 Idle 叠层；沿用现网 `dormantWakeOnOpen`。听写中途不得另开一层挡住摸头逃生舱。 |
| **task-desktop-on-device-companion「不含语音」** | 职责 | **无冲突（切开）**。那条锁的是 L2 **不**做语音对话。本能力止于 STT → 文本框 → 原发送路径。 |

**疑点（已拍板，不挡 Brief）**：系统听写质量是否够英语专有词——交给 **探针**，不在 Brief 里预选云厂商。

---

## 共用机制核对

- **overlayBusy**：不新增 overlay 源。听写 chrome 画在现有 Confide / Arrival / Reflection 卡内。Listening 不得另登记 `OVERLAY_SOURCE_CONTRACTS`、不得把 Sit/摸头打成 busy（面板本身已 busy 的维持原表）。
- **HUD 呼吸 / 计时驱动**：听写不驱动 overlayBreathing；Focusing 中本 V1 无麦克风（三处挂载都不在 Focusing 主路径）。
- **z-index / dim**：不新加 z≥17 遮罩。Listening 波形若需要，跟输入框走，**禁止**全屏 dim。Support FAB / 倾听耳 / Ambient 音符核对：**不受影响**（无新遮罩消费者）。
- **新建可点击叠层 / O-04**：不新建。麦克风是既有面板内的控件。若实现误做成独立 overlay，视为超范围，停下来改 Brief。

---

## 分层（实现时锁死）

```text
用户点 🎙（仅此时开麦）
  → 本机录音
  → SpeechToText Provider
       ├── V1 默认：macOS Speech（on-device；倾诉唯一允许）
       ├── 以后：本机 Whisper（Windows / 系统听写不够用）
       └── 可选：云端整段 STT（禁止注入倾诉；意图/回顾须同意）
  → 原始文字写入当前框（可编辑 / Speak again）
  → （既有产品路径）用户点发送 / Confirm / Continue
  → （既有）AI 理解 / 语料 / L2 —— 与 STT 解耦
```

禁止：`麦克风 → LLM`；禁止 Chrome `webkitSpeechRecognition`（Electron 上常出境，看起来像本机）。

Provider 抽象从探针第一天就有（哪怕只有 `MacosSpeechProvider`），产品 UI **不**对普通用户露出 Cloud / On-device 开关。

---

## Slice 0 · 两日探针（第一口令）

**范围**：`focus-tiger/desktop/` 权限 + native 桥 + 实验室入口。**禁止**改 `ConfideToYinUI` / Arrival / Reflection 产品按钮。

必须验证：

1. `Info.plist` `NSMicrophoneUsageDescription` + entitlements `com.apple.security.device.audio-input`（现网 `desktop/entitlements.mac.plist` **尚无**麦克风项；漏了会静默失败 = 交互 bug）。
2. **macOS 本机听写硬约束（先于录音准确率）**：运行时探测 `SFSpeechRecognizer.supportsOnDeviceRecognition`；倾诉路径须设 `recognitionRequest.requiresOnDeviceRecognition = true`。未显式要求时，系统可能在有网时**静默走苹果云端**——转写结果看起来正常，录音却已出境。若本机模型不可用（系统版本 / 英语语言包未下载 / 用户清过模型）→ **可见失败**，禁止静默降级。`allowCloudStt: false` 只挡 Provider 抽象层，挡不住系统 API 默认行为；本条须在第一次「Speak」前过关。
3. 点实验室「Speak」→ 0–1 秒内可见 Listening（或系统权限框）；拒绝权限 → **可见**失败，禁止哑点击。
4. 英语短句 / 带人名或产品词的中长句 / 轻噪音：说完 → Stop → 出字。记下延迟与明显错词，不写选型表。
5. 停录后麦关；不常驻进程。
6. 与本机陪伴 **不同时**重载大模型；探针机若已加载 llama，只记 RSS 是否明显再跳一截。

及格 → 才允许 Slice 1。不及格（英语短句系统性不可用）→ 停，把失败样本交给 PO，**再**评估本机 Whisper；仍 **禁止**给倾诉接云。

---

## Slice 1–2 · 产品挂载（探针及格后另口令）

| Slice | 挂载 | 硬约束 |
|---|---|---|
| **1** | Confide textarea | `allowCloudStt: false` 写死；文案 **Speak to type**；Speak again；失败可见 |
| **2** | Arrival typed row + Reflection `input` | 同一组件；云 Provider **默认不注入**；若日后加云，须独立同意 UI，且 Confide 仍无该参数 |

**0–1 秒（可点击）**：点 🎙 → Listening（或系统权限）。点 Stop → Transcribing 或字出现。权限拒绝 / 无麦 / 超时 → 框旁一句失败，麦关。设计静默不在 `SILENT_BEHAVIORS` → 当 bug。

**已好清单（实现时不得踩）**：Confide 发送与安全阀；Arrival 图标 Choose 与 Skip；Reflection wisdom-hold；菜单逃生舱；Web 无麦。

---

## 明确不做（V1）

- 实时流式对话、TTS、Voice Agent API  
- 全局快捷键（Option+Space 等）→ V1.5+  
- 打开即听、后台听  
- 全输入框铺开  
- 日语 / 汉语听写  
- Web 麦克风  
- 把转写结果直接当任务创建 / 自动发送  
- 保存原始音频当 Voice Message（默认不存；对外口径以实现为准，倾诉路径不得上传）  
- 探针前的云厂商对照表、100–200 条 A/B  

`PRIVACY_NOTICE`：产品挂载 PR **同批**补一句 Speak to type（倾诉 on-device、非语音条）。探针不必改隐私页。

---

## 验收（按口令）

**探针**：Mac `desktop:dev`；英语三条样本；权限拒绝可见；无产品三处麦。TRACKER 标「仅实验室 / 待人工」。

**Slice 1+2**：Electron 宽屏走通三处；Web `?product=1` **无**麦；日语 UI 仍无日语听写声称；倾诉抓包不得见音频上传；回流：说完可改再发送 / Confirm / Continue。

自动化：权限与原生听写 **以人工 + 桌面单测 mock Provider 为主**；禁止把真麦绑进 CI smoke。
