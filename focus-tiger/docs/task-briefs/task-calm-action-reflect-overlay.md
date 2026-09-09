# Task Brief · Calm Action Reflect 句包 overlay（D1 扩面）

> **状态（2026-09-09）**：**开工** · 旁支 `feature/calm-action-reflect-overlay`。  
> **父排期**：`taste-layer-calm-action-roadmap.md` · **D1 扩面**（C4 Reflect 运行时 #672 + #674 已合）。  
> **前置**：`task-calm-action-copy-overlay.md`（Recover + Arrive · #670 已合 · 生产已部署）。  
> **用户拍板**：口令「同意开工 Reflect overlay」（2026-09-09）。

## 一句话

扩展现有 `POST /api/calm-action-copy`（`schemaVersion: 2`）加入 **Reflect 池 20 id**；并进 `prefetchTasteLayer` 槽；`findCalmActionReflectEntry` overlay 优先；没网 = 本地 CMS 冻表。

## 已拍板

1. **分池**：Calm Action Reflect ≠ Daily Wisdom ≠ Reflection echo。  
2. **范围**：仅 **Reflect 池**（Recover + Arrive 已在 #670）；不新开路由。  
3. **schemaVersion 2**：14 recover + 14 arrive + 20 reflect；schema 1 响应拒收。  
4. 冻表相同 → 只记 `calmActionCopy: true`，不另存 overlay 副本（`RB-20260820-L330`）。  
5. `?tasteLayer=0` 关拉取；生产 Worker 须口令「部署」才上现网。

## 冲突扫描

对照 `SCENARIO_TESTS` Reflection / Rise / Daily Wisdom Phase A。

| 轴 | 结论 |
|---|---|
| **a. 强度** | 无新点击；失败用本地池；Reflect 行 ≤ Daily Wisdom 渐显 |
| **b. 语气** | 许可收束句；禁止教练/临床 |
| **c. 职责** | ≠ `<daily-wisdom>`；≠ companion echo；≠ 三问 |

**无冲突。**

## 点击反馈

**不涉及可点击交互**（后台 overlay）。Reflection Calm Action 行仍 0–1s 渐显。

## 后台网络三问

1. **Q1**：并进现有 `prefetchTasteLayer` 槽；不得与 Arrival CapCut / Reflection 叠化抢窗。  
2. **Q2**：JSON 与冻表相同 → 跳过写盘，只记 cloud-ok。  
3. **Q3**：慢网失败不得挡 Reflection Skip/Continue / Daily Wisdom 渐显。

## 实现范围

- [x] Worker `/api/calm-action-copy` · `schemaVersion: 2` · +20 reflect ids  
- [x] `tasteLayerOverlay` 解析 + `overlayCalmActionReflectTextForId`  
- [x] `findCalmActionReflectEntry` overlay 优先  
- [x] `tasteCalmActionCopyOverlayMatchesLocalFreeze` 含 reflect  
- [ ] 生产 Redeploy（须用户口令「部署」）

## 不做

- Transition / Focus 池  
- 日签 14→N · 权重分叉  
- 修改 Reflection 三问 locale 键
