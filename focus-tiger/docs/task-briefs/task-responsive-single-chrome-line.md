# Task Brief · 窄宽屏合并为响应式单代码线

**日期**：2026-07-30  
**状态**：Brief 已写 · **可排期开工**（响应式路线 **Task 3**；**尚未开 feature / 未写业务代码**）  
**角色**：UI Engineer（Gameplay / Emotion **不**为本 Task 主改方）  
**权威**：`RESPONSIVE_LAYOUT.md`「工程债 · 窄宽屏单代码线」· 原则 A · `SHARED_RESOURCES.md` §6 · `DEV_WORKFLOW_QUALITY.md` §8 / §9 · `Z_INDEX.md`  
**排期依据**：用户 2026-07-25 拍板「值得合并」+ 触发条件（wide-idle 合入 develop、⑦ 场景 O 收口）已满足；2026-07-30 用户确认「安排 = 先 Brief、再开 feature」并授权写本 Brief。

**命名澄清**：本文件 = **响应式 Task 3**。勿与 `TEST_TRACKER` / 冒烟清单里其它「Task 3」（如 Honesty 真实补登 e2e 候选）混淆。

**当前实现落点（开工前基线）**：

| 视口 | 壳 | 文件（约行数） |
|---|---|---|
| ≤479 | ActionBar + 主画布三球 + 上滑抽屉 | `src/ui/NarrowIdleShell.js`（~1240） |
| ≥480 | Sit + ⚡ + ⋯ Popover | `src/ui/WideIdleMoreMenu.js`（~510） |
| 接线 | 两套均在 `main.js` 实例化；窄/宽互为 inert | `src/main.js` |

---

## 一句话目标

把 Idle chrome 的**入口编排、显隐/suppress、代理点击与 Hints remap**收成**断点驱动的一条业务线**；抽屉 vs ⋯ 只保留**交互范式差**（呈现适配器），禁止再靠两条长期并行实现（或姊妹分支）各自修同一套 audio / Sit / Honesty 行为——从结构上消掉分叉漏修。

---

## 背景 / 问题

1. **分叉漏修已发生**：`feature/wide-idle-more-menu` 曾与窄屏线长期并存，宽屏复现窄屏已修过的同类 bug（Sound FAB 代理、Honesty 从菜单消失、开机自动播、Rise 不停音乐、点外侧不关面板等）。见 `DEV_WORKFLOW_QUALITY.md` §6.6 / `WORKFLOW.md` 姊妹分支同步纪律。  
2. **产品意图已清晰**：窄 = 抽屉；宽 = Sit+⚡+⋯。差的是壳形态，不是两套状态机。  
3. **触发条件已齐（2026-07-29 核实）**：wide-idle 内容在 `develop` 祖先链（空壳分支已删）；⑦ 场景 O（375）相关修多已收口进 develop。此前 Brief 未写，故 Task 一直停在「待写 Brief」。  
4. **仍须独立排期**：本重构**不得**与未验收的同文件 chrome 修叠在同一 feature 批里硬干；开工前建议在 `origin/develop` tip 快速过一遍 §9 W1–W8 作基线（可与本 Task 验收分开记账）。

---

## 已好清单（不变量 · 改前必守）

下列在重构前后**观感/行为不得无故退化**；写不进单测的进 `TEST_TRACKER` 分列必测。权威细节以表内文档为准。

1. **断点语义**：`max-width: 479px` = 窄壳；`≥480` = 宽清场。桌面拖「最窄」常仍 ≥480 → 须继续显示 Sit+⚡+⋯，**不是**坏掉的抽屉（`RESPONSIVE_LAYOUT.md` §4.1）。  
2. **窄屏 Idle 形态**：ActionBar（? · **本机墙钟** · ♪）+ 主画布三球顺序 **Quick Start · Sit · Honesty** + 上滑抽屉（呼吸 / How / Sound→Soundscape 面板 / Reminder + 7 格只读）；抽屉**不含**三主钮。  
3. **宽屏 Idle 形态**：常驻 **Sit + ⚡ + ⋯**；Honesty / 一分钟呼吸 / How / Sound FAB / 提醒进 **⋯ 向上 Popover**；左下 `?` + 热力图**不**进清场。  
4. **Arrival**：窄 — 仅 ⚡ 可见（`ft-narrow-stage-arrival-quick-start`），Sit/How/Honesty park；宽 — Sit 与 ⋯ 收，⚡ 仍可见。Breath / Inhale 全程 Sit（与 ⋯）不得中途露回。  
5. **Focusing**：窄 — 藏主球+grabber，ActionBar 常显墙钟，`#focus-hud` 会话计时；宽 — ⋯ 隐藏，FocusHUD 可读。  
6. **微仪式进行中**：Sit 不可用（宽 `#btn-focus:disabled` / 窄主球不可见等，见 visibility 契约 `micro-ritual-sit-unavailable`）。  
7. **双壳共享契约**：`SHARED_RESOURCES.md` §6 机器块（`visibilityContractRegistry.js`）+ 非显隐类（Hints remap、FocusHUD vs ActionBar）。改一侧必须勾另一侧。  
8. **邻接可点物**：点 tip 只关 tip、不关 Notice/Choose/Companion；点空白外侧取消仪式；⋯ / 抽屉打开时点外侧只收菜单/抽屉（`DEV_WORKFLOW_QUALITY` §8 N18 / §9 N22）。  
9. **Ambient 口径**：opt-in 不默认播；Rise / 达标结束停播；右上音符与菜单 Sound **同效开 Soundscape**（若仍有「有问题」行，本 Task **不**借机改产品语义，只保证代理不丢）。  
10. **门闩 / 状态机**：`SessionUiGate`、Arrival、Companion、Honesty、Reflection、Emotion / Idle 编排**不因本 Task 改语义**；只改 chrome 宿主与代理。  
11. **序列观感**：Idle 呼吸→眨眼 cross-fade、CapCut 叠化等**禁止**本 Task 顺手重写。  
12. **z-index**：新/改 fixed 壳须登 `Z_INDEX.md`；Narrow 壳 ~30、Wide More 面板 ~20 等既有对抗 Ambient(22) 的关系不得 silently 倒挂。

