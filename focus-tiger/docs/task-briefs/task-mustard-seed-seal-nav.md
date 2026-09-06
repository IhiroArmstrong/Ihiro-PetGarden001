# Task Brief · 芥子须弥纪念印 · 卡内 Prev/Next 导航

> 状态：**立项**（2026-09-06）  
> 关联：现网三 case Brief `task-mustard-seed-seal.md` · 目录化 `task-memorial-seal-directory.md`（#605 已合 develop）  
> **本 Brief 不改**首次揭示时机、score 门槛、仪式后出卡顺序。

## 问题

菜单重读已支持三首轮换，但路径为：Continue 关卡 → Idle → ⋯ → 再点菜单项。人工关单反馈：**体验绕、不直观**。

## 目标

在 `#mustard-seed-seal-card` 上增加常见 **Prev / Next** 控件，让用户在卡内直接切换**已揭示**的诗，无需退回 Idle 菜单。

## 契约

| 项 | 口径 |
|---|---|
| 显示条件 | 仅当 `revealedCaseIds.length > 1` 时显示 Prev/Next；单首已揭示时**不**显示 |
| 导航范围 | **仅已揭示** case；不得预览未揭示诗 |
| 边界 | **到头停住**：第一首时 Prev 禁用/隐藏；最后一首时 Next 禁用/隐藏；**不循环** |
| 模式 | `mode: 'auto'`（仪式首次揭示）**不**显示 Prev/Next（保持专注单首发现）；`menu` / `force` 可读多首时显示 |
| 持久化 | 切换时更新 `lastShownCaseId`（与菜单轮换同一字段）；**不**重复 `markRevealed` |
| 文案/章 | 不变；切换只换 `data-case-id` 与诗面 |
| 375 | 箭头不挡 Continue；小屏可放在标题行两侧或卡缘 |
| 禁止 | 绑付费；未揭示诗偷看；循环播放三首当跑马灯 |

## 交互反馈（PR 须答）

- **Prev/Next 点击**：0–1s 内诗面与署名切换，`data-case-id` 更新；边界钮 disabled，无静默无反应（非 SB 白名单）
- **Continue**：仍只关卡并进 Reflection（auto）或回 Idle（menu），不负责切诗

## 测试

- 单元：`mustardSeedSeal.test.js` 增「卡内 prev/next 只走 revealed 列表、边界停住」
- 人工：三首均已揭示 → 菜单打开卡 → Prev/Next 切换三首 → 首尾禁用；仪式 auto 首张仍无箭头
- e2e（可选）：`mustard-seed-seal.spec.js` 增 force 模式 prev/next DOM

## 冲突扫描（占位）

- **强度**：不新增庆祝层；不改变仪式后首张出卡
- **语气**：无新文案池
- **职责**：与 Quiet Line / Daily Wisdom / Witness 仍分池
