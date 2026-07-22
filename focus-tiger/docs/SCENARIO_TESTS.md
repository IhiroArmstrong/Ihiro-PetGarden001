# SCENARIO_TESTS.md — 用户场景操作故事测试脚本

创建日期：2026-07-19  
最近代码核对：2026-07-20（文档收敛 + 增量对照 `focus-tiger` 实现）

**权威路径**：`focus-tiger/docs/SCENARIO_TESTS.md`  
仓库根目录 `SCENARIO_TESTS.md` 仅为指针；旧稿 `有待核对-SCENARIO_TESTS720.md` 已归档，勿再改。

定位：这份文档和 `focus-tiger/docs/TEST_TRACKER.md` 不是替代关系，是两个层级——TEST_TRACKER 是「每个功能点单独测试」的清单，本文档是「把功能点串成一次真实使用故事」的剧本。很多 bug 只有在功能连起来走的时候才会暴露。建议两份一起用：走完一个场景故事后，回头把涉及到的功能点在 TEST_TRACKER 里勾掉。

**自动化冒烟（2026-07-20，Task 1 扩 A/I/K DOM）**：
- 逻辑层：`src/core/scenario-smoke.test.js`（`npm run test:smoke`）— A–D + **I** + J 回流
- 浏览器壳：`e2e/product-shell.smoke.spec.js` + `e2e/scenario-a.companion.spec.js`（`npm run test:e2e`）
  - **I**：hint 未就绪 → 打开 Arrival（非静默）
  - **A**：Arrival Skip → Here & Now → HUD 计时开始
  - **K**：Offline 选中即开表（与 Here & Now / Flow 一致） · `e2e/scenario-a.companion.spec.js`
- **二者全绿 ≠ 序列观感通过**（Idle 不闪等仍人工；见 `DEV_WORKFLOW_QUALITY.md` §6.1 覆盖分层）
各场景标题下注明「已自动化 / 仍须人工」。

**重要提示**：部分步骤对应的功能仍在「已知未完成」状态（本文档已逐条标注）。走到这些步骤时看到「没反应」或「和预期不符」，不代表新 bug，是已知缺口，不要重复报告。

---

## 用哪个链接测？

当前 `npm run dev` 默认页是 **研发实验室**，不是干净产品壳：

