# Task Brief · Calm Action 句包 overlay（D1）

> **状态（2026-09-09）**：**开工** · 旁支 `feature/calm-action-copy-overlay`。  
> **父排期**：`taste-layer-calm-action-roadmap.md` · **D1**。  
> **前置**：C1 Recover (#625) + C2 Arrive (#665) 已合 develop；用户口令「开工 Calm Action overlay」。

## 一句话

有网时非阻塞拉一份与 locale 对齐的 **Calm Action Recover + Arrive 池**（各 14 id）；卡面展示当下只用内存/本地已解析句。没网 = 现网 CMS 冻表。

## 已拍板

1. **分池**：Calm Action ≠ Quiet Line ≠ Daily Wisdom ≠ Confide。  
2. **范围**：仅 **Recover + Arrive**（C1/C2 已接线表面）；Focus / Transition / Reflect 本 PR 不做。  
3. **禁止**新开开机 `fetch`：并进现有 `prefetchTasteLayer` 槽（与 quiet-line / confide-copy 并行）。  
4. 冻表相同 → 只记 `calmActionCopy: true`，不另存 overlay 副本（`RB-20260820-L330`）。  
5. `?tasteLayer=0` 关拉取；生产 Worker 须口令「部署」才上现网。

## 冲突扫描

对照 `SCENARIO_TESTS` 场景 A / I（Arrival）+ Recover 打断路径。

| 轴 | 结论 |
|---|---|
| **a. 强度** | 无新点击；失败用本地池；卡 ≤ Companion / toast |
| **b. 语气** | 许可句；禁止教练/临床混进 |
| **c. 职责** | ≠ Arrival Notice；≠ `ACTIVE_RECOVER_*` toast；≠ Quiet Line |

**无冲突。**

## 点击反馈

**不涉及可点击交互**（后台 overlay）。Recover / Arrive 卡仍 0–1s 淡入，用已缓存或本地句。

## 后台网络三问

1. **Q1**：并进品味层预取；不得与精灵预加载 / Arrival·Honesty CapCut 抢窗。  
2. **Q2**：JSON 与冻表相同 → 跳过写盘，只记 cloud-ok。  
3. **Q3**：慢网失败不得挡 Sit / 卡淡入。

## 实现范围

- [x] Worker `POST /api/calm-action-copy` · `schemaVersion: 1` · 14+14 ids  
- [x] `tasteLayerOverlay` 解析 + `prefetchTasteLayer` 并行拉取  
- [x] `findCalmActionRecoverEntry` / `findCalmActionArriveEntry` overlay 优先  
- [x] `__tasteLayer.status().calmActionCopy`  
- [ ] 生产 Redeploy（须用户口令「部署」）

## 不做

- Focus / Transition / Reflect 池  
- 日签 14→N · 伸懒腰 / 好奇权重  
- 修改 Arrival / Recover toast locale 键
