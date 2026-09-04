# Task Brief · Focus Circle Gentle Witness（刀 2c）

> **状态（2026-09-05）**：Brief v2 · PO 已批五项参数；**叠层仲裁 + 3s 语义**已澄清。**实现中** `feature/focus-circle-witness-2c`。权威 `FROM_APP_TO_CULTURE.md` §13.2 · §13.4 刀 2。  
> **本文件无** was-here-today（刀 2d）、认人层 / 昵称徽标（刀 2e）、圈内聊天、自由长文本。

## 一句话

入圈用户在完成一次 **Sit / Breath / RitualFlow** 后，可留一条 **预设短句痕迹**；圈内同伴在 Idle / Arrive **背景级**看见匿名痕迹，并可用 **另一句预设短语回应一次**；无名单、无点赞墙、无聊天线程。

## 已拍板（勿再开放）

1. **短语**：仅 **冻结短语池**（locale 键 + Worker 白名单 `phraseKey`）；**禁止**自由输入、禁止 emoji 墙、禁止回复链（每条痕迹 **最多一次回应**）。
2. **匿名**：痕迹与回应 **不展示昵称 / 头像 / clientId**；文案统一「一位同伴」类观察式语气（认人层见刀 2e）。
3. **表面**：仅 **Idle / Arrive**；Focusing 内 **不画**；强度 **≤** 2b 银蓝 dots（背景级，不挡 Sit）。
4. **分层**：与全球灯火（AM）、圈内 sitting dots（AO）、Circle 管理（AN）、Presence Signals（AF）**同时可出现但职责分离**；禁止合并为假社交 Feed。
5. **前置**：本机已入圈（`focus-tiger.focus-circle.v1`）；`?focusCircle=0` 禁用；`?focusCircleWitness=0` 可关本功能。
6. **生产**：源码合入 ≠ 现网；须口令「部署」后 Worker 才有 witness actions。
7. **2d / 2e 不在本 PR**：was-here-today 长 TTL、昵称徽标、跨设备 OTP 身份、圈内聊天。
8. **留痕门槛**：仅当本次 Sit/Breath/RitualFlow **≥60s**（或等价既有 completion 门闩）才可留痕。
9. **API**：`witness_leave` · `witness_peek` · `witness_respond`（`POST /api/focus-circle`，与 `presence_*` 同路由风格）。
10. **KV / TTL**：`circle:v1:witness:{circleId}` · **滚动 24h**（短窗，≠ 2d was-here-today）。
11. **回应上限**：每条 `traceId` **全局仅 1 次** `respond`；Idle 背景最多展示 **1 条**未回应痕迹。
12. **Rise 留痕条时机**：**延迟约 3s 后出现**（等会话结束精灵占用释放）；**无自动消失倒计时**——条一直留到用户点「留下」或「跳过」；同 session 只提示 **一次**。
13. **叠层**：**禁止**仅靠 z-index 堆在银蓝 dots 上。见下文「叠层仲裁（开工门禁）」。

### 刀 2e 提醒（本 Brief 不实现，开工 2e 时须硬性输入）

认人层 Brief 须继承已拍板四条：**不做头像上传** · **不做自由简介** · **跨设备仅复用现有邮箱 OTP** · **审核 = 被动举报 + 本机把昵称显示成「一位同伴」**。

## 待 PO 拍板（剩余）

| # | 议题 | **建议默认** | 备选 |
|---|---|---|---|
| 1 | **短语池规模** | **6–8** leave + **4–6** respond；三语冻表；`FOCUS_CIRCLE_WITNESS_LEAVE_*` / `FOCUS_CIRCLE_WITNESS_RESPOND_*` | 更大池 |
| 2 | **单圈活跃痕迹上限** | **≤8** 条（KV 裁剪） | 不限（Feed 风险） |

## 叠层仲裁（开工门禁 · 必须接线）

Witness 有 **两个 UI 面**，仲裁方式不同——**不能**混成「一个 z-index 叠层」。

### A. Rise 后留痕条（可点 · 新建 overlay）

| 项 | 口径 |
|---|---|
| **Registry** | 新增 `OVERLAY_SOURCES.FOCUS_CIRCLE_WITNESS_LEAVE` |
| **Tier / Kind** | **Tier 26** · `VISUAL_SECONDARY`（介于 `WELLNESS_FIRST` 25 与 `PURPOSE_CARD` 28；与 `TEA_BUBBLE` 21 / `FLOWER_WELCOME` 22 同级轻量族） |
| **snapshotField** | `focusCircleWitnessLeaveVisible` → `buildOverlaySnapshot` / `buildLiveOverlaySnapshot` |
| **blocksIdleYinTap** | **false**（底栏轻条，不挡额头摸头；与 `TEA_BUBBLE` 同档） |
| **blocksEnterSleep** | **false** |
| **显示门闩** | 开工前须 `requestOverlaySlot({ source, intent:'show', snapshot })`；**禁止**在 `main.js` 手写 OR |
| **必须 yield** | `postSessionOverlayActive`（Reflection / Arrival / Ritual…）· `flowerWelcomeVisible` · `compassOpen` · `mustardSeedOpen` · 任意 `activeVisualPrimary` / `activeGrowthCard` |
| **精灵占用** | 须等 `spriteChannelArbitration` 释放 `CELEBRATE` / `RISE_HOLD` / `MILESTONE` / `LIGHT_COMPLETE` 等 `TAP_BLOCKING_OCCUPANCY` 后再 `requestOverlaySlot`（**3s 延迟 = 缓冲**，不是限时关条） |
| **首卡队列** | **不**进 `FIRST_CARD_DEFER_PRIORITY`；若 flower / Compass 在排队，留痕条 **defer**，不得抢首卡 |
| **单测** | `overlaySlotArbitration.test.js` 新增 yield 矩阵；`scripts/overlay-contract-ui-check.js` 登记 UI 文件 |

