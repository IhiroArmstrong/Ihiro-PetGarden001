# TEST_TRACKER.md — 测试跟进与功能验收追踪表

维护规则：Cursor 每完成一项具有用户可感知效果的改动，必须在下方表格新增一行，
状态默认设为「待人工测试」，并在消息里明确说「这项需要你测试」。纯后端/逻辑改动
（无 UI 变化）登记为「仅单元测试覆盖」，不需要用户测试，但仍要登记，防止遗漏。

**权威路径**：`focus-tiger/docs/TEST_TRACKER.md`（勿在仓库根目录另建副本）。

**人工验收唯一基线（2026-07-29 起 · 强制 · SSOT）**：关单级 / 可写入本表「用户反馈」或据以改状态的**人工验收**，**只认 `origin/develop` 当前 tip**。

1. **必须**报出验收时的 **commit hash**（建议先 `git fetch origin develop`，再对照 `git rev-parse origin/develop`）。  
2. 该 hash **必须等于**当时的 `origin/develop` tip。  
3. **缺 hash、或 hash ≠ `origin/develop` tip**（含在 `feature/*` / `fix/*` / 过时 worktree / 未 fetch 的本地 develop 上测）→ 该次验收结论 **一律无效**，**必须**在同步到 tip 后 **重新验证**；禁止据此标「已通过」或关闭「有问题」。  
4. feature/fix 上的试跑只算作者自检，**不得**当作正式验收；正式邀测前 Agent 须跑 `npm run check:branch-freshness`（见 regression-lock「分支新鲜度」）。

协作摘要见 `COLLAB.md`；主题索引 `RULES_INDEX.md` → `qa-develop-tip`。

**本地开发**：`cd focus-tiger && npm run dev` → 通常 `http://127.0.0.1:5173/`。  
演示会话时长默认 **`DEMO_SESSION_MINUTES = 1`**；可用 **`?sessionMinutes=5`** 拉长（场景 B Re-focus 真实切页须用）。  

**窄屏验收（2026-07-21 起）**：凡 **UI 可见**改动，测试步骤须含 **375×667 竖屏**（DevTools 设备模式即可）；触及底部 dock / 引导气泡 / 叠层底栏时，另加 **横屏**一步。标准见 **`RESPONSIVE_LAYOUT.md`**（功能对等 + 竖屏 P1，不要求每 Task 手机完美）。  

**375 故事矩阵（2026-07-25 起）**：凡改动 **Idle chrome / Arrival / Honesty / Hints**，步骤默认含 **`DEV_WORKFLOW_QUALITY.md` §8「375 故事最小集」**（非仅壳切换烟测）。外侧取消类须含「点 tip 只关 tip、不关面板」。关单：**禁止**仅凭「宽屏人工 OK」关闭 chrome 行，须注明「375 故事是否测过」。双壳不变量见 `SHARED_RESOURCES.md` §6。  

**宽屏故事矩阵（2026-07-25 起）**：同上 chrome 类任务，步骤默认含 **`DEV_WORKFLOW_QUALITY.md` §9「宽屏故事最小集」**（≥480 / 建议 ≥900；目标壳 Sit+⚡+⋯ + Popover 代理；旧竖排 dock 见 §9.2）。关单：**禁止**仅凭「375 OK」或「⋯ 在」关闭；须注明「宽屏故事是否测过」（N24）。  

**`position: fixed` 全屏/半屏容器 ↔ 既有浮层（2026-07-29 起）**：凡**新增**（或大幅改写）一个 `position: fixed` 的全屏 / 半屏壳（例：`NarrowIdleShell`、底部抽屉宿主、staged 全宽层），**禁止**只给新组件自己写 e2e。必须同时：

1. **手工/DevTools 检查**是否遮挡或截断已有浮层类组件（Reminder 面板、应用内提醒横幅、onboarding tip、FocusHUD 悬停浮层等——凡挂在 `#ui-overlay` 或同层 fixed 的都算）。  
2. **给每个受影响的既有组件补一条对应窄屏视口（默认 375×667）的 e2e**（断言在视口内 / 不被裁切 / 可点），不得只靠默认宽屏视口冒烟。

