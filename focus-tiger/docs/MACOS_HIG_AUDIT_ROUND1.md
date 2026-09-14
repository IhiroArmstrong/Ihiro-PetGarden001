# macOS 原生感 · 第一刀只读审计报告

**审计日期**：2026-09-14  
**性质**：纯只读侦察（无运行时代码改动）  
**范围**：快捷键惯例 · Electron 窗口标题栏 · 模态框/阻断式弹层使用现状  
**后续核实**：全项目阻断式确认核实与**唯一拍板清单**见 `MODAL_USAGE_AUDIT.md`。P5 Recover / Ritual / Micro 细目留档 `p5-ritual-modal-audit.md`，**不要**在那 15 行清单单独打勾。

---

## 大白话总结

我按你拍板的三项，把桌面壳和前端里跟「Mac 原生感」相关的现状查了一遍。窗口顶栏已经是系统自带的红黄绿按钮，不用动。三个常见快捷键里，退出和关窗（进托盘）基本符合 Mac 习惯，但「打开设置」的 ⌘+, 还没接上。弹窗方面，正式版里只有付费/checkout 出错时会蹦系统 alert；开发工具里还有两个重置确认框。自绘的遮罩卡片很多，但大多是你主动从菜单打开的；真正可能在专注计时过程中冒出来的，主要是新手提示卡和恢复/仪式流程里的步骤面板。

---

## 1. 快捷键规范核查

### 1.1 审计方法

- 检索 `focus-tiger/desktop/` 主进程：`Menu.setApplicationMenu`、`globalShortcut`、`accelerator`、`before-input-event` — **均未发现**
- 检索 `focus-tiger/src/` 渲染进程：`metaKey`、`ctrlKey`、`Cmd`、`accelerator` 等键盘绑定 — **均未发现产品级快捷键处理**
- 对照 `desktop/main.js` 窗口生命周期与 `desktop/preload.js` 暴露的 `desktopShell.quit/hide` API

### 1.2 结论表

| 快捷键 | 当前状态 | 涉及文件 / 绑定点 | 修复复杂度 |
|---|---|---|---|
| **⌘+W** 关闭当前窗口（非退出 App） | **已实现（语义正确）** | Electron 默认将 ⌘+W 映射为 `window.close()`；`desktop/main.js` `attachWindowLifecycle()` 拦截 `close` 事件，非 Quit 流程时 `preventDefault()` 并调用 `hideToTray()`（红叉同样行为，SB-18）。效果 = 关窗进托盘，进程不退出。 | —（已符合 Mac 托盘 App 惯例） |
| **⌘+Q** 退出应用 | **已实现（依赖 Electron 默认菜单）** | 主进程未调用 `setApplicationMenu`，macOS 上 Electron 仍注入默认 Application 菜单，含 Quit（⌘+Q）。另有托盘右键「Quit」→ `isQuitting=true` → `app.quit()`（`desktop/main.js` L276–281）；渲染层可通过 `desktopShell.quit()` → IPC `desktop:quit`（`preload.js` L20、`main.js` L396–398）。 | — |
| **⌘+,** 打开设置/偏好 | **缺失** | 产品无独立「Settings」窗口；等价入口 = Idle ⋯/抽屉 → **Preferences** 分组（提醒、语言、备份等，`idleChromeOrchestration.js` `MENU_GROUP_PREFERENCES`）。全仓无 ⌘+, 绑定，主进程亦无带 `role: 'preferences'` 的菜单项。 | **低**（主进程加 Application 菜单 + `role: 'preferences'` 或 `accelerator: 'Cmd+,'`，IPC 通知渲染层打开 Preferences 面板即可） |

### 1.3 Windows 式快捷键 / 冲突检查

| 检查项 | 结论 |
|---|---|
| 产品 UI 是否用 `Ctrl` 作主修饰键（如 `Ctrl+W`） | **未发现**。渲染层无 `ctrlKey`/`metaKey` 组合监听；用户可见快捷键均为点击/触屏入口。 |
| 与 macOS 系统快捷键冲突 | **未发现自定义全局快捷键注册**（无 `globalShortcut`），故无与 Spotlight、截屏等系统级冲突的自绑快捷键。 |
| 文档中的 Ctrl 提及 | 仅开发文档（如 `task-desktop-on-device-companion.md`「终端 Ctrl+C 停 dev」），非产品运行时绑定。 |

