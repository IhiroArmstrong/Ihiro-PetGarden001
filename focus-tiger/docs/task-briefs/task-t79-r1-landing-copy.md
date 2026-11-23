# Task Brief · T79-R1 PR1 落地屏标题/文案/按钮主次

> **状态（2026-11-23）**：**Brief 已点头**（随 T79-R1）。**实现本 PR**。  
> **类**：**B**。  
> **前置**：父 Brief [`task-t79-r1-sit-landing.md`](./task-t79-r1-sit-landing.md)。  
> **不是**：sit 步、HUD、成长账本、`_goLanding('')` 改道、删接地通路。

---

## 0. 大白话

提前结束或坐完之后的落地屏：标题改成「回到当下」，句子变短，主按钮只是完成。想接地再点次按钮。

---

## 1. 改动

1. 落地标题三语（见 §文案）。  
2. 缩短 `CI_EX1_LANDING`；去掉预设不适长句。  
3. 主按钮完成/关闭（只 `close()`）。次按钮感受地面：现有 `onLand` → `groundExerciseChoiceUI.open()`。  
4. 不改 sit、感受四选项、记忆键、成长写入、HUD。

## 文案（PO 2026-11-23 定稿）

| | 标题 | 正文 | 主按钮 | 次按钮 |
|---|---|---|---|---|
| zh | 回到当下 | 回到这里就好。想的话，可以三次呼吸，或感受脚下。 | 完成 | 感受地面 |
| en | Coming back | Come back to right here. If you like, take three breaths, or feel your feet on the floor. | Done | Feel the ground |
| ja | いまここへ | ここに戻ってきました。よければ、三回呼吸するか、足の裏の感覚を感じてみてください。 | 完了 | 地面を感じる |

Exit B 前缀句（`CI_EX1_EXIT_B` / `CI_EX1_TRY_LATER`）保持原键，仍可叠在短落地文案之前。

---

## 2. 冲突扫描

落地从「必须走接地」改为「可选接地」。强度下降。职责：接地菜单仍可达。无冲突疑点。

---

## 3. 变体矩阵（A10）

| 变体 | 预期 |
|---|---|
| en/ja/zh | 上表 |
| 提前结束 | 落地；无感受四选项 |
| 坐满后选前三 | 点头姿态后落地，同一标题/按钮 |
| 第四选项 | Exit B 句 + 短落地 + 同一按钮 |

## 4. 点击反馈（A14）

| 控件 | 0–1 秒 |
|---|---|
| 完成 | 卡收 |
| 感受地面 | 卡收，Ground 选择层 |

## 5. 边缘状态（A14）

付款叠层不改 z。完成不写账本。

## 6. 共用机制

不新增 overlay 行。建议 `e2eOverlap` / `trackerCoverage` 指向本刀 spec。HUD / overlayBusy 不动。

## 7. 已好清单

sit 画面、独立墙钟、提前结束 `_goLanding('')`、第四选项 Exit B、正式专注账本。

## 8. 验收

- 三语文案入库。  
- 单测：early end still lands；`contemplative-inquiry-done` 为主；`contemplative-inquiry-land` 为次且仍 `onLand`。  
- e2e：提前结束→落地→完成；落地→感受地面→Ground 可达。  
- overlay-contract 过。  
- 无 diff 触及成长账本相关文件（lotus / practice-days / focusCoinsAward 等）。
