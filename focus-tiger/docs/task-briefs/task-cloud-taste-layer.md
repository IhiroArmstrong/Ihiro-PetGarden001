# Task Brief · 云端品味层（权重覆盖 + 日签/文案池）

> **状态（2026-08-18）**：范围与时机 **已拍板**；**本回合只落文档**，不接前端、不改 stub 正式逻辑。  
> **权威**：`PROCESS.md` Backlog「云端品味层」。旧称「v1.1 云端算法」——**支付云 ≠ 品味云**；SemVer 首稳仍是 `v1.0.0`。  
> **开工口令**：「开工云端品味层」（须先完成下方窄冻结）。

## 一句话

可选拉取云端 **Dispatcher 权重表** 与 **日签/文案池**；识别不了的 payload 则干净降级用本地表。`IdleOrchestrator` / CapCut / `SpriteSequencePlayer` **永远本地**。

## 已拍板（勿再开放）

1. **只上云**：权重覆盖 + 日签/文案池。  
2. **永远不上云**：播放器与编排（Idle 闭目↔睁眼弧、CapCut 叠代、pingpong / `frameHolds`）。  
3. **时机**：Rise / 欢迎 / 轻量完成 / Honesty 分档这几张表 **手感冻结** 后单独开工。  
   - **不等**同坐点 L2 兑换 / 服务端账本。  
   - **不等** `TEST_TRACKER` 全表关单。  
4. **两条时钟**：品味层防 clone JS 拿走调度表；同坐点服务端账本防刷点——**禁止绑成一条队**。  
5. **payload 必含 `schemaVersion`**（对齐练习记忆快照）：客户端不认识该版本 → **静默用本地表**，禁止崩、禁止逼所有端同步升级。

## 冲突扫描（实现前 · 已拍板）

对照 `SCENARIO_TESTS` Arrival / Idle 呼吸眨眼 / Honesty 补登 / Rise 加权 / 离线练习。

| 轴 | 结论 |
|---|---|
| **a. 强度** | 可选覆盖、失败用本地；不比 Sit 更重 |
| **b. 语气** | 无新推销句；日签仍观察式 |
| **c. 职责** | 不替代支付 Worker、练习备份、同坐点账本 |

把播放器上云会与「核心路径不绑云请求」冲突——**已否决**。

## 点击反馈（本 Brief 文档阶段）

Q1–Q2：**不涉及可点击交互**。Q3：无新用户路径（政策锁）。接线 PR 再答 0–1s（失败须降级，不得哑点击）。

## 实现时必守（尚未开工）

- 本地表 = 降级真源（`sceneAnimationDispatcher` 池 + `dailyWisdom` 池）。  
- 有网才拉 `/api/emotion-weight`、`/api/daily-message`（或后继）；超时/4xx/未知 `schemaVersion` → 本地。  
- **禁止**在 `EmotionController` / Sit·Rise 门闩硬编码「无网即失败」。  
- **禁止**与同坐点 L1（Honesty 发点钩子）同一周叠车。  
- 现有 stub mock **保持**直到本切片实现；正式响应再加 `schemaVersion`（建议从 `1` 起）。  
- CORS / 隐私明示同意见 `MVP_PRODUCT_DEFINITION`。

## 不做

- 把 Idle / CapCut 迁云  
- 用品味层满足 `isEntitled`  
- 把练习备份或 Stripe 路由塞进同一 Task  
- 因「功能已经很多」抢 SemVer `v1.1.0` 号
