# Task Brief · ⋯/抽屉打开时收起 Idle 下层选择格

**Issue**：[#773](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/773)  
**Epic**：#627 Sit & Breath  
**口令**：新 Chat **「开工」**（本 Brief 锁定范围；禁止顺手改 Confide 生成）

## 背景

2026-09-15 Electron QA：Companion 三选展开后再开 ⋯，三选仍露在菜单外。根因：`openMenu` 不 `hide` picker；`onClearStage` 只在点菜单行时跑。

## 不做

- 新 EventBus /「任意模态打开就清空浮层栈」
- 长按空白清空全部（`PRINCIPLES` 菜单逃生舱已禁）
- 关掉 SB-19 卡（Confide / Privacy / Stay in touch / Tea / Sanctuary）
- 破坏 Quiet Line / Wallpapers：`clearStage` 误关 growth 卡（#533）

## 做

1. 宽屏 `openMenu` 与窄屏抽屉打开走**同一条** Idle visual-primary dismiss（与现有 `onClearStage` 同族，可抽 helper）。
2. 至少收：Companion 三选。扇出 2–7 项（时长 chip、冷启动四选、Ground 二选、Arrive 金句卡、Leave-a-trace 条、`?` 简介）能收则收进同一 helper，收不到的在 PR 里逐项写「测了 / 设计保留」。
3. 单测：`openMenu` → picker 关闭。growth 门闩回归锁仍绿。

## 共用机制核对

- **overlayBusy / HUD**：开菜单收三选后 companion 不再占 visual-primary；hints 仍走现有 `onMenuChange`。不改 overlayBusy 公式本身。
- **Esc**：仍只关最上一层（菜单在栈顶时 Esc 关菜单，不连带清 Confide）。

## 验收

见 #773。人工：5173 对齐 `origin/develop` tip 后复测图1路径 + Quiet Line 从菜单打开不闪没。