### 1.4 补充说明（⌘+W 行为）

当前 ⌘+W / 红叉 = **隐藏到托盘**，不是销毁窗口。这与 Step B 托盘策略（`trayPolicy.js`、`main.js` 文首注释）一致，也符合 Setapp 类常驻型 Mac App 的预期。若 PO 希望 ⌘+W 在「无托盘/纯 Web」场景有不同语义，属产品策略而非 HIG 缺失——**本刀仅记录现状**。

---

## 2. 窗口标题栏原生性核实

### 2.1 主窗口 `BrowserWindow` 配置

文件：`focus-tiger/desktop/main.js` → `createMainWindow()`（约 L289–302）

```javascript
const win = new BrowserWindow({
  width: 1100,
  height: 760,
  minWidth: 390,
  minHeight: 640,
  show: false,
  webPreferences: { preload, contextIsolation, nodeIntegration: false, sandbox: true }
});
```

| 配置项 | 值 | 含义 |
|---|---|---|
| `titleBarStyle` | **未设置** | Electron 默认 = 系统原生标题栏 |
| `frame` | **未设置**（默认 `true`） | 保留系统窗口边框与三色按钮 |
| `titleBarOverlay` / `hiddenInset` / `transparent` | **未使用** | 无自绘标题栏 |
| `frame: false` | **未使用** | 非无边框窗口 |

### 2.2 前端是否自绘红黄绿按钮

全仓检索 `titleBar`、`trafficLight`、`window-controls`、`title-bar` 等 — **未发现**自绘窗口控制按钮的组件或 CSS。

### 2.3 其他窗口

| 窗口 | 配置 | 结论 |
|---|---|---|
| Companion L0 bench | 复用 `createMainWindow()`（`desktop/companion/l0Main.js`） | 与主窗口相同，原生标题栏 |
| 托盘 | `Tray` API，非 `BrowserWindow` | 不适用标题栏审计 |

### 2.4 结论

**已是系统原生标题栏，无需修复。** 视觉与 hover 行为由 macOS 窗口管理器提供，与 Electron 默认一致。

---

## 3. 模态框（Modal Dialog）使用情况扫描

### 3.1 审计口径

- **系统级/浏览器级**：`window.alert()`、`window.confirm()`、`window.prompt()`
- **自绘阻断式**：`aria-modal="true"` 或 `role="dialog"` 且带全屏/半屏遮罩、阻断主界面交互的 UI 壳
- **「专注进行中」**：用户处于 `STATES.FOCUSING`、一炷香/微仪式呼吸计时、或 `overlayBusy` 为 true 的仪式/恢复流程中（含 Recover Reset、Ritual Flow、Micro Ritual 等 overlay 源，见 `overlaySlotContractRegistry.js`）

### 3.2 浏览器原生 `alert()` / `confirm()`

| # | 触发场景 | 实现方式 | 用户路径 | 专注进行中？ |
|---|---|---|---|---|
| A1 | 开发栏「意愿漏斗」按钮，展示漏斗摘要 | `globalThis.alert()` | 仅 `?dev=1` / 开发模式可见（`main.js` ~L4768–L4775） | 否（开发工具） |
| A2 | 开发栏「重置全部本地状态」 | `globalThis.confirm()` 多行中文确认后清 localStorage 并刷新 | 仅开发模式（`main.js` ~L4800–L4811） | 否 |
| A3 | 开发栏「重置并 idle 坐禅」 | `globalThis.confirm()` | 仅开发模式（`main.js` ~L4838–L4843） | 否 |
| A4 | Support 弹窗内 Pro / Companion Add-on 结账，云 API base 未配置 | `window.alert(t('SUPPORT_*_ERROR'))` | Idle → Support → 点 Buy/Subscribe（`SupportYinModalUI.js` ~L526–L533） | **否**（须先打开 Support 面板，专注中通常不可达） |
| A5 | 同上，Checkout Session 创建失败 | `window.alert(t('SUPPORT_*_ERROR'))` | 同上（`SupportYinModalUI.js` ~L560–L564） | **否** |

