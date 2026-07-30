# Focus Tiger · 响应式布局与移动浏览器基线
# RESPONSIVE_LAYOUT.md

> **版本**：1.0  
> **最后更新**：2026-07-26  
> **状态**：布局与窄屏交互的**权威基线**；细则冲突时以本文为准（产品语义仍服从 `PRODUCT_POSITIONING.md` / `PRINCIPLES.md`）

本文档定义：桌面优先前提下，**主流手机浏览器**（含竖屏与横屏）应达到何种可用标准；开发、设计与验收如何收口。

**文档边界**：

| 文档 | 关系 |
|---|---|
| `MVP_PRODUCT_DEFINITION.md` | 首要用户仍是「电脑前深度工作」；本文不推翻该策略 |
| `DESIGN.md` | 玩法与交互语义；布局细则见本文 |
| `PRINCIPLES.md` | 性能红线（首屏、资产体积）；本文补**布局与可点性**红线 |
| `DEV_WORKFLOW_QUALITY.md` | 窄屏验收并入 UI 改动门禁 |
| `TEST_TRACKER.md` | UI 可见项须附窄屏测试步骤 |

**非目标（维持 Backlog，勿混进当前 Task）**：原生 App、系统级 Focus Mode、后台计时、PWA 安装强推。见 `PROCESS.md` Backlog。

### 工程债 · 窄宽屏单代码线（2026-07-25 排期 · 2026-07-30 落地）

**状态（2026-07-30）**：**阶段 0–2 代码已合入 `develop`（PR #31 / #32 / #33）；阶段 3 = 文档收口 + 残留接线清理（本轮）**。

| 层 | 模块 | 职责 |
|---|---|---|
| 编排 | `src/core/idleChromeOrchestration.js` | stage / 壳投影 / 次要入口列表 / stage class 常量 |
| 门面 | `src/core/IdleChromeFacade.js` + `createIdleChromeFacade.js` | handlers 一次注册、`applyShellProjection`、断点 `releaseInactivePresentation` |
| 呈现适配器 | `NarrowIdleShell.js`（≤479 抽屉）· `WideIdleMoreMenu.js`（≥480 ⋯） | 只负责形态；业务列表不得再分叉漂移 |
| 同步 | `sessionChromeSync.js` | 优先 `idleChrome.applyShellProjection` |

产品形态仍因断点不同（抽屉 vs ⋯）——**禁止**再开长期姊妹分支分别修同一套 chrome/audio。关单级人工须 **§8 375 + §9 W1–W8** 分测，**禁止**与场景 O 修混验。

**产品拍板 · 宽屏首页三球（2026-07-31）**：宽屏 Idle **首页**主 CTA 改为与窄屏同序三球（Quick Start · Sit · Honesty），**代替** Sit+⚡ 文案 pill；⋯ 仍承载次要入口。运行时尚未改——实现 Brief：`task-briefs/task-wide-home-three-ball.md`。实现后须同步 `DEV_WORKFLOW_QUALITY` §9 W1 目标壳描述。

**沿革**：2026-07-25 拍板「值得做，但等 wide-idle + O」→ 2026-07-29 条件齐 → 2026-07-30 Brief / 阶段 0–2 / 阶段 3 收口。

---

## 一、产品立场（一句话）

> **桌面是主舞台；主流手机浏览器须功能完整、逐步可操作——不得出现按钮失灵等低级缺陷。竖屏保证 P1 可用基线即可；若竖屏观感吃力，可温和建议横屏，但不以横屏为使用前提。**

---

## 二、两条硬性原则（拍板）

### 原则 A · 功能对等（技术架构）

在**主流手机浏览器**中打开产品（Safari iOS、Chrome Android、Chrome/Safari 移动仿真等），无论**竖屏**还是**横屏**放置手机，用户应能**一步一步完成与电脑端相同的核心操作路径**，包括但不限于：

- Arrival Practice（Notice / 呼吸 / Choose / Skip）
- Companion Mode 三选一与「How shall we sit?」
- Sit with Yin / Rise、专注计时、Sound FAB
- Honesty / Reflection 等叠层流程
- 左下「?」引导与用途简介卡

