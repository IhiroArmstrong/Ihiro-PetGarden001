# Task Brief · A2 编辑「我的配方」（Ritual Recipe 阶段 1）

> **状态（2026-10-29）**：**PO 已点头 · 开工**（书面同意 A4 合 develop 后开 A2；变体矩阵 + 点击反馈已锁于本 Brief）。  
> **类**：**B**（Compass 新增可点编辑区；改 `ritual-recipe.v1` 与 Focus chip 偏好）。  
> **依赖**：A1b [#1469](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1469) · A4 [#1471](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1471) 已合 develop。  
> **真源**：[`RITUAL_RECIPE_A1_SPEC.md`](../RITUAL_RECIPE_A1_SPEC.md) §3 / §7 · [`task-ritual-recipe-phase1.md`](./task-ritual-recipe-phase1.md)。

## 一句话

在 **Five Moments Compass**（非 first-run）里微调当前坐法：Focus 时长/open、整场 `soundId`、各段 `promptId`；官方模板须先 fork 为 `authorType=user`；逐段 / 整份恢复 Default sitting；**无** Recover 滑杆。

## 范围（in）

- `ritualRecipeUserEdit.js`：fork 官方 → 用户配方、字段 patch、逐段 / 整份恢复 Default sitting、同步 `focus-duration-pref.v1`、opt-in 时 `recipe_edited` / `recipe_reset_default`。
- Compass 卡片：**Tune my sitting** 区块（Focus chip 行、音效下拉、四段 prompt 下拉、段内 Reset、整份 Reset）。
- 白名单内 `promptId` / `soundId`；`roomId` v0 仅 `room.default`（只读展示或省略单独控件）。
- 自定义后官方四行模板 **无选中态**（沿用 A4 `resolveOfficialTemplateIdForRecipe`）。

## 范围（out）

- **A1c** 运行时 prompt 池接线（仍 null 降级）。  
- **A3** 导入导出 / 分享。  
- Recover `cooldownSec` 编辑、Recover 文案。  
- 开坐前 chip **仅本场** 覆盖 UI（仍不写回配方）。  
- Support / 付款 / 练习备份。

## 冲突扫描

| 轴 | 判断 |
|---|---|
| **a. 强度** | 编辑区在已有 Compass 内；不新增全屏层。 |
| **b. 语气** | 观察式标签（分钟数、音效名、Default 引导）；无监工腔。 |
| **c. 职责** | 写配方 + chip 偏好；Sit 时 chip 本场覆盖规则不变（A1b）。 |

**结论：无用户路径冲突**（相邻：A4 模板选型、场景 T Focus chip、Ambient 开坐播）。

## 变体矩阵

| 变体 | 入口 | 预期 |
|---|---|---|
| 宽 / 窄 | Compass 同 DOM | 编辑区可滚动；控件可点 |
| first-run Compass | 无坐法块 | **隐藏**模板 + **隐藏**编辑区 |
| 官方模板选中 | 四行之一高亮 | 改任一编辑项 → fork 为 user，模板行失选 |
| 已 custom | 四行无选中 | 编辑反映 storage；Reset all → Default sitting |
| en / zh / ja | 标签走 locale | 行为一致 |
| Focus `open` | Open 钮 | 与 fixed chip 互斥；同步 open-ended pref |

## 点击反馈（0–1 秒）

| 控件 | 0–1s 反馈 |
|---|---|
| Focus chip / Open | `:active` 微缩；选中 inset 描边；**已选中**再点无变化（SB： intentional no-op） |
| 音效 / prompt `<select>` | 变更后立即写 storage；无 toast |
| 段 Reset | 该段字段回 Default sitting；按钮 `:active` |
| Reset all | 整份 Default sitting + 官方模板 Default 等价；四行 Default 选中 |

## 边缘状态

| 状态 | 预期 |
|---|---|
| 在 Deep 官方模板上改 Focus | fork 为 user，Deep 行失选，开坐 `source=custom` |
| 非法 storage | normalize 后仍可编辑 |
| Focusing 中 | 不专门改 HUD；Compass 通常不可开 |

## 共用机制核对

- **overlayBusy**：Compass 已登记；本刀不新增 z≥17 层。  
- **结论**：不新增 overlayBusy 消费者。  
- **后台网络**：不涉及。

## 验收

- `node --test src/core/ritualRecipe/ritualRecipeUserEdit.test.js` 及既有 `src/core/ritualRecipe/*.test.js` 绿  
- fork 官方 + 改 Focus → `resolveSittingSessionPlan` → `source=custom`  
- Reset all → `isDefaultSittingRecipe` true  
- `npm run test:payment-contract` 绿  
- 单条 e2e：Compass 见 `[data-testid=ritual-recipe-edit]`，改 Focus chip 后 storage 变 user

## 开工闸

PO 2026-10-29 书面【同意，点头】— 本 Brief 视为已锁。
