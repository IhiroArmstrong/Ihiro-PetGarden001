# Task Brief：Guided Meditation 脚本课 v1

> 状态：**PO 2026-11-14 点头 · 开工**  
> 类：**B**（菜单课目录、播放页、语音、计入、Help 邻接口径）  
> 口令：`大任务 · 按脚本冥想 Brief 开工`  
> 依赖：已合视频 MVP 壳（#1567 等）；本刀 **supersede 列表与播放器行为**，**不删** R2 / T88 代码  
> 脚本原文：用户 2026-11-13 粘贴 Set 1–3；入库见 [`task-entries/guided-meditation-script-v1.md`](../task-entries/guided-meditation-script-v1.md)

---

## 0. 大白话

菜单里的「引导冥想」改成 **三套英文步骤课**：系统一句一句念（电脑版），屏幕只显示当前那句；静默时配乐继续、呼吸光圈转，**不显示秒数、不播视频**。Yin 仍坐着陪。网页没有系统朗读时走 **纯文字 + 静默**。练完或有效满约一分钟记入练习账。

**五项拍板（PO 2026-11-14，不再议）：**

1. **计入**：完课 **或** 有效练习秒 ≥ **60** → `onPracticeDay`（`sourceId: guided-meditation`）。  
2. **切后台**：自动暂停；静默计时冻结。  
3. **语音**：课内 **Voice guidance 独立开关**（默认开）；**不**要求先开 ⋯ → Voice announcements；关声 = 文字 + 静默光圈。  
4. **Web**：P1 = 文字 + 静默，标明「语音指导需桌面版」；**禁止** Chrome `speechSynthesis` 作主路径。  
5. **视频线**：搁置 R2 新投入；**保留代码**；列表只显示三套脚本课。

---

## 1. 产品定义

引导冥想 = App 内 **有步骤的正念短课**（脚本 + 可选系统朗读），不是视频课。

| 邻接 | 边界 |
|---|---|
| Sit with Yin | 仍无语音同坐；Help KB-EDU-0003 不改口 |
| Ground / Look around | 逐步文案，但无本课计入、无长静默 |
| 旧 MP4 两课 | 隐藏不删；`delivery: video` 代码搁置 |

冷启动第五项、久坐联动 Set 2、第四课「睡前」、ja/zh 全文脚本、预录音 B、时长三档 UI → **本 PR 不做**（P2+）。

---

## 2. 切片（本 PR = P1）

| 切片 | 内容 | 本 PR |
|---|---|---|
| P1a | 三课 JSON/catalog + `isGuidedMeditationAvailable`（有脚本即显菜单，不依赖 R2 SHA） | 必须 |
| P1b | `guidedMeditationScriptEngine`：speak→silence；暂停/跳步；TTS 超时兜底 | 必须 |
| P1c | `guidedMeditationSpeech` 专用通道（**不用** `maybeSpeakPracticeAnnouncement`） | 必须 |
| P1d | `GuidedMeditationUI`：三课卡、无 `<video>`；陪伴说明 + 当前句 + 静默呼吸光圈 | 必须 |
| P1e | 有效秒计入 + `resolveGuidedMeditationCredit` 脚本规则；忙会话加强 | 必须 |
| P1f | 配乐 duck；`visibilitychange` 自动暂停 | 必须 |
| P1g | e2e 菜单→选课→完课或 ≥60s 计入 | 必须 |

---

## 3. 变体矩阵（A10）

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| 宽屏 ⋯ Practice | Idle，脚本目录非空 | 0–1s 见 Guided meditation 行；点开三课卡 | e2e `guided-meditation-mvp.spec.js` |
| 窄屏抽屉 | 同上 | 同行出现；点开同一列表 | 菜单可达网既有 proxy |
| Electron 宽屏 + Voice 开 | 点课 | 当前句可见；系统朗读该句；静默光圈无秒数 | 单测引擎 + 人工听感 |
| Web / 无 TTS 桥 | 点课 + Voice 开 | 当前句 + 「语音指导需桌面版」；静默仍走；不假装在念 | 单测 speech no-op |
| Voice guidance 关 | 课中点关 | 停朗读；句仍在；静默光圈照走 | 引擎 `voiceEnabled` 单测 |
| 英语界面 | P1 脚本正文 en | 课卡标 English；句子 en | catalog 单测 |
| 中/日界面 | P1 | 壳文案三语；**句子仍 en**（P2 才本地化脚本） | 切片键齐全 |
| 课 A/B/C | 三张卡 | 各 title/blurb/steps | catalog ids |
| 免费 | 无 entitlement | 无付款门闩 | 不改 commerce |
| Focusing / Honesty / Breath / Ground 进行中 | 点菜单行 | toast 忙，不叠课 | `guidedMeditationBusyYield` |
| 切后台 | 课进行中 | 自动暂停（非哑点击） | 引擎 pause + UI visibility |

---

## 4. 点击反馈（0–1 秒）（A14）