**禁止**因视口变窄而出现：

- 可点控件**无响应**（含门闩静默 `return`、被透明层抢点击、z-index 挡死）
- 主 CTA **永久不可达**（被气泡/面板盖住且无法关闭）
- 仅在某方向下**整条路径断裂**（例：竖屏能 Sit、横屏 Sit 失灵——或反之）

这不等于「手机与桌面像素级一致」，而是**状态机与门闩行为一致、每一步都有可感知结果**。

与回归锁对齐：门闩未就绪 → UI **禁用 / 隐藏**；禁止「看起来能点、点了没反应」。见 `DEV_WORKFLOW_QUALITY.md` N2。

### 原则 B · 竖屏 P1 基线 + 可建议横屏

| 取向 | 竖屏 | 横屏 |
|---|---|---|
| **功能** | 须满足原则 A（完整可走通） | 须满足原则 A |
| **观感** | **P1 可用基线**即可：不丑到挡操作、主文案可读；**不要求**每个 Task 都做手机完美适配 | 更接近桌面构图，作为**推荐**体验 |
| **引导** | 若竖屏底部拥挤、HUD 压缩明显，可显示**一次性、可关闭**的温和提示，建议旋转横屏（观察式文案，不强迫、不惩罚） | — |

**P1 可用基线**（竖屏收口清单，非「完美」）：

1. 主 CTA（Sit / Rise）文案**完整可读**（禁止「Sit w…」类截断）；必要时换行、缩字号或 i18n 短文案键。
2. **同一时刻最多 1 条**自动 onboarding 气泡；其余排队或等用户点「?」，禁止叠罗汉挡主按钮。
3. 触控热区 **≥ 44×44 CSS px**（?、Sound、主按钮）。
4. 底部 chrome（dock + ? + Sound）不永久盖住 Arrival / Honesty / Reflection 的**唯一出口**按钮。
5. 序列观感（Idle 眨眼、cross-fade）仍按 `EMOTION_BIBLE` / 回归锁人工项；P1 **不**放宽为「手机可闪」。

**不要求**（避免 scope 膨胀）：

- 每个 Task 单独做竖屏视觉精修
- 与桌面完全相同的 HUD 密度与留白
- 为竖屏单独改业务逻辑或删减步骤

---

## 三、平台分级

| 级别 | 视口 / 环境 | 目标 |
|---|---|---|
| **P0 主平台** | 桌面浏览器；宽屏 **≥ 900px** | 完整体验、视觉精修、默认设计稿基准 |
| **P1 移动基线** | **320px–899px** 手机浏览器，竖屏 + 横屏 | 原则 A 功能对等 + 原则 B 竖屏基线 |
| **非目标** | 原生壳、小程序、手表 | Backlog 单独立项 |

与现有实现对齐：`CompanionModePicker` 已在 `min-width: 900px` 做宽屏增强；窄屏为默认栈式布局。

---

## 四、断点与布局约定

### 4.1 断点

| 名称 | 范围 | 用途 |
|---|---|---|
| **narrow** | `< 480px`（实现：`max-width: 479px`） | 小屏手机竖屏；最严 P1 验收；启用 `NarrowIdleShell`（ActionBar + 上滑抽屉） |
| **medium** | `480px – 899px` | 大屏手机 / 竖屏平板；Idle 底栏仍走宽屏清场（Sit · ⚡ · ⋯） |
| **wide** | `≥ 900px` | 桌面与横屏手机（视高度而定） |

实现时优先 **mobile-first 或 narrow 先验**：先保证 320px 不炸，再在 `min-width` 上 enrich。

**验收口径（易混）**：抽屉只在 **CSS 视口宽 ≤479** 出现。桌面 Chrome / Safari 把窗口拖到「最窄」时，`innerWidth` **经常仍 ≥480**，底栏会继续显示 **Sit · ⚡ · ⋯**（⋯ = 宽屏 More，不是坏掉的抽屉）。权威窄屏对照用 **DevTools 设备模式 375×667**（或 Responsive 把宽度设到 ≤479）；控制台可确认 `matchMedia('(max-width: 479px)').matches === true`。

