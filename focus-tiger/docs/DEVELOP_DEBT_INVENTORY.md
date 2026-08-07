# DEVELOP_DEBT_INVENTORY.md — develop 存量功能验证债务清单

创建日期：2026-08-03  
权威路径：`focus-tiger/docs/DEVELOP_DEBT_INVENTORY.md`  
盘点基线：`origin/develop` tip **`51ba5a6`**（含 PR #93 hints 视觉护栏、#94 Rise 加权手势池、#95 hints observe-hold 文档）  
初稿对照过 **`1f46a57`**；合入本文件前已按 tip 刷新基线与「部分覆盖」标注。  
性质：**只读盘点**——不改运行时、不改 `TEST_TRACKER` / `*_WIRING`；本文件可随复测结果更新标签。

**人工走查步骤 SSOT**：[`KNOWN_RISKY_TEST_CHECKLIST.md`](./KNOWN_RISKY_TEST_CHECKLIST.md)（**2026-08-07 已刷新**：扩 #18–26 Arrival 闪白 / Breath / Focus chip / 吹花 / Zen Cinema / Quiet Line / 星光斗篷 / Tip Jar / Sanctuary；§0.1 优先序）。同目录 `known-risky-test-checklist.csv` **不权威**（勿对照验收）。仓库根 KnownRisky `.numbers` 已于 2026-08-05 删除。

---

## 0. 目的与读法

`develop` 由历史上陆续合并的功能拼成；早期缺少「worktree 测完再合」纪律，导致：

- 有的功能有单测 / e2e / 可追溯人工记录 → **相对可信**  
- 有的「一直没出事」→ **假定可用**  
- 有的文档/代码已标出具体可疑点或仍挂「有问题」→ **已知风险**  
- 有的连依据都不够 → **未知**

本清单回答：**存量里哪些值得第一批补测 / 走查**，供排期；**不是**立刻开工的 Task Brief。

### 与既有文档的分工

| 文档 | 管什么 | 本清单如何用 |
|---|---|---|
| `KNOWN_RISKY_TEST_CHECKLIST.md` | known-risky **逐步操作**（Safari / 375 / 回流） | 开始产品验收时**优先按该表走**；本文件只给标签与判定依据 |
| `TEST_TRACKER.md` | 逐功能验收行与用户反馈 | 状态标签的主证据源（尤其「有问题 / 已通过 / 待人工」） |
| `COVERAGE_GAP_AUDIT.md` | 自动化覆盖分层（smoke / e2e / 人工锁） | 「有没有测」≠「人验过」；本清单叠一层**验证置信度** |
| `SCENARIO_TESTS.md` | A–P 用户故事剧本 | 场景级入口与自动化边界 |
| `PRODUCT_MOMENTS.md` / `CORE_LOOP.md` | 一天叙事 / 七步状态机 | 产品面 completeness（含未做空白） |
| `SCENE_ANIMATION_WIRING.md` / `HINTS_WIRING.md` | 动画 / Hint 接线契约 | 接线态 vs 验收态 |
| `EDGE_CASES.md` / `DOC_CODE_CONTRACT.md` | 静默失败 / 高风险契约 | known-risky 的技术依据 |
| `SHARED_RESOURCES.md` | 共享门闩 / 可见性 gap | 跨模块隐式依赖 |

### 状态标签（四选一）

| 标签 | 含义 |
|---|---|
| **verified** | 有单测和/或 e2e，**且**有可追溯人工验证（`TEST_TRACKER`「已通过」+ 日期/原话，或等价 commit/PR 记录） |
| **assumed-ok** | 已合入、目前无开放「有问题」，但缺充分人工关单，或自动化只锁逻辑/注入、观感未验 |
| **known-risky** | 分析时可见具体可疑点（开放缺陷、状态耦合、竞态、TODO/停接线、文档互斥等）——须写明可疑点 |
| **unknown** | 依据不足以归入上三类 |

