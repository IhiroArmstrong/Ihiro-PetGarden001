# Task Brief · T38 倾诉倾听坐姿

> **状态（2026-10-21）**：PO 本回合书面规格（倾诉开时睁眼轻眨眼 / 关面板立刻闭目 / 致谢点头只在说完一句后）→ 按 Brief 开工。  
> **类**：**B**（会改倾诉开着时阿寅坐姿与点头时机）。  
> **代号**：**T38**（电脑版十二条对照 #1 · [`GLOSSARY.md`](../GLOSSARY.md) 待治理 PR #1376 锁表后为准）。  
> **分支**：`feature/t38-confide-listening-sit` · 基线 `origin/develop`。

## 一句话

倾诉面板**开着**时，阿寅保持**睁眼倾听**基底（轻眨眼）；**关面板**立刻回到默认**闭目**坐禅。用户等回复或朗读过程中**不点头**；每句回复**说完**（有 TTS 则播完）才点头一次致谢。

## 地面真相

1. 默认 Idle = `IdleOrchestrator` 闭目 pingpong ×2 → 睁眼弧 ×1（全 App，非倾诉专态）。
2. 倾诉 `onReplied` 现于**文字出现瞬间**即 `mindfulAcknowledge` / `nodBow`，与 TTS 并行，且结束后 `_finishOneShot` 一律回**默认闭目** Idle。
3. 本刀**不改** Confide 发送链、路由、语料、TTS 路由表（`task-confide-tts-v1` 仍「文字后 0–1s 开读」）。

## 已经定下的做法

1. **倾听基底（面板 open）**：进入 `confideListening` Idle 配置——相对默认**减少闭目段、增加睁眼弧**（实现常量见 `confideListeningIdlePolicy.js`）；`EmotionController` 记住「倾听模式」，oneshot 结束后回倾听基底而非默认闭目。
2. **关面板（close）**：立刻 `crossFadeMs: 0` 重启默认闭目 Idle（×2/×1 节奏复位）。
3. **点头**：`aggression_toward_others` 仍无点头；`safety_redirect` 仍 `nodBow`；其余路由仍 `mindfulAcknowledge`，但触发点改为 **TTS 播完**；无 TTS 时文字出现后触发（与现网可读一致）。
4. **等待生成**：从发送到文字出现前**不**播致谢点头（保持倾听基底动画 only）。

## 变体矩阵

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| 宽屏 Electron · Confide 开 | Idle 点耳 / 菜单进倾诉 | 0–1s 内阿寅切倾听睁眼轻眨眼；非全 App 改闭目 | `confideListeningIdlePolicy.test.js` · `EmotionController` 单测 |
| 关倾诉面板 | 倾听中点关闭 / Esc | **立刻**闭目默认 Idle | 单测 leave + crossFade 0 |
| 发一句 · 等回复 | 输入 Share | 等待中仅倾听基底，**无**鞠躬点头 | 手测；不发 gesture 单测锁 |
| 有 TTS 回复 | 桌面宽屏 · 可朗读路由 | 文字先出 → 朗读 → **播完**才点头一次 → 回倾听基底 | `confideReplyAckGesture.test.js` · 手测 |
| 无 TTS（Web / 关朗读） | 同 | 文字出现后点头一次 | 单测 |
| `aggression_toward_others` | 暴力句 | 无点头；倾听基底保持 | 回归现有 aggression 测 |
| `safety_redirect` | 危机句 | 仍 nodBow；不读 TTS | 现有 safety 测 |
| 其它叠层开 | Support / Journey | 关 Confide 后仍回闭目；不开 Confide 不改 Idle | 手测抽样 |

## 点击反馈（0–1 秒）

| 控件 / 入口 | 点击后 0–1 秒内用户看到什么 | 持久化 |
|---|---|---|
| 开倾诉 | 面板出现；阿寅开始倾听睁眼态 | 不写盘 |
| 关倾诉 | 面板消失；阿寅**立刻**闭目 | 不写盘 |
| Share 发送 | 状态行生成中；阿寅仍倾听态、不点头 | 不写盘 |

## 边缘状态

| 边缘状态 | 预期 |
|---|---|
| 点头 oneshot 进行中再关面板 | 关面板优先：立刻闭目，倾听模式清除 |
| 连发两句 | 每句各自「说完再点一次」；新 TTS 仍 newest-wins | 
| Focusing / 非 Idle 基底 | 不强行进倾听；开 Confide 时若已在 Idle 才切倾听 |
| Breath practice smiling | 本刀不碰微仪式 smiling 路径 |

## 冲突扫描（`SCENARIO_TESTS.md`）

| 轴 | 判断 |
|---|---|
| 强度 | 倾听睁眼略增陪伴感；不催促、不加文案 |
| 语气 | 不改回复文本 |
| 职责 | 动画层 only；路由/付款/Support 不动 |

无未决冲突。

## 共用机制核对

本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层，核对跳过。Confide 叠层占用门闩保持 `withIdleOverlayOccupancySync` 现网行为。

## 范围（out）

- 不改 T39–T49、T32 日历、发送链冻结。
- 不换素材、不新增序列帧。
- 不把默认 Idle 全局改成睁眼。

## 验收

- `cd focus-tiger && npm run test:smoke`（含新单测）。
- 手测：Electron `?product=1&confide=1` 开/关面板坐姿；发一句等 TTS 结束才点头。