### 4.2 尺寸与安全区

- 视口：保持 `index.html` 的 `width=device-width, initial-scale=1`。
- 高度：固定层优先 `100dvh` / `100svh`，避免移动浏览器地址栏伸缩把底部 dock 挤出视口。
- 底部：`padding-bottom: env(safe-area-inset-bottom)`（?、session-start-dock、Honesty 底栏）。
- 主内容区：老虎序列保持可见；窄屏允许略缩 HUD，**不允许**裁切到无法辨认状态。

### 4.3 底部 chrome 预算（竖屏 narrow / 宽屏 Idle）

- 底部固定 UI（dock、?、Sound、叠层底栏）合计建议不超过视口高度 **~32%**；超出时优先：缩间距 → 折行 → 隐藏非关键装饰，**最后**才考虑建议横屏提示。
- `session-start-dock` 宽度策略：保证主按钮完整；与 Sound FAB、? 三者**不得**互相挤到截断主 CTA。
- **宽屏 Idle（≥480）清场**：底栏常驻仅 **Sit + ⚡ Quick Start + ⋯**；Honesty / 一分钟呼吸 / How shall we sit / Sound FAB / 提醒时钟收入 **⋯ 向上 Popover**（`WideIdleMoreMenu`）。左下 **?** 与热力图**不**进此次清场。Arrival 进行中：仅 ⚡；Sit 与 ⋯ 均收。  
- **窄屏 Arrival（≤479）**：ActionBar/抽屉收起时仍须 **⚡ 可见**（`ft-narrow-stage-arrival-quick-start`）；Sit/How/Honesty 保持 park。其余 Idle 仍由 `NarrowIdleShell` 上滑抽屉负责。

### 4.4 z-index 与点击

触及固定定位 UI 时须对照 `SHARED_RESOURCES.md` 与现有层级（例：dock z16、Honesty z15、Sound z22、hint z22）。**新增层不得**在未测窄屏的情况下盖住 Sit / Rise。

### 4.5 Onboarding 与叠层

- 自动 hint：**互斥或串行**（窄屏强制）；`OnboardingHintsUI` 已有单条 clamp，窄屏须扩展为「不挡主 CTA」的队列策略。
- 用途简介卡、help-affordance：尖角对准「?」；窄屏 clamp 后仍须对准（见 `ONBOARDING_HINTS.md`）。
- 竖屏可选：**横屏建议条**（locale 键，一次性 dismiss，不占 Honesty 限频池）。

---

## 五、核心路径验收矩阵（功能对等）

以下路径须在 **375×667 竖屏** 与 **横屏（例 667×375 或 844×390）** 各走通一遍（`/?product=1`，隐藏调试面板）：

| # | 路径 | 最低验收 |
|---|---|---|
| 1 | 冷启动 → Sit → Arrival → Skip begin → Focusing → Rise | 全程可点、计时可见、按钮变 Rise |
| 2 | How shall we sit? → 三选一 →（Offline 再 Sit） | 不误开 Honesty；门闩与桌面一致 |
| 3 | Rise → Reflection → 再 Sit | 回流无挡死 |
| 4 | Sound FAB：Idle 提示 / Focusing 开关 | 可点、有反馈 |
| 5 | ? → 本页 hints + 用途简介卡 | 可关；不永久挡 dock |
| 6 | DORMANT / Honesty 唤醒（若当日零完成） | 选时长、呼吸、坐起链可完成 |

**回流**：每条至少再测「Rise 后再进」「叠层关闭后再开」之一（与回归锁一致）。

---

## 六、开发政策

### 6.1 角色

归属 **UI Engineer**（`PROCESS.md`）：`index.html`、`ui/*`、叠层与响应式样式。Gameplay / Emotion 逻辑**不得**为窄屏 fork 第二套状态机。

### 6.2 每个 UI Task 的最低门禁

