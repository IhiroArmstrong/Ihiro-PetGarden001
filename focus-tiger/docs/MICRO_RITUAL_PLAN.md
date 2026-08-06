# MICRO_RITUAL_PLAN.md — Idle 呼吸练习（原「一分钟呼吸」）

> **状态**：**UI 已接入**；**2026-08-06** 扩展为可选时长 Extended Breath Practice（1/3/5/10/20 分钟 + ephemeral 氛围乐 + 完成后浅接 Reflection + visibility 墙钟补查）。  
> **实现**：`MicroRitualUI` + `main.completeMicroRitual`；e2e `e2e/micro-ritual.spec.js`。  
> **创建**：2026-07-22  
> **范围**：独立于 Companion 三选一的 Idle 平级入口；可选时长呼吸练习（默认仍可从 1 分钟 chip 进入）。

---

## 已拍板实现口径（2026-07-22 · 2026-08-06 修订）

1. Store：`recordCompletion(所选分钟)`，**不**加 `source`。  
2. PracticeDays：`markToday(所选分钟)`。  
3. 留存：`trackRetentionEvent('micro_ritual_complete')` 仅 console 占位；**不** `noteSessionComplete`。  
4. 同日可多次；完成反馈走 `LIGHT_COMPLETE_POOL`（`sessionComplete` / `mindfulAcknowledge` / 稀有鹦鹉；**无** `curiousTilt`；从不 Celebrating）。进出 smiling / 回 Idle 用 **1s CapCut**（防闪白）。  
5. 中途 Leave：不记账、无提示、**不**进 Reflection；回 Idle 亦 CapCut。  
6. 入口：**首页左球**（DOM `#ft-*-home-quickstart` / `#quick-start-focus`；文案 Breath practice）→ **时长 chip 点选即开**（1/3/5/10/20）；**不再**列于抽屉 / ⋯。面板复用 Arrival 吸/呼相位 + smiling@4fps + `LightProgression.beginBreath()`（光环仍 **4s**，**不**与文案强制同拍）。遗留 `#micro-ritual-idle-entry` 始终 hidden。  
7. e2e 缩短：`?microRitualMs=1500`（覆盖墙钟；记账仍按所选 chip 分钟）。  
8. ~~吸/呼同拍~~：**已撤销**（用户书面：同拍观感不行）。保留文案 2.5s 交替 + 独立 4s 光环 + smiling@4fps。  
9. **HUD 直播**：进行中左上 FocusHUD（仅 breath 相位）；**仍不启** `FocusSession` / Rise / Celebrating。  
10. **完成检测**：`setTimeout` + `visibilitychange` 回前台墙钟补查（不引入 FocusSession）。  
11. **氛围乐**：练习开始 `playTrackEphemeral`（preferred，off→Mer-Ka-Ba）；完成/Leave `stopPlaybackEphemeral`；**不**走 `startSession`/`endSession`/presence。  
12. **Reflection**：完成后浅接 `sessionEndFlow.onSessionEnded({ completed: true })`（不等完成动画）。

---

## 0. 产品定位（方案前提）

| 维度 | 微仪式 | 正式 Focus（Sit → Arrival → Companion → 计时） |
|---|---|---|
| 入口 | Idle 独立按钮（不经 Companion） | Sit / How shall we sit? |
| 时长 | **1/3/5/10/20 分钟**可选（chip 点选即开；e2e 可 `?microRitualMs=`） | DEMO 默认 1 分钟或 `?sessionMinutes=`；产品目标可达更长 |
| Arrival | **不走** Notice→Choose→Companion | 完整 Arrival Practice |
| 计时器 | **不启** `FocusSession` / Rise；**HUD 直播**墙钟与同坐条（算专注观感） | `FocusSession` 墙钟达标 |
| 完成反馈 | **轻量** `SessionComplete` 摆尾 + **中置** toast（见 §4） | 当日首次达标 `Celebrating`；同日后续 `SessionComplete` |
| Reflection | **完成后浅接** Reflection（Leave 不进） | 达标 / 中途 Rise 均可进 |

微仪式是「随时可做的一小口气」，不是缩短版 Focus，也不是 Honesty 补登。

---

## 1. 现有流程速览（调研依据）

