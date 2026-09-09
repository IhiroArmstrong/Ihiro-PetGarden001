# Task Brief · Calm Action Wisdom · Reflect 运行时（C4）

> **状态（2026-09-09）**：**PR [#672](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/672)** · 旁支 `feature/calm-action-reflect-runtime`。  
> **父排期**：`taste-layer-calm-action-roadmap.md` · **C4**。  
> **内容 SSOT**：`CALM_ACTION_WISDOM.md`（Reflect 段 · 20 ids `CAW-L01`–`L20`）。  
> **用户拍板**：口令「开工 Calm Action Reflect」（2026-09-09）。

## 一句话

在 **Reflection 完成页**底部、Daily Wisdom **上方**，从 Calm Action **Reflect 池**抽一条 S/M 许可句；**不替换** Daily Wisdom / Reflection echo / 三问文案。

## 已拍板

1. **分池**：Calm Action ≠ Quiet Line ≠ Daily Wisdom ≠ Reflection echo。  
2. **语气**：许可、收束一天；Reflection 三问 UI **保持原样**。  
3. **本 PR 只接 Reflect 表面**——overlay **不做**（Layer D 另 PR）。  
4. **选取**：日历日锁（同日多场 Reflection 同一句）。  
5. 中文 zh 仅 CMS；产品面 **en + ja**。

## 冲突扫描

对照 `SCENARIO_TESTS` Reflection / Rise / Daily Wisdom Phase A。

| 轴 | 预期 |
|---|---|
| **a. 强度** | 内嵌一行 ≤ Daily Wisdom 干扰；不挡 Skip/Continue |
| **b. 语气** | 行动池许可句；禁止临床 / 教练腔 |
| **c. 职责** | ≠ `<daily-wisdom>`；≠ companion echo；≠ 三问 |

**无冲突。**

## 实现范围

- [x] Reflect 池 20 id → locale CMS 表  
- [x] 选取：日历日锁  
- [x] 展示：Reflection 卡内 footer 与 Daily Wisdom 之间  
- [x] 离线：本地 CMS；失败静默（不渲染行）  
- [x] 单测 + e2e（Rise → Reflection 可见 `calm-action-reflect-line`）

## 后台网络

**零新增 fetch**（不涉及后台网络）。

## 保护面

- Reflection 三问 / Skip all / companion validation  
- Daily Wisdom `<daily-wisdom>` 仍挂载  
- Rise / Honesty / Sit 门闩  

## 不做

- Focus 标语 / Transition  
- Calm Action Reflect overlay / Worker 新路由  
- 修改 Reflection locale 键  
