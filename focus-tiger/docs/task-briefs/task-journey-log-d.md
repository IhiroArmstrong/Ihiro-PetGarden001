# Task Brief · D′ · Journey Log（应用内 · Tea Log 模式）

> **状态（2026-08-09）**：**实现中**（`feature/journey-log`）。  
> **父决策**：`task-five-moments-surface-plan.md` §四。  
> **澄清**：这是 **本地 Journey Log**，**不是** HealthKit / Health Connect；壳期系统健康写入仍 Backlog。

## 目标

用户在完成「有头有尾」的练习后，能在应用内看到一条安静留痕——回顾时感到这是一次正念旅程，而不只是分钟数。

## 范围

1. **Store**（镜像 Tea Log 精神）：  
   - key：`focus-tiger.journey-log.v1`  
   - `entries: { at, minutes, arrive: boolean, reflect: boolean }[]`  
   - 上限约 30；新在尾、UI 展示最近若干条 reverse  
2. **写入时机**：Focus（或产品认定的等价完成）结束且 Reflection 流关闭后（含跳过）；根据本场是否走过 Arrival / Reflection 置位。  
3. **UI**：⋯ / 抽屉「Journey log」轻面板（推荐，与 Tip Jar 语义分离）；列表观察式一行，例如：  
   - EN: `{date} — {n} min · arrived & reflected`  
   - 缺 arrive/reflect 时降级：`{n} min · focus`（仍观察式，不评判）  
4. **DEV 重置**：纳入 `clearAllFocusTigerLocalState` / `localStateKeys`。  
5. 单测：append / cap / 标志位；不强制首版 e2e（可 changed 单 spec）。

## 不做

- 写入 Apple Health / Health Connect  
- 把 Journey 塞进 Tip Jar Tea Log  
- Recover / Transition 默认入账  
- 教导式 / 成就狂欢文案  

## 验收

- 主路径：完整 Sit→Arrival→Focus→Rise→Reflection → ⋯ 见新条目含 arrived & reflected。  
- 回流：仅 Focus 无 Arrival（若产品路径允许）→ 条目无 arrive 或按 Brief 降级文案。  
- 刷新后仍在；超过上限裁旧。  
- 与 tip-jar **零耦合**。

## 文档

- `SHARED_RESOURCES`  
- `ARCHITECTURE` 一句：Journey Log ≠ HealthKit Phase 1  
- `PRODUCT_MOMENTS` §5.6  
- `TEST_TRACKER`
