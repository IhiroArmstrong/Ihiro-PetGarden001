# SCENARIO_TESTS.md — 用户场景操作故事测试脚本

创建日期：2026-07-19  
最近代码核对：2026-09-01（**E′ 规则预筛进 AE L2** sit next / 软边界 / 窄 OTHER · **1C lab 本旁支** · 场景 **AL** Reflection Companion validation；**Gate 0.2 #472 关单**；AG Slice 0 含 `total sitting time` → `practice_facts`；What Yin remembers 开着面板 Remember 须刷新；抽取规则见 `YIN_PERSONAL_MEMORY.md` §8；AG 1e Forget 须先有抽取条目）。**叠层占用三问** `OVERLAY_SOURCE_CONTRACTS` → `deriveIdleYinTapOverlayBusy` / `deriveSceneAnimOverlayBusy`（Confide / Privacy / Idle 玻璃卡 / Support 进睡）；**AE** Confide 打开睡态唤醒 · #491；**AF** Presence Signals（Slice 0–1 / 2 / 3）· **AG** Yin Personal Memory（Slice 0–1e）· **AH** Overlay slot 首卡队列（PR2）· **AI** 练习备份恢复对齐热力图/提醒 · **AJ** Stay in touch · **AK** Focusing Float Yin PiP 探针（#438）；**AD** 仍有效。Presence freeText 90 天剥离与 Reflection 对齐（#440 · 单源 `freeTextRetentionCutoffMs`）。Newsletter Resend（#444）**待合**——AJ 步骤标待核对。AB 托盘 + SB-18；长周期 QA `?qaSeedStreak=` 与莲花池 `?qaLotusBlooms=` **分 key**。AA Idle PiP 仍实验。**R** 仍建议。逐功能仍以 `TEST_TRACKER` 为准）

**权威路径**：`focus-tiger/docs/SCENARIO_TESTS.md`  
仓库根目录 `SCENARIO_TESTS.md` 仅为指针；旧稿 `有待核对-SCENARIO_TESTS720.md` 已归档，勿再改。

定位：这份文档和 `focus-tiger/docs/TEST_TRACKER.md` 不是替代关系，是两个层级——TEST_TRACKER 是「每个功能点单独测试」的清单，本文档是「把功能点串成一次真实使用故事」的剧本。很多 bug 只有在功能连起来走的时候才会暴露。建议两份一起用：走完一个场景故事后，回头把涉及到的功能点在 TEST_TRACKER 里勾掉。

**功能 vs 测试覆盖缺口审计（2026-07-30）**：模块级对照、三条「绿」口径、永不自动化清单、**unit\*→smoke 分类（§7）**、Honesty/i18n 发布口径（§8–§9）→ [`COVERAGE_GAP_AUDIT.md`](./COVERAGE_GAP_AUDIT.md)（与 `TEST_TRACKER` §C 互补；改覆盖结论先改审计文档）。

**自动化冒烟（2026-07-20 起；2026-08-09 索引补 Q–W；晚间补 X–Z 单测指针）**：
- **单元 / 控制器集成**（无浏览器）：`src/core/scenario-smoke.test.js` 等（`npm run test:smoke`）— A–D 门闩与控制器接线 + **E/F** Offline 舒展暂停 / AcrossTools idle + **I/J** hint 纯函数；含 `MindfulReminderController` / `AcrossToolsIdleGuard` 专测；**不是**完整用户故事。Q/S/T/U/V/W/X/Y/Z 另有各模块单测（见各场景标题），**不全**并入 scenario-smoke。
- **浏览器 DOM 用户链路**（`npm run test:e2e`；本地硬顶单 spec，见 `e2e-local-budget`）：
  - `e2e/product-shell.smoke.spec.js` — 产品壳 Sit / 无调试条；实验室重置钮可见
  - `e2e/scenario-a.companion.spec.js` — **I** hint→三选一面板；**I2** 预选→开 Arrival；**A** Arrival 后 Here & Now 开表；**A2/A3** 预选+⚡ 开表；**K** Offline 选中即开表
  - `e2e/reflection-intention-echo.spec.js` — Choose→Rise→Reflection 顶部回显有/无（主路径 DOM；**非**二次 beginFocus 抹闩 Bug）
  - `e2e/weekly-practice-heatmap.spec.js` — Idle 7 格可见 / Focusing 隐藏 / localStorage seed 亮暗
  - `e2e/in-app-reminder.spec.js` — 时钟入口面板（含每日说明）+ 设时→回前台→横幅→关闭不重复 + Focusing 隐藏（suppress）+ 已过/已练软提示
  - `e2e/micro-ritual.spec.js` — **S** Breath / 微仪式主路径 / Leave 不记账 / 桥接叠层隐藏入口
  - `e2e/honesty-bridge-real-path.spec.js` — **真实** Honesty 补登→桥接 Yes→Arrival / No→Idle（`?honestyBreathMs=`；**非**注入）
  - `e2e/flower-welcome.spec.js` — **V** Day1 / 同日不重播 / `?flowerWelcome=0` / 欢迎日旗
  - `e2e/onboarding-remedy-contract.spec.js` — **W** Privacy 交叉引用 + Idle 不自动出免责卡 + `?` 仍见免责 + `?wellnessFirst=1` QA 卡 + Focusing/? 主条契约（不全覆盖 W 观感）
  - 另：`wide-idle-more-menu` 等含 **U** Zen Cinema / Quiet Line 行开卡（非整故事）；Compass / Journey 行开卡见 orchestration 单测，**非**完整 X–Z 故事
  - `desktopCompanionL1.test.js` / `desktopCompanionL2Route.test.js` + `confideClassify` / `confideReplyFlow` — **AE** Electron Confide 壳 / 生成路由 / **DORMANT 开 Confide → dormantWake 契约**（**非** Web Safari `?product=1` · **非** CapCut 观感 DOM）
  - `spriteChannelArbitration.test.js` + `dormantIdle` overlayBusy — **AD** 睡/欢迎/付款仲裁门闩（**非**完整用户链路 e2e）
  - `presenceSignalsGate` · `confidePresenceFacts` · `presenceSignalsDisclosureGate` · `ritualPresenceBridge` · `reflectionPresenceBridge` — **AF** Presence Signals 入账 / 披露 / Ritual Leave / Reflection 双写（**非**完整用户链路 e2e）
  - `freeTextRetentionCutoffMs`（`presenceSignalsGate.test.js`）— **AF Slice 3 / #440** Reflection bundle 与 presence freeText **同一 90 天 cutoff**（**无 UI**）
  - `overlaySlotArbitration.test.js` + `sessionChromeSync.test.js` — **AH** 首卡队列 / postSession suppress / C1–C3 busy（**非**完整 Compass 故事 e2e）
  - `practiceBackupDailyCompletionReconcile.test.js` · `practiceBackupSync.test.js` — **AI** 恢复后从 `practice-days` 派生 `daily-completions`（**非**完整备份 UI e2e）
  - `immersivePresenceSupport.test.js` — **AK** Electron PiP 探针红/绿（**非**真 PiP DOM e2e）
  - `confidePracticeFacts` · `yinPersonalMemory*` · `desktopCompanionL2Route` — **AG** 练习事实 / Consent / Remember / 注入 / 口头 Forget（**非**完整 Confide 故事 e2e）
- **二者全绿 ≠ 序列观感通过**（Idle 不闪、Stripe 真付、吹花 CapCut、Tiger Anchor 观感、Presence 披露时长、Electron memory 面板等仍人工；见 `DEV_WORKFLOW_QUALITY.md` §6.1 覆盖分层）
各场景标题下须写清覆盖**层**（单元 / 控制器集成 / DOM 用户链路）与**测到哪一步**；禁止只写「已自动化」而不写范围。

**重要提示**：部分步骤对应的功能仍在「已知未完成」状态（本文档已逐条标注）。走到这些步骤时看到「没反应」或「和预期不符」，不代表新 bug，是已知缺口，不要重复报告。

**点击后 0–1 秒（强制 · 2026-08-14）**：含可点击步骤的**新场景 / 改写场景**必须写清「点击后 0–1 秒内用户应该看到什么？」。若该步按设计不生效，须点名 [`SILENT_BEHAVIORS.md`](./SILENT_BEHAVIORS.md) 的 `SB-xx`，禁止只写「无反应」。原则全文 [`INTERACTION_FEEDBACK_PRINCIPLES.md`](./INTERACTION_FEEDBACK_PRINCIPLES.md)（`RULES_INDEX` → `interaction-feedback`）。

**功能冲突扫描（强制 · 2026-08-16）**：新功能/改动**实现前**须对照本文已上线场景做冲突扫描。全文 [`FEATURE_CONFLICT_REVIEW.md`](./FEATURE_CONFLICT_REVIEW.md)（`RULES_INDEX` → `feature-conflict-review`）。本文是对照剧本，不是扫描条款 SSOT。

**存量补句优先级（禁止「随改写再补」）**：已挂钩白名单的是 **B / P / X / Y**。其余正式场景按下表排期补 0–1 秒句（权威跟踪：`TEST_TRACKER`「存量场景 0–1s 补句」行）。**不得**等下次碰巧改到该场景才写。

| 优先 | 场景 | 为何先写 | 0–1 秒句现状 |
|---|---|---|---|
| **P0** | **AD** 精灵占用仲裁（睡/欢迎/Stripe 回跳） | 冷启动误睡 / 付完先睡着 = 场景 B/Q 同类高容忍 bug | 本 follow-up 已升格正式场景 |
| **P0** | **Q** Support Yin 三卡 / Checkout | 付费点击；用户对「点了没反应」容忍最低 | 本 follow-up 已补主路径句 + Stripe 回跳对照 AD |
| **P0** | **U** Zen Cinema / Quiet Line / Wallpapers | 外链与下载有延迟，最容易被当成没点到 | 本 follow-up 已补主路径句 |
| **P0** | **AB** Electron 托盘收起 vs 切 App | 收进托盘误触发 Re-focus = 场景 B 同类坑 | 契约已写；**实现后**测；**SB-18** |
| **P1** | **D** Honesty 入口 / 时长 / 桥接 Yes/No | 从睡眠态唤回，五条里最易困惑 | 本批已补 0–1s 句 |
| **P1** | **Z** Journey log 开卡 | 次优先（insight-spark 可顺手核对） | 0–1s 句已写，**#291 补运行时按压**（菜单行 / Compass 芯片 / 关钮 / 备份链 `:active`）。**核对**：#292 已合 insight-spark；Daily Card 仍是 Brief 未接线 |
| **P1** | **AE** Confide Web harness / Electron L1·L2 | 倾诉入口 + 危机安全阀；Electron 关单「能聊」**2026-08-25 已关**（L2 TRACKER） | 本 follow-up 已升格正式场景 |
| **P1** | **AF** Presence Signals（Notice / Ritual / Reflection） | 首次披露 + 静默 Leave 记账；与 AE Confide 趋势耦合 | 本 follow-up 已升格；Notice 点选 0–1s 句待人工列检 |
| **P1** | **AG** Yin Personal Memory（Electron L2 延伸） | Consent / Remember / Forget；与 AE 同入口 | 本 follow-up 已升格；面板 Forget 已写 0–1s |
| **P1** | **AH** Overlay slot 首卡队列 | 吹花 vs Compass 叠层 = 高容忍 bug 类 | 本 follow-up 已升格；首卡出现 0–1s 待人工 |
| **P1** | **AC** 寅币抽屉 | 与 Q 付费入口隔离；次级可忽略 | L3 本支已写 0–1s 句 |
| **P1** | **S** Breath Leave / chip；**T** Focus chip / Leave；**W**「?」/ Privacy | 选中即生效，哑点击风险较低 | 未补句 · 改写时自然覆盖 |
| **P2** | **A / C / E / F / I / J / K** Sit·Companion·Rise | 主路径已有展开/开表/鞠躬，哑点击风险较低 | 部分步骤已写立刻发生什么；未逐钮写 0–1s |
| **P2** | **G** 语言；**O** 热力图（多为展示）；**V** 吹花（自动 + 点消气泡） | 点击面小或非按钮主路径 | 未补句 |
| **—** | **H** 瞳孔跟随 | 已废弃，不排 | — |
| **—** | **R** 跨日回访 | 仍建议故事，非点击反馈主战场 | — |

---

## 用哪个链接测？

当前 `npm run dev` 默认页是 **研发实验室**，不是干净产品壳：

