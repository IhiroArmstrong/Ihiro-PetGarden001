# Task Brief · 云端品味层（权重覆盖 + 日签/文案池）

> **状态（2026-08-18 夜）**：窄冻结已拍板；**权重池切片已开工**（可选 `/api/emotion-weight`）。日签正文本切片未覆盖。  
> **权威**：`PROCESS.md` Backlog「云端品味层」。旧称「v1.1 云端算法」——**支付云 ≠ 品味云**；SemVer 首稳仍是 `v1.0.0`。  
> **开工**：用户 2026-08-18 夜书面「安排下一步」（L0 告一段落 + L1 测 OK）= 本切片口令。

## 一句话

可选拉取云端 **Dispatcher 权重表** 与 **日签/文案池**；识别不了的 payload 则干净降级用本地表。`IdleOrchestrator` / CapCut / `SpriteSequencePlayer` **永远本地**。

## 已拍板（勿再开放）

1. **只上云**：权重覆盖 + 日签/文案池。  
2. **永远不上云**：播放器与编排（Idle 闭目↔睁眼弧、CapCut 叠代、pingpong / `frameHolds`）。  
3. **时机**：Rise / 欢迎 / 轻量完成 / Honesty 分档这几张表 **手感冻结已拍板**，单独开工（须口令）。  
   - **不等**同坐点 L2 兑换 / 服务端账本。  
   - **不等** `TEST_TRACKER` 全表关单。  
4. **两条时钟**：品味层防 clone JS 拿走调度表；同坐点服务端账本防刷点——**禁止绑成一条队**。  
5. **payload 必含 `schemaVersion`**（对齐练习记忆快照）：客户端不认识该版本 → **静默用本地表**，禁止崩、禁止逼所有端同步升级。
6. **窄冻结（2026-08-18 用户书面）**：本地降级表就是现在这套，近一周不改数字。不是全量 QA。体感锚：Idle 不闪、Rise 再选、Honesty 关了再开。
   - Rise：伸懒腰 60 / 茶 25 / 书 15（`RISE_INTERRUPT_POOL`）
   - 欢迎：魔法书 60 / 点头 40（`WELCOME_POOL`）
   - 轻量完成：`sessionComplete` 70 / 点头 30 / 鹦鹉 weight 8 ≈7%（`LIGHT_COMPLETE_POOL`）
   - Honesty：≤29 分点头 `mindfulAcknowledge`；≥30 分金辉 `goldenHaloPalms`
   - 日签：`daily-wisdom.en.js` / `.ja.js` 各 14 条、id 对齐；切片期间不扩不删

## 开工前优先级（2026-08-18 · 已执行）

1. **同坐点 L1 收尾** — 用户书面达标/未达标测 OK（TRACKER 未关单）  
2. **桌面陪伴 L0** — 告一段落（低配不出入口；#336 另 rebase）  
3. **品味层权重池** — **本切片**  
4. **Electron 托盘步骤 B** — #345 已合（场景 AB 待人工）

## 冲突扫描（实现前 · 已拍板）

对照 `SCENARIO_TESTS` Arrival / Idle 呼吸眨眼 / Honesty 补登 / Rise 加权 / 离线练习。

| 轴 | 结论 |
|---|---|
| **a. 强度** | 可选覆盖、失败用本地；不比 Sit 更重 |
| **b. 语气** | 无新推销句；日签仍观察式 |
| **c. 职责** | 不替代支付 Worker、练习备份、同坐点账本 |

把播放器上云会与「核心路径不绑云请求」冲突——**已否决**。  
Honesty 分档与同坐点 L1 发点是**邻接代码**不是同一功能；分析师提醒记入排期，**不**改冻结数字、**不**撤回 #337。

## 点击反馈（权重池切片）

Q1：**不涉及新可点击控件**。开机后台拉权重；失败静默用本地表，Sit 不转圈。
Q2：无 Cloud / 超时 / 未知 `schemaVersion` = 设计降级，不是哑点击。不进 `SILENT_BEHAVIORS` 新条（用户没点控件）。
Q3：Arrival / Idle 呼吸眨眼 / Honesty 补登 / Rise 加权 / 离线练习 — 可选覆盖、失败本地；不比 Sit 更重；不改 Honesty 分档数字。无冲突。

## 实现时必守

- 本地表 = 降级真源（上列冻结数字 + `dailyWisdom` 池）。  
- 有网才拉 `/api/emotion-weight`（日签 `/api/daily-message` 正文本切片另刀）；超时/4xx/未知 `schemaVersion` → 本地。  
- **禁止**在 `EmotionController` / Sit·Rise 门闩硬编码「无网即失败」。  
- 现 stub 响应含 `schemaVersion: 1` + 冻结 `pools`（与本地同数字）。  
- CORS / 隐私明示同意见 `MVP_PRODUCT_DEFINITION`。

## 不做

- 把 Idle / CapCut 迁云  
- 用品味层满足 `isEntitled`  
- 把练习备份或 Stripe 路由塞进同一 Task  
- 因「功能已经很多」抢 SemVer `v1.1.0` 号  
- 把日签正文覆盖混进本权重池切片  
- 开工陪伴 L1 或同坐点 L3 
