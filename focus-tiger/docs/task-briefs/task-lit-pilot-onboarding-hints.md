# Task Brief · Lit 试点：OnboardingHintsUI

**日期**：2026-07-21  
**状态**：目标已拍板 · **代码已落地（2026-07-21）** · 待人工复测  
**所属路线**：`ARCHITECTURE.md`「工程加固四步」· 步 4  
**实现**：`lit` 依赖；`src/ui/ft-onboarding-hint-bubble.js`；`OnboardingHintsUI` 装配 API 不变。

---

## 一句话目标

将分散式提示 UI（气泡 + 左下角「?」）渐进改为 **Lit Web Component**，用响应式属性切断「Store/场景变了、DOM 气泡没跟上」类 bug；**行为与文案契约不变**，迁完测通再决定是否扩到其它 UI。

---

## 已好清单（不变量 · 改前必守）

1. **即时提示**：`syncVisibleAutos(ids)` 只显示当前场景自动提示；已读的不自动再出。  
2. **点 ? 补救**：须同时出现元文案（`help-remedy` / affordance）+ **本页全部**控件锚点提示（Sit / How shall we sit? / Rise / Sound 等，随场景）；点单气泡只关该条、不记已读（补救集）。  
3. **help-affordance**：首次可见时在「?」旁；尖角须对准「?」圆心（窄屏 clamp 后亦须对准）。  
4. **锚定**：气泡跟 `HINT_ANCHORS` 定位；窗口 resize / 布局切换后 `repositionAll` 仍贴锚。  
5. **locale**：切 `en` / `zh` 气泡文案跟着 `HINT_LOCALE_KEYS` 刷新。  
6. **Store**：仍用 `OnboardingHintsStore` / `focus-tiger.hints-seen.v1`；DEV「清空引导提示已读」仍可用。  
7. **装配**：`main.js` 仍只调现有公开方法（`syncVisibleAutos` / `markSeen` / `maybeShowAuto` / `repositionAll` 等），**禁止**为 Lit 重写 Gate / Emotion / Sit 路径。

## 保护面（本次不改、须复测）

- `SessionUiGate` / Companion / Arrival / Sit·Rise 门闩行为  
- Emotion / Idle 序列  
- Honesty / Reflection 叠层 z-index 与 hint 是否互相遮挡（人工看一眼即可）

## 契约锁法

| 契约 | 锁法 |
|---|---|
| `resolveRemedyHintIds(scene)` 含控件锚点 id | 既有 / 增补 `OnboardingHintsStore.test.js` |
| 未 seen 的 auto id → 应出现对应气泡 | 单测纯函数优先；DOM 层 TEST_TRACKER 人工 |
| 点 ? → 补救集非空且含 `help-remedy` | 单测 + TEST_TRACKER 分列行复测 |
| 尖角对准 | **仅人工**（观感分列行） |

---

## ✅ 本任务要做

1. 引入 **`lit`（npm 依赖，Vite 已有，不加重构建链 / 不加 TS）**。  
2. 将 `OnboardingHintsUI` 气泡层改为 Lit 组件（建议：`ft-onboarding-hint-bubble` 单气泡 + 宿主类保留装配 API，或一个 host 组件管理列表——实现时选侵入最小者）。  
3. 可见 id 集合 / 文案 / placement 走 **reactive properties**；禁止在业务路径手写「忘了 append / 忘了 remove」的分叉而不走统一 render。  
4. 保留 `OnboardingHintsStore.js` 为纯逻辑（不 Lit 化）。  
5. 更新 `TEST_TRACKER`：既有 Onboarding / help 相关行步骤与试点一致；状态「待人工测试」。  
6. 收尾跑 `npm run test:smoke` + `npm run test:e2e`；观感行须人工。

## ❌ 本任务明确不做

- ❌ Companion / Arrival / FocusHUD / Emotion / Idle 任何 Lit 化  
- ❌ 全仓 Web Components 化或引入 React/Vue  
- ❌ 改 hint 文案语义（除非发现与 `ONBOARDING_HINTS.md` 冲突的笔误）  
- ❌ 为尖角算法做「全新设计」——继承现有定位逻辑，只换渲染壳  
- ❌ Big Bang：一次删光旧类却无回流验收

---

## 验收（产品 / 人工）

见 `TEST_TRACKER`：

- `分散式即时提示 + 「?」补救`  
- `人工 · help-affordance 尖角对准 ?`  
- `人工 · 点 ? 补救展示本页全部 hints`  

主路径 + 回流（关气泡后再点 ?；Rise 后再测 FOCUSING 场景的 ?）。

---

## 风险与回退

- Lit 体积与首屏：仅 hints 用；若验收失败，回退到提交前原生 DOM 实现（单 commit 可逆）。  
- 工作区若仍有 Onboarding WIP：开工前先整理进基线或显式纳入本 Task，禁止半改半迁。