### 1.1 Arrival Practice（Sit 后 · 计时前）

权威：`ARRIVE_MOMENT_DESIGN.md`；状态机：`src/core/ArrivalPractice.js`；UI：`src/ui/ArrivalPracticeUI.js`。

```
Sit → Welcome (~2s) → Notice（点选 + 短句 ~2.4s）
    → Breath (~5s) → Choose → ready
    → Companion 三选一 → FocusSession 计时
```

| 常量 / 资源 | 值 | 文件 |
|---|---|---|
| `ARRIVAL_BREATH_MS` | **5000** | `ArrivalPractice.js` |
| 吸/呼文案切换 | 每 **2500ms** 一轮（复用 `HONESTY_BREATH_INHALE` / `EXHALE`） | `ArrivalPracticeUI._startBreath` |
| 角色视觉 | `playEmotion('smiling', { fps: ARRIVAL_BREATH_SMILE_FPS })`，**4 fps** pingpong；**不**切 idle-breathing | `main.js` `onBreath`；`EmotionController.js` |
| 光影 | `LightProgression.beginBreath()`：Dolly 推近 + 呼吸光环（`GOLD_BREATH_PERIOD_SEC = 4`） | `LightProgression.js` |
| 倒计时数字 | Arrival Breath **无**秒数倒计时 | 对比 Honesty 有 countdown |

### 1.2 Honesty 呼吸（对照）

| 常量 | 值 |
|---|---|
| `HONESTY_BREATH_MS` | **10_000** |
| 吸/呼切换 | 每 **4000ms** |
| UI | `HonestyCheckInUI.startBreathGuide(durationMs)`（已支持传时长） |
| 记账 | 呼吸结束后 `DailyCompletionStore.recordCompletion(所选分钟)`；**不**置 `celebrated` |

### 1.3 FocusSession 计时与正式完成

- 类：`FocusSession`（墙钟 `startedAtMs` / `hasReachedTarget()`）。
- 达标路径：`main.beginSessionCompleteIfNeeded` → `triggerSessionCompletionFeedback`（Celebrating vs SessionComplete）→ `finishCompletedSession` → `honestyCheckIn.onTimedSessionCompleted(targetMinutes)` → **`recordCompletion`** + `PracticeDaysStore.markToday` + 留存 `first_session_complete`。
- DEMO 默认目标已是 **1 分钟**（`DEMO_SESSION_MINUTES_DEFAULT`）——与「微仪式 1 分钟」时长重合，但路径完全不同；实现时须避免用户把二者当成同一功能。

---

## 2. 可复用资源清单

### 2.1 呼吸 beat：~5s → 1 分钟是否可延展？

**可以。** Arrival 的 Breath 不是独立视频素材，而是：

1. **定时器**（`ARRIVAL_BREATH_MS`）  
2. **文案相位**（吸 / 呼交替）  
3. **角色**（放慢 `smiling` / `blink-smile`）  
4. **光影**（`LightProgression` 呼吸光环 + 可选 Dolly）

将定时器改为 **60_000ms**，相位周期保持 2.5s 或改用 Honesty 的 4s，即可得到约 1 分钟引导；**无需新抽帧序列**作 MVP 主路径。

| 资源 | 复用方式 | 备注 |
|---|---|---|
| Arrival `_startBreath` 模式 | 抽成共享「呼吸引导」helper，或微仪式专用 UI 复制后改时长 | 推荐抽共享，避免第三份 inhale/exhale interval |
| `HonestyCheckInUI.startBreathGuide(ms)` | 可直接传入 `60_000` 做文案+倒计时壳 | 视觉上偏 Honesty 卡片；若要「仪式感」更干净，宜独立轻面板 |
| `HONESTY_BREATH_INHALE` / `EXHALE` | 文案键直接复用 | 总引导句另加 i18n（如「One minute together.」） |
| `smiling` @ 4 fps | 与 Arrival Breath 同契约 | 60s 全程 smile pingpong 可接受；勿硬切 idle 闭目 |
| `LightProgression.beginBreath` / `endBreath` | 光环 +（可选）轻度 Dolly | 微仪式结束须 `clear` / `endBreath`，避免残留 FOCUSING 观感 |
| `haloBreathing`（`halo-breathing` 帧） | **可选增强**；Honesty 路径暂不自动接 | 非 MVP 必选；若用须遵守 ONE_SHOT / 回落 idle |
| Idle 闭目呼吸（`IdleOrchestrator`） | **不建议**作微仪式主视觉 | Idle = 自主基底；仪式期应用响应态 smiling / 引导 UI |
| FocusSession / Focus HUD | **不复用** | 微仪式不是 Focusing 会话 |
| Arrival Notice / Choose / Companion | **不复用** | 任务要求独立于三选一 |
| Celebrating / `celebrate-dance*` | **不复用**（见 §4） | 保留给正式计时「当日首次达标」 |

