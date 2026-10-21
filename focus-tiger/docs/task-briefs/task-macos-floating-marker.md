# Task Brief · macOS 原生悬浮标记（NSPanel sidecar）

> **状态（2026-10-21）**：PO 书面「立刻开工」且明示 **无需再等点头** 后实现。  
> **类**：**B 类**（电脑版托盘多两项开关；可选贴边标记）。  
> **壳**：仅 **Electron / macOS**。Web / PWA / Windows / Linux **不露出**此标记。  
> **PO 豁免**：本回合用户已写明「无需等我们点头，继续执行、动产品代码」。

---

## 拍板（硬）

| 项 | 口径 |
|---|---|
| **形态** | 独立 AppKit `NSPanel` 子进程，不是网页元素、不是 Electron `BrowserWindow`。 |
| **窗口壳** | `.borderless` + `.nonactivatingPanel`；`level = .floating`；**不用** `.screenSaver` 或更高。 |
| **内容** | SwiftUI 老虎视图（轻量呼吸）；拖动/贴边/半隐藏仍在 AppKit 容器。 |
| **默认** | **不显示**悬浮标记；**全屏时隐藏 = 开**。 |
| **入口** | 仅 Mac 托盘菜单两项：「显示悬浮陪伴」「全屏时隐藏」。关掉标记后仍能从托盘找到。 |
| **点击标记** | 唤出主窗口（0–1 秒内主窗出现）。标记自身不抢输入焦点。 |
| **全屏隐藏** | 勾上后，标记不得出现在他人原生全屏 Space，也不得盖在几乎铺满显示器的前台窗口上。根因：旧 Demo 勾上后仍留 `.canJoinAllSpaces`。 |
| **Demo 入库** | `desktop/native/floating-marker-demo/`（kebab-case；对照用单文件，不进运行时 spawn）。 |

**一句话**：电脑版 Mac 可以可选打开一只贴边、不抢焦点的小老虎；默认安静；浏览器全屏时按默认应看不见。

---

## 冲突扫描（实现前）

对照 `SCENARIO_TESTS.md`。

| 相邻 | 三轴 | 结论 |
|---|---|---|
| **场景 AA Idle Document PiP / Float Yin** | 职责 | **无冲突（切开）**。AA / Float Yin 仍是页内 Chromium 探针；本刀是 OS 合成层 NSPanel。禁止把托盘开关写成「Float Yin」。 |
| **Focusing Immersive Presence（Fullscreen companion）** | 职责 | **无冲突（切开）**。沉浸陪伴仍在产品窗内部。本标记不进 Focusing HUD、不挡 Rise。 |
| **场景 AB / SB-18 托盘收起 ≠ 走神** | 职责 | **无冲突（须守）**。点标记唤出主窗 = 用户主动回来，不是托盘 hide。不改 `hideReason=tray`。 |
| **场景 B 切 App 走神** | 强度 | **无冲突**。标记点击不激活 helper App（`nonactivatingPanel`）；唤出主窗后走既有 blur/focus。 |
| **Support FAB / 付款** | 强度 | **无冲突**。不改 z-index、不改支付入口。 |

强度：默认关，不比 Recover / Confide 更重。人设：贴边半隐藏，不监工。

---

## 共用机制核对

本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层，核对跳过。标记在 Electron 窗外，不进 `Z_INDEX.md` 网页层。

---

## 变体矩阵（A10）

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| Electron Mac · 默认 | 冷启动托盘 | 无贴边标记；「显示悬浮陪伴」未勾；「全屏时隐藏」已勾 | `floatingMarkerPolicy.test.js` 默认 prefs |
| Electron Mac · 打开标记 | 托盘勾上显示 | 0–1 秒内右侧出现贴边把手；悬停滑出老虎 | 人工 · Mac |
| Electron Mac · 全屏隐藏 | 显示已开 + 全屏隐藏开 + Safari/Chrome 原生全屏 | 标记不可见；退出全屏后可再出现 | 契约：hide 时不得 `canJoinAllSpaces`；人工锁路径 |
| Electron Mac · 关掉标记 | 托盘取消勾选 | 0–1 秒内标记消失；helper 退出 | 人工 · Mac |
| Web / Safari `:5173` | 无托盘 | **不得**出现系统悬浮标记 | 包装契约：仅 darwin spawn |
| Windows / Linux 壳 | 若有壳 | 托盘无此两项 | `process.platform !== 'darwin'` |

---

## 点击反馈（0–1 秒）（A14）

| 控件 / 入口 | 点击后 0–1 秒内用户看到什么 | 持久化时：挂起 / 成功 / 失败 |
|---|---|---|
| 托盘「显示悬浮陪伴」勾上 | 贴边把手出现（或编译 helper 时短暂无窗，失败则勾选弹回并 stderr） | 成功写入 `userData/floating-marker.json`；失败保持关 |
| 托盘「显示悬浮陪伴」取消 | 标记立刻消失 | 同上 |
| 托盘「全屏时隐藏」 | 勾选状态立刻变；当前若已在全屏则标记消失 | 同上 |
| 点悬浮标记 | 主窗口出现/前置（标记不抢浏览器输入焦点） | 不写盘 |

---

## 边缘状态（A14）

| 边缘状态 | 预期（含 0–1 秒反馈） |
|---|---|
| 他人 App 原生全屏 Space | 全屏隐藏开 → `orderOut`；关该项 → 可用 `.fullScreenAuxiliary` 出现 |
| 浏览器窗口几乎铺满屏（非独立 Space） | 覆盖比例 ≥ 0.97 亦隐藏（修「勾了仍在」） |
| `swiftc` 不可用 | 打开开关失败，保持关；不哑点击 |
| 减弱动态效果 | 滑出时长 0；呼吸缩放停 |
| 非 Mac | 无开关、无进程 |

---

## 已好清单（不变量）

- 托盘 Show / Quit、关窗进托盘（SB-18）不变。
- 不改 Confide / 支付 / 网页 z-index。
- 不把整包 UI 改成 AppKit。

---

## 不做

- 不读其它 App 内容、不要屏幕录制权限才能工作（窗口列表仅用 PID + 尺寸）。
- 不做跨 Space 的更高 window level。
- 不把 Lottie/序列帧老虎搬进本期（SwiftUI 占位老虎即可）。
- 不改 Web 产品页。