> **注**：`desktopCheckoutConfirm.js` 中的 `confirm` 为 Stripe 会话确认函数名，**非**浏览器 `window.confirm()`。

**正式用户路径上的原生弹窗 = 仅 A4/A5（付费/checkout 错误）**，共 2 处，同一文件。

### 3.3 自绘阻断式弹层（`aria-modal="true"`）

以下为产品内登记了 `aria-modal="true"` 的 UI 壳（按功能分组；均为遮罩 + 卡片/面板，Escape 或关闭钮退出）。

#### A. 菜单/Preferences 类（用户主动从 Idle ⋯ 打开）

| # | 组件 | 典型触发 | 专注进行中？ |
|---|---|---|---|
| B1 | `JourneyLogUI` | ⋯ → Journey Log | 通常否（专注中菜单入口受限） |
| B2 | `ConfideToYinUI` | ⋯ → Confide | 通常否 |
| B3 | `PresenceSignalsPanelUI` | ⋯ → Presence signals | 通常否 |
| B4 | `FocusCoinsPanelUI` | ⋯ → Yin coin | 通常否 |
| B5 | `FiveMomentsCompassUI` | ⋯ → Five Moments | 通常否 |
| B6 | `DailyZenQuoteCardUI` | ⋯ → Daily quote | 通常否 |
| B7 | `DigitalWallpapersCardUI` | ⋯ → Wallpapers | 通常否 |
| B8 | `ZenCinemaCardUI` | ⋯ → Zen Cinema | 通常否 |
| B9 | `MustardSeedSealCardUI` | ⋯ → Mustard Seed | 通常否 |
| B10 | `LocalPracticeDataPanelUI` + `LocalPracticeDataUI` | ⋯ → Preferences → Backup & restore；导入覆盖用**内联 checkbox 确认**（非 `confirm()`） | 通常否 |
| B11 | `ReminderPreferenceUI` | ⋯ → Preferences → Reminder（`role=dialog`，无 aria-modal） | 通常否 |
| B12 | `LanguagePreferenceUI` | ⋯ → Preferences → Language | 通常否 |
| B13 | `GroundExerciseChoiceUI` | ⋯ → Ground exercise | 通常否（Arrive/Recover 前序入口） |
| B14 | `NarrowIdleShell` 抽屉 | 窄屏 ⋯ 菜单 sheet | 通常否 |
| B15 | `QuietTogetherPanelUI` | ⋯ → Quiet together | 通常否 |
| B16 | `FocusCirclePanelUI` | ⋯ → Focus circle | 通常否 |

#### B. 付费/支持类

| # | 组件 | 典型触发 | 专注进行中？ |
|---|---|---|---|
| C1 | `SupportYinModalUI` | 支持 FAB / 菜单 Support | **否** |
| C2 | `TipJarUI` | ⋯ → Tip jar | 通常否 |
| C3 | `SanctuaryUnlockUI` | Support / Sanctuary CTA | 通常否 |
| C4 | `MembershipUnlockUI` | ⋯ → Membership | 通常否 |
| C5 | `NewsletterCaptureUI` | ⋯ → Newsletter | 通常否 |

#### C. 冷启动 / 引导类

| # | 组件 | 典型触发 | 专注进行中？ |
|---|---|---|---|
| D1 | `ColdStartGoalCardUI` | 首次 `?product=1` 冷启动四选 | 否（专注前） |
| D2 | `OnboardingHintsUI`（多张 `aria-modal` 卡 + Privacy sheet） | 各时刻 Hint 点按展开 | **是（候选）** — Hint 可在多种 overlay 时刻触发，含专注相关场景；属产品内嵌引导，非系统 `confirm()` |
| D3 | `TransitionMomentUI` | Calm Action 过渡时刻 | 仪式/过渡中，**可能**与专注窗口重叠 |

#### D. 会话流程内（仪式 / 专注 / 恢复）

