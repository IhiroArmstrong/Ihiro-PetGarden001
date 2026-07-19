# SCENARIO_TESTS.md — 用户场景操作故事测试脚本

创建日期：2026-07-19  
最近代码核对：2026-07-20（文档收敛 + 增量对照 `focus-tiger` 实现）

**权威路径**：`focus-tiger/docs/SCENARIO_TESTS.md`  
仓库根目录 `SCENARIO_TESTS.md` 仅为指针；旧稿 `有待核对-SCENARIO_TESTS720.md` 已归档，勿再改。

定位：这份文档和 `focus-tiger/docs/TEST_TRACKER.md` 不是替代关系，是两个层级——TEST_TRACKER 是「每个功能点单独测试」的清单，本文档是「把功能点串成一次真实使用故事」的剧本。很多 bug 只有在功能连起来走的时候才会暴露。建议两份一起用：走完一个场景故事后，回头把涉及到的功能点在 TEST_TRACKER 里勾掉。

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

## 场景 A：Kelly 的第一个早晨（全新用户，当日 DORMANT）

1. 打开 App（建议 `?product=1`）。当日零完成时，阿寅应是 **睡着**（`sleeping` / DORMANT），**不是** idle-breathing。
2. 应看到 Honesty Check-in 可忽略提示（文案键 `HONESTY_CHECKIN_PROMPT`，大意「Practiced elsewhere today?」）。Kelly 决定直接开始，不理会提示，点击 **Sit with Yin**。
3. Arrival Practice 展开：
   a. 欢迎 beat（~2 秒气泡，`ARRIVAL_WELCOME`）
   b. Notice：六个状态图标；点 "Okay" → 观察式回应（实际文案以 locale 为准，例如 en：「An ordinary steadiness is here.」）
   c. 呼吸 beat（~5 秒，无倒计时）
   d. Choose：六个活动图标；点 "Deep Work" → `palms-together`（合十确认；实现可能含正放/回落，以观感为准）
4. Companion Mode 三选一展开。产品文案为 **Here & Now / Offline Space / Flow State**（不是旧稿 Stay here / I'll step away / …）。Kelly 选 **Here & Now** → **选中后立即开始 Focus+计时**（不必再点 Sit）。
5. 计时开始后，可展开右下角 Ambient Soundscape，选一首播放（未计时时点 Sound 应提示须先进入专注，不展开面板）。
6. 全程观察 Idle：**仅**「呼吸 ×5 → blink-smile」固定节奏。  
   **张望 gaze / yawn / tea / ear-wiggle 不在正式 Idle 编排中**（素材可在，见 `companionGestureCatalog`；测序列用实验室 / `__spritePlayer.play(...)`）。看不到它们不算失败。  
   **靠近区不应自动播点头**（`nodGreeting` 已拆除靠近触发；调试「点头致意」可手工播）。
7. 达到目标时长 → **当日首次**：Celebrating（`celebrate-dance` / `celebrate-dance-v2` 随机）→ 回落坐姿。
8. **同日第二次达标**：应播 **SessionComplete**（摆尾），**不应**再播完整 Celebrating。  
   （旧稿「每日首次庆祝限制尚未接通」已过时——代码已接线。）
9. **已知缺口**：IncenseGreeting（莲花+金粒子）**业务会话结束尚未自动接线**，仅调试面板「模拟一炷香」。首次完成**不要**期待自动莲花。
10. 进入 Reflection Moment：开头回显本次 Choose（文案键类似 `Chosen direction: {text}`，以 locale 为准），三问可独立跳过。
11. 回到非 DORMANT；今日 Honesty 提示不应再因零完成自动出现。

---

## 场景 B：分心后自己走神又回来（Recover / Re-focus Acknowledge）

1. 当天再开一场（Arrival → Companion 选 **Here & Now**）。
2. 计时中切换到其他标签页 **超过 60 秒**（`REFOCUS_DISPLAY_THRESHOLD_MS = 60000`）再切回。
3. 应观察到：非模态观察式文案 + `nod-bow`（`mindfulAcknowledge` / refocus）。
4. **纠正旧稿**：Re-focus **会**占用与 MindfulAcknowledge / stretchReminder **共享**的每日提醒额度（`SHARED_DAILY_REMINDER_LIMIT = 3`）；每场会话最多 1 次 Re-focus（`REFOCUS_PER_SESSION_LIMIT = 1`）。
5. 继续完成本次会话。

强制触发（实验室 / DEV）：会话 FOCUSING 且非 Offline/Flow 抑制离开提醒时，控制台  
`__mindfulReminderController.handleAttentionReturn({ durationMs: 90000, displayEligible: true })`。

---

## 场景 C：中途主动放弃（未达标）

1. 开始新会话，进行到一半，点 **Rise**。
2. 不应播放 Celebrating，不应播放 IncenseGreeting。
3. 短暂留白后淡入 Reflection（主动结束约 `MANUAL_END_PAUSE_MS = 300`）。
4. 若本次 Choose 有内容，回显仍应出现（与是否达标无关）。
5. 三问正常可跳过。

---

## 场景 D：请假一天后的 Honesty Check-in（含桥接 CTA）

1. 模拟「次日零完成」：可用无完成记录的浏览器配置 / 清相关 localStorage 后刷新（见下方强制手段）。
2. 当日 DORMANT，可忽略提示；这次点进 Honesty。
3. 选时长 10 / 20 / 30+（选 20）。
4. **实际顺序**：选时长后 **立刻**播 `dormant-wake`（睡→坐起，非 stretch），与约 **10 秒**呼吸倒计时**并行**（`HONESTY_BREATH_MS = 10_000`）。
5. 补登结束（记账、离 DORMANT）后：**立刻**出现 Honesty **桥接 CTA**（「要不要现在也坐一会儿？」Yes / No 同级；Welcome 回显可与邀请同屏一小会儿）。  
   - **Yes** → 完整 Arrival Practice → Companion（**不**跳过、**不**直接开表 / Ambient）。  
   - **No** → idle，无二次挽留。  
   - **每次**补登完成后都可出现（**不限**当日一次）。定稿见 `HONESTY_BRIDGE_CTA.md`。
6. DORMANT 清除后仍可再点 Sit 做正式会话，与补登不冲突。  
   **已知**：Honesty 路径暂不接 halo / 金光。

---

## 场景 E：Offline Space（I'll step away）

1. Arrival 后 Companion 选 **Offline Space** → **只预选，须再点 Sit** 才开计时。
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
| **I** | 点 **How shall we sit?**（未过 Arrival）→ 应启动 Arrival；Honesty 提示开着时仍可点 | 回归锁：禁静默无反馈 |
| **J** | Rise 后再点 hint → 再走 Arrival；再选 Here & Now → 立刻计时 | 回流路径 |
| **K** | Offline Space：点选后 HUD **不应**走动，再点 Sit 才计时 | 与 Here & Now / Flow 分流 |
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
| 清当日完成（模拟 DORMANT） | DEV：清 `DailyCompletionStore` 相关 localStorage 后刷新（或 `__dailyCompletionStore`） |

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
