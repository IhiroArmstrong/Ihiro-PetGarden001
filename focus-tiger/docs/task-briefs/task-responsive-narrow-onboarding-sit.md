# Task Brief · 窄屏 Onboarding 互斥 + Sit 主 CTA 不截断

**日期**：2026-07-21  
**状态**：目标已拍板 · **代码已落地（2026-07-21）** · 待人工复测  
**角色**：UI Engineer  
**权威**：`RESPONSIVE_LAYOUT.md` 原则 A / 原则 B · P1 清单 §2 第 1–2 条  
**排期依据**：用户 2026-07-21 书面同意单独立项（与横屏建议 UI 分拆）

**实现摘要**：

- `selectExclusiveAutoHintIds` + `AUTO_HINT_PRIORITY`（`OnboardingHintsStore.js`）  
- `OnboardingHintsUI.syncVisibleAutos` / `maybeShowAuto` 互斥；用户关掉后 `_promoteNextAuto`  
- 窄屏锚 `#btn-focus` 的 `above` → `right`  
- `CompanionModePicker` dock 加宽 + `#btn-focus` `white-space: normal` / 全宽

---

## 一句话目标

在 **320–899px** 手机浏览器（竖屏为主、横屏须不退化）下：**同一时刻最多 1 条自动 onboarding 气泡**；**Sit / Rise 主按钮文案完整可读**；核心路径可点、不被气泡永久挡住。

---

## 背景 / 问题

用户竖屏截图（`/?product=1`）可见：

1. 多条 hint（Sit、Music、How shall we sit?、help-affordance 等）**同时叠在底部**，挡主 CTA。  
2. `#btn-focus` 显示 **「Sit w…」** 截断。  
3. 违反 `RESPONSIVE_LAYOUT.md` P1：主 CTA 可读 + 自动气泡互斥。

---

## 已好清单（不变量）

1. **桌面宽屏（≥900px）**：现有 hint 锚定、help-affordance 尖角对准「?」、侧面「Or begin from here.」等已验收行为**不退化**。  
2. **点 ? 补救**：仍须本页全部 hints + 用途简介卡；补救集**不受**自动互斥限制（但单条仍须不永久挡唯一出口）。  
3. **门闩**：`SessionUiGate` / Sit·Rise / Companion / Arrival 逻辑**不改**；仅布局与 hint 调度。  
4. **文案语义**：`ONBOARDING_HINTS.md` / locale 键语义不变（允许新增窄屏短文案键若需）。  
5. **Lit 试点**：`ft-onboarding-hint-bubble` 保留；改调度与 CSS，非全量重写。

## 保护面（须复测）

- Sit 不误开 Honesty（z-index 抢点）  
- Rise 后再进 Idle hint  
- Sound FAB 在窄屏仍可点  
- Arrival / Honesty / Reflection 底栏唯一出口不被挡死

---

## ✅ 本任务要做

### A. 自动 hint 互斥 / 串行（窄屏强制，宽屏可保持现状或同样受益）

1. `OnboardingHintsUI.syncVisibleAutos` / `maybeShowAuto`：在视口 `< 900px`（或始终）保证 **自动提示同时 `open` 的最多 1 条**。  
2. 优先级建议（高→低，后者排队或等关闭后再出）：`help-affordance`（首次 ? 旁）> 场景关键（如 `sit-button`）> 其它控件 hint；**禁止**多条同时盖住 `#btn-focus`。  
3. 排队策略：前一条用户 dismiss 或自动 hide 后，再显示下一条；或合并为「点 ? 查看全部」。  
4. 定位：窄屏下锚 `#btn-focus` 的 hint 优先 **left/right**，`above` 仅在不会挡 dock 时使用（继承 `honesty-optional` / `how-shall-we-sit` 侧面策略）。  
5. 可选单测：给定 id 列表 + 视口窄标记 → 同时可见 auto id 数量 ≤ 1。

### B. Sit / Rise 主 CTA 不截断

1. `CompanionModePicker` dock 宽度 / `#btn-focus` 样式：`min-width`、padding、`white-space`、必要时 `width: 100%` + 合法换行。  
2. 保证 **375px 竖屏** 下 EN「Sit with Yin」、ZH「与阿寅同坐」**完整可见**（实测两种 locale）。  
3. 若仍紧张：略缩字号或 `BTN_FOCUS_START_SHORT`（仅窄屏 `matchMedia` 切换），**禁止** ellipsis 截断主 CTA。  
4. dock 与 Sound FAB、`?` 三者布局：可减 `gap`、safe-area、调整 `width: min(...)` 公式（当前 `calc(100vw - 140px)` 评估是否过窄）。

### C. 文档与验收

1. 更新 `ONBOARDING_HINTS.md` 窄屏互斥一句。  
2. `TEST_TRACKER.md` 新增/更新分列行（见下）。  
3. `npm run test:smoke` + `npm run test:e2e` 全绿后再声称完成。

---

## ❌ 本任务明确不做

- ❌ 横屏建议条 UI（另见 `task-responsive-landscape-suggest.md`）  
- ❌ 改 Emotion / Idle / 状态机  
- ❌ 每个 hint 单独做手机视觉精修（仅互斥 + 不挡主 CTA）  
- ❌ 竖屏 HUD 全面重设计

---

## 验收（人工 · 必测视口）

| 视口 | 路径 |
|---|---|
| **375×667 竖屏** | 清空引导已读 → 冷启动：同时可见自动气泡 ≤1；Sit 文案完整；可点 Sit 进 Arrival |
| **375×667 竖屏** | 回流：关气泡后再出现下一条；点 ? 仍见全部补救 hints |
| **667×375 横屏** | 同上主路径不退化 |
| **≥900 桌面** | 回归：尖角对准 ?、侧面 hint、Sit 不误开 Honesty |

`/?product=1` · 实验室「清空引导提示已读」。

---

## 契约锁法

| 契约 | 锁法 |
|---|---|
| 窄屏同时 auto open ≤ 1 | 单测 helper 或 `OnboardingHintsUI` 抽纯函数 |
| `#btn-focus` 在 375px 无截断 | TEST_TRACKER 人工 + 可选 Playwright `boundingBox` 文案检查 |
| Sit 可点 | e2e 已有路径；窄屏 viewport 用例可选追加 |

---

## 风险与回退

- 互斥过严导致用户看不到某条 auto hint → 保留 ? 补救全铺。  
- dock 变宽挤 Sound → 测 320px 极限宽。