## 保护面（本 Task 范围外、仍须复测）

- 场景 A–P 主路径（至少 chrome 相关：A Arrival、O 热力图、P 提醒）  
- Honesty 桥接 Yes → Arrival；桥接期入口显隐  
- Choose 鞠躬后 Companion 三选一进视口（窄已锁 `toBeInViewport`）  
- Onboarding `?` 补救全铺与 tip 锚点 remap  
- 既有 e2e：`wide-idle-more-menu.spec.js`、`weekly-practice-heatmap.spec.js`、`scenario-a.companion.spec.js`、`micro-ritual.spec.js`、visibility 套件

---

## ✅ 本任务要做

### 阶段 0 · 开工门禁（Brief 执行前，可同日短回合）

1. 从 `develop` 切出 **`feature/responsive-single-chrome-line`**（名称可微调，须 ASCII kebab-case）。  
2. `npm run check:branch-freshness`；汇报落后数。落后 > 0 先合入/变基，再动代码。  
3. （建议）在 tip 上对照 §9 **W1–W8** 快速自检并记入本 Task 的 `TEST_TRACKER` 行「基线备注」——**不**与其它修混验关单。  
4. 列出当前 `NarrowIdleShell` / `WideIdleMoreMenu` 的 **入口清单对照表**（Sit / ⚡ / Honesty / How / Sound / Reminder / Help / 微仪式 / 热力图）写入 PR 或 Brief 附录，作为合并核对单。

### 阶段 1 · 共享编排（优先，可先不换 DOM）

1. 抽出**纯函数或小模块**承载双壳共用决策，例如（名称实现时定稿）：  
   - 当前 chrome stage（idle / arrival / focusing / micro-ritual / honesty-busy / companion-staged …）  
   - 各角色 must hidden/visible/disabled（与 `visibilityContractRegistry` 对齐，勿另起第三套真源）  
   - 「次要入口」集合：进抽屉或进 ⋯ 的同一业务列表  
2. 两壳改为**消费同一编排结果**再映射到各自 DOM；禁止在两文件各写一份互相漂移的 if 树。  
3. 单测锁编排：给定 stage + viewport → 期望的角色可见性（契约级，非「调用了某方法」）。

### 阶段 2 · 单控制器 + 呈现适配器

1. `main.js` 收敛为**一个** Idle chrome 协调入口（或明确 facade），内部按 `matchMedia('(max-width: 479px)')` 启用窄/宽**呈现**：  
   - 窄适配器：现有抽屉 / ActionBar / 三球（可保留文件名作适配器）  
   - 宽适配器：现有 Sit+⚡+⋯  
2. **允许**暂留两个呈现文件；**禁止**两套独立的业务 suppress / 代理语义。  
3. 断点切换（拖宽/DevTools）：须 teardown/activate 干净，无双壳同时抢点、无残留 park class。  
4. 代理点击：Sound / Reminder / Honesty / How / Help / mute 等**一条实现路径**，适配器只负责「点谁」。

### 阶段 3 · 文档与验收锚

1. 更新 `RESPONSIVE_LAYOUT.md` 工程债节：标「实现中 / 已落地」与新模块路径。  
2. `SHARED_RESOURCES.md` §6：触发路径表改指向新模块（若文件合并/重命名）；机器块仍以 registry 为准，跑 `visibility:doc-sync`。  
3. `Z_INDEX.md`：若层级有变，先改表再改代码。  
4. `TEST_TRACKER`：新增本 Task 分列行（见下）；步骤须含 **§8 375 故事最小集 + §9 W1–W8**，禁止只写「壳切换烟测」。  
5. 本地：`npm run test:smoke` + `npm run test:e2e:smoke`（及触及的 `test:e2e:changed`）；visibility 相关改动须能过 CI `test:e2e:visibility` 预期。  
6. 人工验收提醒（强制，对齐 §9）：本 Task 合并/邀测时须**单独**提醒用户跑宽屏 W1–W8，**禁止**与窄屏 O 修混在同一批关单话术。

### 建议实施顺序（一次只推一阶段进可测 PR）