### 建议后续动作（列内缩写）

- **补测试**：加/扩 unit、smoke、e2e（能锁 DOM/门闩的优先）  
- **走查**：在 `origin/develop` tip 按 `TEST_TRACKER` / 场景剧本人工复测  
- **暂不处理**：Backlog / 已放弃 / 刻意永不自动化观感 / 产品空白未接线  

---

## 1. known-risky（优先）

| 功能/交互点 | 状态标签 | 判定依据 | 涉及文件 | 建议后续动作 |
|---|---|---|---|---|
| Honesty Check-in（Idle 补登主路径） | known-risky | 曾人工 OK + 真实链 e2e；**2026-08-01 重回「有问题」**：呼吸期底栏仍三球（应 keepQuickStart）、? 补救锚虚空等。真实链绿 ≠ 叠层/chrome 契约稳。 | `HonestyCheckIn*` · `sessionChromeSync.js` · e2e `honesty-bridge-real-path` | 走查回流 → 补 chrome/叠层 e2e |
| Ambient Soundscape + 右上音符静音 | known-risky | **有问题**多行（L311/L315/L414）：Rise 停音、续播手势、窄屏抽屉挡 ♪ 历史红。`COVERAGE_GAP`：听感/行为几乎无 DOM 锁。**部分覆盖**：已有 `ambient-mute-resume-focusing` e2e；停音/续播全矩阵与听感仍未关单——排期勿与「从零排查 Ambient」重复。 | `AmbientSoundscape*` · e2e `ambient-mute-resume-focusing` · `user-ambient-upload` | 补测试（行为契约）+ 走查；对照已有 mute e2e |
| 「本周陪伴」热力图 UI | known-risky | **2026-08-04/05**：步1–3 OK；步4 变亮 OK；今日标记已合 PR #120（`dc415d7`），用户免 tip 复验；步5 weekly tip **不行**→ Hints 再设计（其他 Agent）。e2e 锁壳与 seed。 | `WeeklyPracticeHeatmap*` · `PracticeDaysStore` · e2e `weekly-practice-heatmap` | Hints 再设计；今日标记子项不再排复验 |
| 应用内提醒设置 + 横幅 | known-risky | **有问题**：入口/软提示/busy suppress 与壳改动邻接；e2e 有主路径+suppress，负例与刷新再出仍人工。 | `ReminderPreference*` · `InAppReminderBanner*` · e2e `in-app-reminder` | 走查 → 按缺口补测试 |
| Onboarding Hints · ? 补救 / Lit 试点 | known-risky | **有问题**：? 补救尖角/park、Lit 薄荷绿观感。**2026-08-04**：经清单#5 步5，weekly tip **测试不行**；用户书面「需要再设计」（产品方向）。**部分覆盖**：见 `HINTS_WIRING.md`——簇 A 格式已验；④ 视觉护栏试点已合（PR #93），用户拍板**保持观察、暂不扩** linux/peeked/更多 id（PR #95）；护栏 ≠ 人工观感关单；簇间互斥+尖角仍高耦合。 | `OnboardingHints*` · `HINTS_WIRING.md` · e2e `onboarding-remedy-contract` · `hints-visual-guardrail` | **产品再设计批次**；扩护栏前先读 HINTS_WIRING |
| 冷启动「开场即睡」vs live DORMANT | known-risky | **有问题**行仍开；历史「修好又失效」（`DEV_WORKFLOW_QUALITY` §6.7）。契约：`onAppReady` 禁进睡 / 回前台≥2h 仍披毯——双路径易回归。 | `dormantIdle.js` · `dormantTrigger.js` · `main.js` onAppReady | 走查双路径 → 保持失败用例 |
| earWiggle / 摇耳摸头回 Idle | known-risky | **有问题**：须正放→倒放→CapCut；易被「入库定格」假验收。与停接的 `welcomeBack` 同契约族。 | `EmotionController` · `spriteManifest` · Pointer/好奇池 | 走查序列 → 契约单测加固 |
| `completionPending` 时 Sit 静默 `return` | verified | **2026-08-05 批 4**：`shouldEnableFocusChromeButton` + `resyncSessionChrome` 禁 Sit；单测 + e2e `completionPending disables Sit`。 | `SessionUiGate` · `sessionChromeSync` · e2e scenario-a | 改完成反馈时复测禁用态 |
| Visibility 契约 `gap-*` 行 | verified | **2026-08-05 批 4**：四行均 `locked`（补窄 Honesty / 375 heatmap / `expectFocusSessionActive` 锁 `#focus-hud`；宽屏 companion visible 已够）。`listVisibilityLockGaps()` 现为空。 | `visibilityContractRegistry.js` · `SHARED_RESOURCES` §6 | 改 suppress 时跑 visibility e2e |
| 场景动画 Dispatcher（欢迎/深夜/好奇互斥） | known-risky | 已合 develop；`welcomeBack` **刻意空实现**（2026-08-02）；冷启动欢迎与深夜同 tick 互斥、硬切 vs CapCut 混用——文档多口径，人工多为「待测」。**部分覆盖**：中途 Rise 加权池（`riseStretchCasual`/`teaDrinking`/`bookReading`）已接线（PR #94 / `SCENE_ANIMATION_WIRING`）；勿把「Rise 手势池」再当未登记缺口。欢迎/深夜/好奇互斥仍待走查。 | `sceneAnimationDispatcher.js` · `SCENE_ANIMATION_WIRING.md` · `EmotionController` | 走查 Slice A/B 表 → 扩 dispatcher 失败用例；Rise 池见接线表 |
| MilestoneGlow 与 Celebrating 同刻 | known-risky | 产品已接线；「同刻只播 Glow、庆祝戳仍记账 / Honesty 跨节点先 Glow 再桥接」跨模块时序；`TEST_TRACKER` 仍待人工；历史曾「已知不挡合并」。 | `MilestoneGlow*` · `session-completion-feedback` · e2e `milestone-glow-product` | 走查同刻路径 → 保持 e2e |
| Companion 点选→开表门闩（含 375 鞠躬） | known-risky | 有强 smoke/e2e，但多次「鞠躬后无三选一」回归（L250/L254 族）；`arrivalGateReady` + stage + 窄宽壳隐式耦合（G-01 高风险契约）。 | `SessionUiGate` · `CompanionModePicker` · e2e `scenario-a.companion` | 走查回流（Rise 后再选）→ 门闩失败用例已有则保活 |
| Emotion / `playEmotion` 返回值常忽略 | assumed-ok | **2026-08-05 批 4 部分收口**：`DEBUG_HOLD_POSE_EMOTION_KEYS` 导出 + 单测；companion oneshot `!started` warn。调用方仍可忽略 boolean——未强制改全调用面。 | `EmotionController.js` | 新情绪漏登记时再升级；E-01 仍暂无全表 docs:check |
| `main.js` 完成路径 / `pendingAutoStart*` 闭包 | known-risky | `EDGE_CASES` #20–23：完成反馈、自动开表、叠层标志多 writer 历史；批 3 后仍标「可顺带收口」。 | `main.js` · `SessionEndFlow` | 走查异常回流；大重构暂不处理 |
| Grow / `Milestone.js` 等占位 TODO | known-risky | 代码仍 `TODO(Task 3)` 会话时长/连续天等；与已接线 `MilestoneGlowStore` **两套叙事并存**，易误以为纪念奖励已完整。 | `Milestone.js` · `RewardToast.js` · `CORE_LOOP` Grow | 暂不处理（Backlog）或文档标明「脚手架」 |