| 控件 / 入口 | 点击后 0–1 秒内用户看到什么 | 持久化：挂起 / 成功 / 失败 |
|---|---|---|
| 菜单 Guided meditation | 列表卡可见，或忙 toast | — |
| 课卡 | 播放页：题名 + 第一句（或桌面开始念） | 计入成功见 CREDITED；未满门槛 END 见 INCOMPLETE |
| 暂停 / 继续 | 状态句切 Paused / Speaking 或 Silence 光圈 | — |
| 上一步 / 下一步 | 当前句替换；朗读停后重开该步 | — |
| 结束练习 | 回列表；达则计入句，否则未计入句 | 成功：练习日写入；失败：INCOMPLETE 可见 |
| Voice guidance | 钮态切换；关则停声 | — |
| 关闭 | 叠层关；进行中先停引擎 | — |

按设计不生效：忙会话点菜单 → 有 toast，**不是**静默。不进 `SILENT_BEHAVIORS` 新条。

---

## 5. 边缘状态（A14）

| 边缘状态 | 预期 |
|---|---|
| 网页无系统朗读 | 文字 + 静默；提示需桌面有声；可完成并计入 |
| TTS `onFinished` 超时 | 记超时后进下一句，不卡死 |
| 有效秒 &lt; 60 且未完课就结束 | 不计入；INCOMPLETE |
| 完课或 ≥60s | 计入；最少 1 分钟 |
| 切 tab / 锁屏 | 自动暂停，静默剩余冻结；回来手动继续 |
| 旧视频 SHA 缺失 | **不再**藏菜单（脚本目录即显） |
| 窄屏 | 同功能；不挡 ⋯ 逃生舱 |
| Confide 已开 | 菜单忙或先停课 TTS（newest-wins 仍在桥上）；本课用独立通道 |

---

## 6. 共用机制核对

- **overlayBusy**：继续用已登记 `guidedMeditationOpen`；课开时 sceneAnim overlayBusy。**须联动**：Idle 点 Yin 仍 `blocksIdleYinTap`。  
- **HUD 呼吸计时**：本课 **不**驱动左上角 00:00 走动；静默光圈是课内装饰，**不是** HUD 呼吸驱动者。核对 `SHARED_RESOURCES.md` §4.2 后：**不接线** `overlayBreathing`。  
- **z-index**：沿用 `#guided-meditation-backdrop` dim 与 `#guided-meditation` 玻璃卡（`Z_INDEX.md` 17/18）。Support FAB / 倾听耳须走 overlayBackdrop idle-chrome dim，**不得**只盖低于 17 的背景。  
- **新建可点击叠层**：不新开 overlay 文件；改既有 `GuidedMeditationUI`。O-04 三态：pending = 念句/静默态 token；success = CREDITED；fail = INCOMPLETE。  
- **受保护路径**：否。不改 Support FAB / Stripe。  
- **后台网络**：不涉及（无 R2 点课拉取）。

---

## 7. 状态机与模块

`idle → speaking → silence → … → done`；暂停冻结静默剩余；跳步 `stop` TTS。

- 引擎：`guidedMeditationScriptEngine.js`（可单测）  
- 语音：`guidedMeditationSpeech.js` → `speakSystemTts({ onFinished })`；Web no-op  
- 目录：`guidedMeditationScriptCatalog.js`；`isGuidedMeditationAvailable()`  
- 计入：`resolveGuidedMeditationCredit({ delivery: 'script', … })`；旧 short/long 视频规则保留给搁置代码  

超时：`estimateSpeakMs(sentence) + 8s`。

配乐：念句 `duckTo(~0.45)`，静默恢复 1.0。

---

## 8. 三套课结构（en）

| id | 标题 | 步数 | 标准档静默合计 |
|---|---|---|---|
| `breath-anchor-beginner` | Basic Breath Awareness | 4 | 5+15+20+0 s |
| `body-scan-relaxation` | Body Scan & Relaxation | 5 | 10+15+20+20+0 s |
| `thoughts-letting-go` | Mindful Awareness & Letting Go | 5 | 5+15+20+20+0 s |

**小改（已拍板）：** Set 2 / Set 3 第一步补 Set 1 同款「可闭眼 / 可垂视」。Set 3 第四步去掉 `gentle rep of training`。

全文 SSOT：[`task-entries/guided-meditation-script-v1.md`](../task-entries/guided-meditation-script-v1.md) 与 catalog 运行时。

---

## 9. 已好清单（不变量）

- Help EDU-0003：Sit **no voice guidance** + 另有引导课菜单。  
- ⋯ 逃生舱课中仍在。  
- 不改 Support / 付款。  
- 不把冥想稿塞进 `maybeSpeakPracticeAnnouncement` 去重。  
- 视频下载/SHA/`check:guided-media-host` **不删**。  
- 冷启动不进本功能。

---

## 10. 验收

1. 有脚本即菜单可见（宽+可点）。  
2. 三张英文课卡；无 video 控件。  
3. 点课见当前句；静默见光圈、无倒计时数字。  
4. 完课或测试钩 ≥60s 计入。  
5. Focusing 等忙会话 toast。  
6. 切后台暂停（引擎契约）。  
7. e2e：菜单→选课→计入。

---

## 11. 冲突扫描

见实现回复。PO 已划界：与 Ground/Sit 职责分开；视频列表 supersede。

---

## 12. 明确不做

ja/zh 脚本正文、时长三档 UI、预录音 B、睡前第四课、久坐联动、冷启动第五项、疗效宣称、删 R2 代码。