`0 门禁 → 1 共享编排（行为不变的提取）→ 2 接线 facade / 断点切换 → 3 删重复 if / 文档`。  
每一阶段结束须冒烟绿 + 双视口抽测；禁止「大爆炸删两壳一夜重写」。

---

## ❌ 本任务明确不做

- ❌ 响应式 Task 2（竖屏横屏建议 UI）——仍按原 Brief，Task 1 验收后另开  
- ❌ 改 Emotion / Idle 呼吸眨眼编排 / CapCut 参数  
- ❌ 改 Companion / Arrival / Honesty **产品语义**或门闩规则（仅宿主/代理）  
- ❌ 纪念奖励 / 3D 公仔柜 / 成就墙等 Backlog  
- ❌ 原生 App / PWA 强推 / 系统 Focus Mode  
- ❌ 借重构「顺便」改 Ambient 产品口径、文案、或未立项的视觉精修  
- ❌ 为窄屏 fork 第二套 Session / Emotion 状态机  
- ❌ 未写进本 Brief 的目录占位与大范围 CSS 主题重做

---

## 验收（人工 · 必测）

`/?product=1` · 关单级只认 `origin/develop` tip（或本 feature 合入后的 tip）+ `check:branch-freshness` behind=0。

| 视口 | 最低故事 |
|---|---|
| **375×667** | `DEV_WORKFLOW_QUALITY` §8 **375 故事最小集**（Idle 三球+抽屉、Sit→Arrival→Focusing HUD、Breath 藏 Sit、? 补救、邻接 tip、Honesty/微仪式入口） |
| **≥480 / 建议 ≥900** | §9 **W1–W8**（清场形态、Sit 全路径、Arrival 藏 Sit/⋯、⋯ 代理 Honesty/How/Sound/提醒、? remap、邻接、Focusing、桥接/Rise 回流） |
| **断点切换** | 375↔480 来回：无双壳叠层、无死点击、无残留 body class |
| **回流** | Rise 后再 Idle；关闭抽屉/⋯ 再开；同日第二场会话 |

自动化：既有壳/可见性 e2e **不得无故删锚**；编排提取须带失败用例（stage×viewport → 可见性）。观感子项（墙钟非 `00:00`、图标边距等）仍分列人工，全绿 ≠ 关单。

---

## 契约锁法

| 契约 | 锁法 |
|---|---|
| 双壳入口同一编排结果 | 单测：stage + viewport → roles；禁止只测「调用了 NarrowIdleShell」 |
| Arrival / Breath Sit 隐、⚡ 显 | 既有 visibility 契约 + e2e；selector 若迁宿主须同步 registry |
| 微仪式 Sit unavailable | `micro-ritual-sit-unavailable` 双视口 |
| ⋯ / 抽屉代理 Sound → 面板非 FAB | e2e 宽/窄各一（已有则保留） |
| 断点切换无双壳抢点 | e2e 或 TEST_TRACKER「须人工锁路径」 |
| Hints remap | §8/§9 人工 + 既有 hint e2e；park 后锚点不得指旧坐标 |

---

## 风险与回退

| 风险 | 缓解 |
|---|---|
| 提取编排时静默改 suppress 语义 | 阶段 1 以「行为不变」为门禁；先红绿对照既有 e2e |
| z-index / fixed 壳倒挂导致点不到 ♪/? | 改前查 `Z_INDEX.md`；改后 375 Focusing + Idle 点 ActionBar |
| 与未验收 chrome 修冲突 | 独立 feature；同文件未验收修先合入或错开 |
| 一次 PR 过大难审 | 按阶段拆 PR；禁止大爆炸 |
| 假绿（只测壳有没有） | TEST_TRACKER 强制故事最小集；关单 N20/N24 |

回退：feature 未合入前可弃分支；已合入则按阶段 revert（优先还原 facade 接线，保留纯函数测试若无害）。

---

## 文档同步清单（本 Task 代码收尾时）

- [x] 本 Brief（本次已写）  
- [ ] `TASKS.md` 响应式 Task 3 状态 → 开发中 / 已落地（随进度）  
- [ ] `RESPONSIVE_LAYOUT.md` 工程债节  
- [ ] `SHARED_RESOURCES.md` §6 触发路径（若路径变）  
- [ ] `Z_INDEX.md`（若层级变）  
- [ ] `PROCESS.md` 速览一行  
- [ ] `TEST_TRACKER.md` 分列验收行（含 §8+§9）  
- [ ] 必要时 `DOC_CODE_CONTRACT.md` 高风险面一句

---

## 附录 · 触发条件沿革（只读）

| 日期 | 口径 |
|---|---|
| 2026-07-25 | 立项；须等 wide-idle push **且** ⑦ 场景 O 收口；禁止仅凭 push 开工；禁止与未验收修复叠重构 |
| 2026-07-29 | wide-idle 空壳分支删除（内容已在 develop）；O 修多已进 develop；W1–W8 完整关单改在 tip 单独排期 |
| 2026-07-30 | 用户确认先 Brief 再 feature；**本 Brief 交付 → 状态「可排期开工」** |