---

## 2. unknown

| 功能/交互点 | 状态标签 | 判定依据 | 涉及文件 | 建议后续动作 |
|---|---|---|---|---|
| 调试面板 · 全入库素材 / 抠图观感 | unknown | 长期「待人工」；产品壳不可见；无系统走查记录可证近期谁验过哪几条序列。 | `#emotion-debug-ui` · `ASSET_INVENTORY.md` | 暂不处理（实验室日）或抽样走查 |
| ack/light 情绪时长带统一 | unknown | 待人工；无自动化时长断言；不知当前帧率是否仍符合 7-19 标准。 | `EmotionController` · 调试试播 | 走查抽样 |
| Pointer 抚摸/轻点/绕圈（产品壳） | unknown | 标「不挡合并」；无正式 2D 精灵；检测有单测但产品可见性不明。 | `PointerInteraction.js` | 暂不处理 |
| Cloudflare Workers stub | unknown | 前端未接线；`TEST_TRACKER` 待人工 curl；与产品壳无运行时耦合。 | `focus-tiger/cloud/` | 暂不处理（v1.1） |
| UI Kit demo / 蒲团橙 CTA 实验页 | unknown | demo 页与产品壳色曾对齐；久未关单，不知是否漂移。 | `ui-kit/demo.html` · 主 CTA CSS | 暂不处理或一次走查 |
| 用户指南 + 隐私短文可读性 | unknown | 发版向文档「待人工」；非交互功能。 | `USER_GUIDE.md` · `PRIVACY_NOTICE.md` | 走查（发版前） |
| Retention 遥测占位是否打全漏斗事件 | unknown | 有 unit；无产品可见面；R 节点「未接线」与「已打日志」边界需对照 `RETENTION_FUNNEL` 逐条，本回合未逐事件跑控制台。 | `RetentionTelemetry*` | 暂不处理 |
| Focus Confidence V1（完整可信度） | unknown | PROCESS：最小 Re-focus 信号有，完整 idle/分值**未实现**——属产品空白还是半成品，对外叙事易混。 | `AttentionSignals.js` | 暂不处理；文档标明范围 |

