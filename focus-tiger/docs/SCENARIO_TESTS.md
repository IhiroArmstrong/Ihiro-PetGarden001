# SCENARIO_TESTS.md — 用户场景操作故事测试脚本

创建日期：2026-07-19  
最近代码核对：2026-07-19（Cursor 对照 `focus-tiger` 实现）

定位：这份文档和 `focus-tiger/docs/TEST_TRACKER.md` 不是替代关系，是两个层级——TEST_TRACKER 是「每个功能点单独测试」的清单，本文档是「把功能点串成一次真实使用故事」的剧本。很多 bug 只有在功能连起来走的时候才会暴露。建议两份一起用：走完一个场景故事后，回头把涉及到的功能点在 TEST_TRACKER 里勾掉。

**重要提示**：部分步骤对应的功能仍在「已知未完成」状态（本文档已逐条标注）。走到这些步骤时看到「没反应」或「和预期不符」，不代表新 bug，是已知缺口，不要重复报告。

---

## 用哪个链接测？

当前 `npm run dev` 默认页是 **研发实验室**，不是干净产品壳：

| 链接 | 用途 |
|---|---|
| [http://localhost:5173/](http://localhost:5173/) | **实验室**：右上角情绪调试面板常驻；DEV 下有 `window.__*` |
| [http://localhost:5173/?product=1](http://localhost:5173/?product=1) | **产品壳预览**：隐藏 `#emotion-debug-ui`，更接近真实用户界面；适合走场景 A–G |

演示会话时长：`DEMO_SESSION_MINUTES = 1`（约 1 分钟达标，便于故事测完）。  
语言切换：**无应用内设置**；仅实验室页打开控制台执行 `__i18n.setLocale('zh')` / `'en'`（需非 `?product=1` 的 DEV 构建，或临时在控制台仍可用若已暴露——product 模式仍加载同一 bundle，DEV 下 `__i18n` 仍可用）。

---

## 场景 A：Kelly 的第一个早晨（全新用户，当日 DORMANT）

1. 打开 App（建议 `?product=1`）。当日零完成时，阿寅应是 **睡着**（`sleeping` / DORMANT），**不是** idle-breathing。
2. 应看到 Honesty Check-in 可忽略提示（文案键 `HONESTY_CHECKIN_PROMPT`，大意「Practiced elsewhere today?」）。Kelly 决定直接开始，不理会提示，点击 **Sit with Yin**。
3. Arrival Practice 展开：
   a. 欢迎 beat（~2 秒气泡，`ARRIVAL_WELCOME`）
   b. Notice：六个状态图标；点 "Okay" → 观察式回应（实际文案以 locale 为准，例如 en：「An ordinary steadiness is here.」）
   c. 呼吸 beat（~5 秒，无倒计时）
   d. Choose：六个活动图标；点 "Deep Work" → `palms-together` 合十播一次
4. Companion Mode 三选一展开。产品文案为 **Here & Now / Offline Space / Flow State**（不是旧稿 Stay here / I'll step away / …）。Kelly 选 **Here & Now** → **选中后立即开始 Focus+计时**（不必再点 Sit）。
5. 计时开始后，可展开右下角 Ambient Soundscape，选一首播放（未计时时点 Sound 应提示须先进入专注，不展开面板）。
6. 全程观察 Idle：**仅**「呼吸 ×5 → blink-smile」固定节奏。  
   **张望 gaze / yawn-stretch 已从正式 Idle 删除**（素材仍在，仅 DEV `__spritePlayer.play(...)` 可强制）。看不到它们不算失败。
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

## 场景 D：请假一天后的 Honesty Check-in

1. 模拟「次日零完成」：可用无完成记录的浏览器配置 / 清相关 localStorage 后刷新（见下方强制手段）。
2. 当日 DORMANT，可忽略提示；这次点进 Honesty。
3. 选时长 10 / 20 / 30+（选 20）。
4. **实际顺序**：选时长后 **立刻**播 `dormant-wake`（睡→坐起，非 stretch），与约 **10 秒**呼吸倒计时**并行**（不是「先呼吸再伸懒腰」）。
5. DORMANT 清除后仍可再点 Sit 做正式会话，两者不冲突。  
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
2. 重走 Arrival + Reflection，确认欢迎 / Notice / Choose / 回显 / 三问无英文残留、无 `{intention}` 未替换。
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

---

## 调试强制触发（勿当生产功能）

| 需求 | 入口 |
|---|---|
| 眨眼 | 实验室面板「眨眼」或 `playEmotion('blink')` |
| Celebrating / SessionComplete / 合十 / 挥手 / 舒展 / 正念鞠躬 | 实验室对应按钮 |
| 一炷香莲花 | 实验室「模拟一炷香」（业务未接线） |
| Honesty 睡醒 | 实验室「Honesty唤醒」或走 Honesty UI |
| gaze / yawn | **仅 DEV**：`__spritePlayer.play('gazeP1CenterBlinkLeft')` 等 / `'yawnStretch'`（无面板按钮） |
| Re-focus | DEV：`__mindfulReminderController.handleAttentionReturn({ durationMs: 90000, displayEligible: true })`（须 FOCUSING 且未 suppress） |
| Idle 加速眨眼 | DEV：`__idleOrchestrator.setTiming({ breathCyclesBeforeBlink: 1 })` |
| 清当日完成（模拟 DORMANT） | DEV：视 `DailyCompletionStore` 存储键清 localStorage 后刷新（或 `__dailyCompletionStore` 若已暴露） |

说明：`#emotion-debug-ui` 当前在**非** `?product=1` 时挂载；`window.__*` 仅 `import.meta.env.DEV`。

---

## 2026-07-19 代码核对摘要（Cursor Prompt 执行结果）

1. **已知缺口核对**  
   - A8「首次庆祝未接线」→ **文档过时，已接线**。  
   - A9 自动 Incense → **确未接线**（仅调试）。  
   - E 10 分钟挥手 → **确未接线**。  
   - A6 gaze/yawn 正式 Idle → **已删除调度**（场景稿已改）。  
2. **数值（如实）**  
   - Re-focus 展示阈值：60s  
   - Across-tools idle：30min（1_800_000 ms）  
   - Honesty 呼吸：10_000 ms（与 dormant-wake 并行）  
   - 演示会话：1 分钟  
3. **EyeTracking** → 回退干净。  
4. **强制触发** → 见上表；gaze/yawn 无面板按钮。  
5. **TEST_TRACKER** → 已补「场景剧本 / 产品壳链接」说明行；不重复堆功能点。

---

## 给 Cursor 的 Prompt

```
请对照 SCENARIO_TESTS.md 里的场景 A–G（及建议补充 I–M），逐条核对当前代码实现是否与描述一致，
重点关注：
1. 每个场景里标注「已知缺口」的步骤，确认代码现状确实如描述（没有被偷偷实现
   又没更新文档，或者反过来文档过时了）。
2. 场景 G/F 涉及的宽松 idle 兜底阈值等具体数值，请如实报告代码里当前的实际
   数值，不要假设。
3. 场景 H 请确认 EyeTracking 回退是否彻底（界面上不应再有任何瞳孔跟随鼠标
   的表现）。
4. 对于场景里依赖概率触发的步骤（idle 变体、blink-smile 等），请提供一个
   仅调试环境可用的「强制触发」入口或参数，方便测试时不用干等概率命中，
   同时确保这个调试入口不会出现在生产构建里。
5. 核对完成后，在 TEST_TRACKER.md 里补充/更新对应功能行的状态，不要重复
   已有条目。
6. 区分实验室链接与 ?product=1 产品壳；Agent 自测故事时优先用产品壳走主路径，
   回流路径至少测 Rise→再 Arrival 一条。
```
