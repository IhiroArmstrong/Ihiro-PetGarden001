# Task Brief · Yin Evolution · Garden copy（莲花 = 痕迹）

> **状态（2026-09-11）**：**旁支** `feature/yin-evolution-garden-copy` · 独立极小 PR（不与 P0 Journey 记忆混批）。  
> **SSOT**：`YIN_EVOLUTION.md` §3 Garden · §8 文案刀 · Epic [#640](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/640)。

## 目标

把用户可见的莲花 / 花园措辞从「解锁 / 第一朵奖杯」语气，改成 **练习留下的痕迹**（观察式，不制造焦虑）。**零运行时**、不改 `scoreFormula` / 莲花阈值 / 出生 FX。

## 范围（in）

| 触点 | locale key | 说明 |
|---|---|---|
| Journey 首莲记忆 | `JOURNEY_MEMORY_FIRST_LOTUS` | 与 P0 六条记忆同排；斜体行，无弹窗 |
| 珍藏结缘门槛 | `YIN_COIN_GAP_LOTUS` | 青瓷莲盏 `space.lotus-dew` 缺莲时的 gap 句 |

## 范围（out）

- 莲花池 Slice A 运行时 / 出生 FX / DOM / 公式  
- Journey P0 其它记忆键、Come Back  
- Stage HUD / 新 hint / 新 aria  
- `YIN_COIN_PANEL_BLURB`（花园 vs 珍藏切开句，已正确）  
- `YIN_COIN_CEREMONIAL_STILL`（叠层铁律，非语义）  
- SKU 器物名 `YIN_COIN_SKU_LOTUS_DEW`

## 冲突扫描（2026-09-11）

| 轴 | 结论 |
|---|---|
| **a. 强度** | 仅改两行 locale；不比 Celebrating / MilestoneGlow 更吵 |
| **b. 语气** | 观察式「留下 / trace / 残した」；无成就弹窗、无断签惩罚 |
| **c. 职责** | Garden 痕迹语义；≠ Journey 其它记忆；≠ 寅币花园叠层 |

## 验收

1. `?product=1` + 首莲记忆 / 无莲时兑 `space.lotus-dew` → 三语读感为「痕迹」而非「解锁奖杯」。  
2. `npm run test:smoke` 绿。  
3. `TEST_TRACKER` 碎片登记「待人工测试」。

## 共用机制核对

- **overlayBusy / HUD / z-index**：不涉及（文案-only）。  
- **结论**：无 overlay 消费者改动。