---

## 3. assumed-ok

| 功能/交互点 | 状态标签 | 判定依据 | 涉及文件 | 建议后续动作 |
|---|---|---|---|---|
| Arrival Notice 短句可读 / Choose pingpong+叠化 | assumed-ok | 曾标「已通过」（7-20/22）；属「永不自动化」观感；此后壳/Dispatcher 大改，**无 tip 级复测记录**。 | `ArrivalPractice*` · Sprite 叠化 | 走查（改序列后） |
| Sit 误开 Honesty（z-index） | assumed-ok | 已通过；**无专条 e2e**（`COVERAGE_GAP`）；靠门闩间接。 | `#btn-focus` · z-index | 补测试（可选） |
| Companion Offline 跳过 Arrival | assumed-ok | e2e K + 曾书面 OK；总验收行仍「待人工」，回流依赖门闩。 | `shouldSkipArrivalOnModeSelect` | 走查回流 |
| Honesty 成功 toast 文案 | assumed-ok | 文案锁定；控制器测 `notifyRecorded`；**toast DOM 同屏**未关单。 | `HonestyCheckInController` | 走查同屏 |
| Reflection 意图回显 | assumed-ok | e2e + 单元抹闩锁 + 7-24 书面 OK；之后 Arrival/chrome 多变，建议当「易回归」而非永久 verified。 | `SessionIntentionStore` · `TigerReflectionMoment` · `reflection-intention-echo` | 改门闩时复测 |
| Celebrating / SessionComplete **分流逻辑** | assumed-ok | smoke A7–A8 锁分流；**动画 DOM 零 e2e**；人工曾见舞（7-21），非持续锁。 | `session-completion-feedback` | 暂不处理动画；逻辑保 smoke |
| Re-focus Acknowledge（>60s） | assumed-ok | 抑制门闩有 smoke；**真实切页**永不自动；久无专条人工记录。 | `MindfulReminderController` · `AttentionSignals` | 走查（演示 `?sessionMinutes=`） |
| DORMANT 睡姿 / cloakWake（非冷启动） | assumed-ok | 逻辑单测；序列纯人工；与「开场即睡」行分离后易漏测 live 路径。 | dormant* · Sleeping 序列 | 走查 live 回前台 |
| 一分钟呼吸微仪式 | assumed-ok | e2e 主路径有；质感/吸呼同拍曾反复；「待人工」残留。 | `MicroRitual*` · e2e `micro-ritual` | 走查观感 |
| FocusSession + Focus HUD | assumed-ok | HUD 映射/hover e2e；整场计时走动、streak 环观感待人工。 | `FocusSession` · `focusHud*` | 走查 |
| MindfulAcknowledge / stretch / AcrossTools（E/F） | assumed-ok | smoke E/F 锁逻辑；真实 20min/2h/30min toast DOM 人工。 | Mindful* · `AcrossToolsIdleGuard` | 暂不处理长墙钟 |
| i18n en↔ja 切换 | assumed-ok | unit + e2e `language-switch`；日文 375 / 切语动画观感待人工。 | `LanguagePreferenceUI` · locales | 走查 375 ja |
| 用户上传氛围乐 | assumed-ok | unit + e2e；配额/删曲主路径有；与 Ambient「有问题」簇交叉，整体验未关单。 | `UserAmbientLibrary` · `user-ambient-upload` | 走查 |
| LightProgression 金晕 | assumed-ok | 曾书面 OK；仅 unit\*；改 Arrival 推近时易漂。 | `LightProgression*` | 改氛围时走查 |
| Idle 呼吸×5→眨眼不闪 | assumed-ok | 契约单测 + 曾通过人工分列；e2e 不看像素；重写编排即高危。 | `IdleOrchestrator` · `SpriteSequencePlayer` | 改编排时走查 |
| Hints 簇 A 接线（Sit/⚡/How…） | assumed-ok | `HINTS_WIRING` 称簇 A 格式已验证 + 单元；**≠**全量 tip 观感关单。 | `hintsWiringClusterA.test.js` · registry | 扩簇时走查 |
| Hints 视觉护栏试点（mint/几何软快照） | assumed-ok | PR #93 合 develop；软快照防回归，文档明确**不替代**人工观感。 | e2e `hints-visual-guardrail` | 走查尖角/色 |
| 场景动画 Slice A（切语茶/书 + Honesty 点头） | assumed-ok | 代码已实现；TRACKER 待人工；EN 茶有 QA 笔记，非 tip 关单。 | Dispatcher · `language-switch` | 走查 |
| SessionComplete 观察式文案 | assumed-ok | PROCESS：情绪/分流已有，**非模态文案未实现**——功能半截但静默。 | 完成反馈 UI | 产品拍板或暂不处理 |
| `welcomeBack` / 挥手问候 | assumed-ok | **有意停接线**（空 onComplete）；单测锁 parked；产品叙事仍写「生命感偶遇」→ 文档/体验可能不一致。 | `EmotionController.welcomeBack` | 暂不处理或更新叙事 |
| IncenseComplete | assumed-ok | **已放弃**业务接线；调试可留。 | incense* | 暂不处理 |
| EyeTracking / 场景 H | assumed-ok | **已废弃**；勿当存量可测功能。 | — | 暂不处理 |

