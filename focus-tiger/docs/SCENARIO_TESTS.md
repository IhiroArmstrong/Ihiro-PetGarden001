# SCENARIO_TESTS.md — 用户场景操作故事测试脚本

创建日期：2026-07-19  
最近代码核对：2026-07-22（自动化口径收紧：标明单元 / 控制器集成 / DOM 用户链路；修正 Offline/K 与 Skip — begin 过时描述）

**权威路径**：`focus-tiger/docs/SCENARIO_TESTS.md`  
仓库根目录 `SCENARIO_TESTS.md` 仅为指针；旧稿 `有待核对-SCENARIO_TESTS720.md` 已归档，勿再改。

定位：这份文档和 `focus-tiger/docs/TEST_TRACKER.md` 不是替代关系，是两个层级——TEST_TRACKER 是「每个功能点单独测试」的清单，本文档是「把功能点串成一次真实使用故事」的剧本。很多 bug 只有在功能连起来走的时候才会暴露。建议两份一起用：走完一个场景故事后，回头把涉及到的功能点在 TEST_TRACKER 里勾掉。

**功能 vs 测试覆盖缺口审计（2026-07-30）**：模块级对照、三条「绿」口径、永不自动化清单、**unit\*→smoke 分类（§7）**、Honesty/i18n 发布口径（§8–§9）→ [`COVERAGE_GAP_AUDIT.md`](./COVERAGE_GAP_AUDIT.md)（与 `TEST_TRACKER` §C 互补；改覆盖结论先改审计文档）。

**自动化冒烟（2026-07-20，Task 1 扩 A/I/K DOM；2026-07-22 扩 O/P / 意图回显）**：
- **单元 / 控制器集成**（无浏览器）：`src/core/scenario-smoke.test.js` 等（`npm run test:smoke`）— A–D 门闩与控制器接线 + **E/F** Offline 舒展暂停 / AcrossTools idle + **I/J** hint 纯函数；含 `MindfulReminderController` / `AcrossToolsIdleGuard` 专测；**不是**完整用户故事
- **浏览器 DOM 用户链路**（`npm run test:e2e`，约 **20** 条跨 6 文件）：
  - `e2e/product-shell.smoke.spec.js` — 产品壳 Sit / 无调试条；实验室重置钮可见
  - `e2e/scenario-a.companion.spec.js` — **I** hint→三选一面板；**I2** 预选→开 Arrival；**A** Arrival 后 Here & Now 开表；**A2/A3** 预选+Skip — begin 开表；**K** Offline 选中即开表
  - `e2e/reflection-intention-echo.spec.js` — Choose→Rise→Reflection 顶部回显有/无（主路径 DOM；**非**二次 beginFocus 抹闩 Bug）
  - `e2e/weekly-practice-heatmap.spec.js` — Idle 7 格可见 / Focusing 隐藏 / localStorage seed 亮暗
  - `e2e/in-app-reminder.spec.js` — 时钟入口面板（含每日说明）+ 设时→回前台→横幅→关闭不重复 + Focusing 隐藏（suppress）+ 已过/已练软提示
  - `e2e/micro-ritual.spec.js` — 微仪式主路径 / Leave 不记账 / 桥接叠层隐藏入口（经 `__honestyBridge` 注入）
  - `e2e/honesty-bridge-real-path.spec.js` — **真实** Honesty 补登→桥接 Yes→Arrival / No→Idle（`?honestyBreathMs=`；**非**注入）
- **二者全绿 ≠ 序列观感通过**（Idle 不闪等仍人工；见 `DEV_WORKFLOW_QUALITY.md` §6.1 覆盖分层）
各场景标题下须写清覆盖**层**（单元 / 控制器集成 / DOM 用户链路）与**测到哪一步**；禁止只写「已自动化」而不写范围。

**重要提示**：部分步骤对应的功能仍在「已知未完成」状态（本文档已逐条标注）。走到这些步骤时看到「没反应」或「和预期不符」，不代表新 bug，是已知缺口，不要重复报告。

---

## 用哪个链接测？

当前 `npm run dev` 默认页是 **研发实验室**，不是干净产品壳：

