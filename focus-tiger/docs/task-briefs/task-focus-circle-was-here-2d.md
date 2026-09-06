# Task Brief · Focus Circle Was-Here-Today（刀 2d）

> **状态（2026-09-07）**：Brief v2 · **PO 已批建议默认** · 口令「开工 Focus Circle Was-Here-Today 2d」。权威 `FROM_APP_TO_CULTURE.md` §13.2（`sitting / was here today` · **必须隐身**）· §13.4 刀 2 信封（**2d → 2e**）。  
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
| 1 | **TTL / 「今天」边界** | **查看者本机日历日** 计数（`markedAtMs` + peek 带 `viewerDayKey` / `viewerTimeZone`）；见 §PO 评审澄清 #1 | 写入方 dayKey 硬过滤 · UTC 日界 · 滚动 24h | 滚动 24h = 2c；写入方过滤与「today」文案不一致 |
| 2 | **展示上限** | **只显示有无**：`hereTodayOthers ≥ 1` → 一条观察式短句（**不展示精确人数**）；视觉上 **0–1 个**轻点（或仅文案、无点） | 展示精确人数 N（≤7）· 与 sitting 同款多点 | 精确人数易滑向排行；§13.2 要求模糊态 |
| 3 | **隐身（必须）** | **单一被动开关**（见 §PO 评审澄清 #2）：Privacy「不向圈内自动展示今日来过」；关 = `was_here_mark` no-op；**不**为 2c 另开开关。`?focusCircleWasHere=0` = kill switch | 仅 kill switch · 默认全员隐身 | §13.2「必须隐身」= 用户须能 opt-out 被动印记 |
| 4 | **单圈活跃印记上限** | **复用 `FOCUS_CIRCLE_MAX_MEMBERS`**（当前 8）；超出丢弃最旧；改圈容量须同步常量 | 不限 | 防 KV 膨胀；禁止硬编码第二个 `8` |
| 5 | **与 Witness 同 session** | 同一次 ≥60s 完成：**可同时** `was_here_mark`（自动）**与**可选 Witness 留痕（用户点「留下」）；二者 KV **分离** | 有 Witness 则跳过 was-here | 职责不同：2d=日到访、2c=自愿短语 |

**我认为最合理的是**：上表 **建议默认** 全套——日历日 TTL + 仅「有人来过」不曝数 + **单一被动印记 Privacy 开关** + KV 上限 **复用** `FOCUS_CIRCLE_MAX_MEMBERS` + 与 Witness 并存且 **Rise 单点编排**。理由：对齐 §13.2「模糊态」与「必须隐身」，且与 2b 实时 / 2c 短语三轨清晰，UI 最不易长成 Feed。

## PO 评审澄清（2026-09-07 · 拍板前必读）

### 1. TTL 跨时区：以谁的本机「今天」为准？

| 环节 | 机制（v2 锁定） |
|---|---|
| **写 `was_here_mark`** | KV 存 **`markedAtMs`（UTC 绝对时刻）** + **`markerDayKey`**（产生印记设备的本机 `YYYY-MM-DD`） |
| **读 `presence_peek` / was-here 计数** | 客户端带 **`viewerDayKey`**（查看者本机当日）；服务端计入：`toLocalDayKey(markedAtMs, viewerTimeZone) === viewerDayKey`（`viewerTimeZone` = 客户端 IANA，如 `America/Los_Angeles`） |
| **文案** | Idle 短句始终对齐 **查看者** 的「今天」——与 `FOCUS_CIRCLE_WAS_HERE_CAPTION` 语义一致 |
| **已知限制** | 跨时区圈友在各自午夜附近，**最多 ±数小时** 的「今天」错位可接受；**不做** 全球统一日界或滚动 24h（那是 2c） |

**不是**：按写入方 `markerDayKey` 硬过滤（查看者换日时会对不上）；**也不是** UTC 零点全球同时清零。

### 2. 隐身开关会不会和 2c「打架」？

**不会叠两个同类开关——因为 2c 根本没有 Privacy 隐身开关。**

| 功能 | 隐身机制 |
|---|---|
| **2c Witness** | **自愿**：Rise 条点「跳过」= 不留痕；另有 kill switch `?focusCircleWitness=0`。**无**「不向圈内展示」面板项 |
| **2d was-here** | **被动自动** mark → **须**可 opt-out：Privacy / 小圈区块 **一个**开关：「不向圈内自动展示今日来过」（`focus-tiger.focus-circle-passive-share.v1`，默认 **开** = 允许记入） |
| **2e 认人层（未来）** | **复用同一被动开关**或在其下加子说明；**不**再为每个子功能各开一个隐身开关 |

