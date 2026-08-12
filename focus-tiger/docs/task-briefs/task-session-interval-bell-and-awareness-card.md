# Task Brief · Focus 间隔磬 + 觉察观照卡（mid-session）

> **状态（2026-08-13）**：**v1 切片已接线** · `feature/session-interval-awareness`（本地 `0befc92`；授权已确认）。  
> **前置**：#275 tip `0d05b10`；#277 tip `b51f9a2`。  
> **资产**：`public/audio/cues/session-interval-bell.mp3`；授权见 `cues/ATTRIBUTION.md`（2026-08-13 产品书面确认）。  
> **决策来源**：Quiet Line 只读排查 + 分析师 2026-08-13 口径。  
> **重要**：本 Brief / 本支实现的是 **v1 切片**（固定 180s + 同拍觉察 toast），**不等于**下方「产品愿景 A/B」全文已交付。

## 一句话目标

在 Focusing **计时进行中**，每约 **3 分钟**播一声轻磬，并可叠加一张**可重复出现**的轻量觉察文案卡——二者为**独立新机制**，不并入 Quiet Line，不改造 Moment Whisper 的「一生一次」门闩。

## 与产品愿景 A/B 对照（2026-08-13 产品原文）

| 愿景项 | v1 本支 | 差距 / 下期 |
|---|---|---|
| A · 无磬声（默认纯净陪伴） | ❌ 间隔跟「计时提示音」总开关，默认 **开**（与 #275 开始/结束同开） | 需独立节奏选择器；默认「无间隔」须另拍板 |
| A · 每 3 分钟一声 | ✅ 固定 **180s** | — |
| A · 每 5 分钟一声 | ❌ | 需 `300s` 档 + UI |
| A · 余音绕梁 ~10s / 「轻轻收回」语义 | ⚠️ 播现有短 mp3；无 10s 尾音设计、无语音讲解 | 若要长余音须换/剪资产 |
| A · 音效来自 Ambient Sound Gate 磬声、免费可体验 | ❌ 独立 `/audio/cues/session-interval-bell.mp3`；**不**走 Sound Gate / entitlement | 与「短铃进 cues、长循环进 ambient」架构一致；若坚持 Gate 曲库须另 Brief |
| B · Focusing **底部**一行无感文字 | ❌ 现为阿寅旁 **toast**（近 Whisper，偏上） | 底部条须改布局 + z-index |
| B · 可选关闭觉察卡 | ⚠️ v1 跟总开关（关磬则关卡）；**无**独立「仅关卡」 | 独立开关另 Brief |
| B · 文案：「念头如云…」「此间无事…」「身体坐在这里…」等 | ⚠️ 已有观察式池 `FOCUS_AWARENESS_*`，**文案不同** | 可替换/增补进池（en+ja+zh） |
| B · 「最好的正念辅导，不是教你怎么做…」 | ✅ **未**进用户文案池（仅作设计说明） | 保持不进 UI |

## 明确不做 / 不复用

| 现成机制 | 为何不承载本需求 |
|---|---|
| **Quiet Line**（`dailyZenQuote`） | Idle ⋯ 手动礼物卡 + 日更存图；Focusing 时菜单隐藏；无间隔触发 |
| **Moment Whisper** | 各 Moment **一生一次**；改成每场重复会毁掉稀缺感 |
| **Daily Wisdom** | Reflection 底部分池；非 mid-session |
| **Ambient 曲库** | 长循环背景乐；无「每 N 分钟一声」定时器；且含付费深库 |

允许：**视觉气质**可参考 Moment Whisper 的轻量近旁 toast（短句、可点关、数秒淡出），但 **Store / 触发 / 文案池必须新建**。

## 产品契约

### A · 间隔磬（interval cue）

