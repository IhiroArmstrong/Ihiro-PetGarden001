# Task Brief · Yin Personalization Engine · L1（本地智能）

> **状态（2026-08-26）**：**L1 开工**（口令「开工 L1」）。用户书面：与 AG 1d/1e、AF 人工验收**无耦合**。  
> **权威**：`YIN_PERSONALIZATION_ENGINE.md` §B–§D。  
> **前置**：L0 #452 已合 `develop`。  
> **禁止本切片**：L2 Pack / Worker、Speak probability、仪式 generate 扩权、原文上云。

---

## 冲突扫描

对照 `SCENARIO_TESTS.md` 场景 Y / AE / AG / Z。

| 轴 | 相邻 | 判断 |
|---|---|---|
| **a. 强度** | Sit；Y；AE | 三档放在已有 What Yin remembers 面板内，不比 Sit 重。检索仍 ≤3。 |
| **b. 人设** | 观照者 | Insight 只计数；禁止诊断 / 督促。quiet 不得装死（Sit 仍响应）。 |
| **c. 职责** | AG Memory；Z Journey | 检索从属 Memory helper；Insight 只读 Journey，不另建账本。 |

后台网络：不涉及。

---

## 做什么

1. `ypeRetrieveMemories`：主题 + confidence + freshness + 本会话去重；quiet 最多 1 条。可选本地 `rankHint` 仅本机接口。**云 Pack 不下发** ranking 分数或 `memoryHints`（L2 契约 2026-08-26）。  
2. `ypeBuildJourneyInsights`：≥10 次坐才出 `morning_settle` 等观察对象；warm 才可进 L3 prompt。  
3. What Yin remembers 邻接 quiet / usual / warm；usual = 关掉个人化。

## 验收

- 单测：low 不进；无关不硬插；quiet cap 1；Pack 仍丢弃。  
- 人工：面板改档 0–1s 看到选中；Confide fallback 默认档与开工前同一检索力度。
