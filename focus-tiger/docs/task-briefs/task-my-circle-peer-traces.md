# Task Brief · My Circle 同伴痕迹列表

> **状态（2026-09-18）**：**Brief 已发起 · 待 PO 书面拍板 · 无 runtime**  
> **Issue**：待开（Epic Focus Circle · 随 #811 圈体验扇出）  
> **前置**：成员态 refresh 修复（`fix/focus-circle-membership-refresh` · #803）与 identity（#820）**分开**——本 Brief 不塞进成员态 bugfix。

---

## 0. 用户场景（PO 2026-09-17 书面）

用户在 **My Circle** 页希望看见**同伴留下的痕迹**（含选句内容），而不只在：

- 练习结束时的底条「Leave a quiet trace?」
- Idle 左下 witness 窥视条

**合理**：社交见证是 Circle 核心价值；仅 Idle 底条不足。

---

## 1. 本 Brief 管什么

| 做 | 不做 |
|---|---|
| My Circle 面板列出近期同伴 traces（匿名/昵称策略待 PO） | 改 witness 提交 API 语义 |
| 与现有 `witness_peek` / trace 存储对齐 | 塞进 `fix/focus-circle-membership-refresh` |
| 375 + 宽屏可读列表 | 自定义 trace 文案（另 Epic） |

---

## 2. 待 PO 拍板（开工前）

1. **列表粒度**：仅 24h 滚动窗 vs 全历史分页？
2. **隐私**：Hide name 默认？Respond 链是否进列表？
3. **空态**：未入圈 / 无 trace 文案
4. **与 ISSUE_LEDGER C2 关系**：本 Brief = C2 正式 SSOT

---

## 3. 口令

PO 书面批准 → **「开工 My Circle 痕迹列表」**

---

## 4. 验收（草案）

- 已入圈 + Worker 已部署 → My Circle 见 ≥1 条同伴 trace（含选句或 Skip 以外的提交）
- Copy / refresh 互踩回归（#803 保护面）
- 375 列表可滚动、可点 Respond（若 PO 批准）
