# Task Brief · 云端品味层（权重覆盖 + 日签/文案池）

> **状态（2026-09-02）**：范围 / 窄冻结 / **四问**见 `ANTI_PLAGIARISM_LAYER.md` §3。**#349 已合** schemaVersion 1 可选 overlay。Quiet Line overlay **口令已给** · Brief `task-quiet-line-copy-overlay.md`（**本文件无 Quiet Line 运行时**）。  
> **权威**：`PROCESS.md` Backlog「云端品味层」+ 父概念 `ANTI_PLAGIARISM_LAYER.md`。旧称「v1.1 云端算法」——**支付云 ≠ 品味云**；SemVer 首稳仍是 `v1.0.0`。

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
7. **四问筛选尺**：见 `ANTI_PLAGIARISM_LAYER.md` §3。过四问才扩池；扩形须升 `schemaVersion` 并同步本地兜底。
8. **下一刀（2026-09-02）**：Quiet Line / 今日静语句包 overlay **口令已给**（`task-quiet-line-copy-overlay.md`）。日签 14→N、伸懒腰/好奇池 **后排**。挥手点播（#356）**不是**品味层。开机品味层预取错峰是**另一条**任务（`task-taste-layer-boot-prefetch-defer.md`），禁止和句包 overlay 混做一个 PR。

## 开工前优先级（已走过）

1. 同坐点 L1 收尾 — 用户书面达标/未达标 OK（TRACKER 未关单）  
2. 桌面陪伴 L0 — 探针可合（hitch 无卡顿；8GB 书面豁免；低配不出入口；不开 L1）  
3. **品味层 — 本切片**  
4. Electron 托盘步骤 B — 已接线，待 Mac 场景 AB

L2 兑换 #339 已合且未改 Honesty 时长分档。本切片 **未改** `HonestyCheckInController`。

## 冲突扫描（实现前 · 已拍板）

对照 `SCENARIO_TESTS` Arrival / Idle 呼吸眨眼 / Honesty 补登 / Rise 加权 / 离线练习 / Quiet Line。

| 轴 | 结论 |
|---|---|
| **a. 强度** | 可选覆盖、失败用本地；不比 Sit 更重 |
| **b. 语气** | 无新推销句；日签仍观察式 |
| **c. 职责** | 不替代支付 Worker、练习备份、同坐点账本；Quiet Line overlay 未实现、不抢 #356 点播 |

把播放器上云会与「核心路径不绑云请求」冲突——**已否决**。  
把全部 config/master data 上云会与四问①②③冲突——**已否决**。  
Honesty 分档与同坐点 L1 发点是**邻接代码**不是同一功能；分析师提醒记入排期，**不**改冻结数字、**不**撤回 #337。

## 点击反馈（接线）

Q1–Q2：**不涉及可点击交互**（开机非阻塞拉取；失败用本地表，无按钮）。Q3：对照 Arrival / Idle 呼吸眨眼 / Honesty 补登 / Rise 加权 / 离线练习 / Quiet Line — 失败降级本地，不比 Sit 更重。

## 实现时必守

- 本地表 = 降级真源（上列冻结数字 + `dailyWisdom` 池）。  
- 有网且已配 Cloud base 才拉 `/api/emotion-weight`、`/api/daily-message`；超时/4xx/未知 `schemaVersion` → 本地。  
- **禁止**在 `EmotionController` / Sit·Rise 门闩硬编码「无网即失败」。  
- **禁止**改 `HonestyCheckInController` 来用品味层（分档只 overlay Dispatcher）。  
- 正式响应带 `schemaVersion: 1`；旧 mock 无该字段 → 客户端当未知版本。  
- CORS / 隐私明示同意见 `MVP_PRODUCT_DEFINITION`。  
- 生产 Worker **须用户说「部署」**才 Redeploy（`prod-worker-deploy`）。口令已给不等于已上现网——须 `wrangler deploy` 成功且现网 JSON 含 `schemaVersion: 1`。  
- 扩下一张池前过四问；Quiet Line overlay 另口令，勿塞进本接线切片。

## 不做

- 把 Idle / CapCut 迁云  
- 用品味层满足 `isEntitled`  
- 把练习备份或 Stripe 路由塞进同一 Task  
- 因「功能已经很多」抢 SemVer `v1.1.0` 号  
- 把本 Brief 合入理解成已部署生产 Worker  
- 把「不影响离线」理解成全部 master data 可上云  
- 未过三条观感就开工 Quiet Line overlay
