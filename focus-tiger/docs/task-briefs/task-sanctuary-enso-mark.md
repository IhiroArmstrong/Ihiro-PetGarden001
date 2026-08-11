# Task Brief · Sanctuary Enso Mark（蒲团边缘金石圆相）

> **状态（2026-08-11）**：待排期 · **等用户提供透明 PNG** 后再开工实现。  
> **目的**：购入 Sanctuary（或 Membership 互覆盖）的用户，在阿寅**蒲团边缘**有一枚极其隐约微小的金石圆相印记——静默标识「独立开发守护者 / 资深禅友」，补足「现有练习徽章条不足以区分付费身份」的感知缺口。  
> **原则**：经济可持续；不制造焦虑；与练习纪念（蒲团刺绣 / 芥子须弥）语义分立。

## 为何还要做（相对已有徽章）

| 已有 | 缺口 |
|---|---|
| Sanctuary `badgeIds` 阿寅旁尊贵章条 | 练习上涨也会加枚；Tea 也有善意章——**一眼不够「付费身份」** |
| Settings / Unlock 卡 Sanctuary Pass | 不在主场景朝夕可见 |
| **Enso Mark（本任务）** | 主场景蒲团边**静默常驻**（Idle 可见；Focusing 可藏或更淡——开修前定） |

## 产品契约

| 项 | 口径 |
|---|---|
| 显示条件 | `isEntitled` 进阶（lifetime∪subscription / `isSanctuaryUnlocked` 信号）；**零** tip 耦合 |
| 位置 | 蒲团边缘；隐约微小；不抢 Yin 脸与 Sit CTA |
| 素材 | 用户提供透明 PNG → 入库前 **kebab-case ASCII**（如 `sanctuary-enso-mark.png`）→ `public/ui/support/` 或 `sanctuary-badges/` 旁新目录 |
| 文案 | 默认**无**说明气泡；Settings 可一句「Enso mark」；禁止夸耀成就腔 |
| 与纪念刺绣 | Backlog「30 天蒲团刺绣」= **练习**纪念；Enso = **付费身份**。视觉须可区分（位置/材质），禁止混成同一资产 |
| 与芥子须弥 | 练习 score 门槛卡；**不**替代 Enso |

## 实现要点（将来）

1. 素材入库 + `ASSET_INVENTORY`。  
2. Idle chrome 条件渲染；窄/宽、Safe area、z-index 登记。  
3. 单测：entitled 显示 / 未授权不显示；tip-only 不显示。  
4. TEST_TRACKER 观感行（须人工：隐约但不丢、不挡交互）。

## 前置

- [ ] 用户交付透明图（可多候选，产品选一）  
- [ ] 命名合规后再 copy 进仓  

## 建议分支

`feature/sanctuary-enso-mark`

## 不做

- 付费用户才显示「练习不足」负面态。  
- 把 Enso 做成闪烁/粒子狂欢。  
- 未购用户主场景常驻大锁图标（Support FAB / 锁项处已够）。