Witness 与 was-here **职责不同**：前者 = 用户主动留句；后者 = 被动日到访印记。面板里只出现 **一个**「被动圈内可见性」控件。

### 3. Rise 时刻：与 Witness 会不会重演「分散仲裁」？

**2d 不占 overlay、不出 Rise UI**——风险低于叠层类功能，但 **仍须单点编排**，禁止两处各自 `addEventListener` Rise。

| 项 | 口径 |
|---|---|
| **单点入口** | `main.js` 抽出 `onFocusCircleRiseSideEffects({ elapsedSeconds })`；**所有** Rise / 完成路径（Sit Rise · `finishCompletedSession` · RitualFlow）只调此函数 |
| **调用顺序** | ① `maybeWasHereMark(elapsed)` — **同步判定 + fire-and-forget POST**，不 `await`，不占 `requestOverlaySlot` → ② `maybeOfferWitnessLeave(elapsed)` — 现有 3s delay + Tier26 仲裁 **不变** |
| **UI 冲突** | was-here **零** Rise 动效；Witness 条仍走 `overlaySlotArbitration`；**不可能**两条同时抢同一 overlay |
| **单测** | `focusCircleWasHere.test.js`：eligible session 先 mark 再 schedule witness；mark 失败不挡 witness；`<60s` 两者皆不触发 |

### 4. KV 上限 8：是否与圈子人数挂钩？

**是，必须复用常量，禁止魔法数字。**

- Worker：`FOCUS_CIRCLE_MAX_MEMBERS`（`cloud/src/lib/focusCircleKv.ts`）
- 客户端：`FOCUS_CIRCLE_MAX_MEMBERS`（`src/core/focusCircleMembership.js`）
- was-here KV 裁剪：`members` 条数 **≤ `FOCUS_CIRCLE_MAX_MEMBERS`**；将来 PO 改圈容量只改一处常量 + 单测
- 满员 8 人圈逻辑自洽：每人每日最多 1 条 was-here 印记，桶不会溢出

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
| **2c Witness Rise 条** | 同 session 双轨、分散监听 | **`onFocusCircleRiseSideEffects` 单点**（§PO 评审澄清 #3）：先 mark 再 schedule witness；2d **不占 overlay** |
| **Celebrate / postSession** | 抢注意力 | 2d **仅** Idle 背景；Rise 瞬间不画 |
| **2b sitting leave** | Rise 后 sitting 归零、was-here 应出现 | `mark` 与 `presence_leave` 同编排内 **并行** fire-and-forget；peek 合并响应已含本机（若未隐身） |

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
  "hereTodayOthers": 1,
  "viewerDayKey": "2026-09-07"
}
```

> `hereTodayOthers` 为 **布尔计数语义**（0 或 1，不曝精确 N）；实现可内部计数后 clamp 为「≥1 → 1」。

### 独立 action（备选）

| action | 请求要点 | 响应要点 |
|---|---|---|
| `was_here_mark` | `circleId`, `memberId`, `markerDayKey`, `markedAtMs?`（默认 `Date.now()`） | `ok` |
| `was_here_peek` | `circleId`, `memberId`, `viewerDayKey`, `viewerTimeZone` | `hereTodayOthers`, `viewerDayKey` |

**KV**：`circle:v1:here:{circleId}` · 值 = `{ schemaVersion, members: Record<memberId, { markedAtMs, markerDayKey }> }` · peek 时按 **查看者** `viewerDayKey` + `viewerTimeZone` 过滤（§PO 评审澄清 #1）。

**mark 规则**：

- 校验 `memberId` ∈ 圈成员；
- 本机被动开关关 / `?focusCircleWasHere=0` → **no-op**（隐身）；
- 同 `memberId` 同日重复 mark → idempotent `ok`（刷新 `markedAtMs` 可接受）；
- 裁剪至 **≤ `FOCUS_CIRCLE_MAX_MEMBERS`** members。

## 文案（locale 冻表 · 开工前定稿）

| 键（草案） | EN 示意 | 用途 |
|---|---|---|
| `FOCUS_CIRCLE_WAS_HERE_CAPTION` | Someone was here today. | Idle 背景（`hereTodayOthers ≥ 1`） |
| `FOCUS_CIRCLE_PASSIVE_SHARE_LABEL` | Share when I practiced today with my circle | **被动印记**总开关（默认 on） |
| `FOCUS_CIRCLE_PASSIVE_SHARE_HINT` | Hides automatic "was here" marks only. Leaving a Witness phrase is still your choice each session. | 与 2c 自愿留痕区分 |

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
