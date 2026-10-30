# Task Brief · A1c promptId 运行时文案池（Ritual Recipe 阶段 1）

> **状态（2026-10-30）**：PO 口令「立刻开工 A1c」· #1476 已合 develop。  
> **类**：**A**（无新界面；Default 坐引导不变；Deep/Evening 模板才换句）。  
> **依赖**：A1b · A4 · A2（#1476）已合 develop。

## 范围（in）

- `ritualRecipePromptBinding.js`：白名单 id → locale 键 / COPY_POOL；未接线 → null。
- `sittingSessionPlan.promptBinding` + `sittingSessionPromptHost.js` 场次绑定。
- Arrive welcome · Focus awareness 池 · Transition whisper · Reflect 三问 接线。
- 文案 slice：`ritual-recipe-a1c-prompt-bindings.json`（en/zh/ja）。

## 范围（out）

- spec 占位 id（`arrive.soft` 等）仍不接线。
- Recover 文案、A3 分享、新 Compass 控件。

## 冲突扫描

对照 Default 坐 / Arrival / Reflection 场景：**强度与职责不变**；仅官方 Deep/Evening（及用户选同 promptId）换观察式句。无冲突。

## 验收

- Default 坐：`promptBinding` 全 null；行为与改造前一致。
- Deep / Evening 开坐：对应 moment 出现 slice 文案。
- `node --test src/core/ritualRecipe/*.test.js` 绿。