---

## 4. verified

| 功能/交互点 | 状态标签 | 判定依据 | 涉及文件 | 建议后续动作 |
|---|---|---|---|---|
| Idle 窄宽 chrome 总验收（三球 / ⋯ / 抽屉） | verified | `TEST_TRACKER` Task3 **已通过**（2026-08-04）。KnownRisky #1：tip `4698eb3` 步1–6、9 OK；步7 tip `0494dd6`/:5176 OK；步8 产品拍板窄屏 Hints **维持现状/延期**。专修 Focusing×? 见 PR #109 / §6.13。Facade 单测+e2e + 人工 §8+§9 壳故事。 | `IdleChromeFacade.js` · `idleChromeOrchestration.js` · `WideIdleMoreMenu` · `NarrowIdleShell` · e2e `wide-idle-more-menu` · 步骤见 `KNOWN_RISKY_TEST_CHECKLIST` #1 | 改壳时复测；步8 延期项勿当开放 Bug |
| Honesty 桥接 CTA | verified | `TEST_TRACKER` **已通过**（2026-08-04 · tip **`3ea79b9`** · PR #118）。KnownRisky #3 verified；375 suppress/半透明/Yin 放大已锁。 | `HonestyBridgeCta*` · `idleChromeOrchestration` · e2e `375 bridge…` · `KNOWN_RISKY` #3 | 改桥接/叠层时复测 |
| 产品壳 / 实验室壳切换 | verified | e2e `product-shell.smoke` + 长期使用基线；`?product=1` 契约清晰。 | `product-shell.smoke.spec.js` | 暂不处理 |
| Arrival 外侧取消 / tip 只关 tip | verified | e2e + 7-25 书面 OK（含 375 tip 邻接修）。 | `outsideDismissGuard` · Arrival e2e | 改外侧逻辑时复测 |
| Companion 点选即开表（主路径 DOM） | verified | e2e A/I/J/K + smoke 门闩 + 7-25 书面「点选即开表 OK」（窄宽壳总验收已于 2026-08-04 KnownRisky #1 / Task3 关单）。 | `scenario-a.companion.spec.js` · `scenario-smoke` | 与 known-risky 门闩回归分开看 |
| Honesty→桥接→Yes→Arrival **真实链** | verified | Task 3 e2e（禁注入）+ 7-25 桥接叠层书面 OK；壳故事已关单；桥接 CTA 已 verified；Honesty **Check-in** 呼吸期 chrome 若仍开见 known-risky，不撤销本条 DOM 主链。 | `honesty-bridge-real-path.spec.js` | 叠层回归另计 |
| Reflection 主路径有/无意图回显 | verified | e2e + 抹闩单测 + 7-24 书面双路径 OK。 | `reflection-intention-echo.spec.js` | 改 Choose 闩时复测 |
| 热力图 Store/壳显隐（非尖角观感） | verified | e2e seed 亮暗 + Focusing 隐藏等；与 UI「有问题」行区分。 | `weekly-practice-heatmap.spec.js` | 几何走查另计 |
| 提醒横幅 busy=`suppress` | verified | e2e 按 suppress 断言；产品拍板记录在 SHARED/场景 P。 | `in-app-reminder.spec.js` | 改 busyPolicy 时复测 |
| SessionUiGate 门闩契约（G-01～G-04） | verified | registry + `docs:check` + `SessionUiGate.test` + smoke；结构性强绑定。 | `sessionUiGateContractRegistry.js` | 改门闩须保红绿 |
| localStorage key 白名单（L-01） | verified | `localStateKeys.test.js` ∈ smoke。 | `localStateKeys.js` | 增 key 时同步 |
| StateManager 合法迁移（S-01） | verified | 机器块 + 单测；非法转移 warn。 | `StateManager.js` | 增状态时同步 |
| Onboarding hint id↔锚点 registry（H-01） | verified | registry 双向单测 + `hints:doc-sync`。 | `onboardingHintRegistry.js` | 增 tip 时同步 |
| 场景 smoke A–D / I / J 控制器链 | verified | `scenario-smoke.test.js` ∈ `test:smoke`（逻辑层，非观感）。 | `scenario-smoke.test.js` | 保持 |

