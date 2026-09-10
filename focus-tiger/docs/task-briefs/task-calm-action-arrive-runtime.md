# Task Brief · Calm Action Wisdom · Arrive 运行时（第二刀）

> **状态（2026-09-09）**：**已合 `develop`**（PR [#665](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/665) · tip `3d7fa6c`）；人工验收仍见 `docs/tracker-entries/feature-calm-action-arrive-runtime.md`。  
> **父排期**：`taste-layer-calm-action-roadmap.md` · **C2**。  
> **内容 SSOT**：`CALM_ACTION_WISDOM.md`（Arrive 段 S/M · 14 条 hero）。  
> **用户拍板**：C1 Recover 已合 #625；Sit 前接 Action 70（2026-09-08 口令）。

## 一句话

在 **Arrival Practice 走完、尚未 Focusing** 时，从 Calm Action **Arrive 池**抽一条 S/M 许可句，展示在 Companion 选择器上方的独立卡；**不替换** Arrival / Honesty / Companion 现网文案。

## 已拍板

1. **分池**：Calm Action ≠ Quiet Line ≠ Daily Wisdom ≠ Arrival 气泡。  
2. **语气**：许可、降门槛；Arrival 观察式 UI **保持原样**。  
3. **第二刀只接 Arrive（Sit 前）**——验证选取/展示/降级；overlay **本 PR 不做**。  
4. **Quick Start 跳过 Arrival** → **不出** Calm Action 卡（`skipped: true`）。  
5. 中文 zh 仅 CMS；产品面 **en + ja**。

## 冲突扫描

对照 `SCENARIO_TESTS` 场景 A / I / Honesty 桥接 Arrival。

| 轴 | 预期 |
|---|---|
| **a. 强度** | 卡 ≤ Companion 面板干扰；可点关 / 自动淡出 |
| **b. 语气** | 行动池许可句；禁止临床 / 教练腔 |
| **c. 职责** | ≠ Arrival Notice/Choose 文案；≠ Moment Whisper；≠ Quiet Line |

## 实现范围

- [x] Arrive 池 14 id → locale CMS 表  
- [x] 选取：日历日锁 + 每轮 Arrival 只展示一次  
- [x] 展示：`onReady` 且 `!skipped && !beginNow`  
- [x] 离线：本地 CMS；失败静默  
- [x] 单测 + e2e（375 路径 `chooseReadingAndOpenCompanion`）

## 后台网络

**零新增 fetch**（不涉及后台网络）。

## 保护面

- Arrival CapCut / Choose 鞠躬 / Companion 三选  
- Honesty 补登桥接 → Arrival  
- Quick Start / Offline 直开表路径  

## 不做

- Focus 标语 / Transition / Reflect  
- Calm Action overlay  
- 修改 Arrival locale 键  
