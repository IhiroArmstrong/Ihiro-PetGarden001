# Task Brief · Focus 间隔磬 + 觉察观照卡（mid-session）

> **状态（2026-08-13）**：**已合入 develop** · #278 tip **`41e9748`**（安全路径：短磬；不接 Gate）。  
> **前置**：#275 tip `0d05b10`；#277 tip `b51f9a2`。  
> **资产**：`public/audio/cues/session-interval-bell.mp3`；授权见 `cues/ATTRIBUTION.md`。  
> **产品拍板**：继续用 cues 短磬；**不**接 Ambient Gate 长循环。人工验收见 TEST_TRACKER（勿自行标已通过）。

## 一句话目标

在 Focusing **计时进行中**，可选正念磬声节奏（无 / 3 分 / 5 分），并可在底部叠加**可重复**的觉察短句——独立机制；不并 Quiet Line；不改 Moment Whisper 一生一次。

## 与产品愿景 A/B 对照（2026-08-13）

| 愿景项 | 安全路径本支 | 备注 |
|---|---|---|
| A · 无磬声（默认纯净陪伴） | ✅ `sessionIntervalMs: 0` 默认 | 与开始/结束铃解耦 |
| A · 每 3 分钟一声 | ✅ | Soundscape 下拉 |
| A · 每 5 分钟一声 | ✅ | Soundscape 下拉 |
| A · 余音绕梁 ~10s | ⚠️ 取决于 mp3 自身长度 | 未做合成尾音；换素材另议 |
| A · Ambient Sound Gate 磬声 | ❌ 明确不做 | 用 cues 短磬，免费 |
| B · Focusing **底部** | ✅ | `homeClearanceBottomCss` |
| B · 可选关闭觉察卡 | ✅ 独立开关 | 关卡仍可播磬 |
| B · 指定短句池 | ✅ zh 三句入池 | en/ja 观察式对译 |
| B · 理念长句不进 UI | ✅ | 单测锁 |

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
| 时机 | Focusing 进行中；节奏 `0` / `180s` / `300s`（默认 `0`） |
| 资产 | `/audio/cues/session-interval-bell.mp3`（**不**接 Ambient Gate） |
| 与开始铃 | **t≈0 不播**间隔磬（开始铃已负责） |
| 与结束铃 | 达标结束铃仍由 #275；**剩余时长 &lt; 30s** 跳过间隔磬 |
| 早退 Rise | 停掉间隔调度；**不**补播间隔磬 |
| Ambient | 可闻时 duck ≈35% → 播完 ~1.5s unduck；**不**走 entitlement |
| 免费 | 是 |
| 开关 | 开始/结束＝「计时提示音」；间隔＝独立下拉 `#ambient-session-interval-rhythm` |

### B · 觉察观照卡（mid-session awareness card）

| 项 | 口径（写死） |
|---|---|
| 时机 | 与间隔磬同拍（≤300ms）；间隔为 off 时不出卡 |
| 生命周期 | 每场可多次；**禁止**写入 `moment-whispers-seen` |
| UI | Focusing **底部**；可点关；约 4s 淡出 |
| 文案 | `FOCUS_AWARENESS_*`（zh 产品三句；理念长句不进池） |
| 开关 | `#ambient-focus-awareness-toggle` 可单独关（关卡仍可播磬） |
| 互斥 | busy 叠层压住卡；默认仍播磬 |
| 会话类型 | 全 Focus（含 Offline Space） |

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
