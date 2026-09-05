# Task Brief · Focus Circle Was-Here-Today（刀 2d）

> **状态（2026-09-05）**：Brief v1 草稿 · **待 PO 拍板 TTL / 展示上限** · 口令「开工 Focus Circle Was-Here-Today 2d」前不得写代码。权威 `FROM_APP_TO_CULTURE.md` §13.2（`sitting / was here today` · **必须隐身**）· §13.4 刀 2 信封（**2d → 2e**）。  
> **本文件无** 认人层 / 昵称徽标（刀 2e）、圈内聊天、自由长文本、Witness 留痕/回应（刀 2c）。

## 一句话

入圈用户在一次 **Sit / Breath / RitualFlow ≥60s** 结束后，**自动**在圈内留下「今天来过」的模糊印记（无短语、无回应）；同伴在 Idle / Arrive **背景级**看见「今天有人来过」的诚实计数；与实时 sitting dots（2b）、自愿 Witness 痕迹（2c）分层；支持隐身。

## 已拍板（勿再开放）

1. **语义**：`was here today` = **日历日**内的「今日曾练习」模糊态；**≠** 实时 sitting（2b · 120s heartbeat）；**≠** 自愿短语痕迹（2c · 滚动 24h）；**≠** 精确分钟 / 排行 / 名单。
2. **匿名**：只展示 **计数 + 观察式短句**；**不展示**昵称 / 头像 / `memberId` / `clientId`（认人层见刀 2e）。
3. **表面**：仅 **Idle / Arrive**；Focusing 内 **不画**；强度 **≤** 2b 银蓝 dots（更轻、更背景）。
4. **分层**：与全球灯火（AM）、圈内 sitting（AO）、Witness（AP）、Circle 管理（AN）、Presence Signals（AF）**可同时出现但职责分离**；禁止合并为 Feed。
5. **前置**：本机已入圈（`focus-tiger.focus-circle.v1`）；`?focusCircle=0` 禁用整圈；`?focusCircleWasHere=0` 可关本功能（与 2c `?focusCircleWitness=0` 同档）。
6. **生产**：源码合入 ≠ 现网；须口令「部署」后 Worker 才有 was-here actions。
7. **2e 不在本 PR**：昵称徽标、跨设备 OTP 身份、头像上传、圈内聊天。
8. **记入门槛**：仅当本次 Sit/Breath/RitualFlow **≥60s**（与 2c Witness 留痕门槛 **同档**）才 `was_here_mark`；**无** Rise 后确认条（与 2c 的「留下/跳过」对立——2d 为被动印记）。
9. **与 sitting 互斥展示**：`sittingOthers > 0` 时 **只画** 2b sitting；`sittingOthers === 0` 且 `hereTodayOthers > 0` 时才画 was-here 文案/轻点。**禁止**同一人同时贡献 sitting heartbeat 与 was-here 展示位。
10. **API 命名**：`was_here_mark` · `was_here_peek`（`POST /api/focus-circle`，与 `presence_*` / `witness_*` 同路由风格）。
11. **诚实**：0 人 → **不画**；Worker 未部署 → Idle 保持空白；失败静默，不挡 Sit。

### 刀 2e 提醒（本 Brief 不实现，开工 2e 时须硬性输入）

认人层 Brief 须继承已拍板四条：**不做头像上传** · **不做自由简介** · **跨设备仅复用现有邮箱 OTP** · **审核 = 被动举报 + 本机把昵称显示成「一位同伴」**。  
**2d 的匿名计数 UI 不得为 2e 预留头像槽或名单位**——2e 只改文案侧「一位同伴 → 可选昵称」，不扩布局。

## 待 PO 拍板（开工门禁）