### B. Idle 背景痕迹区（被动 · 同 2b presence 模式）

| 项 | 口径 |
|---|---|
| **DOM** | `#focus-circle-witness` · 与 `#focus-circle-presence` **视觉分层**（`Z_INDEX.md` 登记），但 **不进** overlay busy 派生 |
| **pointer-events** | 容器 **none**（同 2b 银蓝 dots）；**仅**「回应」钮可点 |
| **peek** | 与 2b 同档 Idle observer；Focusing 隐藏 |

### C. Idle「回应」短语 picker（可点 · 短 overlay）

| 项 | 口径 |
|---|---|
| **Registry** | `OVERLAY_SOURCES.FOCUS_CIRCLE_WITNESS_RESPOND` |
| **Tier / Kind** | **Tier 27** · `HINT`（短列表 picker，类似 Purpose/Privacy 轻面板族） |
| **snapshotField** | `focusCircleWitnessRespondOpen` |
| **blocksIdleYinTap** | **true**（打开 picker 时与 Confide 同级抑制摸头误触） |
| **门闩** | 同 A：`requestOverlaySlot` + `syncIdleYinTap()` |

### Rise 时刻冲突扫描（邻接场景）

| 邻接 | 风险 | 对策 |
|---|---|---|
| **Celebrate / RISE_HOLD**（`spriteChannelArbitration`） | 条在仪式动画上弹出 | 延迟 3s + 占用释放后再 show |
| **芥子印 / Reflection**（`postSessionOverlayActive`） | 与 postSession 卡叠 | `requestOverlaySlot` yield |
| **吹花 Welcome**（`FIRST_CARD_DEFER_PRIORITY`） | 抢冷启动首卡 | flower visible → defer |
| **Compass 首卡**（场景 AH） | 抢 growth 首卡 | compass open / 排队 → defer |
| **Moment Whisper**（Tier 23） | 同 Rise 后轻提示 | 同时 eligible 时 **Witness 条优先低于** postSession 主卡与 flower；可与 whisper **二选一**（实现时单测锁） |

## 冲突扫描（产品三轴）

对照 `SCENARIO_TESTS` AM / AN / AO / AF / **AH** / **AD**。

| 轴 | 结论 |
|---|---|
| **a. 强度** | 留痕条无倒计时催促；Idle 只露 1 条；Focusing 隐藏。 |
| **b. 语气** | 观察式；无评判、无排行。 |
| **c. 职责** | ≠ 灯火 / sitting dots / Presence Signals / Confide / 茶句祝福。 |

## 后台网络三问

1. **时机**：`witness_peek` 与 2b 同档；`witness_leave` / `witness_respond` 仅用户确认后；overlay busy 时 defer peek **与** defer Rise 条。
2. **写盘**：peek 结果变化才更新 DOM；本地记已回应 `traceId`。
3. **卡顿**：不 await Sit/Rise；失败静默空白。

## 点击反馈

| 控件 | 0–1s 内 |
|---|---|
| Rise「留下」 | disabled → 条消失 + 可选轻确认 |
| Rise「跳过」 | 条消失，无网络 |
| Idle「回应」 | disabled → picker → 确认后消失 |
| 背景痕迹区 | 无假按钮 |

## API 草案

| action | 请求要点 | 响应要点 |
|---|---|---|
| `witness_leave` | `circleId`, `clientId`, `phraseKey` | `traceId`, `ok` |
| `witness_peek` | `circleId`, `clientId` | `traces[]`：`traceId`, `phraseKey`, `hasResponded`, `respondPhraseKey?` |
| `witness_respond` | `circleId`, `clientId`, `traceId`, `phraseKey` | `ok` 或 `already_responded` |

## 不做

- 自由文本、聊天、点赞数、精确时长、昵称、was-here-today、跨圈广播、推送、Focusing 内 UI、假痕迹、**仅 z-index 不接仲裁**

## 依赖

- 刀 2a · 刀 2b · Worker `/api/focus-circle`（#572）· `overlaySlotContractRegistry.js` / `spriteChannelArbitration.js`
