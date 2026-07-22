# TEST_TRACKER.md — 功能验收追踪表

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
5. **修复收尾自动本地 commit**：不必再问「要不要 commit」；**push 仍须用户明确要求**。  
6. **Bug 修复须同批更新相关项目文档（N15）**：至少本表；触及行为/情绪/架构时同步权威 md。缺文档或未 commit = 未完成。

### 自动化回归锁 vs 近几日用户 bug（2026-07-20 · Task 1 后）

**重要**：`npm run test:smoke` / `npm run test:e2e` **不会替用户「验收通过」**，也**不是**把 bug 修好了——它们是 **防「修了又丢」的回归锚**。下面区分三类：

| 类别 | 含义 |
|---|---|
| **代码已修** | 某轮 commit 里改了实现；你仍可能要人工看观感 |
| **自动化已锁** | CI/本地跑冒烟时会拦住同类回归；**全绿 ≠ 观感 OK** |
| **仍须人工** | 序列/布局/时长/Safari 等 L-eyes，自动化刻意不测 |

#### A. 代码已修 + 今日自动化已锁（再犯同类逻辑/DOM 错应被冒烟拦住）

| 用户反馈 / bug 主题 | 代码修复（早前） | 自动化锚（2026-07-20） | 仍须你人工看什么 |
|---|---|---|---|
| How shall we sit? 点了没反应 / 须展开三选一 | `resolveCompanionHintClick` + CompanionModePicker | **smoke I** + **e2e I**（hint → `.session-start-dock__panel`，**不**出 Arrival） | Honesty 开着时点 hint 的**文案/动效** |
| Here & Now 选中应立刻开计时 | `canBeginFocusOnCompanionModeSelect` | **smoke A3–A4** + **e2e A**（HUD Focusing、计时走动） | Choose 后**点头/pingpong 观感**、Safari 底部横排 |
| Offline 选中即开表（禁止二次 Sit） | `shouldAutoStartFocusOnModeSelect` | **smoke A4** + **e2e K**（Arrival 后选 Offline → 立刻 Rise） | Offline 离开期间 Re-focus **不出现**（场景 E） |
| Skip — begin 半卡 Sit / 门闩静默 | `shouldBeginFocusOnArrivalReady` 等 | **smoke A3–A4**（门闩 false 时不可 begin） | Skip 后**是否立刻 Rise** 的完整手感（e2e 走 Skip 步进，未测 Skip — begin 一键） |
| 同日首次 Celebrating vs 二次 SessionComplete | `session-completion-feedback` + `celebrated` 戳 | **smoke A7–A8**（含 Honesty 不挡舞）+ `resolveRiseClickDuringFocus` | **动画本身**（人工 · Celebrating 行） |
| Rise 未达标 → Reflection + 意图回显 | `SessionEndFlow` | **smoke C** + **smoke J** | **rise-stretch-casual 观感**、Reflection 淡入 |
| Honesty 桥接 Yes/No | `HonestyBridgeCtaController` | **smoke D** | **桥接 UI 排版**、Yes 后完整 Arrival（人工 · Honesty 桥接行） |
| Re-focus 在 Offline/Flow 应抑制 | `shouldSuppressAwayReminders` | **smoke B** | **真实切标签 >60s**（人工 · Re-focus 行） |
| Sit 误开 Honesty | z-index / 门闩（你已标已通过） | 无专门 e2e | 维持「已通过」；自动化未单列 |

#### B. 代码已修或已改，但自动化**锁不住**（必须继续人工 / TEST_TRACKER 分列）

> **本表 = bug 主题索引**（为何自动化帮不上、该去测哪一行）。**不是**可执行步骤本身。  
> **行号** = 下方 `## 功能清单` 表格在 **本文件** 中的当前行号（Cursor / GitHub 可 `#L166` 跳转）。增删功能行后须同步改本表。  
> **场景 checklist**（A1 DORMANT、重置按钮等）在 **L178–L185** 的 `人工 · …` / DEV 重置块，与 §B 互补、勿混为一谈。

