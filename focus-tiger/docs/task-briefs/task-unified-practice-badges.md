# Task Brief · 统一练习徽章体系

> **状态**：已立项 · **未开工**（2026-08-09 拍板）  
> **前置**：Sanctuary 17 枚素材已入库（`public/ui/support/sanctuary-badges/`）；Tea 9 枚已接线（`yin-badges/` + `tipKindnessBadges`）。  
> **性质**：产品 + 工程；触及 tip / Sanctuary 双 gate 与展示 chrome——高风险，须独立 `feature/*`，一次一任务切面可再拆。

## 产品口径（已拍板）

| 路径 | 首次颁发 | 之后 |
|---|---|---|
| **未付费（纯使用）** | **1** 枚 | 按累计专注水平加枚（只增不减） |
| **Buy Yin a Tea** | **3** 枚 | 同上；练习上涨可触发更多（**不**要求再 tip） |
| **Lifetime Sanctuary** | **3** 枚 | 同上；练习上涨可触发更多 |

- Tea 与 Sanctuary：**两套视觉**（`yin-badges/` vs `sanctuary-badges/`）。  
- Sanctuary **独立** `badgeIds`（写在 sanctuary entitlement 侧或并列 key）；**禁止** tip gate 写 Sanctuary、禁止 Sanctuary 读 tip 决定解锁内容。  
- 免费路径徽章：不解锁内容；展示须温和、不制造焦虑（对齐 `PRODUCT_POSITIONING` / `PRINCIPLES`）。

## 现状缺口（实现前必读）

| 能力 | 现状 |
|---|---|
| Tip 付费瞬间授 3–9 | ✅ `tipKindnessBadges` + Tip 卡 + 阿寅旁 |
| Tip：练习涨了自动加枚（无再 tip） | ❌ 仅 tip/restore/空补发时算一次 |
| Sanctuary 授章 / `badgeIds` / UI | ❌ 仅有 PNG 库 |
| 免费用户授章 / 起 1 | ❌ 现逻辑要求 `tipped` |

## 建议交付切面（可再拆 PR）

1. **共享练习水平 → 目标枚数**纯函数（免费 min=1；付费 min=3；max 按目录）；单测锁契约。  
2. **Tip**：练习上涨时只增合并（Idle / 会话结束钩子）；不改 tip 零耦合。  
3. **Sanctuary**：schema + `badgeIds` + 支付/confirm 后授 3；练习上涨只增；**独立** catalog 指向 `sanctuary-badges/`。  
4. **免费**：独立或共享 chrome；首次 1；上涨加枚；文案/i18n。  
5. **展示**：阿寅旁 / 卡内是否分区（Tea vs Sanctuary vs 练习）——实现前书面确认布局，避免挤满。

## 明确不做（本任务）

- 纪念奖励系统整包（成就墙 / 环境细节 / 3D 公仔柜）  
- tip 驱动 Sanctuary 内容解锁  
- 把 Sanctuary PNG 塞进 tip 目录或共用同一 `badgeIds` 数组

## 文档 / 回归

- 更新：`YIN_TIP_JAR.md` · `YIN_SANCTUARY.md` · `SHARED_RESOURCES.md` · `ASSET_INVENTORY.md` · `TEST_TRACKER.md`  
- 自动化：目录 / merge 只增 / 双 gate 零耦合失败用例；能 DOM 断言的进 unit 或单文件 e2e  
- 人工：三条路径各主路径 + 一条回流（Rise / 关卡再开）

## 验收一句话

未付费可见从 1 起的练习章；Tea / Sanctuary 付费后至少 3 枚且视觉分立；练习水平上升后**无需再付款**即可加枚；Sanctuary `badgeIds` 不进 tip storage。