### 2.2 建议的微仪式主路径（草案 · 待拍板）

```
Idle 点「一分钟呼吸」
  → 轻面板 / 全屏轻叠层（可 Skip）
  → 约 60s：吸↔呼文案 + smiling@4fps + 呼吸光环
  → 结束：playEmotion('sessionComplete') → 回 Idle
  → 记账：见 §3（不经 triggerSessionCompletionFeedback）
```

可选：开头一句 Welcome 级短气泡（~2s），**不要**接 Notice / Choose。

---

## 3. DailyCompletionStore 记账

### 3.1 现有 API（唯一写入完成列表的方法）

| 方法 | 用途 |
|---|---|
| **`recordCompletion(durationMinutes)`** | 追加 `{ completedAt, durationMinutes }`；≤0 拒写 |
| `hasCompletedToday()` | `sessions.length > 0` |
| `hasCelebratedToday()` / **`markCelebratedToday()`** | Celebrating 日期戳（与 sessions **解耦**） |
| `getTodaySessions()` / `getTodayTotalMinutes()` | 读当日列表 / 分钟合计 |

持久化：`focus-tiger.daily-completions.v1`（仅当日；换日重置）。见 `SHARED_RESOURCES.md` §1.1。

### 3.2 「轻量完成」vs「正式完成」——现状

**Store 层：不支持区分。**

- 计时达标与 Honesty 补登都走 **`recordCompletion`**，sessions **无 `source` / `kind`**。
- 产品文档写的「每次轻量确认 / 每日首次完整庆祝」落在 **反馈动画分流**（`triggerSessionCompletionFeedback` + `celebrated` 戳），**不是** sessions 条目类型。
- Honesty 补登：写 sessions，**不** `markCelebratedToday` → 不挡当日首次 Celebrating 舞。

因此：若问「记账逻辑是否已支持两种类型」——**否**（列表一视同仁）；若问「完成反馈是否已有轻重两档」——**是**（Celebrating vs SessionComplete），但绑定的是「正式计时达标路径」，不是条目 kind。

### 3.3 微仪式应调用什么

**建议（实现阶段默认提案）**：

1. 完成后调用 **`dailyCompletionStore.recordCompletion(1)`**（1 = 一分钟墙钟等价记账）。  
2. **不要**调用 `markCelebratedToday()`。  
3. **不要**走 `triggerSessionCompletionFeedback`（该函数在未庆祝时会开 **Celebrating**）。  
4. 反馈：直接 `emotionController.playEmotion('sessionComplete', { onComplete })`（§4）。  
5. 是否同步 `PracticeDaysStore.markToday()` / 留存 `noteSessionComplete`：**待拍板**（见 §6）。倾向：微仪式可点亮「今日同坐」光点（与 Honesty 类似的「也算练习」），但 **不宜**单独抢占 `first_session_complete` 语义若产品认为「首次完成」应指正式 Focus——须确认。

**对照正式完成**：正式路径 = `onTimedSessionCompleted`（recordCompletion + practice day + retention）+ 先经过 `triggerSessionCompletionFeedback`（可能 Celebrating）。

### 3.4 若要真正区分「轻量 / 正式」条目——需改动

仅当后续 UI/统计要拆开（例：今日分钟条不把微仪式算进「专注」、热力图分色）时才改 Store；否则 MVP 可保持一视同仁 + **反馈路径分流**。