1. 桌面宽屏（≥900px）主路径 + 回流；触及 Idle chrome / Arrival / Honesty / Hints 时，步骤须含 **`DEV_WORKFLOW_QUALITY.md` §9「宽屏故事最小集」**（非仅「⋯ / 清场」烟测）。  
2. **375×667 竖屏** + **一种横屏**（DevTools 设备模式即可）走通 §五 中与本次改动相关的行。  
   - **场景 O（2026-07-24；主 CTA 上屏 2026-07-26）**：`≤479px` 启用 `NarrowIdleShell`——ActionBar（? / 时间·状态 / ♪）+ 主画布三主钮（顺序 **Quick Start · Sit with Yin · Honesty**；约 72px PNG）+ 上滑 `BottomOptionsDrawer`（次要：呼吸 / How / Sound / Reminder；7 格只读条）；Yin 放大居中。`≥480px` 目标壳为 Sit+⚡+⋯（见 §9；未合入前旧竖排 dock 仍须走故事）。  
   - **触及 Idle chrome / Arrival / Honesty / Hints**：`TEST_TRACKER` 步骤须含 **§8「375 故事最小集」**——**禁止**只验壳切换（有没有 ActionBar / ⋯）就当窄屏通过。  
3. 触及 dock / hint / 叠层 / HUD → 在 `TEST_TRACKER.md` 测试步骤中**写明**窄屏与宽屏故事步骤（勿笼统一行「手机/桌面看一下」）；关单须注明双视口故事是否测过（§8 N20 / §9 N24）。  
4. 声称修好前仍须 `npm run test:smoke` + `npm run test:e2e`（逻辑层；**不**替代人工故事）。  
5. 可选后续：Playwright `viewport` 用例锁「Sit 可点、无静默 return」（与 `DEV_WORKFLOW_QUALITY.md` §6 对齐）。

### 6.2b 双壳共享不变量（摘要）

权威表：`SHARED_RESOURCES.md` §6。改窄或宽一侧 chrome 时必须勾另一侧：

| 契约 | 一句话 |
|---|---|
| Hints remap | park 后 tip / ? 补救锚到当前可见宿主，禁止旧坐标 |
| Sit 显隐 | Arrival（含 Breath）开着 → Sit 隐藏或不可点；双壳同语义 |
| FocusHUD vs ActionBar | **窄屏**：ActionBar = 常显本机墙钟 + ? + ♪；`#focus-hud` = 会话计时（Focusing 下移避免叠顶栏）。宽屏仍 FocusHUD |

故事矩阵：`DEV_WORKFLOW_QUALITY.md` **§8（窄）** / **§9（宽）**。

### 6.3 实现禁忌

- 禁止仅用 `pointer-events: none` 在父级误伤子按钮。  
- 禁止 `overflow: hidden` 裁切唯一可点出口且无滚动替代。  
- 禁止窄屏隐藏主路径必需控件而不提供等价入口。  
- 文案：主按钮英文在 320px 下实测；必要时 `BTN_FOCUS_START_SHORT` 等 i18n 分键。

### 6.4 横屏建议 UI（Task 2 · 待实现）

> **立项**：2026-07-21 · Brief：`task-briefs/task-responsive-landscape-suggest.md`  
> **前置**：Task 1（窄屏 onboarding 互斥 + Sit 不截断）验收通过后开工。

- 触发：仅 `narrow` 且检测到竖屏（`matchMedia('(orientation: portrait)')`）+ 可选「底部拥挤」启发式。  
- 文案：观察式、可关；例 EN *「A wider view may feel easier here—you can turn your phone sideways.」* / ZH 对应。  
- 频控：localStorage 记 dismiss，不反复轰炸（对齐宁静型游戏化）。  
- **不**阻塞操作：用户坚持竖屏仍可完成全流程。

### 6.5 窄屏 onboarding + Sit 截断（Task 1 · 已实现代码 · 待人工复测）

> **立项**：2026-07-21 · Brief：`task-briefs/task-responsive-narrow-onboarding-sit.md`  
> **代码**：`selectExclusiveAutoHintIds` + `OnboardingHintsUI` 互斥/串行；`CompanionModePicker` dock/`#btn-focus` 防截断；窄屏主 CTA above→侧面。