| 项 | 口径（写死） |
|---|---|
| 时机 | Focusing 进行中；自开表墙钟起每 **180s** 一次 |
| 资产 | `/audio/cues/session-interval-bell.mp3` |
| 与开始铃 | **t≈0 不播**间隔磬（开始铃已负责） |
| 与结束铃 | **精确对齐达标**仍由 #275 结束铃负责；**剩余时长 &lt; 30s** 时 **跳过**本应触发的间隔磬（验收硬数，非「合理避让」） |
| 早退 Rise | 停掉间隔调度；**不**补播间隔磬 |
| Ambient | 若氛围可闻：复用 #275 ducking（约 35% → 播完 ~1.5s unduck）；**不**走 Ambient entitlement |
| 免费 | 是；不接入 Sound Gate |
| 预加载 | 与 start/end 一并 preload（时长 chip / boot） |
| 开关 | Soundscape「计时提示音」总开关；pref 增加 `sessionIntervalBellEnabled`，v1 与 start/end **同步** |

### B · 觉察观照卡（mid-session awareness card）

| 项 | 口径（写死） |
|---|---|
| 时机 | 与间隔磬**同拍**（磬起后立刻或 ≤300ms 内出卡）；无磬（开关关）时 **v1 也不出卡**（减少双开关；若产品要拆开另开 Brief） |
| 生命周期 | **每场 Focusing 可多次**（跟间隔走）；**禁止**写入 `moment-whispers-seen` |
| UI | 新建组件（可抄 Whisper 样式变量）；阿寅旁短句；可点关；约 3–4s 淡出；非顶部 Banner、非 Quiet Line 大卡 |
| 文案 | **新池**（建议 `COPY_POOLS.FOCUS_AWARENESS` / `FOCUS_AWARENESS_*`）；观察式、一句、不说教；en+ja（zh 可 draft） |
| 互斥 | Arrival / Honesty / Companion 展开 / Reflection / Celebrating / 其它全屏叠层 busy → **压住本拍出卡**（磬是否仍播：默认 **仍播磬、卡可跳过**——开修前若要「busy 连磬也跳」再拍板） |
| 会话类型 | **v1 不区分**；对所有 Focus（含 Offline Space）生效 |

## 实现要点（将来 feature 支）

1. **扩展** `SessionCueController`（或并列 `SessionIntervalCueScheduler`）：墙钟调度、30s 门闩、`cancel` on Rise/end。  
2. Pref：`focus-tiger.session-cues.v1` 增加 `sessionIntervalBellEnabled`（v1 与总开关同步写）。  
3. 新 UI + 新 seen/轮换 store（若只需池内轮换、不需「已见」终身旗，用会话内 index 即可）。  
4. 单测：180s 触发；剩余 &lt;30s 跳过；Rise cancel；总开关关 → 磬+卡皆无；**不**调用 Moment Whisper markSeen。  
5. 文档：`DESIGN` 计时提示音节扩写；`SHARED_RESOURCES`；`TEST_TRACKER` 分列「间隔磬」「觉察卡」；保护面写清 Whisper / Quiet Line 不回归。

## 验收（实现后）

- 主路径：`?product=1&sessionMinutes=10`（或等价）→ 开表有开始铃 → ~3:00 间隔磬 + 觉察卡 → ~6:00 再一对 → 达标结束铃；**最后不足 30s 不出现间隔磬**。  
- 开关关：全程无开始/间隔/结束铃，无觉察卡。  
- Rise 于 2:00：无间隔、无结束铃。  
- 回流：第二场会话仍按间隔出现（证明不是一生一次）。  
- 回归：Moment Whisper 仍一生一次；Quiet Line 仍仅 Idle 菜单。

## 保护面（已好清单）

- #275 开始/结束铃 + ducking / 达标淡出停氛围  
- Moment Whisper 一生一次门闩  
- Quiet Line Idle 礼物卡  
- Ambient entitlement / 深库试听  

## 文档入口

- 本 Brief  
- `public/audio/cues/ATTRIBUTION.md`  
- `docs/THIRD_PARTY_AUDIO_LICENSES.md`
