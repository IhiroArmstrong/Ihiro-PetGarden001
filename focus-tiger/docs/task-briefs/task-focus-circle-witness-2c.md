# Task Brief · Focus Circle Gentle Witness（刀 2c）

> **状态（2026-09-05）**：Brief 草案 · **待 PO 拍板后**口令「开工 Focus Circle Witness 2c」。权威 `FROM_APP_TO_CULTURE.md` §13.2 Gentle Witness · §13.4 刀 2。  
> **本文件无** was-here-today（刀 2d）、认人层 / 昵称徽标（刀 2e）、圈内聊天、自由长文本。

## 一句话

入圈用户在完成一次 **Sit / Breath / RitualFlow** 后，可（或按拍板规则自动）留一条 **预设短句痕迹**；圈内同伴在 Idle / Arrive **背景级**看见匿名痕迹，并可用 **另一句预设短语回应一次**；无名单、无点赞墙、无聊天线程。

## 已拍板（勿再开放）

1. **短语**：仅 **冻结短语池**（locale 键 + Worker 白名单 `phraseKey`）；**禁止**自由输入、禁止 emoji 墙、禁止回复链（每条痕迹 **最多一次回应**）。
2. **匿名**：痕迹与回应 **不展示昵称 / 头像 / clientId**；文案统一「一位同伴」类观察式语气（认人层见刀 2e）。
3. **表面**：仅 **Idle / Arrive**；Focusing 内 **不画**；强度 **≤** 2b 银蓝 dots（背景级，不挡 Sit）。
4. **分层**：与全球灯火（AM）、圈内 sitting dots（AO）、Circle 管理（AN）、Presence Signals（AF）**同时可出现但职责分离**；禁止合并为假社交 Feed。
5. **前置**：本机已入圈（`focus-tiger.focus-circle.v1`）；`?focusCircle=0` 禁用；`?focusCircleWitness=0` 可关本功能（与 2b `focusCircle` 查询参数并列）。
6. **生产**：源码合入 ≠ 现网；须口令「部署」后 Worker 才有 witness actions。
7. **2d / 2e 不在本 PR**：was-here-today 长 TTL、昵称徽标、跨设备 OTP 身份、圈内聊天。

### 刀 2e 提醒（本 Brief 不实现，开工 2e 时须硬性输入）

认人层 Brief 须继承已拍板四条：**不做头像上传** · **不做自由简介** · **跨设备仅复用现有邮箱 OTP**（不为 Circle 另造账号） · **审核 = 被动举报 + 本机把昵称显示成「一位同伴」**，非主动审查管线。

## 待 PO 拍板（开工前须确认）

| # | 议题 | **建议默认（实现可据此写）** | 备选 |
|---|---|---|---|
| 1 | **留痕触发** | **Rise / 练习窗结束** 后 **3s 内** 出现 **可忽略** 的轻量条（单预设句 +「留下」/「跳过」）；默认 **跳过**；同 session 只提示 **一次** | 全自动留默认句（零点击，但难控强度） |
| 2 | **谁可留痕** | 仅当本次 Sit/Breath/RitualFlow **≥ 最小门槛**（建议 **≥60s** 或既有 completion 门闩） | 任意 Rise 即可（易刷痕迹） |
| 3 | **短语池规模** | **6–8** 条 leave 句 + **4–6** 条 respond 句；三语冻表；键名 `FOCUS_CIRCLE_WITNESS_LEAVE_*` / `FOCUS_CIRCLE_WITNESS_RESPOND_*` | 更大池（审核成本升） |
| 4 | **Idle 展示位** | `#focus-circle-witness` 叠在 `#focus-circle-presence` **上方** ~28px；最多展示 **1 条** 未回应痕迹 + 可选回应钮；`Z_INDEX` 登记 | 并入 presence caption（职责混） |
| 5 | **Worker actions** | `witness_leave` · `witness_peek` · `witness_respond`（均 `POST /api/focus-circle`） | 独立 path（不必要） |
| 6 | **KV / TTL** | `TIP_KV` `circle:v1:witness:{circleId}`；痕迹 **滚动 24h** TTL（**短窗**，≠ 2d 跨天 was-here）；单圈同时活跃痕迹 **≤8** | 48h / 7d（逼近 2d） |
| 7 | **回应规则** | 每条 `traceId` 全局 **仅 1 次** `respond`；同一 `clientId` **不可**回应自己留的痕迹 | 每人各回应一次（变多声部） |

## 冲突扫描

对照 `SCENARIO_TESTS` AM / AN / AO / AF。

| 轴 | 结论 |
|---|---|
| **a. 强度** | 留痕条 ≤ Rise toast 档；Idle 只露 1 条；Focusing 隐藏；禁止无限 Feed 滚动。 |
| **b. 语气** | 观察式、无评判、无排行；「一位同伴留下了…」；回应句亦预设、无说教。 |
| **c. 职责** | ≠ 全球灯火；≠ sitting 实时计数；≠ Presence Signals（本机事实）；≠ Confide / 茶句祝福。 |

## 后台网络三问

1. **时机**：`witness_peek` 与 2b presence peek **同档**（Idle observer 首 2.5s + 每 5s）；`witness_leave` / `witness_respond` **仅用户确认后**发送；busy overlay 时 defer peek。
2. **写盘**：DOM 仅在 `peek` 结果变化时更新；本地记「已回应 traceId」防重复点。
3. **卡顿**：不 await Sit/Rise；失败静默空白，不挡练习。

## 点击反馈

| 控件 | 0–1s 内 |
|---|---|
| Rise 后「留下」 | disabled → 条消失 + 可选轻 toast「已留下」 |
| Rise 后「跳过」 | 条消失，无网络 |
| Idle「回应」 | disabled → 短语 picker（预设列表）→ 确认后消失 |
| 背景 witness 区 | 无假按钮；未回应时才出现回应入口 |

## API 草案（实现时 SSOT 以代码 + 本表为准）

| action | 请求要点 | 响应要点 |
|---|---|---|
| `witness_leave` | `circleId`, `clientId`, `phraseKey` | `traceId`, `ok` |
| `witness_peek` | `circleId`, `clientId`（用于过滤已回应 / 自己的痕） | `traces[]`：`traceId`, `phraseKey`, `hasResponded`, `respondPhraseKey?`（**无**成员名） |
| `witness_respond` | `circleId`, `clientId`, `traceId`, `phraseKey` | `ok` 或 `already_responded` |

## 不做

- 自由文本、聊天线程、点赞数、精确时长、昵称展示、was-here-today、跨圈广播、推送通知、Focusing 内 UI、假痕迹

## 依赖

- 刀 2a 入圈 · 刀 2b presence（可并行验收 AO）· Worker `POST /api/focus-circle` 已部署（#572）
