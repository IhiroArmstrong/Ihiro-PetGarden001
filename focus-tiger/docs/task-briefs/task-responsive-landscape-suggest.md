# Task Brief · 竖屏横屏建议 UI

**日期**：2026-07-21  
**状态**：已立项 · **待开发**（响应式路线 **Task 2**；**须在 Task 1 窄屏互斥 + Sit 截断验收后开工**）  
**角色**：UI Engineer  
**权威**：`RESPONSIVE_LAYOUT.md` §6.4 · 原则 B  
**排期依据**：用户 2026-07-21 书面同意排入下一 UI Task

---

## 一句话目标

在 **竖屏窄屏**（`narrow` + `orientation: portrait`）且未 dismiss 时，显示**温和、可关闭、不阻塞操作**的横屏建议条；用户坚持竖屏仍可完成全流程。

---

## 已好清单（不变量）

1. Task 1 交付的互斥 + Sit 不截断**须已验收**（本 Task 不替代 P1 修复）。  
2. **不强迫**横屏：无 modal 挡操作、无重复轰炸、无「你没横屏所以失败」叙事。  
3. 不占 Honesty / Mindful 提醒共享额度池。  
4. 宁静型游戏化：一次性或可关，align `PRINCIPLES.md`。

## 保护面

- 与 onboarding 气泡、help-affordance、session-start-dock 不互挡  
- 旋转至横屏后建议条自动隐藏或不再出现

---

## ✅ 本任务要做

### 1. 触发条件（须同时满足，可微调但须写进代码注释）

- `matchMedia('(max-width: 479px)')` 或项目 `narrow` 断点  
- `matchMedia('(orientation: portrait)')`  
- 本地持久化未 dismiss（见下）  
- 可选启发式：底部 chrome 拥挤（dock + ? + FAB 占位超阈值）— **非必须 v1**

### 2. UI

- 非 modal **条/气泡**（建议顶部或 HUD 下缘），观察式文案。  
- 关闭按钮或「知道了」；dismiss 后写入 localStorage（例 `focus-tiger.landscape-hint-dismissed.v1`）。  
- z-index：低于 blocking overlay，高于背景；**不挡** `#btn-focus` / `?` / Sound FAB。

### 3. i18n

新增 locale 键（示例 id，实现时定稿）：

- `HINT_LANDSCAPE_SUGGEST_BODY`  
  - EN（观察式）：*A wider view may feel easier here—you can turn your phone sideways.*  
  - ZH：*横屏看可能会更舒展一些，你可以试着把手机转过来。*  
- `HINT_LANDSCAPE_SUGGEST_DISMISS`：Got it / 知道了

### 4. 行为

- 竖屏进入满足条件 → 显示一次（每设备 dismiss 前仅自动出现一次，或每次会话最多一次——**v1 推荐 dismiss 前仅一次自动**）。  
- 用户转横屏 → 隐藏。  
- 再转竖屏：若已 dismiss 不再自动出。

### 5. 文档与验收

- `RESPONSIVE_LAYOUT.md` §6.4 标「已实现」  
- `TEST_TRACKER.md` 分列行  
- smoke + e2e 全绿

---

## ❌ 本任务明确不做

- ❌ 强制横屏（screen orientation lock API）  
- ❌ 未 dismiss 时阻塞 Sit / Arrival  
- ❌ PWA / 安装引导  
- ❌ 再次修 onboarding 互斥（属 Task 1）

---

## 验收（人工）

| 步骤 | 期望 |
|---|---|
| 375×667 竖屏、未 dismiss | 见建议条；可关；Sit 仍可点 |
| dismiss 后刷新竖屏 | 不再自动出现 |
| 转横屏 | 条消失 |
| ≥900 桌面 | 不出现 |
| Task 1 窄屏主路径 | 仍全绿 |

`/?product=1`；DEV 需提供清除 dismiss 标志方式（实验室按钮或 `localStorage` 文档化）。

---

## 契约锁法

| 契约 | 锁法 |
|---|---|
| dismiss 持久化 | 小单测 store helper |
| 横屏不出现 | `matchMedia` 单测或 TEST_TRACKER 人工 |
| 不挡 Sit | TEST_TRACKER + 可选 Playwright narrow viewport |