**为什么**：Bug1/Bug2（Reminder 面板在 375 被新壳 staged 居中裁切、`left` 为负等）说明——旧 e2e 只在默认视口锁「面板存在」，**没有 375 覆盖**时，新 fixed 容器会悄悄改布局，宽屏仍绿、窄屏已坏。壳烟测 ≠ 浮层回归。  

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
| **[L174](#L174)** | Arrival · 轻量气泡 + ⚡ Quick Start | 07-25 晚用户书面：**测试 OK**（含 tip 只关 tip） |
| **[L228](#L228)** | 「本周陪伴」7 格热力图（场景 **O**） | 07-26（wide-idle @5174）：**图1–12 相关项全部测试 OK**；⑦ 原挡门项已收口 |
| **[L238](#L238)** | 应用内提醒设置 + 横幅（场景 **P**） | 07-25 横幅/每日 blurb / past_time **OK**；软提示缺口见 L242（**不挡** P0 / **不挡** merge） |
| **[L257](#L257)** | 用户场景剧本 SCENARIO_TESTS | 本轮 **C / P 测试 OK**；**O 图1–12 OK**（见 L228） |
| **[L183](#L183)** | Honesty 桥接 CTA 叠层 | 07-25 **测试 OK** |
| **[L250](#L250)** | 门闩一体包 · Companion 点选→开表 | 07-26 375 鞠躬后三选一回归 · **待复测** |
| **[L259](#L259)** | How shall we sit? 立刻展开三选一 | 07-25 **测试 OK** |
| **[L280](#L280)** | Offline 禁止二次 Sit | 07-25 一次 Sit 即 Focusing **测试 OK** |

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
| **[L187](#L187)** | MilestoneGlow | **待接线**（2026-07-31 拍板正式路径）；Brief 已立 |

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


### 缺陷分级与处理承诺（2026-08-02 起 · 强制）

> 索引：`RULES_INDEX.md` → `release-blocker-ledger`。发布候选硬闸见 regression-lock「发布候选门禁」。  
> 清单命令：`cd focus-tiger && npm run check:open-blockers`（日常 exit 0）；发版前加 `-- --release-gate`。

凡用户书面反馈被判定为**缺陷**（状态「有问题」，或反馈明确要求修复），除「用户反馈」列的日期 + 原话要点外，**必须**同时填写功能清单表的 **严重度** 与 **处理承诺** 两列：

| 字段 | 必填 | 取值 / 要求 |
|---|---|---|
| **严重度** | 是 | `release-blocker`：挡住下一稳定发布候选（合 `main` / 打稳定 tag）前须处理或书面降级；`post-v1`：明确不挡本版；`cosmetic`：观感/文案细疵，不挡发布；存量见下「legacy-unclassified」 |
| **处理承诺** | 是 | 不可空、不可只写「待定」。须写明**批次或时间窗**（例：「v1.0.0 冻结前 chrome 同批」「预计 ≤YYYY-MM-DD 开工」）。开修后可补同一 `fix/<name>`（**允许多条缺陷共用一个 fix 分支**） |

**禁止**：只改状态为「有问题」却不填严重度/处理承诺；用「稍后开分支」代替承诺；把发现问题默认解释成「立刻新开独立 `fix/*`」（易导致分支泛滥）；靠反复改处理承诺措辞**重置** 7 日逾期时钟。  
**允许**：多个小缺陷批量进入**同一个** `fix/*`；采用「拆分逻辑改动 → 合入后全量验证」两阶段，不要求一 bug 一分支。

#### 机器锚点（`check:open-blockers`）

每条**新开**的开放中 `release-blocker` 须在「用户反馈」格含一行 HTML 注释：

`` `&lt;!-- open-blocker: id=RB-YYYYMMDD-L### severity=release-blocker recorded=YYYY-MM-DD --&gt;` ``（示例用实体转义，避免被脚本当成真锚点）

- `id` 一经写入勿改号；同行多缺陷用后缀 `-a` / `-b`。  
- `recorded` = **首次**记为开放 `release-blocker` 的日期（逾期时钟起点；**改处理承诺或微调措辞不重置**）。  
- 修复进度信号：任一分支（含已合入的 `fix/*` 历史）的 commit message 须含 `Fixes: <id>`（可逗号并列多 id）。  
- **关闭 / 降级（产品判断）**：用户书面将严重度改为 `post-v1` / `cosmetic`，或缺陷关单离开「有问题」——须写理由与日期；Agent **不得**自行降级以绕过发版门禁。关闭锚点示例（实体转义）：`` `&lt;!-- open-blocker: id=RB-… closed=YYYY-MM-DD reason=… --&gt;` ``。

#### 技术性补正 vs 书面降级（须区分）

| 情形 | 做法 | 是否走「用户书面降级 post-v1」 |
|---|---|---|
| 确认已修，但 commit **漏写** `Fixes: <id>`，脚本仍报逾期/未挂上 | 在 TEST_TRACKER 将该锚点改为 `closed=YYYY-MM-DD reason="commit <hash> 已修复，漏标 Fixes 注解"`（可同时把状态改回「待人工测试」等） | **否**——记录补正，非产品放行判断 |
| 仍未修，但决定本版不挡发布 | 严重度改为 `post-v1`（或关闭），**用户当回合书面**写明理由 | **是** |

#### 逾期

`release-blocker` 自 `recorded` 起超过 **7 个自然日**，且 git 历史中尚无任何 `Fixes: <id>`，且无有效 `closed=` 技术性补正 → 脚本标「逾期未处理」。缺 `recorded=` 或日期非法 → 标 **MALFORMED**（日常可见；`--release-gate` 与逾期同等硬拦）。  
日常 `npm run check:open-blockers` **exit 0**（只汇报）。发布候选硬拦见 regression-lock。

#### 存量 legacy-unclassified（2026-08-02）

机制生效前已是「有问题」、尚未重新分级的行：严重度填 **`legacy-unclassified`**，处理承诺填 **`legacy · 暂不进逾期扫描；发布前人工过目`**。  
- **不**进入 7 日逾期扫描，也**不**因本机制 exit 1。  
- `check:open-blockers` **必须**单独列出 legacy 清单；`--release-gate` 时额外打印提醒句（仍不硬拦），避免永远躲在 legacy 下被遗忘。  
- 新反馈不得再标 `legacy-unclassified`；须选 `release-blocker` / `post-v1` / `cosmetic` 并写处理承诺。

无缺陷的行：严重度与处理承诺填 `—`。

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
| Honesty 桥接 Yes/No | `HonestyBridgeCtaController` | **控制器集成** smoke D（Yes→`onAccept` / No→`onDecline` 回调）；**DOM 真实链** `honesty-bridge-real-path.spec.js`（入口→时长→呼吸→Yes→Arrival）；**DOM 叠层** `micro-ritual.spec.js` bridge 行（经 `__honestyBridge` **注入**）。**CI 须生产构建也暴露 `__honestyBridge`**（注入用例）。375 另锁 ActionBar + ? tip 不关 Yes/No | **桥接 UI 排版**、Arrival 动画本身；375 ? tip 邻接（人工若未测过） |
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
| MilestoneGlow 金辉仪式 | **待接线**（正式路径拍板） | 产品节点触发 + 4 fps 观感 | **[L187](#L187)** · Brief `task-milestone-glow-product-wire.md` |
| Ambient Sound **入口**（未计时提示 / 开表后可展开） | 已通过 | 入口行为已验收 | **[L191](#L191)** Ambient Soundscape · **[L264](#L264)** `人工 · 静音图标 + Sound` |

**§B 未单列、但在场景 checklist 里测的项**（见 **L261–L267**）：**[L261](#L261)** A1 Idle 开局（**已通过**） · **[L266](#L266)** Celebrating / 同日 SessionComplete 观感（**已通过**） · **[L267](#L267)** Honesty 桥接完整 Arrival（**已通过**） · DEV 一键重置（**L-logic / 仅单元测试**）。

#### C. 下一步自动化（扩 smoke ✅ · 余下见审计）

> **功能 vs 测试覆盖对照（缺口审计 SSOT）**：[`COVERAGE_GAP_AUDIT.md`](./COVERAGE_GAP_AUDIT.md)（模块矩阵、三条「绿」口径、永不自动化清单、**§7 unit\*→smoke 分类**、§8 Honesty v1 评估、§9 i18n、§10 发布影响）。本表 §C 只排期；改覆盖结论先改审计文档。

| 优先级 | 内容 | 对应 bug/场景 |
|---|---|---|
| **Task 3** | ✅ **已落地**（2026-07-30）：`e2e/honesty-bridge-real-path.spec.js` — 真实入口→时长→`?honestyBreathMs=` 呼吸→桥接 Yes→Arrival / No→Idle；**勿**仅 `__honestyBridge` 注入（叠层用例仍可注入）。**产品**：链路可用，**不**挡 v1（审计 §8） | 场景 D/N |
| **Task 2** | ✅ **已落地**（2026-07-30）：smoke E（Offline 舒展暂停 + 墙钟仍走 + 无 Re-focus）/ smoke F（AcrossTools 30min 一次 idle + 活动重置）；`MindfulReminderController.test` + `AcrossToolsIdleGuard.test` **并入** `test:smoke` | 场景 E/F |
| **扩 smoke** | ✅ **已落地**（2026-07-30）：`test:smoke` = `run-src-unit-tests.js` + `docs:check`（A+A′；`test:regression` 空集）。**319** pass · ~343ms | 防 PR 冒烟漏跑 |
| **i18n**（v1.0 en+ja） | ✅ **已落地**（2026-07-30 修订）：`en`+`ja` ready；Language 可点；zh draft；unit+e2e 锁 en↔ja | 场景 G |
| 可选 | e2e **Rise 后再点 hint** 回流 DOM（smoke J 目前只锁纯函数） | 场景 J |
| **不做**（永不自动化） | 真实切页 60s、Celebrating 像素、Idle 闪不闪 等 | 审计 §5 + 人工分列 → **[L262](#L262)** Idle · **[L265](#L265)** Re-focus · **[L266](#L266)** Celebrating / SessionComplete · **[L261–L267](#L261)** 场景 checklist |

**命令**：`cd focus-tiger && npm run test:smoke`（scenario + 重置 L-logic + **SessionUiGate** + HUD 映射等）· `npm run test:e2e`（约 **32** 条：产品壳 2 + Companion A/I/K 等 + 意图回显 2 + 热力图 7 + 提醒 4 + FocusHUD hover 1 + 微仪式/桥接 4 等）。本地默认 **Playwright 自带 Chromium**（不唤起系统 Chrome）。缺浏览器时先 `npm run test:e2e:install`。要用系统 Chrome 兜底：`PLAYWRIGHT_CHANNEL=chrome npm run test:e2e`。

---

## 状态定义

- **仅单元测试覆盖**：无用户可见变化，逻辑对错已由自动化测试验证，用户不需要点开看。
- **待人工测试**：已实现，单元测试（如有）已通过，但视觉/体验效果需要用户亲自看一遍才能确认。
- **已通过**：用户亲自测试确认没问题（或缺陷已按用户要求撤销/回退，且代码核对确认到位）。**改此状态前必须满足下方「标「已通过」门禁」**——禁止笼统写「已通过」。
- **有问题**：用户测试后发现瑕疵，需写清楚问题内容，退回处理。
- **已放弃/不适用**：产品已决定不做或卸下（含「业务未接线、暂不验收」）；**不**再排人工验收，也不挡 `develop`→`main` 合并。
- **不挡合并（仅调试）**：只在实验室调试面板 / 兼容空键出现，**产品壳 `?product=1` 正式用户路径看不到**；可留技术债，不挡合并。
- **不挡合并（仅检测逻辑）**：交互检测已接线且有单测，但**无正式精灵/动画**；产品壳不排视觉验收，不挡合并（例：抚摸/轻点/绕圈占位）。

### 标「已通过」门禁（2026-08-02 起 · 强制 · SSOT）

> 索引：`RULES_INDEX.md` → `qa-pass-coverage-split`。门禁摘要见 regression-lock「标「已通过」门禁」。  
> **要防什么**：**记入 ≠ 验证到位**；**e2e / CI 绿 ≠ 已锁住整行用户故事**；对话里口头说过「不能笼统写已通过」却未落盘 → 下一会话又漏。

把功能清单某行状态改成 **「已通过」**（关单）之前，**同一次编辑**必须同时满足下列全部条件；缺任一 → **禁止**改状态，只可保持「待人工测试」/「有问题」，并诚实写未测项。

1. **用户书面确认**  
   「用户反馈」列有用户书面「测试 OK」类确认（或用户书面要求撤销/回退缺陷且代码已核对到位）。Agent **不得**仅凭自测或自动化绿自行标「已通过」。

2. **验收基线合法**（`qa-develop-tip`）  
   该次书面确认测自当时的 **`origin/develop` tip**（须记 commit hash）。feature / fix / 过时 worktree / 非 tip 端口上的「测试 OK」**只算作者自检或阶段性反馈**，**不得**据此关单。

3. **覆盖分工明示**（防笼统关单 · 强制）  
   在「用户反馈」列（或紧挨关单句的同格附注）**逐条写清**，禁止一句「e2e 已绿 / 已覆盖 / 已锁住 / 已通过」代替：

   | 必填块 | 写什么 |
   |---|---|
   | **e2e / 自动化已锁** | 具体场景或用例名（例：`wide-idle-more-menu`「悬停 Language 不闪 Sit tip」）；若无自动化 → 写 **「无」** |
   | **人工已覆盖** | 用户书面确认测过的场景（主路径 / 回流 / 视口 / 故事矩阵项等） |
   | **仍须人工 / 未测** | 尚未书面确认的场景；**若本块非空 → 不得标「已通过」** |

4. **禁止的关单姿态**

   - 仅凭本地或 CI **e2e / smoke 全绿**标「已通过」  
   - 写「相关 e2e 已覆盖」却**不列**锁了哪些场景  
   - 把部分场景 OK（或单侧视口 OK）写成整行「已通过」，却不写未测项  
   - 用 §7 Bug close 的「绿（CI）」代替本表人工关单（§7 是「已修复」话术门禁；**本表「已通过」另须本条 + tip 人工**）

5. **chrome / 双视口行**另遵守文首 N20/N24：须注明 375 故事与宽屏故事是否测过；单侧 OK 不得单独关单。

**合格关单附注示例**（可压缩，但三块都要有）：  
`关单覆盖分工 · e2e：… · 人工：…（tip \`abc1234\`）· 未测：无`

**不合格（禁止）**：  
`e2e 已绿 → 已通过` / `测试 OK → 已通过`（无 tip hash、无覆盖分工）

---

## 功能清单

> 首次回溯盘点：2026-07-18。凡用户从未书面确认「已通过」的 UI 项一律标「待人工测试」。
> **列约定**：`测试步骤` = 怎么测；`用户反馈` = 用户书面测试意见（日期 + 原话要点；`release-blocker` 另含 open-blocker 锚点）。`严重度` / `处理承诺` = 缺陷分级（见文首「缺陷分级与处理承诺」）；无缺陷填 `—`。测试步骤与用户反馈禁止混写。  
> **行号**：本表各行号供文首 §A / §B 索引跳转；改表后须同步更新 §B「功能清单行号」列。

| 功能 | 类型（UI可见 / 纯后端） | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| 标「已通过」覆盖分工门禁（`qa-pass-coverage-split`） | 纯后端 | 仅单元测试覆盖 | `npm run rules:doc-check`：topic `qa-pass-coverage-split` SSOT 在本文件「标「已通过」门禁」；禁 e2e 绿单独关单等矛盾短语。关单须写 e2e 已锁 vs 人工已覆盖；regression-lock 摘要硬拦。 | — | — | — | `TEST_TRACKER` 标已通过门禁 · `RULES_INDEX` · `rules-authority-registry.js` | 2026-08-02 |
| `.ft-session-lock` occupancy 占用态字段 | 纯后端 | 仅单元测试覆盖 | `node --test scripts/check-worktree-occupancy.test.js`：`active`/`releasable` 解析；缺字段/非法值不得当成可接管。`npm run check:worktree-occupancy` 打印 `lock_occupancy`；`releasable`+干净树可不因锁 exit 2。政策见 `WORKFLOW.md`（`git-worktree-occupancy`）。 | — | — | — | `scripts/check-worktree-occupancy.js` · `WORKFLOW.md` | 2026-08-02 |
| 自动化 Task 2 · 场景 E/F 逻辑进 smoke | 纯后端 | 仅单元测试覆盖 | `npm run test:smoke`：含 smoke E（Offline 舒展暂停/墙钟/无 Re-focus）、smoke F（AcrossTools 一次 idle + 活动重置）；并入 `MindfulReminderController.test.js` + `AcrossToolsIdleGuard.test.js`。真实切页/30min toast DOM 仍人工。 | — | — | — | `scenario-smoke` E/F · `package.json` test:smoke | 2026-07-30 |
| 自动化 Task 3 · Honesty 真实补登→桥接→Arrival e2e | 纯后端 | 仅单元测试覆盖 | `npm run test:e2e:changed -- e2e/honesty-bridge-real-path.spec.js`：入口→时长→`?honestyBreathMs=1500` 呼吸→桥接 Yes→`#arrival-practice`；No→Idle 且无 Arrival。**禁止** `__honestyBridge` 注入。叠层/375 tip 仍见 `micro-ritual.spec.js` 注入用例。单测：`resolveHonestyBreathMs`。 | — | — | — | `e2e/honesty-bridge-real-path.spec.js` · `?honestyBreathMs=` | 2026-07-30 |
| 响应式 Task 3 · 窄宽单代码线（总验收） | UI可见 | 有问题 | **关单级**（只认 `origin/develop` tip + freshness behind=0）。**禁止**与场景 O 修混验。**§8 375 故事最小集**（Idle 三球+抽屉、Sit→Arrival→Focusing HUD、Breath 藏 Sit、? 补救、tip 邻接、Honesty/微仪式）。**§9 W1–W8**（清场：现目标壳为宽屏三球+⋯；Sit 全路径、Arrival 藏壳、⋯ 代理 Honesty/How/Sound/提醒、? remap、邻接、Focusing、桥接/Rise）。**断点** 375↔480（见上行 Facade 行）。自动化：编排/facade 单测 + smoke ≠ 关单。 | **2026-08-01 用户书面**（`origin/develop` tip `db492fc` · behind=0 · **未与场景 O 混验**）：**断点烟测 A 全 OK** — (1) ≥900/`?product=1` Idle 见宽屏三球+⋯（`#ft-wide-home-ctas` / `#ft-wide-more-btn`），非旧 Sit+⚡ pill；(2) 375×667 窄屏三球+底栏抽屉、无双壳叠点；(3) Companion/How 打开时改宽**未被误关**（附图）；(4) Rise→回 Idle 壳仍正常。**尚须**：§8 375 故事最小集 + §9 W1–W8（断点 A ≠ 关单）。 **2026-08-01 用户书面 §8 375**（产品对齐 tip `db492fc`；文档 commit `40f8ed6` 无运行时差 · behind=0 · **未与场景 O 混验**）：S1/S1b/S2/S2b/S4 OK；窄屏 Idle 三球顺序 Quick·Sit·Honesty、Arrival 仅留 Quick OK。S3/S5 **有小故障**。用户口径：标 OK=基本 OK，同批相关 Bug 仍须修。 **Bugs**：①图1 宽屏 ⋯ 行内脉冲点全部弹出「Tap to sit with Yin」→应删误绑点；图3 窄屏 Sit options 无脉冲点→应补。②图2 窄屏 Focusing 点 ? → 一堆不相关 hints。③每次 Rise 后短暂闪旧「Sit with Yin」橙色按钮→应删闪现。④图4 Honesty 呼吸完成后短暂出桥接无加载动画且很快恢复；三球叠层挡部分 Yes/No。 **尚须**：修 Bug 后复测相关 §8 + §9 W1–W8。 **2026-08-01 用户书面 §9 宽屏**（behind=0 · 现行壳三球+⋯ · **未与场景 O 混验**）：W1/W2/W4/W6/W7/W8 OK；Rise 后再见三球 OK；宽屏 Idle ⋯ 在 OK；抽屉进呼吸无 sit tip / Sit 藏 OK。W3 **不对**；W5 **有问题**。抽屉♪/重复菜单项无需测（早已删）。 **Bugs 增补**：①图1 宽屏点 ? → 用途卡「What this space is for」漂到右侧、相对左下 ? **乱指**（曾正常）。②宽屏 Rise 后短暂闪旧一列按钮（含 Sit with Yin 橙钮）再消失（同 §8 Bug③）。③图2 Choose 后立刻露出 Sit/Honesty/⋯；Arrival/Breath（含 Choose→三选一）应**仅 Quick**。④图3 呼吸中点 ? → 一堆乱象（同族 Focusing/? 补救）。 **工作流根因（W5 · 查证）**：非神秘回潮——(a) `resolvePurposeCardAwayFromTips` 遇 tip 碰撞优先右移，点 ? 多 tip 时用途卡被推到右下；(b) e2e `wide-idle-more-menu`「? remedy…near ⋯」**故意 `purpose.hidden=true` 再验 tip**，只锁 tip↔⋯ 近距、**不锁**用途卡↔?；(c) 2026-07-31 宽屏三球换宿主后 tip 更密，碰撞避让更易把卡推远——「曾正常」对应三球前/少 tip 布局；属 **假绿 + 改宿主未锁用途卡邻近**（对齐 DEV_WORKFLOW §8.2 / N25 类）。W3 代码侧：`onReady` 关 Arrival 后 `keepQuickStart` 解除，Companion 展开前已回全套 idle 球；宽屏 `onExpandedChange` 只加窄屏 `ft-narrow-stage-companion`、**未**压宽屏球。 **2026-08-01 用户书面**：宽屏改后「375 一眼不回退」（三球+抽屉、未回旧壳）— **测试 OK**。 **2026-08-01 用户书面**：宽屏 Honesty 呼吸中仍三球（应仅 Quick）— 并入 chrome Bugs。 **2026-08-01 本地修（`fix/chrome-only-quick-and-rise-flash`）**：W3/Honesty 仅 Quick + Rise 闪 Sit 时序；待人工复测主路径+回流。脉冲点 / Hints / 续播 / W5 假绿未改。 | legacy-unclassified | legacy · 暂不进逾期扫描；发布前人工过目 | `?product=1` · Brief `task-responsive-single-chrome-line.md` · PR #31–#33 | 2026-08-01 |
| `IdleChromeFacade` 窄宽统一入口（Task 3 阶段 2） | UI可见 | 待人工测试 | **主路径**：`?product=1` 宽屏 Idle 见三球+⋯（非旧 Sit+⚡ pill）；375 见三球+抽屉；handlers 共用。**断点**：DevTools 375↔480 来回 — 无双壳叠点；Companion 打开时改宽度**不得**被误关（release 不调 onClearStage）。**回流**：Rise 后再 Idle。自动化：`IdleChromeFacade.test.js` + `e2e/wide-idle-more-menu.spec.js` + smoke；**须人工锁**断点路径。完整 §8+§9 见上行总验收。 | **2026-07-30 用户书面**：宽屏「⋯」不见。→ 根因：Facade 早于 `#session-start-dock` 构造，`_build` 静默 return。已改 `_ensureBuilt`。**2026-08-01 用户书面**（tip `db492fc`）：断点烟测 A（含宽屏三球+⋯、375 无双壳、Companion 改宽不误关、Rise 回流）**测试 OK** — 阶段 2 断点人工锁过；完整关单仍看上行总验收 §8+§9。 | — | — | `?product=1` · `#ft-wide-more-btn` · `WideIdleMoreMenu._ensureBuilt` · PR #33 | 2026-08-01 |
| `idleChromeOrchestration` 窄宽共享编排（Task 3 阶段 1） | 纯后端 | 仅单元测试覆盖 | `npm run test:smoke`（含 `idleChromeOrchestration.test.js` + `sessionChromeSync.test.js`）：stage×viewport 角色可见性、壳投影、次要入口列表。已合 PR #32。 | — | — | — | `src/core/idleChromeOrchestration.js` · PR #32 | 2026-07-30 |
| `sessionChromeSync` 从 main 等价抽离（Idle 入口 + 叠层投影） | 纯后端 | 仅单元测试覆盖 | `npm run test:smoke`（含 `sessionChromeSync.test.js`）：`isHonestyPhaseBusy` / Idle 入口显隐 / `resyncSessionChrome` 投影。无 UI 变化。 | — | — | — | — | 2026-07-28 |
| Cloudflare Workers API 骨架（cloud/ stub） | 纯后端 | 待人工测试 | **主路径**：`cd focus-tiger/cloud && npm install && npm run dev` → `curl` 两个 POST（见 `cloud/README.md`）须返回固定 mock。**校验**：缺字段 → 400。**回流**：连续超限请求 → 429（阈值写死 60/min；内存限流）。**本步不测前端**（未接线）。请 review 暂定字段：`daily-message` 要 `locale`+`localDate`；`emotion-weight` 要 `emotionKey`+`sessionPhase`。 | — | — | — | `http://127.0.0.1:8787` · `cloud/README.md` | 2026-07-22 |
| UI Kit 设计实验（tokens + Web Components） | UI可见 | 待人工测试 | **主路径（产品舞台 v6）**：`http://127.0.0.1:8765/ui-kit/demo.html?v=20260721f`。**产品壳 Sit/Sound**：`npm run dev` → `/` 或 `/?product=1`，Sit with Yin / Rise / Sound 应为**蒲团橙**（非朱红）；How shall we sit? 仍暖米金。**回流**：开计时变 Rise 再回 Sit，色仍为橙。 | 2026-07-21：…v6。**同日书面**：同意产品壳 Sit 也改蒲团橙 → 已改 `#btn-focus` + Sound 同系 + PRINCIPLES/DESIGN；请硬刷新看产品壳。 | — | — | `/` · `/?product=1` · demo `?v=20260721f` | 2026-07-21 |
| Arrival Practice / Notice「What is present…」点选后 | UI可见 | 已通过 | Sit → Notice：点 Calm → 图标收起，**短句须能读完**（约 2.4s）再进呼吸。 | 2026-07-20：书面确认框收起 OK。**同日再反馈**：`a calm presence…` 来不及看就消失→已加长至 2.4s，请复测。**2026-07-20 晚**：用户书面「测试 OK」。 | — | — | `http://localhost:5173/` · Sit → Calm | 2026-07-20 |
| Arrival Practice / Choose 点头 pingpong→idle | UI可见 | 已通过 | Choose → **nod-bow pingpong**（正放鞠躬→倒放回坐姿）→ Companion 立刻可展；进出用 **约 1s 叠化**。 | 2026-07-20：用户要求加倒放 pingpong + 前后 1s 叠化。**2026-07-22**：用户书面 A 类开放行——Choose 点头 pingpong + 1s 叠化，**测试 OK**。 | — | — | `http://localhost:5173/` · Sit → Choose | 2026-07-22 |
| Arrival Practice / 抵达练习（Welcome → Notice → Breath → Choose） | UI可见 | 已通过 | Breath 推近；Choose 点头 + 坐垫光晕；Companion 马上可用；点头↔idle **1s 叠化**后再拉回视距。 | 2026-07-20：点头改 pingpong + CapCut 1s。**2026-07-22**：与 Choose 点头行一并书面 **测试 OK**（主路径观感）。 | — | — | `http://localhost:5173/` · Sit | 2026-07-22 |
| Arrival · 轻量气泡 + ⚡ Quick Start（去 Skip 双钮） | UI可见 | 已通过 | **对照** `ARRIVE_MOMENT_DESIGN.md` v2：Notice/Choose 为点图标+观察式短句，**非**重型模态。**本次**：去掉 Arrival 内 Skip / Skip — begin；UI 改为透明气泡/字幕+轻图标格；Sit 路径仍为 Welcome→Notice→Breath→Choose；快速开表改 **⚡ `#quick-start-focus`**（记忆 Companion 模式立刻 Focusing）。**主路径**：Sit → 见轻气泡（非大卡片）；**Arrival 开着时 Sit 隐藏**（防叠图标）→ Notice 点选 → 短句 → Breath → Choose → Focusing；⚡ 仍可见。**点外侧**：Notice / Choose **选择格**打开时，点框外空白须**取消仪式回 Idle**（不开表）；⚡ 仍可立刻开表。**§8 N18 / 375**：Notice 上若见 tip（如「A tap is enough…」），**点 tip 只关 tip、不关 Notice 选择格**（点空白仍取消）。**快速路径**：点 ⚡ → 立刻 Rise/Focusing。**回流**：Rise 后再 Sit 仍走完整 Notice/Breath；⚡ 再开表。 | **2026-07-24**…Sit 重叠已改。**2026-07-25 用户书面**：Notice/Choose 选择框应允许点空白消除 → 已补外侧取消；e2e 锁 Notice/Choose 外侧回 Idle。请硬刷新复测。 **2026-07-25 用户书面（5174）**：Sit→Notice / Choose **点空白取消回 Idle** — **测试 OK**。 **2026-07-25 场景 O 图1（375）**：点 tip 连带关 Notice — 已修 `outsideDismissGuard`；e2e `375 Arrival Notice: tip click closes tip only`（红→绿）。**须人工**：375 Sit→Notice→点 tip，选择格仍在。 **2026-07-25 晚用户书面**：气泡 UI + ⚡ + 图1 tip 只关 tip — **测试 OK**（含空白外侧；375 故事侧 tip 邻接）。 **2026-07-26 用户书面（375）**：Sit→Notice 后 Quick Start 球又丢失（底部空）。根因：三主钮上屏后 `setSuppressed` 整壳藏球；e2e 只锁宽屏 `#quick-start-focus`。已改 Arrival `keepQuickStart` + e2e `375 Arrival: home Sit hidden; home Quick Start stays`。状态改回待人工复测。 **2026-07-27 375：点 tip 只关 tip — 测试 OK**。 | — | — | `?product=1` · `#arrival-practice` · e2e A + 375 home QS · `#ft-narrow-home-quickstart` | 2026-07-27 |
| Sit with Yin 误开 Honesty / Mindful Check-in | UI可见 | 已通过 | 点 Sit → Arrival，不应开 Mindful Check-in。 | 2026-07-20：用户书面「测试 OK了」。 | — | — | `#btn-focus` | 2026-07-20 |
| 调试面板 · 全入库素材试播 | UI可见 | 待人工测试 | 右上角滚动列表：「入库素材（逐条试播）」应覆盖 manifest 全部序列（含 gaze / tea / ear / lotus / tilt-think 等）。点 `gaze-p*` 可单独验收抠图与背景跳动。正式 Idle 不应再自动张望。 | 2026-07-20：用户发现 Idle 突然东张西望+背景跳 → 已关自动变体并补全调试入口。**2026-07-21**：用户书面——正式 Idle **不**自动东张西望，测试 OK（本行其余「全入库试播/抠图」仍待测）。 | — | — | `#emotion-debug-ui`（勿加 `?product=1`） | 2026-07-21 |
| 一次性情绪时长标准（ack / light） | UI可见 | 待人工测试 | 调试面板抽查：`合十确认`≈6–7s；`sessionComplete`≈3.5s；`nodBow`/`stretchReminder`/`waveHello` 明显慢于旧版「一闪」。Celebrating 仍约 5s。 | 2026-07-19：用户要求统一时长带；不足则放慢/重复/正倒放。 | — | — | `#emotion-debug-ui` | 2026-07-19 |
| 14 套新抠图算法整批替换 | UI可见 | 待人工测试 | 用调试面板或对应触发点抽查：`palms-together`、`celebrate-dance-v2`、`session-complete`、`nod-bow`、`stretch-reminder`、`milestone-glow`、gaze-p1～p4、`yawn-stretch`、`breath-halo-hq`（已替 expand）、lotus-*。确认角色边缘无灰白斑/脏底，四角透明。 | 2026-07-19：用户用新算法重跑全部 14 套并统一重打包；旧版已全部替换。2026-07-20：`breath-halo-expand`→`breath-halo-hq`。 | — | — | `#emotion-debug-ui` · 路径见 `ASSET_INVENTORY.md` 增量表 | 2026-07-20 |
| Companion Mode / 陪伴模式三选一（Here & Now · Offline Space · Flow State） | UI可见 | 待人工测试 | **主路径**：① 冷启动 hint → **Here & Now / Flow** → Arrival → Choose → Companion 点选 Focusing。② **Offline** → 立刻 Focusing（无 Notice）。③ Sit → Choose → Companion 点选 Focusing。**回流**：Rise 后 hint→Here & Now / Flow → **立刻 Focusing**（门闩保持）；Sit 仍走 Arrival。**点外侧**：面板打开时点空白收起。**375**：鞠躬后三选一须在视口（非只剩 home 三球）。 | **2026-07-21**：Flow/Reading 鞠躬开表已修。**2026-07-22**：Safari Companion **测试 OK**。**2026-07-25**：外侧关闭；Offline 跳过 Arrival；L249 / Scenario J 回流门闩保持。**同日用户书面（5174）**：Companion 点选即开表 — **测试 OK**。 **2026-07-26 用户书面**：鞠躬后没有自动跳出三选一（回归）→ 见 L254；本地已回补 stage。 | — | — | 底部 Sit 旁 dock · **DOM** e2e A/A4/I/J/K + `375 Choose bow` · Safari 人工 | 2026-07-26 |
| Companion · Offline 禁止二次 Sit / 跳过 Arrival | UI可见 | 待人工测试 | **主路径**：How shall we sit? → **Offline Space** → **立刻 Focusing**；**不得**见「What is present right now?」Notice / Choose。**回流**：Rise → 再点 Offline 仍直接开表。**对照**：Here & Now / Flow 门闩未就绪仍走 Arrival。 | **2026-07-21**：Offline 禁止二次 Sit。**2026-07-25**：用户书面——Offline 出 Arrival 不对（离开哪有 Choose）→ 已改 `shouldSkipArrivalOnModeSelect`；e2e K 改「无 Arrival」。 | — | — | `?product=1` · e2e K · `#arrival-practice` | 2026-07-25 |
| Honesty Check-in / Mindful Check-in | UI可见 | 有问题 | **主路径**：零完成开局 → **Idle 闭目坐禅**（不是睡着）+ 可忽略提示（EN 含 `sitting with you` / `Quiet time elsewhere`；ZH 含「闭目同坐」「别处的静心」）。点提示 → 选时长 → **呼吸引导**（不播 dormant-wake）→ **toast「别处的静心，也算数」** + 桥接。**回流**：同日再补登走空闲 Mindful Check-in → 呼吸 → toast + 再出桥接。调试「睡着了」仍可试 Sleeping→dormant-wake。 | **2026-07-21**：用户书面——登录后第一幕不能是睡觉模样（not uplifting），须 Idle 闭目坐禅。已改零完成默认 Idle。**2026-07-22**：用户书面 A 类——Honesty 在 Idle 上的补登（非睡着）→呼吸→桥接，**测试 OK**。**同日晚**：用户拍板加成功 toast（对齐微仪式）；观感见下行。 **2026-08-01 用户书面**：Honesty 时长面板期间点 ? → `idle-after-session` 指虚空（见 ? 补救行）；流程本身未关单。 **2026-08-01 用户书面（宽屏图）**：Honesty 呼吸引导中底栏仍三球；应仅 Quick Start。重开（叠层 chrome）。 **2026-08-01 本地修**：Honesty UI busy → keepQuickStart（同 Arrival）；待人工复测。 | legacy-unclassified | legacy · 暂不进逾期扫描；发布前人工过目 | 零完成自动 · `#honesty-idle-entry` · DEV：`__honestyCheckIn` | 2026-08-01 |
| Honesty 补登成功 toast（`HONESTY_CHECKIN_RECORDED`） | UI可见 | 待人工测试 | **主路径**：Honesty 选时长 → 呼吸结束 → **立刻**居中 toast（EN `Quiet time elsewhere counts, too.` / ZH「别处的静心，也算数。」，约 4.5s）+ 桥接 Yes/No 同屏。**回流**：同日再补登仍出 toast；**abort**（pending 丢失）只出 `HONESTY_PENDING_LOST`，**不出**本句。375×667 看 toast 与桥接不互挡到不可读。 | 2026-07-22：用户拍板「成功也加轻量确认」；**单元/控制器** `HonestyCheckInController.test.js`（成功路径调 `notifyRecorded` / abort 不调用——**非** toast DOM 可见性）。**同日书面**：文案「现在的就挺好啦。不要改」——**锁定现稿，勿缩短**。观感/同屏仍待人工测。 | — | — | `?product=1` · `#mindful-acknowledge-toast` · 桥接 | 2026-07-22 |
| Honesty 桥接 CTA（补登后邀请再坐） | UI可见 | 有问题 | **主路径**：补登结束 → **立刻**出现（顶行 Welcome +「要不要现在也坐一会儿？」Yes/No）；成功路径另有记账 toast（见上行）。Yes → 完整 Arrival → Companion。No → idle。**回流**：同日再补登 → **应再出**桥接。**叠层（强制）**：桥接可见时 **不得**见 Honesty Check-in /「一分钟呼吸」叠在 Yes/No 上（入口隐藏 + 桥接 z18 > dock）；点 No 后两入口恢复。**Honesty 流程**：一点 Check-in → 入口即藏，直到桥接 Yes/No（或取消）才再出。 | 2026-07-19：立刻出现。**2026-07-20 晚**：完整 Arrival OK。**2026-07-22**：微仪式叠层已修；**同日再书面**——Honesty Check-in 仍挡 Yes/No → 已修（busy 贯穿桥接 + dock CSS + z18）；**DOM**：`micro-ritual.spec.js` bridge 行。**2026-07-25 用户书面（5174）**：Honesty 桥接叠层 — **测试 OK**。 **2026-07-26 CI 双红根因**：visibility e2e 用 `vite preview`（`DEV=false`）时 `__honestyBridge` 未挂 → `bridgeReady===false`；**非**产品叠层回归。已改为生产构建也暴露该 hook；e2e 仍是**注入**可见态（**非**真实补登路径；375 ActionBar+? tip 邻接另见该用例）。 **2026-08-01 用户书面（图4 · Task3 §8 S5）**：Honesty 呼吸完成后短暂出现桥接画面、无加载动画且很快恢复正常；三球叠层挡住部分后面 Yes/No 框。须复测叠层 suppress。 **2026-08-02 晚用户书面（图）**：桥接大文案框近乎不透明，挡住阿寅下半身/合掌/蒲团；记得有轻量半透明设计。**本地改**：`HonestyBridgeCtaUI` 改为 Arrival 式暖米半透明气泡（~0.62 + blur）；Yes/No 略实。 **2026-08-02 用户书面**：半透明桥接文案可读、阿寅下半身/蒲团透过可见 — **测试 OK**。同日拍板：项目内同类近乎不透明厚卡片一律改玻璃泡（见下行）。 | legacy-unclassified | legacy · 暂不进逾期扫描；发布前人工过目 | DEV/CI：`__honestyBridge` · `#honesty-bridge-cta` · `#honesty-idle-entry` | 2026-08-02 |
| Tiger Reflection Moment / 结束反思 | UI可见 | 已通过 | 正常完成或主动 Rise 结束会话 → 留白约 400ms（完成）/ 300ms（主动）后淡入面板。**意图回显**：仅当**本场** Arrival Choose 有内容时，Reflection 面板**顶部**立刻显示（icon：`所选方向：{text}` / typed：`所写方向：{text}`；文案含 emoji 如 `📖 Reading`）。**不是**第二次 Choose 时头顶提示。无 Choose / 点了 **Skip — begin** → 无回显属正确。Q1–Q3：Continue / Skip / Skip all / Esc。 | **2026-07-22**：用户书面——多日点 Reading 从未见回显。已改：Choose/`onReady` 立刻闩上 + 空 pending 不抹闩 + 回显样式加强。**回归锁分工**：**DOM 用户链路** e2e `reflection-intention-echo.spec.js` 锁主路径有/无回显（**非**本次 Bug）；**单元** `resolveSessionIntentionLatch: pending wins; empty pending must not wipe latch` 锁抹闩 Bug；**控制器集成** smoke C 仅锁 `SessionEndFlow`→`open` 入参（下游接线，**非** Choose 源头）。请硬刷新后：Sit→…→点 **Reading**（勿点 Skip — begin）→ Rise → 看面板顶米色条。 **2026-07-24 用户书面（硬刷新复测）**：① Sit → Reading → Rise → Reflection 顶条见 Reading — **测试 OK**；② Skip all → 再 Sit → Skip — begin → Rise → **不得**再有 Reading 顶条 — **测试 OK**。 | — | — | 会话结束后自动 · e2e `reflection-intention-echo.spec.js`（主路径 DOM）· 单元 `SessionIntentionStore.test.js`（Bug 锁）· smoke C（下游入参）· DEV：`__reflectionMoment` | 2026-07-22 |
| 完成反馈 · 每日首次 Celebrating | UI可见 | 已通过 | **须等计时自动达标**（勿提前点 Rise；达标后点 Rise 也会进完成反馈）。当日可先 Honesty 补登；**首次计时达标**仍须 Celebrating（Honesty 不占庆祝戳）。播 `celebrate-dance` → idle → Reflection。 | 2026-07-21：用户书面——多日多次 focus 超 1 分钟从未见 Celebrating 舞；已修。**2026-07-21 复测**：`/` 满 1 分钟见舞；`/?sessionMinutes=5` 满 5 分钟见舞。 | — | — | `triggerSessionCompletionFeedback` · 调试「庆祝跳舞」 | 2026-07-21 |
| 完成反馈 · 同日后续 SessionComplete | UI可见 | 已通过 | 当日**已播过** Celebrating 后，再跑一轮 1 分钟达标 → 只播 `session-complete` 摆尾，**不**再 Celebrating。 | 2026-07-21：同 Celebrating 行用户反馈；庆祝戳已解耦。**2026-07-21 复测**：`http://localhost:5173` 同日第二次 1 分钟达标 → 只撅屁股摆尾、不再 Celebrating 舞；测试 OK。**同日晚**：`/?product=1` 再次确认同日第二次满 1 分钟 → 摆尾、非跳舞；测试 OK。 | — | — | 同上 · 调试「完成摆尾」 | 2026-07-21 |
| IncenseComplete / 今日一炷香（莲花+金斑） | UI可见 | 已放弃/不适用 | **业务会话结束未接线**，正式路径看不到；**不再排人工验收**，不挡合并。调试面板「模拟一炷香」可自愿预览（DOM 莲花+金粒子；水印已清），效果保留给 Backlog 成长场景复用，勿删实现。 | 2026-07-19：建议保留效果给荷花成长场景。同日清 PixMiller 水印。**2026-07-25**：用户拍板降级——业务未接线 →「已放弃/不适用」，退出近期验收队列。 | — | — | `#emotion-debug-ui` · `playEmotion('incenseComplete')` · 实现：`IncenseGreeting.js` | 2026-07-25 |
| MilestoneGlow / 里程碑金辉 | UI可见 | 待人工测试 | **主路径（产品壳）**：连续练习至第 **7** 天（当日计时达标或 Honesty 补登）→ 播 `milestone-glow` 金辉+蝴蝶（非 Celebrating 舞）；同节点永不重复；与首次 Celebrating 同刻只播 Glow、庆祝戳仍记。**回流**：第 8 天达标 → 正常 Celebrating/SessionComplete。调试面板预览仍可用。自动化：`MilestoneGlowStore.test.js` + `pickMilestoneGlowVariant` 单测 + `e2e/milestone-glow-product.spec.js`。 | **2026-07-31**：正式路径接线（Brief）。旧「仅调试 / 7-30 复测」废止。 **2026-08-03**：变体池——streak-7 仍本行蝴蝶；21/100 见下行星石。 | — | — | `?product=1` · `__milestoneGlowStore` · Brief | 2026-08-03 |
| MilestoneGlow · 琉璃星石变体（meditation-star-reward） | UI可见 | 待人工测试 | **实验室**：本分支 Vite →「里程碑琉璃星石」。**须见**：不抠图整幅 + 镜头 **100% → ≈145.45%（16/11）** 刚好顶满 16:9 宽度。合入后关单级验收须在 `origin/develop` tip。 | **2026-08-03**：抠图不行→不抠图；要拉近→playbackZoom；终点 16/11。 **同日用户书面（5175 · feature tip）**：不抠图 + 拉近顶满宽 — **测试 OK**。（非 `origin/develop` tip，**不**据此关单。） | — | — | PR #89 · `#emotion-debug-ui` | 2026-08-03 |
| 375 既有 e2e 红（Sit tip + 抽屉挡 ♪） | UI可见 | 待人工测试 | **已修代码**：A) `onBreathStart` 在 `isOpen()` 后才 `syncOnboardingAutoHints`（原先 `beginMicroRitualChrome` 过早 sync，breath 期间仍留 `sit-button`）。B) ActionBar `z-index` 高于抽屉 backdrop；点 ♪ 先 `closeSheet`；e2e 去掉 `force: true`。**主路径（375）**：抽屉开 → 点 ♪ → Soundscape；抽屉进呼吸 → 无 `sit-button` tip、Sit 隐藏。**回流**：关面板 / Leave 呼吸后再开抽屉。自动化：`micro-ritual.spec.js` + `weekly-practice-heatmap.spec.js`。 | — | — | — | `fix/375-…` · Brief `fix-375-e2e-reds.md` | 2026-07-31 |
| MindfulAcknowledge / 20 分钟阶段确认 | UI可见 | 待人工测试 | Companion = Here & Now，开一场会话并保持页面 ≥ **20 分钟墙钟** → `nod-bow` + 非模态 toast（`MINDFUL_FOCUS_MILESTONE` 池）。与强反馈冲突时静默让位。共享日额度最多 3 次（`focus-tiger.reminder-quota.v1`）。演示会话仅 1 分钟时建议用调试按钮或 `__mindfulReminderController`。 | — | — | — | 生产长计时 / 调试面板正念确认 · DEV：`__mindfulReminderController` · `__reminderQuotaManager` | 2026-07-18 |
| Re-focus Acknowledge / 回归确认 | UI可见 | 已通过 | **用户路径**见场景 B：开 **`/?sessionMinutes=5`**。**Here & Now**：切走 **&gt;60s** → toast + nod-bow。**Flow State / Offline**：同样切走 **&gt;60s** → **不应**出现 Re-focus（离开是预期）。**&lt;20s 无反应属正确**。 | 2026-07-20 晚：DEMO/10s 门槛说明。**2026-07-21**：用户书面 Sit/Here&Now 切页 **测试 OK**；Flow State「结果不对、不匹配」→ 产品预期即与 Here & Now **不同**：Flow **故意无**文案+nod-bow。**同日晚**：用户确认原 8 条独立行批次全部关闭。 | — | — | `/?sessionMinutes=5` · **单元/控制器** smoke B（**非**真实切页） | 2026-07-21 |
| stretchReminder / 舒展提醒 | UI可见 | 待人工测试 | 会话活跃累计满 **2 小时**（离开暂停；两场间隔 ≥30 分钟重置）→ `stretch-reminder` 17 帧 + toast。占共享日额度。演示短会话建议调试面板触发。 | — | — | — | 调试面板 / 生产长计时 · DEV：`__mindfulReminderController` | 2026-07-18 |
| Ambient Soundscape / 静音图标 + Sound | UI可见 | 有问题 | **静音 / 开播**：右上米色圆形 **音符钮**（关=可点开播；在播=音符+斜杠，点一下静音）。**Sound**：右下蒲团橙 **Sound** **始终可见**；**Sit 开计时后**可展开曲目/音量；未专注点 Sound 会提示先开始专注。**主路径**：**登录/打开后默认无音乐**（须点音符才播；默认曲目仍 Mer-Ka-Ba）；专注后 Sound 换曲。**回流**：关→刷新仍关；**Rise / 达标结束 → 自动停播**；再 Sit **不**自动再开。 | **2026-07-20**…**2026-07-21 晚**：开关 OK。**2026-07-25**：用户拍板 Rise 后**自动停播**；同日再拍板 **opt-in（不默认播）**；**须复测**。 **2026-07-25 晚用户书面**：Rise 停播 + ambient opt-in（不默认播）— **测试 OK**。 **2026-07-29 用户书面（图）**：右上音符点击效果须与菜单 **Sound** 一样（开面板）；窄/宽均修；宽屏若音符类按钮重复则只留右上 → 见下行。 **2026-07-30 用户书面（图）**：Focusing 下选 Meditation Impromptu 等曲目后仍无声；疑 play() 失败仍 wantsEnabled（斜杠）或静音/手势解锁缺口。 **2026-08-01 用户书面（P1-4）**：Focusing 选曲可闻等大体 OK；音符静音后再点为**重播**非续播（并见右上音符行）。 | legacy-unclassified | legacy · 暂不进逾期扫描；发布前人工过目 | 右上 `.ambient-soundscape__mute` · 右下 `.ambient-soundscape__fab` · `AmbientSoundscapeController.test.js` | 2026-08-01 |
| Ambient · Aakash Gandhi 曲目入库（含 Frozen in Love） | UI可见 | 待人工测试 | **主路径**：`?product=1` → 右上音符开面板 → 见 **Dreamland / Invisible Beauty / Kiss the Sky / Frozen in Love**（另有 Mer-Ka-Ba、Meditation Impromptu）→ 选一曲应可闻。**回流**：Off / Rise 停播。 | 2026-07-30：用户同意另开分支入库（YouTube Audio Library · Aakash Gandhi）。 **2026-08-01**：另入库 **Frozen in Love**（`frozen-in-love` / `frozen-in-love-aakash-gandhi.mp3`）进默认清单；须人工：面板见该曲可播、Off/Rise 停播。原三曲行扩展为四曲。 | — | — | `.ambient-soundscape__panel` · `/audio/ambient/*-aakash-gandhi.mp3` | 2026-08-01 |
| Ambient · ⑤⑥⑩ mute/续播/Focusing 可闻 e2e | 纯后端 | 仅单元测试覆盖 | `e2e/ambient-mute-resume-focusing.spec.js`：宽+375 有声→音符静音→再点续播；宽 Focusing 选曲可闻。生产构建暴露 `__ambientSoundscape`。**根因（375）**：ActionBar ♪ 曾只调 `activateSoundFromNarrow`（只开面板）→ 已改 `openSoundPanelFromNote`。本地红→修后交 CI 绿。 | — | — | — | `ambient-mute-resume-focusing.spec.js` · `main.js` onSound | 2026-07-31 |
| 用户上传氛围乐（v1.0 必交付） | UI可见 | 待人工测试 | **主路径**：`?product=1` → 右上 ♪ 开面板 → 见「仅本机」提示 + **Add your music** → 选 **mp3/m4a** → 曲目出现在 **Off 下、内置曲之上**（最近在上）并可闻选播 → × 仅删自传。**回流**：刷新后用户曲仍在；删后再刷新须消失；超 10 首 / 合计 64MB / 单文件 20MB → 温和错误、不静默。**375**：面板可滚动、不溢出。自动化：`UserAmbientLibrary.test.js`；`test:e2e:changed -- e2e/user-ambient-upload.spec.js`。 | 2026-07-31：升格 v1.0 必交付；Brief `task-user-ambient-upload-v1.md`。 **2026-08-01 用户书面（P1-5）**：上传 mp3/m4a、列表上方可播、刷新仍在、删后消失、375 可滚 — **测试 OK**。同场图：Soundscape 开着时仍出 sit tip「タップしてYinと坐る」叠在面板上（见 ? 补救 / Hints 根因）。 | — | — | `?product=1` · `#ambient-upload-btn` · `[data-user-track]` | 2026-08-01 |
| 右上音符开/关声景（菜单已删 Sound） | UI可见 | 有问题 | **主路径（375）**：ActionBar ♪ → Soundscape 选曲面板；FAB 不可见。**Focusing**：ActionBar 常显，点 ♪ 同样开面板。**主路径（≥480）**：右上音符 → 开面板；有声再点 → 静音。**曲目记忆 + 续播**：选曲有声 → 点音符静音 → 再点音符 → 面板仍高亮该曲 **且自动续播有声**（同一次点击手势）。面板显式 Off 不续播。**回流**：Rise 停播口径不变。 | **2026-07-29**：rebase / e2e note opens。 **2026-07-30 用户书面（图4）**：删菜单 Sound；有声再点关乐。 **2026-07-30 再书面**：高亮对了但再开面板无声 → 静音后再开须 `unmute` 偏好曲。 **2026-07-30 再书面**：右上角音乐按钮表现一切正常 — **测试 OK**（本行其余「曲目记忆+续播」若未再走仍可自愿补测）。 **2026-08-01 用户书面（P1-4）**：Focusing 选曲可闻、开面板、静音、Rise 停播等 **其它 OK**；但静音后再点音符是**重播**而非**续播**（契约写续播）— **有问题**。 | legacy-unclassified | legacy · 暂不进逾期扫描；发布前人工过目 | `?product=1` · `#ft-narrow-mute-btn` · `.ambient-soundscape__mute` · `.ambient-soundscape__track.is-selected` | 2026-08-01 |
| ⋯/抽屉菜单删除 Sound + 行内薄荷绿 | UI可见 | 待人工测试 | **主路径**：清空 hints → 开 ⋯/抽屉 → **无 Sound 行**；Honesty/呼吸/How/提醒旁见薄荷绿脉冲。音乐仅右上音符：未播→开面板；**可闻播放中再点→关音乐**。宽屏 ? more tips：折叠为 `wide-more-menu`（对等窄屏抽屉说明）。 | **2026-07-30 用户书面（图4）**拍板删除重复 Sound；菜单项须薄荷绿；有声再点关乐。 **2026-08-01 用户书面（图1/图3 · Task3 §8）**：宽屏 ⋯ 菜单红框脉冲点全部是「Tap to sit with Yin」→应删除误绑点；窄屏 Sit options 抽屉右侧无脉冲点→应补上。 **2026-08-02 用户书面（日语 · 宽屏 ⋯）**：每一项仍多不需要的脉冲点 hint（附图红框）；追问昨日 Bug 为何未修。**工作流根因（查证）**：08-01 已记入本行+总验收「有问题」，同日 `fix/chrome-only-quick-and-rise-flash` 明文留下「脉冲点 / Hints …未改」——**记入 ≠ 开修**；之后欢迎 CapCut / e2e Plan A 抢排期，**无**专修 `fix/*`，故 tip 仍见。 **2026-08-02 拍板+本地修（B）**：只去误绑/双重，**保留**未读行内 `.ft-secondary-menu-hint-dot`；⋯/抽屉打开时 click hint 不再叠浮动 badge；`resolveAnchorEl` 仅允许「该 hint 所属 proxy」抢菜单锚；行上悬停预览。e2e `wide-idle-more-menu` 锁双重+Sit tip 不叠菜单。**须人工**：清空 hints→开 ⋯→每行仅一薄荷绿、悬停 How 出正确 tip、非 Sit。 **2026-08-02 用户书面**：点「清空引导提示已读」没反应、以为修无效。核对：当时 `127.0.0.1:5173` 仍是主仓 develop（无本修）；且该钮只在**无** `?product=1` 的实验室页出现。已补清空 toast + 开着的 ⋯/抽屉重绘 mint。验修请用本分支 Vite（勿混主仓 5173）。 **2026-08-02 用户书面（5175）**：上三行未读 mint OK；悬停切换仍闪 Tap to sit；末行 Language 无 mint（产品本无）。已压 ⋯/抽屉打开时 sit-button / idle-after-session auto。 **2026-08-02 用户书面（5175）**：硬刷新后开 ⋯、各行间来回悬停 — 下方不再闪 Tap to sit — **测试 OK**。上三行未读单点 + Language 无点（设计）一并确认。 **2026-08-02 流程纠正**：他会话据 5175（非 `origin/develop` tip）书面 OK **笼统标「已通过」**——缺覆盖分工明示，且违反 `qa-develop-tip`；按 `qa-pass-coverage-split` **撤回关单**，改回「待人工测试」。用户 OK 反馈保留。关单前须在 tip 复测并写清：e2e 已锁（`wide-idle-more-menu`：双重 mint；⋯ 展开未 hover 时 Sit/`idle-after-session` tip 不可见；breath/companion/reminder 悬停对应 tip；Language 无行 tip 且不漏 Sit；行间切换全程无 Sit tip）vs 人工（Safari 宽屏开 ⋯、行间来回悬停不闪 Tap to sit、上三行 mint、Language 无点；可选 375 抽屉对称）。未宣称：窄屏抽屉全矩阵 / 触屏无 hover 路径。 | — | — | `#ft-wide-more-menu` · `.ft-secondary-menu-hint-dot` · `.ambient-soundscape__mute` | 2026-08-02 |
| EyeTracking / 正式瞳孔 PNG | UI可见 | 已放弃/不适用 | 运行时已卸下 `pupil-left/right` 叠加跟随；调试勾选已移除。Idle 张望 gaze-p1～p4 **不受影响**。**不再排人工验收**。 | 2026-07-19 实测错位；**已决定放弃**。**2026-07-22**：状态改为「已放弃/不适用」（不挡合并）。结论见 `CORE_LOOP.md`。 | — | — | 已废弃 · `/textures/eye-pupils/` 可不接线 | 2026-07-22 |
| PointerInteraction · 靠近点头 nodGreeting | UI可见 | 已通过 | **默认靠近不再点头**。开局 / idle：指针移入靠近区 → **不应**播 `nod-greeting`。调试面板「点头致意」仍可手工播（**6 fps**，末帧多停约 2 拍）→ 回 idle。 | 2026-07-19：曾要放慢点头→已改。**同日再反馈**：开局默认态仍见点头 → 根因是靠近区仍自动 `nodGreeting`；已拆除靠近自动点头。**2026-07-21**：用户书面——默认只有呼吸/眨眼、靠近不再自动点头，测试 OK。 | — | — | 全屏命中层 · DEV：`__pointerInteraction` · 调试「点头致意」 | 2026-07-21 |
| idle / 坐禅闭眼呼吸基底 | UI可见 | 已通过 | 点「坐禅闭眼」或「重置并 idle 坐禅」：**闭目 pingpong ×2**（frame 1–19）→ **睁眼弧 pingpong ×1**（frame 1–33）→ 往复；同素材硬切、不叠化。 | 2026-07-20：切分两段 pingpong。**2026-07-20 用户书面**：坐禅闭眼 / idle 坐禅各情况测试 OK。 | — | — | 调试「坐禅闭眼」 · `__idleOrchestrator` · `#dev-reset-all-local-state-idle` | 2026-07-20 |
| PointerInteraction · 静止好奇 curiousTilt | UI可见 | 待人工测试 | 靠近区静止 **4s** → 播 **blink-smile** 单次（已替换托腮 tilt-think）→ 180ms 淡回 idle。冷却 6s。 | 2026-07-19：打坐↔托腮仍很跳→已换眨眼类；请确认衔接是否顺。 | — | — | 全屏命中层 · DEV：`__pointerInteraction` | 2026-07-19 |
| PointerInteraction · 抚摸 / 轻点 / 绕圈（检测已接线、无正式精灵） | 纯后端+占位 | 不挡合并（仅检测逻辑） | **无正式 2D 精灵**；产品壳**不**排视觉验收。检测：头部拖动 ≥14px → `petHead`；头部点击位移 ≤10px → `smileSquint`；约 1.4s 内绕圈 ~1.75π → `dizzyBlink`（控制台占位）。正确性靠 `PointerInteraction.test.js`；自愿可在实验室看 console。 | **2026-07-25**：用户拍板降级——仅验证检测逻辑，不挡合并；退出近期验收队列。 | — | — | 单测：`PointerInteraction.test.js` · DEV：`__pointerInteraction` | 2026-07-25 |
| FocusSession + Focus HUD（Sit with Yin / Rise） | UI可见 | 待人工测试 | **主路径**：Sit → Welcome→Notice→Breath→Choose → Focusing；或 **⚡ Quick Start** → 立刻 Rise。**回流**：Rise → Reflection → 再 Sit。 | 2026-07-20：Skip begin 半卡 Sit→已改为直接开始。**2026-07-24**：Skip 双钮移除，快速开表改 ⚡；请复测。**DOM**：e2e A Choose 开表；A2/A3 预选+⚡ 开表。 | — | — | `#focus-hud` · `#btn-focus` | 2026-07-20 |
| FocusHUD 金环+呼吸光 / 数字弱化 | UI可见 | 已通过 | **主路径**：左上角约 **2×** 大卡：金环（琥珀金、够显眼）+ 中心光点**持续一张一缩**；Sit 后环随进度走。**悬停**露 Focus %。**回流**：Rise 后环回淡。 | 2026-07-21：香炉误读→改金环+光点。**同日书面**：①圈/点看不清 ②呼吸点应不停一张一缩 ③整体太小、建议放大两倍 → 已加对比、加强呼吸、约 2×。**2026-07-22**：用户书面 A 类开放行，**测试 OK**。**单元**：`focusHudHalo.test.js`（`focusLevelToHaloVars` 填充分数→透明度映射；**非**金环/呼吸光 DOM）。e2e Companion 仅顺带断言 `#hud-state`/`#hud-time` 文案（**非**金环观感）。 | — | — | `#focus-hud` · `/?product=1` | 2026-07-22 |
| FocusHUD 今日同坐 progress-bar | UI可见 | 已通过 | **主路径**：HUD 下方见蒲团橙软条 + 文案「Today's shared sitting / 今日同坐」；空日接近空；Sit 计时中条渐长且有**轻脉冲**。**回流**：Rise 后脉冲停；若本场未达标完成则条回落至已完成分钟。勿与 Companion 三选一抢「怎么坐」。**非** daily-quest 清单。 | 2026-07-21：UI Kit progress-bar 纳入产品壳。**2026-07-22**：用户书面 A 类，**测试 OK**。**单元**：`sharedSittingProgress.test.js`（百分比映射 helper；**非** progress-bar DOM / 脉冲观感）。 | — | — | `#focus-hud progress-bar` · `/?product=1` | 2026-07-22 |
| FocusHUD streak-meter 近日同坐 | UI可见 | 已通过 | **主路径**：HUD 右侧小 7 点环；空日点仍可见（浅描边）；达标/Honesty 记账后多亮一点（非 Day N 计分牌）。**悬停**见浮层「Recent days… / 近日同坐的日子」（须盖在「今日同坐」条之上、**整字可读、y/g 下沿不得裁切**）。满 7 点短金息。**回流**：重置本地后环回空心点。禁止断签焦虑文案。点击无单独动作（悬停说明即可）。 | 2026-07-21：UI Kit streak-meter 纳入。**2026-07-22**：用户书面 A 类，**测试 OK**。**单元**：`PracticeDaysStore.test.js`（多日数据 / streak 计数；**非** 7 点环 DOM）。**2026-07-25 用户书面**：timer「蓝点」悬停/点击无反应 → 查证为近日同坐 7 点悬停文案被 progress-bar 盖住；已改为浮层 + host z-index + 空心点对比；e2e `focus-hud-hover.spec.js`。**同日复测**：金环 Focus % **测试 OK**；7 点浮层「部分字显示不全」（y/g 下沿被裁）→ 文案移出 `.wrap` + overflow visible。**同日晚**：`5174` 曾挂旧 worktree → 已改挂当前分支。**同日再书面（5174）**：米色小卡片浮层 + y/g 下沿完整，**测试 OK** → 关单。 | — | — | `#focus-hud streak-meter` · `http://127.0.0.1:5174/?product=1` · e2e `focus-hud-hover.spec.js` | 2026-07-25 |
| 「?」朱砂 notification-badge | UI可见 | 已通过 | **主路径**：新用户左下「?」角有朱砂小红点；点一次「?」后红点消失且不再常驻。**回流**：DEV 重置 hints 后再见红点。勿做成常驻角标噪音。 | 2026-07-21：稀缺强调色。**2026-07-22**：用户书面——朱砂红点「用于系统里面的通知，或者 alert 之类的」（未标测试 OK；现实现仍挂 onboarding「?」未读）。**同日再书面**：问号朱砂点表示未读「完全可以，就请保留」→ **保留现实现**，不改挂。 | — | — | `#onboarding-hint-help` · `/?product=1` | 2026-07-22 |
| FocusHUD streak-meter 近日同坐 | UI可见 | 已通过 | **主路径**：HUD 右侧小 7 点环；空日全暗；达标/Honesty 记账后多亮一点（非 Day N 计分牌）。悬停见「Recent days… / 近日同坐的日子」。满 7 点短金息。**回流**：重置本地后环回空。禁止断签焦虑文案。 | 2026-07-21：UI Kit streak-meter 纳入。**2026-07-22**：用户书面 A 类，**测试 OK**。**单元**：`PracticeDaysStore.test.js`（多日数据 / streak 计数；**非** 7 点环 DOM）。 | — | — | `#focus-hud streak-meter` · `/?product=1` | 2026-07-22 |
| 「?」朱砂 notification-badge | UI可见 | 已通过 | **（2026-07-30 交互改版）** `help-affordance` 改为 **click** 薄荷绿脉冲圆点（`tone="hint"`），不再挂「?」内朱红角标。**主路径**：清空已读 →「?」旁见薄荷绿圆点脉冲 → 点圆点展开 tip；或点「?」进补救并记已读。 | 2026-07-21：稀缺强调色。**2026-07-22**：用户书面保留朱砂表示未读。**2026-07-30**：onboarding click 线索改薄荷绿（避免与错误/警告朱红混淆）；朱红仍留给真正通知。 | — | — | `#onboarding-hint-help` · `.onboarding-hint-badge` · `/?product=1` | 2026-07-23 |
| Onboarding hints · click 圆点 tier（peeked/static/done） | UI可见 | 待人工测试 | **桌面对比反例（必测）**：① 清空已读 → How shall we sit? 旁见**脉冲**圆点（约 8–10px）。② 悬停或点圆点看 tip → 点外部关框 → 圆点**静止弱化**（约 5–6px、半透明、不闪）=`peeked`，**不得消失**。③ 再点 How shall we sit? 展开三选一 → 圆点**彻底消失**=`done`。④ `help-affordance`：点圆点见 tip+「了解此空间」仍脉冲；点 CTA 或「?」开简介卡后圆点消失。**触屏（无 hover，必测）**：⑤ simple：点圆点 = 预览；点外部或点文字框 = 关框 + peeked 静止弱化；再点对应控件完成操作 = done 消失。⑥ detailed：第一次点圆点 = 预览（仍脉冲）；点预览内「了解此空间」或**再点圆点** = 开简介卡 + done 圆点消失；仅点外部关预览 → **仍脉冲**（不算 done）。**键盘 / 读屏（必测）**：⑦ Tab 到圆点 = 与 hover 同等打开预览；⑧ simple：Enter/Space（气泡或再次圆点）或 Esc/失焦 = 关框 + peeked；再 Tab 到 How shall we sit? 并激活 = done。⑨ detailed：Tab 预览后 Esc = 只关预览仍脉冲；预览打开时 Enter（圆点）或 Tab 到 CTA 再 Enter = 简介卡 + done。**回流**：实验室清空已读后脉冲复现。无触屏/键盘 e2e——本行即人工锁。 | — **2026-08-01 用户书面（P1-1）**：实际为悬停出 tip、鼠标挪开 tip 自然消失 — 用户认为 **这样 OK**。（原表 peeked 静止弱化/触屏⑤–⑨未再走；桌面 hover 路径按用户口径可接受。） | — | — | `?product=1` · `.onboarding-hint-badge[data-ack]` · `ONBOARDING_HINTS.md` §〇 | 2026-08-01 |
| Onboarding · 首次登录右上音符薄荷绿圆点 | UI可见 | 待人工测试 | **主路径**：实验室清空引导已读（须在 **非** `?product=1` 的实验室页）→ 再开 `?product=1` → 右上音符见**薄荷绿脉冲**（`has-hint-mint`）。**禁止**把「硬刷新」单独写成清已读——硬刷新**不**清 `focus-tiger.hints-seen.v1`。**回流**：仅**选曲**后圆点消失；静音不清；**Rise / 会话结束不得清点**。**桌面悬停**：未读时鼠标停在音符上须立刻出 tip（宿主点无浮动 badge，靠 `_bindHostMintHover`）。 | **2026-07-30**：TDZ 已修。再书面「硬刷新仍无点」→ 步骤口径 + Rise 误 `markSeen`（已从 Rise/完成路径移除）。再书面「悬停无 Hint」→ 宿主 mint 补 hover。自动化：`e2e/onboarding-remedy-contract.spec.js`（mint 存续 + hover）。分支 `fix/onboarding-remedy-contract-and-wide-idle-menu`。 | — | — | `?product=1` · `.ambient-soundscape__mute.has-hint-mint` · `_bindHostMintHover` | 2026-07-30 |
| FocusHUD · Idle Calm 圆点可点（原钢蓝 discovery-dot） | UI可见 | 待人工测试 | **主路径**：清空 hints → Idle Calm 金环旁见**薄荷绿**脉冲圆点（非不可点钢蓝点）；悬停/点击展开 `focus-hud-ring` tip。**回流**：关 tip → peeked；相关操作后 done。 | **2026-07-30 用户书面（图5）**：Calm 左上角蓝点悬停/点击无反应 → 原 `ft-hint-discovery-dot` 为 `pointer-events:none`；已改为 Idle 亦调度 mint click badge，并清空非交互钢蓝宿主表。 **2026-08-01 用户书面（P1-3）**：Calm 旁 mint → tip → peeked → done — **测试 OK**。 | — | — | `#focus-hud .ft-hud__gauge` · `.onboarding-hint-badge[data-hint-id="focus-hud-ring"]` | 2026-08-01 |
| Hints · Registry triggerMode + tier + ambient anchorGroup | 仅单元测试覆盖 | 仅单元测试覆盖 | `onboardingHintRegistry.test.js`：`triggerMode` 1:1；**tier 仅 click 七条**（detailed=`help-affordance`，其余 simple；auto/manual/legacy 禁止填 tier）；`anchorGroup: ambient` selector 互异。Store：`peeked`→`done`。`hints:doc-check` 含 tier 列。 | **2026-07-23**：圆点已读状态机。 | — | — | `onboardingHintRegistry.js` · `OnboardingHintsStore.js` | 2026-07-23 |
| How shall we sit? secondary 米色立体钮 | UI可见 | 已通过 | Sit 仍为蒲团橙主 CTA；旁「How shall we sit?」为**米色立体次要钮**（渐变暖米底＋凸起阴影），不透明，不抢 Sit。Honesty Bridge Yes/No 仍同级（勿改成主次）。 | 2026-07-21：用户书面——背景透明不对，应改米色立体按钮。**2026-07-22**：用户书面 A 类，**测试 OK**。 | — | — | `.session-start-dock__hint` · `#btn-focus` | 2026-07-22 |
| LightProgression / 光影物理渐进 | UI可见 | 已通过 | Arrival：冷→暖背景、Notice 升温、Breath 视差 Dolly（背景 1.06 / Yin 1.12）+ 呼吸光环、Choose 坐垫光晕。FOCUSING：DOM Rim 跟踪 focusLevel（+ ambient boost）与约 4s 呼吸脉冲。Re-focus：Recover 扰动后约 5s 平复。 | 2026-07-19：用户反馈 Rise 后页面动画无变化。文档规定 FOCUSING 有金光、IDLE 无光环——Rise 应收起 Rim。**2026-07-22**：用户书面 A 类——LightProgression，**测试 OK**。 | — | — | 随 Arrival / Re-focus 自动 · DEV：`__lightProgression` · 单测：`LightProgression.test.js` | 2026-07-22 |
| IdleOrchestrator / 坐禅闭眼 | UI可见 | 已通过 | 点「坐禅闭眼」→ `idleBreathClosed` ×2 pingpong → `idleBlinkArc` ×1 pingpong → 循环；段间**硬切**不叠化。回流：Celebrating / Rise 后再 idle。 | 2026-07-20：切分帧界 4433/6937。**2026-07-20 用户书面**：各情况测试 OK。 | — | — | `#emotion-debug-ui` · `__idleOrchestrator` | 2026-07-20 |
| earWiggleHeadTouch / 摇耳摸头（产品回 Idle） | UI可见 | 有问题 | **主路径（姿态/好奇池 `earWiggleHeadTouch`）**：正放 → **倒放一次** → **约 1s CapCut**回 Idle（与 welcomeBack 同契约；倒放后不得再正放）。**禁止**仅用入库定格验收。**回流**：叠化后回闭目 Idle。 | **2026-08-02 用户书面**：开场/相关路径摇耳朵摸头也须正+倒一次 + CapCut。已烘焙 playlist + CapCut；`_finish` hide 修叠化。待复测。 | legacy-unclassified | legacy · 暂不进逾期扫描；发布前人工过目 | `#emotion-debug-ui` 姿态/情绪 · Dispatcher 好奇池 · **勿仅点入库** | 2026-08-02 |
| 候选陪伴手势 · 逐条试播 | UI可见 | 待人工测试 | 调试「入库素材」点：`tea-drinking` / `yawn-stretch` / `ear-wiggle` / gaze-p* —— **应直接播该条并定格末帧**；**不应**先闪一下闭目坐禅。**`blink-breathe` / `breath-halo-hq` 为 pingpong 循环**（不定格）。张望用「组合试播」**整段** `张望 (p1→p2→p3→p4)`（不再分 A/B）。 | 2026-07-20：合并张望 A+B；pingpong 清单尊重 loopMode。 | — | — | `#emotion-debug-ui` · 入库素材 / 组合试播 | 2026-07-20 |
| blink-breathe 眨眼深呼吸 | UI可见 | 已通过 | 调试面板仍可 pingpong 试播；**不再**作为 Rise 主路径。 | 2026-07-20：用户书面「测试 OK了」。同日产品拍板：Rise 改接 `rise-stretch-casual`。 | — | — | `#emotion-debug-ui` | 2026-07-20 |
| rise-stretch-casual / 中途 Rise 伸懒腰 | UI可见 | 待人工测试 | **主路径**：Sit → ⚡/Arrival → Focusing → 中途 **Rise** → 加权池正放一次（**~60%** 伸懒腰箕坐 / **~25%** 喝茶 / **~15%** 单程看书；末帧 `holdPose`）→ ~300ms 后 Reflection。**回流**：关 Reflection → 回 Idle；再 Sit。达标结束**不**播本池。**禁止**魔法书 / 哈欠 / 庆祝舞。可多 Rise 几次看多样性。 | **2026-07-20**：循环→正放一次，用户书面 OK。**2026-08-03**：改为加权池（stretch/tea/book）；须复测三种观感 + Reflection 关后回 Idle。 | — | — | Rise · `RISE_INTERRUPT_POOL` · 调试「Rise伸懒腰(正式)」/喝茶/单程看书 | 2026-08-03 |
| cloak-sleep / 披毯入睡（进 DORMANT） | UI可见 | 已通过 | **主路径**：非 DORMANT→DORMANT → `cloakSleep` 正放 @6fps≈5.7s（末帧 034）→ cross-fade → **睡姿**（同源 034→030 双拍 pingpong）。**须验**：披毯末帧与睡姿循环**姿态连贯、无硬切侧卧**。**回流**：已 DORMANT 持续睡（含跨午夜 sync）→ **不**重复披毯；唤醒后再进 DORMANT → 再播一次。**调试**：入库素材仍可单条试播。**冷启动不播本段**（见下行「开场即睡」）。 | **2026-07-22**：用户书面——模拟 ≥2h 进睡后走 Honesty 唤醒全流程，**测试 OK**（含披毯入睡观感）。**2026-07-25**：用户书面——进入页面后开场即播披斗篷趴下；且该过渡与后续睡姿循环**完全不连贯**。已改睡姿为 cloak-sleep 030–034 双拍 pingpong，请复测衔接（开场即睡另案）。 **2026-07-25 晚用户书面**：披毯→睡姿衔接 — **测试 OK**。 | — | — | 改 `focus-session-end` 时间戳模拟 · `#emotion-debug-ui` | 2026-07-25 |
| 开场即睡 / 冷启动第一幕 Idle | UI可见 | 有问题 | **主路径**：本地已有 ≥2h 前的 `focus-session-end` → 刷新 / 首次打开 `?product=1` → 阿寅须 **Idle 闭目坐禅**（有精神的坐姿呼吸），**不得**立刻播披斗篷→睡着。Honesty 小钮仍可出现（零完成时）。**回流（已拍板）**：切到后台再回前台且仍 ≥2h → **继续披毯进睡**（保留 live DORMANT；≠冷启动）。**对比**：实验室「重置全部本地状态」开局亦 Idle。 | **2026-07-25**：用户书面——进入页面后开场即播披斗篷趴下（当时标「另案」未修）。**2026-07-26**：用户书面——每次第一次试用又是披斗篷睡着；要刚开始看到有精神的 Yin。根因：2h 滚动 DORMANT 在 `onAppReady` 重播 cloak；冷启动现禁进睡。自动化：`dormantIdle` + smoke A1b。**同日用户书面拍板**：回前台且 ≥2h → **继续披毯进睡**（不改为 Idle）。 **2026-07-30 用户书面（图）**：仍见开场/首屏 Asleep 披毯睡（宽屏 HUD Asleep）。须区分：真冷启动刷新 vs 回前台 live sync（≥2h 拍板仍可进睡）。请用实验室清空后硬刷新复验。 **2026-07-30 用户书面复验**：实验室清空全部本地状态 → 硬刷新 `?product=1` → **闭目坐禅 Idle — 测试 OK**。 | legacy-unclassified | legacy · 暂不进逾期扫描；发布前人工过目 | `?product=1` · 改/保留 `focus-session-end` 后刷新 · `npm run test:smoke` | 2026-07-26 |
| MilestoneGlow 备选 breath-halo-hq | UI可见 | 待人工测试 | 调试「breath-halo-hq」→ pingpong；**顶点停留约 6 拍（~0.75s）**。 | 2026-07-20：用户反馈顶点仍需延长→已从 2 拍加到 6 拍，请复测。 | — | — | `#emotion-debug-ui` | 2026-07-20 |
| Sleeping / DORMANT 睡态循环 | UI可见 | 已通过 | **自动（live）**：距上次专注结束 ≥ `DORMANT_IDLE_HOURS`（默认 **2h**）且经回前台 / Rise 后 `syncDormantState` → `STATES.DORMANT`；披毯后睡姿为 **cloak-sleep 034→030 每帧两拍 pingpong** @ **2 fps**。**冷启动 `onAppReady` 不进睡**（即使戳已 ≥2h）。新用户无结束记录**不**触发。零完成 / 刷新开局仍为 Idle。**调试**：「睡着了」→ 同 pingpong 微动。**须分列验**：① 节奏约 2 fps、仍安宁；② 与披毯末帧同姿连贯；③ Honesty 倒放唤醒仍可从睡姿接上。 | **2026-07-22**：用户书面——模拟 3h 前进睡后 HUD Asleep + sleeping 侧卧，再 Honesty 唤醒，**测试 OK**。**2026-07-25**：用户书面——披毯过渡与后续睡姿**完全不连贯**（见 cloak-sleep 行）→ 已改同源末帧 pingpong；同日再书面——节奏太慢 → 已 **1→2 fps**；同日再书面——**节奏基本合适**。衔接/唤醒仍请确认。 **2026-07-25 晚用户书面**：2 fps 节奏 + 衔接 — **测试 OK**。 **2026-07-26**：开场即睡见专行列。 | — | — | `?product=1` · DEV 改 `focus-session-end` · `#emotion-debug-ui` | 2026-07-26 |
| DORMANT 2h 滚动触发 + sleep→wake 串联 | UI可见 | 已通过 | **单元/控制器集成**：`dormantIdle` chain + smoke `D sleep→wake`（状态机 + `playEmotion` 调用序；**非**披毯/倒放观感 DOM）。**人工主路径**：改 `focus-session-end` → 刷新见披毯→sleeping → Honesty唤醒选时长 → 倒放睡醒 + 10s 呼吸 → 离 DORMANT / 桥接。 | **2026-07-22**：用户书面——Honesty唤醒(流程) → 选时长 → cloak-sleep 倒放 + 10s 呼吸 → 离睡着态，**测试 OK**。 | — | — | `npm run test:smoke` · 实验室 `#emotion-debug-ui` | 2026-07-22 |
| AcrossToolsIdleGuard / Flow State 闲置 toast | UI可见 | 待人工测试 | Companion 选 Flow State → Sit → **30 分钟**无鼠标/键盘 → 一次 `ACROSS_TOOLS_IDLE` toast。仅切标签页不算 idle。 | — | — | — | 生产长等待 · DEV：`__acrossToolsIdleGuard` · **单元** `AcrossToolsIdleGuard.test.js`（阈值后触发一次；**非** 30min 真实墙钟 DOM） | 2026-07-18 |
| i18n（v1.0 English + Japanese） | UI可见 | 待人工测试 | **发版对外**：English + Japanese。**主路径**：`?product=1` → ⋯ / 抽屉 **Language** → **日本語** → Sit 等为日文；再选 **English** 切回；刷新保持。zh/es/de/fr **不出现**。自动化：`test:smoke`（`i18n.test.js`）；`test:e2e:changed -- e2e/language-switch.spec.js`。**人工**：375 日文排版（zh **非** v1.0 checklist）。 | **2026-07-30**：修订为 en+ja；中文延后；六语槽保留。 **2026-08-01 用户书面（日语）**：初步看都翻译了，未见语言混杂或缺失。 **同日**：日语所有「Yin」应译成类似「阿寅」的日语名——待拍板正式名后改 `CHARACTER_NAME` + 内嵌 Yin 句。 **2026-08-01 用户书面（P1-6）**：Language 日本語/English、刷新保持、zh 不出现 — **测试 OK**。（Yin→日语正式名仍待拍板。） **2026-08-01 用户拍板 + 本地改**：日语正式名 **阿寅**；`ja.json` `CHARACTER_NAME` + 内嵌句已替换；`CHARACTER_BIBLE` 增日语行。**须人工**：Language→日本語 → Sit「阿寅と坐る」等无残留 Yin。 **2026-08-02**：全量 e2e #15 稳定红 `language-switch` 仍期望 `Yinと坐る`——已改断言对齐阿寅（产品已拍板）。待复测 / CI。 | — | — | `?product=1` · `#language-preference-panel` · 审计 §9 | 2026-08-02 |
| 场景→动画接线表（产品稿 + v1 Slice A） | 纯文档 | 仅单元测试覆盖 | **无运行时改动**。SSOT `SCENE_ANIMATION_WIRING.md`；Backlog + Brief `task-scene-animation-wiring-v1-slice-a.md`；Slice A = v1.0.0 必交付（切语动画 + Honesty Idle 短点头；微仪式已接线）。实现另开 feature 后再登 UI 行。 | **2026-07-31** 用户书面：同意正式稿 + 纳入第一版；日语用鞠躬合十。 **2026-08-01**：设计师建议 + 库存全业务政策已并入 SSOT / `ASSET_INVENTORY` / Slice B Brief（本行仍纯文档）。 | — | — | `docs/SCENE_ANIMATION_WIRING.md` · `PROCESS` Backlog | 2026-08-01 |
| 场景动画 · 设计师整合 + 库存接线政策（文档） | 纯文档 | 仅单元测试覆盖 | **无运行时**。整合设计师场景×动画清单；库存「仅调试」→ A′+B 一批 / C；驳回完成池 dance；标 ja 合十漂移。 | **2026-08-01** 用户书面：整合意见；仅清单应接入业务。**同日再书面**：同意 Honesty 20/30、日语合十、勿接已取代、Dispatcher、其余清单**批量安排**（除冲突点）；请更新文档并 PR 合 develop。 | — | — | `SCENE_ANIMATION_WIRING` · `ASSET_INVENTORY` · `task-scene-animation-inventory-wire-slice-b.md` | 2026-08-01 |
| Hints 接线表 SSOT（`HINTS_WIRING`） | 纯文档 | 仅单元测试覆盖 | **无运行时产品行为**。`HINTS_WIRING.md` + `HINT_WIRING_BATCH_CLUSTER` 库存硬闸（`hints:doc-check`）+ PR 模板批次钉。文案仍 `ONBOARDING_HINTS`；registry 仍机器真源。**诚实**：骨架 + 硬闸已立；簇 A 真实全流程验证 / 视觉快照 / viewport-context 解耦仍待。 | **2026-08-03** 用户书面：合理则办——单独立项 HINTS_WIRING。 **同日分析师**：文档非充分；须 CI 硬约束 + PR 批次纪律 + 勿误以为已生效。已跟进硬闸与模板。 | — | — | `docs/HINTS_WIRING.md` · `scripts/hints-doc-check.js` · `.github/PULL_REQUEST_TEMPLATE.md` | 2026-08-03 |
| 场景动画 · Slice A（切语看书/喝茶 + Honesty Idle 点头） | UI可见 | 待人工测试 | **主路径**：`?product=1` → Language → **日本語** → **单程看书**（`bookReading`，末 ~1s CapCut）→ Idle；再 **English** → **单程喝茶**（`teaDrinking`，末 ~1s CapCut）；同日再切同一语**不**重复播。Honesty Idle：≤29 短点头；≥30 `goldenHaloPalms`（金环合掌试验；原 breathHaloHq 改调试）。睡态 Honesty：仅 dormantWake。微仪式 / 非首次完成走同档轻量池（禁 dance）。**回流**：Focusing 中切语跳过。375 各走一遍。 | **2026-08-01**：A′+B 实现中——合十漂移应已修；请复测合十画面 + Honesty 30+ 光环。 **2026-08-01 用户书面（P1-7）**：ja 合十 / en 鞠躬 / Honesty 短点头与 ≥30 光环路径 — **测试 OK**。说明：「Focusing 中切语跳过」= Focusing 时切语言**不播**合十/鞠躬；「同日同语不重复」= 同一天同一目标语最多播 1 次。 **2026-08-02 用户书面（日语）**：切语后未见合十/鞠躬动画（昨日 P1-7 曾 OK）。**工作流/产品核对**：契约本有「同日同语不重复」；曾先写配额再 play——gate/抢占会占当日额度。**2026-08-02 本地修**：改为 `playEmotion` 开播成功后 `markLocaleGreetingPlayed`；resolve 不预扣。**须人工**：清 `focus-tiger.locale-greeting.v1` 或新日 → English→日本語见合十；同日再 ja 不重复。 **2026-08-02 晚**：≥30 改 `goldenHaloPalms` 试验——须复测长补登观感。 **同日再书面**：Honesty＜30 与切语 English 的鞠躬缺倒放/pingpong，接不上 Idle。**本地修**：`mindfulAcknowledge` 对齐 IntentionSet（pingpong×1 + CapCut）。 **2026-08-02 用户书面（本 feature tip）**：Honesty 10/20 + Language→English 鞠躬衔接 — **测试 OK**。 **同日再拍板**：切语 EN 改单程看书 `magicBookReading` + 末 1s CapCut（nod-bow 过密）。**须人工**：清 greeting 配额或新日 → Language→English 见看书单程后叠化回呼吸（非鞠躬）。 **2026-08-02 用户书面**：基本 OK，**须去掉末尾叠化过渡**。**本地修**：切语 EN 与欢迎池同硬切（无 CapCut）。**须人工复测**：清 `focus-tiger.locale-greeting.v1` → Language→English → 看书单程后**硬切**回呼吸（无 1s 叠化）。 **2026-08-02 用户书面**：看书硬切 — **测试 OK**。 **同日再拍板**：切语 EN 改单程 `teaDrinking` + 末 1s CapCut。**须人工**：清 greeting 配额 → Language→English → 喝茶单程后叠化回呼吸（非书/非鞠躬）。 **2026-08-02 用户书面**：EN 喝茶 + CapCut — **测试 OK**。 **同日再拍板**：入库 `book-reading`；切语 ja → 单程看书 + CapCut。**须人工**：清 greeting → Language→日本語 见看书单程后叠化回呼吸；English 仍喝茶。 **2026-08-02 用户书面（本 feature tip `88370b8`）**：ja 看书 + CapCut / en 喝茶 + CapCut — **全部测试 OK**。 | — | — | `sceneAnimationDispatcher` · `__sceneAnimationSliceA` · `__sceneAnimationDispatch` · `e2e/language-switch.spec.js` | 2026-08-02 |
| 场景动画 · Dispatcher Slice B（欢迎/深夜/好奇/舒展池） | UI可见 | 待人工测试 | **主路径**：冷启动同日欢迎（加权试验：`magicBookReading` 60% · `nodGreeting` 40%；日限 1；**不含挥手、不含茶/哈欠**）；本地 ≥23:00：**仅当本趟欢迎未播**才可 boot 深夜 yawn/tea；回前台仍偶发（1h 冷却）。Idle 靠近悬停 ~4s 极低概率耳摇/张望。舒展提醒可能 yawn。**回流**：同日欢迎不重复；冷却内深夜不重播。**禁止**完成池 dance。**开场欢迎观感**：魔法书正放后**硬切** Idle；点头无倒放。**耳摇观感**（好奇池）：正放→倒放一次→约 1s CapCut。**张望观感**（好奇池）：p1→p4 段间硬切、离开 Idle 不清 overlay、末帧定格后 CapCut 回 Idle——**不得闪白**（对齐实验室组合试播；产品路径单测锁）。**≥23:00 冷启动**：只见书或点头，**不得**立刻被茶/哈欠盖掉。 | **2026-08-01 用户书面（P1-8）**：深夜 yawn/tea **须深夜测**。 **2026-08-02**：挥手曾撤出/再试开场。 **同日再书面**：魔法书硬切。 **同日再书面**：新挥手开场仍不行 → **再撤出开场**；池内书+点头。 **同日再拍板**：新旧挥手**暂时停接线**（`welcomeBack` 空实现；情绪入口撤）。 **2026-08-02 晚用户书面**：Idle 随机东张西望播放中**闪白**；实验室「组合试播·张望」不闪。**工作流根因**：见 `DEV_WORKFLOW_QUALITY` §6.8。**本地修**：产品链对齐实验室抗闪。须人工：**勿干等随机**——实验室「组合试播·张望」或产品壳控制台 `__emotionController.playEmotion('gazeLookAround')`（DEV 已挂）验全程无闪白。契约单测已锁。 **2026-08-02 用户问**：是否只能碰随机机会——否，用上列强制入口。 **2026-08-02 深夜用户书面**：Welcome 测试仍见 tea drinking 与伸懒腰类动画被「随机纳入」。**工作流根因**：见 `DEV_WORKFLOW_QUALITY` §6.9——非池污染，乃冷启动同 tick `WELCOME_APP` 后立刻 `LATE_NIGHT` 抢播。**本地修**：`shouldAttemptLateNightOnBoot`；欢迎播则跳过本趟深夜。**须人工**：清 `focus-tiger.scene-anim-daily.v1`（及可选 cooldown）→ ≥23:00 硬刷新 `?product=1` → 只见魔法书或点头，不见茶/哈欠；同日再刷可测深夜（欢迎已配额）。 **2026-08-03 用户书面（`origin/develop` tip `41efa95` / 修 `019585d` · PR #87 已合）**：清 `scene-anim-daily`（可选 cooldown）→ ≥23:00 硬刷新 `?product=1` → 只见魔法书或点头、**不得立刻茶/哈欠** — **测试 OK**。（关单：本子路径已确认；整行好奇闪白/舒展池等仍见测试步骤，未标整行已通过。） | — | — 冷启动互斥缺陷已书面确认；整行其余场景仍待测 | Brief Slice B · unit `shouldAttemptLateNightOnBoot` · 清 daily 后深夜硬刷新 · develop tip `41efa95` | 2026-08-03 |
| 用户指南 + 隐私短文（发版向） | 纯文档 | 待人工测试 | **主路径**：打开根 `README.md` → `focus-tiger/docs/USER_GUIDE.md`，按「One simple session」能走通一局（Safari）。**隐私**：`PRIVACY_NOTICE.md` 与产品实际（本地优先、无默认崩溃 SDK）一致；无过度承诺。**回流**：从 README 链能回到 guide/privacy。工程细节见 `PROCESS` Backlog「发布前安全网」。 | — | — | — | `README.md` · `USER_GUIDE.md` · `PRIVACY_NOTICE.md` | 2026-07-30 |
| Emotion debug UI（右上角调试面板） | UI可见 | 待人工测试 | 逐个点一次性姿态：播完应**定格末帧**，不硬切默认闭目呼吸；点「坐禅闭眼」才回 idle 循环。循环态（睡着/微笑/光环）照常循环。面板底部**不应**再出现「动态效果层」（绕 Y 轴旋转 / 呼吸起伏 / 悬浮）三项勾选。 | 2026-07-19：勿刻板切回默认闭目→已改 `holdPose`，定格末帧仍待复测。同日：动态效果层须从 2D 删除→已移除；**用户确认测试通过**。 | — | — | `#emotion-debug-ui` | 2026-07-19 |
| smiling / blink-smile（欢迎与调试） | UI可见 | 待人工测试 | Arrival Welcome 自动播；或调试「坐禅微笑」。pingpong。Celebrating 后持久 Smiling 基底**未接线**（回 Idle）。 | — | — | — | Arrival / 调试面板 | 2026-07-18 |
| UI 叠层玻璃泡统一（Arrival 式半透明） | UI可见 | 待人工测试 | **主路径**：凡挡角色的厚奶油卡片（Honesty 时长/呼吸、桥接、微仪式、Reflection、Companion 三选一面板、Sound/提醒/语言面板、宽屏⋯菜单、窄屏抽屉 sheet、toast/横幅）须为暖米 ~0.62 + blur；控件可略实 ~0.72–0.78。**回流**：开/关叠层后仍可读。SSOT：`glassPanelStyles.js` + design-tokens。 | **2026-08-02**：用户书面桥接半透明 OK 后拍板全项目同类卡片坚决执行。 **同日再书面（本 feature tip）**：Honesty/Companion/⋯/Sound/窄屏抽屉半透明且文案可读 — **测试 OK**。 | — | — | `?product=1` · Honesty/Companion/⋯/抽屉/Sound | 2026-08-02 |
| welcomeBack / wave-hello 挥手（新旧） | UI可见 | 已放弃/不适用 | **2026-08-02 拍板：暂时停接线**。产品不播旧 `wave-hello` / 新 `wave-hello-pingpong`；`welcomeBack` 空实现；调试情绪入口已撤；欢迎池不含挥手。素材仍入库（标签「停接线·仅素材」）。**不再排人工验收**，直至另议场景。 | **2026-08-02 晚**：开场观感不行 → 撤池；再书面 → **新旧一并停接线、以后再说**。 | — | — | 勿用开场/welcomeBack 验收挥手 | 2026-08-02 |
| book-reading / 单程看书（日语切语） | UI可见 | 待人工测试 | **主路径**：清 `focus-tiger.locale-greeting.v1` → Language→**日本語** → `bookReading` 正放一次（无倒放）→ **约 1s CapCut** 回呼吸。调试：「单程看书」。**回流**：同日再 ja 不重复。≠ 开场 `magic-book-reading`。 | **2026-08-02**：根目录「Yin看书的单程动画…」入库为 `book-reading`；接日语切语。 **同日用户书面（本 feature tip）**：切语日语单程看书 + CapCut — **测试 OK**。 | — | — | `?product=1` · `#emotion-debug-ui` · `book-reading` | 2026-08-02 |
| magic-book-reading / 开场魔法书 | UI可见 | 待人工测试 | **主路径**：冷启动欢迎池可抽到（40%）；或调试「魔法书阅读(开场试)」。46 帧已烘焙 pingpong **@ 4 fps**（放慢 50%）正放一次 → **硬切**回 Idle（**无** CapCut；末帧应可顺畅接呼吸）。**回流**：同日欢迎不重复。 | **2026-08-02**：用户要求试纳入开场。 **同日再书面**：末帧可接 idle → **去掉回落叠化**，自然衔接试效果。 **同日再书面**：播放太快 → fps 8→4。 | — | — | 清 `focus-tiger.scene-anim-daily.v1` · `?product=1` 硬刷新 · 或调试钮 | 2026-08-02 |
| golden-halo-palms / Honesty 长补登金环合掌 | UI可见 | 待人工测试 | **主路径**：Idle Honesty 选 **≥30 min** → 呼吸结束 → 播衣发光→金环→合掌→金沙（94 帧已烘焙 pingpong **@ 4 fps**，放慢 50%）→ CapCut Idle + toast/桥接。**回流**：≤29 仍短点头；睡态不叠。调试钮「金环合掌」可单播。 | **2026-08-02**：用户要求试合适场景；接 Honesty≥30（替 breathHaloHq 产品路径）。 **同日再书面**：播放太快 → fps 8→4。 | — | — | Honesty ≥30 · `#emotion-debug-ui` | 2026-08-02 |
| dormantWake / Honesty 睡醒序列 | UI可见 | 已通过 | **主路径**：进 DORMANT 后「Honesty唤醒」选时长 → **`cloak-sleep` 34 帧倒放**（**6 fps** ≈5.7s）→ 定格末帧 + **约 10s 呼吸**并行。**回流**：定格后桥接 Yes/No。**对比**：「唤醒(伸懒腰)」仍走 stretch-reminder，视觉须不同。**不**淡入闭眼呼吸、**不**自动接光环金光。 | **2026-07-21**：用户希望用斗篷倒放替换原 dormant-wake。**2026-07-22**：用户书面——Honesty唤醒(流程)选时长 → 倒放睡醒 + 10s 呼吸 → 离睡着态，**测试 OK**。 | — | — | Honesty / `#emotion-debug-ui` · `playEmotion('dormantWake')` | 2026-07-22 |
| lookAtCursor / wakeUp / snoringZZZ 等 | 纯后端+调试 | 不挡合并（仅调试） | **正式用户（`?product=1`）看不到这三项**：产品路径 Honesty 睡醒走 `dormantWake`；舒展提醒走 `stretchReminder`；`main.js` **不**调用 `wakeUp` / `lookAtCursor` / `snoringZZZ`。`wakeUp` 仅实验室调试钮「唤醒(伸懒腰)」；`lookAtCursor` 兼容空操作；`snoringZZZ` unimplemented。调试对比两唤醒钮可自愿抽查，**非合并门禁**。 | 2026-07-19/21：与 Honesty 视觉分离。**2026-07-22**：确认仅调试/占位 → 标「不挡合并（仅调试）」。 | — | — | `#emotion-debug-ui`（实验室 `/`；产品壳隐藏） | 2026-07-22 |
| haloBreathing / 光环呼吸奖励 | UI可见 | 待人工测试 | 调试面板播「光环呼吸奖励」：intro + loop。**fps 已放慢 2×**（intro 5 / loop 4，原 10/8）。Honesty 路径暂不自动接。 | 2026-07-19：播放太快须至少放慢 2×→已改，请复测。 | — | — | `#emotion-debug-ui` | 2026-07-19 |
| blink / 眨眼变体 | UI可见 | 已通过 | Idle 眨眼由 `idleBlinkArc`（×1 pingpong）插入闭目段（×2）之间；调试 blink-smile 仍可手工播。 | 2026-07-20：两段 pingpong 编排。**2026-07-20 用户书面**：idle 坐禅测试 OK。 | — | — | 调试 / Idle 编排 | 2026-07-20 |
| tPose / 显示 3D 垫底（调试） | UI可见 | 待人工测试 | 调试面板 T-Pose → 短暂露出 3D canvas。确认 2D 主线默认隐藏 3D。 | — | — | — | `#emotion-debug-ui` | 2026-07-18 |
| ArrivalPractice 状态机 | 纯后端 | 仅单元测试覆盖 | `npm test` → `ArrivalPractice.test.js` | — | — | — | `src/core/ArrivalPractice.js` | 2026-07-18 |
| DailyCompletionStore | 纯后端 | 仅单元测试覆盖 | `DailyCompletionStore.test.js`；与 Honesty / 完成分流共用 | — | — | — | `src/core/DailyCompletionStore.js` | 2026-07-18 |
| 留存漏斗骨架 RetentionTelemetry | 纯后端 | 仅单元测试覆盖 | **无 UI、无第三方**（正式工具暂不选型）。`RETENTION_FUNNEL.md`；`console.log('[RetentionTelemetry]', …)`。事件：`app_first_open` / `first_session_complete` / `day1\|3\|7\|30_return`（窗口内首次返回）/ `dormant_bridge_shown\|accepted\|declined` / **`micro_ritual_complete`**（不抢 `first_session`）。接线：`main.noteAppOpen`、`HonestyCheckIn.onSessionRecorded`、桥接 `trackEvent`（含 No→declined）、`completeMicroRitual`。storage `retention-funnel.v1` 纳入 DEV 重置。 | — | — | — | `RetentionTelemetry.test.js` · `HonestyBridgeCtaController.test.js` · `docs/RETENTION_FUNNEL.md` | 2026-07-22 |
| 「本周陪伴」热力图 · 数据结构/挂载位调研（第 1 步） | 纯文档 | 仅单元测试覆盖 | **无 UI**。结论：`DailyCompletionStore` **仅当日**不够。数据源已改为扩展 `PracticeDaysStore`（见下行）。**候选挂载（未拍板）**：① Reflection `onDone` 后短暂角标 ② Idle 常驻一角（避开 FocusHUD 左上 / Sound 右下 / Sit·Honesty dock 底中 / 音符右上）③ Reflection 面板内收尾一角 ④ HUD 旁替换或并列现有 streak-meter。 | 2026-07-22：用户要求先确认数据结构再实现 | — | — | `SHARED_RESOURCES` §1.1–1.2 | 2026-07-22 |
| PracticeDaysStore 多日时长 + getLastNDays（热力图 Store） | 纯后端 | 仅单元测试覆盖 | `days: { date, totalMinutes }[]`（旧 `string[]` → `totalMinutes: null`）；`markToday(minutes)` 同日累加；`getLastNDays(7)` 缺口补 0；窗口仍 90。写入仍走 Honesty/`onPracticeDay`。 | — | — | — | `PracticeDaysStore.test.js` · `SHARED_RESOURCES` §1.2 | 2026-07-22 |
| 「本周陪伴」7 格热力图 UI（Idle 常驻） | UI可见 | 有问题 | **主路径**：`?product=1` Idle → 见 7 格。**宽屏 ≥480**：左下 `?` 上方。**窄屏 ≤479 / 375**：ActionBar（? · Calm/time · ♪）+ Yin + 主画布三主钮 **Sit / Quick Start / Honesty** + **上滑抽屉**（次要：呼吸 / How / **Sound → Soundscape 面板**；**禁止**只抬红色 Sound FAB / **提醒**；**不含** Sit/Quick/Honesty）+ 7 格只读；抽屉钮紧凑半高。**Focusing**：左上 `#focus-hud`；Sound FAB 藏、右上 mute 可关。**回流**：Rise → 三主钮 + grabber；♪ 静音。**DOM**：e2e `weekly-practice-heatmap.spec.js`（主屏 Honesty + 抽屉无三主钮 + Sound **panel 可见且 FAB 隐藏** + Reminder）。 | **2026-07-24**：375 书面①–⑦。**2026-07-25**：Honesty / 提醒 **测试 OK**；Sound 弹出红色 Sound 钮而非原先选曲框——已改为抽屉 Sound 直接开 Soundscape 面板；**须复测 Sound**。 **2026-07-25 用户书面（5174 · 场景 O · 375）**：① Sit 后出现游离 Hint；点 tip 后 tip 消失但选择框也消失（不对，非点空白）② 多路径：Yin 鞠躬后 timer 不动、左上无 timer HUD③ 点 ? 一大群 hints 乱指不存在的按钮④ Honesty check-in 之后左上无 timer HUD（应有）⑤ a minute breath 期间仍见 Sit with Yin（不对）。（P0 本轮其余项 OK；本行阻塞 merge PR#2 前 P0。） **2026-07-25 修图1**：点 tip 只关 tip（`outsideDismissGuard` + e2e）；① 其余（游离 tip 是否该出）与 ②–⑤ **仍有问题/待修**。 **2026-07-25 晚用户书面**：窄屏壳 / 场景 O 图1–5 — **正在修理**（图1 代码已有待合验收节奏；②–⑤仍开）。 **2026-07-25 深夜用户书面（并行会话 · worktree `feature/wide-idle-more-menu` @5174）**：**图1–图7 测试 OK**（正确树复测；含原 P0 图1–5）。**图8/9 新开**（Notice 缺 ⚡；? 补救竖叠挡角色）——另线继续，**不**再沿用「图1–5 阻塞 merge PR#2」旧口径。**合并前提**：相关修须先合入 `develop`（当前仍在 feature/fix 分支，尚未进 PR#2 tip）。 **2026-07-26 凌晨（并行会话 · wide-idle）**：图8–9 已改并复测；图10–12（⚡ 居中 /「还有 N 条」芯片 / Reminder 横幅）用户书面 **全部测试 OK** → **图1–12 相关项收口**（权威记录在 `feature/wide-idle-more-menu` · `4596b7a`）。 | legacy-unclassified | legacy · 暂不进逾期扫描；发布前人工过目 | `?product=1` · DevTools 375×667 · `#ft-narrow-idle-shell` | 2026-07-26 |
| 「一分钟呼吸」微仪式 · 方案调研 | 纯文档 | 仅单元测试覆盖 | 方案见 `MICRO_RITUAL_PLAN.md`。**实现已另开下行**。 | 2026-07-22：先调研后实现 | — | — | `docs/MICRO_RITUAL_PLAN.md` | 2026-07-22 |
| 「一分钟呼吸」微仪式 · Idle 接入 | UI可见 | 待人工测试 | **主路径**：立体入口 → 吸↔呼文案 + smiling@4fps + **4s 独立光环**（不同拍）约 60s → 中下部 toast + SessionComplete 摆尾 → 记账。进行中 FocusHUD 直播。**回流**：Leave 安静退出。桥接时入口隐藏。**DOM**：e2e `micro-ritual.spec.js`（缩短墙钟主路径：入口→呼吸文案→toast+记账+回流；Leave 不记账；**非** smiling@4fps / 摆尾节奏观感）。**375**：呼吸中不得见 Sit；**不得**出 `idle-after-session`「Sit again whenever you like」指空地。 | 2026-07-22：实现+HUD/toast。**同日晚用户书面**：主路径除同拍/质感外基本 OK；同拍须 undo；入口间距基本 OK 但四钮质感须协调。**2026-07-25 用户书面（5174 · 场景 O）**：a minute breath 期间仍见 Sit with Yin（不对）。 **2026-07-26**：Visibility Contract `micro-ritual-sit-unavailable` 已锁（375 e2e；宽屏 `#btn-focus:disabled`）；**须人工**确认抽屉入口路径下呼吸进行中主球 Sit 仍不可见。 **2026-07-26 用户书面（5176）**：抽屉进呼吸后主球 Sit 无，但旧 Sit with Yin 仍在 → 已修 `ft-narrow-hide-sit-dock`。 **2026-07-29 用户书面（375）**：呼吸中 tip「Sit again whenever you like」指空地 — **有问题**。工作流根因：修 O⑤ 藏 Sit 时只锁了可见性契约，**未**把 `microRitualOpen` 写入 onboarding scene；`resolveAutoHintIds` 仍当 Idle 出 `idle-after-session`；锚点找不到时 `_positionBubble` 还把 tip 丢到画面下方空白。已改 scene 门闩 + 无锚点不画 tip；e2e 锁。 | — | — | `?product=1` · `#micro-ritual-idle-entry` | 2026-07-29 |
| 「一分钟呼吸」· 吸呼相位与 smiling 节奏 | UI可见 | 已通过 | ~~文案↔光环/Yin 同拍~~ **已撤销**。当前实现：吸/呼文案约 **2.5s** 交替；光环 **独立 4s**（`GOLD_BREATH_PERIOD_SEC`）；smiling@4fps；**无** Yin `scaleY` / `ft-yin-guided-breath`；`beginBreath()` 不再传 `periodSec`。 | **2026-07-22**：用户书面「同拍不行；需要 undo」→ `736fdc1` 撤销。**同日代码核对关单**：`LightProgression` / `main.js` / `MicroRitualUI` 无同拍残留；缺陷（错误同拍）已关闭。入口质感等见相邻「待人工测试」行。 | — | — | 同上 · `?microRitualMs=15000` | 2026-07-22 |
| 「一分钟呼吸」· HUD 墙钟与完成 toast 中置 | UI可见 | 待人工测试 | **主路径**：点一分钟呼吸 → 左上 `#hud-time` 从 00:00 递增、状态呈 Focusing/专注中、今日同坐条与金环随进度推进；到点完成文案在**画面中下部约 62%**（避开脸、非底栏夹缝），仍可见摆尾。**回流**：Leave → HUD 回 Calm/00:00（未记账）。**DOM**：e2e 锁 `#hud-time` 递增 + toast `data-placement=center` + boundingBox 大致中置（**非**精确 62% 视觉验收；**非**金环/同坐条脉冲观感）。 | 2026-07-22 午：用户书面仪表不动 + toast 不显眼。**同日复测**：基本 OK；toast 42% 挡脸偏高 → 已下移 62%。**同日又书面**：以 Honesty 补登成功 toast 位置为准，微仪式须同位置（共享常量）。 | — | — | 同上 | 2026-07-22 |
| 「一分钟呼吸」· Idle 入口立体钮与 dock 间距 | UI可见 | 待人工测试 | 四钮**同族立体质感**：Honesty / 一分钟呼吸 / How shall we sit? 次级同尺寸（13px、9×20、同 inset+底边阴影）；Sit 略大主 CTA（15px、11×28）但同一圆角/内高光/底边语言。色可不同（米/青绿/蒲团橙）。gap≈16px。 | **2026-07-22**：用户书面「基本 OK，但颜色、大小、质感还需和谐协调；颜色可以不同；目前质感不统一」。已改同族质感，**须复测**。 | — | — | `?product=1` · `#session-start-dock` | 2026-07-22 |
| 「一分钟呼吸」· SessionComplete 摆尾（禁 Celebrating） | UI可见 | 待人工测试 | 微仪式结束后只见 **摆尾**，**不见** Celebrating 舞；即便当日尚无正式 Focus 达标也如此。同日第二次微仪式仍只摆尾。 | **2026-07-22**：用户书面——一分钟呼吸结束后「好像只有撅屁摇尾，没有跳舞」；问是否原设计。**口径确认：是**（见 `MICRO_RITUAL_PLAN`：从不 Celebrating）。跳舞仅正式 Sit→计时**墙钟达标**当日首次。**同日午**：用户书面「其它方面测试 OK」。 | — | — | 同上 | 2026-07-22 |
| SessionIntentionStore | 纯后端 | 仅单元测试覆盖 | `SessionIntentionStore.test.js`；Choose 写入 `intentions.v1`。**Bug 回归锁（2026-07-22 Reading 回显）**：`resolveSessionIntentionLatch: pending wins; empty pending must not wipe latch` — 模拟二次 `beginFocus` 时 `pendingChoose` 已空、`clearIfEmpty: false` 仍保留 `📖 Reading`（§7 红绿对照；e2e 主路径不测此边界） | — | — | — | `src/core/SessionIntentionStore.js` · `SessionIntentionStore.test.js` | 2026-07-22 |
| ReminderQuotaManager | 纯后端 | 仅单元测试覆盖 | `ReminderQuotaManager.test.js`；三类提醒共享自然日额度 | — | — | — | `src/core/ReminderQuotaManager.js` | 2026-07-18 |
| 应用内提醒偏好 + 横幅候选判定 | 纯后端 | 仅单元测试覆盖 | **逻辑无 UI、无浏览器 Notification**。`get/setReminderPreference`（`reminder-preference.v1`；形状 `{ hour, minute }` 或 `null`，**无 `enabled` 字段**）；`evaluateInAppReminderBanner`：未设置 / 未到时 / 今日已完成 → 不触发；全满足 → `{ shouldShow: true, messageKey: 'reminder.gentle_waiting' }`。`resolveReminderPreferencePanelNotes`：常显 `daily_blurb`；已过时分→`past_time_note`；今日已练优先→`practiced_today_note`（**不**禁改时）。完成判定：`DailyCompletionStore.hasCompletedToday()`（含 Honesty / 微仪式）。 | — | — | — | `reminderPreference.test.js` · `InAppReminderBannerController.test.js` · `SHARED_RESOURCES` | 2026-07-22 |
| 应用内提醒设置入口 + 横幅 UI | UI可见 | 有问题 | **设置入口**：Idle 左下热力图簇旁的小型时钟图标（`ReminderPreferenceUI`）。仅 Idle 可见；点开轻量面板 → 勾选「开启提醒」写入 `{ hour, minute }`；取消 → 清空存储。**每日语义**：面板常显 `#reminder-preference-daily-blurb`；onboarding Hint `in-app-reminder`（时钟旁；「?」补救 Idle 亦含）。**软提示**：已过时分可保存 + `past_time_note`；今日已练 → `practiced_today_note`，**时间仍可改**。**横幅**：`#ui-overlay` 顶部居中（`InAppReminderBannerUI`），到点且今日未完成时 `reminder.gentle_waiting`（EN "Yin is right here when you're ready." / ZH「你准备好了，阿寅就在这儿。」；**禁** waiting/在等你紧逼感），可点 × 关闭。**主路径**：点时钟→开启并设时→切后台再回前台→横幅。**回流**：关闭后本页不再出现；完整刷新 / 新开 App 若条件仍满足可再出。**忙碌期（已拍板）**：Arrival / Focusing / Celebrate / Reflection / 微仪式 → **`suppress`**。DEV：`window.__inAppReminder.{sync,setNow,clearNow,controller,settings,banner}`。 | 2026-07-22：入口改热力图簇旁；e2e `in-app-reminder.spec.js`。**2026-07-23**：suppress 拍板。**2026-07-24**：设置中途不弹横幅 **测试 OK**；waiting 文案改 presence，须复测。**2026-07-25 用户书面**：过去时分无约束、今日已练面板语义、须知「每天」→ 已拍板「可保存+软提示」「可改时+说明」+ **每日 Hint/面板说明**；**2026-07-25 用户书面（5174 · 场景 P）**：提醒新文案 reminder — **测试 OK**。 **2026-07-25 晚**：用户问「软提示+Hint 具体测啥」→ 步骤见同日 Agent 回复（面板 daily_blurb / past_time_note / practiced_today_note / Hint）；**横幅文案已 OK**；软提示三项若未再走仍可自愿补测，不挡 P0。 **2026-07-25 夜用户书面（Safari · `?product=1` · 05a7f94 软提示）**：①–③ daily_blurb + 已过时分可存 + `past_time_note` **测试 OK**；但**无「时间设置已保存」任何确认**（当前实现改时即写、无 toast）；且面板仍是**旧时钟浮层**（非 `feature/wide-idle-more-menu` 新 ⋯ 菜单）。④ 同坐/Honesty 后行为（今天不再提醒、时间仍可改）**基本 OK**，但面板**未见**「今天已练、今天不再提醒」（`practiced_today_note`）。⑤ 实验室清 hints 后 `in-app-reminder` tip + ? 补救**基本 OK**，但 **hints 明显重叠**（见 L259）。→ **不**标「软提示亦 OK」；缺口记本行，**不挡**当前 P0 / **不挡** merge PR#2（O 仍挡，见 L228）。 **2026-08-01 用户书面（图2）**：当天无 Practice、提醒设**晚于当前**并保存 → 顶部「Yin is right here」横幅**立刻消失** — **测试 OK**（未到点不应再显示）。图3 日语横幅仍含拉丁 Yin，随角色日语名一并改。 | legacy-unclassified | legacy · 暂不进逾期扫描；发布前人工过目 | Idle 左下 `#weekly-practice-heatmap-cluster` · `#reminder-preference-toggle` · `#reminder-preference-daily-blurb` · `#reminder-preference-status` · `#in-app-reminder-banner` · e2e `in-app-reminder.spec.js` · DEV `__inAppReminder` · 实验室 `/`「重置全部本地状态」 | 2026-08-01 |
| session-completion-feedback 分流逻辑 | 纯后端 | 仅单元测试覆盖 | `session-completion-feedback.test.js`；首日 Celebrating vs 同日 SessionComplete | — | — | — | `src/core/session-completion-feedback.js` | 2026-07-18 |
| AttentionSignals | 纯后端 | 仅单元测试覆盖 | `AttentionSignals.test.js`；20s 记账 / 60s 回归展示 | — | — | — | `src/input/AttentionSignals.js` | 2026-07-18 |
| CharacterConfig 路径拼接 | 纯后端 | 仅单元测试覆盖 | `CharacterConfig.test.js`；无换装 UI | — | — | — | `src/character/CharacterConfig.js` | 2026-07-18 |
| SpriteSequencePlayer | 纯后端+渲染 | 仅单元测试覆盖 | `SpriteSequencePlayer.test.js`；预加载/打断/帧停留/子序列 | — | — | — | `src/character/SpriteSequencePlayer.js` | 2026-07-18 |
| EmotionController 映射桥 | 纯后端+桥接 | 仅单元测试覆盖 | `EmotionController.test.js`；业务只调 `playEmotion` | — | — | — | `src/core/EmotionController.js` | 2026-07-18 |
| CapCut 式叠代默认（one-shot→idle） | 纯后端+桥接 | 仅单元测试覆盖 | `_finishOneShot` 默认 `CAPCUT_DISSOLVE_MS`；`returnCrossFadeMs: MICRO` 可缩短；`EmotionController.test.js` | — | — | — | PRINCIPLES / EMOTION_BIBLE §1.6 | 2026-07-20 |
| SessionUiGate（Arrival/叠层/完成中门闩 facade） | 纯后端 | 仅单元测试覆盖 | `SessionUiGate.test.js` + 并入 `npm run test:smoke`：未就绪不得 begin；Sit 未就绪 → start-arrival；叠层 hint ignore；`computePostSessionOverlayActive` 可扩展源；`resolveCompanionModeSelectCommit` 拒绝不写 storage | — | — | — | `src/core/SessionUiGate.js` · DEV `__sessionUiGate` · `SHARED_RESOURCES` §4 | 2026-07-22 |
| 文档-代码结构对齐（DOC_CODE_CONTRACT） | 纯后端 | 仅单元测试覆盖 | `npm run docs:check`（hints / gate / **visibility** / **state-machine** / **rules-authority**）；`visibility:doc-sync` / `state:doc-sync` / `gate:doc-sync` / `hints:doc-sync` / `rules:doc-sync`；故意改 ARCHITECTURE §状态机或 SHARED_RESOURCES §4/§6 机器块或 RULES_INDEX 机器块须 exit 1。pre-commit：根目录 husky → `test:smoke`。CI：`.github/workflows/focus-tiger-doc-contract-check.yml`（**须 `npm ci`**）+ **suppress/hide 变更** → `.github/workflows/focus-tiger-visibility-contract.yml`（`test:e2e:visibility` 整表）。详见 `DEV_WORKFLOW_QUALITY.md` §7.7 / §8.6。 | — | — | — | `docs/DOC_CODE_CONTRACT.md` · `visibilityContractRegistry.js` · registries | 2026-07-26 |
| 规则主题权威索引（RULES_INDEX） | 纯后端 | 仅单元测试覆盖 | `npm run rules:doc-check`（并入 `docs:check`）：主题 SSOT 必含断言；非 SSOT 禁止指纹级完整复述；禁止矛盾短语（如「先问再 commit」对抗「可自动 commit」）。索引：`docs/RULES_INDEX.md`；registry：`scripts/rules-authority-registry.js`。负向自检：`node --test scripts/rules-authority-doc-check.test.js`。 | — | — | — | `RULES_INDEX.md` · `WORKFLOW.md` · `focus-tiger-regression-lock.mdc` | 2026-07-23 |
| StateManager 合法转移 warn（不阻断） | 纯后端 | 仅单元测试覆盖 | `StateManager.test.js`：非法转移仍写入但 `console.warn`；合法路径无 warn；**BREAK 已删**。**单测 harness** `MoodController.test` 会打出 `IDLE → CELEBRATE` warn（跳步），属预期。观察册：`EDGE_CASES.md` | — | — | — | `src/core/StateManager.js` | 2026-07-22 |
| Honesty pending 丢失 abort（禁 `?? 30`） | UI可见 | 待人工测试 | **主路径**：Honesty 选时长 → 呼吸正常结束 → 仍记账 + **成功 toast**（`HONESTY_CHECKIN_RECORDED`）+ 桥接。**异常回流**：呼吸进行中若 pending 被清（如 force 重开竞态）→ **不得**记 30 分钟；须 toast（EN `HONESTY_PENDING_LOST` / ZH「请再选一次时长」）+ **重开时长三选一**（非白屏/卡住）；**不得**出成功 toast。375×667 看 toast 不被 dock 完全挡住。 | 2026-07-22：静默失败排查 #4；**单元/控制器** `HonestyCheckInController.test.js`（abort 不记账 / 调 pending-lost；**非** toast DOM）。**2026-07-22**：用户书面——`/?product=1`（端口 5174）**正常补登**路径测试 OK；并问「正常记账用户可能看不出来？」→ 已拍板加成功 toast。**异常回流仍待你复测**。 | — | — | `?product=1` · Honesty · toast `#mindful-acknowledge-toast` | 2026-07-22 |
| 门闩一体包 · Companion 点选→真实开表 | UI可见 | 待人工测试 | **主路径**：`?product=1` → Sit→Notice→Breath→**Choose** → 鞠躬后**展开 Companion** → 点 **Here & Now / Flow / Offline** → **立刻 Focusing**（不得再 Notice）。预选 / ⚡ 仍可直接开表。**回流（Scenario J）**：Focus→Rise（Skip Reflection）→ hint → **Here & Now / Flow → 立刻 Focusing**（**不得**再 Notice）。**Sit** 回流仍走完整 Arrival。冷启动未解锁时 Here & Now → Arrival（I2）。**375**：鞠躬后三选一须**在视口内**（`ft-narrow-stage-companion`），不得只剩 home 三球。 | **2026-07-22**：静默失败批 3。**2026-07-25**：Choose 后点选仍 Notice → 改鞠躬后展开 Companion。**同日再书面（5174）**：完整一场后 Rise → hint → Here & Now **又出 Notice**（不对，应立刻 Focusing）→ 根因 beginFocus/Rise 清掉门闩；已改为 Arrival/⚡ 解锁后跨会话保持；e2e J。 **2026-07-25 用户书面（5174）**：Sit→Choose Reading→鞠躬后见三选一（仍 Sit）→ Here & Now 立刻 Focusing、无 Notice — **测试 OK**。 **同日再书面（5174）**：Focus→Rise（Skip all）→ How shall we sit? → Here & Now **立刻 Focusing、无 Notice** — **测试 OK**。 **2026-07-26 用户书面（本分支 375）**：Yin 鞠躬后没有自动跳出三选一框（昨天刚验收又回潮）→ 根因：`ca20d07` stage 修复在 develop、本分支未合入；A4 不锁视口假绿。已回补 `onExpandedChange` stage + e2e `375 Choose bow…`（`toBeInViewport`）。**须复测 375**：Sit→Choose→鞠躬后见三选一。 | — | — | `?product=1` · e2e A/A4/A4b/J + `375 Choose bow` · `#btn-focus` / `#ft-narrow-home-sit` | 2026-07-26 |
| 静默失败观察册 EDGE_CASES | 纯后端 | 仅单元测试覆盖 | 审计边角入库；批 1–3 已记入。不代替 TEST_TRACKER 验收行。 | — | — | — | `docs/EDGE_CASES.md` | 2026-07-22 |
| Lit 试点 · OnboardingHintsUI（步 4） | UI可见 | 有问题 | **主路径**：实验室「清空引导提示已读」→ 见 `help-affordance`（Lit **薄荷绿**气泡）。点 **?** → 本页全部锚点提示 + **App 用途简介卡**（标题/正文/知道了）。**回流**：关气泡后再点 ?；Rise 后 FOCUSING 再点 ?。 | 2026-07-21：Lit 试点。**同日书面**：① 恢复薄荷绿 ② 点 ? 另出简介卡。**2026-07-22**：用户书面 A 类——Hints 薄荷绿 + 点 ? 用途简介卡，**测试 OK**。 **2026-08-01 用户书面（图1 · §9 W5）**：宽屏点 ? 用途卡相对 ? 乱指；曾测正常。重开。 | legacy-unclassified | legacy · 暂不进逾期扫描；发布前人工过目 | `#onboarding-hint-help` · `#onboarding-app-purpose` · Brief | 2026-08-01 |
| 分散式即时提示 + 「?」补救（ONBOARDING_HINTS v3） | UI可见 | 已通过 | **主路径**：清空已读 → 左下 **?** 旁 `help-affordance`（**薄荷绿**）。点 ? → 本页 hints + 用途简介卡。**回流**：关卡后再点 ?。 | 2026-07-20：尖角/补救反馈。**2026-07-21**：恢复薄荷绿 + 用途简介卡。**2026-07-22**：用户书面 A 类，**测试 OK**。 | — | — | `#onboarding-hint-help` · 实验室「清空引导提示已读」 | 2026-07-22 |
| 人工 · help-affordance 尖角对准 ? | UI可见 | 已通过 | 1) 清空引导提示已读。2) `help-affordance` 在 **? 右侧**，尖角对准 ?，气泡为**薄荷绿**（非奶油米黄）。3) 回流：缩放后再看。 | 2026-07-20：尖角未对准。**2026-07-21**：恢复绿色式样。**2026-07-22**：与 Hints 薄荷绿批次一并 **测试 OK**。 | — | — | `?product=1` 或 `/` · `#onboarding-hint-help` | 2026-07-22 |
| 人工 · 点 ? 补救（可见锚点立刻出；⋯/抽屉折进芯片） | UI可见 | 有问题 | **契约**：有「?」的页面，点 ? → **此刻可见**的控件各出一条 tip（含首页 weekly chart）；只有藏在 ⋯ / 抽屉里的 chrome 折进「More tips」一次性芯片。**主路径（≥480）**：清空 hints → 点 ? → `weekly-heatmap` tip **立刻**出且尖角近左下热力图（不得等 more tips）；Sit/Quick Start/HUD 等可见项同出；芯片仅剩 `wide-more-menu`（无 N 倒计时）。**主路径（375）**：仍主条 Sit + 一次性 `narrow-drawer-menu` 芯片（不拥挤）。**回流**：关后再点 ?；Rise 后再点 ?。自动化：`e2e/onboarding-remedy-contract.spec.js` + `wide-idle-more-menu` park 行。 | **2026-07-30 用户书面（图）**：weekly tip 藏在 more tips — 产品契约本是「本页可见功能立刻出」。已改 `_hasOnScreenAnchor`。分支 `fix/onboarding-remedy-contract-and-wide-idle-menu`。 **2026-08-01 用户书面（图2 · Task3 §8 S3）**：窄屏 Focusing 期间点 ? → 一堆不相关 hints 叠出（不对）。 **2026-08-01 用户书面（图1 · §9 W5）**：宽屏点 ? 用途卡乱指右侧（曾正常）。根因见总验收行：purpose 避 tip 右移 + e2e 藏用途卡假绿 + 三球后 tip 更密。 **同日图3**：呼吸中点 ? 一堆乱象。 **2026-08-01 用户书面（日语 · Honesty 时长面板后点 ?）**：底部 tip「また座りたくなったら、いつでも。」（=`idle-after-session` / EN Sit again whenever…）**指向虚空**；估计英文同。根因：`honestyVisible` 仅 phase=`prompt`；时长/呼吸面板时 scene 仍当 Idle，? 补救出 sit tip，而 Honesty busy 已藏 Sit → `_positionBubble` 落空（同族 07-29 微仪式指空地）。 **2026-08-01 用户书面（P1-5 图 · Soundscape）**：面板打开时 sit tip「タップしてYinと坐る / Tap to sit with Yin」叠在曲单上（指虚空/错位）。 **Hints 工作流根因（查证）**：(1) `onPanelOpened` 只 `revealClickHint(ambient-soundscape)`，**不** `syncOnboardingAutoHints`，未清其它 tip；(2) `syncVisibleAutos` 对 `_clickExpandedIds` **跳过 hide**，已展开的 sit-button tip 会残留；(3) 面板盖住 Sit 锚点后 tip 仍画在面板上——与 Honesty/微仪式「指空地」同族：叠层/面板开时未抑制 sit tip。修复须：面板开 → 清 sit/idle-after-session；click-expanded 在 overlay 下不得豁免；补 e2e 锁。 **2026-08-02（#15）**：宽屏 park 后 `quick-start` tip/badge 锚在屏外 `#quick-start-focus`——已让 `_hasOnScreenAnchor`/`_positionBadge` 跟气泡同样 remap 到 `#ft-wide-home-quickstart`；其它 ? 乱象项仍「有问题」。 | legacy-unclassified | legacy · 暂不进逾期扫描；发布前人工过目 | `#onboarding-hint-help` · `#weekly-practice-heatmap` · `#ft-hint-catalog-chip` · e2e onboarding-remedy-contract | 2026-08-02 |
| Ambient 播放缓亮 Rim（presenceBoost + playing lift） | UI可见 | 已通过 | **验收口径（2026-07-22 起）**：不再以「音乐会加亮边缘金光」作产品承诺；Sound hint **不**宣传缓亮。底层 Rim lift 可保留实现，**不以可见缓亮为必测项**。 | 2026-07-19：文案称音乐会加亮。**2026-07-20**：用户反馈未见光效；Sound hint 已改不写加亮。**2026-07-22**：用户书面——「正式砍掉了宣传」+ **测试 OK**（关包口径=不宣传、不强制可见）。 | — | — | Sound 面板 · DEMO 1min 会话 | 2026-07-22 |
| 用户场景剧本 SCENARIO_TESTS（A–H + I–P） | UI可见 | 待人工测试 | 权威：`focus-tiger/docs/SCENARIO_TESTS.md`。用 **`?product=1`** 走完整故事串。**新增 O**（7 格热力图）· **P**（应用内提醒 + suppress/defer 说明）。**单元/控制器** `npm run test:smoke`；**DOM 用户链路** `npm run test:e2e`（覆盖层见文首 §A 与 SCENARIO 各场景标题——**全绿 ≠ 故事走完**）。**观感子项已拆成下方独立行，勿只勾本行。** | 2026-07-22：新增正式场景 O/P。**2026-07-25 用户书面（5174 · P0）**：场景 **C**（中途 Rise）**测试 OK**；场景 **P** **测试 OK**；场景 **O** **图1–12 相关项测试 OK**（wide-idle 07-26；见 L228）。 | — | — | `SCENARIO_TESTS.md` · `?product=1` | 2026-07-26 |
| 场景冒烟自动化 scenario-smoke（A–D + I/J · 逻辑层） | 纯后端 | 仅单元测试覆盖 | `scenario-smoke.test.js`（**10** 条控制器/门闩用例）+ `localStateKeys.test.js`（重置 L-logic）等并入 `npm run test:smoke`。覆盖：门闩/完成反馈分流/Re-focus 抑制/`SessionEndFlow` 入参/Honesty 桥接回调/**I·J hint→toggle 纯函数**。**不含**浏览器 DOM、**不含**序列观感；smoke C **不**等于 Choose→Reflection 全链。 | 2026-07-20：Task 1 补 smoke I。**2026-07-21**：并入重置白名单/新用户读数。**2026-07-22**：口径收紧（层/范围）。 | — | — | `scenario-smoke.test.js` · `localStateKeys.test.js` | 2026-07-22 |
| 人工 · How shall we sit? 立刻展开三选一 | UI可见 | 已通过 | 1) `?product=1` 重置本地状态。2) **不要点 Sit**，直接点 **How shall we sit?**。3) 须**立刻**出现 Here & Now / Offline Space / Flow State 三选一，**不是**「What is present right now?」Arrival 框。4) 回流：Rise 结束后再点 hint 仍展开三选一。 | 2026-07-20 用户书面：点 How shall we sit? 出 Arrival 框不对。**2026-07-25 用户书面（5174）**：**测试 OK**。 | — | — | `?product=1` · `.session-start-dock__hint` | 2026-07-25 |
| 浏览器 e2e 产品壳冒烟（Playwright） | 纯后端 | 仅单元测试覆盖 | `npm run test:e2e`（**2 条**）：`?product=1` 见 Sit、无调试面板；实验室有「重置全部本地状态」。 | — | — | — | `e2e/product-shell.smoke.spec.js` | 2026-07-20 |
| 浏览器 e2e harness · storage wipe + static webServer | 纯后端 | 仅单元测试覆盖 | **2026-07-26/27 根因**：`openFreshProductShell` 曾在**每次**导航 wipe `focus-tiger.*`，heatmap seed→`reload()` 后种子被清 → `expected lit for YYYY-MM-DD`（日期来自 `shift(-6)` 相对日，**非**硬编码产品日、**非**产品 lit 逻辑错）。已改为 **每 browser context 只 wipe 一次**。全量套件：`npm run build` + **Node `scripts/e2e-static-server.js`**（替 vite preview，避中途 goto 风暴）。**`playwright.ci-preview.config.js` 已对齐同一 static server**（`:5180`，与主 harness 一致；来自 stash WIP 收尾）。**2026-07-28**：补上产品壳 ready 门闩，`page.goto(...domcontentloaded)` 后继续等待 `window.__FT_APP_READY__`，并把 **CI `gotoMs` 从 25s 提到 40s** 作为容错边际；本地 `wide-idle-more-menu` 样本启动已转绿，其它长 spec 仍见零星 `goto` 超时，待看全量 CI retry / cancelled 是否明显下降。e2e hook 生产构建暴露：`__honestyBridge` / `__inAppReminder` / `__dailyCompletionStore` / `__companionModePicker`。实验室 reset 钮仅 vite serve 有；preview 下该用例 skip。窄屏 catalog tip 抬升 + e2e poll。覆盖层：**DOM e2e** harness；**不**锁序列观感。 | — | — | — | `e2e/helpers/product-shell.js` · `playwright.config.js` · `playwright.ci-preview.config.js` · `scripts/e2e-static-server.js` · `src/main.js` · `OnboardingHintsUI.js` | 2026-07-28 |
| CI 定时全量 e2e + 环境/密钥隔离基线 | 纯后端 | 仅单元测试覆盖 | **已收口（2026-08-02）**：夜间 `schedule`（UTC 02:00）+ dispatch；YAML 在 `main`（120m · #47；Plan A 2 shard + JUnit always · #63），checkout **`develop` tip**。基建验 [#15](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/actions/runs/30707227694)；#74 后 dispatch 绿 [#30712008401](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/actions/runs/30712008401)（JUnit 68/0 fail）。无 Actions API Key。隔离：`ENV_CONFIG.md`。残留：偶发 goto flake（另项）；是否挂 PR 门另议。 | — | — | — | `ENV_CONFIG.md` · `.github/workflows/focus-tiger-e2e-full.yml` · `playwright.ci-full.config.js` · `pr-smoke.yml` | 2026-08-02 |
| Plan A 全量 e2e #15 稳定红（阿寅 / Notice tip / ?+⚡） | UI可见 | 待人工测试 | **背景**：[#15](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/actions/runs/30707227694) Failure 但已有 JUnit；4 条稳定红。**修（#74）**：`language-switch`→阿寅；Arrival `notice` tip 勿被 `#btn-focus` park-remap 抢走；`_hasOnScreenAnchor`/`_positionBadge` 与气泡同用宽窄 park remap；`quickStartVisible` 认首页 ⚡ 球；CI-full `trace: off`；宽 Arrival 断言 `#ft-wide-home-quickstart`。**CI**：全量 dispatch [#30712008401](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/actions/runs/30712008401) **JUnit 0 fail**（自动化层已绿）。**主路径（仍须人工观感）**：宽 Idle 见 ⚡ badge；点 ? 见 quick-start tip；375 Sit→Notice 见 tip，点 tip 只关 tip。**回流**：Rise 后再测 ? / Notice。 | — | — | — | `OnboardingHintsUI.js` · `main.js` · `language-switch.spec.js` · `playwright.ci-full.config.js` | 2026-08-02 |
| Ambient · 窄宽对账填表（audit brief） | 纯后端 | 仅单元测试覆盖 | **2026-07-31**：按代码+既有 e2e/unit 填 `audit-narrow-wide-ambient-parity.md` 10 项。✅ 1–4/7–9；⚠️ 5–6（静音/续播 DOM）、10（Focusing 换曲可闻）；既有红：micro-ritual sit tip、抽屉挡 ♪。未本机重跑 Playwright。下一步见 brief「建议下一步」。 | — | — | — | `docs/task-briefs/audit-narrow-wide-ambient-parity.md` | 2026-07-31 |
| 375 窄屏 Reminder 面板 staged 不溢出视口 | UI可见 | 已通过 | **375×667**：`?product=1` Idle → 上滑抽屉 → 点 Reminder → `#reminder-preference-panel` 须完全在视口内（`left ≥ 0`，右缘 ≤ 375）。**回流**：关面板 → 再开。**自动化**：e2e `weekly-practice-heatmap.spec.js` Reminder boundingBox 断言。验收须注明 **commit + worktree + 端口**（见 `COLLAB.md` §五）。 | **2026-07-27**：DevTools 见面板 `left: -50.5px` 被截断。已改窄屏居中 / stage pin（`6e32bcf` → PR#10）。**2026-07-29 用户书面（wt-docs-6.6 · develop @ a1dbc9c · :5173 · 375）**：不溢出，正常了 — **测试 OK**。 | — | — | `?product=1` · `.ft-narrow-grabber` · `#reminder-preference-panel` · e2e `weekly-practice-heatmap.spec.js` | 2026-07-29 |
| 窄屏 ActionBar · 常显本机墙钟（非会话计时） | UI可见 | 待人工测试 | **主路径（375）**：Idle / Arrival / Focusing 顶栏 ActionBar（? · 时间 · ♪）**均可见**；时间为本机墙钟（如 `12:30`），**不是** `00:00` 会话累计。Focusing 时左上 `#focus-hud` 仍显示会话 elapsed（与 ActionBar **共存、分工**）。**回流**：Rise → Idle 仍是墙钟。 | **2026-07-27 用户书面（三 Bugs · 第三）**：顶栏时有时无、总是 `00:00`，改电脑时间。**2026-07-29**：正确基线复测仍 `00:00`（未实现）。**同日**：产品拍板常显 ActionBar + 墙钟；会话计时留在 FocusHUD。 | — | — | `.ft-narrow-action-bar` · `#focus-hud` · `NarrowIdleShell` | 2026-07-29 |
| 浏览器 e2e 场景 A/I/K Companion DOM（Playwright） | 纯后端 | 仅单元测试覆盖 | `npm run test:e2e`：**I** hint 开面板；**I2** 未就绪 Here&Now → Arrival；**A/A4/A4b** Choose→Companion→开表；**J** Rise 后 Here&Now 开表无 Notice；**A2/A3** 预选→⚡；**K** Offline；**Notice/Choose 点外侧** → Idle；**375 tip 只关 tip**（`tip click closes tip only`）。 | 2026-07-21：Offline 二次 Sit 已废除。**2026-07-25**：补 A4 / 外侧取消 / **J 回流** / **tip≠外侧**。 | — | — | `e2e/scenario-a.companion.spec.js` | 2026-07-25 |
| 人工 · A1 Idle 开局（非 Sleeping） | UI可见 | 已通过 | 1) 实验室「重置全部本地状态」。2) 开 `?product=1`。3) 确认阿寅是 **Idle 闭目坐禅**，**不是**睡着。4) Honesty 可忽略提示可见。5) **右上**见音符钮（默认有声，可静音）。 | **2026-07-21**：用户书面——第一幕不能睡觉；须 Idle + 默认音乐。旧「A1 睡着已通过」口径作废。**同日晚**：用户确认原 8 条独立行批次全部关闭（含本行 Idle 开局）。 | — | — | `?product=1` · 重置按钮在 `/` | 2026-07-21 |
| 人工 · Idle 统一 pingpong 不闪（序列） | UI可见 | 已通过 | 1) 「坐禅闭眼」或「重置并 idle 坐禅」。2) 闭目段 ×2 + 睁眼弧 ×1 循环，段间无闪白/叠化。3) 回流：Rise 后再 idle。 | 2026-07-20：切分降睁眼频率。**2026-07-20 用户书面**：各情况测试 OK；**晚**：再次确认「已经解决」。 | — | — | `/` · DEV `__idleOrchestrator` | 2026-07-20 |
| 人工 · Arrival Notice 观察短句可读完 | UI可见 | 已通过 | 1) Sit → Notice 点 Okay（或 Calm）。2) 观察式短句须能读完（约 2.4s）再进呼吸。3) 回流：Rise → 再 Sit → 再点一次 Notice。 | 2026-07-20 晚：用户书面「测试 OK」。 | — | — | `?product=1` · Sit → Notice | 2026-07-20 |
| 人工 · 静音图标 + Sound | UI可见 | 有问题 | 1) `?product=1` 重置后进入。2) **右上**音符钮静音/恢复。3) **右下 Sound 始终可见**（未专注略淡）。4) **Sit 开计时** → 点 Sound 展开选曲 + 音量。5) **Rise → 音乐须自动停**；面板收起、Sound 仍可见。6) 再 Sit → 若未永久静音过，音乐可再开。 | **2026-07-20**…**2026-07-21 晚** OK。**2026-07-25**：改自动停播口径，**须复测**第 5–6 步。 **2026-07-25 晚用户书面**：**测试 OK**（含 Rise 自动停播 / 再 Sit 不自动再开）。 **2026-07-29 用户书面**：右上音符须与菜单 Sound 同效 → 验收改走「右上音符 = 菜单 Sound」新行。 | legacy-unclassified | legacy · 暂不进逾期扫描；发布前人工过目 | `?product=1` | 2026-07-25 |
| 人工 · Re-focus 真实切页 >60s | UI可见 | 已通过 | 1) **`/?sessionMinutes=5`**。2) **Here & Now** 开表 → 切走 **70–90s** → **须有**观察式文案 + nod-bow。3) **对照 Flow State**（或 Offline）：同样切走 &gt;60s → **须无** Re-focus（无文案、无 nod-bow；timer 可继续）。约 10s 回来无反应属正确。 | 2026-07-21：用户书面 Here&Now/Sit 路径 **测试 OK**；Flow「貌似不对、不匹配」→ 产品预期即与 Here & Now **不同**：Flow **故意无**文案+nod-bow。**同日晚**：用户确认原 8 条独立行批次全部关闭。 | — | — | `/?sessionMinutes=5` · 场景 B / F | 2026-07-21 |
| 人工 · Celebrating / 同日 SessionComplete 观感 | UI可见 | 已通过 | 1) 实验室「重置全部本地状态」。2) 可先 Honesty 或不做。3) Sit→Companion→等 DEMO **满 1 分钟自动达标**（也可达标后再点 Rise）→ 须见 **Celebrating 舞**。4) 同日再达标 → 只摆尾。 | 2026-07-21：用户书面——这几天很多次 focus 超过一分钟，从未见过 Celebrating 舞；已修。**2026-07-21 复测**：`/` 满 1 分钟见舞；`/?sessionMinutes=5` 满 5 分钟见舞；同日第二次 1 分钟达标 → 只撅屁股摆尾、不再 Celebrating；测试 OK。**同日晚**：`/?product=1` 再次确认第 4 步（同日第二次满 1 分钟 → 摆尾非跳舞）；用户确认原 8 条独立行批次全部关闭。 | — | — | `/` · `/?product=1` · `/?sessionMinutes=5` | 2026-07-21 |
| 人工 · Honesty 桥接后完整 Arrival UI | UI可见 | 已通过 | 1) 重置本地状态 → DORMANT。2) 走 Honesty 选 20 → 呼吸结束。3) 桥接点 **Yes** → 须走完整 Arrival（Welcome→Notice→Breath→Choose）再 Companion，**不**直接开表。4) 另测 **No** → idle、无二次挽留。 | 2026-07-20 晚：用户书面「测试 OK」。 | — | — | `?product=1` · 或实验室 Honesty | 2026-07-20 |
| DEV 一键重置全部本地状态 | 纯后端 | 仅单元测试覆盖 | **L-logic**（勿人工逐 key）：`npm run test:smoke` → `localStateKeys.test.js` 锁白名单=各模块 STORAGE_KEY、脏态 clear 后 Store 等同新用户、session toast/boot-idle 一次性。按钮壳：`e2e/product-shell.smoke.spec.js`（实验室可见；`?product=1` 不可见）。 | 2026-07-20：重置后 Honesty=场景 A 正确开局。**2026-07-21**：用户书面——人工难验「参数是否复原」→ 应 L-logic；已改仅单元测试。 | — | — | `src/core/localStateKeys.test.js` · `#dev-reset-all-local-state` | 2026-07-21 |
| 产品壳链接 ?product=1（隐藏调试面板） | UI可见 | 待人工测试 | 打开 `/?product=1`：无右上角情绪调试条；Sit / How shall we sit? / Honesty / Arrival / Sound 仍可用。打开 `/`：调试面板在。 | — | — | — | `http://127.0.0.1:5173/?product=1` vs `/` | 2026-07-19 |
| 人工 · "Or begin from here." hint 侧面显示 | UI可见 | 已通过 | 1) `?product=1` 重置本地状态进入 Idle。2) 确认「Or begin from here.」onboarding hint 气泡从 **Sit 按钮右侧**弹出（不再从上方遮住 Sit 按钮）。3) 回流：Rise 后再看 idle chrome，hint 若再次显示仍应在侧面。 | 2026-07-21：用户书面——挡住 Sit，应改到侧面。**2026-07-22**：用户书面 A 类，**测试 OK**。 | — | — | `?product=1` · `.session-start-dock__hint` | 2026-07-22 |
| 窄屏 · 自动 onboarding 互斥（≤1 条） | UI可见 | 已通过 | **主路径（375×667）**：实验室清空引导已读 → `/?product=1`。冷启动同一时刻自动气泡 **≤1**（优先 `help-affordance`，关掉后串行 Sit / How shall we sit? 等）。**回流**：点气泡关掉 → 下一条出现；点 **?** 见情境主条 +「还有 N 条」芯片 + 用途简介卡（点芯片逐条展开，非一次铺开）。**横屏 667×375**：自动仍 ≤1、不退化。**桌面 ≥900**：互斥同样生效；尖角对准 ?。 | 2026-07-21：用户同意 Task 1；截图去掉叠加后观感可。**单元**：`selectExclusiveAutoHintIds`（互斥 id 列表；**非**窄屏 DOM 叠放）。 | — | — | `?product=1` · DevTools 375×667 **2026-07-27**：375 tip 不重叠 OK。 | 2026-07-21 |
| 窄屏 · Sit with Yin 主 CTA 不截断 | UI可见 | 待人工测试 | **主路径（375×667）**：`#btn-focus` 须完整显示 **Sit with Yin**（禁止「Sit w…」）；可点进 Arrival。切中文后「与阿寅同坐」亦完整。**回流**：Rise → 再 Idle 仍完整。**横屏**：不退化。 | 2026-07-21：Task 1；dock 加宽 + white-space normal。 | — | — | `?product=1` · `#btn-focus` | 2026-07-21 |
| Hints · 背景音乐 opt-in 提示锚右上 mute（非右下 Sound） | UI可见 | 待人工测试 | **主路径**：`?product=1` 重置 hints → 见 `ambient-soundscape` tip 文案 **EN「Tap for music, if it helps you settle.」** / JA「落ち着きたいときは、タップして音楽を。」 / ZH「想安定下来，就点这里放点音乐。」→ 尖角指右上 `.ambient-soundscape__mute`（375 remap `#ft-narrow-mute-btn`），**不得**指右下 Sound FAB。**桌面悬停**：未读时悬停音符亦出 tip。**回流**：点「?」补救；点音符开面板。 | **2026-07-22**…**2026-07-29**：锚 mute。**2026-07-30**：文案收短（欧美习惯）；补宿主 hover。 **2026-08-01 用户书面（P1-2）**：清 hints → 右上音符 mint 脉冲；仅选曲后消失；Rise 不清；悬停 tip — **测试 OK**。 | — | — | `HINT_AMBIENT_SOUNDSCAPE` · `.ambient-soundscape__mute` · `#ft-narrow-mute-btn` | 2026-08-01 |
| Hints · Registry SSOT + md 锚点块 + anchorGroup | 仅单元测试覆盖 | 仅单元测试覆盖 | `npm run test:smoke` → `onboardingHintRegistry.test.js`（1:1 派生、locale、anchorGroup 内 selector 互异）；`npm run hints:doc-check`（`test:smoke` 末尾 + CI 独立 required check）；改 registry 后须 `npm run hints:doc-sync`。 | **2026-07-22**：用户批准 Registry 方案 A；ambient 组；删硬编码 `.fab`/`.mute` 单测。 | — | — | `onboardingHintRegistry.js` · `scripts/hints-doc-check.js` | 2026-07-22 |
| 人工 · Sound gated 提示文案（非专注时点 Sound） | UI可见 | 已通过 | 1) `?product=1`，**不**点 Sit（未专注）。2) 点右下角 **Sound 按钮**，须出现提示：**「Track selection opens once you sit.」**（不再说「Sound opens after sitting begins.」）。3) 回流：Sit 开计时 → 点 Sound 须正常打开面板，无提示。 | 2026-07-21：用户书面——旧句失实；已改 HINT_AMBIENT_GATED。**2026-07-22**：用户书面 A 类，**测试 OK**。 | — | — | `?product=1` · `.ambient-soundscape__fab`（未专注） | 2026-07-22 |
| Honesty Check-in 小钮（零完成起常驻） | UI可见 | 已通过 | **主路径**：实验室「重置全部本地状态」→ `?product=1` → Idle 即见 **Honesty Check-in** 立体小钮（Sit 上方），**无需**先完成计时。**勿**再自动弹出旧版长句卡片（`HONESTY_CHECKIN_PROMPT`）。点钮 → 时长三选一 → 呼吸。**回流**：计时达标 / Rise 后再 Idle 小钮仍在。 | 2026-07-21 晚：零完成即 Honesty 场景；取消旧浮动长句卡片、小钮常驻。**同日晚**：Offline Space 说明改桌面口径。**2026-07-21 晚**：用户书面——重置本地状态 → `?product=1` 开局即见小钮、不再弹长句卡片，**测试 OK**。 | — | — | `?product=1` · `#honesty-idle-entry` | 2026-07-21 |
| Companion · Offline Space 说明文案（桌面优先） | UI可见 | 待人工测试 | How Shall We Sit? → **Offline Space** 说明须表达：**别处练习 + 此页继续计时 + 离开不算分心**；**禁止**「Lock your phone」等纯手机表述。 | 2026-07-21 晚：用户书面——电脑版且 lock phone 语义不对。 | — | — | `?product=1` · `.session-start-dock__option` Offline | 2026-07-21 |
| Sit with Yin 主按钮尺寸（恢复紧凑 pill） | UI可见 | 已通过 | **主路径**：`#btn-focus` 应为**内容宽度**紧凑 pill（约 `13×36` padding），**不要**拉满 dock 整行宽。**回流**：Rise 后再 Idle 尺寸仍对。**窄屏 375px**：文案完整可读即可。 | 2026-07-21：Task1 全宽变丑已修。**2026-07-21 晚**：用户复测 OK。 | — | — | `?product=1` · `#btn-focus` | 2026-07-21 |
| 宽屏 · 首页三球统一（代替 Sit+⚡ pill） | UI可见 | 待人工测试 | **产品拍板（2026-07-31）已实现**：≥480 Idle 首页 **`#ft-wide-home-ctas`** 同序三球 + `#ft-wide-more-btn`；Sit+⚡ pill / Honesty dock park；⋯ **无** Honesty 行。**主路径**：`?product=1` 宽屏见三球；点 Sit → Arrival；Arrival 仅 Quick 球；点 Quick → Focusing；⋯ 开 How/提醒。**回流**：Rise 后再见三球。**断点**：375↔480 无双壳叠点；375 不回退。自动化：`e2e/wide-idle-more-menu.spec.js` + orchestration/facade 单测。Brief `task-wide-home-three-ball.md`。 | **2026-07-31**：用户同意宽屏首页三球；同日实现于 `feature/wide-home-three-ball`。**须人工**：宽屏 Idle 三球观感 + Arrival/Focusing/Rise；375 回归一眼。**同日 CI**：PR smoke 曾红——dock observer 自触发冻页 + `syncHonestyIdleEntry` 冲掉 `keepQuickStart`；已修；本分支已 merge origin/develop 解文档冲突，待 CI。 **2026-08-01 用户书面（Task3 §8）**：每次点 Rise 后屏幕短暂出现旧「Sit with Yin」橙色按钮再很快消失→不对，应删除该闪现。 **2026-08-01 用户书面（§9 W3 图2）**：Choose 后立刻显示 Sit/Honesty/⋯；Arrival/Breath 全程应仅 Quick。 **同日**：Rise 后闪旧 Sit+一列按钮（宽+窄同族）。 **2026-08-01 用户书面（图 · Honesty 呼吸）**：宽屏 Honesty check-in 后仍见**三球**+ Sit tip；应**仅留 Quick**（同 Arrival）。实现缺口：`keepQuickStart` 只绑 `arrivalOpen`；honestyBusy 时 wide 仍 `showHome` 全三球。 **2026-08-01 本地修（分支 `fix/chrome-only-quick-and-rise-flash`）**：`keepQuickStart` 扩至 honestyBusy / companionExpanded / postChoosePending；Rise 时先 `onIncompleteSessionEnded`→IDLE 再 `resyncSessionChrome`；宽屏 Idle 默认 park dock Sit（`ft-wide-show-dock-rise` 仅 Focusing）。单测已锁。**须人工复测**后关单。 | — | — | `?product=1` · `#ft-wide-home-*` · `#ft-wide-more-btn` · e2e wide-idle-more-menu | 2026-08-01 |
| 窄屏 · 主屏三主钮（Sit / Quick Start / Honesty） | UI可见 | 待人工测试 | **主路径（375×667 · `?product=1`）**：Idle 见 `#ft-narrow-home-ctas`——顺序 **Quick Start · Sit with Yin · Honesty**；三个 **PNG 图腾圆球**（`public/icons/` **v3** cream 底，`?v=4`），约 **72×72**；三球 **全宽均匀**（`space-evenly`）。**观感**：图腾内边距约 17–21%（相对 v2 更疏）；无 CSS contrast filter。**Arrival 开着时**仅留 Quick Start 球（Sit/Honesty 藏）。点球 → 同桌面语义。**Honesty 不得因 `#honesty-idle-entry` 尚未创建/attribute-hidden 而 `disabled`+淡化**（壳 `display:inline-flex` 曾盖过 UA `[hidden]`，会留下虚影）。**首次 hints**：`quick-start` / `sit-button` / `honesty-optional`。**抽屉**：不得再出现这三项。**回流**：Rise → 三球再出现。**宽屏 ≥480**：亦为同序三球 + ⋯（见上行）；本行仍锁窄屏 DOM/观感。**DOM**：e2e 锁顺序 + aria-label + Honesty 可点 + 抽屉无三主钮。 | **2026-07-26**：三主钮上屏 → 圆球 SVG → PNG 图腾。**同日晚书面**：Sit 须居中；Honesty 虚/不可点 → 已改；顺序/满色 OK；**三球太近** → `space-evenly`；**Arrival 丢 Quick Start** → keepQuickStart；**Breath 仍藏 Sit** → `arrival-breath-sit-still-hidden`（宽+375）。 **2026-07-26 用户书面（5176 · 375）**：三主钮顺序/72px/均分/Honesty 满色 — **测试 OK**；仅换图案不重开验收。Arrival 仅留 ⚡ 后点 ⚡ **没反应** → 已修（代理勿因 dock hidden return）。**2026-07-26 夜**：v2 扁平 + CSS filter 试看；Arrival ⚡ 代理已修。 **2026-07-27**：根目录入库 **v3** cream 图腾（替 v2，`?v=4`）；去掉试看 filter；边距反馈见回复（略疏，待拍板是否收紧或放大球）。 **2026-07-30 用户书面**：希望窄屏三球**统一到宽屏首页**。 **2026-07-31 用户书面**：同意「宽屏首页也用三球」— **产品拍板**；实现见上行。 | — | — | DevTools 375 · `/icons/icon-*.png` · `#ft-narrow-home-*` | 2026-07-27 |
| Companion · Offline 禁止二次 Sit | UI可见 | 已通过 | **主路径**：How shall we sit? → **Offline** → **立刻 Focusing、无 Arrival**（与上行「跳过 Arrival」一致）。若经 Sit 先进 Arrival，点选 Offline 仍立刻开表、**禁止**再点 Sit。**对照**：Here & Now / Flow 门闩未就绪仍走 Arrival。 | **2026-07-21**：Offline 禁止二次 Sit。**2026-07-25**：与「Offline 跳过 Arrival」对齐。**同日用户书面（5174）**：Offline 一次 Sit — **测试 OK**。 | — | — | `?product=1` · e2e K | 2026-07-25 |
| 3D Idle GLB 换装（无红边单色灰棉麻） | UI可见 | 待人工测试 | 1) `npm run dev` 打开应用。2) 调试面板点 **T-Pose**（或临时让 PoseManager 显示 canvas）以露出 3D 垫底。3) 确认阿寅闭目坐禅袍为**单色暖浅灰棉麻 / 茶服风**，**无深红镶边/红里子**；棉麻织纹应清晰（勿呈糊成一团的过度压缩感）。4) 刷新后默认 2D 主线仍隐藏 3D；路径仍为 `/models/tiger-meditate-closed.glb`（约 **1.6MB**，非 292KB）。 | — | — | — | `http://127.0.0.1:5173/` · `#emotion-debug-ui` T-Pose · 源：`yin-meditate-closed-monochrome-grey-cotton-linen-robe.source.glb` | 2026-07-19 |
| 375 · How shall we sit 不得再出 Honesty dock pill | UI可见 | 待人工测试 | **主路径（375）**：上滑抽屉 → **How shall we sit?** → 只见三选一面板 + 底「How shall we sit?」钮；**不得**在面板上方再出 **Honesty Check-in** 文案 pill（Honesty 只在主球）。**回流**：Choose 鞠躬后自动 stage Companion 同样不得出 Honesty pill。宽屏 ≥480 dock 里 Honesty 仍可常驻（本行只锁窄屏）。 | **2026-07-27 用户书面（图1）**：点 How shall we sit 又跳出 Honesty Check-in（以前没有）→ 根因 `ft-narrow-stage-companion` 亮 dock 时漏藏 `#honesty-idle-entry`（主球上屏后 Honesty 已迁出，stage 只藏了 Sit/⚡/呼吸）。已 CSS 补藏 + e2e。 | — | — | DevTools 375 · `?product=1` · e2e `375 companion stage: Honesty…` | 2026-07-27 |
| Hints · 窄屏抽屉说明 one-shot（`narrow-drawer-menu`） | UI可见 | 待人工测试 | 同「点 ? 补救」行：375 点 ? → More tips → **一条**抽屉说明指 grabber；无 3/2 more；抽屉关闭时不得出 weekly-heatmap 等尖角乱指。单元：`OnboardingHintsStore.test.js`；DOM：`weekly-practice-heatmap.spec.js` catalog 行。 | **2026-07-27 用户书面（图2）**：见上补救行。 | — | — | `HINT_NARROW_DRAWER_MENU` · `.ft-narrow-grabber` | 2026-07-27 |

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
- 「严重度」/「处理承诺」：无缺陷填 `—`；缺陷见文首「缺陷分级与处理承诺」。
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
   同时填写「严重度」与「处理承诺」（见文首「缺陷分级与处理承诺」）；
   `release-blocker` 须加 open-blocker 锚点。处理完成后再改回"待人工测试"
   等待用户复测，不要自行改成"已通过"。
6. 从 2026-07-19 起：凡用户书面反馈某功能相关界面/操作的测试意见，
   即使本回合未立刻开修，也必须记入对应行的「用户反馈」列；见文首
   「用户测试反馈记入规则」。
```
