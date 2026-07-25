# TEST_TRACKER.md — 测试跟进与功能验收追踪表

维护规则：Cursor 每完成一项具有用户可感知效果的改动，必须在下方表格新增一行，
状态默认设为「待人工测试」，并在消息里明确说「这项需要你测试」。纯后端/逻辑改动
（无 UI 变化）登记为「仅单元测试覆盖」，不需要用户测试，但仍要登记，防止遗漏。

**权威路径**：`focus-tiger/docs/TEST_TRACKER.md`（勿在仓库根目录另建副本）。

**本地开发**：`cd focus-tiger && npm run dev` → 通常 `http://127.0.0.1:5173/`。  
演示会话时长默认 **`DEMO_SESSION_MINUTES = 1`**；可用 **`?sessionMinutes=5`** 拉长（场景 B Re-focus 真实切页须用）。  

**窄屏验收（2026-07-21 起）**：凡 **UI 可见**改动，测试步骤须含 **375×667 竖屏**（DevTools 设备模式即可）；触及底部 dock / 引导气泡 / 叠层底栏时，另加 **横屏**一步。标准见 **`RESPONSIVE_LAYOUT.md`**（功能对等 + 竖屏 P1，不要求每 Task 手机完美）。  

| 链接 | 用途 |
|---|---|
| `http://127.0.0.1:5173/` | **实验室**：右上角 `#emotion-debug-ui`；DEV 下 `window.__*` |
| `http://127.0.0.1:5173/?product=1` | **产品壳**：隐藏调试面板，走用户场景故事（见 `focus-tiger/docs/SCENARIO_TESTS.md`） |

用户场景串联剧本：权威 **`focus-tiger/docs/SCENARIO_TESTS.md`**（与本表互补，非替代；仓库根同名文件仅为指针）。

### 近期验收计划（P0 / P1 / P2 · 2026-07-25）

> **用途**：从「待人工测试 / 有问题」全量里分出**该先测什么**，避免 40+ 条无限挂着却无排期。  
> **行号** = 下方「功能清单」表在本文件中的当前行号。增删行后须同步改本节。  
> **2026-07-25 用户拍板**：本轮只走 **P0**；P1 / P2 暂不处理。L186 / L196 已降级（见下），不再占验收队列。

#### P0 · 本周主战场（产品壳主路径 + 刚改须复测）

一次性走完即可；操作清单见会话回复（与场景 C/O/P 同格式）。

