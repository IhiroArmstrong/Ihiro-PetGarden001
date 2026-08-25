# Task Brief · Presence Signals · Slice 2（Ritual Leave 弱提示 · 方案 C）

> **状态（2026-08-26）**：**开工**（`feature/presence-signals-slice-2`）  
> **口令**：「开工 Presence Signals Slice 2 — Ritual Leave 弱提示，方案 C」  
> **前置**：Slice 3 #436 · prune helper #440 · Brief #439

---

## 做什么

1. **Leave 时静默记账**：Leave 动作瞬间**不做任何 UI 提示**；已选 chip 照常 append 到 `presence-signals`（`ritual_chip` + `emotionTag`），前端保持「退出即退出」。
2. **标记未完成**：写入时额外标记该次 Ritual 为「未完成」（如 `completed: false` 或复用仓库既有完成态字段——**字段名按既有命名**）。标记仅用于回顾判断；**仍按已选 emotionTag 计入趋势样本**。
3. **下次同类型 Ritual 开场软性回顾**（Yin 出场时，选 chip 之前）：
   - 条件：存在「最近一次**同 ritualId** 未完成且已选 ≥1 chip」的记录。
   - 形式：延续 Arrival/Notice 气泡风格；非阻塞、无需确认、自然淡出。例：「上次你选了 xxx，后来提前结束了。」
   - **每条未完成记录只回顾一次**——触发后标记「已提及」，第三次进入不再念叨同一条。
   - **不交叉判断** Reflection 等其他场景；范围仅限「同类型 Ritual 的上一次未完成记录」。

## 不做

- Leave 当下任何确认/提示 UI
- 跨 Ritual 类型关联回顾（Emotional Reset 未完成不在 Morning Ritual 提及）
- 改动 Slice 4 趋势 / breakdown 规则
- 查看/删除 UI（Slice 6）

## 实现注意

- **`ritual-completions.v1` 不扩展**：完成轨迹仍仅 `recordCompletion` 写入；未完成 **只**进 `presence-signals`（`ritualCompleted:false`），两套存储职责分离、无字段合并。

## 验收

1. Leave 后查 `presence-signals`：chip 已记账且标记未完成。
2. 同类型 Ritual 第二次进入：见回顾气泡；第三次进入：不再重复上一条。
3. 完整走完 Ritual（未 Leave）：不产生未完成标记、无回顾内容。
4. 趋势：`emotionTag` 计数与 Slice 4 规则不变。