| 用户反馈 / bug 主题 | 状态 | 为何自动化帮不上 | 功能清单行号 → 去测 |
|---|---|---|---|
| Idle 呼吸→眨眼/一瞥 **闪一下** | 已通过 | L-eyes / L-contract；e2e 不看像素 | **[L204](#L204)** `人工 · Idle 统一 pingpong 不闪` · **[L150](#L150)** `IdleOrchestrator / 坐禅闭眼` · 契约 `IdleOrchestrator.test.js` |
| Safari Companion **底部横排**仍挡/错位 | 已通过 | e2e 未测 WebKit 布局 | **[L126](#L126)** `Companion Mode`（Safari 专项） |
| Choose **pingpong + 1s 叠化** | 已通过 | 动画帧级 | **[L120](#L120)** `Arrival Choose 点头 pingpong→idle` · 可选 **[L121](#L121)** 完整 Arrival 串联 |
| Notice 短句 **2.4s 可读** | 已通过 | 时长观感 | **[L119](#L119)** `Notice 点选后` · **[L205](#L205)** `人工 · Notice 短句可读完` |
| Idle 突然东张西望 | 已通过 | 已关随机池；无自动调度单测 | **[L123](#L123)** `调试面板 · 全入库素材` · **[L140](#L140)** `idle / 坐禅闭眼呼吸基底` |
| 靠近自动点头 | 已通过 | 行为已拆；无 e2e | **[L139](#L139)** `PointerInteraction · 靠近点头 nodGreeting` |
| Rise → **LightProgression** 金晕 | 已通过 | 视觉 + 产品语义 | **[L149](#L149)** `LightProgression / 光影物理渐进` |
| Sleeping 太慢/太快、MilestoneGlow 等 | **有问题** | 观感 | **[L156](#L156)** Sleeping · **[L133](#L133)** MilestoneGlow |
| Ambient Sound **入口**（未计时提示 / 开表后可展开） | 已通过 | 入口行为已验收 | **[L137](#L137)** Ambient Soundscape · **[L206](#L206)** `人工 · 静音图标 + Sound` |

**§B 未单列、但在场景 checklist 里测的项**（见 **L203–L209**）：**[L203](#L203)** A1 Idle 开局（**已通过**） · **[L208](#L208)** Celebrating / 同日 SessionComplete 观感（**已通过**） · **[L209](#L209)** Honesty 桥接完整 Arrival（**已通过**） · DEV 一键重置（**L-logic / 仅单元测试**）。

#### C. 下一步自动化（未做 · 排 Task 2/3）

| 优先级 | 内容 | 对应 bug/场景 |
|---|---|---|
| Task 2 | E/F **逻辑单测**（舒展累计暂停、Flow 30min toast mock） | 场景 E/F；Offline/Flow 模式矩阵 |
| Task 3 | Playwright **Honesty 桥接 Yes → Arrival DOM** | 场景 D/N；补登回流 |
| 可选 | e2e **Skip — begin** 一键开表（不经逐步 Skip） | FocusSession 行「半卡 Sit」 |
| 不做 | 真实切页 60s、Celebrating 像素、Idle 闪不闪 | 留人工分列 → **[L179](#L179)** Idle（**已通过**） · **[L182](#L182)** Re-focus（**已通过**） · **[L183](#L183)** Celebrating / SessionComplete（**已通过**） · **[L178–L185](#L178)** 场景 checklist |

**命令**：`cd focus-tiger && npm run test:smoke`（scenario + 重置 L-logic + **SessionUiGate** + HUD 映射）· `npm run test:e2e`（约 **8** 条：产品壳 + Companion A/A2/A3/I/I2/K）。Agent 环境若缺浏览器：本机先 `npm run test:e2e:install`，或 config 已默认 `channel: 'chrome'` 用系统 Chrome。

---

## 状态定义

- **仅单元测试覆盖**：无用户可见变化，逻辑对错已由自动化测试验证，用户不需要点开看。
- **待人工测试**：已实现，单元测试（如有）已通过，但视觉/体验效果需要用户亲自看一遍才能确认。
- **已通过**：用户亲自测试确认没问题。
- **有问题**：用户测试后发现瑕疵，需写清楚问题内容，退回处理。

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
| Sit with Yin 误开 Honesty / Mindful Check-in | UI可见 | 已通过 | 点 Sit → Arrival，不应开 Mindful Check-in。 | 2026-07-20：用户书面「测试 OK了」。 | `#btn-focus` | 2026-07-20 |
| 调试面板 · 全入库素材试播 | UI可见 | 待人工测试 | 右上角滚动列表：「入库素材（逐条试播）」应覆盖 manifest 全部序列（含 gaze / tea / ear / lotus / tilt-think 等）。点 `gaze-p*` 可单独验收抠图与背景跳动。正式 Idle 不应再自动张望。 | 2026-07-20：用户发现 Idle 突然东张西望+背景跳 → 已关自动变体并补全调试入口。**2026-07-21**：用户书面——正式 Idle **不**自动东张西望，测试 OK（本行其余「全入库试播/抠图」仍待测）。 | `#emotion-debug-ui`（勿加 `?product=1`） | 2026-07-21 |
| 一次性情绪时长标准（ack / light） | UI可见 | 待人工测试 | 调试面板抽查：`合十确认`≈6–7s；`sessionComplete`≈3.5s；`nodBow`/`stretchReminder`/`waveHello` 明显慢于旧版「一闪」。Celebrating 仍约 5s。 | 2026-07-19：用户要求统一时长带；不足则放慢/重复/正倒放。 | `#emotion-debug-ui` | 2026-07-19 |
| 14 套新抠图算法整批替换 | UI可见 | 待人工测试 | 用调试面板或对应触发点抽查：`palms-together`、`celebrate-dance-v2`、`session-complete`、`nod-bow`、`stretch-reminder`、`milestone-glow`、gaze-p1～p4、`yawn-stretch`、`breath-halo-hq`（已替 expand）、lotus-*。确认角色边缘无灰白斑/脏底，四角透明。 | 2026-07-19：用户用新算法重跑全部 14 套并统一重打包；旧版已全部替换。2026-07-20：`breath-halo-expand`→`breath-halo-hq`。 | `#emotion-debug-ui` · 路径见 `ASSET_INVENTORY.md` 增量表 | 2026-07-20 |
| Companion Mode / 陪伴模式三选一（Here & Now · Offline Space · Flow State） | UI可见 | 已通过 | **主路径**：① hint → 任选模式 → Arrival → **Skip — begin 或 Choose/鞠躬后立刻 Focusing + 计时**，**无需**再点 Sit。② Sit → Arrival → 三选一 **点选即计时**（含 Offline）。**回流**：Rise 后再 hint → 任意模式 → Arrival 结束仍自动开表。**Safari 专项**：Choose 后底部 Companion 横排矮条是否挡鞠躬/错位。 | **2026-07-21**：Flow/Reading 鞠躬开表已修；Offline 禁止二次 Sit。**2026-07-22**：用户书面——Safari Companion 横排测试过程基本顺利，**测试 OK**。 | 底部 Sit 旁 dock · e2e A/K · Safari 人工 | 2026-07-22 |
| Honesty Check-in / Mindful Check-in | UI可见 | 已通过 | **主路径**：零完成开局 → **Idle 闭目坐禅**（不是睡着）+ 可忽略提示（EN 含 `sitting with you` / `Quiet time elsewhere`；ZH 含「闭目同坐」「别处的静心」）。点提示 → 选时长 → **呼吸引导**（不播 dormant-wake）→ 桥接。**回流**：同日再补登走空闲 Mindful Check-in → 呼吸 → 再出桥接。调试「睡着了」仍可试 Sleeping→dormant-wake。 | **2026-07-21**：用户书面——登录后第一幕不能是睡觉模样（not uplifting），须 Idle 闭目坐禅。已改零完成默认 Idle。**2026-07-22**：用户书面 A 类——Honesty 在 Idle 上的补登（非睡着）→呼吸→桥接，**测试 OK**。 | 零完成自动 · `#honesty-idle-entry` · DEV：`__honestyCheckIn` | 2026-07-22 |
| Honesty 桥接 CTA（补登后邀请再坐） | UI可见 | 待人工测试 | **主路径**：补登结束 → **立刻**出现（顶行 Welcome +「要不要现在也坐一会儿？」Yes/No）。Yes → 完整 Arrival → Companion。No → idle。**回流**：同日再补登 → **应再出**桥接。**叠层**：桥接可见时 **不得**见「一分钟呼吸」入口叠在 Yes/No 上；点 No 后入口恢复。 | 2026-07-19：立刻出现、每次可出、Welcome 并入桥接顶行。**2026-07-20 晚**：用户书面「Honesty 桥接后完整 Arrival UI 测试 OK」。**2026-07-22**：用户书面——一分钟呼吸钮挡住桥接 Yes/No 文案 → 已修（桥接 `onShown` → 收起微仪式入口）；请硬刷新复测叠层。e2e：`micro-ritual.spec.js` bridge 行。 | DEV：`__honestyBridge` · `#honesty-bridge-cta` | 2026-07-22 |
| Tiger Reflection Moment / 结束反思 | UI可见 | 已通过 | 正常完成或主动 Rise 结束会话 → 留白约 400ms（完成）/ 300ms（主动）后淡入面板。**意图回显**：仅当**本场** Arrival Choose 有内容时，Reflection 面板**顶部**立刻显示（icon：`所选方向：{text}` / typed：`所写方向：{text}`）；**不是**第二次 Choose 时头顶「最近选择的是…」。无 Choose → 无回显属正确。Q1–Q3：Continue / Skip / Skip all / Esc。非空答案写入 `focus-tiger.reflections.v1`（最近 5 条）；全跳过不落库。 | **2026-07-22**：用户书面——主路径/回流基本顺利；并确认回显口径（见上）。若本场 Choose 后 Reflection 顶见「所选方向：Reading」类文案 → **OK**。 | 会话结束后自动 · 单测：`TigerReflectionMoment.test.js` · DEV：`__reflectionMoment` | 2026-07-22 |
| 完成反馈 · 每日首次 Celebrating | UI可见 | 已通过 | **须等计时自动达标**（勿提前点 Rise；达标后点 Rise 也会进完成反馈）。当日可先 Honesty 补登；**首次计时达标**仍须 Celebrating（Honesty 不占庆祝戳）。播 `celebrate-dance` → idle → Reflection。 | 2026-07-21：用户书面——多日多次 focus 超 1 分钟从未见 Celebrating 舞；已修。**2026-07-21 复测**：`/` 满 1 分钟见舞；`/?sessionMinutes=5` 满 5 分钟见舞。 | `triggerSessionCompletionFeedback` · 调试「庆祝跳舞」 | 2026-07-21 |
| 完成反馈 · 同日后续 SessionComplete | UI可见 | 已通过 | 当日**已播过** Celebrating 后，再跑一轮 1 分钟达标 → 只播 `session-complete` 摆尾，**不**再 Celebrating。 | 2026-07-21：同 Celebrating 行用户反馈；庆祝戳已解耦。**2026-07-21 复测**：`http://localhost:5173` 同日第二次 1 分钟达标 → 只撅屁股摆尾、不再 Celebrating 舞；测试 OK。**同日晚**：`/?product=1` 再次确认同日第二次满 1 分钟 → 摆尾、非跳舞；测试 OK。 | 同上 · 调试「完成摆尾」 | 2026-07-21 |
| IncenseComplete / 今日一炷香（莲花+金斑） | UI可见 | 待人工测试 | 右上角调试面板点「模拟一炷香」→ DOM 叠层莲花渐显 + 金色粒子（在 2D Yin 前方）。**业务会话结束尚未自动接线**（仅调试入口）。**重点**：莲花右下角不得再出现 PixMiller 水印。 | 2026-07-19：立体荷花 + 金光斑点浮动效果**建议保留**，并用于后续「荷花持续增加、最终布满画面」的成长场景（Backlog 成长场景须复用本效果，勿删）。产品方向已记入 EMOTION_BIBLE。**同日用户反馈**：莲花图有 PixMiller 水印未抠掉→已从 `textures/lotus.png` 清除，且 DOM 叠层改用去水印 Canvas 贴图（此前直链源图绕过裁切）。请硬刷新后点「模拟一炷香」复测。 | `#emotion-debug-ui` · `playEmotion('incenseComplete')` · 实现：`IncenseGreeting.js` DOM 叠层 | 2026-07-19 |
| MilestoneGlow / 里程碑金辉 | UI可见 | 有问题 | 调试面板点「里程碑金辉」→ `milestone-glow` 27 帧（金光+蝴蝶）→ 末帧停约 2.5s → 回落。播放期归零实时金光。真实里程碑判定属 Backlog。 | 2026-07-19：金光蝴蝶须放慢 2×→已改 **4 fps**（原 8），请复测。 | `#emotion-debug-ui` · `playEmotion('milestoneGlow')` | 2026-07-19 |
| MindfulAcknowledge / 20 分钟阶段确认 | UI可见 | 待人工测试 | Companion = Here & Now，开一场会话并保持页面 ≥ **20 分钟墙钟** → `nod-bow` + 非模态 toast（`MINDFUL_FOCUS_MILESTONE` 池）。与强反馈冲突时静默让位。共享日额度最多 3 次（`focus-tiger.reminder-quota.v1`）。演示会话仅 1 分钟时建议用调试按钮或 `__mindfulReminderController`。 | — | 生产长计时 / 调试面板正念确认 · DEV：`__mindfulReminderController` · `__reminderQuotaManager` | 2026-07-18 |
| Re-focus Acknowledge / 回归确认 | UI可见 | 已通过 | **用户路径**见场景 B：开 **`/?sessionMinutes=5`**。**Here & Now**：切走 **&gt;60s** → toast + nod-bow。**Flow State / Offline**：同样切走 **&gt;60s** → **不应**出现 Re-focus（离开是预期）。**&lt;20s 无反应属正确**。 | 2026-07-20 晚：DEMO/10s 门槛说明。**2026-07-21**：用户书面 Sit/Here&Now 切页 **测试 OK**；Flow State「结果不对、不匹配」→ 产品预期即与 Here & Now **不同**：Flow **故意无**文案+nod-bow。**同日晚**：用户确认原 8 条独立行批次全部关闭。 | `/?sessionMinutes=5` · smoke B | 2026-07-21 |
| stretchReminder / 舒展提醒 | UI可见 | 待人工测试 | 会话活跃累计满 **2 小时**（离开暂停；两场间隔 ≥30 分钟重置）→ `stretch-reminder` 17 帧 + toast。占共享日额度。演示短会话建议调试面板触发。 | — | 调试面板 / 生产长计时 · DEV：`__mindfulReminderController` | 2026-07-18 |
| Ambient Soundscape / 静音图标 + Sound | UI可见 | 已通过 | **静音**：右上米色圆形 **音符钮**（在播=音符+斜杠，点一下即静音）。**Sound**：右下蒲团橙 **Sound** **始终可见**；**Sit 开计时后**可展开选曲/音量；未专注点 Sound 会提示先开始专注。**主路径**：默认 Mer-Ka-Ba；音符静音/恢复；专注后 Sound 换曲；**Yin idle 闭目坐禅可见**。**回流**：关→刷新仍关；Rise 后 Sound 仍可见但不可开面板。 | **2026-07-20**：原「Ambient Sound 入口」书面测试 OK。**2026-07-21**：整页空白已修（`_volume` 初始化）。**同日晚**：用户确认原 8 条独立行批次全部关闭（含 Ambient 观感验收）。**2026-07-21 晚**：用户书面——点击右上音乐按钮，背景音乐可自如开关，测试 OK。 | 右上 `.ambient-soundscape__mute` · 右下 `.ambient-soundscape__fab` | 2026-07-21 |
| EyeTracking / 正式瞳孔 PNG | UI可见 | 有问题 | 运行时已卸下 `pupil-left/right` 叠加跟随；调试勾选已移除。Idle 张望 gaze-p1～p4 **不受影响**。 | 2026-07-19 实测截图：瞳孔叠图错位（楔形/月牙状色块，含闭目帧幽灵瞳孔）；**已决定放弃，不再返工**。结论见 `CORE_LOOP.md`「已废弃：EyeTracking 实时瞳孔跟随鼠标」。 | 已废弃 · 历史素材可留 `/textures/eye-pupils/` 但不接线 | 2026-07-19 |
| PointerInteraction · 靠近点头 nodGreeting | UI可见 | 已通过 | **默认靠近不再点头**。开局 / idle：指针移入靠近区 → **不应**播 `nod-greeting`。调试面板「点头致意」仍可手工播（**6 fps**，末帧多停约 2 拍）→ 回 idle。 | 2026-07-19：曾要放慢点头→已改。**同日再反馈**：开局默认态仍见点头 → 根因是靠近区仍自动 `nodGreeting`；已拆除靠近自动点头。**2026-07-21**：用户书面——默认只有呼吸/眨眼、靠近不再自动点头，测试 OK。 | 全屏命中层 · DEV：`__pointerInteraction` · 调试「点头致意」 | 2026-07-21 |
| idle / 坐禅闭眼呼吸基底 | UI可见 | 已通过 | 点「坐禅闭眼」或「重置并 idle 坐禅」：**闭目 pingpong ×2**（frame 1–19）→ **睁眼弧 pingpong ×1**（frame 1–33）→ 往复；同素材硬切、不叠化。 | 2026-07-20：切分两段 pingpong。**2026-07-20 用户书面**：坐禅闭眼 / idle 坐禅各情况测试 OK。 | 调试「坐禅闭眼」 · `__idleOrchestrator` · `#dev-reset-all-local-state-idle` | 2026-07-20 |
| PointerInteraction · 静止好奇 curiousTilt | UI可见 | 待人工测试 | 靠近区静止 **4s** → 播 **blink-smile** 单次（已替换托腮 tilt-think）→ 180ms 淡回 idle。冷却 6s。 | 2026-07-19：打坐↔托腮仍很跳→已换眨眼类；请确认衔接是否顺。 | 全屏命中层 · DEV：`__pointerInteraction` | 2026-07-19 |
| PointerInteraction · 抚摸 / 轻点 / 绕圈（检测已接线、无正式精灵） | UI可见 | 待人工测试 | 头部拖动 ≥14px → `petHead`（控制台占位）。头部点击位移 ≤10px → `smileSquint`（占位）。约 1.4s 内绕圈 ~1.75π → `dizzyBlink`（占位）。确认检测触发即可；目前无完整 2D 动画。 | — | 同上 · 单测：`PointerInteraction.test.js` | 2026-07-18 |
| FocusSession + Focus HUD（Sit with Yin / Rise） | UI可见 | 待人工测试 | **主路径**：Sit → **Skip — begin** → 立刻计时且按钮变 **Rise**（记忆 Companion 模式）。Choose 完整走完 → 右侧 Companion → 选模式开计时。**回流**：Rise → Reflection → 再 Sit。 | 2026-07-20：Skip begin 半卡 Sit→已改为直接开始；请复测主路径+回流。**自动化**：e2e A 锁 Here & Now 开表；**未**锁 Skip — begin 一键路径。 | `#focus-hud` · `#btn-focus` | 2026-07-20 |
| FocusHUD 金环+呼吸光 / 数字弱化 | UI可见 | 已通过 | **主路径**：左上角约 **2×** 大卡：金环（琥珀金、够显眼）+ 中心光点**持续一张一缩**；Sit 后环随进度走。**悬停**露 Focus %。**回流**：Rise 后环回淡。 | 2026-07-21：香炉误读→改金环+光点。**同日书面**：①圈/点看不清 ②呼吸点应不停一张一缩 ③整体太小、建议放大两倍 → 已加对比、加强呼吸、约 2×。**2026-07-22**：用户书面 A 类开放行，**测试 OK**。**自动化**：`focusHudHalo.test.js` + e2e `#hud-state`/`#hud-time`。 | `#focus-hud` · `/?product=1` | 2026-07-22 |
| FocusHUD 今日同坐 progress-bar | UI可见 | 已通过 | **主路径**：HUD 下方见蒲团橙软条 + 文案「Today's shared sitting / 今日同坐」；空日接近空；Sit 计时中条渐长且有**轻脉冲**。**回流**：Rise 后脉冲停；若本场未达标完成则条回落至已完成分钟。勿与 Companion 三选一抢「怎么坐」。**非** daily-quest 清单。 | 2026-07-21：UI Kit progress-bar 纳入产品壳。**2026-07-22**：用户书面 A 类，**测试 OK**。**自动化**：`sharedSittingProgress.test.js`。 | `#focus-hud progress-bar` · `/?product=1` | 2026-07-22 |
| FocusHUD streak-meter 近日同坐 | UI可见 | 已通过 | **主路径**：HUD 右侧小 7 点环；空日全暗；达标/Honesty 记账后多亮一点（非 Day N 计分牌）。悬停见「Recent days… / 近日同坐的日子」。满 7 点短金息。**回流**：重置本地后环回空。禁止断签焦虑文案。 | 2026-07-21：UI Kit streak-meter 纳入。**2026-07-22**：用户书面 A 类，**测试 OK**。**自动化**：`PracticeDaysStore.test.js`。 | `#focus-hud streak-meter` · `/?product=1` | 2026-07-22 |
| 「?」朱砂 notification-badge | UI可见 | 已通过 | **主路径**：新用户左下「?」角有朱砂小红点；点一次「?」后红点消失且不再常驻。**回流**：DEV 重置 hints 后再见红点。勿做成常驻角标噪音。 | 2026-07-21：稀缺强调色。**2026-07-22**：用户书面——朱砂红点「用于系统里面的通知，或者 alert 之类的」（未标测试 OK；现实现仍挂 onboarding「?」未读）。**同日再书面**：问号朱砂点表示未读「完全可以，就请保留」→ **保留现实现**，不改挂。 | `#onboarding-hint-help` · `/?product=1` | 2026-07-22 |
| How shall we sit? secondary 米色立体钮 | UI可见 | 已通过 | Sit 仍为蒲团橙主 CTA；旁「How shall we sit?」为**米色立体次要钮**（渐变暖米底＋凸起阴影），不透明，不抢 Sit。Honesty Bridge Yes/No 仍同级（勿改成主次）。 | 2026-07-21：用户书面——背景透明不对，应改米色立体按钮。**2026-07-22**：用户书面 A 类，**测试 OK**。 | `.session-start-dock__hint` · `#btn-focus` | 2026-07-22 |
| LightProgression / 光影物理渐进 | UI可见 | 已通过 | Arrival：冷→暖背景、Notice 升温、Breath 视差 Dolly（背景 1.06 / Yin 1.12）+ 呼吸光环、Choose 坐垫光晕。FOCUSING：DOM Rim 跟踪 focusLevel（+ ambient boost）与约 4s 呼吸脉冲。Re-focus：Recover 扰动后约 5s 平复。 | 2026-07-19：用户反馈 Rise 后页面动画无变化。文档规定 FOCUSING 有金光、IDLE 无光环——Rise 应收起 Rim。**2026-07-22**：用户书面 A 类——LightProgression，**测试 OK**。 | 随 Arrival / Re-focus 自动 · DEV：`__lightProgression` · 单测：`LightProgression.test.js` | 2026-07-22 |
| IdleOrchestrator / 坐禅闭眼 | UI可见 | 已通过 | 点「坐禅闭眼」→ `idleBreathClosed` ×2 pingpong → `idleBlinkArc` ×1 pingpong → 循环；段间**硬切**不叠化。回流：Celebrating / Rise 后再 idle。 | 2026-07-20：切分帧界 4433/6937。**2026-07-20 用户书面**：各情况测试 OK。 | `#emotion-debug-ui` · `__idleOrchestrator` | 2026-07-20 |
| 候选陪伴手势 · 逐条试播 | UI可见 | 待人工测试 | 调试「入库素材」点：`tea-drinking` / `yawn-stretch` / `ear-wiggle` / gaze-p* —— **应直接播该条并定格末帧**；**不应**先闪一下闭目坐禅。**`blink-breathe` / `breath-halo-hq` 为 pingpong 循环**（不定格）。张望用「组合试播」**整段** `张望 (p1→p2→p3→p4)`（不再分 A/B）。 | 2026-07-20：合并张望 A+B；pingpong 清单尊重 loopMode。 | `#emotion-debug-ui` · 入库素材 / 组合试播 | 2026-07-20 |
| blink-breathe 眨眼深呼吸 | UI可见 | 已通过 | 调试面板仍可 pingpong 试播；**不再**作为 Rise 主路径。 | 2026-07-20：用户书面「测试 OK了」。同日产品拍板：Rise 改接 `rise-stretch-casual`。 | `#emotion-debug-ui` | 2026-07-20 |
| rise-stretch-casual / 中途 Rise 伸懒腰 | UI可见 | 已通过 | **主路径**：Sit → Skip begin → 中途点 **Rise** → 伸懒腰→箕坐**正放一次**（不 pingpong 循环；末帧约 2 拍停）→ ~300ms 后 Reflection。**回流**：关 Reflection → 叠化回 Idle/Sleeping；再 Sit / Arrival。达标结束**不**播本段。 | 2026-07-20：用户反馈循环播放不妥→已改正放一次。**2026-07-20 用户书面**：Sit → Skip begin → 中途 Rise，动画只播一遍、不再循环，测试 OK。 | Rise · 调试「Rise伸懒腰(正式)」· `playEmotion('riseStretchCasual')` | 2026-07-20 |
| cloak-sleep / 披毯入睡（进 DORMANT） | UI可见 | 已通过 | **主路径**：非 DORMANT→DORMANT 转换 → `cloakSleep` 正放 @6fps≈5.7s → cross-fade → `sleeping`。**回流**：已 DORMANT 持续睡（含跨午夜 sync）→ **不**重复披毯；唤醒后再进 DORMANT → 再播一次。**调试**：入库素材仍可单条试播。 | **2026-07-22**：用户书面——模拟 ≥2h 进睡后走 Honesty 唤醒全流程，**测试 OK**（含披毯入睡观感）。 | 改 `focus-session-end` 时间戳模拟 · `#emotion-debug-ui` | 2026-07-22 |
| MilestoneGlow 备选 breath-halo-hq | UI可见 | 待人工测试 | 调试「breath-halo-hq」→ pingpong；**顶点停留约 6 拍（~0.75s）**。 | 2026-07-20：用户反馈顶点仍需延长→已从 2 拍加到 6 拍，请复测。 | `#emotion-debug-ui` | 2026-07-20 |
| Sleeping / DORMANT 睡态循环 | UI可见 | 已通过 | **自动**：距上次专注结束 ≥ `DORMANT_IDLE_HOURS`（默认 **2h**）→ `STATES.DORMANT` + `sleeping` 1 fps；新用户无结束记录**不**触发。零完成开局仍为 Idle。**调试**：「睡着了」仍可直接试播。 | **2026-07-22**：用户书面——模拟 3h 前进睡后 HUD Asleep + sleeping 侧卧，再 Honesty 唤醒，**测试 OK**。 | `?product=1` · DEV 改 `focus-session-end` · `#emotion-debug-ui` | 2026-07-22 |
| DORMANT 2h 滚动触发 + sleep→wake 串联 | UI可见 | 已通过 | **自动化**：`dormantIdle` chain + smoke `D sleep→wake`。**人工主路径**：改 `focus-session-end` → 刷新见披毯→sleeping → Honesty唤醒选时长 → 倒放睡醒 + 10s 呼吸 → 离 DORMANT / 桥接。 | **2026-07-22**：用户书面——Honesty唤醒(流程) → 选时长 → cloak-sleep 倒放 + 10s 呼吸 → 离睡着态，**测试 OK**。 | `npm run test:smoke` · 实验室 `#emotion-debug-ui` | 2026-07-22 |
| AcrossToolsIdleGuard / Flow State 闲置 toast | UI可见 | 待人工测试 | Companion 选 Flow State → Sit → **30 分钟**无鼠标/键盘 → 一次 `ACROSS_TOOLS_IDLE` toast。仅切标签页不算 idle。 | — | 生产长等待 · DEV：`__acrossToolsIdleGuard` · 单测：`AcrossToolsIdleGuard.test.js` | 2026-07-18 |
| i18n（默认 en / 可切 zh） | UI可见 | 待人工测试 | 默认英文。控制台 `__i18n.setLocale('zh')` → 按钮、HUD、Arrival、Honesty、Companion、Reflection、Ambient、toast 刷新为中文；再 `setLocale('en')` 切回。**无应用内语言切换 UI。** | — | DEV：`window.__i18n` · `src/locales/{en,zh}.json` | 2026-07-18 |
| Emotion debug UI（右上角调试面板） | UI可见 | 待人工测试 | 逐个点一次性姿态：播完应**定格末帧**，不硬切默认闭目呼吸；点「坐禅闭眼」才回 idle 循环。循环态（睡着/微笑/光环）照常循环。面板底部**不应**再出现「动态效果层」（绕 Y 轴旋转 / 呼吸起伏 / 悬浮）三项勾选。 | 2026-07-19：勿刻板切回默认闭目→已改 `holdPose`，定格末帧仍待复测。同日：动态效果层须从 2D 删除→已移除；**用户确认测试通过**。 | `#emotion-debug-ui` | 2026-07-19 |
| smiling / blink-smile（欢迎与调试） | UI可见 | 待人工测试 | Arrival Welcome 自动播；或调试「坐禅微笑」。pingpong。Celebrating 后持久 Smiling 基底**未接线**（回 Idle）。 | — | Arrival / 调试面板 | 2026-07-18 |
| welcomeBack / wave-hello 挥手 | UI可见 | 待人工测试 | 调试面板播「挥手欢迎」→ 抬手 → 顶点摇摆 008–012 **播两遍** → 放手（共约 24 拍播放列表）；**无**最高点单帧 hold。**10 分钟自主挥手未接线。** | 2026-07-19：最高处完全重复那一帧须删；最高处左右摇摆须多重复一遍再放手。已改，请复测。 | `#emotion-debug-ui` · `playEmotion('welcomeBack')` | 2026-07-19 |
| dormantWake / Honesty 睡醒序列 | UI可见 | 已通过 | **主路径**：进 DORMANT 后「Honesty唤醒」选时长 → **`cloak-sleep` 34 帧倒放**（**6 fps** ≈5.7s）→ 定格末帧 + **约 10s 呼吸**并行。**回流**：定格后桥接 Yes/No。**对比**：「唤醒(伸懒腰)」仍走 stretch-reminder，视觉须不同。**不**淡入闭眼呼吸、**不**自动接光环金光。 | **2026-07-21**：用户希望用斗篷倒放替换原 dormant-wake。**2026-07-22**：用户书面——Honesty唤醒(流程)选时长 → 倒放睡醒 + 10s 呼吸 → 离睡着态，**测试 OK**。 | Honesty / `#emotion-debug-ui` · `playEmotion('dormantWake')` | 2026-07-22 |
| lookAtCursor / wakeUp / snoringZZZ 等 | 纯后端+调试 | 有问题 | `wakeUp` 播伸懒腰（`stretch-reminder` 同源，调试标「唤醒(伸懒腰)」）；Honesty `dormantWake` 现走 **cloak-sleep 倒放**（≠ wakeUp）。`lookAtCursor` 仍空操作；snoringZZZ 仍占位。 | 2026-07-19：唤醒与 Honesty 动画重复→已改 `wakeUp` 接伸懒腰。**2026-07-21**：Honesty 睡醒改 cloak-sleep 倒放。请对比两按钮确认不同。 | EmotionController 调试面板 | 2026-07-21 |
| haloBreathing / 光环呼吸奖励 | UI可见 | 待人工测试 | 调试面板播「光环呼吸奖励」：intro + loop。**fps 已放慢 2×**（intro 5 / loop 4，原 10/8）。Honesty 路径暂不自动接。 | 2026-07-19：播放太快须至少放慢 2×→已改，请复测。 | `#emotion-debug-ui` | 2026-07-19 |
| blink / 眨眼变体 | UI可见 | 已通过 | Idle 眨眼由 `idleBlinkArc`（×1 pingpong）插入闭目段（×2）之间；调试 blink-smile 仍可手工播。 | 2026-07-20：两段 pingpong 编排。**2026-07-20 用户书面**：idle 坐禅测试 OK。 | 调试 / Idle 编排 | 2026-07-20 |
| tPose / 显示 3D 垫底（调试） | UI可见 | 待人工测试 | 调试面板 T-Pose → 短暂露出 3D canvas。确认 2D 主线默认隐藏 3D。 | — | `#emotion-debug-ui` | 2026-07-18 |
| ArrivalPractice 状态机 | 纯后端 | 仅单元测试覆盖 | `npm test` → `ArrivalPractice.test.js` | — | `src/core/ArrivalPractice.js` | 2026-07-18 |
| DailyCompletionStore | 纯后端 | 仅单元测试覆盖 | `DailyCompletionStore.test.js`；与 Honesty / 完成分流共用 | — | `src/core/DailyCompletionStore.js` | 2026-07-18 |
| 留存漏斗骨架 RetentionTelemetry | 纯后端 | 仅单元测试覆盖 | **无 UI、无第三方**（正式工具暂不选型）。`RETENTION_FUNNEL.md`；`console.log('[RetentionTelemetry]', …)`。事件：`app_first_open` / `first_session_complete` / `day1\|3\|7\|30_return`（窗口内首次返回）/ `dormant_bridge_shown\|accepted\|declined` / **`micro_ritual_complete`**（不抢 `first_session`）。接线：`main.noteAppOpen`、`HonestyCheckIn.onSessionRecorded`、桥接 `trackEvent`（含 No→declined）、`completeMicroRitual`。storage `retention-funnel.v1` 纳入 DEV 重置。 | — | `RetentionTelemetry.test.js` · `HonestyBridgeCtaController.test.js` · `docs/RETENTION_FUNNEL.md` | 2026-07-22 |
| 「本周陪伴」热力图 · 数据结构/挂载位调研（第 1 步） | 纯文档 | 仅单元测试覆盖 | **无 UI**。结论：`DailyCompletionStore` **仅当日**不够。数据源已改为扩展 `PracticeDaysStore`（见下行）。**候选挂载（未拍板）**：① Reflection `onDone` 后短暂角标 ② Idle 常驻一角（避开 FocusHUD 左上 / Sound 右下 / Sit·Honesty dock 底中 / 音符右上）③ Reflection 面板内收尾一角 ④ HUD 旁替换或并列现有 streak-meter。 | 2026-07-22：用户要求先确认数据结构再实现 | `SHARED_RESOURCES` §1.1–1.2 | 2026-07-22 |
| PracticeDaysStore 多日时长 + getLastNDays（热力图 Store） | 纯后端 | 仅单元测试覆盖 | `days: { date, totalMinutes }[]`（旧 `string[]` → `totalMinutes: null`）；`markToday(minutes)` 同日累加；`getLastNDays(7)` 缺口补 0；窗口仍 90。写入仍走 Honesty/`onPracticeDay`。 | — | `PracticeDaysStore.test.js` · `SHARED_RESOURCES` §1.2 | 2026-07-22 |
| 「本周陪伴」7 格热力图 UI（Idle 常驻） | UI可见 | 待人工测试 | **主路径**：`?product=1` Idle → 左下（`?` 上方）见 `#weekly-practice-heatmap` 横排 7 格；亮=`null\|/>0`（暖蒲团橙 token），暗=浅 `ink-faint`；无文案/感叹号/点击。**回流**：Sit→Focusing → 热力图隐藏；Rise 回 Idle 再出现。**窄屏 375**：不与 Sit/Sound/`?` 重叠。e2e：`weekly-practice-heatmap.spec.js`。 | **2026-07-22**：用户书面——点「?」后箭头指 7 格热力图仍无 Hint（现设计 `ONBOARDING_HINTS` **未登记**该锚点；非坏掉的已有 tip）。 | `?product=1` · `#weekly-practice-heatmap` | 2026-07-22 |
| 「一分钟呼吸」微仪式 · 方案调研 | 纯文档 | 仅单元测试覆盖 | 方案见 `MICRO_RITUAL_PLAN.md`。**实现已另开下行**。 | 2026-07-22：先调研后实现 | `docs/MICRO_RITUAL_PLAN.md` | 2026-07-22 |
| 「一分钟呼吸」微仪式 · Idle 接入 | UI可见 | 待人工测试 | **主路径**：`?product=1` Idle 见立体入口「A minute of breath / 一分钟呼吸」（青绿 secondary、Sit 上方、Honesty 下方）→ 点开 → 吸↔呼文案 + smiling@4fps + **同拍**呼吸光环/Yin 轻量起伏约 **60s** → 到点 toast「Today counts, too / 今天，也算数」+ **SessionComplete 摆尾**（不 Celebrating、不 Reflection）→ `recordCompletion(1)` + `markToday(1)`。**回流**：中途 Leave 安静退出、不记账不 toast；同日可再点再完成。**保护面**：Honesty 桥接 Yes/No 可见时入口须隐藏（勿叠住文案）。e2e：`micro-ritual.spec.js`（`?microRitualMs=1500` + bridge 叠层行）。 | 2026-07-22：按拍板口径实现；**同日**：入口改立体钮 + dock gap 16px；吸/呼与光环/Yin 同拍。**同日晚**：用户反馈入口挡住桥接 Yes/No → 已修。**同日再书面**：① 点「?」后「一分钟呼吸」仍无 Hint（`ONBOARDING_HINTS` **未登记**）；② Honesty 桥接 Yes/No 打开时截图仍见青绿「A minute of breath」叠在面板上（保护面疑回归，须复测 hide）。**动画节奏须人工看** | `?product=1` · `#micro-ritual-idle-entry` · `#micro-ritual` | 2026-07-22 |
| 「一分钟呼吸」· 吸呼相位与 smiling 节奏 | UI可见 | 待人工测试 | 微仪式进行中：吸/呼约 **2.5s** 交替（同 Arrival）；角色 smiling pingpong **4 fps**；**光环周期 = 5s（吸收敛 / 呼晕开）与文案同拍**；Yin **轻量 scaleY** 吸略扩、呼收回（非 idle-breathing 帧级胸腔，勿硬切闭目）。到点摆尾后再回 Idle。 | 2026-07-22：观感分列；同日加文案↔光环/Yin 同拍 | 同上 · 可 `?microRitualMs=15000` 缩短人工观察 | 2026-07-22 |
| 「一分钟呼吸」· Idle 入口立体钮与 dock 间距 | UI可见 | 待人工测试 | Idle 底栏：Honesty（米色）→ **一分钟呼吸（青绿立体）** → Sit（蒲团橙）→ How shall we sit?（米色）。钮须有描边+内高光+底边阴影（非下划线）；竖向 gap≈16px，不拥挤、不抢 Sit。375 竖屏四钮仍可读可点。 | 2026-07-22：用户反馈「不显眼、排列拥挤」 | `?product=1` · `#session-start-dock` · `#micro-ritual-idle-entry` | 2026-07-22 |
| 「一分钟呼吸」· SessionComplete 摆尾（禁 Celebrating） | UI可见 | 待人工测试 | 微仪式结束后只见 **摆尾**，**不见** Celebrating 舞；即便当日尚无正式 Focus 达标也如此。同日第二次微仪式仍只摆尾。 | 2026-07-22：观感分列 | 同上 | 2026-07-22 |
| SessionIntentionStore | 纯后端 | 仅单元测试覆盖 | `SessionIntentionStore.test.js`；Choose 写入 `intentions.v1` | — | `src/core/SessionIntentionStore.js` | 2026-07-18 |
| ReminderQuotaManager | 纯后端 | 仅单元测试覆盖 | `ReminderQuotaManager.test.js`；三类提醒共享自然日额度 | — | `src/core/ReminderQuotaManager.js` | 2026-07-18 |
| 应用内提醒偏好 + 横幅候选判定 | 纯后端 | 仅单元测试覆盖 | **逻辑无 UI、无浏览器 Notification**。`get/setReminderPreference`（`reminder-preference.v1`；形状 `{ hour, minute }` 或 `null`，**无 `enabled` 字段**）；`evaluateInAppReminderBanner`：未设置 / 未到时 / 今日已完成 → 不触发；全满足 → `{ shouldShow: true, messageKey: 'reminder.gentle_waiting' }`。完成判定：`DailyCompletionStore.hasCompletedToday()`（含 Honesty / 微仪式）。 | — | `reminderPreference.test.js` · `InAppReminderBannerController.test.js` · `SHARED_RESOURCES` | 2026-07-22 |
| 应用内提醒设置入口 + 横幅 UI（方案 A · 右上角） | UI可见 | 待人工测试 | **设置入口**：右上角时钟图标（`ReminderPreferenceUI`），挂 `document.body`，紧邻 Ambient 静音钮右侧（静音 `right:14px`，本钮 `right:66px`），**始终可见**（非 Idle-only、**不在**热力图 cluster 内）。点开面板 → 勾选「开启提醒」写入 `{ hour, minute }`；取消 → 清空存储。**横幅**：`#ui-overlay` 顶部居中非模态横幅（`InAppReminderBannerUI`），到点且今日未完成时出现文案 `reminder.gentle_waiting`（EN "Yin is waiting" / ZH「阿寅在等你」），可点 × 关闭；**主路径**：设置提醒时间→到点→横幅出现。**回流**：关闭横幅后本页会话内不再出现（`dismissedThisPageSession`）；`resyncSessionChrome` / `visibilitychange` 回前台 / 冷启动 / 状态切换均会重新评估。**忙碌抑制**：Arrival / Focusing / Celebrate / Reflection / 微仪式进行中 → 横幅隐藏（`busyPolicy: 'suppress'`，默认方案 A，不排队）。DEV 调试：`window.__inAppReminder.{sync,setNow,clearNow,controller,settings,banner}`。 | 2026-07-22：用户拍板方案 A（右上角时钟图标，非热力图 cluster；`busyPolicy` 默认 `suppress`）并实现。 | 右上 `#reminder-preference-toggle` · `#in-app-reminder-banner` · e2e `in-app-reminder.spec.js` · DEV `__inAppReminder` | 2026-07-22 |
| session-completion-feedback 分流逻辑 | 纯后端 | 仅单元测试覆盖 | `session-completion-feedback.test.js`；首日 Celebrating vs 同日 SessionComplete | — | `src/core/session-completion-feedback.js` | 2026-07-18 |
| AttentionSignals | 纯后端 | 仅单元测试覆盖 | `AttentionSignals.test.js`；20s 记账 / 60s 回归展示 | — | `src/input/AttentionSignals.js` | 2026-07-18 |
| CharacterConfig 路径拼接 | 纯后端 | 仅单元测试覆盖 | `CharacterConfig.test.js`；无换装 UI | — | `src/character/CharacterConfig.js` | 2026-07-18 |
| SpriteSequencePlayer | 纯后端+渲染 | 仅单元测试覆盖 | `SpriteSequencePlayer.test.js`；预加载/打断/帧停留/子序列 | — | `src/character/SpriteSequencePlayer.js` | 2026-07-18 |
| EmotionController 映射桥 | 纯后端+桥接 | 仅单元测试覆盖 | `EmotionController.test.js`；业务只调 `playEmotion` | — | `src/core/EmotionController.js` | 2026-07-18 |
| CapCut 式叠代默认（one-shot→idle） | 纯后端+桥接 | 仅单元测试覆盖 | `_finishOneShot` 默认 `CAPCUT_DISSOLVE_MS`；`returnCrossFadeMs: MICRO` 可缩短；`EmotionController.test.js` | — | PRINCIPLES / EMOTION_BIBLE §1.6 | 2026-07-20 |
| SessionUiGate（Arrival/叠层/完成中门闩 facade） | 纯后端 | 仅单元测试覆盖 | `SessionUiGate.test.js` + 并入 `npm run test:smoke`：未就绪不得 begin；Sit 未就绪 → start-arrival；叠层 hint ignore；`computePostSessionOverlayActive` 可扩展源；`resolveCompanionModeSelectCommit` 拒绝不写 storage | — | `src/core/SessionUiGate.js` · DEV `__sessionUiGate` · `SHARED_RESOURCES` §4 | 2026-07-22 |
| StateManager 合法转移 warn（不阻断） | 纯后端 | 仅单元测试覆盖 | `StateManager.test.js`：非法转移仍写入但 `console.warn`；合法路径无 warn；**BREAK 已删**。**单测 harness** `MoodController.test` 会打出 `IDLE → CELEBRATE` warn（跳步），属预期。观察册：`EDGE_CASES.md` | — | `src/core/StateManager.js` | 2026-07-22 |
| Honesty pending 丢失 abort（禁 `?? 30`） | UI可见 | 待人工测试 | **主路径**：Honesty 选时长 → 呼吸正常结束 → 仍记账 + 桥接（不变）。**异常回流**：呼吸进行中若 pending 被清（如 force 重开竞态）→ **不得**记 30 分钟；须 toast（EN `HONESTY_PENDING_LOST` / ZH「请再选一次时长」）+ **重开时长三选一**（非白屏/卡住）。375×667 看 toast 不被 dock 完全挡住。 | 2026-07-22：静默失败排查 #4；自动化 `HonestyCheckInController.test.js`。**2026-07-22**：用户书面——`/?product=1`（端口 5174）**正常补登**路径测试 OK；并问「正常记账用户可能看不出来？」——产品口径：成功无「已记 XX 分钟」数字回执，用户可感知信号主要是桥接 Welcome+Yes/No；次要为左上 streak / 左下热力图今日格（若本日已亮则几乎无变化）。**异常回流仍待你复测**。 | `?product=1` · Honesty · toast `#mindful-acknowledge-toast` | 2026-07-22 |
| 门闩一体包 · Companion 点选→真实开表 | UI可见 | 待人工测试 | **主路径**：`?product=1` → Sit→Arrival→选 Here & Now / Offline / Flow → **须立刻开计时**（主按钮变 Rise、HUD 进 Focusing）。**回流**：Rise 后再 Sit→再选仍开表；Arrival 打开期间 Honesty hide **不得**误开 hint 开表；未就绪先选模式 → 进 Arrival，**storage 仅在 Gate 通过后更新**。375×667 竖屏。 | 2026-07-22：静默失败批 3；e2e A/I/K 锁 DOM | `?product=1` · `.session-start-dock__option` · `#btn-focus` | 2026-07-22 |
| 静默失败观察册 EDGE_CASES | 纯后端 | 仅单元测试覆盖 | 审计边角入库；批 1–3 已记入。不代替 TEST_TRACKER 验收行。 | — | `docs/EDGE_CASES.md` | 2026-07-22 |
| Lit 试点 · OnboardingHintsUI（步 4） | UI可见 | 已通过 | **主路径**：实验室「清空引导提示已读」→ 见 `help-affordance`（Lit **薄荷绿**气泡）。点 **?** → 本页全部锚点提示 + **App 用途简介卡**（标题/正文/知道了）。**回流**：关气泡后再点 ?；Rise 后 FOCUSING 再点 ?。 | 2026-07-21：Lit 试点。**同日书面**：① 恢复薄荷绿 ② 点 ? 另出简介卡。**2026-07-22**：用户书面 A 类——Hints 薄荷绿 + 点 ? 用途简介卡，**测试 OK**。 | `#onboarding-hint-help` · `#onboarding-app-purpose` · Brief | 2026-07-22 |
| 分散式即时提示 + 「?」补救（ONBOARDING_HINTS v3） | UI可见 | 已通过 | **主路径**：清空已读 → 左下 **?** 旁 `help-affordance`（**薄荷绿**）。点 ? → 本页 hints + 用途简介卡。**回流**：关卡后再点 ?。 | 2026-07-20：尖角/补救反馈。**2026-07-21**：恢复薄荷绿 + 用途简介卡。**2026-07-22**：用户书面 A 类，**测试 OK**。 | `#onboarding-hint-help` · 实验室「清空引导提示已读」 | 2026-07-22 |
| 人工 · help-affordance 尖角对准 ? | UI可见 | 已通过 | 1) 清空引导提示已读。2) `help-affordance` 在 **? 右侧**，尖角对准 ?，气泡为**薄荷绿**（非奶油米黄）。3) 回流：缩放后再看。 | 2026-07-20：尖角未对准。**2026-07-21**：恢复绿色式样。**2026-07-22**：与 Hints 薄荷绿批次一并 **测试 OK**。 | `?product=1` 或 `/` · `#onboarding-hint-help` | 2026-07-22 |
| 人工 · 点 ? 补救展示本页全部 hints | UI可见 | 已通过 | 1) 先点掉自动提示。2) 点 **?**。3) 须同时见：本页控件 hints + `help-remedy` + **用途简介卡**（EN 含 gamified mindfulness companion / regular practice, at your own pace；ZH 对应）。4) 点「Got it / 知道了」关简介卡；点气泡关该条。5) 回流：再点 ? 仍全部出现。 | 2026-07-20：只有元文案。**2026-07-21**：加简介卡。**2026-07-22**：用户书面 A 类，**测试 OK**。 | `#onboarding-hint-help` · `#onboarding-app-purpose` | 2026-07-22 |
| Ambient 播放缓亮 Rim（presenceBoost + playing lift） | UI可见 | 已通过 | **验收口径（2026-07-22 起）**：不再以「音乐会加亮边缘金光」作产品承诺；Sound hint **不**宣传缓亮。底层 Rim lift 可保留实现，**不以可见缓亮为必测项**。 | 2026-07-19：文案称音乐会加亮。**2026-07-20**：用户反馈未见光效；Sound hint 已改不写加亮。**2026-07-22**：用户书面——「正式砍掉了宣传」+ **测试 OK**（关包口径=不宣传、不强制可见）。 | Sound 面板 · DEMO 1min 会话 | 2026-07-22 |
| 用户场景剧本 SCENARIO_TESTS（A–G + I–N） | UI可见 | 待人工测试 | 权威：`focus-tiger/docs/SCENARIO_TESTS.md`。用 **`?product=1`** 走完整故事串。逻辑冒烟：`npm run test:smoke`；浏览器壳：`npm run test:e2e`。**观感子项已拆成下方独立行，勿只勾本行。** | 2026-07-20：拆分观感六行，避免「一行测过＝全测过」假象。 | `SCENARIO_TESTS.md` · `?product=1` | 2026-07-20 |
| 场景冒烟自动化 scenario-smoke（A–D + I/J · 逻辑层） | 纯后端 | 仅单元测试覆盖 | `npm run test:smoke`（**14** 条）：门闩/完成反馈/Re-focus 抑制/Rise→Reflection/Honesty 桥接/**I hint→toggle** + **DEV 重置 L-logic**（`localStateKeys.test.js`）。**不含**序列观感。 | 2026-07-20：Task 1 补 smoke I。**2026-07-21**：并入重置白名单/新用户读数。 | `scenario-smoke.test.js` · `localStateKeys.test.js` | 2026-07-21 |
| 人工 · How shall we sit? 立刻展开三选一 | UI可见 | 待人工测试 | 1) `?product=1` 重置本地状态。2) **不要点 Sit**，直接点 **How shall we sit?**。3) 须**立刻**出现 Here & Now / Offline Space / Flow State 三选一，**不是**「What is present right now?」Arrival 框。4) 回流：Rise 结束后再点 hint 仍展开三选一。 | 2026-07-20 用户书面：点 How shall we sit? 出 Arrival 框不对，应出三选项；记得原来就是这样后来改坏了。 | `?product=1` · `.session-start-dock__hint` | 2026-07-20 |
| 浏览器 e2e 产品壳冒烟（Playwright） | 纯后端 | 仅单元测试覆盖 | `npm run test:e2e`（**2 条**）：`?product=1` 见 Sit、无调试面板；实验室有「重置全部本地状态」。 | — | `e2e/product-shell.smoke.spec.js` | 2026-07-20 |
| 浏览器 e2e 场景 A/I/K Companion DOM（Playwright） | 纯后端 | 仅单元测试覆盖 | `npm run test:e2e`：**I** hint 开面板；**I2** 预选开 Arrival；**A** Arrival→Here&Now 开表；**A2/A3** 预选 Flow/Here&Now → Skip begin **无需 Sit** 开表；**K** Offline 选中即开表。 | 2026-07-21：Offline 二次 Sit 已废除。 | `e2e/scenario-a.companion.spec.js` | 2026-07-21 |
| 人工 · A1 Idle 开局（非 Sleeping） | UI可见 | 已通过 | 1) 实验室「重置全部本地状态」。2) 开 `?product=1`。3) 确认阿寅是 **Idle 闭目坐禅**，**不是**睡着。4) Honesty 可忽略提示可见。5) **右上**见音符钮（默认有声，可静音）。 | **2026-07-21**：用户书面——第一幕不能睡觉；须 Idle + 默认音乐。旧「A1 睡着已通过」口径作废。**同日晚**：用户确认原 8 条独立行批次全部关闭（含本行 Idle 开局）。 | `?product=1` · 重置按钮在 `/` | 2026-07-21 |
| 人工 · Idle 统一 pingpong 不闪（序列） | UI可见 | 已通过 | 1) 「坐禅闭眼」或「重置并 idle 坐禅」。2) 闭目段 ×2 + 睁眼弧 ×1 循环，段间无闪白/叠化。3) 回流：Rise 后再 idle。 | 2026-07-20：切分降睁眼频率。**2026-07-20 用户书面**：各情况测试 OK；**晚**：再次确认「已经解决」。 | `/` · DEV `__idleOrchestrator` | 2026-07-20 |
| 人工 · Arrival Notice 观察短句可读完 | UI可见 | 已通过 | 1) Sit → Notice 点 Okay（或 Calm）。2) 观察式短句须能读完（约 2.4s）再进呼吸。3) 回流：Rise → 再 Sit → 再点一次 Notice。 | 2026-07-20 晚：用户书面「测试 OK」。 | `?product=1` · Sit → Notice | 2026-07-20 |
| 人工 · 静音图标 + Sound | UI可见 | 已通过 | 1) `?product=1` 重置后进入。2) **右上**音符钮静音/恢复。3) **右下 Sound 始终可见**（未专注略淡）。4) **Sit 开计时** → 点 Sound 展开选 Mer-Ka-Ba / Meditation Impromptu + 音量。5) Rise 后面板应收起、Sound 仍可见。 | **2026-07-20**：原「Ambient Sound 入口」书面测试 OK。**2026-07-21**：Sound 不见已修。**同日晚**：用户确认原 8 条独立行批次全部关闭（本行承接原 Ambient 入口验收）。**2026-07-21 晚**：用户书面——右上音乐按钮背景音乐可自如开关，测试 OK。 | `?product=1` | 2026-07-21 |
| 人工 · Re-focus 真实切页 >60s | UI可见 | 已通过 | 1) **`/?sessionMinutes=5`**。2) **Here & Now** 开表 → 切走 **70–90s** → **须有**观察式文案 + nod-bow。3) **对照 Flow State**（或 Offline）：同样切走 &gt;60s → **须无** Re-focus（无文案、无 nod-bow；timer 可继续）。约 10s 回来无反应属正确。 | 2026-07-21：用户书面 Here&Now/Sit 路径 **测试 OK**；Flow「貌似不对、不匹配」→ 产品预期即与 Here & Now **不同**：Flow **故意无**文案+nod-bow。**同日晚**：用户确认原 8 条独立行批次全部关闭。 | `/?sessionMinutes=5` · 场景 B / F | 2026-07-21 |
| 人工 · Celebrating / 同日 SessionComplete 观感 | UI可见 | 已通过 | 1) 实验室「重置全部本地状态」。2) 可先 Honesty 或不做。3) Sit→Companion→等 DEMO **满 1 分钟自动达标**（也可达标后再点 Rise）→ 须见 **Celebrating 舞**。4) 同日再达标 → 只摆尾。 | 2026-07-21：用户书面——这几天很多次 focus 超过一分钟，从未见过 Celebrating 舞；已修。**2026-07-21 复测**：`/` 满 1 分钟见舞；`/?sessionMinutes=5` 满 5 分钟见舞；同日第二次 1 分钟达标 → 只撅屁股摆尾、不再 Celebrating；测试 OK。**同日晚**：`/?product=1` 再次确认第 4 步（同日第二次满 1 分钟 → 摆尾非跳舞）；用户确认原 8 条独立行批次全部关闭。 | `/` · `/?product=1` · `/?sessionMinutes=5` | 2026-07-21 |
| 人工 · Honesty 桥接后完整 Arrival UI | UI可见 | 已通过 | 1) 重置本地状态 → DORMANT。2) 走 Honesty 选 20 → 呼吸结束。3) 桥接点 **Yes** → 须走完整 Arrival（Welcome→Notice→Breath→Choose）再 Companion，**不**直接开表。4) 另测 **No** → idle、无二次挽留。 | 2026-07-20 晚：用户书面「测试 OK」。 | `?product=1` · 或实验室 Honesty | 2026-07-20 |
| DEV 一键重置全部本地状态 | 纯后端 | 仅单元测试覆盖 | **L-logic**（勿人工逐 key）：`npm run test:smoke` → `localStateKeys.test.js` 锁白名单=各模块 STORAGE_KEY、脏态 clear 后 Store 等同新用户、session toast/boot-idle 一次性。按钮壳：`e2e/product-shell.smoke.spec.js`（实验室可见；`?product=1` 不可见）。 | 2026-07-20：重置后 Honesty=场景 A 正确开局。**2026-07-21**：用户书面——人工难验「参数是否复原」→ 应 L-logic；已改仅单元测试。 | `src/core/localStateKeys.test.js` · `#dev-reset-all-local-state` | 2026-07-21 |
| 产品壳链接 ?product=1（隐藏调试面板） | UI可见 | 待人工测试 | 打开 `/?product=1`：无右上角情绪调试条；Sit / How shall we sit? / Honesty / Arrival / Sound 仍可用。打开 `/`：调试面板在。 | — | `http://127.0.0.1:5173/?product=1` vs `/` | 2026-07-19 |
| 人工 · "Or begin from here." hint 侧面显示 | UI可见 | 已通过 | 1) `?product=1` 重置本地状态进入 Idle。2) 确认「Or begin from here.」onboarding hint 气泡从 **Sit 按钮右侧**弹出（不再从上方遮住 Sit 按钮）。3) 回流：Rise 后再看 idle chrome，hint 若再次显示仍应在侧面。 | 2026-07-21：用户书面——挡住 Sit，应改到侧面。**2026-07-22**：用户书面 A 类，**测试 OK**。 | `?product=1` · `.session-start-dock__hint` | 2026-07-22 |
| 窄屏 · 自动 onboarding 互斥（≤1 条） | UI可见 | 待人工测试 | **主路径（375×667）**：实验室清空引导已读 → `/?product=1`。冷启动同一时刻自动气泡 **≤1**（优先 `help-affordance`，关掉后串行 Sit / How shall we sit? 等）。**回流**：点气泡关掉 → 下一条出现；点 **?** 仍同时见本页全部补救 hints + 用途简介卡。**横屏 667×375**：自动仍 ≤1、不退化。**桌面 ≥900**：互斥同样生效；尖角对准 ?。 | 2026-07-21：用户同意 Task 1；截图去掉叠加后观感可。自动化：`selectExclusiveAutoHintIds` 单测。 | `?product=1` · DevTools 375×667 | 2026-07-21 |
| 窄屏 · Sit with Yin 主 CTA 不截断 | UI可见 | 待人工测试 | **主路径（375×667）**：`#btn-focus` 须完整显示 **Sit with Yin**（禁止「Sit w…」）；可点进 Arrival。切中文后「与阿寅同坐」亦完整。**回流**：Rise → 再 Idle 仍完整。**横屏**：不退化。 | 2026-07-21：Task 1；dock 加宽 + white-space normal。 | `?product=1` · `#btn-focus` | 2026-07-21 |
| 人工 · Sound gated 提示文案（非专注时点 Sound） | UI可见 | 已通过 | 1) `?product=1`，**不**点 Sit（未专注）。2) 点右下角 **Sound 按钮**，须出现提示：**「Track selection opens once you sit.」**（不再说「Sound opens after sitting begins.」）。3) 回流：Sit 开计时 → 点 Sound 须正常打开面板，无提示。 | 2026-07-21：用户书面——旧句失实；已改 HINT_AMBIENT_GATED。**2026-07-22**：用户书面 A 类，**测试 OK**。 | `?product=1` · `.ambient-soundscape__fab`（未专注） | 2026-07-22 |
| Honesty Check-in 小钮（零完成起常驻） | UI可见 | 已通过 | **主路径**：实验室「重置全部本地状态」→ `?product=1` → Idle 即见 **Honesty Check-in** 立体小钮（Sit 上方），**无需**先完成计时。**勿**再自动弹出旧版长句卡片（`HONESTY_CHECKIN_PROMPT`）。点钮 → 时长三选一 → 呼吸。**回流**：计时达标 / Rise 后再 Idle 小钮仍在。 | 2026-07-21 晚：零完成即 Honesty 场景；取消旧浮动长句卡片、小钮常驻。**同日晚**：Offline Space 说明改桌面口径。**2026-07-21 晚**：用户书面——重置本地状态 → `?product=1` 开局即见小钮、不再弹长句卡片，**测试 OK**。 | `?product=1` · `#honesty-idle-entry` | 2026-07-21 |
| Companion · Offline Space 说明文案（桌面优先） | UI可见 | 待人工测试 | How Shall We Sit? → **Offline Space** 说明须表达：**别处练习 + 此页继续计时 + 离开不算分心**；**禁止**「Lock your phone」等纯手机表述。 | 2026-07-21 晚：用户书面——电脑版且 lock phone 语义不对。 | `?product=1` · `.session-start-dock__option` Offline | 2026-07-21 |
| Sit with Yin 主按钮尺寸（恢复紧凑 pill） | UI可见 | 已通过 | **主路径**：`#btn-focus` 应为**内容宽度**紧凑 pill（约 `13×36` padding），**不要**拉满 dock 整行宽。**回流**：Rise 后再 Idle 尺寸仍对。**窄屏 375px**：文案完整可读即可。 | 2026-07-21：Task1 全宽变丑已修。**2026-07-21 晚**：用户复测 OK。 | `?product=1` · `#btn-focus` | 2026-07-21 |
| Companion · Offline 禁止二次 Sit | UI可见 | 待人工测试 | **主路径**：记忆 **Offline Space** → Sit → Arrival（含 Choose Reading）→ 鞠躬或点选 Offline → **须立刻 Focusing**（**禁止**再点 Sit）。**对照 Here & Now / Flow**：同样一次 Sit 即开表。**回流**：hint 预选 Offline → Arrival → Skip begin 亦开表。 | 2026-07-21 晚：用户书面——已点 Sit 即 return to focus，Offline 不应再逼点 Sit；已改三模式均 `shouldAutoStartFocusOnModeSelect`。 | `?product=1` · 场景 K | 2026-07-21 |
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