| 行 | 功能 | 为何在 P0 |
|---|---|---|
| **[L174](#L174)** | Arrival · 轻量气泡 + ⚡ Quick Start | 07-25 Notice/Choose 外侧取消 **测试 OK** |
| **[L227](#L227)** | 「本周陪伴」7 格热力图（场景 **O**） | 07-25 Sound→选曲面板，**须复测** |
| **[L237](#L237)** | 应用内提醒设置 + 横幅（场景 **P**） | **待人工测试**：每日说明 + 软提示 + Hint；新文案与面板须复测 |
| **[L256](#L256)** | 用户场景剧本 SCENARIO_TESTS | 总包；本轮至少走完 **C + O + P** |
| **[L182](#L182)** | Honesty 桥接 CTA 叠层 | 入口隐藏 / z18 修过，**须复测** |
| **[L249](#L249)** | 门闩一体包 · Companion 点选→开表 | 主路径 + Rise 回流 |
| **[L258](#L258)** | How shall we sit? 立刻展开三选一 | 07-20 起待测；与门闩同批 |
| **[L279](#L279)** | Offline 禁止二次 Sit | 一次 Sit 即 Focusing |

#### P1 · 接下来 1–2 周产品壳收口（本轮不测）

| 行 | 功能 | 备注 |
|---|---|---|
| L181 | Honesty 补登成功 toast | 文案已锁；同屏观感 |
| L197 | FocusSession + Focus HUD | 随 ⚡ 改动 |
| L229 / L231 / L232 | 一分钟呼吸簇 | L233 可顺带 |
| L248 | Honesty pending 丢失 abort | 异常回流 |
| L254 / L273 | 点 ? 补救 hints / 音乐 tip 锚 mute | |
| L271 / L272 | 窄屏 onboarding 互斥 / Sit 不截断 | 375 |
| L277 | Offline Space 说明文案 | 桌面口径 |
| **[L187](#L187)** | MilestoneGlow | **有问题**；约定 **2026-07-30 前**复测或改期 |

#### P2 · 调试日 / 长会话日（本轮不测；勿与 P0 抢注意力）

| 类别 | 行 |
|---|---|
| 实验室 / 素材观感 | L176–178、L195、L205、L209、L214–216、L219、L221、L280 |
| 长墙钟 | L188（20min）、L190（2h）、L212（Flow 30min idle） |
| 基建 / 实验 | L169 Workers、L170 UI Kit、L213 i18n、L269 `?product=1` 冒烟 |

#### 已降级 · 不再排人工验收队列

| 行 | 新状态 | 说明 |
|---|---|---|
| **[L186](#L186)** IncenseComplete | **已放弃/不适用** | 业务会话结束**未接线**；调试入口可留作 Backlog 素材预览，**不**作合并门禁 |
| **[L196](#L196)** 抚摸 / 轻点 / 绕圈 | **不挡合并（仅检测逻辑）** | 无正式 2D 精灵；检测靠单测；产品壳**不**要求验动画 |

### 用户测试反馈记入规则（2026-07-19 起）

凡用户书面反馈某功能相关界面/操作的测试意见（含「有问题」「建议改」「计划放弃」等），须记入功能清单表格的 **「用户反馈」列**（专用列），**禁止**混入「测试步骤」列。

对应功能行同时：

1. 状态改为「有问题」（或保留「待人工测试」若仅为建议/方向确认、尚未判定为缺陷）  
2. **用户反馈**列写清：**日期**（当天）+ **原话要点**（可压缩，勿改语义）  
3. 若已开修：在「用户反馈」同格注明「处理中 / 待复测」；修复后状态改回「待人工测试」，**禁止**自行标「已通过」  
4. 无书面反馈的行，「用户反馈」列填 `—`

### 防「修了又丢」回归锁（2026-07-19 · 方法级）

权威执行细则：`.cursor/rules/focus-tiger-regression-lock.mdc`（alwaysApply）+ `PROCESS.md`「回归锁工作法」。本表只记验收要点：

1. **交互门闩须可单测**：禁止只靠 `main.js` 静默 `return`；须抽纯函数并写**失败用例**（门闩未就绪 → false）。  
2. **UI 与门闩同开同关**：未就绪则禁用/隐藏，禁止「点了没反应」。  
3. **同主题行禁止互斥步骤**：Arrival / Companion / HUD 等对「是否再点 Sit」的描述必须一致。  
4. **测试步骤须含回流路径**：至少写清「主路径」+「Rise / 二次进入后再测」之一。  
5. **修复收尾本地 commit**：见 regression-lock「Commit 汇报与分支门禁」（`RULES_INDEX.md` → `git-agent-commit`）；**push 仍须用户明确要求**。  
6. **Bug 修复须同批更新相关项目文档（N15）**：至少本表；触及行为/情绪/架构时同步权威 md。缺文档或未 commit = 未完成。

### 自动化回归锁 vs 近几日用户 bug（2026-07-20 · Task 1 后）

**重要**：`npm run test:smoke` / `npm run test:e2e` **不会替用户「验收通过」**，也**不是**把 bug 修好了——它们是 **防「修了又丢」的回归锚**。下面区分三类：

| 类别 | 含义 |
|---|---|
| **代码已修** | 某轮 commit 里改了实现；你仍可能要人工看观感 |
| **自动化已锁** | 在**标明的层**（单元 / 控制器集成 / DOM 用户链路）会拦住同类回归；须写清测到源头还是只测下游；**全绿 ≠ 观感 OK** |
| **仍须人工** | 序列/布局/时长/Safari 等 L-eyes，自动化刻意不测 |

#### A. 代码已修 + 今日自动化已锁（再犯同类逻辑/DOM 错应被冒烟拦住）

| 用户反馈 / bug 主题 | 代码修复（早前） | 自动化锚（层 + 范围） | 仍须你人工看什么 |
|---|---|---|---|
| How shall we sit? 点了没反应 / 须展开三选一 | `resolveCompanionHintClick` + CompanionModePicker | **单元** smoke I（hint→toggle 纯函数）+ **DOM** e2e I（hint → `.session-start-dock__panel`，**不**出 Arrival） | Honesty 开着时点 hint 的**文案/动效**（**未**自动化） |
| Here & Now 选中应立刻开计时 | `canBeginFocusOnCompanionModeSelect` | **单元** smoke A3–A4（门闩真/假）+ **DOM** e2e A（HUD Focusing、计时走动）；**非** Choose 点头观感 | Choose 后**点头/pingpong 观感**、Safari 底部横排 |
| Offline 选中即开表（禁止二次 Sit） | `shouldAutoStartFocusOnModeSelect` | **单元** smoke A4 / `FocusSession.test` + **DOM** e2e K（Arrival 后选 Offline → 立刻 Focusing） | Offline 离开期间 Re-focus **不出现**（场景 E） |
| Skip — begin 半卡 Sit / 门闩静默 | `shouldBeginFocusOnArrivalReady` 等 | **单元** smoke A3–A4（`canBeginFocus` 门闩 false→不可 begin）+ **DOM** e2e **A2/A3**（预选模式 → Skip — begin → 开表，**无需**再点 Sit） | Skip 后**立刻 Rise** 的手感/动画（逻辑与 DOM 开表已锁） |
| 同日首次 Celebrating vs 二次 SessionComplete | `session-completion-feedback` + `celebrated` 戳 | **单元** smoke A7–A8（`triggerSessionCompletionFeedback` 分流；Honesty 不挡舞）；**非**动画 DOM | **动画本身**（人工 · Celebrating 行） |
| Rise 未达标 → Reflection + 意图回显 | `SessionEndFlow` + `resolveSessionIntentionLatch` | **控制器集成** smoke C（`SessionEndFlow` → mock `open` 入参；**非** Choose 源头）；**DOM** e2e `reflection-intention-echo.spec.js`（主路径有/无回显，**非**抹闩 Bug）；**单元** `SessionIntentionStore.test.js` · `resolveSessionIntentionLatch: pending wins; empty pending must not wipe latch`（抹闩 Bug）；smoke J **只**锁 hint toggle 纯函数，**不**锁 Reflection | **rise-stretch-casual 观感**、Reflection 淡入 |
| Honesty 桥接 Yes/No | `HonestyBridgeCtaController` | **控制器集成** smoke D（Yes→`onAccept` / No→`onDecline` 回调）；**DOM** e2e `micro-ritual.spec.js` bridge 行（经 `__honestyBridge` **注入**可见态，锁入口隐藏/No 恢复；**非**真实补登→桥接→Yes→Arrival） | **桥接 UI 排版**、真实补登后 Yes→完整 Arrival |
| Re-focus 在 Offline/Flow 应抑制 | `shouldSuppressAwayReminders` | **单元/控制器** smoke B（门闩 + `handleAttentionReturn` mock emotion）；**非**真实切页 | **真实切标签 >60s**（人工 · Re-focus 行） |
| Sit 误开 Honesty | z-index / 门闩（你已标已通过） | 无专门 e2e | 维持「已通过」；自动化未单列 |

#### B. 代码已修或已改，但自动化**锁不住**（必须继续人工 / TEST_TRACKER 分列）

> **本表 = bug 主题索引**（为何自动化帮不上、该去测哪一行）。**不是**可执行步骤本身。  
> **行号** = 下方 `## 功能清单` 表格在 **本文件** 中的当前行号（Cursor / GitHub 可 `#L174` 跳转）。增删功能行后须同步改本表。  
> **场景 checklist**（A1 Idle、重置按钮等）在 **L261–L267** 的 `人工 · …` / DEV 重置块，与 §B 互补、勿混为一谈。

| 用户反馈 / bug 主题 | 状态 | 为何自动化帮不上 | 功能清单行号 → 去测 |
|---|---|---|---|
| Idle 呼吸→眨眼/一瞥 **闪一下** | 已通过 | L-eyes / L-contract；e2e 不看像素 | **[L262](#L262)** `人工 · Idle 统一 pingpong 不闪` · **[L204](#L204)** `IdleOrchestrator / 坐禅闭眼` · 契约 `IdleOrchestrator.test.js` |
| Safari Companion **底部横排**仍挡/错位 | 已通过 | e2e 未测 WebKit 布局 | **[L179](#L179)** `Companion Mode`（Safari 专项） |
| Choose **pingpong + 1s 叠化** | 已通过 | 动画帧级 | **[L172](#L172)** `Arrival Choose 点头 pingpong→idle` · 可选 **[L173](#L173)** 完整 Arrival 串联 |
| Notice 短句 **2.4s 可读** | 已通过 | 时长观感 | **[L171](#L171)** `Notice 点选后` · **[L263](#L263)** `人工 · Notice 短句可读完` |
| Idle 突然东张西望 | 已通过 | 已关随机池；无自动调度单测 | **[L176](#L176)** `调试面板 · 全入库素材` · **[L194](#L194)** `idle / 坐禅闭眼呼吸基底` |
| 靠近自动点头 | 已通过 | 行为已拆；无 e2e | **[L193](#L193)** `PointerInteraction · 靠近点头 nodGreeting` |
| Rise → **LightProgression** 金晕 | 已通过 | 视觉 + 产品语义 | **[L203](#L203)** `LightProgression / 光影物理渐进` |
| MilestoneGlow 金辉节奏 | **有问题**（**已知，不挡** PR #2→`main`） | 观感（Sleeping 已关单） | **[L187](#L187)** MilestoneGlow（4 fps；**预计 2026-07-30 前**复测） |
| Ambient Sound **入口**（未计时提示 / 开表后可展开） | 已通过 | 入口行为已验收 | **[L191](#L191)** Ambient Soundscape · **[L264](#L264)** `人工 · 静音图标 + Sound` |

**§B 未单列、但在场景 checklist 里测的项**（见 **L261–L267**）：**[L261](#L261)** A1 Idle 开局（**已通过**） · **[L266](#L266)** Celebrating / 同日 SessionComplete 观感（**已通过**） · **[L267](#L267)** Honesty 桥接完整 Arrival（**已通过**） · DEV 一键重置（**L-logic / 仅单元测试**）。

#### C. 下一步自动化（未做 · 排 Task 2/3）

| 优先级 | 内容 | 对应 bug/场景 |
|---|---|---|
| Task 2 | E/F **逻辑单测**（舒展累计暂停、Flow 30min toast mock） | 场景 E/F；Offline/Flow 模式矩阵 |
| Task 3 | Playwright **真实 Honesty 补登 → 桥接 Yes → Arrival DOM**（勿仅 `__honestyBridge` 注入） | 场景 D/N；补登回流 |
| 可选 | e2e **Rise 后再点 hint** 回流 DOM（smoke J 目前只锁纯函数） | 场景 J |
| 不做 | 真实切页 60s、Celebrating 像素、Idle 闪不闪 | 留人工分列 → **[L262](#L262)** Idle（**已通过**） · **[L265](#L265)** Re-focus（**已通过**） · **[L266](#L266)** Celebrating / SessionComplete（**已通过**） · **[L261–L267](#L261)** 场景 checklist |

**命令**：`cd focus-tiger && npm run test:smoke`（scenario + 重置 L-logic + **SessionUiGate** + HUD 映射等）· `npm run test:e2e`（约 **32** 条：产品壳 2 + Companion A/I/K 等 + 意图回显 2 + 热力图 7 + 提醒 4 + FocusHUD hover 1 + 微仪式/桥接 4 等）。Agent 环境若缺浏览器：本机先 `npm run test:e2e:install`，或 config 已默认 `channel: 'chrome'` 用系统 Chrome。

---

## 状态定义

- **仅单元测试覆盖**：无用户可见变化，逻辑对错已由自动化测试验证，用户不需要点开看。
- **待人工测试**：已实现，单元测试（如有）已通过，但视觉/体验效果需要用户亲自看一遍才能确认。
- **已通过**：用户亲自测试确认没问题（或缺陷已按用户要求撤销/回退，且代码核对确认到位）。
- **有问题**：用户测试后发现瑕疵，需写清楚问题内容，退回处理。
- **已放弃/不适用**：产品已决定不做或卸下（含「业务未接线、暂不验收」）；**不**再排人工验收，也不挡 `develop`→`main` 合并。
- **不挡合并（仅调试）**：只在实验室调试面板 / 兼容空键出现，**产品壳 `?product=1` 正式用户路径看不到**；可留技术债，不挡合并。
- **不挡合并（仅检测逻辑）**：交互检测已接线且有单测，但**无正式精灵/动画**；产品壳不排视觉验收，不挡合并（例：抚摸/轻点/绕圈占位）。

---

## 功能清单

> 首次回溯盘点：2026-07-18。凡用户从未书面确认「已通过」的 UI 项一律标「待人工测试」。
> **列约定**：`测试步骤` = 怎么测；`用户反馈` = 用户书面测试意见（日期 + 原话要点）。二者禁止混写。  
> **行号**：本表各行号供文首 §A / §B 索引跳转；改表后须同步更新 §B「功能清单行号」列。

| 功能 | 类型（UI可见 / 纯后端） | 状态 | 测试步骤 | 用户反馈 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|
| Cloudflare Workers API 骨架（cloud/ stub） | 纯后端 | 待人工测试 | **主路径**：`cd focus-tiger/cloud && npm install && npm run dev` → `curl` 两个 POST（见 `cloud/README.md`）须返回固定 mock。**校验**：缺字段 → 400。**回流**：连续超限请求 → 429（阈值写死 60/min；内存限流）。**本步不测前端**（未接线）。请 review 暂定字段：`daily-message` 要 `locale`+`localDate`；`emotion-weight` 要 `emotionKey`+`sessionPhase`。 | — | `http://127.0.0.1:8787` · `cloud/README.md` | 2026-07-22 |
| UI Kit 设计实验（tokens + Web Components） | UI可见 | 待人工测试 | **主路径（产品舞台 v6）**：`http://127.0.0.1:8765/ui-kit/demo.html?v=20260721f`。**产品壳 Sit/Sound**：`npm run dev` → `/` 或 `/?product=1`，Sit with Yin / Rise / Sound 应为**蒲团橙**（非朱红）；How shall we sit? 仍暖米金。**回流**：开计时变 Rise 再回 Sit，色仍为橙。 | 2026-07-21：…v6。**同日书面**：同意产品壳 Sit 也改蒲团橙 → 已改 `#btn-focus` + Sound 同系 + PRINCIPLES/DESIGN；请硬刷新看产品壳。 | `/` · `/?product=1` · demo `?v=20260721f` | 2026-07-21 |
| Arrival Practice / Notice「What is present…」点选后 | UI可见 | 已通过 | Sit → Notice：点 Calm → 图标收起，**短句须能读完**（约 2.4s）再进呼吸。 | 2026-07-20：书面确认框收起 OK。**同日再反馈**：`a calm presence…` 来不及看就消失→已加长至 2.4s，请复测。**2026-07-20 晚**：用户书面「测试 OK」。 | `http://localhost:5173/` · Sit → Calm | 2026-07-20 |
| Arrival Practice / Choose 点头 pingpong→idle | UI可见 | 已通过 | Choose → **nod-bow pingpong**（正放鞠躬→倒放回坐姿）→ Companion 立刻可展；进出用 **约 1s 叠化**。 | 2026-07-20：用户要求加倒放 pingpong + 前后 1s 叠化。**2026-07-22**：用户书面 A 类开放行——Choose 点头 pingpong + 1s 叠化，**测试 OK**。 | `http://localhost:5173/` · Sit → Choose | 2026-07-22 |
| Arrival Practice / 抵达练习（Welcome → Notice → Breath → Choose） | UI可见 | 已通过 | Breath 推近；Choose 点头 + 坐垫光晕；Companion 马上可用；点头↔idle **1s 叠化**后再拉回视距。 | 2026-07-20：点头改 pingpong + CapCut 1s。**2026-07-22**：与 Choose 点头行一并书面 **测试 OK**（主路径观感）。 | `http://localhost:5173/` · Sit | 2026-07-22 |
| Arrival · 轻量气泡 + ⚡ Quick Start（去 Skip 双钮） | UI可见 | 已通过 | **对照** `ARRIVE_MOMENT_DESIGN.md` v2：Notice/Choose 为点图标+观察式短句，**非**重型模态。**本次**：去掉 Arrival 内 Skip / Skip — begin；UI 改为透明气泡/字幕+轻图标格；Sit 路径仍为 Welcome→Notice→Breath→Choose；快速开表改 **⚡ `#quick-start-focus`**（记忆 Companion 模式立刻 Focusing）。**主路径**：Sit → 见轻气泡（非大卡片）；**Arrival 开着时 Sit 隐藏**（防叠图标）→ Notice 点选 → 短句 → Breath → Choose → Focusing；⚡ 仍可见。**点外侧**：Notice / Choose **选择格**打开时，点框外空白须**取消仪式回 Idle**（不开表）；⚡ 仍可立刻开表。**快速路径**：点 ⚡ → 立刻 Rise/Focusing。**回流**：Rise 后再 Sit 仍走完整 Notice/Breath；⚡ 再开表。 | **2026-07-24**…Sit 重叠已改。**2026-07-25 用户书面**：Notice/Choose 选择框应允许点空白消除 → 已补外侧取消；e2e 锁 Notice/Choose 外侧回 Idle。请硬刷新复测。 **2026-07-25 用户书面（5174）**：Sit→Notice / Choose **点空白取消回 Idle** — **测试 OK**。 | `?product=1` · `#arrival-practice` · e2e A + outside-dismiss · `#quick-start-focus` | 2026-07-25 |
| Sit with Yin 误开 Honesty / Mindful Check-in | UI可见 | 已通过 | 点 Sit → Arrival，不应开 Mindful Check-in。 | 2026-07-20：用户书面「测试 OK了」。 | `#btn-focus` | 2026-07-20 |
| 调试面板 · 全入库素材试播 | UI可见 | 待人工测试 | 右上角滚动列表：「入库素材（逐条试播）」应覆盖 manifest 全部序列（含 gaze / tea / ear / lotus / tilt-think 等）。点 `gaze-p*` 可单独验收抠图与背景跳动。正式 Idle 不应再自动张望。 | 2026-07-20：用户发现 Idle 突然东张西望+背景跳 → 已关自动变体并补全调试入口。**2026-07-21**：用户书面——正式 Idle **不**自动东张西望，测试 OK（本行其余「全入库试播/抠图」仍待测）。 | `#emotion-debug-ui`（勿加 `?product=1`） | 2026-07-21 |
| 一次性情绪时长标准（ack / light） | UI可见 | 待人工测试 | 调试面板抽查：`合十确认`≈6–7s；`sessionComplete`≈3.5s；`nodBow`/`stretchReminder`/`waveHello` 明显慢于旧版「一闪」。Celebrating 仍约 5s。 | 2026-07-19：用户要求统一时长带；不足则放慢/重复/正倒放。 | `#emotion-debug-ui` | 2026-07-19 |
| 14 套新抠图算法整批替换 | UI可见 | 待人工测试 | 用调试面板或对应触发点抽查：`palms-together`、`celebrate-dance-v2`、`session-complete`、`nod-bow`、`stretch-reminder`、`milestone-glow`、gaze-p1～p4、`yawn-stretch`、`breath-halo-hq`（已替 expand）、lotus-*。确认角色边缘无灰白斑/脏底，四角透明。 | 2026-07-19：用户用新算法重跑全部 14 套并统一重打包；旧版已全部替换。2026-07-20：`breath-halo-expand`→`breath-halo-hq`。 | `#emotion-debug-ui` · 路径见 `ASSET_INVENTORY.md` 增量表 | 2026-07-20 |
| Companion Mode / 陪伴模式三选一（Here & Now · Offline Space · Flow State） | UI可见 | 待人工测试 | **主路径**：① hint → **Here & Now / Flow** → Arrival → Choose/鞠躬后立刻 Focusing。② hint → **Offline Space** → **立刻 Focusing，不出 Arrival Notice/Choose**。③ Sit → Choose 鞠躬后自动 Focusing（或门闩就绪后三选一点选即计时）。**回流**：Rise 后再 Sit（或 hint→Here&Now 再走 Arrival）。**点外侧**：三选一面板打开时，点框外空白须收起。 | **2026-07-21**：Flow/Reading 鞠躬开表已修。**2026-07-22**：Safari Companion **测试 OK**。**2026-07-25**：外侧关闭已补；Offline 跳过 Arrival；**同日** L249 书面——未就绪点 Here&Now 出 Notice 易被当成回归（步骤漂移，见 L249）。 | 底部 Sit 旁 dock · **DOM** e2e A/A4/I/K · Safari 人工 | 2026-07-25 |
| Companion · Offline 禁止二次 Sit / 跳过 Arrival | UI可见 | 待人工测试 | **主路径**：How shall we sit? → **Offline Space** → **立刻 Focusing**；**不得**见「What is present right now?」Notice / Choose。**回流**：Rise → 再点 Offline 仍直接开表。**对照**：Here & Now / Flow 门闩未就绪仍走 Arrival。 | **2026-07-21**：Offline 禁止二次 Sit。**2026-07-25**：用户书面——Offline 出 Arrival 不对（离开哪有 Choose）→ 已改 `shouldSkipArrivalOnModeSelect`；e2e K 改「无 Arrival」。 | `?product=1` · e2e K · `#arrival-practice` | 2026-07-25 |
| Honesty Check-in / Mindful Check-in | UI可见 | 已通过 | **主路径**：零完成开局 → **Idle 闭目坐禅**（不是睡着）+ 可忽略提示（EN 含 `sitting with you` / `Quiet time elsewhere`；ZH 含「闭目同坐」「别处的静心」）。点提示 → 选时长 → **呼吸引导**（不播 dormant-wake）→ **toast「别处的静心，也算数」** + 桥接。**回流**：同日再补登走空闲 Mindful Check-in → 呼吸 → toast + 再出桥接。调试「睡着了」仍可试 Sleeping→dormant-wake。 | **2026-07-21**：用户书面——登录后第一幕不能是睡觉模样（not uplifting），须 Idle 闭目坐禅。已改零完成默认 Idle。**2026-07-22**：用户书面 A 类——Honesty 在 Idle 上的补登（非睡着）→呼吸→桥接，**测试 OK**。**同日晚**：用户拍板加成功 toast（对齐微仪式）；观感见下行。 | 零完成自动 · `#honesty-idle-entry` · DEV：`__honestyCheckIn` | 2026-07-22 |
| Honesty 补登成功 toast（`HONESTY_CHECKIN_RECORDED`） | UI可见 | 待人工测试 | **主路径**：Honesty 选时长 → 呼吸结束 → **立刻**居中 toast（EN `Quiet time elsewhere counts, too.` / ZH「别处的静心，也算数。」，约 4.5s）+ 桥接 Yes/No 同屏。**回流**：同日再补登仍出 toast；**abort**（pending 丢失）只出 `HONESTY_PENDING_LOST`，**不出**本句。375×667 看 toast 与桥接不互挡到不可读。 | 2026-07-22：用户拍板「成功也加轻量确认」；**单元/控制器** `HonestyCheckInController.test.js`（成功路径调 `notifyRecorded` / abort 不调用——**非** toast DOM 可见性）。**同日书面**：文案「现在的就挺好啦。不要改」——**锁定现稿，勿缩短**。观感/同屏仍待人工测。 | `?product=1` · `#mindful-acknowledge-toast` · 桥接 | 2026-07-22 |
| Honesty 桥接 CTA（补登后邀请再坐） | UI可见 | 待人工测试 | **主路径**：补登结束 → **立刻**出现（顶行 Welcome +「要不要现在也坐一会儿？」Yes/No）；成功路径另有记账 toast（见上行）。Yes → 完整 Arrival → Companion。No → idle。**回流**：同日再补登 → **应再出**桥接。**叠层（强制）**：桥接可见时 **不得**见 Honesty Check-in /「一分钟呼吸」叠在 Yes/No 上（入口隐藏 + 桥接 z18 > dock）；点 No 后两入口恢复。**Honesty 流程**：一点 Check-in → 入口即藏，直到桥接 Yes/No（或取消）才再出。 | 2026-07-19：立刻出现。**2026-07-20 晚**：完整 Arrival OK。**2026-07-22**：微仪式叠层已修；**同日再书面**——Honesty Check-in 仍挡 Yes/No → 已修（busy 贯穿桥接 + dock CSS + z18）；请硬刷新复测。**DOM**：`micro-ritual.spec.js` bridge 行经 `__honestyBridge.onHonestyCheckInComplete()` **注入**可见态，锁入口隐藏 + No 恢复（**非**真实补登链；**非** Yes→Arrival）。**控制器**：smoke D 锁 Yes/No 回调。 | DEV：`__honestyBridge` · `#honesty-bridge-cta` · `#honesty-idle-entry` | 2026-07-22 |
| Tiger Reflection Moment / 结束反思 | UI可见 | 已通过 | 正常完成或主动 Rise 结束会话 → 留白约 400ms（完成）/ 300ms（主动）后淡入面板。**意图回显**：仅当**本场** Arrival Choose 有内容时，Reflection 面板**顶部**立刻显示（icon：`所选方向：{text}` / typed：`所写方向：{text}`；文案含 emoji 如 `📖 Reading`）。**不是**第二次 Choose 时头顶提示。无 Choose / 点了 **Skip — begin** → 无回显属正确。Q1–Q3：Continue / Skip / Skip all / Esc。 | **2026-07-22**：用户书面——多日点 Reading 从未见回显。已改：Choose/`onReady` 立刻闩上 + 空 pending 不抹闩 + 回显样式加强。**回归锁分工**：**DOM 用户链路** e2e `reflection-intention-echo.spec.js` 锁主路径有/无回显（**非**本次 Bug）；**单元** `resolveSessionIntentionLatch: pending wins; empty pending must not wipe latch` 锁抹闩 Bug；**控制器集成** smoke C 仅锁 `SessionEndFlow`→`open` 入参（下游接线，**非** Choose 源头）。请硬刷新后：Sit→…→点 **Reading**（勿点 Skip — begin）→ Rise → 看面板顶米色条。 **2026-07-24 用户书面（硬刷新复测）**：① Sit → Reading → Rise → Reflection 顶条见 Reading — **测试 OK**；② Skip all → 再 Sit → Skip — begin → Rise → **不得**再有 Reading 顶条 — **测试 OK**。 | 会话结束后自动 · e2e `reflection-intention-echo.spec.js`（主路径 DOM）· 单元 `SessionIntentionStore.test.js`（Bug 锁）· smoke C（下游入参）· DEV：`__reflectionMoment` | 2026-07-22 |
| 完成反馈 · 每日首次 Celebrating | UI可见 | 已通过 | **须等计时自动达标**（勿提前点 Rise；达标后点 Rise 也会进完成反馈）。当日可先 Honesty 补登；**首次计时达标**仍须 Celebrating（Honesty 不占庆祝戳）。播 `celebrate-dance` → idle → Reflection。 | 2026-07-21：用户书面——多日多次 focus 超 1 分钟从未见 Celebrating 舞；已修。**2026-07-21 复测**：`/` 满 1 分钟见舞；`/?sessionMinutes=5` 满 5 分钟见舞。 | `triggerSessionCompletionFeedback` · 调试「庆祝跳舞」 | 2026-07-21 |
| 完成反馈 · 同日后续 SessionComplete | UI可见 | 已通过 | 当日**已播过** Celebrating 后，再跑一轮 1 分钟达标 → 只播 `session-complete` 摆尾，**不**再 Celebrating。 | 2026-07-21：同 Celebrating 行用户反馈；庆祝戳已解耦。**2026-07-21 复测**：`http://localhost:5173` 同日第二次 1 分钟达标 → 只撅屁股摆尾、不再 Celebrating 舞；测试 OK。**同日晚**：`/?product=1` 再次确认同日第二次满 1 分钟 → 摆尾、非跳舞；测试 OK。 | 同上 · 调试「完成摆尾」 | 2026-07-21 |
| IncenseComplete / 今日一炷香（莲花+金斑） | UI可见 | 已放弃/不适用 | **业务会话结束未接线**，正式路径看不到；**不再排人工验收**，不挡合并。调试面板「模拟一炷香」可自愿预览（DOM 莲花+金粒子；水印已清），效果保留给 Backlog 成长场景复用，勿删实现。 | 2026-07-19：建议保留效果给荷花成长场景。同日清 PixMiller 水印。**2026-07-25**：用户拍板降级——业务未接线 →「已放弃/不适用」，退出近期验收队列。 | `#emotion-debug-ui` · `playEmotion('incenseComplete')` · 实现：`IncenseGreeting.js` | 2026-07-25 |
| MilestoneGlow / 里程碑金辉 | UI可见 | 有问题 | 调试面板点「里程碑金辉」→ `milestone-glow` 27 帧（金光+蝴蝶）→ 末帧停约 2.5s → 回落。播放期归零实时金光。真实里程碑判定属 Backlog。 | 2026-07-19：金光蝴蝶须放慢 2×→已改 **4 fps**（原 8），请复测。**2026-07-23（合并门禁书面）**：**已知问题，不影响此次合并**（PR #2 `develop`→`main`）；产品壳正式路径不可见，仅调试面板。**回头复测**：预计 **2026-07-30 前**，在下一轮调试面板情绪素材节奏清理时专测 4 fps + 末帧停留观感；到期未测须改期并再写本列，禁止无限挂起。 | `#emotion-debug-ui` · `playEmotion('milestoneGlow')` | 2026-07-19 |
| MindfulAcknowledge / 20 分钟阶段确认 | UI可见 | 待人工测试 | Companion = Here & Now，开一场会话并保持页面 ≥ **20 分钟墙钟** → `nod-bow` + 非模态 toast（`MINDFUL_FOCUS_MILESTONE` 池）。与强反馈冲突时静默让位。共享日额度最多 3 次（`focus-tiger.reminder-quota.v1`）。演示会话仅 1 分钟时建议用调试按钮或 `__mindfulReminderController`。 | — | 生产长计时 / 调试面板正念确认 · DEV：`__mindfulReminderController` · `__reminderQuotaManager` | 2026-07-18 |
| Re-focus Acknowledge / 回归确认 | UI可见 | 已通过 | **用户路径**见场景 B：开 **`/?sessionMinutes=5`**。**Here & Now**：切走 **&gt;60s** → toast + nod-bow。**Flow State / Offline**：同样切走 **&gt;60s** → **不应**出现 Re-focus（离开是预期）。**&lt;20s 无反应属正确**。 | 2026-07-20 晚：DEMO/10s 门槛说明。**2026-07-21**：用户书面 Sit/Here&Now 切页 **测试 OK**；Flow State「结果不对、不匹配」→ 产品预期即与 Here & Now **不同**：Flow **故意无**文案+nod-bow。**同日晚**：用户确认原 8 条独立行批次全部关闭。 | `/?sessionMinutes=5` · **单元/控制器** smoke B（**非**真实切页） | 2026-07-21 |
| stretchReminder / 舒展提醒 | UI可见 | 待人工测试 | 会话活跃累计满 **2 小时**（离开暂停；两场间隔 ≥30 分钟重置）→ `stretch-reminder` 17 帧 + toast。占共享日额度。演示短会话建议调试面板触发。 | — | 调试面板 / 生产长计时 · DEV：`__mindfulReminderController` | 2026-07-18 |
| Ambient Soundscape / 静音图标 + Sound | UI可见 | 待人工测试 | **静音 / 开播**：右上米色圆形 **音符钮**（关=可点开播；在播=音符+斜杠，点一下静音）。**Sound**：右下蒲团橙 **Sound** **始终可见**；**Sit 开计时后**可展开选曲/音量；未专注点 Sound 会提示先开始专注。**主路径**：**登录/打开后默认无音乐**（须点音符才播；默认曲目仍 Mer-Ka-Ba）；专注后 Sound 换曲。**回流**：关→刷新仍关；**Rise / 达标结束 → 自动停播**；再 Sit **不**自动再开。 | **2026-07-20**…**2026-07-21 晚**：开关 OK。**2026-07-25**：用户拍板 Rise 后**自动停播**；同日再拍板 **opt-in（不默认播）**；**须复测**。 | 右上 `.ambient-soundscape__mute` · 右下 `.ambient-soundscape__fab` · `AmbientSoundscapeController.test.js` | 2026-07-25 |
| EyeTracking / 正式瞳孔 PNG | UI可见 | 已放弃/不适用 | 运行时已卸下 `pupil-left/right` 叠加跟随；调试勾选已移除。Idle 张望 gaze-p1～p4 **不受影响**。**不再排人工验收**。 | 2026-07-19 实测错位；**已决定放弃**。**2026-07-22**：状态改为「已放弃/不适用」（不挡合并）。结论见 `CORE_LOOP.md`。 | 已废弃 · `/textures/eye-pupils/` 可不接线 | 2026-07-22 |
| PointerInteraction · 靠近点头 nodGreeting | UI可见 | 已通过 | **默认靠近不再点头**。开局 / idle：指针移入靠近区 → **不应**播 `nod-greeting`。调试面板「点头致意」仍可手工播（**6 fps**，末帧多停约 2 拍）→ 回 idle。 | 2026-07-19：曾要放慢点头→已改。**同日再反馈**：开局默认态仍见点头 → 根因是靠近区仍自动 `nodGreeting`；已拆除靠近自动点头。**2026-07-21**：用户书面——默认只有呼吸/眨眼、靠近不再自动点头，测试 OK。 | 全屏命中层 · DEV：`__pointerInteraction` · 调试「点头致意」 | 2026-07-21 |
| idle / 坐禅闭眼呼吸基底 | UI可见 | 已通过 | 点「坐禅闭眼」或「重置并 idle 坐禅」：**闭目 pingpong ×2**（frame 1–19）→ **睁眼弧 pingpong ×1**（frame 1–33）→ 往复；同素材硬切、不叠化。 | 2026-07-20：切分两段 pingpong。**2026-07-20 用户书面**：坐禅闭眼 / idle 坐禅各情况测试 OK。 | 调试「坐禅闭眼」 · `__idleOrchestrator` · `#dev-reset-all-local-state-idle` | 2026-07-20 |
| PointerInteraction · 静止好奇 curiousTilt | UI可见 | 待人工测试 | 靠近区静止 **4s** → 播 **blink-smile** 单次（已替换托腮 tilt-think）→ 180ms 淡回 idle。冷却 6s。 | 2026-07-19：打坐↔托腮仍很跳→已换眨眼类；请确认衔接是否顺。 | 全屏命中层 · DEV：`__pointerInteraction` | 2026-07-19 |
| PointerInteraction · 抚摸 / 轻点 / 绕圈（检测已接线、无正式精灵） | 纯后端+占位 | 不挡合并（仅检测逻辑） | **无正式 2D 精灵**；产品壳**不**排视觉验收。检测：头部拖动 ≥14px → `petHead`；头部点击位移 ≤10px → `smileSquint`；约 1.4s 内绕圈 ~1.75π → `dizzyBlink`（控制台占位）。正确性靠 `PointerInteraction.test.js`；自愿可在实验室看 console。 | **2026-07-25**：用户拍板降级——仅验证检测逻辑，不挡合并；退出近期验收队列。 | 单测：`PointerInteraction.test.js` · DEV：`__pointerInteraction` | 2026-07-25 |
| FocusSession + Focus HUD（Sit with Yin / Rise） | UI可见 | 待人工测试 | **主路径**：Sit → Welcome→Notice→Breath→Choose → Focusing；或 **⚡ Quick Start** → 立刻 Rise。**回流**：Rise → Reflection → 再 Sit。 | 2026-07-20：Skip begin 半卡 Sit→已改为直接开始。**2026-07-24**：Skip 双钮移除，快速开表改 ⚡；请复测。**DOM**：e2e A Choose 开表；A2/A3 预选+⚡ 开表。 | `#focus-hud` · `#btn-focus` | 2026-07-20 |
| FocusHUD 金环+呼吸光 / 数字弱化 | UI可见 | 已通过 | **主路径**：左上角约 **2×** 大卡：金环（琥珀金、够显眼）+ 中心光点**持续一张一缩**；Sit 后环随进度走。**悬停**露 Focus %。**回流**：Rise 后环回淡。 | 2026-07-21：香炉误读→改金环+光点。**同日书面**：①圈/点看不清 ②呼吸点应不停一张一缩 ③整体太小、建议放大两倍 → 已加对比、加强呼吸、约 2×。**2026-07-22**：用户书面 A 类开放行，**测试 OK**。**单元**：`focusHudHalo.test.js`（`focusLevelToHaloVars` 填充分数→透明度映射；**非**金环/呼吸光 DOM）。e2e Companion 仅顺带断言 `#hud-state`/`#hud-time` 文案（**非**金环观感）。 | `#focus-hud` · `/?product=1` | 2026-07-22 |
| FocusHUD 今日同坐 progress-bar | UI可见 | 已通过 | **主路径**：HUD 下方见蒲团橙软条 + 文案「Today's shared sitting / 今日同坐」；空日接近空；Sit 计时中条渐长且有**轻脉冲**。**回流**：Rise 后脉冲停；若本场未达标完成则条回落至已完成分钟。勿与 Companion 三选一抢「怎么坐」。**非** daily-quest 清单。 | 2026-07-21：UI Kit progress-bar 纳入产品壳。**2026-07-22**：用户书面 A 类，**测试 OK**。**单元**：`sharedSittingProgress.test.js`（百分比映射 helper；**非** progress-bar DOM / 脉冲观感）。 | `#focus-hud progress-bar` · `/?product=1` | 2026-07-22 |
| FocusHUD streak-meter 近日同坐 | UI可见 | 待人工测试 | **主路径**：HUD 右侧小 7 点环；空日点仍可见（浅描边）；达标/Honesty 记账后多亮一点（非 Day N 计分牌）。**悬停**见浮层「Recent days… / 近日同坐的日子」（须盖在「今日同坐」条之上、可读）。满 7 点短金息。**回流**：重置本地后环回空心点。禁止断签焦虑文案。点击无单独动作（悬停说明即可）。 | 2026-07-21：UI Kit streak-meter 纳入。**2026-07-22**：用户书面 A 类，**测试 OK**。**单元**：`PracticeDaysStore.test.js`（多日数据 / streak 计数；**非** 7 点环 DOM）。**2026-07-25 用户书面**：timer「蓝点」悬停/点击无反应 → 查证为近日同坐 7 点悬停文案被 progress-bar 盖住；已改为浮层 + host z-index + 空心点对比；e2e `focus-hud-hover.spec.js`。请硬刷新复测悬停。金环本体悬停仍应露 Focus %。 | `#focus-hud streak-meter` · `/?product=1` · e2e `focus-hud-hover.spec.js` | 2026-07-22 |
| 「?」朱砂 notification-badge | UI可见 | 已通过 | **主路径**：新用户左下「?」角有朱砂小红点；点一次「?」后红点消失且不再常驻。**回流**：DEV 重置 hints 后再见红点。勿做成常驻角标噪音。 | 2026-07-21：稀缺强调色。**2026-07-22**：用户书面——朱砂红点「用于系统里面的通知，或者 alert 之类的」（未标测试 OK；现实现仍挂 onboarding「?」未读）。**同日再书面**：问号朱砂点表示未读「完全可以，就请保留」→ **保留现实现**，不改挂。 | `#onboarding-hint-help` · `/?product=1` | 2026-07-22 |
| How shall we sit? secondary 米色立体钮 | UI可见 | 已通过 | Sit 仍为蒲团橙主 CTA；旁「How shall we sit?」为**米色立体次要钮**（渐变暖米底＋凸起阴影），不透明，不抢 Sit。Honesty Bridge Yes/No 仍同级（勿改成主次）。 | 2026-07-21：用户书面——背景透明不对，应改米色立体按钮。**2026-07-22**：用户书面 A 类，**测试 OK**。 | `.session-start-dock__hint` · `#btn-focus` | 2026-07-22 |
| LightProgression / 光影物理渐进 | UI可见 | 已通过 | Arrival：冷→暖背景、Notice 升温、Breath 视差 Dolly（背景 1.06 / Yin 1.12）+ 呼吸光环、Choose 坐垫光晕。FOCUSING：DOM Rim 跟踪 focusLevel（+ ambient boost）与约 4s 呼吸脉冲。Re-focus：Recover 扰动后约 5s 平复。 | 2026-07-19：用户反馈 Rise 后页面动画无变化。文档规定 FOCUSING 有金光、IDLE 无光环——Rise 应收起 Rim。**2026-07-22**：用户书面 A 类——LightProgression，**测试 OK**。 | 随 Arrival / Re-focus 自动 · DEV：`__lightProgression` · 单测：`LightProgression.test.js` | 2026-07-22 |
| IdleOrchestrator / 坐禅闭眼 | UI可见 | 已通过 | 点「坐禅闭眼」→ `idleBreathClosed` ×2 pingpong → `idleBlinkArc` ×1 pingpong → 循环；段间**硬切**不叠化。回流：Celebrating / Rise 后再 idle。 | 2026-07-20：切分帧界 4433/6937。**2026-07-20 用户书面**：各情况测试 OK。 | `#emotion-debug-ui` · `__idleOrchestrator` | 2026-07-20 |
| 候选陪伴手势 · 逐条试播 | UI可见 | 待人工测试 | 调试「入库素材」点：`tea-drinking` / `yawn-stretch` / `ear-wiggle` / gaze-p* —— **应直接播该条并定格末帧**；**不应**先闪一下闭目坐禅。**`blink-breathe` / `breath-halo-hq` 为 pingpong 循环**（不定格）。张望用「组合试播」**整段** `张望 (p1→p2→p3→p4)`（不再分 A/B）。 | 2026-07-20：合并张望 A+B；pingpong 清单尊重 loopMode。 | `#emotion-debug-ui` · 入库素材 / 组合试播 | 2026-07-20 |
| blink-breathe 眨眼深呼吸 | UI可见 | 已通过 | 调试面板仍可 pingpong 试播；**不再**作为 Rise 主路径。 | 2026-07-20：用户书面「测试 OK了」。同日产品拍板：Rise 改接 `rise-stretch-casual`。 | `#emotion-debug-ui` | 2026-07-20 |
| rise-stretch-casual / 中途 Rise 伸懒腰 | UI可见 | 已通过 | **主路径**：Sit → Skip begin → 中途点 **Rise** → 伸懒腰→箕坐**正放一次**（不 pingpong 循环；末帧约 2 拍停）→ ~300ms 后 Reflection。**回流**：关 Reflection → 叠化回 Idle/Sleeping；再 Sit / Arrival。达标结束**不**播本段。 | 2026-07-20：用户反馈循环播放不妥→已改正放一次。**2026-07-20 用户书面**：Sit → Skip begin → 中途 Rise，动画只播一遍、不再循环，测试 OK。 | Rise · 调试「Rise伸懒腰(正式)」· `playEmotion('riseStretchCasual')` | 2026-07-20 |
| cloak-sleep / 披毯入睡（进 DORMANT） | UI可见 | 待人工测试 | **主路径**：非 DORMANT→DORMANT → `cloakSleep` 正放 @6fps≈5.7s（末帧 034）→ cross-fade → **睡姿**（同源 034→030 双拍 pingpong）。**须验**：披毯末帧与睡姿循环**姿态连贯、无硬切侧卧**。**回流**：已 DORMANT 持续睡（含跨午夜 sync）→ **不**重复披毯；唤醒后再进 DORMANT → 再播一次。**调试**：入库素材仍可单条试播。 | **2026-07-22**：用户书面——模拟 ≥2h 进睡后走 Honesty 唤醒全流程，**测试 OK**（含披毯入睡观感）。**2026-07-25**：用户书面——进入页面后开场即播披斗篷趴下；且该过渡与后续睡姿循环**完全不连贯**。已改睡姿为 cloak-sleep 030–034 双拍 pingpong，请复测衔接（开场即睡另案）。 | 改 `focus-session-end` 时间戳模拟 · `#emotion-debug-ui` | 2026-07-25 |
| MilestoneGlow 备选 breath-halo-hq | UI可见 | 待人工测试 | 调试「breath-halo-hq」→ pingpong；**顶点停留约 6 拍（~0.75s）**。 | 2026-07-20：用户反馈顶点仍需延长→已从 2 拍加到 6 拍，请复测。 | `#emotion-debug-ui` | 2026-07-20 |
| Sleeping / DORMANT 睡态循环 | UI可见 | 待人工测试 | **自动**：距上次专注结束 ≥ `DORMANT_IDLE_HOURS`（默认 **2h**）→ `STATES.DORMANT`；披毯后睡姿为 **cloak-sleep 034→030 每帧两拍 pingpong** @ **2 fps**（不再用旧 `sleeping/` 侧卧 8 帧）。新用户无结束记录**不**触发。零完成开局仍为 Idle。**调试**：「睡着了」→ 同 pingpong 微动。**须分列验**：① 节奏约 2 fps、仍安宁；② 与披毯末帧同姿连贯；③ Honesty 倒放唤醒仍可从睡姿接上。 | **2026-07-22**：用户书面——模拟 3h 前进睡后 HUD Asleep + sleeping 侧卧，再 Honesty 唤醒，**测试 OK**。**2026-07-25**：用户书面——披毯过渡与后续睡姿**完全不连贯**（见 cloak-sleep 行）→ 已改同源末帧 pingpong；同日再书面——节奏太慢 → 已 **1→2 fps**；同日再书面——**节奏基本合适**。衔接/唤醒仍请确认。 | `?product=1` · DEV 改 `focus-session-end` · `#emotion-debug-ui` | 2026-07-25 |
| DORMANT 2h 滚动触发 + sleep→wake 串联 | UI可见 | 已通过 | **单元/控制器集成**：`dormantIdle` chain + smoke `D sleep→wake`（状态机 + `playEmotion` 调用序；**非**披毯/倒放观感 DOM）。**人工主路径**：改 `focus-session-end` → 刷新见披毯→sleeping → Honesty唤醒选时长 → 倒放睡醒 + 10s 呼吸 → 离 DORMANT / 桥接。 | **2026-07-22**：用户书面——Honesty唤醒(流程) → 选时长 → cloak-sleep 倒放 + 10s 呼吸 → 离睡着态，**测试 OK**。 | `npm run test:smoke` · 实验室 `#emotion-debug-ui` | 2026-07-22 |
| AcrossToolsIdleGuard / Flow State 闲置 toast | UI可见 | 待人工测试 | Companion 选 Flow State → Sit → **30 分钟**无鼠标/键盘 → 一次 `ACROSS_TOOLS_IDLE` toast。仅切标签页不算 idle。 | — | 生产长等待 · DEV：`__acrossToolsIdleGuard` · **单元** `AcrossToolsIdleGuard.test.js`（阈值后触发一次；**非** 30min 真实墙钟 DOM） | 2026-07-18 |
| i18n（默认 en / 可切 zh） | UI可见 | 待人工测试 | 默认英文。控制台 `__i18n.setLocale('zh')` → 按钮、HUD、Arrival、Honesty、Companion、Reflection、Ambient、toast 刷新为中文；再 `setLocale('en')` 切回。**无应用内语言切换 UI。** | — | DEV：`window.__i18n` · `src/locales/{en,zh}.json` | 2026-07-18 |
| Emotion debug UI（右上角调试面板） | UI可见 | 待人工测试 | 逐个点一次性姿态：播完应**定格末帧**，不硬切默认闭目呼吸；点「坐禅闭眼」才回 idle 循环。循环态（睡着/微笑/光环）照常循环。面板底部**不应**再出现「动态效果层」（绕 Y 轴旋转 / 呼吸起伏 / 悬浮）三项勾选。 | 2026-07-19：勿刻板切回默认闭目→已改 `holdPose`，定格末帧仍待复测。同日：动态效果层须从 2D 删除→已移除；**用户确认测试通过**。 | `#emotion-debug-ui` | 2026-07-19 |
| smiling / blink-smile（欢迎与调试） | UI可见 | 待人工测试 | Arrival Welcome 自动播；或调试「坐禅微笑」。pingpong。Celebrating 后持久 Smiling 基底**未接线**（回 Idle）。 | — | Arrival / 调试面板 | 2026-07-18 |
| welcomeBack / wave-hello 挥手 | UI可见 | 待人工测试 | 调试面板播「挥手欢迎」→ 抬手 → 顶点摇摆 008–012 **播两遍** → 放手（共约 24 拍播放列表）；**无**最高点单帧 hold。**10 分钟自主挥手未接线。** | 2026-07-19：最高处完全重复那一帧须删；最高处左右摇摆须多重复一遍再放手。已改，请复测。 | `#emotion-debug-ui` · `playEmotion('welcomeBack')` | 2026-07-19 |
| dormantWake / Honesty 睡醒序列 | UI可见 | 已通过 | **主路径**：进 DORMANT 后「Honesty唤醒」选时长 → **`cloak-sleep` 34 帧倒放**（**6 fps** ≈5.7s）→ 定格末帧 + **约 10s 呼吸**并行。**回流**：定格后桥接 Yes/No。**对比**：「唤醒(伸懒腰)」仍走 stretch-reminder，视觉须不同。**不**淡入闭眼呼吸、**不**自动接光环金光。 | **2026-07-21**：用户希望用斗篷倒放替换原 dormant-wake。**2026-07-22**：用户书面——Honesty唤醒(流程)选时长 → 倒放睡醒 + 10s 呼吸 → 离睡着态，**测试 OK**。 | Honesty / `#emotion-debug-ui` · `playEmotion('dormantWake')` | 2026-07-22 |
| lookAtCursor / wakeUp / snoringZZZ 等 | 纯后端+调试 | 不挡合并（仅调试） | **正式用户（`?product=1`）看不到这三项**：产品路径 Honesty 睡醒走 `dormantWake`；舒展提醒走 `stretchReminder`；`main.js` **不**调用 `wakeUp` / `lookAtCursor` / `snoringZZZ`。`wakeUp` 仅实验室调试钮「唤醒(伸懒腰)」；`lookAtCursor` 兼容空操作；`snoringZZZ` unimplemented。调试对比两唤醒钮可自愿抽查，**非合并门禁**。 | 2026-07-19/21：与 Honesty 视觉分离。**2026-07-22**：确认仅调试/占位 → 标「不挡合并（仅调试）」。 | `#emotion-debug-ui`（实验室 `/`；产品壳隐藏） | 2026-07-22 |
| haloBreathing / 光环呼吸奖励 | UI可见 | 待人工测试 | 调试面板播「光环呼吸奖励」：intro + loop。**fps 已放慢 2×**（intro 5 / loop 4，原 10/8）。Honesty 路径暂不自动接。 | 2026-07-19：播放太快须至少放慢 2×→已改，请复测。 | `#emotion-debug-ui` | 2026-07-19 |
| blink / 眨眼变体 | UI可见 | 已通过 | Idle 眨眼由 `idleBlinkArc`（×1 pingpong）插入闭目段（×2）之间；调试 blink-smile 仍可手工播。 | 2026-07-20：两段 pingpong 编排。**2026-07-20 用户书面**：idle 坐禅测试 OK。 | 调试 / Idle 编排 | 2026-07-20 |
| tPose / 显示 3D 垫底（调试） | UI可见 | 待人工测试 | 调试面板 T-Pose → 短暂露出 3D canvas。确认 2D 主线默认隐藏 3D。 | — | `#emotion-debug-ui` | 2026-07-18 |
| ArrivalPractice 状态机 | 纯后端 | 仅单元测试覆盖 | `npm test` → `ArrivalPractice.test.js` | — | `src/core/ArrivalPractice.js` | 2026-07-18 |
| DailyCompletionStore | 纯后端 | 仅单元测试覆盖 | `DailyCompletionStore.test.js`；与 Honesty / 完成分流共用 | — | `src/core/DailyCompletionStore.js` | 2026-07-18 |
| 留存漏斗骨架 RetentionTelemetry | 纯后端 | 仅单元测试覆盖 | **无 UI、无第三方**（正式工具暂不选型）。`RETENTION_FUNNEL.md`；`console.log('[RetentionTelemetry]', …)`。事件：`app_first_open` / `first_session_complete` / `day1\|3\|7\|30_return`（窗口内首次返回）/ `dormant_bridge_shown\|accepted\|declined` / **`micro_ritual_complete`**（不抢 `first_session`）。接线：`main.noteAppOpen`、`HonestyCheckIn.onSessionRecorded`、桥接 `trackEvent`（含 No→declined）、`completeMicroRitual`。storage `retention-funnel.v1` 纳入 DEV 重置。 | — | `RetentionTelemetry.test.js` · `HonestyBridgeCtaController.test.js` · `docs/RETENTION_FUNNEL.md` | 2026-07-22 |
| 「本周陪伴」热力图 · 数据结构/挂载位调研（第 1 步） | 纯文档 | 仅单元测试覆盖 | **无 UI**。结论：`DailyCompletionStore` **仅当日**不够。数据源已改为扩展 `PracticeDaysStore`（见下行）。**候选挂载（未拍板）**：① Reflection `onDone` 后短暂角标 ② Idle 常驻一角（避开 FocusHUD 左上 / Sound 右下 / Sit·Honesty dock 底中 / 音符右上）③ Reflection 面板内收尾一角 ④ HUD 旁替换或并列现有 streak-meter。 | 2026-07-22：用户要求先确认数据结构再实现 | `SHARED_RESOURCES` §1.1–1.2 | 2026-07-22 |
| PracticeDaysStore 多日时长 + getLastNDays（热力图 Store） | 纯后端 | 仅单元测试覆盖 | `days: { date, totalMinutes }[]`（旧 `string[]` → `totalMinutes: null`）；`markToday(minutes)` 同日累加；`getLastNDays(7)` 缺口补 0；窗口仍 90。写入仍走 Honesty/`onPracticeDay`。 | — | `PracticeDaysStore.test.js` · `SHARED_RESOURCES` §1.2 | 2026-07-22 |
| 「本周陪伴」7 格热力图 UI（Idle 常驻） | UI可见 | 待人工测试 | **主路径**：`?product=1` Idle → 见 7 格。**宽屏 ≥480**：左下 `?` 上方。**窄屏 ≤479 / 375**：ActionBar（? · Calm/time · ♪）+ Yin + **上滑抽屉**——Sit / Quick Start / **Honesty 必须在列** / 呼吸 / How / **Sound → 立刻弹出 Soundscape 选曲面板**（曲目+音量；**禁止**只抬红色 Sound FAB；**禁止**只出一行门闩文案） / **提醒（开设置面板）**；抽屉钮紧凑半高。**Focusing**：左上 `#focus-hud`；Sound FAB 藏、右上 mute 可关。**回流**：Rise → grabber；♪ 静音。**DOM**：e2e `weekly-practice-heatmap.spec.js`（Honesty 常列 + Sound **panel 可见且 FAB 隐藏** + Reminder）。 | **2026-07-24**：375 书面①–⑦。**2026-07-25**：Honesty / 提醒 **测试 OK**；Sound 弹出红色 Sound 钮而非原先选曲框——已改为抽屉 Sound 直接开 Soundscape 面板；**须复测 Sound**。 | `?product=1` · DevTools 375×667 · `#ft-narrow-idle-shell` | 2026-07-25 |
| 「一分钟呼吸」微仪式 · 方案调研 | 纯文档 | 仅单元测试覆盖 | 方案见 `MICRO_RITUAL_PLAN.md`。**实现已另开下行**。 | 2026-07-22：先调研后实现 | `docs/MICRO_RITUAL_PLAN.md` | 2026-07-22 |
| 「一分钟呼吸」微仪式 · Idle 接入 | UI可见 | 待人工测试 | **主路径**：立体入口 → 吸↔呼文案 + smiling@4fps + **4s 独立光环**（不同拍）约 60s → 中下部 toast + SessionComplete 摆尾 → 记账。进行中 FocusHUD 直播。**回流**：Leave 安静退出。桥接时入口隐藏。**DOM**：e2e `micro-ritual.spec.js`（缩短墙钟主路径：入口→呼吸文案→toast+记账+回流；Leave 不记账；**非** smiling@4fps / 摆尾节奏观感）。 | 2026-07-22：实现+HUD/toast。**同日晚用户书面**：主路径除同拍/质感外基本 OK；同拍须 undo；入口间距基本 OK 但四钮质感须协调。 | `?product=1` · `#micro-ritual-idle-entry` | 2026-07-22 |
| 「一分钟呼吸」· 吸呼相位与 smiling 节奏 | UI可见 | 已通过 | ~~文案↔光环/Yin 同拍~~ **已撤销**。当前实现：吸/呼文案约 **2.5s** 交替；光环 **独立 4s**（`GOLD_BREATH_PERIOD_SEC`）；smiling@4fps；**无** Yin `scaleY` / `ft-yin-guided-breath`；`beginBreath()` 不再传 `periodSec`。 | **2026-07-22**：用户书面「同拍不行；需要 undo」→ `736fdc1` 撤销。**同日代码核对关单**：`LightProgression` / `main.js` / `MicroRitualUI` 无同拍残留；缺陷（错误同拍）已关闭。入口质感等见相邻「待人工测试」行。 | 同上 · `?microRitualMs=15000` | 2026-07-22 |
| 「一分钟呼吸」· HUD 墙钟与完成 toast 中置 | UI可见 | 待人工测试 | **主路径**：点一分钟呼吸 → 左上 `#hud-time` 从 00:00 递增、状态呈 Focusing/专注中、今日同坐条与金环随进度推进；到点完成文案在**画面中下部约 62%**（避开脸、非底栏夹缝），仍可见摆尾。**回流**：Leave → HUD 回 Calm/00:00（未记账）。**DOM**：e2e 锁 `#hud-time` 递增 + toast `data-placement=center` + boundingBox 大致中置（**非**精确 62% 视觉验收；**非**金环/同坐条脉冲观感）。 | 2026-07-22 午：用户书面仪表不动 + toast 不显眼。**同日复测**：基本 OK；toast 42% 挡脸偏高 → 已下移 62%。**同日又书面**：以 Honesty 补登成功 toast 位置为准，微仪式须同位置（共享常量）。 | 同上 | 2026-07-22 |
| 「一分钟呼吸」· Idle 入口立体钮与 dock 间距 | UI可见 | 待人工测试 | 四钮**同族立体质感**：Honesty / 一分钟呼吸 / How shall we sit? 次级同尺寸（13px、9×20、同 inset+底边阴影）；Sit 略大主 CTA（15px、11×28）但同一圆角/内高光/底边语言。色可不同（米/青绿/蒲团橙）。gap≈16px。 | **2026-07-22**：用户书面「基本 OK，但颜色、大小、质感还需和谐协调；颜色可以不同；目前质感不统一」。已改同族质感，**须复测**。 | `?product=1` · `#session-start-dock` | 2026-07-22 |
| 「一分钟呼吸」· SessionComplete 摆尾（禁 Celebrating） | UI可见 | 待人工测试 | 微仪式结束后只见 **摆尾**，**不见** Celebrating 舞；即便当日尚无正式 Focus 达标也如此。同日第二次微仪式仍只摆尾。 | **2026-07-22**：用户书面——一分钟呼吸结束后「好像只有撅屁摇尾，没有跳舞」；问是否原设计。**口径确认：是**（见 `MICRO_RITUAL_PLAN`：从不 Celebrating）。跳舞仅正式 Sit→计时**墙钟达标**当日首次。**同日午**：用户书面「其它方面测试 OK」。 | 同上 | 2026-07-22 |
| SessionIntentionStore | 纯后端 | 仅单元测试覆盖 | `SessionIntentionStore.test.js`；Choose 写入 `intentions.v1`。**Bug 回归锁（2026-07-22 Reading 回显）**：`resolveSessionIntentionLatch: pending wins; empty pending must not wipe latch` — 模拟二次 `beginFocus` 时 `pendingChoose` 已空、`clearIfEmpty: false` 仍保留 `📖 Reading`（§7 红绿对照；e2e 主路径不测此边界） | — | `src/core/SessionIntentionStore.js` · `SessionIntentionStore.test.js` | 2026-07-22 |
| ReminderQuotaManager | 纯后端 | 仅单元测试覆盖 | `ReminderQuotaManager.test.js`；三类提醒共享自然日额度 | — | `src/core/ReminderQuotaManager.js` | 2026-07-18 |
| 应用内提醒偏好 + 横幅候选判定 | 纯后端 | 仅单元测试覆盖 | **逻辑无 UI、无浏览器 Notification**。`get/setReminderPreference`（`reminder-preference.v1`；形状 `{ hour, minute }` 或 `null`，**无 `enabled` 字段**）；`evaluateInAppReminderBanner`：未设置 / 未到时 / 今日已完成 → 不触发；全满足 → `{ shouldShow: true, messageKey: 'reminder.gentle_waiting' }`。`resolveReminderPreferencePanelNotes`：常显 `daily_blurb`；已过时分→`past_time_note`；今日已练优先→`practiced_today_note`（**不**禁改时）。完成判定：`DailyCompletionStore.hasCompletedToday()`（含 Honesty / 微仪式）。 | — | `reminderPreference.test.js` · `InAppReminderBannerController.test.js` · `SHARED_RESOURCES` | 2026-07-22 |
| 应用内提醒设置入口 + 横幅 UI | UI可见 | 待人工测试 | **设置入口**：Idle 左下热力图簇旁的小型时钟图标（`ReminderPreferenceUI`）。仅 Idle 可见；点开轻量面板 → 勾选「开启提醒」写入 `{ hour, minute }`；取消 → 清空存储。**每日语义**：面板常显 `#reminder-preference-daily-blurb`；onboarding Hint `in-app-reminder`（时钟旁；「?」补救 Idle 亦含）。**软提示**：已过时分可保存 + `past_time_note`；今日已练 → `practiced_today_note`，**时间仍可改**。**横幅**：`#ui-overlay` 顶部居中（`InAppReminderBannerUI`），到点且今日未完成时 `reminder.gentle_waiting`（EN "Yin is right here when you're ready." / ZH「你准备好了，阿寅就在这儿。」；**禁** waiting/在等你紧逼感），可点 × 关闭。**主路径**：点时钟→开启并设时→切后台再回前台→横幅。**回流**：关闭后本页不再出现；完整刷新 / 新开 App 若条件仍满足可再出。**忙碌期（已拍板）**：Arrival / Focusing / Celebrate / Reflection / 微仪式 → **`suppress`**。DEV：`window.__inAppReminder.{sync,setNow,clearNow,controller,settings,banner}`。 | 2026-07-22：入口改热力图簇旁；e2e `in-app-reminder.spec.js`。**2026-07-23**：suppress 拍板。**2026-07-24**：设置中途不弹横幅 **测试 OK**；waiting 文案改 presence，须复测。**2026-07-25 用户书面**：过去时分无约束、今日已练面板语义、须知「每天」→ 已拍板「可保存+软提示」「可改时+说明」+ **每日 Hint/面板说明**；请硬刷新 **5173 实验室重置** 后复测面板文案 / Hint / 横幅。 | Idle 左下 `#weekly-practice-heatmap-cluster` · `#reminder-preference-toggle` · `#reminder-preference-daily-blurb` · `#reminder-preference-status` · `#in-app-reminder-banner` · e2e `in-app-reminder.spec.js` · DEV `__inAppReminder` · 实验室 `/`「重置全部本地状态」 | 2026-07-22 |
| session-completion-feedback 分流逻辑 | 纯后端 | 仅单元测试覆盖 | `session-completion-feedback.test.js`；首日 Celebrating vs 同日 SessionComplete | — | `src/core/session-completion-feedback.js` | 2026-07-18 |
| AttentionSignals | 纯后端 | 仅单元测试覆盖 | `AttentionSignals.test.js`；20s 记账 / 60s 回归展示 | — | `src/input/AttentionSignals.js` | 2026-07-18 |
| CharacterConfig 路径拼接 | 纯后端 | 仅单元测试覆盖 | `CharacterConfig.test.js`；无换装 UI | — | `src/character/CharacterConfig.js` | 2026-07-18 |
| SpriteSequencePlayer | 纯后端+渲染 | 仅单元测试覆盖 | `SpriteSequencePlayer.test.js`；预加载/打断/帧停留/子序列 | — | `src/character/SpriteSequencePlayer.js` | 2026-07-18 |
| EmotionController 映射桥 | 纯后端+桥接 | 仅单元测试覆盖 | `EmotionController.test.js`；业务只调 `playEmotion` | — | `src/core/EmotionController.js` | 2026-07-18 |
| CapCut 式叠代默认（one-shot→idle） | 纯后端+桥接 | 仅单元测试覆盖 | `_finishOneShot` 默认 `CAPCUT_DISSOLVE_MS`；`returnCrossFadeMs: MICRO` 可缩短；`EmotionController.test.js` | — | PRINCIPLES / EMOTION_BIBLE §1.6 | 2026-07-20 |
| SessionUiGate（Arrival/叠层/完成中门闩 facade） | 纯后端 | 仅单元测试覆盖 | `SessionUiGate.test.js` + 并入 `npm run test:smoke`：未就绪不得 begin；Sit 未就绪 → start-arrival；叠层 hint ignore；`computePostSessionOverlayActive` 可扩展源；`resolveCompanionModeSelectCommit` 拒绝不写 storage | — | `src/core/SessionUiGate.js` · DEV `__sessionUiGate` · `SHARED_RESOURCES` §4 | 2026-07-22 |
| 文档-代码结构对齐（DOC_CODE_CONTRACT） | 纯后端 | 仅单元测试覆盖 | `npm run docs:check`（hints / gate / **state-machine** / **rules-authority**）；`state:doc-sync` / `gate:doc-sync` / `hints:doc-sync` / `rules:doc-sync`；故意改 ARCHITECTURE §状态机或 SHARED_RESOURCES §4 机器块或 RULES_INDEX 机器块须 exit 1。pre-commit：根目录 husky → `test:smoke`。CI：`.github/workflows/focus-tiger-doc-contract-check.yml`（**须 `npm ci`**）。详见 `DEV_WORKFLOW_QUALITY.md` §7.7。 | — | `docs/DOC_CODE_CONTRACT.md` · `docs/RULES_INDEX.md` · registries | 2026-07-23 |
| 规则主题权威索引（RULES_INDEX） | 纯后端 | 仅单元测试覆盖 | `npm run rules:doc-check`（并入 `docs:check`）：主题 SSOT 必含断言；非 SSOT 禁止指纹级完整复述；禁止矛盾短语（如「先问再 commit」对抗「可自动 commit」）。索引：`docs/RULES_INDEX.md`；registry：`scripts/rules-authority-registry.js`。负向自检：`node --test scripts/rules-authority-doc-check.test.js`。 | — | `RULES_INDEX.md` · `WORKFLOW.md` · `focus-tiger-regression-lock.mdc` | 2026-07-23 |
| StateManager 合法转移 warn（不阻断） | 纯后端 | 仅单元测试覆盖 | `StateManager.test.js`：非法转移仍写入但 `console.warn`；合法路径无 warn；**BREAK 已删**。**单测 harness** `MoodController.test` 会打出 `IDLE → CELEBRATE` warn（跳步），属预期。观察册：`EDGE_CASES.md` | — | `src/core/StateManager.js` | 2026-07-22 |
| Honesty pending 丢失 abort（禁 `?? 30`） | UI可见 | 待人工测试 | **主路径**：Honesty 选时长 → 呼吸正常结束 → 仍记账 + **成功 toast**（`HONESTY_CHECKIN_RECORDED`）+ 桥接。**异常回流**：呼吸进行中若 pending 被清（如 force 重开竞态）→ **不得**记 30 分钟；须 toast（EN `HONESTY_PENDING_LOST` / ZH「请再选一次时长」）+ **重开时长三选一**（非白屏/卡住）；**不得**出成功 toast。375×667 看 toast 不被 dock 完全挡住。 | 2026-07-22：静默失败排查 #4；**单元/控制器** `HonestyCheckInController.test.js`（abort 不记账 / 调 pending-lost；**非** toast DOM）。**2026-07-22**：用户书面——`/?product=1`（端口 5174）**正常补登**路径测试 OK；并问「正常记账用户可能看不出来？」→ 已拍板加成功 toast。**异常回流仍待你复测**。 | `?product=1` · Honesty · toast `#mindful-acknowledge-toast` | 2026-07-22 |
| 门闩一体包 · Companion 点选→真实开表 | UI可见 | 有问题 | **主路径（2026-07-25 对齐）**：`?product=1` → Sit→Notice→Breath→**Choose** → 鞠躬后**展开 Companion** → 点 **Here & Now / Flow / Offline** → **立刻 Focusing**（**不得**再出 Notice；**无需**再点 Sit）。预选模式再走 Arrival / ⚡ 仍可直接开表。**回流**：Rise 后再 Sit→Choose→再选仍开表。**对照**：Rise 后**未** Sit 就点 Here & Now → 会进 Notice（须再仪式或 ⚡）。375×667。 | **2026-07-22**：静默失败批 3。**2026-07-25**：用户书面——Choose 后再点 Here & Now / Flow 仍出 Notice → 根因是鞠躬后曾**自动开表**，Companion 点选窗口与门闩时序易错；已改鞠躬后**展开 Companion 再点选开表**；e2e A/A4/A4b。请硬刷新 **5173/5174** 复测。 | `?product=1` · e2e A/A4/A4b · `#btn-focus` | 2026-07-25 |
| 静默失败观察册 EDGE_CASES | 纯后端 | 仅单元测试覆盖 | 审计边角入库；批 1–3 已记入。不代替 TEST_TRACKER 验收行。 | — | `docs/EDGE_CASES.md` | 2026-07-22 |
| Lit 试点 · OnboardingHintsUI（步 4） | UI可见 | 已通过 | **主路径**：实验室「清空引导提示已读」→ 见 `help-affordance`（Lit **薄荷绿**气泡）。点 **?** → 本页全部锚点提示 + **App 用途简介卡**（标题/正文/知道了）。**回流**：关气泡后再点 ?；Rise 后 FOCUSING 再点 ?。 | 2026-07-21：Lit 试点。**同日书面**：① 恢复薄荷绿 ② 点 ? 另出简介卡。**2026-07-22**：用户书面 A 类——Hints 薄荷绿 + 点 ? 用途简介卡，**测试 OK**。 | `#onboarding-hint-help` · `#onboarding-app-purpose` · Brief | 2026-07-22 |
| 分散式即时提示 + 「?」补救（ONBOARDING_HINTS v3） | UI可见 | 已通过 | **主路径**：清空已读 → 左下 **?** 旁 `help-affordance`（**薄荷绿**）。点 ? → 本页 hints + 用途简介卡。**回流**：关卡后再点 ?。 | 2026-07-20：尖角/补救反馈。**2026-07-21**：恢复薄荷绿 + 用途简介卡。**2026-07-22**：用户书面 A 类，**测试 OK**。 | `#onboarding-hint-help` · 实验室「清空引导提示已读」 | 2026-07-22 |
| 人工 · help-affordance 尖角对准 ? | UI可见 | 已通过 | 1) 清空引导提示已读。2) `help-affordance` 在 **? 右侧**，尖角对准 ?，气泡为**薄荷绿**（非奶油米黄）。3) 回流：缩放后再看。 | 2026-07-20：尖角未对准。**2026-07-21**：恢复绿色式样。**2026-07-22**：与 Hints 薄荷绿批次一并 **测试 OK**。 | `?product=1` 或 `/` · `#onboarding-hint-help` | 2026-07-22 |
| 人工 · 点 ? 补救展示本页全部 hints | UI可见 | 待人工测试 | 1) 先点掉自动提示。2) 点 **?**。3) Idle 须同时见：Sit / How shall we sit? / **热力图** / **应用内提醒时钟**（`in-app-reminder`）/ **一分钟呼吸**（入口可见时）/ **Sound gated** / `help-remedy`（含 EN「Click a tip to dismiss… tap ? anytime…」）+ **用途简介卡**。4) Honesty 桥接打开时点 ? → 须见 **honesty-bridge** tip + 热力图/提醒/Sound（**不见** micro-ritual）。5) 点气泡关该条；再点 ? 仍全部出现。 | 2026-07-20：只有元文案。**2026-07-21**：加简介卡。**2026-07-22**：A 类测试 OK 后用户再书面缺 tip → **已补登记**四类 + 更新 help-remedy；请硬刷新复测。**2026-07-25**：补 `in-app-reminder`（每日时分），**须复测** Idle「?」是否含时钟 tip。 | `#onboarding-hint-help` · `#onboarding-app-purpose` · `#reminder-preference-toggle` | 2026-07-22 |
| Ambient 播放缓亮 Rim（presenceBoost + playing lift） | UI可见 | 已通过 | **验收口径（2026-07-22 起）**：不再以「音乐会加亮边缘金光」作产品承诺；Sound hint **不**宣传缓亮。底层 Rim lift 可保留实现，**不以可见缓亮为必测项**。 | 2026-07-19：文案称音乐会加亮。**2026-07-20**：用户反馈未见光效；Sound hint 已改不写加亮。**2026-07-22**：用户书面——「正式砍掉了宣传」+ **测试 OK**（关包口径=不宣传、不强制可见）。 | Sound 面板 · DEMO 1min 会话 | 2026-07-22 |
| 用户场景剧本 SCENARIO_TESTS（A–H + I–P） | UI可见 | 待人工测试 | 权威：`focus-tiger/docs/SCENARIO_TESTS.md`。用 **`?product=1`** 走完整故事串。**新增 O**（7 格热力图）· **P**（应用内提醒 + suppress/defer 说明）。**单元/控制器** `npm run test:smoke`；**DOM 用户链路** `npm run test:e2e`（覆盖层见文首 §A 与 SCENARIO 各场景标题——**全绿 ≠ 故事走完**）。**观感子项已拆成下方独立行，勿只勾本行。** | 2026-07-22：新增正式场景 O/P。**同日**：核对「已自动化」口径，禁止笼统宣称整条故事已锁。 | `SCENARIO_TESTS.md` · `?product=1` | 2026-07-22 |
| 场景冒烟自动化 scenario-smoke（A–D + I/J · 逻辑层） | 纯后端 | 仅单元测试覆盖 | `scenario-smoke.test.js`（**10** 条控制器/门闩用例）+ `localStateKeys.test.js`（重置 L-logic）等并入 `npm run test:smoke`。覆盖：门闩/完成反馈分流/Re-focus 抑制/`SessionEndFlow` 入参/Honesty 桥接回调/**I·J hint→toggle 纯函数**。**不含**浏览器 DOM、**不含**序列观感；smoke C **不**等于 Choose→Reflection 全链。 | 2026-07-20：Task 1 补 smoke I。**2026-07-21**：并入重置白名单/新用户读数。**2026-07-22**：口径收紧（层/范围）。 | `scenario-smoke.test.js` · `localStateKeys.test.js` | 2026-07-22 |
| 人工 · How shall we sit? 立刻展开三选一 | UI可见 | 待人工测试 | 1) `?product=1` 重置本地状态。2) **不要点 Sit**，直接点 **How shall we sit?**。3) 须**立刻**出现 Here & Now / Offline Space / Flow State 三选一，**不是**「What is present right now?」Arrival 框。4) 回流：Rise 结束后再点 hint 仍展开三选一。 | 2026-07-20 用户书面：点 How shall we sit? 出 Arrival 框不对，应出三选项；记得原来就是这样后来改坏了。 | `?product=1` · `.session-start-dock__hint` | 2026-07-20 |
| 浏览器 e2e 产品壳冒烟（Playwright） | 纯后端 | 仅单元测试覆盖 | `npm run test:e2e`（**2 条**）：`?product=1` 见 Sit、无调试面板；实验室有「重置全部本地状态」。 | — | `e2e/product-shell.smoke.spec.js` | 2026-07-20 |
| 浏览器 e2e 场景 A/I/K Companion DOM（Playwright） | 纯后端 | 仅单元测试覆盖 | `npm run test:e2e`：**I** hint 开面板；**I2** 未就绪 Here&Now → Arrival（HUD idle）；**A** Choose→自动开表；**A4** 门闩就绪→Here&Now 开表且无 Notice；**A2/A3** 预选→⚡ 开表；**K** Offline 无 Arrival 即开表；**Notice/Choose 点外侧** → 回 Idle。 | 2026-07-21：Offline 二次 Sit 已废除。**2026-07-25**：补 A4；补 Arrival 外侧取消。 | `e2e/scenario-a.companion.spec.js` | 2026-07-25 |
| 人工 · A1 Idle 开局（非 Sleeping） | UI可见 | 已通过 | 1) 实验室「重置全部本地状态」。2) 开 `?product=1`。3) 确认阿寅是 **Idle 闭目坐禅**，**不是**睡着。4) Honesty 可忽略提示可见。5) **右上**见音符钮（默认有声，可静音）。 | **2026-07-21**：用户书面——第一幕不能睡觉；须 Idle + 默认音乐。旧「A1 睡着已通过」口径作废。**同日晚**：用户确认原 8 条独立行批次全部关闭（含本行 Idle 开局）。 | `?product=1` · 重置按钮在 `/` | 2026-07-21 |
| 人工 · Idle 统一 pingpong 不闪（序列） | UI可见 | 已通过 | 1) 「坐禅闭眼」或「重置并 idle 坐禅」。2) 闭目段 ×2 + 睁眼弧 ×1 循环，段间无闪白/叠化。3) 回流：Rise 后再 idle。 | 2026-07-20：切分降睁眼频率。**2026-07-20 用户书面**：各情况测试 OK；**晚**：再次确认「已经解决」。 | `/` · DEV `__idleOrchestrator` | 2026-07-20 |
| 人工 · Arrival Notice 观察短句可读完 | UI可见 | 已通过 | 1) Sit → Notice 点 Okay（或 Calm）。2) 观察式短句须能读完（约 2.4s）再进呼吸。3) 回流：Rise → 再 Sit → 再点一次 Notice。 | 2026-07-20 晚：用户书面「测试 OK」。 | `?product=1` · Sit → Notice | 2026-07-20 |
| 人工 · 静音图标 + Sound | UI可见 | 待人工测试 | 1) `?product=1` 重置后进入。2) **右上**音符钮静音/恢复。3) **右下 Sound 始终可见**（未专注略淡）。4) **Sit 开计时** → 点 Sound 展开选曲 + 音量。5) **Rise → 音乐须自动停**；面板收起、Sound 仍可见。6) 再 Sit → 若未永久静音过，音乐可再开。 | **2026-07-20**…**2026-07-21 晚** OK。**2026-07-25**：改自动停播口径，**须复测**第 5–6 步。 | `?product=1` | 2026-07-25 |
| 人工 · Re-focus 真实切页 >60s | UI可见 | 已通过 | 1) **`/?sessionMinutes=5`**。2) **Here & Now** 开表 → 切走 **70–90s** → **须有**观察式文案 + nod-bow。3) **对照 Flow State**（或 Offline）：同样切走 &gt;60s → **须无** Re-focus（无文案、无 nod-bow；timer 可继续）。约 10s 回来无反应属正确。 | 2026-07-21：用户书面 Here&Now/Sit 路径 **测试 OK**；Flow「貌似不对、不匹配」→ 产品预期即与 Here & Now **不同**：Flow **故意无**文案+nod-bow。**同日晚**：用户确认原 8 条独立行批次全部关闭。 | `/?sessionMinutes=5` · 场景 B / F | 2026-07-21 |
| 人工 · Celebrating / 同日 SessionComplete 观感 | UI可见 | 已通过 | 1) 实验室「重置全部本地状态」。2) 可先 Honesty 或不做。3) Sit→Companion→等 DEMO **满 1 分钟自动达标**（也可达标后再点 Rise）→ 须见 **Celebrating 舞**。4) 同日再达标 → 只摆尾。 | 2026-07-21：用户书面——这几天很多次 focus 超过一分钟，从未见过 Celebrating 舞；已修。**2026-07-21 复测**：`/` 满 1 分钟见舞；`/?sessionMinutes=5` 满 5 分钟见舞；同日第二次 1 分钟达标 → 只撅屁股摆尾、不再 Celebrating；测试 OK。**同日晚**：`/?product=1` 再次确认第 4 步（同日第二次满 1 分钟 → 摆尾非跳舞）；用户确认原 8 条独立行批次全部关闭。 | `/` · `/?product=1` · `/?sessionMinutes=5` | 2026-07-21 |
| 人工 · Honesty 桥接后完整 Arrival UI | UI可见 | 已通过 | 1) 重置本地状态 → DORMANT。2) 走 Honesty 选 20 → 呼吸结束。3) 桥接点 **Yes** → 须走完整 Arrival（Welcome→Notice→Breath→Choose）再 Companion，**不**直接开表。4) 另测 **No** → idle、无二次挽留。 | 2026-07-20 晚：用户书面「测试 OK」。 | `?product=1` · 或实验室 Honesty | 2026-07-20 |
| DEV 一键重置全部本地状态 | 纯后端 | 仅单元测试覆盖 | **L-logic**（勿人工逐 key）：`npm run test:smoke` → `localStateKeys.test.js` 锁白名单=各模块 STORAGE_KEY、脏态 clear 后 Store 等同新用户、session toast/boot-idle 一次性。按钮壳：`e2e/product-shell.smoke.spec.js`（实验室可见；`?product=1` 不可见）。 | 2026-07-20：重置后 Honesty=场景 A 正确开局。**2026-07-21**：用户书面——人工难验「参数是否复原」→ 应 L-logic；已改仅单元测试。 | `src/core/localStateKeys.test.js` · `#dev-reset-all-local-state` | 2026-07-21 |
| 产品壳链接 ?product=1（隐藏调试面板） | UI可见 | 待人工测试 | 打开 `/?product=1`：无右上角情绪调试条；Sit / How shall we sit? / Honesty / Arrival / Sound 仍可用。打开 `/`：调试面板在。 | — | `http://127.0.0.1:5173/?product=1` vs `/` | 2026-07-19 |
| 人工 · "Or begin from here." hint 侧面显示 | UI可见 | 已通过 | 1) `?product=1` 重置本地状态进入 Idle。2) 确认「Or begin from here.」onboarding hint 气泡从 **Sit 按钮右侧**弹出（不再从上方遮住 Sit 按钮）。3) 回流：Rise 后再看 idle chrome，hint 若再次显示仍应在侧面。 | 2026-07-21：用户书面——挡住 Sit，应改到侧面。**2026-07-22**：用户书面 A 类，**测试 OK**。 | `?product=1` · `.session-start-dock__hint` | 2026-07-22 |
| 窄屏 · 自动 onboarding 互斥（≤1 条） | UI可见 | 待人工测试 | **主路径（375×667）**：实验室清空引导已读 → `/?product=1`。冷启动同一时刻自动气泡 **≤1**（优先 `help-affordance`，关掉后串行 Sit / How shall we sit? 等）。**回流**：点气泡关掉 → 下一条出现；点 **?** 仍同时见本页全部补救 hints + 用途简介卡。**横屏 667×375**：自动仍 ≤1、不退化。**桌面 ≥900**：互斥同样生效；尖角对准 ?。 | 2026-07-21：用户同意 Task 1；截图去掉叠加后观感可。**单元**：`selectExclusiveAutoHintIds`（互斥 id 列表；**非**窄屏 DOM 叠放）。 | `?product=1` · DevTools 375×667 | 2026-07-21 |
| 窄屏 · Sit with Yin 主 CTA 不截断 | UI可见 | 待人工测试 | **主路径（375×667）**：`#btn-focus` 须完整显示 **Sit with Yin**（禁止「Sit w…」）；可点进 Arrival。切中文后「与阿寅同坐」亦完整。**回流**：Rise → 再 Idle 仍完整。**横屏**：不退化。 | 2026-07-21：Task 1；dock 加宽 + white-space normal。 | `?product=1` · `#btn-focus` | 2026-07-21 |
| Hints · 背景音乐 opt-in 提示锚右上 mute（非右下 Sound） | UI可见 | 待人工测试 | **主路径**：`?product=1` 重置 hints → Idle 或开计时后见 `ambient-soundscape` 文案（EN「Music stays off until you tap…」/ ZH「音乐默认关闭…」）→ 气泡**尖角须指右上音符钮** `.ambient-soundscape__mute`，**不得**指右下 Sound。**回流**：点「?」补救同页两条：music→右上 mute；gated→右下 Sound（Idle 未专注时点 Sound 才见 gated 句）。 | **2026-07-22**：用户书面——旧「Music is on…」Hint 错指右下 Sound。**2026-07-25**：文案改为 opt-in；锚点仍 mute。 | `?product=1` · `.ambient-soundscape__mute` · `.ambient-soundscape__fab` | 2026-07-25 |
| Hints · Registry SSOT + md 锚点块 + anchorGroup | 仅单元测试覆盖 | 仅单元测试覆盖 | `npm run test:smoke` → `onboardingHintRegistry.test.js`（1:1 派生、locale、anchorGroup 内 selector 互异）；`npm run hints:doc-check`（`test:smoke` 末尾 + CI 独立 required check）；改 registry 后须 `npm run hints:doc-sync`。 | **2026-07-22**：用户批准 Registry 方案 A；ambient 组；删硬编码 `.fab`/`.mute` 单测。 | `onboardingHintRegistry.js` · `scripts/hints-doc-check.js` | 2026-07-22 |
| 人工 · Sound gated 提示文案（非专注时点 Sound） | UI可见 | 已通过 | 1) `?product=1`，**不**点 Sit（未专注）。2) 点右下角 **Sound 按钮**，须出现提示：**「Track selection opens once you sit.」**（不再说「Sound opens after sitting begins.」）。3) 回流：Sit 开计时 → 点 Sound 须正常打开面板，无提示。 | 2026-07-21：用户书面——旧句失实；已改 HINT_AMBIENT_GATED。**2026-07-22**：用户书面 A 类，**测试 OK**。 | `?product=1` · `.ambient-soundscape__fab`（未专注） | 2026-07-22 |
| Honesty Check-in 小钮（零完成起常驻） | UI可见 | 已通过 | **主路径**：实验室「重置全部本地状态」→ `?product=1` → Idle 即见 **Honesty Check-in** 立体小钮（Sit 上方），**无需**先完成计时。**勿**再自动弹出旧版长句卡片（`HONESTY_CHECKIN_PROMPT`）。点钮 → 时长三选一 → 呼吸。**回流**：计时达标 / Rise 后再 Idle 小钮仍在。 | 2026-07-21 晚：零完成即 Honesty 场景；取消旧浮动长句卡片、小钮常驻。**同日晚**：Offline Space 说明改桌面口径。**2026-07-21 晚**：用户书面——重置本地状态 → `?product=1` 开局即见小钮、不再弹长句卡片，**测试 OK**。 | `?product=1` · `#honesty-idle-entry` | 2026-07-21 |
| Companion · Offline Space 说明文案（桌面优先） | UI可见 | 待人工测试 | How Shall We Sit? → **Offline Space** 说明须表达：**别处练习 + 此页继续计时 + 离开不算分心**；**禁止**「Lock your phone」等纯手机表述。 | 2026-07-21 晚：用户书面——电脑版且 lock phone 语义不对。 | `?product=1` · `.session-start-dock__option` Offline | 2026-07-21 |
| Sit with Yin 主按钮尺寸（恢复紧凑 pill） | UI可见 | 已通过 | **主路径**：`#btn-focus` 应为**内容宽度**紧凑 pill（约 `13×36` padding），**不要**拉满 dock 整行宽。**回流**：Rise 后再 Idle 尺寸仍对。**窄屏 375px**：文案完整可读即可。 | 2026-07-21：Task1 全宽变丑已修。**2026-07-21 晚**：用户复测 OK。 | `?product=1` · `#btn-focus` | 2026-07-21 |
| Companion · Offline 禁止二次 Sit | UI可见 | 待人工测试 | **主路径**：How shall we sit? → **Offline** → **立刻 Focusing、无 Arrival**（与上行「跳过 Arrival」一致）。若经 Sit 先进 Arrival，点选 Offline 仍立刻开表、**禁止**再点 Sit。**对照**：Here & Now / Flow 门闩未就绪仍走 Arrival。 | **2026-07-21**：Offline 禁止二次 Sit。**2026-07-25**：与「Offline 跳过 Arrival」对齐——hint 直选 offline 不再进 Notice；勿与 L180 互斥。 | `?product=1` · e2e K | 2026-07-25 |
| 3D Idle GLB 换装（无红边单色灰棉麻） | UI可见 | 待人工测试 | 1) `npm run dev` 打开应用。2) 调试面板点 **T-Pose**（或临时让 PoseManager 显示 canvas）以露出 3D 垫底。3) 确认阿寅闭目坐禅袍为**单色暖浅灰棉麻 / 茶服风**，**无深红镶边/红里子**；棉麻织纹应清晰（勿呈糊成一团的过度压缩感）。4) 刷新后默认 2D 主线仍隐藏 3D；路径仍为 `/models/tiger-meditate-closed.glb`（约 **1.6MB**，非 292KB）。 | — | `http://127.0.0.1:5173/` · `#emotion-debug-ui` T-Pose · 源：`yin-meditate-closed-monochrome-grey-cotton-linen-robe.source.glb` | 2026-07-19 |

---

## 明确未纳入本表（尚未实现，勿当已交付）

- 「本周陪伴」热力图 hover 详情 / tooltip / 点击下钻（当前纯展示）
- Focus Confidence V1（可信度分值 / idle 检测完整链路）
- 鼻子 Boop / 拉尾巴 / 抚摸分阶段递进
- 无互动约 10 分钟自主 `welcomeBack` 挥手
- IncenseComplete / MilestoneGlow 的业务触发（非调试）
- SessionComplete 非模态观察式文案
- 角色/装扮可选 UI
- RewardToast / Screenshot（空桩）

---

## 给 Cursor 的 Prompt（分两部分：先回溯盘点，再建立日常维护习惯）

### Part 1：首次回溯盘点（现在就执行一次）

```
请对 focus-tiger 项目当前已实现的所有功能做一次完整回溯盘点，逐项填入
TEST_TRACKER.md 的表格，不要遗漏，也不要用示例/占位数据代替——每一行
必须对应一个真实存在的功能。

盘点范围包括但不限于：Arrival Practice（欢迎/Notice/呼吸/Choose 各环节）、
Companion Mode 三选一、Honesty Check-in、Reflection Moment、Celebrating、
Recover / Re-focus Acknowledge、Ambient Soundscape、EyeTracking、
PointerInteraction 各交互、以及所有已入库但可能只有调试入口的 emotion key。

每一行请如实判断：
- 「类型」：这项改动用户能不能在界面上看到/感受到差异，还是纯粹是数据
  存储、状态判断等无 UI 表现的逻辑。
- 「状态」：如果只有单元测试覆盖过、用户从未亲自验证过视觉效果，一律
  标"待人工测试"，不要因为单元测试通过就标"已通过"——这两者不是
  一回事。
- 「测试步骤」：写到用户不需要问你就能照着操作的程度（点哪个按钮、
  大概等多久、应该看到什么）。**只写怎么测，不写用户意见。**
- 「用户反馈」：仅安置用户书面测试意见（日期 + 原话要点）；无则填 `—`。
  **禁止**与「测试步骤」混写。
- 「本地访问路径」：dev server 的具体入口，如果需要特定前置条件才能
  触发（比如离开页面 60 秒、连续多天累计），请写清楚前置条件。

完成后回复一句总的盘点结论（一共多少项、其中多少项待人工测试、多少项
  仅后端），不需要长篇解释。
```

### Part 2：日常维护（此后每次任务都遵循）

```
从现在起，每次完成一项包含用户可见变化（UI、动画、文案、交互）的任务后：
1. 在 TEST_TRACKER.md 新增一行，状态填"待人工测试"，写清楚具体测试
   步骤和本地访问路径，「最后更新日期」填当天日期。
2. 纯后端/逻辑改动登记为"仅单元测试覆盖"，不需要用户测试，但仍要登记。
3. 完成任务的消息里，明确说明"本次有 N 项需要你测试，已更新
   TEST_TRACKER.md"，不要只说"已完成"就结束。
4. 不要把"单元测试通过"等同于"功能没问题"并汇报为完全完成——涉及
   视觉/体验效果的项目，在用户确认之前，状态就是"待人工测试"，不能
   写"已完成"或"已验收"。
5. 如果用户测试后反馈问题，把对应行状态改成"有问题"，并只在「用户反馈」
   列写入日期 + 原话要点（可附处理中/待复测）；**禁止**写进「测试步骤」。
   处理完成后再改回"待人工测试"等待用户复测，不要自行改成"已通过"。
6. 从 2026-07-19 起：凡用户书面反馈某功能相关界面/操作的测试意见，
   即使本回合未立刻开修，也必须记入对应行的「用户反馈」列；见文首
   「用户测试反馈记入规则」。
```
