# Task Brief · B · Five Moments Compass（罗盘指南）

> **状态（2026-08-09）**：实现中 · `feature/five-moments-compass`。  
> **父决策**：`task-five-moments-surface-plan.md`  
> **一次一任务**：本 Brief **仅 B**；不含 Whisper / Journey Log。

## 目标

让用户能**自愿**看见完整 Five Moments 地图：Arrive → Focus → Recover → Transition → Reflect——不强迫、不做 coachmark 步进。

## 范围

1. **⋯ / 窄屏抽屉** 增加一行：`The 5 Moments`（i18n；观察式副文案可选一行）。  
2. 点击打开 **Compass Sheet / 卡**：一张美感卡片（首版可用静态五态插图或现有 PNG 静帧拼贴；**不要求**首版五态动画成片）。  
3. 文案锁方向（EN 示意，定稿进 locales）：  
   > Focus Tiger isn’t only a timer. It’s five gentle companions across a day: Arrive → Focus → Recover → Transition → Reflect.  
4. **可跳过首卡**：产品壳首次打开后，在合适安静点（建议：首次 Idle 且尚未 Sit，或首次 Sit 完成回到 Idle）展示 **一次** Compass 卡，提供 Skip / Got it；记入 `focus-tiger.five-moments-compass-seen.v1`（或并入 hints-seen 专用 id——实现时二选一，须写进 SHARED_RESOURCES）。  
5. **「?」简介预留钩子**：本任务可只在 purpose body **追加一段** Moments 链名；完整「打开 Compass」次要链可本任务做完，或留给 A′——**优先本任务做完次要链**，避免 A′ 再改 purpose 两次。

## 不做

- 常驻 5-Dot 顶栏  
- 自动每 Moment 弹 Banner  
- HealthKit  
- 修改 Arrive / Focus / Reflect 状态机逻辑  

## 验收

- 主路径：`?product=1` → ⋯/抽屉 → The 5 Moments → 见卡 → 关。  
- 回流：关后再开；Rise 后再开。  
- 首卡：清存储后出现一次；Skip 后不再出。  
- 「?」→ 简介含 Moments 一句 + 能进同一 Compass（若本任务接线）。  
- 375 可滚可关；不挡 Sit 主路径。  
- 单测：seen 门闩；可选 e2e changed 单 spec。

## 文档

- `PRODUCT_MOMENTS` §5.6 B 勾「实现中/已合」  
- `TEST_TRACKER` 新行  
- `SHARED_RESOURCES` 新 key  
- `Z_INDEX` 若新 Sheet
