## 标题前缀（必填）

请在 PR 标题前加 **`[UI]`** 或 **`[Logic]`**（二选一）：

- **`[UI]`** — 布局、样式、文案、动画观感、响应式
- **`[Logic]`** — 状态机、Store、门闩、计时、纯逻辑重构

示例：`[UI] 窄屏 Sit 按钮不遮挡热力图`

---

## 截图（必填）

请附 **至少两张** 截图（拖拽到本描述即可）：

| 视口 | 要求 |
|---|---|
| **桌面宽屏** | 全页或主要改动区域 |
| **375px 窄屏** | Chrome DevTools 设备模式或真机；若本次改动与窄屏无关，写一句 **「不涉及窄屏」** 并说明原因 |

---

## Hints 批次（触及 onboarding tip / registry / 接线则必填）

> 权威：`focus-tiger/docs/HINTS_WIRING.md` · 库存硬闸：`npm run hints:doc-check`

- [ ] **未**改 hint id / 锚点 / `triggerMode` / 自动出 tip 逻辑 → 勾此项并跳过下面
- [ ] 本次属于批次簇：**A**（Dock/Sit） / **B**（Arrival/Companion） / **C**（Ambient/次要） / **D**（Focus HUD/Rise） / **E**（Help） / **legacy** / **多簇**（写明）
- [ ] 若「单条 tip」小 PR：写明 **例外理由**（热修 / 文案-only / …）；否则应按簇一批改
- [ ] 已更新 `HINT_WIRING_BATCH_CLUSTER`（如有新 id）并 `npm run hints:doc-sync`

---

## 点击反馈（触及可点击交互则必填）

> 权威：`focus-tiger/docs/INTERACTION_FEEDBACK_PRINCIPLES.md` · 白名单：`focus-tiger/docs/SILENT_BEHAVIORS.md`（`RULES_INDEX` → `interaction-feedback`）

- [ ] **未**新增或修改可点击控件 / 图标命中层 → 勾此项并写 **「不涉及可点击交互」**
- [ ] 若有：点击后 **0–1 秒内**用户会看到什么？________________
- [ ] 若本次按设计不生效：对应 `SILENT_BEHAVIORS.md` 的 **`SB-xx`**（不在白名单里的沉默视为 bug）

---

## 规则文件 / SSOT 数值（触及 `.cursor/rules/*.mdc` 则必填）

> 权威：`focus-tiger/docs/RULES_INDEX.md` · 一致性门禁：`npm run docs:check`（含 `check-docs-consistency`）

- [ ] **未**改任何 `.cursor/rules/*.mdc` → 勾此项并跳过下面
- [ ] 已 **grep 全仓库**搜索本规则涉及的关键数值/措辞，确认没有下游文档复述旧值（应改成路径指针引用 SSOT）
- [ ] 本地 **`cd focus-tiger && npm run docs:check`**（含数值复述一致性检查）已通过
- [ ] 若规则**数值**发生变化：已更新 `RULES_INDEX.md` 变更日志（**新记录置顶**；被取代的旧记录标注 **「已废止」**；勿以变更日志任意历史条作当前依据）

---

## 验收清单（请逐项打勾）

- [ ] 首屏能正常加载
- [ ] Idle / Arrival / Focusing 三个状态能正常切换
- [ ] 控制台没有新增报错
- [ ] 375 窄屏下没有明显溢出 / 遮挡

---

## 叠层 / 窄屏回归（触及则必勾）

> 权威：`focus-tiger/docs/Z_INDEX.md` · `TEST_TRACKER.md` 文首「`position: fixed` 全屏/半屏容器」

- [ ] **未**新增 / 大改 `position: fixed` 全屏或半屏壳 → 勾此项并跳过下面两行
- [ ] 若有：已更新 **`Z_INDEX.md`** 对应登记行（勿随手写未登记数值）
- [ ] 若有：已检查可能被盖住的既有浮层（Reminder 面板 / 提醒横幅 / tip / FocusHUD 悬停等），并为**每个受影响组件**补了 **375** e2e（不得只测新壳）

---

## 合入 develop 前自检（CI 绿即可合；人工测试非合入门闩）

> 权威：仓库根 `WORKFLOW.md`「feature/fix 合入 develop：研发自检 + 主干同步」（`RULES_INDEX` → `git-feature-merge-preview`）与「合入 develop：CI 绿即可合并」（`git-develop-small-pr-run-merge`）。关单只认合入后的 `origin/develop` tip。

- [ ] **研发冒烟**：已跑 `cd focus-tiger && npm run test:pr-smoke`（或文档/规则 PR 仅 `docs:check` / 豁免 Vite——见 `WORKFLOW.md`「预览豁免」）  
  **Vite 产品壳预览**不是合入前提；需要时给本地 Safari URL，但**不等**用户确认才开 PR。  
  文档豁免：`git diff --name-only origin/develop...HEAD` **不含** `focus-tiger/src/**`、`focus-tiger/public/**`、`focus-tiger/e2e/**`、产品入口 HTML、任意 `*.vue`（禁止「有个 .md 就算纯文档」；混有运行时路径 → 整 PR 不得豁免 Vite/冒烟）→ 勾此项并写豁免理由：_______________
- [ ] 合入前已按 `WORKFLOW.md` 跑过 **develop 同步判定**（`git diff --name-only origin/develop...HEAD` / `HEAD...origin/develop` + `comm -12`）：无需 rebase **或** 已 rebase/merge 并重跑冒烟
- [ ] **TEST_TRACKER**：UI 可见改动已登记「待人工测试」；**不会**因为本 PR 将合入就把状态改成已通过 / 已修复

---

## 冒烟测试

- [ ] 已在本地跑过 **`cd focus-tiger && npm run test:pr-smoke`**（逻辑冒烟 + 浏览器壳子集，约 2–4 分钟）
- [ ] （可选）合并前再跑完整套件：`npm run test:e2e` · `npm run test:e2e:visibility` · `npm run docs:check`

> CI：每次 PR→`develop` 都会上报 **`test:pr-smoke`**（无 `focus-tiger/**` 改动时为成功 no-op）与 **`pre-merge with develop`**。改产品代码时 smoke 含逻辑冒烟 + e2e smoke + **`npm run build` 产物检查**。完整 e2e / visibility / doc-contract 另触发。  
> **关单级人工验收**只认 `origin/develop` tip（见 `TEST_TRACKER.md`）——合入之后批量测；**合入资格 = CI 绿**。勿在长期落后的 feature 分支上关单。

---

## 改动摘要

<!-- 一两句话说明做了什么、为什么 -->

## 关联

<!-- Task / TEST_TRACKER 行号 / 用户反馈原文（如有） -->