| 链接 | 用途 |
|---|---|
| [http://localhost:5173/](http://localhost:5173/) | **实验室**：右上角情绪调试面板常驻；DEV 下有 `window.__*` |
| [http://localhost:5173/?product=1](http://localhost:5173/?product=1) | **产品壳预览**：隐藏 `#emotion-debug-ui`，更接近真实用户界面；适合走场景 A–G / I–N |

演示会话时长：`DEMO_SESSION_MINUTES = 1`（约 1 分钟达标，便于故事测完）。  
语言切换：**无应用内设置**；DEV 控制台 `__i18n.setLocale('zh')` / `'en'`（`?product=1` 下仍可用，同一 bundle）。

---

## 场景 A：Kelly 的第一个早晨（全新用户，当日零完成 → Idle）

> **自动化（控制器级）**：A1 / A3–A4 门闩 / A7–A8 完成反馈 / 计时达标 → `src/core/scenario-smoke.test.js`（`npm run test:smoke`）。  
> **自动化（DOM · Task 1）**：Arrival Skip → Here & Now 开表 → `e2e/scenario-a.companion.spec.js`（**不含**达标/Celebrating）。  
> **仍须人工**：Idle 开场观感、Honesty 文案、默认音乐与开关按钮、Arrival 气泡时长、Ambient、Idle 呼吸观感、Celebrating 动画本身。

1. 打开 App（建议 `?product=1`）。当日零完成时，阿寅应是 **Idle 闭目坐禅**，**不是** sleeping。  
   *[逻辑：零完成 → Idle + Honesty prompt 已自动化 smoke A1]*
2. Idle 时见 **Honesty Check-in** 小钮（Sit 上方；点它可补登别处完成的练习）。Kelly 也可直接点 **Sit with Yin** 开始本场计时。
3. 右下角应有显眼 **「关闭音乐」**（默认 Mer-Ka-Ba；若浏览器拦自动播放，点一次按钮或页面即可解锁）。随时可关，不必先 Sit。
4. Arrival Practice 展开：
   a. 欢迎 beat（~2 秒气泡，`ARRIVAL_WELCOME`）
   b. Notice：六个状态图标；点 "Okay" → 观察式回应（实际文案以 locale 为准，例如 en：「An ordinary steadiness is here.」）
   c. 呼吸 beat（~5 秒，无倒计时）
   d. Choose：六个活动图标；点 "Deep Work" → intention 确认  
   *[逻辑：Notice→Choose→READY + Here & Now 可 begin / 门闩失败 已自动化 smoke A3–A4]*
5. Companion Mode 三选一展开。产品文案为 **Here & Now / Offline Space / Flow State**。**任一模式选中后即开始 Focus+计时**（不必再点 Sit；用户已点 Sit 进入 Arrival 即视为开始）。
6. 计时开始后，可用「曲目」切换背景音；主按钮仍可一键开关。
7. 全程观察 Idle：**仅**闭目 pingpong → 眨眼弧固定节奏。  
   **张望 gaze / yawn / tea / ear-wiggle 不在正式 Idle 编排中**。  
   **靠近区不应自动播点头**。  
   *[概率/观感：不纳入冒烟]*
8. 达到目标时长 → **当日首次计时达标**：Celebrating → 回落坐姿。  
   **勿提前点 Rise**；Honesty 补登**不**占庆祝戳。  
   *[逻辑：celebrated 戳 + smoke A7–A8；动画观感仍人工]*
9. **同日第二次计时达标**：应播 **SessionComplete**（摆尾），**不应**再播完整 Celebrating。  
   *[逻辑：二次→sessionComplete 已自动化]*
10. **已知缺口**：IncenseGreeting（莲花+金粒子）**业务会话结束尚未自动接线**。
11. 进入 Reflection Moment：开头回显本次 Choose，三问可独立跳过。
12. 回到 Idle；今日 Honesty 提示不应再因零完成自动出现。  
    *[逻辑：有完成后不再出零完成 prompt 已自动化 smoke A1]*

---

## 场景 B：分心后自己走神又回来（Recover / Re-focus Acknowledge）

> **自动化**：模式抑制门闩 + `handleAttentionReturn` 在 Here & Now 触发 / Offline 抑制 → smoke B。  
> **人工验收（用户路径，勿用控制台）**：真实切标签页 + toast + nod-bow。

### 频率门槛（先记住，否则会以为「坏了」）

| 离开时长 | 回来时应看到 |
|---|---|
| **&lt; 20s** | **无反应**（连内部记账都不做）——你测的约 10s 属于此档，**正确** |
| 20–60s | 只内部记账，**仍无**文案 / nod-bow |
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
6. **对照（勿期望与 Here & Now 相同）**：再开一场选 **Flow State**（或 Offline Space）→ 同样离开 &gt;60s 再回来 → **不应**出现观察式文案 / nod-bow（`suppressAwayReminders`；离开是预期）。若「没反应」= **测对了**；若仍出现 nod-bow = bug。
7. 额度：Re-focus 占共享日提醒池（每日最多 3 次三类合计）；每场会话最多 1 次。

*[逻辑：Stay 触发 / Offline·Flow 抑制 → smoke B]*

---

## 场景 C：中途主动放弃（未达标）

> **自动化**：未达标不记账 + `MANUAL_END_PAUSE_MS` 后 Reflection open → smoke C（**仅**锁 `SessionEndFlow.onSessionEnded` 向 `ReflectionMoment.open` 传入 `intention` / `intentionSource`）；**Choose → Rise → Reflection 意图回显 DOM 可见性**（含 Skip — begin 反向）→ e2e `reflection-intention-echo.spec.js`；回流 hint→toggle 三选一 → smoke J。  
> **仍须人工**：`rise-stretch-casual` 观感、面板淡入、回 Idle/Sleeping 衔接。

1. 开始新会话，进行到一半，点 **Rise**。
2. 不应播放 Celebrating，不应播放 IncenseGreeting。  
   *[逻辑：未达标不 `recordCompletion` 已自动化]*
3. 角色播 **`rise-stretch-casual` pingpong**（闭目坐禅→伸懒腰→随意坐→倒放回闭目）；约 `MANUAL_END_PAUSE_MS = 300` 后淡入 Reflection（动画可与面板并行）。  
   *[逻辑：pause 时长 + Reflection open 已自动化；序列观感仍人工]*
4. 若本次 Choose 有内容，回显仍应出现（与是否达标无关）。  
   *[逻辑：Choose→Rise→Reflection 顶部 `[data-testid=reflection-intention-echo]` DOM 回显 → e2e `reflection-intention-echo.spec.js`；Skip — begin 无回显 → 同文件反向用例；`SessionEndFlow` 入参传递 → smoke C（非完整用户链）]*
5. 三问正常可跳过；关闭 Reflection 后应回 Idle（或当日零完成时回 Sleeping），衔接勿硬切。

---

## 场景 D：请假一天后的 Honesty Check-in（含桥接 CTA）

> **自动化**：  
> - **D sleep→wake 串联**：距上次专注 ≥2h → `sync` 进 DORMANT（`cloakSleep`→`sleeping`）→ Honesty 选 20 → `dormantWake` → 离 DORMANT → 桥接 Yes → smoke `D sleep→wake` + `dormantIdle` chain。  
> - **D 桥接回流**：手工 DORMANT 起点 → 选 20 → wake → 桥接 Yes/No / 同日再出 → smoke D。  
> **仍须人工**：睡姿观感、10s 呼吸 UI、桥接文案排版、Yes 后完整 Arrival 动画。

1. 模拟「距上次专注结束 ≥ 2 小时」：写过一次专注结束时间戳后把时钟拨到 ≥2h，或 DEV 改 `focus-tiger.focus-session-end.v1` 后刷新 / 回前台（见下方强制手段）。新用户无结束记录**不会**自动睡。
2. 惰性进 DORMANT：应先见 **cloakSleep 披毯**再落入 sleeping；点进 Honesty（或 Mindful Check-in）。
3. 选时长 10 / 20 / 30+（选 20）。
4. **实际顺序**：选时长后 **立刻**播 `dormantWake`（cloak-sleep **倒放**，非 stretch），与约 **10 秒**呼吸倒计时**并行**（`HONESTY_BREATH_MS = 10_000`）。  
   *[逻辑：2h→cloak→wake→离 DORMANT 已自动化 smoke D sleep→wake / dormantIdle chain]*
5. 补登结束（记账、离 DORMANT）后：**立刻**出现 Honesty **桥接 CTA**（「要不要现在也坐一会儿？」Yes / No 同级；Welcome 回显可与邀请同屏一小会儿）。  
   - **Yes** → 完整 Arrival Practice → Companion（**不**跳过、**不**直接开表 / Ambient）。  
   - **No** → idle，无二次挽留。  
   - **每次**补登完成后都可出现（**不限**当日一次）。定稿见 `HONESTY_BRIDGE_CTA.md`。  
   *[逻辑：桥接 Yes/No/同日再出 已自动化；Yes 后完整 Arrival UI 仍人工]*
6. DORMANT 清除后仍可再点 Sit 做正式会话，与补登不冲突。  
   **已知**：Honesty 路径暂不接 halo / 金光。
   **已知**：Honesty 补登**不**刷新 `focus-session-end`；若距上次真实专注仍 ≥2h，回前台 sync 可再次进睡。

---

## 场景 E：Offline Space（I'll step away）

1. Arrival 后 Companion 选 **Offline Space** → **选中即开计时**（与 Here & Now / Flow 一致；已点 Sit 进入 Arrival 即视为开始）。
2. 离开电脑一段时间。
3. **已知缺口**：约 10 分钟无互动自动 `welcomeBack` / wave-hello **未接线**（仅调试「挥手欢迎」）。回来没看到挥手 = 已知状态。  
   离开期间**不应**出现 Re-focus（`suppressAwayReminders`）。
4. 回来后继续/结束：  
   - **专注墙钟计时不因离开暂停**（`FocusSession` 墙钟）。  
   - **舒展活跃累计**在离开时暂停（`MindfulReminderController`）。

---

## 场景 F：Flow State（I'm working across tools）

1. Companion 选 **Flow State** → 选中即开计时。
2. 频繁切标签（模拟多任务）；离开类 Re-focus **应全程抑制**。
3. 宽松 idle 兜底：同一页内无键鼠/触控活动达到  
   **`ACROSS_TOOLS_IDLE_THRESHOLD_MS = 1_800_000`（30 分钟）**  
   → 一次 `ACROSS_TOOLS_IDLE` toast。仅切标签页**不算**重置该 idle 计时。  
   （阈值仍属产品可调项；测时如实记录即可。）

强制加速（DEV）：`__acrossToolsIdleGuard` 相关 API 或临时改阈值（仅本地）。

---

## 场景 G：语言切换

1. **无应用内语言设置 UI**。在 DEV 控制台：`__i18n.setLocale('zh')`，再 `setLocale('en')`。
2. 重走 Arrival + Reflection（及 Honesty 桥接文案若出现），确认欢迎 / Notice / Choose / 回显 / 三问 / 桥接无英文残留、无 `{intention}` 未替换。
3. 切回英文再确认。

---

## 场景 H：正式瞳孔跟随功能

**已废弃，不需要测试**——EyeTracking 为 no-op stub，`main` 注入 `eyeTracking: null`，调试勾选已删。若仍见瞳孔跟鼠标，再报告回退不干净。

---

## 建议补充的故事（相对 A–G）

| ID | 故事 | 为何补 |
|---|---|---|
| **I** | 点 **How shall we sit?**（未过 Arrival）→ **立刻展开三选一**；Honesty 提示开着时仍可点；**不**启动 Arrival | 回归锁：禁静默无反馈 · **已自动化** smoke I + e2e hint→`.session-start-dock__panel` |
| **J** | Rise 后再点 hint → **仍展开三选一**（非静默）；再选 Here & Now（门闩就绪后）→ 立刻计时 | 回流路径 · **逻辑** smoke J |
| **K** | Offline Space：点选后 HUD **不应**走动，再点 Sit 才计时 | 与 Here & Now / Flow 分流 · **已自动化** e2e K |
| **L** | 同日第二场达标 → SessionComplete，无 Celebrating、无自动 Incense | 纠正旧 A8/A9 |
| **M** | 产品壳 `?product=1`：无调试面板；实验室 `/`：有面板 | 分清测「功能」还是测「产品表面」 |
| **N** | Honesty 补登结束 → 桥接 Yes → 完整 Arrival；桥接 No → idle；靠近 idle **不**自动点头 | 2026-07-19/20 增量 |

---

## 调试强制触发（勿当生产功能）

| 需求 | 入口 |
|---|---|
| 眨眼 | 实验室面板「眨眼」或 `playEmotion('blink')` |
| Celebrating / SessionComplete / 合十 / 挥手 / 舒展 / 正念鞠躬 / 点头致意 | 实验室对应按钮（点头**仅**调试，非靠近自动） |
| 一炷香莲花 | 实验室「模拟一炷香」（业务未接线） |
| Honesty 睡醒 / 桥接 | 实验室「Honesty唤醒」或走 Honesty UI；桥接 DEV：`__honestyBridge` |
| gaze / yawn / tea / ear 等候选序列 | **仅 DEV**：`__spritePlayer.play('gazeP1CenterBlinkLeft')` 等（**不**在 IdleOrchestrator 随机池） |
| Re-focus | DEV：`__mindfulReminderController.handleAttentionReturn({ durationMs: 90000, displayEligible: true })`（须 FOCUSING 且未 suppress） |
| Idle 加速眨眼 | DEV：`__idleOrchestrator.setTiming({ breathCyclesBeforeBlink: 1 })` |
| 清当日完成（模拟 DORMANT） | DEV：清 `DailyCompletionStore` 相关 localStorage 后刷新（或 `__dailyCompletionStore`）——**仅**清零完成记录；**不会**单独进睡 |
| 模拟 ≥2h 后进 DORMANT | DEV：设 `focus-tiger.focus-session-end.v1` = `{"lastEndedAt": <≥2h 前 epoch ms>}` 后刷新或切回前台；或坐完一场后把系统时间拨快 |

说明：`#emotion-debug-ui` 当前在**非** `?product=1` 时挂载；`window.__*` 仅 `import.meta.env.DEV`。

---

## 2026-07-20 增量核对摘要（文档收敛执行结果）

1. **相对 720 / 07-19 摘要的漂移**  
   - Idle：正式编排仍为 **呼吸×5→眨眼**；**无** gaze/yawn/tea/ear 随机池（`IdleOrchestrator`）。docs 曾误写「已入随机池」→ 已纠正。  
   - 靠近 **不再**自动 `nodGreeting`。  
   - Honesty **桥接 CTA** 已落地：每次补登后立刻出现；Yes → 完整 Arrival。  
   - Offline 须再 Sit；Here & Now / Flow 选中即开计时 — 仍成立。  
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

## 给 Cursor 的 Prompt（增量核对；勿整份重写）

```
对照 focus-tiger/docs/SCENARIO_TESTS.md（权威）与当前代码，做增量核对，不要重写整份剧本：

1. 只核对可能漂移的条目：Idle 是否仍无随机变体池、Honesty 桥接 CTA、
   靠近是否还自动 nodGreeting、Offline Space 须再 Sit、Here & Now/Flow 选中即开计时。
2. 如实报告 ACROSS_TOOLS_IDLE / Re-focus / Honesty 呼吸 / DEMO_SESSION 等常量数值。
3. 确认 EyeTracking 仍为 no-op / null。
4. 更新「调试强制触发」表；生产构建不得暴露强制入口。
5. 保持仓库根 SCENARIO_TESTS.md 为指向 docs 的指针；勿复活 720 双源。
6. 更新 TEST_TRACKER 场景行（勿重复条目）；改完后本地 commit，勿 push。
7. Agent 自测故事优先 ?product=1；回流至少测 Rise→再 Arrival / hint 一条。
```