| # | 议题 | **建议默认** | 备选 | 备注 |
|---|---|---|---|---|
| 1 | **TTL / 「今天」边界** | **本机日历日**：`dayKey = YYYY-MM-DD`（`Intl` / 用户 locale 时区）；KV 记录在 `dayKey` 变更时自然过期；**不用** 2c 的滚动 24h | UTC 日界 · 固定 +8 · 滚动 24h | 滚动 24h 与「today」文案冲突，且与 2c 难区分 |
| 2 | **展示上限** | **只显示有无**：`hereTodayOthers ≥ 1` → 一条观察式短句（**不展示精确人数**）；视觉上 **0–1 个**轻点（或仅文案、无点） | 展示精确人数 N（≤7）· 与 sitting 同款多点 | 精确人数易滑向排行；§13.2 要求模糊态 |
| 3 | **隐身（必须）** | **双轨**：(a) 本机 Privacy / 小圈区块新增 **「不向圈内展示今日来过」** 开关（默认关 = 允许记入）；(b) `was_here_mark` 带 `visible: false` 时 **不写** KV。全局 `?focusCircleWasHere=0` 仍保留 kill switch | 仅 kill switch、无面板开关 · 默认全员隐身 | §13.2「必须隐身」= 用户须能选择不被看见 |
| 4 | **单圈活跃印记上限** | KV 每圈每 `dayKey` **≤8** `memberId`（与圈容量同档）；超出丢弃最旧 | 不限 | 防 KV 膨胀 |
| 5 | **与 Witness 同 session** | 同一次 ≥60s 完成：**可同时** `was_here_mark`（自动）**与**可选 Witness 留痕（用户点「留下」）；二者 KV **分离** | 有 Witness 则跳过 was-here | 职责不同：2d=日到访、2c=自愿短语 |

**我认为最合理的是**：上表 **建议默认** 全套——日历日 TTL + 仅「有人来过」不曝数 + Privacy 隐身开关 + KV≤8 + 与 Witness 并存。理由：对齐 §13.2「模糊态」与「必须隐身」，且与 2b 实时 / 2c 短语三轨清晰，UI 最不易长成 Feed。

## 产品语义（§13.2 扩写）

| 状态 | 刀 | 窗口 | 用户动作 | 同伴看见 |
|---|---|---|---|---|
| **sitting** | 2b | 实时 ~120s | Sit 中自动 heartbeat | 银蓝 dots +「圈里有人在坐」 |
| **was here today** | **2d** | 日历日 | ≥60s 结束 **自动** mark | 无 sitting 时轻文案「圈里今天有人来过」 |
| **witness trace** | 2c | 滚动 24h | Rise 后 **自愿**留预设句 | 最多 1 条匿名痕 + 一次回应 |

**不做**：把 2d 做成第二套 Witness、把 sitting 结束后自动转 was-here 的动画仪式、或「今天 3 人来过」精确榜。

## 冲突扫描（产品三轴）

对照 `SCENARIO_TESTS` AM / AN / AO / AP / AF / **AH**。

| 轴 | 结论 |
|---|---|
| **a. 强度** | 比 2b 更轻；无 Rise 条、无 picker；Focusing 隐藏；sitting 优先于 was-here。 |
| **b. 语气** | 观察式「今天有人来过」；无评判、无催促、无「你没来」。 |
| **c. 职责** | ≠ 灯火 / sitting / Witness / Presence Signals / Confide。 |

## 叠层与 DOM（开工门禁）

| 项 | 口径 |
|---|---|
| **方案** | **扩展现有** `#focus-circle-presence` 同簇（`FocusCirclePresenceChrome`）加 **第二 caption 轨**（`was-here` modifier class），**不**新建 overlay、**不**进 `overlaySlotArbitration` |
| **pointer-events** | **none**（与 2b 一致；无假按钮） |
| **z-index** | 与 presence 同层（`Z_INDEX.md` 登记一行备注）；Witness（AP）仍在其上 |
| **peek 调度** | 与 2b 同档 Idle observer；可与 `presence_peek` **合并一次 round-trip**（见 API）或同频独立 `was_here_peek`——实现时 **优先合并** 减请求 |

### Rise 时刻冲突扫描

| 邻接 | 风险 | 对策 |
|---|---|---|
| **2c Witness Rise 条** | 同 session 双轨 | 2d `mark` **静默**在 Rise 后 fire-and-forget；**不**占 overlay |
| **Celebrate / postSession** | 抢注意力 | 2d **仅** Idle 背景；Rise 瞬间不画 |
| **2b sitting leave** | Rise 后 sitting 归零、was-here 应出现 | `mark` 在 `presence_leave` **之后或并行**；peek 合并响应里 `hereTodayOthers` 已含本机若未隐身 |