| 改动项 | 说明 |
|---|---|
| `CompletionSession` 增可选字段 | 例：`source: 'timed' \| 'honesty' \| 'microRitual'`（或 `kind: 'formal' \| 'light'`） |
| `recordCompletion(minutes, { source })` | 默认 `'timed'` 兼容旧调用；Honesty / 微仪式显式传入 |
| 读 API | `getTodayTotalMinutes({ sources? })` 或过滤 helper；默认合计行为保持不变以免破坏 HUD「今日同坐」 |
| 单测 + `SHARED_RESOURCES` §1.1 | 必同步；换日重置逻辑不变 |
| 迁移 | 旧条目无 source → 视为 `'timed'` 或 `'unknown'`（只读兼容） |

**MVP 最小方案**：不改 Store 形状；`recordCompletion(1)` + 直接 SessionComplete；文档写明「列表层暂不区分，反馈层强制轻量」。

---

## 4. 完成后反馈动画（明确建议）

### 建议：复用现有 **`SessionComplete`（`session-complete` 摆尾）**，不要完整 **`Celebrating`**

| | SessionComplete | Celebrating |
|---|---|---|
| Emotion key | `sessionComplete` | `celebrating` |
| 素材 | `session-complete` 28 帧 ≈ **3.5s** | `celebrate-dance` / `v2` ≈ **5s** 舞 |
| 产品位阶 | 「每次完成」轻量确认（`PRODUCT_POSITIONING` §八.1；`EMOTION_BIBLE`） | 「每日首次**正式计时达标**」完整庆祝 |
| 优先级 | 70 | 100 |

### 理由

1. **反馈分级**：微仪式属于「被温柔看见」的轻量完成，不是当日 Focus 目标达成；用 Celebrating 会稀释「第一次正式达标」的仪式感，并与 DEMO 1 分钟 Focus 抢同一语义。  
2. **庆祝戳**：正式路径靠 `markCelebratedToday` 防同日重复舞；若微仪式误走 `triggerSessionCompletionFeedback`，未庆祝日会直接跳舞，且可能占掉当日正式 Focus 的首次舞（若错误地 stamp）或造成「没开 Focus 却见过舞」的混乱。  
3. **已有验收契约**：同日二次正式达标 = 摆尾（TEST_TRACKER Celebrating / SessionComplete 行已通过）。微仪式与「同日轻量确认」同档，复用摆尾一致。  
4. **时长匹配**：3.5s 摆尾后立刻回 Idle，适合「一分钟后轻轻收下」；Celebrating 偏完整表演。  
5. **不选用 `MindfulAcknowledge`**：那是会话中正念提醒档（更克制、占共享提醒池语境），不是「一段练习做完」的完成确认。

### 实现约束（写入实现 Task Brief 时）

- 调用：`playEmotion('sessionComplete', { onComplete: … })`。  
- **禁止** `startCelebrating` / `STATES.CELEBRATE` / `markCelebratedToday`。  
- 播完回归 Idle 呼吸基底（现有 one-shot → idle 叠化契约）。  
- **不**打开 Reflection Moment；**不**把微仪式叠层算进「未就绪却可点」的静默门闩——进行中须**隐藏** Sit（与 Arrival 同契约；禁止仅禁用仍露出），并禁用 Companion / 再次点微仪式，或明确 Leave。

---

## 5. Idle 按钮布局与插入点

### 5.1 当前结构（代码位置）

| 元素 | 创建 / 挂载 | 视觉角色 |
|---|---|---|
| `#session-start-dock` | `CompanionModePicker` 构造：在 `#btn-focus` 外包一层 column flex | 底中主操作柱 |
| `.session-start-dock__panel` | 三选一面板（展开时在上） | Companion 选项 |
| `#honesty-idle-entry` | `HonestyCheckInUI._ensureIdleEntry`：`dock.insertBefore(btn, dock.firstChild)`；CSS `order: -2` | Sit **上方**立体小钮 |
| `#btn-focus` | 原 HTML；被 append 进 dock | **Sit with Yin** 主 CTA |
| `.session-start-dock__hint` | CompanionModePicker | **How shall we sit?** 次要钮 |

样式权威注入：`CompanionModePicker._injectStyles`（`#session-start-dock-styles`）。  
叠层门闩：`setIdleChromeVisible` / `setPostSessionOverlayActive`（Arrival / Reflection 时收起/禁用 hint）。