---

## 5. 未登记 / 文档缺口（代码或叙事有、清单弱）

下列**不是**再给一个状态标签替代，而是标明「权威验收表覆盖不足」：

| 缺口 | 说明 | 建议 |
|---|---|---|
| **主动 Recover 入口** | `PRODUCT_MOMENTS` / `CORE_LOOP` 明确空白；代码无对等产品入口 | 未实现 → 勿当存量 bug；立项前勿登 verified |
| **Transition** | 完全未设计/未接线 | 同上 |
| **Grow Together / 莲花纪念物** | 素材入库；业务触发属 Backlog；与 `MilestoneGlow` 产品接线易混淆 | 在 TRACKER/接线表保持「未接线」醒目 |
| **SessionComplete 观察式文案** | PROCESS 写明未实现 | 补登记为「未做」或从「已完整 Reflect」叙事中拆出 |
| **Hints 接线簇 B–E 全表** | `HINTS_WIRING` 有表；TRACKER 多行分散，「有问题」未按簇收口 | 用接线表批次关单，避免只验簇 A |
| **SCENE_ANIMATION 生命感池（茶/哈欠/好奇）** | Dispatcher 已实现；验收行偏「待人工」，无统一「池触发矩阵」走查单 | 按接线表 §5.4 做一次抽样矩阵 |
| **`Milestone.js` 脚手架 vs Glow 产品路径** | 旧 TODO 文件仍在树内 | 标注废弃或删 TODO，避免审计误判 |
| **鹦鹉/新素材目录**（曾未跟踪） | 盘点时工作区曾有未入库 `Yin_Parrot_*` 透明帧；合清单前已移出仓库至 `Downloads/Zen-tiger-Pet-garden001-aside-assets/`，**不在** develop tip / ASSET_INVENTORY | 入库前按 PRINCIPLES 重命名；未登记功能 |