| 链接 | 用途 |
|---|---|
| [http://localhost:5173/](http://localhost:5173/) | **实验室**：右上角情绪调试面板常驻；DEV 下有 `window.__*` |
| [http://localhost:5173/?product=1](http://localhost:5173/?product=1) | **产品壳预览**：隐藏 `#emotion-debug-ui`，更接近真实用户界面；适合走场景 A–H / I–P |

演示会话时长：`DEMO_SESSION_MINUTES = 1`（约 1 分钟达标，便于故事测完）。  
语言切换：**无应用内设置**；DEV 控制台 `__i18n.setLocale('zh')` / `'en'`（`?product=1` 下仍可用，同一 bundle）。

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
   - **Sit→Choose 走完**：鞠躬后**展开 Companion**；点任一模式 → **立刻** Focusing（不必再点 Sit）。  
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
   *[单元：`triggerSessionCompletionFeedback` + celebrated 戳 → smoke A7–A8；**非** Celebrating 动画 DOM]*
9. **同日第二次计时达标**：应播 **SessionComplete**（摆尾），**不应**再播完整 Celebrating。  
   *[单元：同 smoke A7–A8 第二次调用返回 `sessionComplete`；**非**摆尾序列观感]*
10. **已知缺口**：IncenseGreeting（莲花+金粒子）**业务会话结束尚未自动接线**。
11. 进入 Reflection Moment：开头回显本次 Choose，三问可独立跳过。  
    *[DOM 用户链路（有/无回显）→ 场景 C / `reflection-intention-echo.spec.js`；本场景 e2e A **未**跑到 Reflection]*
12. 回到 Idle；今日 Honesty 提示不应再因零完成自动出现。  
    *[单元/控制器：smoke A1 在 `recordCompletion` 后断言仍 IDLE；**未**断言旧版零完成长句 prompt 的 DOM 消失（该 UI 已改为常驻小钮）]*

---

## 场景 B：分心后自己走神又回来（Recover / Re-focus Acknowledge）

> **单元 / 控制器集成**：`shouldSuppressAwayReminders` 模式门闩 + `MindfulReminderController.handleAttentionReturn` 在 Here & Now 触发 emotion / Offline·Flow 抑制 → smoke B。  
> **未覆盖**：真实切标签页、toast DOM、nod-bow 序列。  
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
   *[单元/控制器：smoke C 断言 pause 时长 + `open({ intention, intentionSource })`；**非** rise-stretch 序列 / 面板淡入观感]*
4. 若本次 Choose 有内容，回显仍应出现（与是否达标无关）。  
   *[DOM 用户链路：Choose→Rise→Reflection 顶部回显 → e2e `reflection-intention-echo.spec.js`；Skip — begin 无回显 → 同文件反向用例；下游入参 → smoke C（非完整用户链）；**Bug 回归锁**（二次 beginFocus 空 pending 不抹闩）→ 单元 `SessionIntentionStore.test.js` · `resolveSessionIntentionLatch: pending wins; empty pending must not wipe latch`]*
5. 三问正常可跳过；关闭 Reflection 后应回 Idle（或当日零完成时回 Sleeping），衔接勿硬切。

---

## 场景 D：请假一天后的 Honesty Check-in（含桥接 CTA）

> **单元 / 控制器集成**：  
> - **D sleep→wake**：距上次专注 ≥2h → `sync` 进 DORMANT（`cloakSleep`→`sleeping`）→ Honesty 选 20 → `dormantWake` → 离 DORMANT → 桥接 Yes 回调 → smoke `D sleep→wake` + `dormantIdle` chain（harness 调控制器；**非**披毯/睡姿 DOM）。  
> - **D 桥接回流**：手工 DORMANT 起点 → 选 20 → wake → `HonestyBridgeCtaController` Yes→`onAccept` / No→`onDecline` / 同日再 `onHonestyCheckInComplete` → smoke D（**非**桥接按钮 DOM / Yes 后完整 Arrival UI）。  
> **仍须人工**：睡姿观感、10s 呼吸 UI、桥接文案排版、Yes 后完整 Arrival 动画。

1. 模拟「距上次专注结束 ≥ 2 小时」：写过一次专注结束时间戳后把时钟拨到 ≥2h，或 DEV 改 `focus-tiger.focus-session-end.v1` 后刷新 / 回前台（见下方强制手段）。新用户无结束记录**不会**自动睡。
2. 惰性进 DORMANT：应先见 **cloakSleep 披毯**再落入 sleeping；点进 Honesty（或 Mindful Check-in）。
3. 选时长 10 / 20 / 30+（选 20）。
4. **实际顺序**：选时长后 **立刻**播 `dormantWake`（cloak-sleep **倒放**，非 stretch），与约 **10 秒**呼吸倒计时**并行**（`HONESTY_BREATH_MS = 10_000`）。  
   *[单元/控制器：2h→cloak→wake→离 DORMANT → smoke D sleep→wake / dormantIdle chain；**非** cloak-sleep 倒放观感]*
5. 补登结束（记账、离 DORMANT）后：**立刻**出现 Honesty **桥接 CTA**（「要不要现在也坐一会儿？」Yes / No 同级；Welcome 回显可与邀请同屏一小会儿）。  
   - **Yes** → 完整 Arrival Practice → Companion（**不**跳过、**不**直接开表 / Ambient）。  
   - **No** → idle，无二次挽留。  
   - **每次**补登完成后都可出现（**不限**当日一次）。定稿见 `HONESTY_BRIDGE_CTA.md`。  
   *[单元/控制器：桥接 Yes/No/同日再出回调 → smoke D；**DOM 真实补登链**（入口→时长→呼吸→桥接 Yes→Arrival / No→Idle）→ `e2e/honesty-bridge-real-path.spec.js`（`?honestyBreathMs=`）；叠层隐藏 Honesty/微仪式入口仍可经 `__honestyBridge` 注入 → e2e `micro-ritual.spec.js` bridge 行。**非**睡姿/Arrival 动画观感。**CI**：注入 hook 须在 `vite preview` 生产构建可用（勿仅 DEV 挂载）]*
6. DORMANT 清除后仍可再点 Sit 做正式会话，与补登不冲突。  
   **已知**：Honesty 路径暂不接 halo / 金光。
   **已知**：Honesty 补登**不**刷新 `focus-session-end`；若距上次真实专注仍 ≥2h，回前台 sync 可再次进睡。

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

> **拍板（2026-07-30）**：v1 **可点切语** + 持久化；六语方向但 **审完再露**（未 ready 不进选择器）。完整可点：**en+zh**（审计 §9.6）。  
> **自动化（下一回合）**：unit 奇偶+`setLocale`；e2e **点切语 UI** 断言关键文案。  
> **仍须人工**：各启用语 375 排版。

1. 打开 `?product=1` → ⋯ / 窄屏抽屉 → **Language**（实现后的入口名以 UI 为准）→ 选 **中文**。
2. 确认 Sit / Honesty / Arrival / Companion / Reflection / 桥接等无英文残留、无 `{intention}` 未替换。
3. 再切回 **English** 确认。刷新后语言保持（`focus-tiger.locale.v1`）。
4. （DEV 兜底仍可用 `__i18n.setLocale`；正式验收以 UI 为准。）

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

1. Idle 下见 `#weekly-practice-heatmap-cluster` 内 **时钟按钮** `#reminder-preference-toggle`（热力图右侧；**仅 Idle 可见**，Focusing 时整簇隐藏）。首次可见可出 onboarding Hint `in-app-reminder`（「设一个每天的时分…」）；点「?」补救 Idle 时亦应含本 tip。
2. 点击展开面板 `#reminder-preference-panel`：
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

5. 设好提醒且已过设定时分、今日零完成 → 顶部居中 `#in-app-reminder-banner` 出现，文案 `reminder.gentle_waiting`（EN "Yin is right here when you're ready." / ZH「你准备好了，阿寅就在这儿。」），右侧 **×** 可关。不得再用「waiting / 在等你」类紧逼措辞。
6. 点 × 关闭 → **本页会话内不再出现**（即使条件仍满足）。
7. **回流**：再次 `sync` / 切后台再回前台 → 仍不重复；**完整刷新**或新开 App → 若条件仍满足，**可再次出现**。
8. **负例**：未到设定时分 → 不出现；今日已完成任一会话 → 不出现；未勾选开启 → 不出现。

### P3 · 忙碌期策略（**已拍板 suppress** · 非用户可见「第 4 步」）

> **说明**：下列对照表记录产品决策（「用户正在 Arrival / Focusing 时横幅怎么办？」），**不是**场景步骤序号。**2026-07-23 已拍板**：**`suppress`**——忙碌期隐藏横幅、**不**做 `defer` 延迟弹出。权威接线：`main.js` → `InAppReminderBannerController({ busyPolicy: 'suppress' })`（见 `TEST_TRACKER` L186 / `SHARED_RESOURCES`）。

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

## 建议补充的故事（相对 A–G；O/P 已升格为正式场景）

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

---

## 调试强制触发（勿当生产功能）

| 需求 | 入口 |
|---|---|
| 眨眼 | 实验室面板「眨眼」或 `playEmotion('blink')` |
| Celebrating / SessionComplete / 合十 / 挥手 / 舒展 / 正念鞠躬 / 点头致意 | 实验室对应按钮（点头**仅**调试，非靠近自动） |
| 一炷香莲花 | 实验室「模拟一炷香」（业务未接线） |
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