| 链接 | 用途 |
|---|---|
| [http://localhost:5173/](http://localhost:5173/) | **实验室**：右上角情绪调试面板常驻；DEV 下有 `window.__*` |
| [http://localhost:5173/?product=1](http://localhost:5173/?product=1) | **产品壳预览**：隐藏 `#emotion-debug-ui`，更接近真实用户界面；适合走场景 A–H / I–P / **Q–W** / **X–Z** / **AA–AL** / **AF–AJ** |
| [http://localhost:5173/?product=1&entitlementMock=subscription](http://localhost:5173/?product=1&entitlementMock=subscription) | **Presence Slice 2 QA**：Morning Ritual chip / Leave 回顾（见 **场景 AF · Slice 2**） |
| [http://localhost:5173/?product=1&sessionMinutes=1&qaSeedStreak=6](http://localhost:5173/?product=1&sessionMinutes=1&qaSeedStreak=6) | **长周期 QA**：播种昨天往前 6 个练习日；Sit 满 1 分钟可测 MilestoneGlow（不必真等 7 天） |
| [http://localhost:5173/?product=1&confide=1](http://localhost:5173/?product=1&confide=1) | **Confide QA harness**（产品挂载仍关）：Idle ⋯/抽屉见 Confide 行；**仍检索不生成**；见 **场景 AE · Web** |
| Electron `desktop:dev` | **场景 AB**（托盘）、**AE · Electron**（Confide L1/L2）、**AG**（Yin Memory）、**AK**（Float Yin PiP 探针）、**AL**（Reflection Companion lab）；Web Safari **测不了** llama / 托盘 / memory 文件 |

演示会话时长：`DEMO_SESSION_MINUTES = 1`（约 1 分钟达标，便于故事测完）。  
语言切换：宽屏 ⋯ / 窄屏抽屉 → **Language**（v1.0 对外 **English + Japanese**）；DEV 仍可用 `__i18n.setLocale('zh')` / `'en'`（`?product=1` 下同一 bundle）。

---

## 场景 A：Kelly 的第一个早晨（全新用户，当日零完成 → Idle）

> **单元 / 控制器集成**：A1 `HonestyCheckInController` 开局 Idle；A3–A4 `ArrivalPractice` 状态机步进 + `canBeginFocusOnCompanionModeSelect` 门闩；A7–A8 `triggerSessionCompletionFeedback` 分流；计时达标 `FocusSession.hasReachedTarget` → `scenario-smoke.test.js`。  
> **DOM 用户链路**：Arrival 后 Here & Now 开表 / 预选+Skip — begin 开表 / Offline 开表 → `e2e/scenario-a.companion.spec.js`（**到开表为止**；**不含**达标 / Celebrating / Reflection）。  
> **仍须人工**：Idle 开场观感、Honesty 文案、背景音乐 opt-in 与开关按钮、Arrival 气泡时长、Ambient、Idle 呼吸观感、Celebrating 动画本身。

1. 打开 App（建议 `?product=1`）。当日零完成时，阿寅应是 **Idle 闭目坐禅**，**不是** sleeping。  
   *[单元/控制器：零完成 → `HonestyCheckInController.onAppReady` 保持 IDLE + 调 `showIdleEntry` → smoke A1；**非** Idle 序列 DOM / 闭目观感]*
2. Idle 时见 **Honesty Check-in** 小钮（Sit 上方；点它可补登别处完成的练习）。Kelly 也可直接点 **Sit with Yin** 开始本场计时。
3. 打开产品后**不应自动有音乐**；右上音符钮（窄屏 Idle = ActionBar ♪）打开 **Soundscape 面板**选曲（与菜单 / 抽屉 Sound 同效；默认曲目 Mer-Ka-Ba；若浏览器拦播放，在面板内再点选解锁）。关音乐选 **Off**；不必先 Sit。
4. Arrival Practice 展开：
   a. 欢迎 beat（~2 秒气泡，`ARRIVAL_WELCOME`）
   b. Notice：六个状态图标；点 "Okay" → 观察式回应（实际文案以 locale 为准，例如 en：「An ordinary steadiness is here.」）
   c. 呼吸 beat（~5 秒，无倒计时）
   d. Choose：六个活动图标；点 "Deep Work" → intention 确认  
   *[单元：`ArrivalPractice` Notice→Choose→READY 状态机 + `canBeginFocus…` 门闩真/假 → smoke A3–A4；**非** Arrival 气泡/图标 DOM。开表 DOM → e2e A/A2/A3]*
5. Companion Mode 三选一展开。产品文案为 **Here & Now / Offline Space / Flow State**。  
   点 **How shall we sit?** 后 **0–1 秒内**见三卡标题 + 卡下 hint（locale `COMPANION_MODE_*_HINT`：结缘/静舍一句话，不是功能说明书）。  
   - **Sit→Choose 走完**：鞠躬后**展开 Companion**；点任一模式 → **立刻** Focusing（不必再点 Sit）。宽屏三卡下方 **不得**再露 Breath/Quick 左球（`ft-wide-stage-companion`）。  
   - **375 窄屏**：鞠躬后三选一须 **在视口内**（`ft-narrow-stage-companion`）；**禁止**只剩 home 三球、panel 屏外假绿。e2e：`375 Choose bow: Companion staged in viewport then Here & Now focuses`（`toBeInViewport`）。  
   - **门闩已就绪**后点选任一模式 → **立刻** Focusing。  
   - **门闩未就绪**：点 **Here & Now / Flow** → **启动 Arrival**（Notice「What is present…」属设计，e2e I2）。点 **Offline Space** → **跳过 Arrival 即开表**（e2e K）。  
   - 预选 Here & Now / Flow 再走完 Arrival / ⚡ → 可直接开表（不必再点选）。
6. 计时开始后，可用「曲目」切换背景音；主按钮仍可一键开关。**Rise / 达标结束 → 音乐自动停**；再 Sit **也不**自动再开，须再点音符 / Sound。
7. 全程观察 Idle：**仅**闭目 pingpong → 眨眼弧固定节奏。  
   **张望 gaze / yawn / tea / ear-wiggle 不在正式 Idle 编排中**。  
   **靠近区不应自动播点头**。  
   *[概率/观感：不纳入冒烟]*
8. 达到目标时长 → **当日首次计时达标**：Celebrating → 回落坐姿。  
   **勿提前点 Rise**；Honesty 补登**不**占庆祝戳。  
   **深夜亦同**：Reflect 开着时阿寅须保持醒着同坐（庆祝 / 轻完成 / 回落坐姿），**不得** `cloakSleep` / Sleeping。夜深休息只在 **Idle 无叠层**（Expand A）或 ≥2h 回前台 DORMANT。  
   *[单元：`triggerSessionCompletionFeedback` + celebrated 戳 → smoke A7–A8；深夜不披毯 → `companionRestPolicy`「session end into Reflection never cloaks」；**非** Celebrating 动画 DOM]*
9. **同日第二次计时达标**：应播 **SessionComplete**（摆尾），**不应**再播完整 Celebrating。  
   *[单元：同 smoke A7–A8 第二次调用返回 `sessionComplete`；**非**摆尾序列观感]*
10. **已知缺口**：IncenseGreeting（莲花+金粒子）**业务会话结束尚未自动接线**。
11. 进入 Reflection Moment：开头回显本次 Choose，三问可独立跳过。  
    *[DOM 用户链路（有/无回显）→ 场景 C / `reflection-intention-echo.spec.js`；本场景 e2e A **未**跑到 Reflection]*
12. 回到 Idle；今日 Honesty 提示不应再因零完成自动出现。  
    *[单元/控制器：smoke A1 在 `recordCompletion` 后断言仍 IDLE；**未**断言旧版零完成长句 prompt 的 DOM 消失（该 UI 已改为常驻小钮）]*

### 验收脚本 · 30 秒 / 3 分钟（2026-08-20 · 端到端清单）

> **不是新功能**：把专家稿当 QA 清单，顺带验 **场景 AD** 占用仲裁是否撑住 Kelly 第一眼与 3 分钟闭环。语感三句先按现稿；若改字只动 locale `COMPANION_MODE_*_HINT`，不必重开门闩。

**30 秒（第一眼）**：实验室「重置全部本地状态」→ `?product=1` 硬刷新 → 无隐私弹窗、无自动音乐、无 auto tip（**SB-15**）；阿寅 **Idle 闭目坐禅**（非披毯）；轻点额头 → **0–1s** `earWiggleHeadTouch`（场景 X2）；点 **How shall we sit?** → **0–1s** 三卡 + hint（不得出现 distraction / 分心 / Keep this screen / Minimize）。

**3 分钟闭环**：同一壳加 `?sessionMinutes=1`（**不要**用默认 10 分档硬等）→ Sit 或 ⚡ → Here & Now 等到 1 分钟达标 → **自然进 Reflection**，阿寅保持醒着同坐（**不得**深夜披毯打断，见 **场景 AD**）；Skip/Continue 后左下热力图当日格点亮；⋯ **Journey log** 见新行。**回流**：关 Reflection 后再点额头仍摸头；再开一场 1 分钟仍进 Reflection 不披毯。

**更快对照（非关单主路径）**：左球 Breath **1 分** 完成 → Reflection → Journey（`arrive: false`）。

---

## 场景 B：分心后自己走神又回来（Recover / Re-focus Acknowledge）

> **单元 / 控制器集成**：`shouldSuppressAwayReminders` 模式门闩 + `MindfulReminderController.handleAttentionReturn` 在 Here & Now 触发 emotion / Offline·Flow 抑制 → smoke B。  
> **未覆盖**：真实切标签页、toast DOM、nod-bow 序列。  
> **人工验收（用户路径，勿用控制台）**：真实切标签页 + toast + nod-bow。  
> **对照**：用户**主动** Recover（Focusing 轻触阿寅）见 **场景 X**（Tiger Anchor）；勿与本被动 Re-focus 混验额度。

### 频率门槛（先记住，否则会以为「坏了」）

| 离开时长 | 回来时应看到 |
|---|---|
| **&lt; 20s** | **无反应**（连内部记账都不做）——你测的约 10s 属于此档，**正确**（**SB-01**） |
| 20–60s | 只内部记账，**仍无**文案 / nod-bow（**SB-02**） |
| **&gt; 60s** | 才展示：观察式 toast + `nod-bow`（Re-focus） |

### 为何默认 `http://localhost:5173/` 测不了真实切页 Re-focus

默认 `DEMO_SESSION_MINUTES = 1`：计时用**墙钟**（切走也在走）。离开 **&gt;60s** 再回来时，会话往往已达标 → 先播 **SessionComplete 摆尾 / Celebrating**，**不是** Re-focus。这不是 bug，是演示时长与 Re-focus 门槛冲突。

### 用户测试步骤（推荐）

1. 打开：**`http://localhost:5173/?sessionMinutes=5`**（可选再加 `&product=1` 藏调试条）。  
   → 本场目标 **5 分钟**，离开 70s 后仍应在 FOCUSING。
2. Arrival → Companion 选 **Here & Now**（或 Skip — begin 开表）。
3. 确认 HUD 在计时、按钮为 **Rise**。
4. 切到 **其它 Safari 标签**，停留约 **70–90 秒**（必须 **&gt;60s**；不要只留 10s）。
5. 切回 Focus Tiger：应见 **非模态观察式文案** + **`nod-bow` 点头鞠躬**（不是摆尾）。
6. **对照（勿期望与 Here & Now 相同）**：再开一场选 **Flow State**（或 Offline Space）→ 同样离开 &gt;60s 再回来 → **不应**出现观察式文案 / nod-bow（`suppressAwayReminders`；离开是预期；**SB-03**）。若「没反应」= **测对了**；若仍出现 nod-bow = bug。
7. 额度：Re-focus 占共享日提醒池（每日最多 3 次三类合计）；每场会话最多 1 次。
8. **对照（Electron 桌面 · 场景 AB）**：把窗口**收到托盘**停留 >60s 再打开 → **不应**出现本场景的 toast / nod-bow（**SB-18**）。那是壳生命周期，不是切走标签。浏览器里测本场景时忽略本步。

*[单元/控制器：Stay 触发 / Offline·Flow 抑制 → smoke B；**非**真实 visibility 切页]*

---

## 场景 C：中途主动放弃（未达标）

> **单元 / 控制器集成**：未达标不记账（`HonestyCheckInController.onIncompleteSessionEnded`）+ `MANUAL_END_PAUSE_MS` 后 `SessionEndFlow.onSessionEnded` 向 mock `ReflectionMoment.open` 传入 `intention` / `intentionSource` → smoke C（**仅**下游接线入参；**不**从 Choose 写入意图闩）。  
> **DOM 用户链路**：Choose → Rise → Reflection 顶部 `[data-testid=reflection-intention-echo]` 有/无回显；Skip — begin → Rise → 无回显 → e2e `reflection-intention-echo.spec.js`（**非**「二次 beginFocus 抹空」Bug 回归锁）。  
> **单元（Bug 回归锁）**：二次 beginFocus + 空 pending 不抹闩 → `SessionIntentionStore.test.js` · `resolveSessionIntentionLatch: pending wins; empty pending must not wipe latch`。  
> **单元（回流门闩，非 Rise 集成）**：`resolveCompanionHintClick` → toggle → smoke J（**同** smoke I 纯函数；**不**模拟 Rise 后再点 hint 的 DOM）。  
> **仍须人工**：`rise-stretch-casual` 观感、面板淡入、回 Idle/Sleeping 衔接。

1. 开始新会话，进行到一半，点 **Rise**。
2. 不应播放 Celebrating，不应播放 IncenseGreeting。  
   *[单元/控制器：`onIncompleteSessionEnded` 不 `recordCompletion` → smoke C；**非** Celebrating 抑制的 DOM]*
3. 角色播 **`rise-stretch-casual` pingpong**（闭目坐禅→伸懒腰→随意坐→倒放回闭目）；约 `MANUAL_END_PAUSE_MS = 300` 后淡入 Reflection（动画可与面板并行）。  
   **深夜亦同**：走 Rise 加权池 hold，**不得**披斗篷睡着再问 Reflection。  
   *[单元/控制器：smoke C 断言 pause 时长 + `open({ intention, intentionSource })`；深夜不披毯 → `companionRestPolicy` session-end 锚；**非** rise-stretch 序列 / 面板淡入观感]*
4. 若本次 Choose 有内容，回显仍应出现（与是否达标无关）。  
   *[DOM 用户链路：Choose→Rise→Reflection 顶部回显 → e2e `reflection-intention-echo.spec.js`；Skip — begin 无回显 → 同文件反向用例；下游入参 → smoke C（非完整用户链）；**Bug 回归锁**（二次 beginFocus 空 pending 不抹闩）→ 单元 `SessionIntentionStore.test.js` · `resolveSessionIntentionLatch: pending wins; empty pending must not wipe latch`]*
5. 三问正常可跳过；关闭 Reflection 后应回 Idle（或当日零完成时回 Sleeping），衔接勿硬切。末题非空 Continue 后 **0–1 秒内**输入框下见共鸣且卡留下（输入只读）；再点 Continue / Skip / Esc 才关——禁止约 0.9s 自动关。

---

## 场景 D：请假一天后的 Honesty Check-in（含桥接 CTA）

> **单元 / 控制器集成**：  
> - **D sleep→wake**：距上次专注 ≥2h → `sync` 进 DORMANT（`cloakSleep`→`sleeping`）→ Honesty 选 20 → `dormantWake` → 离 DORMANT → 桥接 Yes 回调 → smoke `D sleep→wake` + `dormantIdle` chain（harness 调控制器；**非**披毯/睡姿 DOM）。  
> - **D 桥接回流**：手工 DORMANT 起点 → 选 20 → wake → `HonestyBridgeCtaController` Yes→`onAccept` / No→`onDecline` / 同日再 `onHonestyCheckInComplete` → smoke D（**非**桥接按钮 DOM / Yes 后完整 Arrival UI）。  
> **仍须人工**：睡姿观感、10s 呼吸 UI、桥接文案排版、Yes 后完整 Arrival 动画。

1. 模拟「距上次专注结束 ≥ 2 小时」：写过一次专注结束时间戳后把时钟拨到 ≥2h，**且离开标签 ≥2h 再回**（短切约 1 分钟再回 **不应**进睡——见 **场景 AD** / Welcome 契约），或 DEV 改 `focus-tiger.focus-session-end.v1` 后 **Rise 结束一场** 再 sync。新用户无结束记录**不会**自动睡。冷启动刷新仍是 Idle + Welcome，不是披毯（白天不得凭陈旧 2h 戳开场即睡，见 **场景 AD**）。
2. 惰性进 DORMANT：应先见 **cloakSleep 披毯**再落入 sleeping；点进 Honesty（或 Mindful Check-in）→ **0–1 秒内**：入口按压 + `#honesty-check-in` 时长三选一面板淡入（10 / 20 / 30+）。
3. 选时长 10 / 20 / 30+（选 20）→ **0–1 秒内**：该钮下压（`translateY(1px)`）+ 时长面板让位给呼吸引导（倒计时出现）。**不要**报成哑点击。
4. **实际顺序**：选时长后 **立刻**播 `dormantWake`（cloak-sleep **倒放**，非 stretch），与约 **10 秒**呼吸倒计时**并行**（`HONESTY_BREATH_MS = 10_000`）。  
   *[单元/控制器：2h→cloak→wake→离 DORMANT → smoke D sleep→wake / dormantIdle chain；**非** cloak-sleep 倒放观感]*
5. 补登结束（记账、离 DORMANT）后：**立刻**出现 Honesty **桥接 CTA**（「要不要现在也坐一会儿？」Yes / No 同级；Welcome 回显可与邀请同屏一小会儿）。  
   - **Yes** → **0–1 秒内**：钮被点到 + `#honesty-bridge-cta` 开始收起（~260ms）+ Arrival Practice 叠层开始出现。**结果**：完整 Arrival → Companion（**不**跳过、**不**直接开表 / Ambient）。  
   - **No** → **0–1 秒内**：钮被点到 + 桥接面板收起；回到 Idle，无二次挽留。  
   - 点外侧空白 **不当** No（须明确点 Yes 或 No）。  
   - **每次**补登完成后都可出现（**不限**当日一次）。定稿见 `HONESTY_BRIDGE_CTA.md`。  
   *[单元/控制器：桥接 Yes/No/同日再出回调 → smoke D；**DOM 真实补登链**（入口→时长→呼吸→桥接 Yes→Arrival / No→Idle）→ `e2e/honesty-bridge-real-path.spec.js`（`?honestyBreathMs=`）；叠层隐藏 Honesty/微仪式入口仍可经 `__honestyBridge` 注入 → e2e `micro-ritual.spec.js` bridge 行。**非**睡姿/Arrival 动画观感。**CI**：注入 hook 须在 `vite preview` 生产构建可用（勿仅 DEV 挂载）]*
6. DORMANT 清除后仍可再点 Sit 做正式会话，与补登不冲突。Sit → **0–1 秒内**：主钮按压 + Companion / Arrival 按既有场景 A 展开（本步不另造反馈类型）。  
   **已知**：Honesty 路径暂不接 halo / 金光。
   **已知**：Honesty 补登**不**刷新 `focus-session-end`；若距上次真实专注仍 ≥2h，**仅当 tab hidden ≥2h** 回前台 sync 可再次进睡（短切 tab 不得披毯）。

---

## 场景 E：Offline Space（I'll step away）

> **单元 / 控制器集成**：舒展活跃累计在 `attentionAway` 时暂停；墙钟 `getSessionElapsedSeconds` 仍可触发 mindful；`suppressAwayReminders` → 无 Re-focus → **smoke E** + `MindfulReminderController.test`（已入 `test:smoke`）。  
> **DOM**：Offline 选中即开表 → e2e K（`scenario-a.companion.spec.js`）。  
> **未覆盖 / 仍须人工**：真实离开墙钟、welcomeBack 未接线。

1. Companion 选 **Offline Space** → **选中即开计时**，**不**出现 Arrival Notice/Choose（与 Here & Now / Flow「未就绪先 Arrival」不同）。
2. 离开电脑一段时间。
3. **已知缺口**：约 10 分钟无互动自动 `welcomeBack` / wave-hello **未接线**（仅调试「挥手欢迎」）。回来没看到挥手 = 已知状态。  
   离开期间**不应**出现 Re-focus（`suppressAwayReminders`）。
4. 回来后继续/结束：  
   - **专注墙钟计时不因离开暂停**（`FocusSession` 墙钟）。  
   - **舒展活跃累计**在离开时暂停（`MindfulReminderController`）。

---

## 场景 F：Flow State（I'm working across tools）

> **单元 / 控制器集成**：`AcrossToolsIdleGuard` 阈值后一次回调 + 键鼠活动重置计时；常量 `ACROSS_TOOLS_IDLE_THRESHOLD_MS = 1_800_000` → **smoke F** + `AcrossToolsIdleGuard.test`（已入 `test:smoke`）。Re-focus 抑制同 smoke B。  
> **未覆盖 / 仍须人工**：toast DOM 文案、真实 30 分钟墙钟。

1. Companion 选 **Flow State** → 选中即开计时。
2. 频繁切标签（模拟多任务）；离开类 Re-focus **应全程抑制**。
3. 宽松 idle 兜底：同一页内无键鼠/触控活动达到  
   **`ACROSS_TOOLS_IDLE_THRESHOLD_MS = 1_800_000`（30 分钟）**  
   → 一次 `ACROSS_TOOLS_IDLE` toast。仅切标签页**不算**重置该 idle 计时。  
   （阈值仍属产品可调项；测时如实记录即可。）

强制加速（DEV）：`__acrossToolsIdleGuard` 相关 API 或临时改阈值（仅本地）。

---

## 场景 G：语言切换

> **拍板（2026-07-30 修订）**：工程保留可点切语 + 六语槽；**v1.0.0 对外 English + Japanese**（`en`+`ja` ready；Language 可见）。中文延后（zh draft）。  
> **自动化**：unit `i18n.test.js`；e2e `language-switch.spec.js`（en↔ja；draft 不出现）。  
> **人工（v1.0）**：375 日文排版抽测；**不**要求 zh 过发布 checklist。  
> **动画（2026-07-31 · Slice A）**：切到 **日本語** 应播合十（`intentionSet`）；切回 **English** 应播鞠躬（`mindfulAcknowledge`）；同日同语不重复。详规 `SCENE_ANIMATION_WIRING.md`（`feature/scene-animation-wiring-v1-slice-a`）。

1. 打开 `?product=1` → ⋯ / 窄屏抽屉 → **Language** → 选 **日本語**。
2. 确认 Sit / Honesty / Arrival / Companion 等为日文、无 `{intention}` 未替换；阿寅播合十后回 Idle。
3. 再切回 **English**（应播鞠躬）。刷新后语言保持（`focus-tiger.locale.v1`）。
4. （DEV 仍可挂 `__languagePreference` / `__i18n` / `__sceneAnimationSliceA`；正式验收以 UI 为准。）

---

## 场景 H：正式瞳孔跟随功能

**已废弃，不需要测试**——EyeTracking 为 no-op stub，`main` 注入 `eyeTracking: null`，调试勾选已删。若仍见瞳孔跟鼠标，再报告回退不干净。

---

## 场景 O：Idle「本周陪伴」7 格热力图

> **用户故事**：Kelly 回到 Idle，quietly 看见最近 7 天「同坐」痕迹——亮格是来过的一天，暗格是安静日；**不是**断签惩罚、**不是**计分榜，也**不能**点开查详情。  
> **DOM 用户链路**：`e2e/weekly-practice-heatmap.spec.js`（Idle 7 格；Focusing 隐藏；seed 亮/暗；**375 ActionBar + 主屏三主钮 + 抽屉次要项**）。  
> **未覆盖**：Hint tip 文案/尖角、真实练习后格子变亮、上滑手势物理滑动（e2e 点 grabber）。  
> **仍须人工**：亮/暗「不羞辱」；**375 新壳观感**（ActionBar / 主屏 Sit·Quick·Honesty / Yin 居中放大 / 上滑抽屉 / 底栏干净）；宽屏仍左下簇。  
> **2026-07-24**：用户 DevTools 375 确认重叠 → 抬簇未过观感；同日改 **NarrowIdleShell**（ActionBar + BottomOptionsDrawer）。  
> **2026-07-26**：用户书面——窄屏首页底部太空；三主钮（Sit / Quick Start / Honesty）上屏，抽屉删之。

1. 打开 `?product=1`，处于 **Idle**。
2. **宽屏**：左下见 `#weekly-practice-heatmap-cluster`（7 格 + 时钟）。  
   **375×667**：见顶栏 ActionBar（? · 时间/Calm · ♪）；主画布下方三 **PNG 图腾圆球**（顺序 **Quick · Sit · Honesty**，全宽均匀；`public/icons/icon-*.png`）；**Arrival 开着时仅留 Quick Start 球**；底中「上滑打开选项」；上滑或点 grabber → 抽屉含 **呼吸 / How shall we sit? / Sound / Reminder**（**不含** Sit / Quick Start / Honesty）；7 格在抽屉内只读展示。
3. **读图**：亮格 = `totalMinutes === null` 或 `> 0`；暗格 = 真零。**无**点击下钻。
4. **Hint（可选）**：ActionBar 点 ? → tips（窄屏尖角目标可能变化）。
5. **让格子变亮**：完成计时 / Honesty / 一分钟呼吸 → 回 Idle → 抽屉内今日格亮。
6. **回流**：开 Focusing → 主钮/抽屉/grabber 收起，**Rise** 仍可见可点；Rise 回 Idle → 三主钮 + grabber 再出现。
7. **已知边界**：热力图仍不可下钻；与 HUD streak（宽屏卡内 7 点环）分工不同。

---

## 场景 P：应用内提醒（设置 +  gentle 横幅）

> **用户故事**：Kelly 想在**每天**固定时分被轻轻提醒「今天还没同坐」。她在 Idle 左下热力图旁设好时间；到点且今日尚未完成时，顶部出现非模态横幅「Yin is right here when you're ready. / 你准备好了，阿寅就在这儿。」（陪伴在场、无「在等你」紧逼感），可 × 关闭；关闭后**本页**不再重复。  
> **DOM 用户链路**：`e2e/in-app-reminder.spec.js`（4 条：时钟入口+面板标题+**每日说明文案**；设时→`visibilitychange` 回前台→横幅文案→× 关闭本页不重复；Focusing 期间 banner hidden / suppress；**已过时分软提示 + 今日已练说明且时间仍可改**）。  
> **未覆盖**：取消勾选清空偏好、完整刷新后再出现、未到时负例、defer 策略、onboarding Hint 气泡观感。  
> **仍须人工**：横幅视觉是否够「轻」（不像系统弹窗）；面板「每日」说明 + 软提示可读；忙碌期策略拍板后复测对应分支。

### P1 · 设置提醒（Idle 左下时钟）

1. Idle 下产品入口是宽屏 **⋯** / 窄屏抽屉行 `reminder.setting_title`（EN "When should I remind you"）。左下热力图簇内时钟 `#reminder-preference-toggle` 在产品壳被 park 屏外，仅作代理锚。首次可见可出 onboarding Hint `in-app-reminder`；点「?」补救 Idle 时亦应含本 tip。
2. 点击菜单行 → **0–1 秒内**：行 `:active` 按压 + `#reminder-preference-panel` 在视口内居中偏下展开（**不得**被悬停 tip 吞掉点击、也不得只关菜单而无面板）：
   - 标题：`reminder.setting_title`（EN "When should I remind you" / ZH「什么时候提醒你」）
   - 勾选 **Remind me / 开启提醒** → 写入 `{ hour, minute }` 到 `focus-tiger.reminder-preference.v1`
   - **Time** 选择器设时（如 09:00）；旁有 **→** `#reminder-preference-confirm` + 说明 `#reminder-preference-confirm-hint`（点 → 或回车保存）；→ / Enter 后短暂见 `#reminder-preference-saved`；原生 time 选完（`change`）仍写入；**过去时分允许保存**
   - 常显说明 `#reminder-preference-daily-blurb`（`reminder.daily_blurb`）：明示这是**每天**的时分，到点且今日未练会出顶部轻提示
   - 若已开启且时分已过、今日未练 → `#reminder-preference-status` 出 `reminder.past_time_note`（软提示，不拦保存）；须为 **callout**（衬底+左边线，非斜体灰字），与 `daily_blurb` 可区分
   - 若今日已练 → status 出 `reminder.practiced_today_note`（同样 callout 显眼）；**时间框仍可改**（留给以后的日子），不得灰掉锁定
3. 取消勾选 → 清除偏好（`null` = 关闭提醒；**无**单独 `enabled` 字段）。
4. 点击面板外或再点时钟 → 面板收起。

### P2 · 到点横幅（主路径 + 回流）

**触发条件（须同时满足）**：

- 已设置提醒时间（偏好非 `null`）
- 当前本地时分 **≥** 设定时分
- **今日尚未完成**（`DailyCompletionStore.hasCompletedToday()`：含计时 / Honesty / 微仪式）

**何时评估**：App **冷启动**；浏览器标签从后台 **切回前台**（`visibilitychange` → visible）；状态从忙碌回到 Idle 等（见 P3）。

5. 设好提醒且已过设定时分、今日零完成 → 顶部居中 `#in-app-reminder-banner` 出现，文案 `reminder.gentle_waiting`（EN "Yin is right here when you're ready." / ZH「你准备好了，阿寅就在这儿。」），右侧 **×** 可关。不得再用「waiting / 在等你」类紧逼措辞。**2026-08-03**：横幅本页首次可见时伴随 `parrotEarVisit`（鹦鹉信使）；同页不重播。
6. 点 × 关闭 → **本页会话内不再出现**（即使条件仍满足）。
7. **回流**：再次 `sync` / 切后台再回前台 → 仍不重复；**完整刷新**或新开 App → 若条件仍满足，**可再次出现**。
8. **负例**：未到设定时分 → 不出现；今日已完成任一会话 → 不出现；未勾选开启 → 不出现。

### P3 · 忙碌期策略（**已拍板 suppress** · 非用户可见「第 4 步」）

> **说明**：下列对照表记录产品决策（「用户正在 Arrival / Focusing 时横幅怎么办？」），**不是**场景步骤序号。**2026-07-23 已拍板**：**`suppress`**——忙碌期隐藏横幅、**不**做 `defer` 延迟弹出（**SB-04**）。权威接线：`main.js` → `InAppReminderBannerController({ busyPolicy: 'suppress' })`（见 `TEST_TRACKER` L186 / `SHARED_RESOURCES`）。

**忙碌态** = Arrival 开着 / Focusing / Celebrating / Reflection / 微仪式进行中。

| 策略 | 行为 | 人工怎么验 |
|---|---|---|
| **suppress**（**已拍板 · 产品路径**） | 忙碌时 **不展示、不排队**；下次启动或回前台再重新判断 | 到点横幅已出现后 → Sit 开 Focusing → 横幅 **立刻隐藏**；Rise 回 Idle 且仍满足条件 → **可再次出现**（若本页未 dismiss） |
| **defer**（**未启用 · 仅对照/单测**） | 忙碌时 **挂起一次**；回到非忙碌 Idle 后 **补展示一次** | 产品路径**不测**；若 DEV 临时改 `busyPolicy: 'defer'` 才验补弹 |

场景 P 的 e2e **按 suppress 断言**（Focusing 期间 banner hidden）。

### DEV 辅助（勿当生产路径）

| 需求 | 入口 |
|---|---|
| 模拟「当前时刻」 | `__inAppReminder.setNow(new Date(2026, 6, 22, 18, 0))` |
| 手动重评横幅 | `__inAppReminder.sync()` |
| 清除时间 override | `__inAppReminder.clearNow()` |

---

## 场景 Q：Support Yin · 请茶与 Sanctuary（双轨付费入口）

> **用户故事**：Kelly 想支持阿寅——右上角 **Support Yin** 打开三卡（左 Sanctuary Lifetime；中 Yin Membership；右 Buy a Tea），打赏**不**解锁内容；Sanctuary 与 tip **零耦合**。徽章走 **统一练习授予**（#204）：免费练习起授、Tea/Sanctuary 付费起 3；练习上涨自动加枚。  
> **单元**：`SupportYinModalUI.test.js` · `practiceBadgeAward` / `tipKindnessBadges` / `sanctuaryBadges` · `tipJarGate` / `sanctuaryEntitlementGate` 零耦合。  
> **DOM**：无完整 Stripe 真付 e2e；菜单开卡见 `wide-idle-more-menu` 等零星断言。  
> **仍须人工**：Test 卡金额（Tea **US$4.99** / Sanctuary **US$89.99** / Membership **US$6.99/月**，卡面 `TIP_JAR_PRICE_USD` / `MEMBERSHIP_PRICE_DISPLAY`；Checkout 应对齐）；付完回跳；徽章公式与阿寅旁优先 Sanctuary 章；Focusing 时 FAB 隐藏。三卡头图暖纸底。  
> **Electron 步骤 A**：壳内 Checkout **0–1 秒内**系统浏览器打开 Stripe（`openExternal`），Electron 窗不得被导航走；失败复用现有卡面错误文案（`TIP_BUY_ERROR` / `SANCTUARY_ERROR_GENERIC` / `MEMBERSHIP_ERROR_GENERIC`），不为壳另做 UI。付完回 App 走 Restore / OTP。Web 仍可 `location.assign`。  
> **未做 / 勿当缺口报**：多档 tip。**场景化请茶** / **意愿漏斗**已接线（TRACKER 对应行）。Ambient 深库分层见 TRACKER「Ambient · 深度曲 entitlement」（免费 5 / 其余 B）。**Focus Tiger Pro / AI Companion Add-on**：Stripe 已建、Checkout 未接。**L2 短生成**仅 Electron 宽屏 fallback（内部测）；**当前场景 Q 验收仍只测三卡**。Safari 测的是 Web 壳/付款，不是 llama。

### Q1 · Support Modal（统一入口）

1. `?product=1` Idle → 右上（音符左侧）`#yin-support-fab` → **0–1 秒内**：FAB 按压态（`:active`）+ `#yin-support-modal` 展开。
2. 见三卡（头图暖纸底；三 CTA 同款米色立体，Join Membership **不得**蒲团橙白字）：
   - **未完成过任何一次记账练习**（清 `practice-days.v1` 与 `lotus-pond.v1`；勿用 `?qaSeedStreak=` / `?qaLotusBlooms=`）：顺序 **Tea → Sanctuary → Membership**（375 最上为请茶）；**Suggested** 在 Tea 卡（`[data-testid=yin-support-suggested-badge][data-host=tea]`）。Sanctuary / Membership 仍完整可点，价文案不变。
   - **已完成过至少一次**（Focus 达标 / Honesty 成功 / Breath 完成，不论时长）：顺序恢复 **Sanctuary → Membership → Tea**；Suggested 回 Sanctuary（`data-host=sanctuary`）。此态**永久**（久别再开仍如此）。未达标 Rise **不得**切到 Sanctuary 优先。
   - **Lifetime 已买**：Sanctuary 卡**保留**、淡化（`.is-settled`），CTA **Unlock → Unlocked** 且 `disabled`（点了无 Checkout，不是哑点击）。**Suggested** 改挂 Tea。第五卡 AI Companion Add-on 出现（可点，直到加购也付完）。**Web** 模态底 `#yin-support-web-local-ai` 一句：Local AI 只在桌面应用。**Electron** 仍是 `#yin-support-desktop-ram`，不见网页那句。
   - Sanctuary 文案含 **One-time Lifetime** + **About $89.99**；Membership **About $6.99 · billed monthly**；Tea 三条仪式感 bullets。**Electron**：模态底 `#yin-support-desktop-ram`。**Web**：第四卡 Pro 或第五卡加购在栅格时见 `#yin-support-web-local-ai`（Local AI 不在浏览器）。**0–1 秒内**点任一**未结算**卡 CTA：按压 + `disabled` + 模态收起（结果层见 Q2/Q3）。
   - **对照**：场景化请茶气泡仍只在达标后出现，本步不改。
3. **Maybe later** 为文字链关闭（非全宽描边钮）。**0–1 秒内**：链按压 + 模态收起，Idle 壳仍在。关后再开仍可用。
4. **375**：三卡上下堆叠、可关；FAB 与 ♪ 同系玻璃。
5. **回流**：Sit→Focusing → FAB **隐藏**（不可点，不是哑点击）；Rise 回 Idle → FAB 复现。

### Q2 · Buy Yin a Tea（tip · 不解锁）

6. Support 卡 CTA → **0–1 秒内**：CTA 按压 + `disabled`（`_busy`）+ 模态关闭；**结果**（可能 >1s）：进 Stripe Checkout / `#yin-tip-jar-card`。禁止关闭后空白无下一步。  
   **Stripe 回跳（对照场景 AD）**：付完回 App 须**先**见致谢 / 卡面结果，**不得**先看到深夜披毯睡着再谢谢。
7. Test 卡走 Checkout（约 **US$4.99**）；回跳/`?tip=1` 后：卡内与阿寅旁 `#yin-tip-kindness-badges` 至少 **3** 枚（付费 `min=3`，上限 9）；点徽章可下 1024 PNG。
8. 卡内 `#yin-tip-jar-tea-log` 见日期+杯次；再 tip 文案「又一杯」+ 播 `teaDrinking`（首 tip：`nodGreeting`）。
9. **禁止**：tip 后出现 Sanctuary 已解锁语义或内容门打开。

### Q3 · Yin's Sanctuary（Lifetime · 零耦合）

10. Support Primary → **0–1 秒内**同 Q2（按压 + disabled + 关模态）；随后 `#yin-sanctuary-card` 卡面约 **$89.99** → Unlock → Lifetime Checkout。
11. 回跳须服务端 confirm；邮箱 restore 可用。卡内 `#yin-sanctuary-badges` ≥3 枚尊贵视觉（上限 17）；Idle 阿寅旁**优先**显示 Sanctuary 章。再开 Support：Sanctuary 卡淡化、CTA 不可点；若未加购则见第五卡。
12. **禁止**：读 tip 状态解锁。Ambient 深库：未购仅免费 5 首可播（见 TRACKER Ambient entitlement 行）。加购付完后再开 Support：第五卡**仍在**、淡化、CTA Unlocked / disabled（不得整卡消失）。

### Q4 · 统一练习徽章（免费路径 · #204）

13. 清 tip/Sanctuary entitlement → 无练习时阿寅旁 **0** 枚；做一次 Breath/Honesty/Focus 记账 → Idle 旁 ≥ **1** 枚（免费 `min=1`）。
14. 付 Tea 后升到 ≥3；练习天数/`practice-days` 抬高后刷新，枚数可按 `score = 天数 + floor(累计分/60)`、`min + floor(score/3)` **只增不减**（无需再 tip）。
15. **Membership 订阅** confirm（或 `?entitlementMock=subscription`）后 Idle 右侧 `#yin-tip-kindness-badges` ≥ **3** 枚尊贵章；Sanctuary 卡仍可显示未买 Lifetime（不把 SKU 标已买）。
16. **回流**：Rise 后再见徽章条；关 Tip/Sanctuary/Membership 卡再开仍在。

---

## 场景 S：首页左球 · Breath practice（可选时长正念）

> **用户故事**：Kelly 不想走完整 Arrival，只想先练几分钟呼吸——点首页左球 **Breath practice** → 选 1/3/5/10/20 → 吸↔呼 + **闭目坐禅呼吸（IdleOrchestrator）** + 光环 → 到点轻完成 → Reflection 浅出 → 关面板后 Journey log 有一行；Leave 不记账、不写 log。  
> **DOM**：`e2e/micro-ritual.spec.js`（主路径 / Leave / Arrival 开着点球等；常用 `?microRitualMs=`）。  
> **单元**：`MicroRitual.test.js` · `microRitualJourneyDraft` · `stopPlaybackEphemeral`；orchestration **无**抽屉 Breath 行。  
> **仍须人工**：听感（点时长 chip **立刻开始磬**；开始播 preferred / off→Mer-Ka-Ba；完成有结束铃、Leave 无结束铃；完成或 Leave **ephemeral 停播**）；间隔磬若在音符面板选了 3/5 分且时长够才响；之后 Sit→Focus 开坐即有乐+磬、Rise 停播、`ambient-pref` **不得**被改成 Off。  
> **对照**：正式 Focus 仍走 Sit→Arrival（或场景 T 时长 chip）；⚡ 旧 Quick Start「立刻 Focusing」已改为本球开 Breath。

1. Idle：宽屏 `#ft-wide-home-quickstart` / 窄屏 `#ft-narrow-home-quickstart` 文案/aria 为 **Breath practice**（非「立刻 Focusing」）。
2. 点开 → 时长 chip **1 / 3 / 5 / 10 / 20**（与 Focus **10/15/25/45** 分轨：Focus 走 Sit→Arrival，本球无 Arrival）→ 点选即开。**0–1 秒内**：吸↔呼文案出现 + **开始磬**（若计时提示音开）+ 氛围乐起。picker 打开时须见静默 `#focus-coins-duration-hint`（寅币、满 5 分钟；`?focusCoins=0` 时无；非 HUD / 非 +N toast）。
3. 进行中：吸↔呼 + **闭目坐禅呼吸**（不得整段眨眼微笑）+ 光环；到点 toast + 轻完成 → **Reflection 浅出**；记账=所选分钟；**Reflection 关闭后（含 Skip）Journey log 见一行**（无 Arrival，降级 focus 文案）。  
4. **Leave**：不记账、不进 Reflection、**不写** Journey log、停播。
5. **抽屉 / ⋯**：不得再出现 Breath / 「一分钟呼吸」行。
6. **Arrival 开着**：左球仍可见；点之取消 Arrival 再开 picker。
7. **Companion 三选一展开后**：左球 **不得**再出现在三卡下面（Quick Start 已退役；Breath 是 Idle 入口，不是选完 How shall we sit? 的第二条捷径）。**0–1 秒内**三卡出现、Breath 球消失。
8. **回流**：Leave / 完成后左球再可点；再走一轮 Sit 正式 Focus。
9. **可选**：后台切走再回前台，墙钟已满须立刻完成（visibility）。

---

## 场景 T：Focus 开表前时长 chip（10 / 15 / 25 / 45）

> **用户故事**：Kelly 走完 Arrival、选好 Companion 模式后，再选本场专注时长，再开表。  
> **单元**：`focusDuration.test.js`；偏好 `focus-tiger.focus-duration-pref.v1`。  
> **DOM**：产品无 query 路径须人工；e2e helper 默认带 `?sessionMinutes=N` **跳过** picker（勿用跳过路径当本场景通过）。  
> **仍须人工**：点 Leave 取消不开表；HUD 见本场目标分钟标注；回流再开仍记住偏好或可改；点时长 chip **0–1 秒内**开始磬 + 氛围乐（对齐 Breath；Idle 冷启动仍静音）。

1. `?product=1`（**勿**带 `sessionMinutes`）→ Sit→Arrival→Choose→Companion 点选模式。
2. 见 `#focus-duration-picker`：chip **10 / 15 / 25 / 45**（默认 10；数字 10 也可出现在 Breath，但路径不同）；**须见**最短档说明（`#focus-duration-floor-hint`，英文含 10 minutes / Breath practice）。chip 下方须见静默 `#focus-coins-duration-hint`（寅币、满 5 分钟；`?focusCoins=0` 时无）。**0–1 秒内** picker 与两句 hint 一同出现（无新按钮）。
3. 点选 → **立刻 Focusing**（0–1 秒内 Sit 变 Rise、状态 Focusing + **开始磬**（若计时提示音开）+ 氛围乐）；`#focus-hud` 显示所选目标分钟。
4. **Leave**（若 picker 仍开）→ 取消、不开表。
5. **回流**：Rise → 再 Sit→…→ 再出 picker；偏好应合理回显。
6. **调试捷径**（非故事）：`?sessionMinutes=1` 跳过 picker——仅 DEMO/e2e。

---

## 场景 U：Idle 增长礼物（Zen Cinema · Quiet Line · Wallpapers）

> **用户故事**：Kelly 在 Idle 从 ⋯ / 抽屉打开三件「礼物」——看一支精选片确认后外开 YouTube；存今日静语图；免费下阿寅壁纸。无 App 内嵌播放器、无付费门、无一键社交卖点。  
> **单元**：`zenCinemaConfig` · `dailyZenQuote`（含混合池 v2 / 同日锁）· `digitalWallpapersCatalog` / `saveDigitalWallpaper`；orchestration 含 `zen-cinema` / `daily-quote` / `wallpapers`。  
> **DOM**：`wide-idle-more-menu` 等锁行开卡（非整串故事）。  
> **仍须人工**：375 确认卡不挡主球；Rise 后再开菜单仍可点；同日 Quiet Line 金句不变；**新洞察种子句在真实 UI 的换行 / 375 窄屏观感**（DOM 仍仅开卡零星覆盖，不锁像素）。

### U1 · Zen Cinema

1. Idle → ⋯ / 抽屉 **Zen Cinema** → **0–1 秒内**：菜单行按压 + `#zen-cinema-card` 展开（缩略图 + 片名 +「将打开 YouTube」）。
2. **Watch** → **0–1 秒内**：主钮按压 + 确认卡开始收起；**结果**（可延迟）：系统浏览器打开 `https://youtu.be/RV46qrvG1pw`。卡已关但标签页还没出 = 仍算「已接收」，不要报成哑点击。**Not now** → 0–1 秒内卡收起、回到 Idle 菜单入口可见。
3. **禁止**：Reflection 边缘入口、App 内嵌播放器。

### U2 · Quiet Line / 今日静语

4. ⋯ / 抽屉 **A Quiet Line / 今日のひとこと** → **0–1 秒内**：行按压 + `#daily-zen-quote-card` 展开当日金句。
5. **Save image** → **0–1 秒内**：钮按压（证明收到）；**结果**：下载 4:5 PNG（文件名含当日 `YYYY-MM-DD`，可能略延迟）——**上图下字明信片**（当日静帧在上、暖纸金句在下；落款日期 **EN 为美国月日年**如 `August 16, 2026`，**不是** ISO `2026-08-16`；JA/ZH 用当地长日期；**不是**对话框截图，无 Not now / Save image）。同日再开句不变。
6. **Not now** 关卡；回流再开仍可。
7. **U2 子项 · 洞察种子池（Phase 1）**：当日句从经典金句 ∪ 洞察种子 **14** 句（`INSIGHT_1`–`14`）混合抽取（`focus-tiger.daily-zen-quote-pool-v2.v1` 同日锁定；机制仍是一天一句、Save image 不变）。抽中种子池条目时，该句即为「顿悟向」；**须人工**看长句换行与 375 是否溢出主球。未抽中则与旧金句无差别。**本次不做** Moment Whisper / ACTIVE_RECOVER / Reflection 三问插入。

### U3 · Wallpapers

8. ⋯ / 抽屉 **Wallpapers** → **0–1 秒内**：行按压 + `#digital-wallpapers-card` 展开 5 张缩略图 → 点选（选中态）→ **Save image**（0–1 秒按压；结果=下载 `focus-tiger-wallpaper-*.png`）。
9. **禁止**付费门 / 一键社交分享。

---

## 场景 V：变花鼓励 · 冷启动欢迎（Day1 / 久别）

> **用户故事**：Kelly 首次打开（或 ≥3 日久别）→ 阿寅变花吹散 + 头顶白玉气泡（观察式、可点消）；同日再刷不得再吹花。深夜/清晨仍优先吹花（压过 wellness 斗篷）。  
> **DOM**：`e2e/flower-welcome.spec.js` 锁 Day1 / 同日不重播 / `?flowerWelcome=0` / 欢迎日旗。  
> **仍须人工**：约 10 fps 弧线；末约 **1s CapCut** 回 Idle **不闪白**；窄屏气泡完整在 ActionBar **下方**；文案轮换不连出同一句。  
> **负例**：`?flowerWelcome=0` → 永不吹花只走书/点头池；产品壳不得无故自动连播实验室按钮。

1. 清 `focus-tiger.flower-welcome.v1` + 相关 `scene-anim-daily`（实验室重置或手清）→ `?product=1` 硬刷新。
2. Day1：见吹花 + `#flower-blow-welcome-bubble`（可点气泡/空白立刻消）；含 ≥23:00 / 清晨——**压过** wellness 斗篷/苏醒。
3. 同日再刷 → **不得**再吹花 / 再书或点头欢迎池抢播。
4. 模拟 ≥3 日久别（拨 `lastOpen`）→ 再吹花（跟 locale）。
5. **回流**：吹花进行中仍可点 Sit。
6. Lab 对照（非产品故事）：无 `?product=1` 调试钮「变花吹散+气泡」。

---

## 场景 W：点「?」· 产品简介、Privacy 与 Wellness 免责

> **用户故事**：Kelly 点「?」可查阅简介（no pressure / no ads / local-first）与「不是诊疗」声明，再点 **Privacy** 读本地优先说明（含交叉引用），Back 回简介。冷启动**不得**自动弹出免责警告牌。  
> **DOM**：`e2e/onboarding-remedy-contract.spec.js` Privacy / Idle 不自动出卡 / `?wellnessFirst=1` QA 行；单元 `privacyNoticeCopy.test.js`、`wellnessDisclaimerGate.test.js`。  
> **仍须人工**：375 简介与 Sheet 可滚、可关；Rise 后再走一遍「?」；**禁止**简介/隐私承诺具名云保管同步。  
> **产品面（2026-08-04）**：点「?」**只**出用途简介（+ Privacy），**不再**喷满页 tip；悬停薄荷绿脉冲仍可出 tip——与本故事分工，尖角乱象另见 TEST_TRACKER Hints 行。Focus HUD 三条无脉冲，悬停控件出 tip。

1. **冷启动（默认）**：`?product=1`（可清 `focus-tiger.wellness-disclaimer-seen.v1`）→ Idle **不得**见 `#onboarding-wellness-first`。**0–1 秒内**：首屏是阿寅坐禅，不是「Not therapy」警告牌。
2. 点「?」`#onboarding-hint-help` → **0–1 秒内**见 `#onboarding-app-purpose`（no pressure / no ads / stays on this device）+ 免责区块 `.onboarding-app-purpose__wellness`（EN：Not therapy or medical care；含 diagnose/treat/cure/prevent；日语切语后见「心理療法・医療ではありません」）+ 卡末 colophon（Focus Tiger™ / Created by Ihiro Armstrong Hao Hoh / Twinsology / © 2026）。**Electron 另见** `#onboarding-purpose-desktop-ram`（8 GB · Mac and Windows）；**Web / 手机 Safari 不见该块。**
3. 点 **Privacy** → `#onboarding-privacy-sheet` 可读本地优先、不挖矿反思；YPE / 漏斗 opt-in 在**可滚动 body 内**（不被 `max-height: 70vh` 裁切）；见 wellness 交叉引用 → 点链回简介免责区块。**点 sheet 外空白或 backdrop** → **0–1 秒内** Privacy + 简介卡一起关掉（不必先 Back）。
4. （可选）点 **The five moments** → 打开与场景 Y 同一 `#five-moments-compass`（见 Y）。
5. **Back** → 回简介 → Got it 关闭。
6. **回流**：Rise 后再点 ? → Privacy → Back。
7. **375**：同路径；简介 / Sheet 不挡到无法关。
8. **QA 例外**：`?wellnessFirst=1&flowerWelcome=0` 仍可强制 Got it 卡（非产品默认）。

---

## 场景 X：主动 Recover · Tiger Anchor（Focusing 轻触阿寅）

> **用户故事**：Kelly 专注中卡住了——不切页、不放弃；轻触阿寅（或幽灵提示）→ 点头鞠躬 + 中置观察式 toast + 光影 Recover 扰动；计时继续。与场景 B 被动 Re-focus（切走>60s）**分工**：本故事是**用户主动**；**不**占被动提醒日/会话额度。  
> **单元**：`MindfulReminderController.test`（不占额度 / 180s 冷却 / FB-01 微点头不延长冷却、无 toast）。  
> **DOM**：尚无完整 e2e 故事锁；观感须人工。  
> **仍须人工**：微光+文案可读；点击反馈链；冷却邀请隐退（微光/提示没了、hit 仍在）；**冷却期内再点阿寅（FB-01 微点头）**；375 不误触 Rise/HUD。  
> **合入**：#199。

1. `?product=1` → Sit（或 ⚡/时长 chip）→ **Focusing**。
2. 见幽灵提示（如「Feeling stuck?…」）+ 阿寅身前微光 `#active-recover-anchor`。
3. **轻触阿寅**（或提示带）→ **0–1 秒内**：微光/按压被接收 + `nod-bow` 开始；随后中置 toast（`ACTIVE_RECOVER` 池，~3s）+ LightProgression Recover 扰动。
4. **必须**：计时器**不停**；**不**跳页；**不**进 Reflection / MicroRitual / 记账。
5. 触发后邀请隐退 **180s**（**SB-07**）：冷却期内 **看不到**微光与幽灵提示；invisible hit 仍在（不要报成「整层没了所以点不到」）；冷却结束微光+提示回来再可点完整 Recover；期间被动 Re-focus 额度**不得**减少。
5b. **冷却期内再点阿寅（FB-01 · 不是白名单）** → **0–1 秒内**：比完整 `nod-bow` 幅度更小的点头（`nodBowMicro`，nod-bow 第 2–4 帧）；**不出**文字/toast；**不**重置或延长冷却。**不应**再出完整 Active Recover `nod-bow`+toast。只验「微光消失」≠ 本步通过。
6. **回流**：Rise → 触点消失；再 Focusing 可再出现。
7. **Whisper 交叉**（若清过 `moment-whispers-seen.v1`）：首次主动 Recover 可出 Recover `#moment-whisper` 一次（见场景 Y）。冷却再点的微点头**不应**再触发 Recover whisper。

---

## 场景 X2：Idle 轻点阿寅 · 摇耳摸头

> **用户故事**：Kelly 打开产品、阿寅在坐禅——轻点它，它摸摸自己的头顶（已有 `earWiggleHeadTouch`），不是没反应。  
> **单元**：`idleYinTapGate.test.js`（含 `wrapPlayEmotionWithIdleYinTapSync`：oneshot `onComplete` 仍见摸头键时须在回 Idle 后再武装）· `IdleYinTapAnchorUI.test.js`（额头 hit `top≤32%`）。  
> **DOM**：`e2e/idle-yin-tap.spec.js`（testid + 视口额头点击 → `earWiggleHeadTouch`；Rise→Reflection skip 回流再武装）。  
> **仍须人工**：正+倒一次 + CapCut 回 Idle 观感；Focusing 不得走摸头。  
> **0–1 秒内**：点阿寅**额头**（或上半身 hit）→ CapCut 切入摸头序列开始（无 toast）。

1. 冷启动（清 `idle-yin-tap-hint.v1`）：吹花若出现须先结束；随后头顶白玉句「试试触摸或点击阿寅的头顶」（跟 locale）。点额头后提示消失，再刷不再出。**不是**每次摸头 toast。
2. `?product=1` Idle → 轻点阿寅**额头** → **0–1 秒内**见摸头动画开始。
3. 播完 ~1s CapCut 回闭目呼吸（不得闪白）；再点可再播。
4. Sit → Focusing → 点阿寅 = 场景 X Recover，**不是**摸头。
5. Honesty 时长板 / Arrival / Support 卡开着时 hit 隐藏（点不到、不是哑点击）。**?** 简介或 Privacy 开着时同样：hit 卸武装或被挡；关掉弹窗后再点额头须摸头。
6. **回流**：Rise → Skip Reflection 回 Idle 后再点额头仍须摸头（禁止第一次播完后 hit 永久 hidden）。

---

## 场景 Y：Five Moments · Compass + Moment Whisper（B / A′）

> **用户故事**：Kelly 逐渐认出「一天五个温柔陪伴」——可自愿打开 Compass 地图；在真实经历 Arrive / Focus / Reflect（及主动 Recover）时，阿寅旁一生一次淡出句，而非教导 Banner。  
> **单元**：`fiveMomentsCompassGate` · `momentWhispersGate`；orchestration 含 `five-moments`。  
> **DOM**：菜单开卡零星覆盖；Whisper 一生一次门闩以单测为主。  
> **仍须人工**：首卡时机与 Skip；Whisper 观感与 busy suppress；375 可关不挡 Sit。  
> **合入**：#201 Compass · #203 Whisper。**不做**：常驻 5-Dot 顶栏、教导 Banner、HealthKit。

### Y1 · Compass（B）

1. Idle → 宽屏 ⋯ / 窄屏抽屉 **The 5 Moments** → `#five-moments-compass` 见 Arrive→Focus→Recover→Transition→Reflect **单行** + Got it/Close。点芯片分别进入 Arrival / Companion / Recover 仪式 / Transition 仪式 / Journey log（未授权仪式则 toast）。
2. **「?」**：简介含 Moments 链 → **The five moments** → 同卡。
3. **首卡**：清 `focus-tiger.five-moments-compass-seen.v1` → 冷启动 Idle 约数秒出一次；Skip/Got it 后不再出。
4. **回流**：关后再开；Rise 后再开。**375**：可滚可关、不挡 Sit。

### Y2 · Moment Whisper（A′）

5. 清 `focus-tiger.moment-whispers-seen.v1` → Sit→Arrival → 见 Arrive `#moment-whisper` **一次**（可点关 / 数秒淡出）。
6. 进入 Focusing → Focus whisper **一次**；再开第二场 Focusing → **不再**出 Focus whisper（**SB-05**）。
7. Rise→Reflection → Reflect whisper **一次**；再走同路径 → **不再**出（**SB-05**）。
8. **Recover**：见场景 X；首次主动 Recover → Recover whisper 一次。
9. **busy**：Compass / Companion / Arrival 叠层打开时不出（**SB-06**）；关后再进未读 Moment 仍可。
10. **「?」**：仍只出简介（+ Compass 链），**不**喷满页 tip。

---

## 场景 Z：Journey Log（D′ · 本地留痕）

> **用户故事**：Kelly 走完一场有头有尾的专注后，想安静回顾——⋯ / 抽屉打开 **Journey log**，见日期+分钟+ arrived & reflected（或缺省降级），不是 Health 同步、不是 Tip 茶室账本。  
> **单元**：`journeyLogGate.test.js`（含 `microRitualJourneyDraft`）；orchestration 含 `journey-log`。  
> **仍须人工**：Skip Reflection 后 `reflect=false`；无 Arrival 路径降级；>30 裁旧；刷新仍在；开/关卡 0–1s；**洞察小符号观感**（抽中 Quiet Line 种子池并当场打开后）。  
> **合入**：#205；洞察标记 #292 Phase 1。**禁止**：写入 HealthKit；与 Tip Jar Tea Log / Sanctuary / 统一练习徽章 **零耦合**。

1. `?product=1` → Sit→Arrival→Focus（可用 `?sessionMinutes=1` DEMO）→ Rise→Reflection（答或 Skip）→ Idle。**等价路径**：首页左球 Breath practice → 到点 → Reflection（含 Skip）→ 同样写入（`arrive: false`）。Honesty / 付费仪式 **不**入账。
2. 宽屏 ⋯ / 窄屏抽屉 **Journey log** → **0–1 秒内**：菜单行 `:active` 按压缩放（宽屏 `.ft-wide-more__item`；窄屏 `.ft-narrow-sheet__item`）+ ⋯/抽屉收起 + `#journey-log` 开始淡入（~220ms `is-visible`）。随后见日期 + 分钟 + arrived & reflected（Skip Reflection 则 reflect 降级；缺 Arrival 则无 focus 降级文案）。空列表见 empty 文案，仍算「已开卡」，不要报成哑点击。
3. **回流**：Close / 点外侧 / Esc → **0–1 秒内**：关钮 `:active` 按压 + 卡开始淡出；Idle Sit / ⋯ 或抽屉 grabber **仍可见**。刷新后条目仍在；再完成一场 → 新行在列表（上限约 30，裁旧）。
4. **Compass Reflect**（与场景 Y 交叉）：点 Reflect 芯片 → **0–1 秒内**：芯片 `:active` 按压 + `#five-moments-compass` 收起 + 同一张 `#journey-log` 淡入。
5. **备份角**（开卡之后；与开卡反馈分开验）：角落备份链 → **0–1 秒内**：链 `:active` 下压 + `#journey-log-backup-panel` 展开或收起。**Send code** → 立刻见 Sending…（`JOURNEY_LOG_BACKUP_STATUS_SENDING`）再变成发到邮箱的说明。**Enable** 成功须换一句可见状态（勿再用同一句 Backup enabled 让人以为没反应）。详测见 TRACKER 练习记忆备份行。
6. **列表行只读**：点某一天**不会**展开 Daily Card / Save image（Brief `task-journey-daily-card.md` 未接线）。这不是「开卡点了没反应」。
7. **字段 `insightSpark`**：仅当当日 Quiet Line 抽中洞察种子句 **且当场打开过** Quiet Line 时，该条（或同日已有条目被补标）带本地 `insightSpark: true`，行末见安静小符号 `◦`（`[data-testid=journey-log-insight-spark]`）。未打开 Quiet Line、或当日句是经典金句 → **无**符号。旧条目缺该字段 → 降级为无标记。刷新后标记仍在。与徽章 / Tea / Sanctuary **无**联动。
8. **375**：卡可关、不挡 Sit。
9. **对照**：Tip Jar `#yin-tip-jar-tea-log` **不得**因本场 Focus 自动多出一杯茶。

---

## 场景 AC：Yin's Collections 抽屉（L3 · 寅币珍藏表面）

> **用户故事**：Kelly 想用坐来的寅币结缘一件钱买不到的案头雅物——宽屏 ⋯ / 窄屏抽屉在 Journey log **旁边**打开 **Yin's Collections**（汉语阿寅的珍藏 / 日语阿寅の蒐集），见可滚动商店目录，不是 Support 三卡、不是请茶、不是 HUD 钱包、不是第二座莲花池。  
> **单元**：`focusCoinsSurface.test.js`（商店 8 行清供；缺口句点名还差几枚/几分钟）；`collectionsWaveHelloGate.test.js`（Focusing / celebrating 不得播；**不**要求结缘 unlistable SKU）；`EmotionController.test.js`（`collectionsWaveHello` → `waveHello` + CapCut；`welcomeBack` 仍空）；`idleChromeOrchestration.test.js`（`yin-coin` 紧挨 `journey-log`；`yinCoinVisible: false` 隐藏）；`FocusCoinsPanelUI.test.js`（z=18 / `:active`；≥480 靠右停；<480 42vh 短栏；Bond toast 中置；底栏 Play、清供行无挥手）。  
> **仍须人工**：375 不挡三球；清供目录都能滚到；不足结缘 toast；已结缘 / Wear；`?focusCoins=0` 该行消失。**无**完整用户链路 e2e（本切片）。  
> **禁止**：改场景 D；Support 入口卖点；常驻 HUD；用点满足 `isEntitled`；把器物叠回主坐席 / `#sprite-stage`；商店行出现挥手 SKU（底栏 Play 除外）；把挥手加回欢迎池。

1. `?product=1` Idle → 宽屏 ⋯ / 窄屏抽屉 **Yin's Collections / 阿寅的珍藏**（紧挨 Journey log）→ **0–1 秒内**：菜单行 `:active` 按压缩放 + ⋯/抽屉收起 + `#yin-coin-panel` 开始淡入（~220ms `is-visible`）。**≥480**：面板靠右停（与 ⋯ sheet 同族），中线阿寅须完整可见。**375**：短底栏（约 42vh），头顶不得被玻璃盖住。随后见抬头精致浮雕币标 + 寅币余额旁小 icon +「案头雅物皆由同坐日久所化」+ 商店行（青铜香薰炉 / 青瓷莲盏 / 紫檀念珠匣 / 青铜奁 / 座右小碑 / 归来青瓷小瓶 / 石镇纸 / 须弥小鼎）。SKU 行仍是占位色点。币标**不**出现在阿寅序列或蒲团上。商店行**不得**出现挥手 / 青瓷瓶 / 青铜礼器 / 单独的「久坐的人」，也**不得**用晨露滤镜盖莲花。底栏可见 **请阿寅挥挥手**。
2. **挥手点播**：点底栏 **请阿寅挥挥手** → **0–1 秒内**钮 `:active` 按压 + 阿寅开始 `wave-hello` 正放一次，约 1s CapCut 回坐禅；**挥手序列须在面板外可见**（不得被玻璃挡住）。关面板再开钮仍在。Focusing / 庆祝中点同一钮：仍有按压 + toast「阿寅正在坐着…」，**不**播序列。**不得**把挥手加回开场欢迎池。
3. **结缘成功**（余额够、门槛够）：点 **结缘 / Bond** → **0–1 秒内**钮 `:active` 按压；该行变成已结缘；余额减少。清供只进珍藏卡面，莲花朵数与亮度不变。座右小碑 / 须弥小鼎可 Wear（一次一个）。石镇纸 / 器物成功可出安静仪式句（非彩纸）。
4. **不足 / 未达门槛**：点结缘 → **0–1 秒内**仍有按压 + 行内具体缺口（还差 N 枚 / N 分钟 / 练习日等）+ 安静 **中置** toast（须盖在面板之上可读）。**不是**哑点击，也不说笼统「无法兑换」。
5. **回流**：Close / Esc / 点外侧 → **0–1 秒内**关钮 `:active` + 卡淡出；Sit / ⋯ 仍在。再打开仍是商店目录；已结缘不再扣点。
6. **对照 Support（场景 Q）**：右上角 Support Yin 三卡 / `$` **不**出现在本面板。付款仍只走 Support FAB。
7. **关闸**：`?product=1&focusCoins=0` → 抽屉 / ⋯ **没有**珍藏这一行。
8. **375**：卡可关、不挡 Sit 三球。

---

## 场景 AA：Idle Document PiP 陪伴浮窗（实验原型）

> **地位**：**实验 / 非最终形态**。用来验证「切到其他窗口或 App 时，仍能看见阿寅安静呼吸」。**待观察使用数据后决定是否继续投入**（localStorage `focus-tiger.idle-companion-pip.v1` 只记是否曾打开，不用于提醒或激励）。  
> **不是**系统托盘 / 关浏览器后仍常驻（电脑版壳已拍板 Electron，但 AA **仍不是**那条路径）；**不是** Focusing 里的 Immersive Presence「Float Yin · experimental」（那个带计时——见 **场景 AK**）。  
> **单元**：`idleCompanionPipGate.test.js`（Document PiP 支持 → 入口可挂载；不支持 → 不挂载；Idle 才显示）。  
> **DOM e2e**：无（`requestWindow` 需真实用户手势 + Chromium）。  
> **仍须人工**：Chrome/Edge 开/关流畅与呼吸卡顿；切到其他窗口后是否置顶；Safari/Firefox 入口完全不出现且无报错。

1. **Chrome / Edge 桌面** · `?product=1` Idle：热力图簇旁见画中画小圆钮（`#idle-companion-pip`）。  
   **点击后 0–1 秒内**：钮 `:active` 轻微按压缩放，置顶小窗立刻打开，窗内只有阿寅呼吸/陪伴帧（无计时、无按钮、无打卡）。不是延迟后再弹出。
2. 切到其他窗口或本机 App：小窗应保持在最上层，阿寅继续呼吸。主页面 Idle 状态不变（浮窗只是视图分身）。
3. **关闭**：再点该钮，或关系统 PiP 窗 → **0–1 秒内**小窗消失，回到普通页面；Sit / 热力图仍在。不持有独立会话。
4. **回流**：关后再开仍立刻出窗；Sit → Focusing 时入口须消失、已开浮窗须收起；Rise 回 Idle 后入口再出现，**不**自动弹窗。
5. **Safari / Firefox**（及无 `documentPictureInPicture` 的环境）：Idle **完全不见**该入口；无报错、无「暂不支持」提示。本步不是点击——入口不存在即测对了。
6. **375**：簇内图标不挡三球；本原型不要求浮窗在窄屏浏览器里好用（桌面 Chromium 才是假设验证面）。

---

## 场景 AK：Focusing · Float Yin PiP 探针（Immersive Presence · #438）

> **地位**：Focusing HUD 内 **Float Yin · experimental**（应用内沉浸 + Document PiP 小窗）。**≠** 场景 AA（Idle 热力图旁 Document PiP，无计时）。  
> **#438 行为**：Electron 壳内须 **live 探针**——探针失败 **藏钮**（禁止可点却无反应）；Chrome 桌面仍可见并可开 PiP。  
> **单元**：`immersivePresenceSupport.test.js`（Electron 探针红/绿）。  
> **仍须人工**：Safari 入口不出现；Rise 后再 Focusing 行为一致。

1. **Chrome 桌面** · `?product=1` → Sit → Focusing → 见 **Float Yin · experimental** → 点一下 → **0–1 秒内**按压 + 小窗打开（计时仍在主窗）。  
2. **Electron `desktop:dev` 宽屏** · 同上路径 → Focusing → **不得**见可点但无反应的 Float Yin（探针失败应**完全藏钮**）。  
3. **若壳内误显且点失败**：中置短句 `IMMERSIVE_PIP_UNAVAILABLE`（非空 catch）。**Safari**：入口不出现。  
4. **回流**：Rise 后再 Focusing → Chrome 仍可见；Electron 仍按探针藏/显。

---

## 场景 AB：Electron 托盘收起 ≠ 走神（电脑版 · 脚手架后测）

> **地位**：电脑版壳契约。Web / Safari **测不了**。排期 = **步骤 B**（Brief `task-electron-desktop-scaffold.md`）。**步骤 B 已接线**，请用本机 Mac `desktop:dev` 测；不要用纯 Safari 代替。  
> **对照**：场景 **B** = 用户把**另一个 App 或标签**带到前台；本场景 = 主窗口 hide 到菜单栏，进程仍在。  
> **不是**场景 AA（浏览器 Document PiP）。  
> **白名单**：**SB-18**（收进托盘无 Re-focus）。切到别的 App 仍走 B / SB-01–03。  
> **冲突扫描**：职责与 B 拆开，不是加一条更重的回归仪式。  
> **自动化**：脚手架须补「hide-to-tray ≠ away」门闩失败用例；完整托盘 DOM **须人工**（本机 Mac）。

1. 用 **Here & Now** 开一场足够长的 Focusing（建议 `?sessionMinutes=5` 的桌面包，勿用 1 分钟 DEMO）。HUD 在计时。  
2. 点窗口红灯 / 关主窗口 → **0–1 秒内**窗口消失，**菜单栏托盘图标仍在**；氛围乐与计时**不停**。不是 quit。  
3. 保持收在托盘 **约 70–90 秒**（>60s）。  
4. 再点托盘「显示」：窗口回来，**不应**出现 Re-focus 观察式 toast / `nod-bow`（**SB-18**）。若出现 = bug（`AttentionSignals` 把 `hidden` 当切走）。  
5. **对照（须仍走场景 B）**：窗口**可见**时切到另一个 Mac App 停留 >60s 再回来 → Here & Now **应** Re-focus。  
6. **退出**：托盘菜单「退出」才结束进程。红灯不得充当退出。  
7. **回流**：Rise 后再开一场，重复 2–4。Offline / Flow 下收托盘仍无 Re-focus（与 SB-03 同向，但原因是托盘而非模式抑制）。

---

## 场景 AD：精灵占用仲裁（睡 / 欢迎 / 付款回跳）

> **用户故事**：Kelly 冷启动、Welcome 后短切 tab、Reflection 开着切走、或 Stripe 付完回跳——阿寅「该不该睡 / 该不该播欢迎 / 该不该披毯」由 **`spriteChannelArbitration` 一处拍板**，不是 sleep / welcome / payment 各抢精灵。吸收 #341（Welcome 后短切 tab 不得披毯）与 #347（Reflect 开着不得 cloak）产品规则。  
> **单元 / 控制器集成**：`spriteChannelArbitration.test.js`（冷启动 / overlayBusy / paymentThankYou / wellness 0–6 窗）+ `dormantIdle` overlay 否决 + `companionRestPolicy` session-end 锚。  
> **DOM e2e**：无完整用户链路（须拨时钟 / 真 Stripe / 凌晨窗）。  
> **仍须人工**：凌晨 0–6 与 wellness 对齐的冷启动 / hidden≥2h 回前台可睡；Stripe Test 卡真付回跳；叠层开着 Arrival / Honesty / Reflection / Support 卡时切走再回。

1. **冷启动 · 白天**：有陈旧 `focus-session-end`（≥2h 前）但**硬刷新** `?product=1`（非 hidden≥2h live sync）→ **0–1 秒内**首屏阿寅 **Idle 闭目**或 Welcome/吹花，**不得**凭旧戳开场即 `cloakSleep` / Sleeping。  
   **对照 · 凌晨 0–6**：系统时钟在 wellness 深夜窗内冷启动 → **可以**披毯入睡（与 Expand A 对齐）。
2. **Welcome 后短切 tab**：本页已 Welcome / Idle → 切到其他标签约 **1 分钟**再回 → **仍 Idle 醒着**，**不得**披毯（#341）。
3. **叠层否决 · Reflection / Arrival**：Reflection 或 Arrival **仍开着**时切走 ≥2h 再回 → **不得** `cloakSleep`（叠层 busy 否决）。关 Reflection / 关 Arrival 后再按场景 D 规则测 hidden≥2h。
4. **会话结束仍醒着**：Sit 达标 → Celebrating / SessionComplete → **自然进 Reflection**（或 Rise 加权 hold）→ 全程 **不得**深夜披毯打断同坐（#347 / `companionRestPolicy`）。
5. **Stripe 回跳压过深夜披毯**（场景 Q 交叉）：深夜窗内从 Support Checkout 真付回跳 → **须先**见致谢 / Tip·Sanctuary·Membership 卡面结果，**不得**先看到睡着再谢谢。
6. **hidden≥2h 回前台（无叠层）**：窗口 hidden ≥2h 再 visible，且 **无** Reflection/Arrival/Honesty/Support 叠层 → 可按拍板进 DORMANT（见场景 D 步 1–2）。**凌晨 2 点**切走 ≥2h 再回：无叠层时**可以**睡（与冷启动 wellness 窗对齐）。
7. **回流**：关 Reflection 回 Idle → 轻点额头仍 `earWiggleHeadTouch`（摸头武装未被睡态卸掉）。

---

## 场景 AE：向阿寅倾诉 · Confide to Yin（Web harness · Electron L1/L2）

> **政策**：2026-08-10 检索不生成仍有效；**2026-08-18 窄例外** = 仅 Electron 宽屏第 3 层短生成（L2），Web / 窄屏 / ≤8GB **仍检索**。与 Support 付费 **零耦合**；Checkout / 第四卡 Pro / 第五卡 Add-on **未接**。  
> **单元**：`confideClassify` / `confideReplyFlow` / `confideOrchestration` 闸门；Electron：`desktopCompanionL1.test.js` · `desktopCompanionL2Route.test.js`。  
> **仍须人工**：Slice 0「练了多久」精确数字（合入后）；危机 `safety-01` 英文转介句回归；`depressed`→sad 禁 generate 回归。关单「能聊」已关（2026-08-25）。

### AE · Web（Safari QA 树 · harness）

**前提**：真实产品挂载仍关（`CONFIDE_USER_MOUNT_ENABLED=false`）。默认 Idle ⋯/抽屉 **无** Confide 行。

1. 打开 **`?product=1&confide=1`** Idle → ⋯ / 抽屉出现 **Confide to Yin** → **0–1 秒内** `#confide-to-yin-card` 淡入。Web **无** memory bridge → **不得**出现 `[data-testid=confide-to-yin-verbal-chips]`（Forget this 芯片仅 Electron）。  
2. 输入非空 → Share → **0–1 秒内**发送钮按压 + `[data-testid=confide-to-yin-reply]` 见回应（**`data-source=corpus`**；Web **禁止** generate）。  
3. **安全**：`I don't want to live` → `data-route=safety_redirect`，英文须是 **safety-01** 转介句（Heard. If this feels too heavy…），**禁止**茶句；危机回复左侧 **偏棕**竖线。  
4. **情绪桶**：「太累了」→ tired；`I feel depressed. Can you help me?` → `data-route=sad` + corpus，**禁止** generate / safety-01。  
5. **回流**：Close 后再开 harness；Focusing / Arrival 中 **不得**打开。**禁止**把 Web harness 当 Electron 本地 AI 验收。
6. **睡态唤醒（交叉 AD · #491）**：在 DORMANT 或 `sleeping` / `cloakSleep` 姿态下（见 **场景 D** 步 1–2 或 **场景 AD** 深夜窗）→ 开 Confide（harness ⋯ 行或倾听耳）→ **0–1 秒内** `dormantWake` 播放，面板出现后 Yin 须为 **idle 坐姿**（**禁止**背景仍 sleeping / 披毯睡）。倾听耳第二入口经 `confideToYinUI.open()` 同路径。
   *[单元：`desktopCompanionL1.test.js` Confide dormant-wake 契约；**非** CapCut 叠化观感 DOM]*

### AE · Electron L1（宽屏壳 · #362 已合）

**前提**：`cd /Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001-wt-develop-qa/focus-tiger` → `npm --prefix desktop install` → `npm run desktop:dev`。**勿**与 `dev:qa` 抢 5173。非低配宽屏（≥480）；Web Safari 同 URL **不算**本场景。

1. Idle 宽窗 → ⋯ → **Confide to Yin**（`[data-testid=idle-confide-desktop]`）→ **0–1 秒内**玻璃卡淡入 + `[data-testid=confide-to-yin-desktop-status]` 见准备/下载/加载文案（未下完可见 progress）。就绪后同一条状态区下方 `[data-testid=confide-to-yin-desktop-model]` 须见 **`Qwen3-1.7B-Q4_K_M`**（不是独立 HUD；Safari Web **无**此行）。抬头可见 `[data-testid=confide-to-yin-verbal-chips]`：**仅**一条 `Forget this`（或当前 locale 金句）；**禁止**出现 Don't save / How long have I practiced? / 两周情绪 芯片。点芯片 → **0–1 秒内** textarea 填入该金句、Share **仍可点**、**不**自动发送。  
2. Share **或** textarea 里 **Enter**（对得上情绪桶 / 安全阀）→ **0–1 秒内**发送钮按压/disabled + `[data-testid=confide-to-yin-reply]` **`data-source=corpus`**。**Shift+Enter** 只换行、不发送。下载中 Share/Enter **仍**有检索回复（非哑点击）。  
3. **Focusing 卸载**：Sit→Focusing → companion 状态不再 ready；Share **不得**走生成。Rise 后再开 ⋯ 仍有该行。  
4. **拖窄关层**：拖到 ≤479 → 生成层关掉；窄屏抽屉 **无** Confide 行。  
5. **对照**：低配 ≤8GB / Web `?product=1` → **无** companion key、无该行。
6. **睡态唤醒（交叉 AD · #491）**：DORMANT 或 sleeping 姿态下 → ⋯ **Confide to Yin** 或倾听耳 → **0–1 秒内** `dormantWake`，玻璃卡后 Yin 为 **idle 坐姿**（**禁止**仍 sleeping）。与 **场景 AE · Web** 步 6 同契约。
   *[单元：`desktopCompanionL1.test.js` Confide dormant-wake 契约；**非** CapCut 观感 DOM]*

### AE · Electron L2（宽屏 fallback 短生成 · 口令已执行）

**在 L1 壳 ready 之后测**；关单「能聊」须 Electron 人工，**不能**用 Safari 5173 代替。

1. 等 status **ready**（型号行须为 1.7B）→ 输入**对不上情绪桶**的句子（如 `What's the weather like in Beijing this week?`）→ Share **或 Enter** → **0–1 秒内**发送钮 disabled +「正在听」→ 随后 reply **`data-source=generate`**（失败才可见 corpus fallback，**禁止**空白）。  
2. **关单栏杆**：须接住该句意图；**禁止**不同问题吐同一句套话；连续 **≥3** 次 unmatched 闲聊仍须生成，不得从第 3 句起整段改茶句。同面板 **第 5–6 句** 闲聊仍须新短句，**禁止**复读第 1 句 generate（曾表现为整段 `Yes.` / `I am curious about what you would like to eat.`）。失败才可见 corpus fallback。  
3. **安全不生成**：`I don't want to live` → safety-01 转介，**一个字都不能**换成茶句。  
4. **情绪桶不生成**：「太累了」/ `depressed`→sad → corpus only，**禁止** generate。  
5. **视觉**：闲聊/生成回复左侧 **浅金**竖线；危机回复 **偏棕**竖线。出答案时 `[data-testid=confide-to-yin-user]` 仍见原问。  
6. **回流**：关卡再开；Focusing 卸载后 Share 不得 generate。  
7. **边界尊重**：`I'm not sure whether I want to talk about it.` / `I'd rather not get into that.` / `I don't think I'm up for that conversation.` → **0–1 秒内** `[data-testid=confide-to-yin-reply]` **`data-source=boundary`**，文案为 `CONFIDE_BOUNDARY_RESPECT`（en：We can leave it unspoken…）。**禁止** `I am curious` / generate。**回流**：关卡再开后再发同句仍 boundary。**负例**：`I'm just tired of everything.` 仍走情绪桶，**不得** boundary。  
8. **Don't keep**：首句或仅 `Don't keep this one.` → **`data-source=memory_suppress`**（诚实短句），**禁止** L3「I am observing」。**回归**：`Please forget about Monday` 仍 CI-01。
9. **Phase 1B 事实（交叉 AG / AF）**：`When do I usually practice?` / `How have I been showing up?` / `Have I been showing up consistently?` / `Am I practicing longer than before?` → **0–1 秒内** `data-source=practice_facts`（两窗并列或时段计数；**禁止**「你更稳了/进步了」）。`What has my mood looked like recently?` / `Can you tell me my mood trend from this week?` / `Have I been more steady lately?` → `presence_facts`（描述性 breakdown 或两窗标签；旧 *improved* 问法仅 alias）。**陪伴**：`Can you just sit next to me while I feel this?` / `Can we just breathe together for a bit?` → **`data-source=companion_presence`**，**禁止** BEGIN 声线 / generate。**负例**：`What have you noticed lately?` **不得**走 CI-00/02；`I feel depressed, what has my mood looked like recently?` → sad 语料；`I don't need you to say anything.` 无关键词 → 仍可 L3（不假装 E′ 全覆盖）。

---

## 场景 AF：Presence Signals · 陪伴观察账本（Slice 0–1 / 2 / 3）

> **用户故事**：Kelly 在同坐路上点选 Notice、仪式 chip、Reflection 自由句——产品**静默**记入 `focus-tiger.presence-signals.v1`（**≠** Yin Memory · **≠** Journey Log · **≠** 练习备份 6 key）。Confide 趋势问句（CI-02）只读封闭标签事件；freeText 默认 **90 天**保留后剥离（与 `reflections.v1` bundle 同一 cutoff helper · #440）。  
> **单元**：`presenceSignalsGate` · `confidePresenceFacts` · `presenceSignalsDisclosureGate` · `ritualPresenceBridge` · `reflectionPresenceBridge` · `freeTextRetentionCutoffMs`（**无 UI**）。  
> **仍须人工**：披露两行时长观感；Ritual 回顾气泡 ~4s；Reflection 双写后 DevTools 对账；同日 3 次 Notice 门槛。

### AF · Slice 0–1 + disclosure（Arrival Notice + Confide 趋势）

1. **首次披露**：清 `focus-tiger.presence-signals-disclosure-seen.v1` → `?product=1` → Sit → Arrival → Notice 任点 → **0–1 秒内**观察短句**下方**见 `[data-testid=presence-signals-disclosure]`（约 **4s** 随 Notice 收起再进 Breath）→ 再走一遍 Arrival **不应**再出现。  
   *[单元：`presenceSignalsDisclosureGate`；**非**披露排版 DOM 时长观感]*
2. **入账**：DevTools `focus-tiger.presence-signals.v1` 应有 `arrival_notice`（含 `emotionTag` + 时间戳）。**不进**练习备份 / Yin Memory。  
3. **Confide 趋势（交叉 AE）**：同设备 ≥3 次不同 Notice 打卡 → Electron/Web harness 问「最近两周我的情绪看起来怎样？」/ *What has my mood looked like over the last two weeks?* → reply **`data-source=presence_facts`** 描述性 breakdown；&lt;3 条 → insufficient。对照型：*Have I been more steady lately?* / 「我是不是最近比较稳定？」→ 两窗标签并列，**禁止**「你更稳了」。**负例**：「I feel depressed, has my mood improved?」→ 仍 **sad** 语料，**禁止**用趋势盖过危机/情绪桶（旧 improved 问法仅作兼容/负例，非 SSOT 正式示例）。  
4. **同日 3 次 Notice**：同一天 3 次 Sit→Notice 不同选项 → 第 3 次后应满趋势门槛（**事件数**，非去重天数）。

### AF · Slice 2（Ritual Leave 回顾 · 方案 C）

**前提**：`?product=1&entitlementMock=subscription`（Morning Ritual 需订阅 mock）。

1. Morning Ritual → Continue → 选 arrival chip → **Leave** → **无** Leave 当下 toast/确认（**SB** 类静默记账）；DevTools `presence-signals.v1` 应有 `ritual_chip` + `ritualCompleted:false`。  
2. **回顾**：同类型**第二次**进入 → welcome 前见 `[data-testid=ritual-leave-retrospective]` 气泡 ~4s → **第三次**进入**不再**出现。  
3. **完成**：走完全程 → chip 行 `ritualCompleted:true`、无回顾。**跨类型**：Emotional Reset 未完成**不在** Morning 提及。  
4. **趋势对照**：Confide breakdown 仍只计 `emotionTag`（Ritual chip **不**抬高 `totalTagged`）。

### AF · Slice 3（Reflection 双写 + 90 天对齐）

1. Focus 结束 → Reflection 填 Q1「注意到风」+ Q2「疲惫来访」→ 关面板 → DevTools：`presence-signals.v1` 应有 `reflection_q1` + `reflection_q2`（**仅 freeText**，无 `emotionTag`）；`reflections.v1` 仍有 1 条 bundle。  
2. **趋势对照**：Reflection freeText **不**抬高 Confide `totalTagged`（仍只数 Arrival Notice 等封闭标签）。  
3. **90 天剥离（#440 · 无 UI）**：`freeTextRetentionCutoffMs` 单源供 `pruneExpiredPresenceFreeText` 与 `pruneExpiredReflectionBundles` 复用——改 retention 须两边同测，**禁止**只改一侧 helper。  
   *[单元：`presenceSignalsGate.test.js` · `SessionEndFlow.test.js`；**非**时间旅行 DOM]*

---

## 场景 AG：Yin Personal Memory · Electron Confide 延伸（Slice 0–1e）

> **政策**：**仅 Electron 宽屏 L2**（≥480、非低配）；Web / 375 **无** Consent / 面板 / 注入 / 口头 Forget。与 **AE** 同 ⋯ 入口；**≠** Presence Signals（`presence-signals.v1`）· **≠** 练习备份。Slice 0 练习事实 **2026-08-25 已关**（TRACKER）。  
> **单元**：`confidePracticeFacts` · `yinPersonalMemoryStore` · `yinPersonalMemoryRetrieve` · `yinPersonalMemoryVerbalForget` · `desktopCompanionL2Route` prompt 块。  
> **仍须人工**：`userData/companion-l2/yin-personal-memory.json` 对账；L3 回指语感；面板与 verbal forget 同步。

### AG · Slice 0（练习字段 · 已关单参考）

Electron 宽屏 Confide 问 **How long have I practiced?** / **练了多久** / **Can you tell me my total sitting time on this device?** → `[data-testid=confide-to-yin-reply]` **`data-source=practice_facts`**（约 **0–1 秒内**），数字须对 Journey Log。**Phase 1B**：`When do I usually practice?`（Journey ≥3 条才报时段）；`How have I been showing up?`；`Am I practicing longer than before?`（近 14 日 vs 前 14 日并列）。**危机/情绪优先**：`I feel depressed, how long have I practiced?` → sad 语料。**Web**：无 practice_facts 宽屏壳时仍走 harness 规则（见 AE · Web）。

### AG · Slice 1a–1e（Consent → Remember → 面板 → 注入 → 口头 Forget）

**前提**：`npm run desktop:dev` 宽屏；L2 **ready**（见 AE · L2）。

1. **1a Consent**：首次 **unmatched** 句（非情绪桶/非练多久/非危机）→ L3 前应出现 Consent 条（Allow / Not now）→ 点选后 **0–1 秒内**消失并继续回复。**回流**：同会话第二条 unmatched **不再**弹；关 Confide 再开仍不弹（已决策）。**Not now** → 面板见 denied 文案。  
2. **1b Remember**：Consent **Allow** → 发可抽取句（例：`I prefer quiet, short reflections.` / `Mondays feel crowded` / `I think I need a reset.`）→ L3 成功后查 `yin-personal-memory.json`：`memories` 有 1 条 `active`（摘要是观察句，不必逐字等于用户句）。**负例**：`I'm tired` / 练多久 / 危机 / `Can we just sit here for a minute?` / 对不上规则的中文闲聊 → **不写** memory。  
3. **1c 面板**：点 **What Yin remembers** → 见类型/摘要/Why → 点 **Forget** → **0–1 秒内**行消失 → JSON 该条已删。**面板保持打开**再发可抽取句（例：`Mondays feel crowded`）→ **0–1 秒内**出现 Pattern 行（摘要是观察句，不必逐字等于用户句）。**回流**：面板**关着**写入再打开须见新行；连续快速发两条不同规则（Monday + 一句 check-in）两条都在。**空态**：Consent 未决策 → `YIN_MEMORY_PANEL_EMPTY`；**Allow 后仍无抽取条目** → `YIN_MEMORY_PANEL_EMPTY_GRANTED`（**禁止**再写「去 Confide 允许」；对不上抽取规则的闲聊 L3 答句默认不入库）。**Denied**：Consent Not now 后打开面板见 denied 文案。  
4. **1d 注入**：已有 Monday 记忆 medium+ → 再发「Monday feels crowded again」→ L3 短句应**可核对**回指周一。**对照**：「the weather is mild」→ **不得**硬插无关旧记忆。**Forget 后**再发 Monday 句 → 不应再回指。  

5. **1e 口头 Forget**：须先在 **What Yin remembers** 见到条目（例：`I prefer quiet, short reflections.` 抽中后）。再发「别再记周一的事了」/ Please forget what I said about Monday → **0–1 秒内** `data-source=memory_forget` 确认句 → JSON 该条已删。**空库**：无匹配条 → 诚实短句（「没有记得的」），**不算** CI-01 命中。L3 闲聊（如 `Mondays feel crowded`）**未必**入库，不必等一周。**bulk**「forget everything」→ 引导面板逐条。**面板同步**：开着 What Yin remembers 时口头删 → 行消失。
6. **1f Don't save · memory suppress**：Consent Allow → (T-1) 同句 `…Don't save this.` → L3 后 `memories[]` 不增 · `rememberOptOuts[]` 有记录。**(T-2)** 入库后下一句 `Forget this` / 刚才那句别记 → `data-source=memory_suppress` · 上一 turn 条目已删。**(T-3)** 仅 `Don't save this` / `Don't keep this one.` → 诚实短句 · **即使尚未 Allow Consent**。**回归**：`Please forget about Monday` 仍 CI-01 `memory_forget`。
7. **Phase 1A Show memory（CI-03）**：Consent Allow 且 What Yin remembers 已有条目 → 发 `Show me what you remember` / `你还记得什么` → **0–1 秒内** `[data-testid=confide-to-yin-reply]` **`data-source=memory_list`**，摘要须对面板 `active` 行（禁止 L3 编造）。**空态**：Allow 后无条目 → 诚实「还没有记下」。**Denied**：Not now 后同一问句 → 诚实「现在没有在记」。**负例**：`I feel depressed, show me what you remember` → sad 语料，非 `memory_list`。**不替代面板**：Forget 仍走面板或 CI-01。**Web / 无 bridge**：不走 CI-03。

---

## 场景 AH：Overlay slot 首卡队列（PR2 · 与 AD 互补）

> **用户故事**：Kelly 冷启动后吹花、Wellness 首卡、Compass 首卡、Honesty 呼吸、芥子印、in-app 提醒横幅——**同一 overlay slot** 按序排队，不与 postSession / busy 叠层抢屏。  
> **与 AD 分工**：**AD** = 精灵睡/欢迎/Stripe **占用**；**AH** = Idle chrome **首卡 / suppress** 队列（`overlaySlotArbitration` · PR1 快照等价单测 **无 UI**）。  
> **单元**：`overlaySlotArbitration.test.js`（108 cases + C1–C6）· `sessionChromeSync.test.js`（mustard postSession）。  
> **仍须人工**：吹花 vs Compass 时序；375 首卡不挡 Sit；Rise→Idle 首卡不重入已 seen。

1. **冷启动队列**：`?product=1` Idle → 吹花气泡消失后 **Compass 首卡仍按序出现**（**不得**与 flower 叠在同一 beat）。  
2. **C1 · 芥子印 postSession**：完成 score≥21 会话 → 芥子印卡开时 ⋯/Sit 应 **suppress**（与 Reflection 同级 postSession）。  
3. **C2 · Honesty busy**：Honesty 呼吸/时长面板开时 **contextual tea bubble 不出**。  
4. **C3 · 首卡 busy**：Compass / 芥子印开时 **in-app reminder banner 不出**。  
5. **回流**：Wellness 首卡关后 Compass 首卡；Rise→Idle 首卡 **不重入**已 seen 卡。**375**：首卡不挡 Sit 三球。

---

## 场景 AI：练习备份恢复 · 热力图与提醒对齐（#437 · 方案 A）

> **用户故事**：Kelly 开练习备份、在同设备练过、换机/清本地后自动恢复——**今日已练**须同时体现在热力图与提醒面板，而不是只恢复 `practice-days` 却继续催练横幅。  
> **单元**：`practiceBackupDailyCompletionReconcile.test.js` · `practiceBackupSync.test.js`。  
> **仍须人工**：等 `lastUploadAt` 更新；DEV 清 6 whitelist key 保留 `practice-backup.v1`；约 2.5s 自动恢复时序。

1. 开启练习备份 → 完成一场同坐（或 Honesty）→ 等 `lastUploadAt` 更新。  
2. DEV 清 **6 whitelist key**（**保留** `focus-tiger.practice-backup.v1`）→ 硬刷新 → 约 **2.5s** 后自动恢复。  
3. **期望**：热力图**今日格亮** + 提醒设置面板出 `reminder.practiced_today_note`（今天不会再提醒）；**顶部横幅不出**。  
4. **边界**：恢复日无 `practice-days` 今日条目 → **仍催练**；已有本地 `daily-completions` **不被覆盖**。

---

## 场景 AJ：Stay in touch · Newsletter 留资（#444 Resend **待合**）

> **用户故事**：Kelly 在 Idle 菜单可选留邮箱收产品更新——**不**挂钩 entitlement / tip / sanctuary；本地只记 `{ submitted }`，**不**存邮箱明文。Cloud 配好时 Worker + Resend 欢迎信；502 **不写** submitted。  
> **状态**：#444（Newsletter Resend await/重发）**待合入 develop**——下列步骤以 TRACKER + `NEWSLETTER_CAPTURE.md` 为准；合入后须核对 welcomeSentAt 防重发口径。  
> **仍须人工**：Gmail 垃圾箱；退订页；375·宽屏；`127.0.0.1` CORS（**不要** `localhost`）。

1. **前置**：`VITE_CLOUD_API_BASE_URL` 指向生产 Worker；Safari 用 `http://127.0.0.1:5173/?product=1`；先清 `localStorage['focus-tiger.newsletter-capture.v1']`。  
2. Idle → 宽屏 ⋯ / 窄屏抽屉 **Stay in touch** → **0–1 秒内** `#newsletter-capture-card` 淡入（两段正文说明 known-error 修复与 latest release）。  
3. 提交**同一真实邮箱** → **成功反馈才算发出**；Gmail From **`hello@twinsology.com`**（查垃圾箱）。错误反馈 → **不要**当已订阅。  
4. 本地只写 `submitted` → 退订链接可用 → 再开菜单 **We'll keep in touch** 不可点（**勿**与付费 **You're subscribed** 混淆）。  
5. **无 Cloud / `?newsletterMock=1`**：仍 mock 成功、无发信。**回流**：关卡后再开菜单；不提交不影响练习。

---

## 场景 AL：Reflection Companion · validation only（lab · 非 shipping）

> **政策**：`task-local-ai-reflection-companion-validation.md` · V3 validation ≠ shipping。**仅** Electron 非低配宽屏 + `?reflectionCompanion=1`。无 flag / Web / 375 **不得**出现 invite，也 **不得**自动 generate。  
> **单元**：`reflectionCompanionValidation.test.js` · `buildReflectionCompanionPrompt`。  
> **邻接**：场景 C 末题 echo hold · 场景 AE 危机语料 · 确定性 `[data-testid=reflection-companion-echo]` 池（非 AI）。  
> **仍须人工**：one short observation 观感是否「照见」而非「指导」；Celebrating 不被空白挡住。

1. **主路径（Electron 宽屏）**：`desktop:dev` + `?product=1&reflectionCompanion=1&sessionMinutes=1` → Sit 达标 → Reflection 末题非空 Continue → **0–1 秒内**见 echo 留下 + `[data-testid=reflection-companion-invite]`。点 invite → **0–1 秒内**钮文案变「Listening…」→ `[data-testid=reflection-companion-observation]` 见一句 observation，**`data-source=generate`**。再 Continue / Skip / Esc 关卡，Celebrating 不被挡住。  
2. **无 lab**：同一路径 **无** `?reflectionCompanion=1` → **不得**出现 invite；确定性 echo 仍可出现。  
3. **危机负例**：末题写入 `I don't want to live` → 点 invite → **0–1 秒内** Listening… → observation **`data-source=corpus_safety`**，英文须含 crisis line；**禁止** generate。  
4. **失败不挡**：companion 未 ready 时点 invite → **0–1 秒内** Listening… → observation **`data-source=corpus_fallback`**（已审语料）；卡仍可关，**禁止**空白卡死。  
5. **回流**：关 Reflection → 再开一场 **无** lab → 无 invite。

---

## 建议补充的故事（相对 A–G；O/P/Q/S–W/X–Z 已升格为正式场景）


| ID | 故事 | 为何补 |
|---|---|---|
| **I** | 点 **How shall we sit?**（未过 Arrival）→ **立刻展开三选一**；Honesty 提示开着时仍可点；**不**启动 Arrival | 回归锁：禁静默无反馈 · **单元** smoke I（`resolveCompanionHintClick`→toggle）+ **DOM** e2e I（hint→`.session-start-dock__panel`，不出 Arrival）；**「Honesty 开着时仍可点」未自动化**（仍人工看文案/动效） |
| **J** | Rise 后再点 hint → **仍展开三选一**；再选 Here & Now → **立刻 Focusing**（不得再 Notice；门闩在 Arrival/⚡ 后跨会话保持） | 回流 · **DOM** e2e J；**单元** gate persist + smoke J hint toggle |
| **K** | Offline Space：点选 → **立刻 Focusing**，**不**出 Arrival（禁止再逼点 Sit / Notice/Choose） | **DOM** e2e K（选中即开表且 Arrival hidden）；**单元** `shouldSkipArrivalOnModeSelect` / Offline canBegin 门闩 |
| **L** | 同日第二场达标 → SessionComplete，无 Celebrating、无自动 Incense | 纠正旧 A8/A9 |
| **M** | 产品壳 `?product=1`：无调试面板；实验室 `/`：有面板 | 分清测「功能」还是测「产品表面」 |
| **N** | Honesty 补登结束 → 桥接 Yes → 完整 Arrival；桥接 No → idle；靠近 idle **不**自动点头 | 2026-07-19/20 增量 |
| **O** | Idle 7 格热力图：亮/暗、非 Idle 隐藏、Hint；窄屏挂点 | **已升格** → 见上文「场景 O」；e2e 锁可见/隐藏/seed 亮暗/**375 几何**（**非** Hint） |
| **P** | 应用内提醒：设时、回前台横幅、关闭不重复、忙碌 suppress | **已升格** → 见上文「场景 P」；e2e 锁主路径+suppress（**非** defer/负例） |
| **Q** | Support Yin 三卡 + Tea tip/徽章 + Sanctuary Lifetime（零耦合）+ 统一练习徽章 | **已升格** → 见上文「场景 Q」（含 Q4 #204） |
| **R** | 跨日回访（dayN / 拨时钟）：与 `RETENTION_FUNNEL` R2–R3 对齐 | **仍建议**；测回访须拨时钟或跨日真机；勿与 Q–Z 混关 |
| **S** | 首页左球 Breath practice（时长 chip → 完成/Leave） | **已升格** → 见上文「场景 S」；`micro-ritual` e2e |
| **T** | Companion 后 Focus 时长 chip 10/15/25/45 | **已升格** → 见上文「场景 T」；无 query 路径须人工 |
| **U** | Zen Cinema / Quiet Line / Wallpapers 礼物菜单 | **已升格** → 见上文「场景 U」 |
| **V** | Day1/久别变花欢迎 + 气泡 | **已升格** → 见上文「场景 V」；`flower-welcome` e2e |
| **W** | 「?」简介 + Privacy + Wellness 首开声明 | **已升格** → 见上文「场景 W」 |
| **X** | Focusing Tiger Anchor 主动 Recover（180s 冷却；不占被动额度） | **已升格** → 见上文「场景 X」；#199 |
| **X2** | Idle 轻点阿寅 → `earWiggleHeadTouch` | **已升格** → 见上文「场景 X2」 |
| **Y** | Five Moments Compass + Moment Whisper（B / A′） | **已升格** → 见上文「场景 Y」；#201/#203 |
| **AB** | Electron 托盘收起 ≠ 走神 | **已升格** → 见上文「场景 AB」；脚手架后测；**SB-18** |
| **AC** | 寅币抽屉（L3） | **已升格** → 见上文「场景 AC」；与 Q 付费入口隔离 |
| **AD** | 精灵占用仲裁（睡/欢迎/付款） | **已升格** → 见上文「场景 AD」；Web Safari QA 树；吸收 #341/#347 |
| **AE** | Confide to Yin（Web harness + Electron L1/L2） | **已升格** → 见上文「场景 AE」；Web 仍检索；Electron 宽屏才 generate |
| **AF** | Presence Signals（Notice / Ritual / Reflection） | **已升格** → 见上文「场景 AF」；#435/#441/#439；90 天 cutoff #440 |
| **AG** | Yin Personal Memory（Electron L2 延伸） | **已升格** → 见上文「场景 AG」；Slice 0 已关；1a–1e 待人工 |
| **AH** | Overlay slot 首卡队列（PR2） | **已升格** → 见上文「场景 AH」；PR1 仅单测 |
| **AI** | 练习备份恢复对齐热力图/提醒 | **已升格** → 见上文「场景 AI」；#437 |
| **AJ** | Stay in touch / Newsletter | **已升格** → 见上文「场景 AJ」；#444 Resend **待合** |
| **AK** | Focusing Float Yin PiP 探针 | **已升格** → 见上文「场景 AK」；#438；对照 AA Idle PiP |
| **AL** | Reflection Companion validation（lab） | **已升格** → 见上文「场景 AL」；非 shipping；#486 原型 + 本旁支 fail-soft / crisis |

---

## 调试强制触发（勿当生产功能）

| 需求 | 入口 |
|---|---|
| 眨眼 | 实验室面板「眨眼」或 `playEmotion('blink')` |
| Celebrating / SessionComplete / 合十 / 挥手 / 舒展 / 正念鞠躬 / 点头致意 | 实验室对应按钮（点头**仅**调试，非靠近自动） |
| 一炷香莲花 | 实验室钮 **「一炷香完成」**（**不要** `?product=1`；会话结束自动播放未接线；池出生见下行） |
| 连续 7 天金辉 | `?product=1&sessionMinutes=1&qaSeedStreak=6` → Sit 等到达标（`qaPracticeSeed`） |
| 莲花池（持久螺旋） | **空池第一朵（左侧可见）**：`?product=1&sessionMinutes=1&qaLotusBlooms=0` 或快捷 `qaLotusBlooms=1`。花在阿寅左侧身旁、不得被蒲团挡住。满池对照：`qaLotusBlooms=11`（`qaLotusPondSeed`） |
| Honesty 睡醒 / 桥接 | 实验室「Honesty唤醒」或走 Honesty UI；桥接注入：`__honestyBridge`（**生产构建也挂载**，供 CI `vite preview` e2e） |
| gaze / yawn / tea / ear 等候选序列 | **仅 DEV**：`__spritePlayer.play('gazeP1CenterBlinkLeft')` 等（**不**在 IdleOrchestrator 随机池） |
| Re-focus | DEV：`__mindfulReminderController.handleAttentionReturn({ durationMs: 90000, displayEligible: true })`（须 FOCUSING 且未 suppress） |
| Idle 加速眨眼 | DEV：`__idleOrchestrator.setTiming({ breathCyclesBeforeBlink: 1 })` |
| 清当日完成（模拟 DORMANT） | DEV：清 `DailyCompletionStore` 相关 localStorage 后刷新（或 `__dailyCompletionStore`）——**仅**清零完成记录；**不会**单独进睡 |
| 模拟 ≥2h 后进 DORMANT | DEV：设 `focus-tiger.focus-session-end.v1` = `{"lastEndedAt": <≥2h 前 epoch ms>}` 后刷新或切回前台；或坐完一场后把系统时间拨快 |

说明：`#emotion-debug-ui` 当前在**非** `?product=1` 时挂载；多数 `window.__*` 仍仅 `import.meta.env.DEV`。例外：`__honestyBridge` / `__honestyBridgeStore` 在生产构建也挂载（e2e 注入桥接可见态；非完整补登链）。

---

## 2026-07-20 增量核对摘要（文档收敛执行结果）

1. **相对 720 / 07-19 摘要的漂移**  
   - Idle：正式编排仍为 **呼吸×5→眨眼**；**无** gaze/yawn/tea/ear 随机池（`IdleOrchestrator`）。docs 曾误写「已入随机池」→ 已纠正。  
   - 靠近 **不再**自动 `nodGreeting`。  
   - Honesty **桥接 CTA** 已落地：每次补登后立刻出现；Yes → 完整 Arrival。  
   - Offline / Here & Now / Flow：**选中即开计时**（Offline **不再**须二次 Sit；见 e2e K）。  
2. **数值（如实，2026-07-20）**  
   - Re-focus 展示阈值：60s（`REFOCUS_DISPLAY_THRESHOLD_MS`）  
   - Across-tools idle：30min（`ACROSS_TOOLS_IDLE_THRESHOLD_MS = 1_800_000`）  
   - Honesty 呼吸：10_000 ms（与 dormant-wake 并行）  
   - 演示会话：1 分钟（`DEMO_SESSION_MINUTES`）  
   - 共享提醒额度：3（`SHARED_DAILY_REMINDER_LIMIT`）  
   - 主动 Rise 留白：300 ms（`MANUAL_END_PAUSE_MS`）  
3. **EyeTracking** → 仍为回退干净（null / no-op）。  
4. **强制触发** → 见上表；Idle 无 `forcePlayVariant`。  
5. **文档收敛** → 权威仅 docs；根目录改指针；720 归档。  
6. **TEST_TRACKER** → 场景行已同步权威路径与增量要点。

---

## 2026-08-09 增量核对摘要（Q–W 升格）

1. **背景**：文首「最近代码核对」曾停在 2026-07-22；O/P 后合入的 Support / Tip·Sanctuary / Breath 左球 / Focus chip / 增长礼物 / 吹花 / Privacy 主要记在 `TEST_TRACKER`，故事剧本滞后。  
2. **下午**：升格正式场景 **Q / S / T / U / V / W**（PR #198）；**R** 留给跨日回访。  
3. **未整份重写** A–P；修正 Language 过时句。  
4. **PWA 安装** 仍不进故事（排期延后）。  

## 2026-08-09 晚 · 二次增量（X–Z · #199–#206）

1. **背景**：#198 合入后数小时内又合入 Tiger Anchor（#199）、Compass（#201）、Whisper（#203）、统一徽章（#204）、Journey Log（#205）及文档收口（#200/#202/#206）。  
2. **本次**：升格 **X / Y / Z**；**Q** 增 Q4 统一练习徽章；**W** 可链 Compass。  
3. **仍建议**：**R** 跨日回访；Transition 产品入口未做（Whisper `transition` 键不 play）。  
4. **TEST_TRACKER** 场景行改称含 **X–Z**。

---

## 2026-08-17 增量核对摘要（AB · Electron 托盘契约）

1. **背景**：分析师同意「收费 DMG 必须有托盘」；旧 Brief「脚手架不引托盘」作废。  
2. **本次**：升格 **场景 AB**（托盘 hide ≠ 走神）；白名单 **SB-18**（不复用已废止的 SB-16/17）。对照场景 **B** 仍管切标签/切 App。  
3. **步骤 B 已接线**：请用本机 Mac `desktop:dev` 按 TRACKER 场景 AB 测（托盘 + SB-18）。不要用 Safari 代替。  

---

## 2026-08-20–23 增量核对摘要（AD / AE · Confide · 冷启动验收）

1. **背景**：#341/#347 睡/欢迎规则 + `fix/sprite-channel-arbitration` 合入后，占用仲裁应一处拍板；桌面陪伴 L1 **#362** + L2 fallback 已接线；Companion 三卡 hint 与 30s/3min 验收脚本（#379）写入 TRACKER，故事剧本仍缺 **AD/AE**。  
2. **本次**：升格 **场景 AD**（睡/Welcome/Reflection 叠层/Stripe 回跳）；升格 **场景 AE**（Web `?confide=1` harness + Electron L1 壳 + L2 生成路由）；**场景 A** 补 30s/3min 子清单；**场景 Q** 补 Stripe 回跳须压过披毯；链接表补 `?confide=1` 与 `desktop:dev` 分工。  
3. **仍须人工 / 勿当缺口**：Pro / Add-on Checkout 未接；关单级 Confide「能聊」仍 release-blocker（见 TRACKER L2 行）；凌晨 0–6 wellness 窗（AD 步 1/6）。  
4. **TEST_TRACKER** 场景行仍为准；本文只串故事，不重复登记碎片。

---

## 2026-08-21–26 增量核对摘要（AF–AK · Presence / Memory / Overlay / Backup / PiP / Newsletter）

1. **背景**：8/21–8/26 合入 develop 一批用户面功能主要记在 `TEST_TRACKER` 碎片，故事剧本仍停在 8/23 AD/AE。  
2. **本次**：升格 **AF** Presence Signals（Slice 0–1 disclosure + Confide 趋势、Slice 2 Ritual Leave 回顾、Slice 3 Reflection 双写 + #440 cutoff 单源）；**AG** Yin Personal Memory（Slice 0 引用 + 1a–1e Electron 链）；**AH** Overlay slot PR2 首卡队列（PR1 仅单测）；**AI** 练习备份恢复派生 `daily-completions`（#437）；**AJ** Stay in touch（#444 **待合**）；**AK** Focusing Float Yin PiP 探针（#438，对照 AA Idle PiP）。  
3. **链接表**：补 `?entitlementMock=subscription`（AF Slice 2）；Electron 行补 AG/AK。  
4. **仍须人工 / 勿当缺口**：AJ 欢迎信 Resend 细节待 #444 合入后二次核对；Presence 披露 ~4s 观感；Electron memory JSON 对账；Overlay 吹花→Compass 时序。  
5. **下班前 Git 同步门禁（2026-08-26）**：凡口令「请安排下班前的 Git 同步」，须先增量核对并更新本文「最近代码核对」日期（见 `RULES_INDEX` → `scenario-tests-eod-sync`）。

---

## 给 Cursor 的 Prompt（增量核对；勿整份重写）

```
对照 focus-tiger/docs/SCENARIO_TESTS.md（权威）与当前代码 / origin/develop 当日合入，做增量核对，不要重写整份剧本：

1. 只核对可能漂移的条目：Idle 是否仍无随机变体池、Honesty 桥接 CTA、
   靠近是否还自动 nodGreeting、Offline Space 须再 Sit、Here & Now/Flow 选中即开计时。
2. 如实报告 ACROSS_TOOLS_IDLE / Re-focus / Honesty 呼吸 / DEMO_SESSION 等常量数值。
3. 确认 EyeTracking 仍为 no-op / null。
4. 更新「调试强制触发」表；生产构建不得暴露强制入口。
5. 保持仓库根 SCENARIO_TESTS.md 为指向 docs 的指针；勿复活 720 双源。
6. 更新 TEST_TRACKER 场景行（勿重复条目）；改完后本地 commit，勿 push。
7. Agent 自测故事优先 ?product=1；回流至少测 Rise→再 Arrival / hint 一条。
8. 2026-08 起正式场景含 Q/S/T/U/V/W 与 X/Y/Z 与 **AD/AE/AF–AK**；R（跨日回访）仍建议补充，勿占用字母改指付费或 Moments。
9. **下班前 Git 同步**：若 develop 当日（或自文首核对日以来）有新用户面合入，须先更新本文再 push（`scenario-tests-eod-sync`）；无合入则只核对日期是否需要推进。
```