---

## 6. 统计（排期用）

基线：`origin/develop` @ `51ba5a6` · 盘点日 2026-08-03（初稿曾对照 `1f46a57`）。

| 状态标签 | 条数 | 占比（约） |
|---|---|---|
| **known-risky** | **12** | —（批 4 后：Sit 禁用 / Visibility gap / playEmotion 部分迁出） |
| **unknown** | **8** | 14% |
| **assumed-ok** | **22** | 37% |
| **verified** | **14** | 24% |
| **合计（功能/交互点）** | **59** | 100% |
| 另：**未登记/缺口**（上表） | **8** | —（不计入四态合计） |

对照 `TEST_TRACKER` 全表粗计（同 tip）：有问题 **12** · 待人工 **55** · 已通过 **45** · 仅单元 **40** · 已放弃/不挡 **5**（约 **157** 登记行）。本清单是**产品面聚合**，不是 1:1 复制每一行。

### 第一批建议（仅建议，不执行 · 按风险×影响面）

1. **窄宽 chrome + Honesty/桥接叠层**（用户已书面标有问题，且挡关单）  
2. **Ambient 停音/续播 + ? 补救尖角**（高频表面、自动化弱；**部分已有** mute e2e / `HINTS_WIRING` 护栏观察——补洞勿重开整模块）  
3. **冷启动休眠契约 + Companion 门闩回流**（历史假修好高发）  
4. Visibility `gap-*` 与 Dispatcher 互斥（Rise 加权池已接线，见 PR #94）——适合「补测试」周，少靠纯走查  

---

## 7. 维护

- 复测关单或补 e2e 后：只改本文件对应行的标签与「判定依据」（可另开文档 PR）。  
- **禁止**用本文件状态去改写 `TEST_TRACKER`「已通过」（关单仍走 `qa-pass-coverage-split`）。  
- 与 `COVERAGE_GAP_AUDIT`：那边改覆盖分层时，回头扫本清单的 assumed-ok → verified 升级条件。

---

## 8. 本回合未做

- 未改任何运行时代码  
- 未改 `TEST_TRACKER` / `*_WIRING` / `COVERAGE_GAP_AUDIT`  
- 未启动 Vite / Playwright  
- 未对每条「待人工」行做现场复测（标签依据为文档+代码阅读）
