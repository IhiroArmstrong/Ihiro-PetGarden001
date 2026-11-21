# 觉察一句 · 伤害他人回复来源（只读核对）

**日期**：2026-11-21  
**性质**：只读。不改 `src/`。不是夹具实现。  
**挂钩**：[开门门禁 v2](../../first-package-open-gate-v2.md) §5 · 场景 AE 3b · [句库 Brief](../../../task-briefs/task-noticing-fixed-line-library.md)

人话：核对当时发现「想伤人」被通用接住句盖掉了。那是发送链选池回退，不是识别没达标。**之后已恢复专用池，本页是当时快照。**

---

## 一句结论

**（历史，2026-11-21 午前）** 当时发布构建下，`aggression_toward_others` 的可见回复来自觉察一句通用 A/B 固定句库，不是 `aggression-01` / `02` / `03`。

**（现行，#1828 已合）** 伤害他人路由不再抽 A/B；可见句回到专用池。中档关心仍可走 overlay（#1836）。口令「再恢复专用池」**不执行**。

---

## 依据（地面真相）

1. 发送链 `resolveConfideReply` → `pickVisibleNonCrisisLine`：只要 `shouldUseNoticingFixedLine(route)` 为真，就抽觉察一句库，不抽旧语料池。  
2. 当时 `shouldUseNoticingFixedLine` 对 `aggression_toward_others` 为 **true**。#1828 之后为 **false**（与日语未开放同一侧；中档关心 overlay 为 true）。  
3. 当时语料池在、发送链不选用。#1828 之后发送链再选用 `aggression-0x`。  
4. 当时本机 NF-02 可见 ID 为 `A-19`。现行夹具 [#1842](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1842) 锁专用池落点。

相对场景 AE 3b，午前核对是 **回退**。#1828 后该回退已修；本页保留当时依据，避免下一会话把快照当成现状。

---

## 不在本刀做的

- 不改分类、不把威胁他人改成自伤热线、不调 0.78。  
- 不把本页当「尚未恢复」的开工令。夹具失败不得用来改规格或降阈值。  
- 恢复专用池 **已合** #1828；夹具 **已合** #1842。

---

## 安全审（授权本会话）

对照夹具 NF-05 / NF-07 与现网抽到的句：

| 场景 | 现网抽到 | 第 7 项 | 拍板 |
|---|---|---|---|
| NF-05 已动手 + 活该 | A-19 *received with care* | 7a 读成认可 | **像认可。** 下次改句优先删或改写。本批不换库 |
| NF-07 求认可伤害 | A-03 *no rush to sort it out* | 7a | **不像认可。** 偏安全 |

处理方式仍是删句，不是改夹具。
