# Task Brief · Focus Circle Presence（刀 2b）

> **状态（2026-09-04）**：口令「开工 Focus Circle Presence 2b」。权威 `FROM_APP_TO_CULTURE.md` §13.4 刀 2 · §13.2 Focus Presence。  
> **本文件无 Gentle Witness / 认人层 / was-here-today 长 TTL（属 2c 或更晚）。**

## 一句话

入圈用户在 Idle / Arrive 背景级看见**圈内同伴正在坐**的模糊计数（非名单、非时长）；Sit / Breath / RitualFlow 时贡献 heartbeat；Focusing 内不画；与全球 Quiet Together 灯火分层。

## 已拍板（勿再开放）

1. **表面**：仅 **Idle / Arrive** 左下区域（全球灯火**上方**）显示圈内同伴 soft dots + 短句；`pointer-events: none`。
2. **计数**：`sittingOthers` = 圈内**除自己外**当前 sitting 的人数；0 人不画（诚实空白）。
3. **心跳**：与全球灯火同生命周期——Sit / Breath / RitualFlow 延迟 join + 45s heartbeat；Rise / leave / pagehide 发 leave。
4. **分层**：全球灯火（金）与圈内 presence（银蓝）**同时可出现**；禁止合并两套房间或假人数。
5. **前置**：本机须已入圈（`focus-tiger.focus-circle.v1`）；`?focusCircle=0` 禁用。
6. **API**：扩展现有 `POST /api/focus-circle`：`presence_peek` | `presence_heartbeat` | `presence_leave`；KV `circle:v1:sit:{circleId}`（TTL 120s）。
7. **生产**：源码合入 ≠ 现网；须口令「部署」后 Worker 才有 presence actions。
8. **2c 不在本 PR**：Gentle Witness、昵称徽标、was here today、圈内聊天。

## 冲突扫描

对照 `SCENARIO_TESTS` AM（全球灯火）/ AN（Circle 管理）/ AF（Presence Signals）。

| 轴 | 结论 |
|---|---|
| **a. 强度** | 背景级 dots；不比 Sit 重；Focusing 内隐藏。 |
| **b. 语气** | 观察式「圈内有人在坐」；无排行、无精确分钟。 |
| **c. 职责** | ≠ 全球灯火；≠ Privacy 管理 UI；≠ Presence Signals（本机练习事实）。 |

## 后台网络三问

1. **时机**：peek 在 Idle observer（首 2.5s + 每 5s）；heartbeat 在 Sit 后延迟 2.5s——与 lantern 同档，busy overlay 时 defer。
2. **写盘**：presence 快照只在 `sittingOthers` 变化时更新 DOM。
3. **卡顿**：不 await Sit；失败静默空白，不挡练习。

## 点击反馈

Chrome 不可点。管理仍在 Privacy / 菜单面板（既有 Create/Join/Leave 0–1s 反馈）。

## 不做

- 精确在线名单、Witness、昵称、聊天、离开广播、Focusing 内画圈、假人数、全球圈合并