## 后台网络三问

1. **时机**：`was_here_mark` 在 Rise 后 **fire-and-forget**（与 `presence_leave` 同档）；`was_here_peek` 与 2b peek 同 Idle observer；overlay busy 时 defer peek。
2. **写盘**：`hereTodayOthers` 仅变化时更新 DOM；本地记本日已 `mark`（防重复 POST）。
3. **卡顿**：不 await Sit/Rise；失败静默空白。

## 点击反馈

| 控件 | 0–1s 内 |
|---|---|
| was-here 背景区 | **无控件**（`pointer-events: none`） |
| Privacy「不向圈内展示今日来过」 | 勾选变化 + 说明文案；**不**弹确认 |

设计静默：整块 was-here 区 **无点击** → 不涉及 Q1；Privacy 开关走既有面板反馈。

## API 草案

### 合并 peek（建议默认）

扩展现有 `presence_peek` 响应（**或** 同 body 多 action 一次往返——PO 确认后二选一，**优先合并**）：

```json
{
  "sittingOthers": 0,
  "hereTodayOthers": 2,
  "dayKey": "2026-09-05"
}
```

### 独立 action（备选）

| action | 请求要点 | 响应要点 |
|---|---|---|
| `was_here_mark` | `circleId`, `memberId`, `dayKey?`, `visible`（默认 true） | `ok` |
| `was_here_peek` | `circleId`, `memberId` | `hereTodayOthers`, `dayKey` |

**KV**：`circle:v1:here:{circleId}:{dayKey}` · 值 = `{ schemaVersion, members: Record<memberId, markedAtMs> }` · **日历日结束即逻辑失效**（读时校验 `dayKey`）。

**mark 规则**：

- 校验 `memberId` ∈ 圈成员；
- `visible: false` → **no-op**（隐身）；
- 同 `dayKey` 同 `memberId` 重复 mark → idempotent `ok`；
- 裁剪至 ≤8 members。

## 文案（locale 冻表 · 开工前定稿）

| 键（草案） | EN 示意 | 用途 |
|---|---|---|
| `FOCUS_CIRCLE_WAS_HERE_CAPTION` | Someone was here today. | Idle 背景（`hereTodayOthers ≥ 1`） |
| `FOCUS_CIRCLE_WAS_HERE_PRIVACY_LABEL` | Don't show others I practiced today | Privacy 隐身开关 |
| `FOCUS_CIRCLE_WAS_HERE_PRIVACY_HINT` | You can still see others; this only hides your mark. | 开关说明 |

**禁止**：「N 人今天来过」精确数（除非 PO 推翻 #2 选备选）。

## 不做

- 自由文本、聊天、点赞、精确分钟、昵称、跨圈广播、推送、Focusing 内 UI、假人数、Rise 确认条、回应/留痕短语、**仅 z-index 不接 2b 互斥门闩**

## 依赖

- 刀 2a · 刀 2b · 刀 2c（#577 / #578 生产 witness live）· Worker `/api/focus-circle` · `focusCirclePresence.js` / `FocusCirclePresenceChrome.js`

## 验收场景草案（开工后写入 SCENARIO_TESTS · 场景 AQ）

1. A、B 已入圈 → A **Sit ≥60s** → Rise → B **sitting=0** 时 Idle 约 2.5–10s 见 was-here 轻文案；A 再 Sit 时 B 见 **sitting dots 优先**，was-here 隐藏。  
2. A **隐身开** → 同上完成练习 → B **不见** A 的 was-here；A 仍可见 B（若 B 未隐身）。  
3. A **Sit <60s** → B 不见 was-here。  
4. `?focusCircleWasHere=0` / `?focusCircle=0` / Leave → 不请求、不画。  
5. 与 2c 并存：A 留 Witness 痕 + 自动 was-here；B Idle 可同时见 Witness 条（AP）与 was-here 文案（职责分离）。