竖排示意（Idle）：

```
        [ Honesty Check-in ]     ← order:-2，dock 首子
        [   Sit with Yin   ]     ← #btn-focus
        [ How shall we sit?]     ← hint
```

### 5.2 平级按钮可行插入点

| 方案 | 插入方式 | 优劣 |
|---|---|---|
| **A（推荐）** | 仿 Honesty：向 `#session-start-dock` `insertBefore`，CSS `order: -1`（Honesty 仍 -2）或 Honesty 与微仪式同级并排一小行 | 与现有「Sit 上方次要入口」一致；**独立于** Companion 三选一；复用 dock 宽度与 z-index(16) |
| **B** | `#btn-focus` 与 hint **之间**再插一钮 | 主 CTA 与 Companion 入口被拆开，易显拥挤 |
| **C** | hint **下方**再插 | 距拇指热区更远；易被当成 Companion 附属 |
| **D** | dock **外**绝对定位（如 Honesty fallback） | 与 Sit 不对齐；窄屏易撞 Sound / ? |
| **E** | 塞进 Companion **面板内**第四项 | **否决**——任务要求独立于三选一 |

**推荐 A**：`#micro-ritual-idle-entry`（名待定），样式可接近 `.session-start-dock__honesty-entry` 但略弱于 Honesty（或同级），文案 i18n 另定。  
可见性：仅 Idle chrome 显示；Focusing / Arrival / Reflection / Honesty 桥接 / 微仪式进行中隐藏或禁用（禁止可点静默；**桥接时尤其须收起**，否则 dock `z-index:16` 会叠住桥接 Yes/No）。

保护面：Honesty 小钮常驻、Sit 文案不被裁切（窄屏）、hint 展开三选一、dock z-index 高于 Honesty 面板；**Honesty 桥接 CTA 期间微仪式入口须 hidden**。

---

## 6. 开放决策（待你确认后再实现）

1. **Store**：MVP 仅 `recordCompletion(1)` 不分 source，还是先加 `source: 'microRitual'`？  
2. **PracticeDays / 留存**：微仪式是否 `markToday`？是否可触发 `first_session_complete`？  
3. **UI 壳**：独立轻面板 vs 复用 Honesty `startBreathGuide(60000)` 外壳？  
4. **Skip**：允许中途跳过且**不记账**？（与 Arrival / Reflection「可跳过」原则一致——建议允许 Skip 且不写 completion）  
5. **按钮文案** EN/ZH 定稿（观察式、非强迫）。  
6. **限频**：同日可多次？还是每日一次轻入口？（建议可多次；反馈始终 SessionComplete，从不 Celebrating）

---

## 7. 实现阶段保护面（预告 · 非本任务）

- Companion 三选一 / Arrival 门闩 / Skip — begin 开表  
- Celebrating 仅正式计时首次达标  
- Honesty 小钮与补登记账  
- Idle 呼吸↔眨眼不闪  
- Reflection 仅 Focus 结束路径  

自动化：实现后须补门闩/记账单测；观感行进 TEST_TRACKER；声称修好前 `test:smoke` + `test:e2e`。

---

## 8. 文档与代码索引

| 主题 | 路径 |
|---|---|
| Arrival 设计 | `docs/ARRIVE_MOMENT_DESIGN.md` |
| 完成反馈分级 | `docs/PRODUCT_POSITIONING.md` §八；`docs/EMOTION_BIBLE.md` |
| 共享 Store | `docs/SHARED_RESOURCES.md` §1.1 |
| Arrival 状态机 / Breath UI | `src/core/ArrivalPractice.js`；`src/ui/ArrivalPracticeUI.js` |
| DailyCompletion | `src/core/DailyCompletionStore.js` |
| 完成反馈分流 | `src/core/session-completion-feedback.js` |
| Focus 计时 | `src/core/FocusSession.js`；`src/main.js`（`beginSessionCompleteIfNeeded`） |
| Idle dock | `src/ui/CompanionModePicker.js`；Honesty 入口 `src/ui/HonestyCheckInUI.js` |
| 呼吸光环 | `src/effects/LightProgression.js` |
