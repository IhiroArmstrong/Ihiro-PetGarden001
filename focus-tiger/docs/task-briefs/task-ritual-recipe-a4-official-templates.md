# Task Brief · A4 官方四模板选型（Ritual Recipe 阶段 1）

> **状态（2026-10-29）**：**PO 已点头 · 开工**（书面同意主链先 A4 再 A2）。  
> **类**：**B**（Five Moments Compass 新增可点模板行；改开坐默认时长/音效来源）。  
> **依赖**：A1b 已合 develop [#1469](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1469)。  
> **真源**：[`RITUAL_RECIPE_A1_SPEC.md`](../RITUAL_RECIPE_A1_SPEC.md) §10 · [`task-ritual-recipe-phase1.md`](./task-ritual-recipe-phase1.md)。

## 一句话

在 **Five Moments Compass**（非 first-run）里可选 Default / Deep / ADHD / Evening，写入 `focus-tiger.ritual-recipe.v1` 并同步 Focus chip 偏好；下一场开坐走已有 `sittingSessionPlan`。

## 范围（in）

- `officialSittingTemplateSelection.js`：应用官方模板、解析当前选中 id、同步 `focus-duration-pref.v1`（10/15/45 与模板 Focus 对齐）。
- Compass 卡片：四行模板按钮 + 选中态；first-run 卡片**不**展示（避免首卡过载）。
- Default 仍须与改造前一致；Deep/ADHD/Evening 开坐时 `source=official`、音效/时长可区分。

## 范围（out）

- **A2** 自定义编辑 UI、恢复默认滑杆、Recover 文案。  
- **A3** 导入导出 / 分享链。  
- **A1c** promptId → locale 池接线（未知 id 仍 null；模板 id 已在白名单）。  
- 不改 Support / 付款 / Confide / 练习备份。

## 冲突扫描

| 轴 | 判断 |
|---|---|
| **a. 强度** | 仅 Idle 打开 Compass 时多一块选型；不新增全屏打断。 |
| **b. 语气** | 模板名为观察式短标签（含分钟数）；无监工腔。 |
| **c. 职责** | 选型写配方 + chip 偏好；chip 本场覆盖仍不写回配方（A1b 不变）。 |

**结论：无用户路径冲突**（相邻：场景 T Focus chip、Ambient 开坐播、Five Moments first-run）。

## 变体矩阵

| 变体 | 入口 | 预期 |
|---|---|---|
| 宽 / 窄 | Compass 同 DOM | 四模板均可点；选中态可见 |
| first-run Compass | 仅 Got it / Skip | **隐藏**坐法块 |
| 默认 `?product=1` | ⋯ / 第三球 → Compass | 坐法块可见（非 first-run） |
| en / zh / ja | 模板标签走 locale | 行为一致 |

## 点击反馈（0–1 秒）

| 控件 | 0–1s 反馈 |
|---|---|
| 模板行 | `:active` 微缩；选中行 inset 描边；**已选中**再点无变化（SB： intentional no-op） |
| 持久化 | 同步写 `ritual-recipe.v1` + `focus-duration-pref.v1`；无 toast |

## 边缘状态

| 状态 | 预期 |
|---|---|
| 当前配方非官方（将来 A2 自定义） | 四行均无选中态；点官方行覆盖为官方模板 |
| 选 Default | 与空存储 Default 坐一致 |
| Focusing 中 | Compass 通常不可开；不专门改 HUD |

## 共用机制核对

- **overlayBusy**：Compass 已登记；本刀不新增 z≥17 层。  
- **结论**：不新增 overlayBusy 消费者。  
- **后台网络**：不涉及。

## 验收

- `node --test src/core/ritualRecipe/*.test.js` 绿  
- Default 坐 + 选 Deep 再开坐：`resolveSittingSessionPlan` → `source=official`、45m、音效 id  
- first-run Compass 无坐法块  
- `npm run test:payment-contract` 绿（未动受保护路径，仍跑）

## 开工闸

PO 2026-10-29 书面【同意】先 A4 — 本 Brief 视为已锁。