| # | 组件 | 典型触发 | 专注进行中？ |
|---|---|---|---|
| E1 | `FocusDurationPickerUI` | 开始专注前选时长 | **否**（专注开始前） |
| E2 | `RecoverResetPracticeUI` | Recover 重置练习步骤 | **是** — 恢复流程的一部分（`role=dialog`） |
| E3 | `RitualFlowUI` | 仪式流程（Morning / Emotional reset / Work transition） | **是** — 仪式进行中（产品主流程，非意外打断） |
| E4 | `MicroRitualUI` | 微仪式呼吸层 | **是** — 即专注/呼吸 UI 本体 |
| E5 | `TigerReflectionMoment` | 专注结束后反思 | **否**（专注已结束，Reflect 时刻） |
| E6 | `ArrivalPracticeUI` | 到达练习 Choose/Notice | **否**（Arrive，专注前） |

#### E. 其他

| # | 组件 | 典型触发 | 专注进行中？ |
|---|---|---|---|
| F1 | `FocusCircleWitnessLeaveUI` / picker | Focus Circle witness 离开/回应 | **可能** — 可在 Idle 观察窗口出现；专注中 `overlayBusy` 探测可能推迟 |
| F2 | `SoftUpdatePromptUI` | 有新版本可用 | **否** — `shouldRevealSoftUpdatePrompt({ busySession })` 在 busy 时**不展示**（`appVersionCheck.js`） |
| F3 | `ContextualTeaTipBubbleUI` | Tea 情境气泡 | 通常否 |

### 3.4 汇总统计

| 类别 | 数量（约） | 备注 |
|---|---|---|
| 生产环境 `alert()` / `confirm()` | **2** 处（同文件 Support checkout 错误） | 无生产环境 `prompt()` |
| 开发环境 `alert()` / `confirm()` | **3** 处 | 不应进入发布包用户路径 |
| 自绘 `aria-modal` 弹层 | **24+** 文件/壳 | 绝大多数为用户主动打开的菜单卡片 |
| 可能在专注/仪式进行中出现的自绘层 | **E2–E4、D2–D3、F1** | 其中 E3/E4 为**主流程**而非「意外系统确认框」 |

---

## 待 PO 拍板清单

| # | 决策项 | 审计结论 | 建议 |
|---|---|---|---|
| **P1** | 是否批准补齐 **⌘+,** 打开 Preferences？ | 当前缺失；修复复杂度 **低** | **建议批准**。Mac 用户强预期；实现 = 主进程 Application 菜单 + 渲染层打开 Preferences 分组首项（或备份面板）。 |
| **P2** | **⌘+W / 红叉 → 托盘隐藏** 是否保持？ | 已实现，符合托盘型 Mac App | **建议维持现状**。若需「⌘+W 完全无反应」或「销毁窗口」，与当前 SB-18 冲突，须单独立项。 |
| **P3** | **标题栏** 是否改为自绘/隐藏原生栏？ | 已是原生标题栏 | **建议关闭此项**（无需改动）。 |
| **P4** | 生产环境 **Support checkout 错误的 `window.alert()`** 是否改为非模态内联提示？ | 2 处，用户主动打开 Support 后触发 | **建议纳入第二刀交互原则**，优先级中（非专注心流打断，但是系统原生 alert 观感生硬）。 |
| **P5** | 专注进行中，哪些自绘层优先改为非侵入式？ | 重点候选：**D2 OnboardingHints**、**F1 Focus Circle witness**；E2–E4 为仪式主流程须谨慎 | **建议 PO 逐条勾选**：Hint 卡 / Witness 可优先；Recover/Ritual/Micro 须区分「流程必需」vs「可降级为 Whisper」。 |
| **P6** | 是否将「减少模态确认、优先就地提示」写入 `PRINCIPLES.md` / 交互原则？ | 本刀只读，**未改文档** | **建议批准**作为第二刀文档项（与 PO 原规划一致），不回头改存量代码。 |

---

## 明确排除（本报告未评估）

- WidgetKit / Live Activities / Focus Filter
- Vibrancy / 毛玻璃材质
- SF Symbols 全量替换
- 菜单栏托盘（已基本落地，本刀不重复审计）

---

## 验收对照

| Task Brief 要求 | 状态 |
|---|---|
| 三项独立小节 | ✅ |
| 文首大白话总结 | ✅ |
| 结尾待 PO 拍板清单 | ✅ |
| 不改运行时代码 / 不开 PR | ✅（当时只读；本报告现已入库，拍板走 `MODAL_USAGE_AUDIT.md`） |