- 自动 hint 互斥/串行（同时最多 1 条 open；点 ? 补救仍全铺）。  
- `#btn-focus` 在 375px 竖屏完整可读，禁止「Sit w…」截断。  
- 验收：`TEST_TRACKER`「窄屏 · 自动 onboarding 互斥」「窄屏 · Sit with Yin 主 CTA 不截断」。

---

## 七、设计政策摘要

| 主题 | 宽屏 P0 | 竖屏 P1 |
|---|---|---|
| HUD | 完整计时环 + streak | 可略缩；须可读 |
| 主 CTA | 蒲团橙、完整文案 | 同左，禁止截断 |
| Companion 三选一 | 横排矮条（当前） | 可纵栈全宽 |
| 引导气泡 | 侧面优先，不挡 Sit | **最多 1 条**自动 |
| 老虎画幅 | 居中、呼吸留白 | 允许略小，不消失 |
| 横屏提示 | 不显示 | 可选、一次性 |

视觉原则（不制造焦虑、诚实机制、序列衔接）在窄屏**不降级**。

---

## 八、与 MVP 策略的对齐

`MVP_PRODUCT_DEFINITION.md` 首要用户为电脑端深度工作者——**不改变**。本文仅明确：

- 手机浏览器是**真实会发生**的入口（书签、分享、平板竖屏）。  
- 最低承诺是**功能对等 + 竖屏 P1**，不是 mobile-first 产品转型。  
- 次要用户（学习者、已有正念习惯者）在手机上应能**完成练习**，而非只能「看看」。

---

## 九、已知风险面（改前必查）

与 `DEV_WORKFLOW_QUALITY.md` §2.3 叠加：

- `session-start-dock` 宽度与 `#btn-focus` 截断  
- `OnboardingHintsUI` 多气泡同时 `open`  
- Honesty / Reflection / Arrival 底栏与 dock、? 的 z-index 抢点  
- `min-width` / `min-height: 100%` 与移动浏览器 chrome  
- 英文主按钮文案长度 × 窄屏

修此类问题须：**TEST_TRACKER 用户反馈列** + 窄屏步骤 + 回流路径 + 回归锚（若属用户确认 bug）。

---

## 十、修订记录

| 版本 | 日期 | 说明 |
|---|---|---|
| 1.11 | 2026-07-30 | 工程债：Task 3 阶段 3 收口（模块表 + 状态「已落地」） |
| 1.10 | 2026-07-30 | 工程债：Task 3 阶段 2（`IdleChromeFacade`） |
| 1.9 | 2026-07-30 | 工程债：Task 3 阶段 1（`idleChromeOrchestration` 共享编排） |
| 1.8 | 2026-07-30 | 工程债：Task 3 阶段 0（feature 已开 + 入口对照表） |
| 1.7 | 2026-07-30 | 工程债：Task 3 Brief 已写 · 可排期开工（`task-responsive-single-chrome-line.md`） |
| 1.6 | 2026-07-26 | 窄屏主画布三主钮（Sit / Quick Start / Honesty）；抽屉精简为次要项 |
| 1.5 | 2026-07-25 | §6.2：宽屏故事最小集（对齐 `DEV_WORKFLOW_QUALITY` §9）；关单双视口对称 |
| 1.4 | 2026-07-25 | §6.2 / 6.2b：375 故事最小集 + 双壳不变量摘要（对齐 `DEV_WORKFLOW_QUALITY` §8） |
| 1.3 | 2026-07-25 | §4.1：澄清「桌面拖最窄 ≠ 窄屏抽屉」；须 DevTools ≤479 / 375 |
| 1.2 | 2026-07-21 | Task 1 代码落地：互斥 helper + dock 防截断；待人工复测 |
| 1.1 | 2026-07-21 | 立项 Task 1（窄屏互斥+Sit）/ Task 2（横屏建议）；见 §6.4–6.5 与 `TASKS.md` |
| 1.0 | 2026-07-21 | 初版：原则 A 功能对等、原则 B 竖屏 P1 + 可建议横屏；断点、验收矩阵、开发/设计政策 |
