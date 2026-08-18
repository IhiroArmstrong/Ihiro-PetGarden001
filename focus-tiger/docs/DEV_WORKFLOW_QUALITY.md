# 如何改善开发工作流来保证开发质量
# Focus Tiger · DEV_WORKFLOW_QUALITY.md

> **地位**：开发质量与工作流的**叙事权威**（原则 / 规范 / 指引 / 注意事项）。  
> **强制执行层**：`.cursor/rules/focus-tiger-regression-lock.mdc`（alwaysApply）+ `PROCESS.md`「回归锁工作法」摘要。  
> **冲突时**：以规则文件门禁为准；本文件解释「为什么」与「怎么做」。  
> **维护**：活文档。后续事故与拍板可增补章节，勿另起平行体系。

**创建**：2026-07-20  
**来源整合**：

| 日期 | 讨论焦点 | 纳入本文件 |
|---|---|---|
| 2026-07-19 | Companion 等「上次已修 → 再测又无正确效果」；尽快 commit / 自动 commit | **防假修好** + **基线固化（commit）** |
| 2026-07-20 | Idle 眨眼等「把已好的改坏」；改前不变量与重写继承契约 | **防把好的改坏** + **序列衔接进高风险表** |
| 2026-07-20 | 自动化冒烟 + 确认修复留回归锚；一键重置 / 共享资源表仍待完善 | **§6.1–6.4**（合并自 SUPPLEMENT，勿平行维护） |
| 2026-07-20 | 任务汇报末尾须独立「待你决定 / 待你知道」清单 | **N14** + regression-lock 汇报门禁 |
| 2026-07-20 | Playwright 拍板；覆盖分层；落地重置 + SHARED_RESOURCES；观感六行分列 | **§6.1–6.4 核实落实** |
| 2026-07-21 | 修 Bug 须立刻本地 commit，且**同步纳入相关项目文档**（禁止只改代码不改文档） | **N15** + 门禁升格 |
| 2026-07-22 | AI 修复验收：红绿对照、可验证证据、push+CI 才算完成 | **§7 AI 修复验收规范**（Bug close 硬性 checklist） |
| 2026-07-22 | 任何任务一旦完成且验证通过，必须立即 commit；commit 按逻辑完整改动组织并说明 what/why | **§2 / §3 / §3.5 Git 节奏补强** |
| 2026-07-22 | 废止「不必询问 commit」；可自动 commit + 同回合汇报；禁静默提交与自动合并 main | **§2.4 / §3.5 + regression-lock「Commit 汇报」** |
| 2026-07-22 | CI workflow 本身缺 `npm ci` 导致假红；基础设施 Bug 也须红绿证据 | **§7.7 CI 基础设施案例** |
| 2026-07-25 | 宽/窄屏长期并存分支失步：窄屏已修 bug 在宽屏复现 | **§6.6 分支分叉纪律**（B1–B3 → N17 + `WORKFLOW.md`） |
| 2026-07-25 | 窄屏多图连爆：验收停在壳切换、外侧取消未锁 tip、双壳契约滞后 | **§8 窄屏故事矩阵** |
| 2026-07-25 | 确认无对称「宽屏故事矩阵」；宽屏亦靠感觉测满 → 补 **§9** | **§9 宽屏故事矩阵** |
| 2026-07-26 | 开场即睡「修好又失效」：另案搁置 + 契约锁窄 + 文档互斥 | **§6.7** |
| 2026-08-02 | 实验室组合试播 OK ≠ 产品路径；冷启动欢迎×深夜叠播 | **§6.8 / §6.9** |
| 2026-08-03 | Welcome 里误出鹦鹉信使：冷启动串扰 + onComplete 后 trailing idle 盖播 | **§6.10** |
| 2026-08-04 | 长挂 Vite「第一眼披斗篷」误判开场即睡；拍板关掉白天无操作披毯 | **§6.11** |
| 2026-08-04 | 鹦鹉→Idle 仍闪白：CapCut「统一关单」覆盖面窄于字面承诺 + 单测假绿 | **§6.12** |
| 2026-08-06 | Arrival Breath/Choose 仍闪白：`smiling`/`intentionSet` 仍 `clear:true` 致 CapCut 静默跳过 | **§6.15** |
| 2026-08-04 | 窄屏 Focusing×? tip 叠团：记入≠开修 + 单测锁 id 未锁同时可见条数 | **§6.13** |
| 2026-08-05 | 「待你决定」须标出已被 tip/远端覆盖的伪选项为（不合理） | **N14a** |
| 2026-08-14 | 列多个方案时须同时给出「我认为最合理的」一项 | **N14b** + `recommend-most-reasonable` |
| 2026-08-16 | 实现前须对照已上线场景做冲突扫描；有疑点先停 | **N27** + `feature-conflict-review` |

**一句话（整套机制）**：  
回归锁 = 防假修好（回流 + 门闩 + 冒烟 + **文档同步** + 自动 commit）+ 防改坏（已好清单 + 继承契约 + 高风险面）+ **汇报可扫读**（末尾决策/知情清单；**伪选项标（不合理）**）+ **姊妹分支不漏修**（§6.6）+ **开场契约勿用另案假关闭**（§6.7）+ **冷启动第一幕互斥**（§6.9 / §6.10）+ **长挂页第一眼 ≠ 冷启动**（§6.11）+ **CapCut 关单须列具体情绪键**（§6.12）+ **Hints 补救须锁窄屏同时可见条数**（§6.13）+ **Arrival 抗闪须锁 `clear:false` 不只 options 数字**（§6.15）。  

**视口补充**：布局开关烟测 ≠ 完整用户故事——**窄/宽对称**（§8 / §9）。

---

## 1. 原则（Principles）

1. **可靠性来自方法，不来自「这次记得查」**  
   「修了又像没修」「好的被改坏」反复出现时，优先改工作流，而不是只补这一处代码。

2. **「修好」必须可复现，不能只等于 Happy Path 通了一次**  
   交互修复至少包含：主路径 + 一条回流 / 二次进入路径。

3. **已认可的体验是不变量，不是可随手丢掉的副作用**  
   为新目标重写编排 / 转场时，默认继承旧观感契约；允许牺牲须任务书写明。

4. **闸门放在 push / 合并进 main，不放在本地 commit**  
   规范性条款（SSOT）：`focus-tiger-regression-lock.mdc`「Commit 汇报与分支门禁」（见 `RULES_INDEX.md` → `git-agent-commit`）。分支与合并 `main`：仓库根 `WORKFLOW.md`。  
   （曾出现「尽快 commit」与「先问要不要」互相拆台；「不必询问」口径已废止，改为「可自动 commit + 必须汇报」。）

4b–4e. **N15 一体包、验证后不得悬置未 commit、commit 粒度与 message**  
   展开见下文 N6 / N15 / N16 表与 regression-lock；此处不平行复述完整门禁列表。

5. **单元测试绿 ≠ 用户可感知验收通过**  
   视觉、计时、按钮文案仍须 `TEST_TRACKER`「待人工测试」；Agent 自测只算研发自检。

6. **一次一任务管改动范围；保护面管别踩坏邻接**  
   范围仍只改本任务；邻接已好体验须列入已好清单并复测。

7. **怀疑「是不是没 commit」时，先分清三类根因**  
   - 真未提交 / 多会话冲基线  
   - 假修好（回流、门闩、静默失败）  
   - 把好的改坏（重写丢契约）  
   勿默认归结为「没 commit」。

---

## 2. 规范（Norms · 必须遵守）

### 2.1 防假修好（交互修复收尾）

| # | 规范 |
|---|---|
| N1 | 主路径 + **至少一条回流路径**（Rise 后再进、叠层后再开、同日第二场等） |
| N2 | 门闩未就绪 → UI **禁用 / 隐藏 / 明确不可用**；禁止可点却静默 `return` |
| N3 | 门闩类行为有**失败用例**单测，或 `TEST_TRACKER` 写明「人工锁路径」 |
| N4 | 同主题 `TEST_TRACKER` 行步骤**不得互斥**；先改文档对齐再改代码 |
| N5 | 未过门禁 → **不得**在回复写「已修好 / 已修正」 |
| N6 | **任何实质性 task 收尾** → **立刻自动本地 commit**；**禁止**未确认 push；**已完成且验证通过的改动不得跨任务周期悬置未 commit** |
| N12 | **确认修复的 bug 须留回归锚**（扩展 N3，不限于门闩）：优先追加自动化用例；确无法自动化 → `TEST_TRACKER` 永久人工锁路径（见 §6.1 S5） |
| N13 | 交互修复收尾、声称「已修好」**之前**，须先跑通 **`npm run test:smoke` 与 `npm run test:e2e`**；不过 → 并入 N5，不得声称修好。二者全绿仍**不**等于序列观感通过（见 §6.1 覆盖分层） |
| N15 | **Bug 修复一体包（强制）**：代码或修正措施落地后，**同回合**更新相关项目文档，并**立刻本地 commit**（文档与代码进同一 commit 或紧随其后的 Docs commit，禁止隔夜/隔会话）。文档最低：`TEST_TRACKER`（用户反馈列 + 步骤对齐）；另按触及面更新 `EMOTION_BIBLE` / `DESIGN` / `ARCHITECTURE` / `SHARED_RESOURCES` / `PROCESS` 速览 / `ASSET_INVENTORY` 等。缺文档或未 commit → 视为**未完成**，不得写「已修好」 |
| N16 | **commit 粒度与 message**：每个 commit 必须对应**一个逻辑完整改动**（功能 / bug 修复 / 文档更新），message 须说明 **what + why**；禁止 `update docs` / `misc` / `wip` 之类无信息量提交 |
| N17 | **姊妹功能分支不漏修**（§6.6）：长期并存的功能分支（如窄屏/宽屏变体）在任一分支有**修复性** commit 落地时，须同步检查另一条是否需合入同一修复；触及共享入口（Sound / Honesty / Companion 等 §2.3）的修复，收尾「待你决定 / 待你知道」须写明波及哪些姊妹分支；合回单线 vs 继续并行须**用户拍板**（Agent 不自行定分支策略）。操作条文 SSOT：`WORKFLOW.md`「长期并存功能分支的同步纪律」 |
| N25 | **可见性验收 OK = 宽+窄自动化同任务**（见 §8.6）：不得只写 `TEST_TRACKER`；须进 `visibilityContractRegistry` + 双视口锚点；改 suppress/hide → 整表 `test:e2e:visibility` |
| N26 | 可点击交互：接收反馈 ≠ 结果反馈；设计静默须进 `SILENT_BEHAVIORS.md`。全文见 `INTERACTION_FEEDBACK_PRINCIPLES.md`（`RULES_INDEX` → `interaction-feedback`） |
| N27 | 实现前冲突扫描：对照 `SCENARIO_TESTS.md` 的强度 / 语气 / 职责；有疑点须等拍板。全文见 `FEATURE_CONFLICT_REVIEW.md`（`RULES_INDEX` → `feature-conflict-review`） |

### 2.2 防把好的改坏（重写 / 改转场开工）

| # | 规范 |
|---|---|
| N7 | 动已验收路径前，必须列出 **已好清单（不变量）**；改完逐条自检 |
| N8 | 重写实现须**继承**观感契约（不闪、不硬切、溶解期定格、顶点停留等），除非任务书明确「允许牺牲某某」 |
| N9 | 单测锁 **契约**，不锁易变实现细节（例：眨眼切入须 `crossFade + freezeUntilCrossFadeEnds`） |
| N10 | 开工回复 / Task Brief 声明 **保护面**（不动 / 必须复测的邻接体验） |
| N11 | 写不进单测的不变量 → 写入 `TEST_TRACKER` 作必测回归项 |

### 2.3 高风险面（触及须显式复检）

触及下列任一者，默认高回归风险（清单可随事故增补，见文末「待完善」）：

**门闩 / 叠层 / 文案**

- `arrivalGateReady` / Arrival Practice  
- Companion Mode 点选 → Focus 开始  
- Honesty / Reflection / Arrival 底部叠层与 `setPostSessionOverlayActive`  
- `FocusInput.beginFocusing` / Sit↔Rise 文案  
- `playEmotion` 优先级与 `holdPose` / 回落路径  

**序列衔接**

- `IdleOrchestrator`：呼吸×N → 眨眼 → 呼吸（**切换不闪**；溶解期须定格）  
- `SpriteSequencePlayer.play` 的 cross-fade / `freezeUntilCrossFadeEnds` / `_resetCrossFade` 顺序  
- Choose / Rise / IntentionSet 等进出叠化（无法像素衔接时默认 `CAPCUT_DISSOLVE_MS`）  
- pingpong 顶点 `frameHolds`（已调过的停留勿无故缩短）  
- oneshot `_finishOneShot`：`onComplete` **之后**仍会 trailing `idle`——在 `onComplete` 里同步 `playEmotion(下一情绪)` 会被盖掉（§6.10）；冷启动多事件须互斥（§6.9）

**窄屏 / 移动浏览器**（权威 `RESPONSIVE_LAYOUT.md`；故事矩阵见 **§8**）

- `session-start-dock` / 主 CTA 截断或不可点  
- `OnboardingHintsUI` 多气泡挡 Sit / Rise  
- Honesty / Reflection / Arrival 底栏与固定 chrome 抢点击（z-index / `pointer-events`）  
- 竖屏 **375×667** 与 **横屏** 各走通相关核心路径（功能对等，非观感完美）  
- **禁止**只验「有没有 ActionBar / ⋯」就当窄屏通过——须走 **§8.4 375 故事最小集**

**Hints × 次级菜单（⋯ / 抽屉）**（2026-08-02 复盘升格）

- **⋯ / 抽屉打开时禁止再 promote 家用 auto tip**（`sit-button` / `idle-after-session`）：行悬停会 `_collapseClickHint` → `_promoteNextAuto`，若未压抑制，会在 Sit 球下闪「Tap to sit…」，Language（无行 tip）上更会「只剩 Sit tip」。运行时：`filterHintsForWideMore` / `filterHintsForNarrowDrawer` + `_promoteNextAuto` early-return（PR #78）。  
- **已好清单不变量（改 Hints / 宽 ⋯ / 窄抽屉时须守）**：① 菜单刚展开、**未** hover 任何行时 Sit tip 亦不可见；② breath / companion / reminder 悬停出对应 tip；③ Language 无 tip 且不漏 Sit；④ 行间切换不闪 Sit。  
- **禁止**只锁「Sit tip 矩形不与菜单相交」的几何条件——须锁 **可见性**（`data-hint-id="sit-button"` 不存在 / 非 `[open]`）。假绿案例：PR #76 e2e。回归锚：`e2e/wide-idle-more-menu.spec.js`（`Sit auto tip hidden while menu open` + `row hover tip matrix`）。

### 2.4 任务汇报（每次收尾回复）

| # | 规范 |
|---|---|
| N14 | 每次任务汇报（含文档-only / 调研 / 修复）的回复**末尾**必须有一个**独立小节**「**待你决定 / 待你知道**」清单；**禁止**只在正文叙述里带过。无事项时写「无（本次无需你拍板或额外知情）」。会话明显结束时「待你知道」须写明锁态（已删 / releasable）；拆盘不默认同条提议（口令见 `git-worktree-hygiene`）。合入 `develop` 后须含 QA 树 ①重启/硬刷新 ②一句变化（见 `qa-develop-worktree`）。 |
| N14a | **「待你决定」伪选项须标（不合理）**（2026-08-05）：Agent 已核对发现某候选**不必再做**（例：本地未推 commit 的内容已被 `origin/develop` tip 覆盖 / 已合入 / 等价提交已在远端；再 cherry-pick 会回退文档；远端分支已删且 develop 已有同语义）→ 仍可列在「待你决定」里供扫读，但该条**必须**带字面标记 **`（不合理）`** + 一句短因。**禁止**把这类伪选项写成尚待拍板的开放项，导致用户用「合理则办」误授权无效动作。真正需要拍板的项**不要**标（不合理）。若全部是伪选项 → 「待你决定」可写「无待拍板项」并另列带（不合理）的已排除项，或全部列在「待你决定」下且每条标（不合理）。 |
| N14b | **列多个方案须给最合理项**（2026-08-14）：正文或「待你决定」出现 ≥2 个开放方案时，须同时写「我认为最合理的」。条款 SSOT：`.cursor/rules/focus-tiger-recommend-most-reasonable.mdc`（`RULES_INDEX` → `recommend-most-reasonable`）。 |

> **N15** 见 §2.1（与 N6 并列强制）：Bug 修复 = 代码/措施 + 文档 + 立刻 commit。

**格式要求（最低）**：

```markdown
### 待你决定 / 待你知道
- **待你决定**：
  - …（需拍板 / 选方案；无则写「无」）
  - cherry-pick 某本地 docs → **（不合理）** tip 已有更新版 / 已合入
- **待你知道**：…（已做完但须知情：commit、PR URL、TEST_TRACKER 待测项、已知未覆盖、**Vite/Playwright 进程收尾**、**Cloud 独立会话**等；无则写「无」）
```

两条可各列多条 bullet；标题字面须可被扫读到，勿改成「小结」「Next」等模糊替代。  
`（不合理）` 标记字面须可被搜到（全角括号 + 不合理）；短因写在同一 bullet。  
起过 Vite/Playwright 或启用/建议 Cloud 时的强制提醒句 → `RULES_INDEX` → `browser-energy`（勿在本文复述全文）。IDE Browser 已由 hooks 硬禁；窄屏验收用 Safari 响应式 / Playwright。

### 2.5 双视口故事矩阵（N17–N24）

触及 Idle chrome / Arrival / Honesty / Hints 时：

- **窄屏（375）** → **§8**（N17–N20）  
- **宽屏（≥480，建议 ≥900）** → **§9**（N21–N24）  

原则共用：**布局开关 / 壳形态测过 ≠ 完整故事测过**。布局权威仍为 `RESPONSIVE_LAYOUT.md`；双壳不变量见 `SHARED_RESOURCES.md` §6。

---

## 3. 指引（Guidelines · 怎么做）

### 3.1 开工（改代码前）

1. 判断是否触及 **高风险面**（§2.3）或是否在**重写**已验收路径。  
2. 若是：在开工回复写出 **已好清单** + **保护面**（各 1～数条即可）。  
3. 扫同主题 `TEST_TRACKER` 行，确认步骤不互斥。  
4. 产品 / 情绪相关仍先对照 `PRINCIPLES` / `EMOTION_BIBLE` 等（见 `focus-tiger-docs` 规则）。

### 3.2 实现中

1. 门闩未就绪 → 先改 UI 可用性，再改逻辑；禁止「按钮还能点、函数直接 return」。  
2. 换编排 / 加 cross-fade 时，对照旧路径：**有没有丢掉 freeze / 溶解时长 / 顶点停留？**  
3. 能抽纯函数的门闩 / 契约 → 先写**失败用例**再声称锁住。

### 3.3 收尾（回复用户前）

对照回归锁完工门禁：

- [ ] 主路径已跑通  
- [ ] 回流路径已跑通  
- [ ] 静默失败已消除  
- [ ] **自动化冒烟已跑通**（`npm run test:smoke` **且** `npm run test:e2e`；不过不得声称修好）  
- [ ] 回归锁单测 / 本次确认修复的回归锚，或 TEST_TRACKER 人工锁路径已补  
- [ ] 已好清单（若本次为重写）已逐条自检  
- [ ] `TEST_TRACKER`：用户原话进「用户反馈」列；状态「待人工测试」；**观感子项勿并成笼统一行**  
- [ ] **相关项目文档已同步**（N15：行为/情绪/架构/素材/共享面触及的权威 md；禁止只改代码）  
- [ ] **立刻自动本地 commit**（**所有 tasks 都要**；已完成且验证通过的改动**不得跨任务周期悬置**；**代码+文档同批固化**）；**默认** push 旁支 + 开 PR  
- [ ] **commit 粒度正确**：本次提交只承载**一个逻辑完整改动**；message 清楚写出 **what + why**，不是 `update docs` / `misc fix` / `wip`  
- [ ] 回复末尾已写独立 **「待你决定 / 待你知道」** 清单（N14；无事项也写「无」）  

未过门禁 → 只诚实写「主路径已改，回流尚未验证」等。

### 3.4 汇报末尾清单（怎么写）

正文可以简洁；**决策与知情不得埋在段落里**。收尾前自问：

1. 有没有需要用户拍板的（继续做 6.3？引入 Playwright？接受某观感折衷？）→ 进「待你决定」。  
2. 有没有已核对过、**不必再做**的候选（tip 已覆盖、已合入、再做会回退）→ 仍可进「待你决定」，但必须标 **`（不合理）`** + 短因（N14a）；**禁止**混成开放拍板项。  
3. 若列了 ≥2 个开放方案 → 须同时给出「我认为最合理的」（N14b；`RULES_INDEX` → `recommend-most-reasonable`）。  
4. 有没有用户必须知情、但不必立刻回复的（已 commit / PR URL / N 项待人工测、冒烟未覆盖观感、已知缺口）→ 进「待你知道」。  
5. 两者皆空 → 仍输出该标题，写「无」。

### 3.5 Git 节奏（与质量的关系）

> **SSOT**：`focus-tiger-regression-lock.mdc`「Commit 汇报与分支门禁」+ `WORKFLOW.md`（分支 / 合并 main）。索引：`RULES_INDEX.md`。

质量含义一句话：本地 commit 固化可回滚基线；任务收尾默认 push 旁支 + PR；合入 `develop` 看 CI；关单 /「已修复」仍看人工测试。操作顺序见 `PROCESS.md`「Git 同步节奏」。勿在叙事文档再抄完整门禁列表。

---

## 4. 具体注意事项（Notes · 易踩坑）

1. **「代码还在」≠「体验还在」**  
   Companion 典型：主路径修好；Rise 后再选因门闩静默失败 → 用户感觉「又坏了」。

2. **「已 commit」≠「不会再坏」**  
   合掌 / Honesty 桥接 / How shall we sit 等案例中，多次被怀疑是没 commit；实际常是场景混淆、localStorage 限次、或门闩修过猛。先查行为与门闩，再查 git。

3. **本地 `npm run dev` 读工作区，不依赖 commit 才生效**  
   测不到新改动时，优先硬刷新 / 确认是否测错步骤，而不是先怪 commit。  
   另：**「看起来像 bug」也可能是脏 localStorage**。测回流 / 次日 / 像回归时，**先点实验室「重置全部本地状态」**（DEV、非 `?product=1`）排除脏状态，再怀疑其它原因。

4. **cross-fade 只淡入、溶解期仍跑帧 = 观感「闪一下」**  
   闭目↔睁眼等不衔接序列须 `freezeUntilCrossFadeEnds`（或等价定格）；与调试变体假闪同类。

5. **TEST_TRACKER 用户原话只进「用户反馈」列**  
   禁止混入「测试步骤」；修复后改回「待人工测试」，禁止 Agent 自行标「已通过」。  
   **关单另见** `TEST_TRACKER`「标「已通过」门禁」（`qa-pass-coverage-split`）：须 tip 合法书面确认，并写清 **e2e/自动化已锁哪些场景** + **人工已覆盖哪些场景**；**禁止** e2e 绿或笼统「测试 OK」直接改「已通过」（记入 ≠ 验证到位）。

6. **同主题行互斥会制造假回归**  
   例：A 行「须再点 Sit」、B 行「点选即开计时」——先对齐文档。

6.1 **验收步骤与代码契约漂移 = 假回归**（2026-07-25 · L249 / Scenario J）  
   曾误把「Rise 后 Here & Now → Notice」写成对照，与用户回流预期冲突。正确契约：**Arrival/⚡ 解锁后跨 Focusing→Rise 保持门闩**；回流 hint→Here & Now → **立刻 Focusing**（e2e J）；冷启动未解锁仍走 Arrival（e2e I2）。  
   **须**：步骤与 `SCENARIO_TESTS` / TEST_TRACKER 同行对齐；禁止 beginFocus/Rise 清掉 `arrivalGateReady`。

7. **问「要不要现在 commit？」会推迟最佳时机**  
   已废止。勿在反馈修复收尾再问；直接本地 commit。

8. **保护面写不清时，默认多测一条邻接路径**  
   例如改 Idle 编排 → 至少再看一眼 Sit / Arrival 是否仍正常开门。

9. **「代码已改、文档没动、commit 还没做」= 假完成**  
   下一会话 / 下一 Agent 读到的权威口径仍是旧的，用户也会以为「没修」。N15：同回合文档 + 立刻 commit。

---

## 5. 与其它文档的关系

| 文档 / 规则 | 关系 |
|---|---|
| `RULES_INDEX.md` | **规则主题 → 唯一权威来源**；写新流程/Git/门禁规则前先查；`rules:doc-check` 防平行复述 |
| `.cursor/rules/focus-tiger-regression-lock.mdc` | **强制门禁**（Agent 每次加载）；含 **§7 AI 修复验收规范**（Bug close checklist） |
| `.cursor/rules/focus-tiger-browser-energy.mdc` | **预览浏览器与能耗** SSOT（见 `RULES_INDEX` → `browser-energy`） |
| `PROCESS.md`「回归锁工作法」 | 项目流程中的 **A/B/C 摘要** |
| `COLLAB.md` | 协作侧交叉约定 |
| `TEST_TRACKER.md` | 验收与用户反馈登记 |
| `PRINCIPLES.md` | 产品与工程红线（一次一任务、路径 ASCII 等）；本文件不替代 |
| `ARCHITECTURE.md` / `EMOTION_BIBLE.md` / `SHARED_RESOURCES.md` | 改什么模块、情绪契约、共享波及面；本文件管「怎么改才不丢质量」；**双壳不变量**见 `SHARED_RESOURCES` §6 + `RESPONSIVE_LAYOUT` |
| `RESPONSIVE_LAYOUT.md` | 窄/宽壳布局权威；§8 / §9 要求 chrome 类任务走 **故事最小集**，而非仅壳切换烟测 |
| `SCENARIO_TESTS.md` | 场景步骤与自动化覆盖对照；§7 要求修复时同步核对「已自动化」口径 |
| `DOC_CODE_CONTRACT.md` | 文档↔代码结构对齐；本文件管质量方法叙事 |

---

## 6. 待完善（后续逐步增补）

> **禁止平行文档**：缺口与升格一律写进本节；勿另起 `DEV_WORKFLOW_QUALITY_SUPPLEMENT.md` / `_SUPPLEMENT_1.md` 之类副本（已合并删除）。  
> **已写进 §2 / 规则文件的不算待完善**；本节只收「已知该做、尚未全部落地或尚未升格」的项。  
> **优先级**：§6.1 控制器冒烟已落地；**浏览器 e2e（Playwright）已拍板引入**（见下）；§6.3 / §6.4 **已落地**；§6.6 分支分叉纪律 **已升格**（N17 + `WORKFLOW.md`，不再只是事故复盘）。  
> 如何变成真约束：见 **§6.5 晋级路径**。

### 6.1 自动化冒烟测试

**问题**：回归发现方式长期是「改完 → 用户手工点 → 再报告」，成本压在用户身上。

**要求**：

| # | 规范 | 状态 |
|---|---|---|
| S1 | 从场景 A–D 挑选确定性步骤，转成自动化冒烟（主链路即可） | **已落地**（控制器级 + 浏览器壳冒烟） |
| S2 | 概率触发步骤（idle 变体等）不纳入自动化，继续人工 + 强制触发入口 | 持续 |
| S3 | 回归锁收尾前须先跑冒烟；不过 → 并入 N5 | **N13** |
| S4 | 自动化新增/修改后同步 `SCENARIO_TESTS.md` | 持续 |
| S5 | 确认修复的 bug 须留回归锚（扩展 N3） | **N12** |

#### 覆盖分层（必须读 · 防「全绿＝没问题」错觉）

| 层 | 测什么 | 现状 | **不能**代替什么 |
|---|---|---|---|
| L-logic | 状态机 / 门闩 / Store / **DEV 重置白名单** | `scenario-smoke` + `localStateKeys.test.js` · `npm run test:smoke` | 序列观感、叠化是否闪、气泡时长 |
| L-contract | Idle/Sprite 契约（freeze、crossFade） | IdleOrchestrator 等单测已有部分 | 真人眼看到的「闪一下」 |
| L-browser | 真 DOM / 入口可见 | Playwright 产品壳冒烟（见下） | 动画帧级观感 |
| L-eyes | 睡着/眨眼/庆祝/Arrival 时长等 | **仅人工** · TEST_TRACKER 分列 | — |

**7/20 Idle 眨眼被改坏**属于 L-eyes / L-contract，**不在** L-logic 冒烟范围内。`npm run test:smoke` 全绿 ≠ 序列层安全。

#### 动画 / 序列层良策（结构性缺口的对策）

> **假修好 / CapCut 静默跳过（2026-08-02）**：产品 `welcomeBack` / `earWiggleHeadTouch` ≠ 调试入库同条（入库常 `holdLastFrame`、无叠化）。另：oneshot `_finish` 若先 `_hide()`，下一 `play(idle, crossFadeMs)` 因 `opacity===0` **静默跳过 CapCut**——「有 returnCrossFadeMs」≠可见叠化。契约：正放→倒放一次（烘焙 playlist，禁 player pingpong）→~1s CapCut；锁 `shouldHideOverlayOnFinish`。验收点姿态键并硬刷新 tip。

1. **契约单测优先（已有 + 须守）**：凡 Idle / CapCut 溶解路径，锁 `crossFadeMs` + `freezeUntilCrossFadeEnds`（例：`IdleOrchestrator.test.js`）；禁止只测「调用了 blink」。动编排必跑相关单测。  
2. **TEST_TRACKER 分列永久回归**：观感子项**禁止**并成笼统一行；每项有独立步骤（见本轮拆分的 6 行）。  
3. **动高风险面开工**：已好清单须显式写序列不变量（「呼吸→眨眼不闪」）；收尾人工扫一眼邻接转场。  
4. **Playwright 渐进**：先 DOM/流程壳；**不**指望截图像素锁动画。帧级观感仍靠人工 + 契约测。  
5. **禁止话术**：不得写「冒烟全绿，观感应该没问题」。

#### Playwright 拍板（2026-07-20）

| 项 | 结论 |
|---|---|
| 是否引入 | **要**（用户拍板：无额外工具授权费则加上） |
| 费用 | Playwright 开源；本机下载 Chromium，**无 SaaS 授权费** |
| 范围 v1 | 产品壳入口冒烟（`?product=1` 可见 Sit）；**Task 1 已扩** A/I/K Companion DOM（见 `scenario-a.companion.spec.js`） |
| 命令 | `npm run test:e2e`（与 `test:smoke` 并列；交互修复收尾两者都要绿） |
| 浏览器 | 本地默认 **Playwright 自带 Chromium**（`npm run test:e2e:install`）；勿默认 `channel: 'chrome'`（Cursor 子进程唤起系统 Chrome 易触发 macOS abort 弹窗）。系统 Chrome 兜底：`PLAYWRIGHT_CHANNEL=chrome` |

#### 技术选型（更新）

- **控制器冒烟**：`src/core/scenario-smoke.test.js` → `npm run test:smoke`  
- **浏览器冒烟**：`e2e/` + Playwright → `npm run test:e2e`  
- **仍须人工（分列登记）**：睡着观感、Idle 序列不闪、Arrival 气泡时长、Ambient、切页 60s、Celebrating、桥接后完整 Arrival UI  

### 6.2 Bug 修复必留回归项

并入 **§6.1 S5 / N12**。

### 6.3 一键清空本地状态 · **已落地**

| # | 规范 | 状态 |
|---|---|---|
| L1 | DEV「重置全部本地状态」；仅 `import.meta.env.DEV && !productChrome` | **已落地** |
| L2 | 清空后 `location.reload()`，等同场景 A 开局 | **已落地** |
| L3 | §4 注意事项 3：先用此按钮排除脏状态 | **已写入** |

实现：`src/core/localStateKeys.js` + `main.js` 按钮 `#dev-reset-all-local-state`。  
**L-logic 回归**（2026-07-21）：`localStateKeys.test.js` 并入 `npm run test:smoke`——锁白名单与各模块 STORAGE_KEY 集合相等、脏态 clear 后 Store 等同新用户；按钮可见性仍靠 e2e。**勿**要求人工逐 key 验收。  
**为何曾标后排**：当时优先做 §6.1 冒烟减轻手工负担，**不是**技术做不了。现已实施，取消后排。

### 6.4 共享资源对照表 · **已落地**

| # | 规范 | 状态 |
|---|---|---|
| R1–R3 | 对照表 + 与 §2.3 互补 + 新增顺手补行 | **已落地** → `docs/SHARED_RESOURCES.md` |

**为何曾标后排**：同上，优先级选择而非阻塞；现已实施。

### 6.5 其它既有项 + 晋级路径

**其它**：

- [ ] 动高风险面前记 `baseline: <short-hash>`  
- [ ] 高风险面：按模块补「最小复测脚本 / 控制台加速手法」  
- [ ] Task Brief 模板：固定「已好清单 / 保护面 / baseline」  
- [ ] 非交互类改动的轻量门禁是否区分  
- [x] 多 Agent / 长期并存分支基线约定 → **§6.6**（2026-07-21 宽/窄屏事故升格；并行写隔离另见 `WORKFLOW.md` worktree 节）  
- [ ] 反面教材短表  
- [ ] Playwright：Honesty 桥接 Yes 后见 Arrival DOM（D/N；Task 3 候选）  

**晋级路径**（约束力从弱到强）：

| 层级 | 载体 | 适用 |
|---|---|---|
| L0 待完善 | 本节 checkbox | 刚识别 |
| L1 指引 | §3 | 习惯类 |
| L2 规范 | §2 N# | 已拍板必须 |
| L3 门禁 | `focus-tiger-regression-lock.mdc` | 血泪教训 |
| L4 工具 | 冒烟 / e2e / 实验室按钮 / 对照表 | 最稳 |

升格时同步：§2、regression-lock、`PROCESS` 摘要、相关 TEST_TRACKER。禁止只在 §6 写「应该」却从不升格、也不做工具。

### 6.6 分支分叉纪律（基于 2026-07-21 宽/窄屏分支事故）· **已升格**

**问题**：`feature/wide-idle-more-menu` 建在窄屏抽屉初版之上，此后窄屏分支上的修复 commit 未合入宽屏线，导致宽屏复现了窄屏已经修过的同一批 bug（Sound FAB 代理错位、Honesty 因 hidden 从菜单消失、开机自动播、Rise 不停音乐、点外侧不关面板等）。这正是原「多 Agent / 多会话并行时的基线约定（分支策略是否需要）」留白项的真实案例——与「并行会话须 worktree 隔离」互补：后者管文件系统，本条管**长期并存姊妹分支的内容同步**。

**要求**：

| # | 规范 | 状态 |
|---|---|---|
| B1 | 长期存在的功能分支（如窄屏/宽屏同一功能的不同形态），须定期同步检查：建议**每次任一分支有修复性 commit 落地时**，对照另一条是否需合入同一修复；不能等到用户怀疑「是不是又漏了」才去查 | **已升格** → N17 + `WORKFLOW.md` |
| B2 | 涉及共享入口 / 共享交互逻辑（Sound、Honesty、Companion 等 §2.3 高风险面）的修复，一旦确认，须明确回答「还有哪些分支基于同一套逻辑、是否也需要这个修复」，写进该次收尾「待你决定 / 待你知道」；禁止默认「这次只改了一条分支」 | **已升格** → N17 + N14 |
| B3 | 若两条分支本质是同一功能的响应式变体，应评估是否合回同一条线、用断点处理差异，而不是长期维护易失步的并行分支——**架构决策提给用户**，Agent 不自行拍板合并策略 | **已升格** → N17 + `WORKFLOW.md` |

**反面教材（须记住）**：在姊妹分支上「只修当前线」= 把已修 bug 重新交给用户发现一次。

**修订记录**

| 日期 | 变更 |
|---|---|
| 2026-07-20 | 初版：整合 7/19 防假修好+自动 commit 与 7/20 防改坏讨论 |
| 2026-07-20 | §6 初补四缺口与晋级路径 |
| 2026-07-20 | 合并 SUPPLEMENT：§6.1–6.4；落地 `scenario-smoke`；升格 N12/N13；删除平行补充文档 |
| 2026-07-20 | 升格 N14：任务汇报末尾独立「待你决定 / 待你知道」；同步 regression-lock |
| 2026-08-05 | 升格 N14a：「待你决定」伪选项标（不合理）；防「合理则办」误授权 |
| 2026-08-16 | 升格 N27：实现前冲突扫描；SSOT `FEATURE_CONFLICT_REVIEW.md` / `feature-conflict-review` |
| 2026-07-20 | 拍板 Playwright；写清 L-logic≠观感；落地 6.3 重置 + 6.4 SHARED_RESOURCES；TEST_TRACKER 观感六行分列 |
| 2026-07-21 | 升格 N15：Bug 修复 = 代码/措施 + 相关文档同步 + 立刻本地 commit；同步 regression-lock / PROCESS / COLLAB / docs 规则 |
| 2026-07-22 | 新增 §7「AI 修复验收规范」：红绿对照、可验证证据、push+CI 才算 Bug close；与 N13/N15 并列，Bug close 时 §7 checklist 优先 |
| 2026-07-22 | §7 升格至 `focus-tiger-regression-lock.mdc` + `PROCESS.md` §D |
| 2026-07-22 | 补强 commit 纪律：验证通过后不得跨任务周期悬置未 commit；commit 按逻辑完整改动组织；message 必须写 what + why；纯文档任务同样适用 |
| 2026-07-22 | 对齐 regression-lock「Commit 汇报与分支门禁」：可自动 commit + 同回合汇报 hash/分支/文件；禁止静默提交与自动合并进 `main` |
| 2026-07-22 | 新增 §7.7：CI 缺 `npm ci` 假红案例；红 [`29916112037`](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/actions/runs/29916112037) → 绿 [`29919097318`](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/actions/runs/29919097318) @ `7b90283` |
| 2026-07-25 | 合并 SUPPLEMENT_1 §6.6：分支分叉纪律 B1–B3；升格 N17；SSOT 写入 `WORKFLOW.md`；删除根目录平行补充稿；章节按 6.1→6.6 数字序 |
| 2026-07-25 | 新增 §8「窄屏故事矩阵」：根因六条 + N17–N20（375 故事最小集 / tip 回归 / 双壳契约 / 关单话术）；不变量落盘 `SHARED_RESOURCES` §6 |
| 2026-07-25 | 新增 §9「宽屏故事矩阵」：对称原则 + 宽屏盲区评估 + N21–N24（≥480 故事最小集 / Popover·tip 邻接 / 双壳勾窄 / 关单话术） |
| 2026-07-26 | §8.2 增 3c：并行分支丢 `ca20d07` stage + A4 不锁视口假绿；N17 S2 改为鞠躬→三选一在视口→点选→Focusing |
| 2026-07-26 | §8.6 / N25：Visibility Contract Registry；验收 OK 须同任务双视口自动化；suppress 变更 CI 整表 |
| 2026-07-26 | 新增 §6.7：开场即睡「修好又失效」——另案搁置 + 契约锁窄 + 文档互斥 + 功能覆盖意图 |
| 2026-08-02 | 新增 §6.8：实验室组合试播 OK ≠ 产品路径已修（张望闪白） |
| 2026-08-02 | 新增 §6.9：冷启动欢迎与深夜同 tick 叠播（茶/哈欠误盖开场） |
| 2026-08-03 | 新增 §6.10：Welcome 误出鹦鹉信使（冷启动串扰 + onComplete trailing idle 盖播） |
| 2026-08-04 | 新增 §6.13：窄屏 Focusing×? tip 叠团（记入≠开修；KnownRisky 复测失败）；§6.11=Expand A 长挂；§6.12=鹦鹉 CapCut 关单窄 |

### 6.7 开场即睡：修好过一段时间又失效（2026-07-26 事故）

**现象**：2026-07-21 已按用户反馈把「第一幕不能睡觉」改成 Idle 闭目坐禅（A1 已通过）；2026-07-25 / 26 用户再测「第一次试用」却又见披斗篷→睡着。

**不是**神秘回滚或未 commit。代码路径仍在：零完成（无 `focus-session-end`）开局仍是 Idle。失效的是**用户可感知意图**——「每次打开第一幕要有精神的坐禅」。

**因果链**：

1. **契约锁得太窄**：7/21 回归只覆盖「无结束戳 → Idle」。有人测过一场后本地留下 `focus-session-end`，≥2h 再开页 = 另一条路径，无锚。
2. **后续功能覆盖意图**：7/22 `418b5f5` 上线 2h 滚动 DORMANT + 披毯；`onAppReady` 直接 `syncDormantState()`，冷启动对陈旧戳一律 IDLE→DORMANT→`cloakSleep`。未把「冷启动第一幕 Idle」列入已好清单 / 保护面。
3. **「另案」= 假关闭**：7/25 用户写明「进入页面后开场即播披斗篷」；修复只做了披毯→睡姿衔接，把开场问题标成「另案」且 **未**新开 `TEST_TRACKER` 待测行、**未**加自动化锚 → 意图掉出队列。
4. **权威文档互斥**：`DESIGN` / `EMOTION_BIBLE` 写「开场 Idle / DORMANT 仅调试」；同文档姿态表又写「≥2h → DORMANT + 披毯」。Agent 可各取所需，无冲突门禁。

**工作流补丁（须遵守）**：

| # | 要求 |
|---|---|
| W1 | 用户说「第一幕 / 开场 / 第一次试用」→ 回归锚必须覆盖 **有陈旧持久化状态** 的冷启动，不只「重置后全新用户」 |
| W2 | **禁止**用「另案」关闭用户书面问题而不：（a）新开 `TEST_TRACKER` 待测行，或（b）用户书面确认延期 |
| W3 | 上线会改开场 / 冷启动视觉的功能（如惰性 DORMANT）→ 开工已好清单须含「第一幕 Idle」；单测须锁 `onAppReady` 不进睡 |
| W4 | 发现权威 md 互斥口径 → **同任务**改齐，禁止留下「调试 only」与「自动 2h」并行 |

**本事故落地**：`onAppReady` → `allowEnterDormant: false`；`dormantIdle` + smoke A1b；`TEST_TRACKER`「开场即睡」行；对齐 `DESIGN` / `EMOTION_BIBLE` / `SHARED_RESOURCES`。  
**产品拍板（2026-07-26）**：回前台（切标签再回来）且 ≥2h → **继续披毯进睡**；冷启动第一幕仍 Idle。二者勿再混为一谈。

### 6.8 实验室组合试播 OK ≠ 产品路径已修（2026-08-02 · 张望闪白）

**现象**：Idle 好奇池随机 `gazeLookAround` 播放中闪白；调试「组合试播 · 张望整段」不闪。用户以为「上次已交 Bug」却仍见闪。

**不是**实验室坏了。两条代码路径本就不共享抗闪契约：

| 路径 | 离开 Idle | 段间 | 播完 |
|---|---|---|---|
| `_playDebugSequenceChain` | `clear: false` | `crossFadeMs: 0` | **定格末帧、不回呼吸**（注释写明避闭目一闪） |
| 产品 `_playCompanionSequenceChainOnce`（Slice B 重接好奇池前） | 默认 `clear: true`（藏 overlay→露灰底） | `MICRO_CROSS_FADE_MS` | CapCut 回 Idle |

**因果链**：

1. **7/20「修」= 关自动变体，不是修转场**：正式 Idle 不再自动张望 → 闪白从产品路径消失，看起来像修好；抗闪不变量仍只在调试链。
2. **Slice B 重接好奇池**：产品再走 `gazeLookAround`，**未**把实验室的 `clear:false` / 段间硬切迁到 `_playCompanionSequenceChainOnce`。
3. **「实验室 OK」假绿**：验收/自测若只点组合试播，会误以为产品路径已对齐。
4. **记入 ≠ 开修**（同日 ⋯ 脉冲点事故同型）：反馈进 `TEST_TRACKER` 后若无专修分支 + 产品路径回归锚，问题会休眠到用户再撞上。

**工作流补丁（须遵守）**：

| # | 要求 |
|---|---|
| L1 | 调试路径修好观感后，若产品会走同素材 → **必须**把抗闪不变量写进产品播放器（或共享 helper），禁止「调试专用」 |
| L2 | 回归锚须锁**产品**入口（如 `playEmotion('gazeLookAround')` 的 `clear`/`crossFadeMs`），禁止只锁调试链或「实验室按钮能播」 |
| L3 | `TEST_TRACKER` 写「正式 Idle 不应自动张望」类关闭语时，若日后重接调度 → 开工已好清单须含原抗闪契约 |

**本事故落地**：产品链对齐 `clear:false` + 段间硬切 + 末帧定格再 CapCut；单测锁该契约；`TEST_TRACKER` 好奇张望闪白行。

### 6.9 冷启动多事件同 tick 叠播（2026-08-02 · Welcome 误出茶/哈欠）

**现象**：验收「开场欢迎池 = 魔法书 60% / 点头 40%」时，仍看到 `teaDrinking` 或伸懒腰类（`yawnStretch`），误以为 Welcome 池被污染。

**不是** `WELCOME_POOL` 配错。池内确实只有书 + 点头；单测也只锁了池成员。

**真因**：`main` 冷启动同 tick 连续：

1. `WELCOME_APP` → 开播书/点头  
2. `LATE_NIGHT`（本地 ≥23:00）→ 立刻再 `playEmotion` 茶/哈欠 → **盖掉**欢迎  

用户在深夜测欢迎时必现；白天测欢迎则看不见。

**工作流缺口**：

| # | 缺口 |
|---|---|
| S1 | Slice B「一批接线」把多个生命感事件挂到同一 boot 路径，**未写互斥 / 优先级** |
| S2 | 单测只验「各事件孤立 resolve」，**不验 boot 组合**（欢迎 play 后是否还允许深夜） |
| S3 | 人工步骤写「冷启动欢迎」却未写「≥23:00 时不得见茶/哈欠」——跨场景串扰无清单 |
| S4 | 与 §6.7 同型：冷启动是高回归面；后加事件须对照「第一幕只播什么」 |

**工作流补丁（须遵守）**：

| # | 要求 |
|---|---|
| B1 | 冷启动若有多条 `tryPlaySceneAnim` → 须有**显式互斥**（欢迎优先；或文档写明允许叠播的唯一例外） |
| B2 | 回归锚须含**组合**：`welcome.play === true` → 同 tick 不得再播深夜；欢迎跳过 → 允许深夜 |
| B3 | 验收欢迎池时，若可能 ≥23:00，步骤须写「只见书/点头，不见茶/哈欠」 |

**本事故落地**：`shouldAttemptLateNightOnBoot` + `main` 条件调用；单测锁互斥；接线表 / `TEST_TRACKER` Slice B 行更新。

### 6.10 Welcome 里误出鹦鹉信使（2026-08-03 · 冷启动串扰 + onComplete 盖播）

**现象**：入库调试试播「鹦鹉耳边造访」OK；产品壳第一次进页却像 Welcome 里夹了鹦鹉。用户原话：Welcome 动画里不应有鹦鹉。

**不是** Welcome 池配错了鹦鹉。`WELCOME_POOL` 仍只有 `magicBookReading` / `nodGreeting`。

**两层真因（须分清）**：

| 层 | 机制 | 用户可见 |
|---|---|---|
| A · 冷启动串扰 | 已有提醒偏好且时分已过 → boot / 首 sync 出横幅并立刻 `playEmotion('parrotEarVisit')`，与同 tick 欢迎抢基底 | 开场像「欢迎=鹦鹉」 |
| B · onComplete 盖播 | 后来改为「欢迎结束后补播」，但在欢迎 `onComplete` **同步**播信使；`_finishOneShot` 在 `onComplete` **之后**仍会 `playEmotion('idle')` → **立刻盖掉**刚开的鹦鹉 | 调试里像「播了又没了」；e2e 曾见 `played=true` 而 `key===idle` |

层 B 与文首「假修好 / CapCut 静默跳过」同属 **oneshot 收尾时序**：`onComplete` 不是「整段情绪生命周期已结束、可以安全接下一情绪」的边界。

**工作流缺口**：

| # | 缺口 |
|---|---|
| M1 | 场景 A 接线只验了 **Happy Path**：点 Reminder → 横幅+鹦鹉。未把「冷启动第一幕 = 只欢迎」写入开工已好清单 / 保护面（与 §6.7 / §6.9 同型） |
| M2 | **实验室入库试播 OK ≠ 产品冷启动 OK**（§6.8 同型）：调试钮无 Welcome 并行，盖不住串扰 |
| M3 | 门闩单测只锁 `shouldPlayParrotMessengerOnBannerShow` 纯函数；**不锁**「欢迎播放中 / 欢迎 onComplete 后 emotion key 仍为信使」 |
| M4 | 首次 e2e 在墙钟已过点时填表 → 横幅过早出现；且未覆盖「欢迎仍在播时横幅已出 → 结束后信使仍可见」组合 |
| M5 | 调用方在 `onComplete` 里同步 `playEmotion(下一情绪)` 无检查清单；trailing idle 盖播属可预期 API 时序，却当「偶发竞态」修 |

**工作流补丁（须遵守）**：

| # | 要求 |
|---|---|
| C1 | 新场景若可能在 **cold boot / 首 sync** 播情绪 → 开工已好清单须含：**Welcome（或其它第一幕）优先；不得抢播**；能单测/e2e 则锁组合 |
| C2 | 在 oneshot `onComplete` 里接播下一情绪 → **必须**延后到当前 `_finishOneShot` 的 trailing `idle` 之后（如 `setTimeout(0)` / 共享 flush）；禁止同步 `playEmotion` |
| C3 | 验收「横幅+信使」须分列：**实验室入库**、**Reminder 主路径**、**冷启动（有提醒偏好 + 欢迎日限未用）**；后一项不得用前两项冒充 |
| C4 | e2e 断言信使时优先锁 **可见 emotion key**（或等价 DOM），勿只锁「曾调用过 play」类观测戳 |

**本事故落地（代码已合 PR #96）**：欢迎期间 hold + `pending`；欢迎 `onComplete` 用 `setTimeout(0)` 补播；横幅每次 hidden→visible 可再播；约 60s 静候再评；e2e 先 `setNow` 再填表。本文件补工作流根因，供后案对照。

### 6.11 长挂 Vite「第一眼披斗篷」≠ 白天冷启动回归（2026-08-04）

**现象**：关单级验收时 Vite 挂约 1～1.5h、中间穿插测试；回看「第一眼」又是 Yin 披斗篷→睡着。易被误判为老「开场即睡」（§6.7）。

**用户确认（同日）**：是**回看挂着的页**，不是硬刷新。白天非深夜 2A。

**真因**：Expand A 白天路径 — Idle ≥15min 无 `pointerdown`/`keydown`/`touchstart` → `forceDormant`。移鼠 / 切 Cursor **不** bump；藏 tab 时计时器仍涨 → 验收长挂必中。

**拍板（方案 A + 前台可见意图）**：

1. **关掉白天 Idle 无操作披毯**（删除 `shouldIdleInactivityCloak` / 活动监听 / 60s 轮询）。
2. **保留**：深夜 Idle→DORMANT、练完 ≥2h live sync、2B。**Expand B 会话结束披毯已于 2026-08-18 收回**（Reflect 开着须醒着同坐）。
3. 「仅前台可见才计时」：无操作计时器已删 → **无后台累计**（意图满足；不必再挂 visibility 门闩）。

**工作流补丁**：同视觉多入口须先分清冷启动 / 长挂 / 深夜 / 2h；上线长挂会改第一眼的定时器须写验收警告。单测锁「无操作 helper 已移除」。

### 6.12 鹦鹉→Idle 仍闪白 · CapCut「统一关单」覆盖面窄于字面承诺（2026-08-04）

**现象**：`?product=1` 硬刷新后播鹦鹉信使，**过渡回 Idle 时闪白**。用户原话要点：上次不是已筛查并把跨动画改成 1s 叠化了吗？为什么看起来没有修正？

**不是**「CapCut 常量被改回 180ms」或「鹦鹉没接线 returnCrossFadeMs」。查证：

| 层 | 事实 |
|---|---|
| A · 字面承诺 vs 关单矩阵 | PR #102 / TRACKER「跨动画短叠化统一 1s CapCut」写「凡有转场的跨动画衔接统一 1000ms」。**关单人工覆盖**却只列：微仪式 Idle↔smiling、完成/Leave→Idle、`curiousTilt`/`blink`/`riseStretch`/`dormantWake` + 若干硬切。**未列** `parrotEarVisit`（亦未列 `teaDrinking` / `bookReading` 等同型 companion oneshot）。 |
| B · 鹦鹉不在 PR #102 diff | 鹦鹉入库（PR #96）当天已设 `returnCrossFadeMs: CAPCUT_DISSOLVE_MS` + `freezeUntilCrossFadeEnds`。统一短淡入那笔**没改**鹦鹉路径——关单绿也**验不到**「鹦鹉修好了」。 |
| C · 鹦鹉行 QA 验错维度 | TRACKER 鹦鹉/场景 A 书面 OK = **Welcome 优先顺序**、横幅 hidden→visible、Focusing suppress。步骤虽写「末约 1s CapCut」，**从未**有用户书面「鹦鹉→Idle 无闪白」。顺序修好 ≠ 回落叠化修好（§6.8 / §6.10 同型）。 |
| D · 单测假绿 | `EmotionController.test.js` 用例名 `parrotEarVisit plays once then CapCut idle (~1s)` **只**断言首段 `returnCrossFadeMs` / `freezeUntilCrossFadeEnds`；**不**调用 `onComplete`、**不**断言下一笔 `idle`/`idleBreathClosed` 的 `crossFadeMs===1000`（对比同文件 `nodGreeting` 测了完整回落）。「有字段」≠ 可见叠化（§6.1 CapCut 静默跳过已警告）。 |
| E · 抗闪不变量未推广到 companion oneshot | 张望产品链（§6.8）已对齐：`clear: false`、末段 `holdLastFrame`、再 CapCut。`_playCompanionSequenceOnce`（鹦鹉/茶/书等）仍默认 `_leaveIdleBaseline()` → **`clear: true`**，且 oneshot 末帧默认**不定格**。与已修抗闪链不对称——即使 `returnCrossFadeMs` 有值，仍可能出现藏 overlay / 末帧不稳 / 背景透出等「闪白」观感。 |

**因果一句话**：**「统一 CapCut」关单用窄矩阵冒充全库契约** + **鹦鹉验收锁顺序不锁回落观感** + **单测只锁 options 字段不锁 trailing idle CapCut** → 用户以为上次已修，刷新仍见鹦鹉→Idle 闪白。

**工作流补丁（须遵守）**：

| # | 要求 |
|---|---|
| P1 | 凡「统一 X 转场 / 一律 CapCut」类关单：`TEST_TRACKER` **必须列具体 emotion / 序列键**（含新入库 companion）；禁止只写「跨动画」却用人眼抽测 2～3 条收口 |
| P2 | 新 oneshot 入库：验收分列 **（1）播完内容** **（2）回 Idle 叠化无闪白**；后者不得用「调试钮播过」或「冷启动顺序 OK」冒充 |
| P3 | 契约单测：oneshot 名含「then CapCut idle」→ **必须** `onComplete()` 后断言 idle 入口 `crossFadeMs` + `freezeUntilCrossFadeEnds`（对齐 `nodGreeting`）；禁止只 assert 字段写在首段 options |
| P4 | 产品 companion oneshot 若与张望同属「回 Idle 不得闪白」→ 开工已好清单须显式对齐抗闪不变量（`clear` / `holdLastFrame` / freeze）；禁止只抄 `returnCrossFadeMs` 数字 |

**本回合落地**：查证写入本 §6.12 + `TEST_TRACKER` 用户反馈；当时**未改运行时**。  
**2026-08-04 晚**：用户于 `origin/develop` tip `0494dd6`（Vite `:5176`）窄屏书面确认鹦鹉回落叠化 **测试 OK** → 分列行已关单（关单当时未合入抗闪运行时）。  
**后补（`fix/parrot-idle-capcut-2026-08-04`）**：落地 §6.12 **P3/P4**——`_playCompanionSequenceOnce` 对齐张望抗闪（`clear: false` + 默认 `holdLastFrame`）；`parrotEarVisit` / `earWiggleHeadTouch` 单测补 `onComplete`→idle CapCut。**不是**重开「闪白未修」关单（人工观感已在 tip `0494dd6` 关）；本笔是契约硬化，防假绿回潮。

### 6.15 Arrival Notice/Breath 与 Choose 鞠躬仍闪白 · 抗闪未推广到 `smiling` / `intentionSet`（2026-08-06）

**现象**：Sit → What is present（Notice）点选后，眨眼微笑切 Breath **闪白**；Choose 后 Yin 鞠躬（`intentionSet`）后段再 **闪白**。用户原话要点：上次不是已把太快转场统一改成 1s 叠化了吗？为什么现在还有？杜绝很难吗？

**不是** `CAPCUT_DISSOLVE_MS` 被改回短淡入，也**不是** Arrive 文档/关单行「已通过」被神秘回滚。查证：

| 层 | 事实 |
|---|---|
| A · 调用方已传 CapCut | `main.js` `onBreath` / `onWelcome` 对 `smiling` 已传 `crossFadeMs: CAPCUT` + `freezeUntilCrossFadeEnds: true`。`intentionSet` 实现内也默认 `crossFadeMs` / `returnCrossFadeMs` / freeze。 |
| B · 播放前先藏层 | `smiling` / `intentionSet` 仍走 `_leaveIdleBaseline()` **默认 `clear: true`** → `spritePlayer.stop({ clear: true })` → overlay `opacity===0`。下一笔 `play(..., crossFadeMs)` 因 `shouldCrossFade` 要求 `opacity !== '0'` → **CapCut 静默跳过**（文首「假修好 / CapCut 静默跳过」同型）。用户看见的「闪白」= 背景透出，不是叠化失败的视觉噪声。 |
| C · `smiling` 丢 freeze | 即便调用方传了 `freezeUntilCrossFadeEnds`，旧 `smiling` **未转发**到 `blinkSmile` playOpts → 溶解期仍可能开播新帧（Safari 透明闪）。 |
| D · 关单矩阵未锁 Arrival 抗闪不变量 | 「跨动画短叠化统一」关单（§6.12 A）与 Choose pingpong 行书面 OK 锁的是 **有 1s 字段 / 点头观感**，**未**锁「离开 Idle/smiling 时 `clear:false`」。§6.12 P4 只后补了 companion oneshot，**未**回头改 Arrival 主路径 `smiling` / `intentionSet`。 |
| E · 单测假绿 | `intentionSet … then returns to idle` 的 mock `stop()` 不模拟藏层；断言 options 数字全绿，**拦不住**真实浏览器 CapCut 静默跳过。 |

**因果一句话**：**字面「一律 CapCut」已写进 options，但 Arrival 主路径仍用 `clear:true` 先藏 overlay** → 叠化条件永远不成立；关单与单测只验「写了 1000」，不验「离开时是否保活末帧」。故「统一筛查过」与「产品路径仍闪」可长期并存。

**工作流补丁（须遵守 · 叠在 §6.12 P1–P4 上）**：

| # | 要求 |
|---|---|
| A1 | 凡「跨序列不得闪白」产品路径：离开上一序列时默认 **`_leaveIdleBaseline({ clear: false })`**（或等价保活末帧）；`clear:true` 仅当任务书明确允许硬切露底 |
| A2 | 契约单测须断言 **`stop({ clear: false })`**（或 mock 记录 clear），禁止只 assert `crossFadeMs===1000` |
| A3 | Arrival 关单 / 复测步骤须**分列**：(1) Notice→Breath 微笑切入不闪；(2) Choose→鞠躬切入不闪；(3) 鞠躬→Idle/Companion 回落不闪——禁止用「Choose pingpong OK」冒充三条 |
| A4 | 新改 `_leaveIdleBaseline` 默认值前须扫高风险情绪键；至少 `smiling` / `intentionSet` / companion oneshot 与张望链对齐 |

**本回合落地**：`smiling` / `intentionSet` → `clear: false`；`smiling` 转发 freeze + 默认 CapCut；`intentionSet` 默认定格末帧；单测锁 `stop({ clear: false })`；`TEST_TRACKER` 分列重开待测。

### 6.13 窄屏 Focusing 点「?」tip 叠成一团 · 记入 ≠ 开修（2026-08-04）

**现象**：KnownRisky 清单 #1 步 7 / Task3 §8 S3——窄屏 Focusing 点「?」，多条薄荷绿 tip +「1 more tips」芯片叠在一起难读。用户 2026-08-04 附图复测**不通过**，怀疑「从来没修过」。

**不是**神秘回潮。查证：

| 层 | 事实 |
|---|---|
| A · 记入时间 | **2026-08-01** 已写入 `TEST_TRACKER`「响应式 Task 3」Bug② +「点 ? 补救」行：窄屏 Focusing 点 ? →「一堆」hints。状态长期「有问题」/ `legacy-unclassified`。 |
| B · 同日明确未改 | 同日 `fix/chrome-only-quick-and-rise-flash` 收尾明文：**「脉冲点 / Hints / 续播 / W5 假绿未改」**——只修了 W3/Rise 闪 Sit，**Hints 不在该分支范围**。 |
| C · 后续 Hints 工作错位 | 之后合入的是 **hints 视觉护栏试点**（PR #93）+ observe-hold 文档（PR #95）——锁 mint/几何软快照与「暂不扩」政策，**不是** Focusing 补救「一次铺开多条」的布局/互斥契约。 |
| D · 假绿 | 单元 `resolveRemedyHintIds({ isFocusing: true })` **故意**返回 `rise-button` + `ambient-soundscape` + **三条** `focus-hud-*`。`showRemedy` 把「可见锚」的 catalog 项**全部立刻 `_paint`**。截图三条正文正是 `HINT_FOCUS_HUD_STREAK` / `RING` / `PROGRESS`（非 Idle 热力图误出）。窄屏错开逻辑主要挂在 `ft-narrow-park`；Focusing 为 `ft-narrow-focusing`，**无**等价「只出主条 + 其余进芯片」折叠 → 三条 HUD tip 同屏叠在 ActionBar 下。 |
| E · 无回归锚 | **无** e2e 断言「Focusing + 375 + 点 ? → 同时可见 tip 气泡 ≤1（其余在芯片）」；故护栏/冒烟绿也拦不住本复测失败。 |

**因果一句话**：**记入 ≠ 开修**（同 §6.8 L4 / ⋯ 脉冲点事故同型）+ **单测锁了「应出哪些 id」却未锁「窄屏一次只画几条」** → 问题休眠到 KnownRisky 走查再撞上。

**工作流补丁（须遵守）**：

| # | 要求 |
|---|---|
| F1 | `TEST_TRACKER`「有问题」且用户写明场景（如 Focusing×?）→ 排期须有**专修** `fix/*` 或明确书面延期；禁止只靠债务清单/KnownRisky「以后测」代替开修 |
| F2 | Hints 补救类：单测锁 id 列表时，若产品契约是「主条 + 芯片」，须另有 **DOM/e2e** 锁同时打开的 `.onboarding-hint-bubble:not([hidden])` 数量（或等价），禁止只绿 `resolveRemedyHintIds` |
| F3 | 改 Idle park / chrome 时，开工已好清单须含 **Focusing×? 补救**（窄屏）；`ft-narrow-park` 专用错开**不得**默认当成 Focusing 已覆盖 |
| F4 | KnownRisky / 债务走查失败 → **同回合**写回 TRACKER「用户反馈」+ 本文件指针；不得只口头说「可能没修过」 |
| F5 | 邀测/复测须写明 **分支 + 端口 + worktree**；`:5173` 常被其它 worktree 占用——测到无修 tip ≠ 本修无效（同型 08-02 薄荷绿清空） |

**本回合落地**：查证写入本 §6.13 + `TEST_TRACKER` 复测反馈；清单迁入 `KNOWN_RISKY_TEST_CHECKLIST.md`。  
**专修（2026-08-04 · PR #109 → `0494dd6`）**：`resolveRemedyImmediateAndFolded`——`isFocusing` 时 `immediate=[]`、catalog 全进芯片；e2e 锁 375 Focusing 可见 remedy tip **恰好 1**（`rise-button`）且芯片含数字 N。Idle 宽屏「可见锚立刻出」路径不变。**2026-08-04 晚** develop tip 窄屏 Focusing×? **测试 OK**（子项关单）。**同日晚 KnownRisky #1**：tip `4698eb3` 步1–6、9 OK + 步7/:5176 → Task3 **已通过**；步8 窄屏 Hints 产品延期。

**2026-08-04 再书面「没修复」· 工作流根因（查证）**：不是代码回潮。本机 `127.0.0.1:5173` 当时由 **另一 worktree**  
`Zen-tiger-Pet-garden001-wt-starlight-cloak-sleep`（分支 `docs/develop-small-pr-auto-merge-habit` @ `009402b`）占用——**无** `resolveRemedyImmediateAndFolded`。修在主仓 `fix/focusing-remedy-primary-chip-2026-08-04` @ `8241858` 且**未 push**。用户按默认 5173 复测 = 测到无修 tip → 误判「没修」。同型：08-02 薄荷绿清空钮事故（`TEST_TRACKER` ⋯ 行）。  
**补丁（F5）**：邀测 / 复测须写明 **分支名 + 端口 + worktree 路径**；默认 5173 被占用时改用其它端口（如 5175），禁止默认「打开 5173 即本修」。

### 6.14 Ambient：Rise 后曲目高亮「丢记忆」+ 重播非断点续播 · 记入≠开修 / 契约偷换（2026-08-05）

**现象（用户书面 · tip 测 6 新曲 OK 同场）**：

1. Rise 停播 → 再悬停开 Soundscape → **上次曲目无高亮**（像没记住）。  
2. 静音后再开 / 「续播」→ **从头播放**，不是断点续播（用户早在 **2026-08-01 P1-4** 提过）。  
3. 宽屏面板水平居中挡阿寅 → 应默认靠右（构图）。

**不是**神秘回潮。查证：

| 层 | 事实 |
|---|---|
| A · 曲目高亮 | `resolveAmbientPanelSelectedTrackId`：**可闻→该曲**；`wantsEnabled`→preferred；**否则一律 Off**。注释写明服务「冷启动无声不得高亮 Mer-Ka-Ba」。`endSession`（Rise）只清 `_wantEnabled`、停播，**保留** `_preferredTrackId`——存储记得，**面板选择器故意不画**。冷启动 Off 修（2026-08-04）把「静音≡高亮 Off」推广到 **Rise 后静音**，无「曾播过则高亮 preferred、Off 仍可选」的分列契约。 |
| B · 断点续播 | `_stopPlayback` **硬编码** `currentTime = 0` 并 **拆掉/重建** `<audio>`（src 清空）。`mute`→`unmute`→`setTrack` 只能从头。e2e `ambient-mute-resume-focusing` 的「resume」= **再开播 preferred 有声**，**不断言** `currentTime` 续播。 |
| C · 记入≠开修 | P1-4（2026-08-01）已写「重播非续播」。`fix/chrome-only-…` 收尾明文 **「续播未改」**（§6.13 B）。右上音符行写「历史项若未再测可保留观察」→ **观察代替专修**。无 `fix/*` 改 `_stopPlayback` seek；无单测锁「mute 前后 currentTime」。 |
| D · 面板居中 | `AmbientSoundscapeUI` 内联 CSS：`body.ft-wide-stage-sound .ambient-soundscape__focus-chrome { left: 50%; transform: translateX(-50%); }`——宽屏舞台**刻意居中**，非回归；从未有「靠右」验收行。 |

**因果一句话**：**冷启动 Off 高亮契约过宽覆盖 Rise 回流** + **「续播」产品词被 e2e/文案偷换成「再开播」** + **记入后观察/延期无专修** → 用户再撞上像「一直没修」。

**工作流补丁（须遵守）**：

| # | 要求 |
|---|---|
| G1 | 「静音/停播后面板高亮」须**分列**：冷启动从未播 → Off；Rise/音符静音后仍有 preferred → **高亮 preferred**（可另画 Off 行）；禁止一个 `silent→Off` 糊所有回流 |
| G2 | TRACKER / e2e 写「续播」必须注明 **seek 续播** vs **再开播**；若产品要断点，须锁 `currentTime`（或等价），禁止只绿「又有声了」 |
| G3 | P1 类「有问题」且用户写明路径 → 须专修或**书面延期（含理由）**；禁止「可保留观察」长期代替开修（同 F1） |
| G4 | 宽屏 Soundscape 位置属构图契约：改 `ft-wide-stage-sound` 布局须进 TRACKER 必测（靠右/不挡阿寅） |

**本回合落地**：查证写入本 §6.14 + `TEST_TRACKER`（6 曲入库关单；三 Bug 专行 post-v1）。**未改运行时**——待你点名开工 `fix/ambient-panel-memory-seek-right`。

### 6.14b 跟进：音符点不动 + 靠右未生效 · 双 CSS / 关面板语义（2026-08-05 晚）

**用户书面（PR #131 分支自检 · 5177）**：Rise 后再开面板 **高亮 OK**；静音断点续播 **OK**；但 Rise 后再点 **音符无反应不播**；宽屏面板 **仍不靠右**。要求每曲行加 Play/Pause。

**根因（非「没合 tip」）**：

| 层 | 事实 |
|---|---|
| E · 音符 | 面板已开且无声时，`_onNoteClick` **只关面板**；`consumeResumePreferredOnOpen` 仅在 **note-mute** 置位，**Rise/`endSession` 硬停不置位**。悬停开面板 → 点音符 = 关面板循环，看起来像「点了没反应」。高亮记忆修好后更易踩中（用户盯着高亮曲点音符期望开播）。 |
| F · 靠右 | `AmbientSoundscapeUI` 已改 `body.ft-wide-stage-sound` 靠右，但 **Idle 宽屏** 另有 `WideIdleMoreMenu` 规则 `body.ft-wide-park-secondary.ft-wide-stage-sound` **仍 `left:50%` + `translateX(-50%)` 且 `!important`**，特异性更高 → Idle 验收永远居中。典型 **改一处 CSS、漏姊妹选择器**。 |
| G · 工作流 | 自测若只在 Focusing（无 `ft-wide-park-secondary`）看靠右会绿；用户在 Idle 开面板则仍居中。缺「Idle park + Focusing」双路径布局验收。 |

**补丁**：

| # | 要求 |
|---|---|
| G5 | 改 `ft-wide-stage-sound` 布局时 **同步** `WideIdleMoreMenu` / Narrow 等同主题选择器；TRACKER 必测写清 **Idle 宽屏**（非仅 Focusing） |
| G6 | 音符：无声 + 有 remembered/resume → **开播 preferred**，禁止只 toggle 关面板；另提供 **每曲行 Play/Pause** 作显式控制 |
| G7 | 邀测写清 **worktree 端口**（本修 ≠ 主仓 5173） |

**本回合落地**：`shouldStartPreferredFromNoteClick` + 每曲 ▶/❚❚ + Idle 靠右对齐；TRACKER 更新反馈。

---

## 7. AI 修复验收规范

> **地位**：**硬性要求**（非建议）。凡 Agent 向用户报告某 Bug「已修复 / 已修好」，必须逐项满足本节 checklist；缺一项即**不得**使用「已修复」类表述。  
> **与 §2 关系**：N13（本地冒烟）、N15（文档 + 本地 commit）仍是研发收尾最低线；**Bug close 的充分必要条件以本节为准**——本地 commit 与本地测试绿**不等于**修复完成。  
> **Agent 承诺**：每次报告「已修复」时，必须在回复中**逐项列出** §7.6 checklist 五项的完成情况；某一项做不到须明确写「**未完成**」，禁止省略或含糊带过。

### 7.1 人工复测的角色定位

- 人工复测只能作为「**体验确认**」，**不能**作为唯一的正确性证据。
- 任何**用户可感知行为**的 Bug（用户能在界面上直接看到 / 感知到差异的），close 之前必须先有**自动化用例断言真实可见状态**（DOM 内容、界面文本等）；**禁止**只断言内部函数被调用或中间状态变化。
- 如果没有自动化用例覆盖，即使人工复测通过，也**不允许 close**——必须先补自动化。

### 7.2 「已绿」必须可验证，禁止自然语言自证

- **禁止**用「test:smoke 已绿」「全量 e2e 已绿」这类总结句作为完成证据。
- 每次声称测试通过，必须附带：**实际跑的命令**、**原始输出中的 pass/fail 数量**，或 **CI run 的链接**。
- 如果无法提供这些，视为**未完成验证**。

### 7.3 新增用例必须做红绿对照

- 任何为修复 Bug 而**新增**的自动化用例，必须**先在 Bug 修复前的代码上跑一次**，证明它会失败（**红**），并把失败输出记录下来。
- 再在修复后的代码上跑一次，证明它通过（**绿**）。
- 如果用例在 Bug 存在时**没有失败**，说明这条用例没测到点子上，**必须重写**，不能直接采信。

### 7.4 push + CI 是修复完成的必要证据，不是充分条件

- **本地 commit 不算修复完成**。
- 必须 **push 到共享分支**，并且由 **CI**（而非本地终端）跑过相关测试，才能进入「可声称已修复」的候选；任务收尾**默认** push + 开 PR（见 `git-agent-commit`）。
- 每次声称 Bug 已修复，必须同时给出：**commit hash**、**远端分支名**、**CI run 链接或状态**。
- **已合入 `develop` / CI 绿 ≠ 已修复**。五证里的 **人工复测** 不可因合并而省略；TEST_TRACKER 在你书面关单前保持「待人工测试」。

### 7.5 文档口径必须和实际测试覆盖范围一致

- 项目里任何「已自动化」「已覆盖」「已锁住」之类的描述，必须**准确说明测试范围**（是单元测试、集成测试，还是完整用户链路）；**禁止**用模糊表述掩盖真实覆盖范围。
- 每次修复涉及到相关描述时，需要同步检查 `SCENARIO_TESTS.md` / `TEST_TRACKER.md` 里是否有类似模糊表述，**一并修正**。
- **`TEST_TRACKER` 标「已通过」**另有强制覆盖分工（`qa-pass-coverage-split`）：关单时必须分列 e2e 已锁场景与人工已覆盖场景；e2e 绿 ≠ 整行故事已锁。条款 SSOT 在 `TEST_TRACKER`，勿在此复述完整门禁。

### 7.6 Bug close 的充分必要条件（checklist）

凡是声称某个 Bug **已修复**，回复中**必须**包含以下证据；**缺一项不能视为「已修好」**：

- [ ] **红**：新增 / 相关自动化用例在修复前被证明会失败（附失败输出）
- [ ] **绿（CI）**：修复后该用例及相关测试在 **CI**（非本地）跑绿（附命令 + 输出或 CI 链接）
- [ ] **push**：代码已 push 到共享分支（附 commit hash + 分支名）
- [ ] **文档口径**：涉及的文档覆盖范围描述已同步核对并修正（`SCENARIO_TESTS.md` / `TEST_TRACKER.md` 等）
- [ ] **人工复测**：已完成（**仅**作为体验确认，**不替代**以上四项）

**报告格式（强制）**：Bug 修复收尾回复须含独立小节，例如：

```markdown
### Bug 修复验收（§7 checklist）
- [x/未完成] 红：…（附输出摘要或链接）
- [x/未完成] 绿（CI）：…（命令 + pass/fail 或 CI run URL）
- [x/未完成] push：`<hash>` @ `<branch>`
- [x/未完成] 文档口径：…
- [x/未完成] 人工复测（体验确认）：…
```

任一项为「未完成」→ 回复正文**不得**写「已修复 / 已修好」，只可写诚实进度（如「已 push+PR，CI 绿后可合 develop；待人工测试」）。

### 7.7 案例：CI 基础设施本身也可能有 Bug（须留红绿证据）

> **教训**：§7 的红绿对照不只适用于产品代码。**CI workflow / 门禁脚本**漏步骤时，也会在「代码正确、本地全绿」时给出假红；修基础设施同样要记红绿，禁止只写「加了 npm ci」就当完成。

**事故（2026-07-22）**：`develop` 首次成功 push 后，`focus-tiger doc-contract check` 在 tip `60c129a` 上 **failure**（非产品逻辑回归）。

| 项 | 记录 |
|---|---|
| **症状** | Job 步 `Behavioral contracts (gate + scenario smoke)` 失败 |
| **红（修复前）** | CI：[`29916112037`](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/actions/runs/29916112037) / [`29915316012`](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/actions/runs/29915316012) → `ERR_MODULE_NOT_FOUND: Cannot find package 'three'`（`PoseManager.js`）。本地复现：暂时移走 `node_modules/three` 后跑同切片 → 同错。根因：workflow **未** `npm ci`；`scenario-smoke` → `HonestyCheckInController` → `EmotionController` → `PoseManager` → `three`。本地有 `node_modules` 故一直绿。 |
| **修** | `7b90283`：workflow 增加 `npm ci`（+ npm cache）；`DOC_CODE_CONTRACT.md` / `TEST_TRACKER` / `PROCESS` 注明依赖 |
| **绿（修复后 · CI）** | push `7b90283` @ `develop` → [`29919097318`](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/actions/runs/29919097318) → **completed / success**（`head_sha=7b90283…`） |
| **口径** | 此例证明：本地绿 ≠ CI 绿；CI 红 ≠ 产品 Bug。基础设施修复也走「红输出 + 绿 CI 链接」归档。 |

**注意**：本案例**不**单独 close「意图回显」产品 Bug——该 Bug 另有单元 / e2e / 人工复测门闩；本条只锁 **doc-contract workflow 缺依赖** 这一基础设施问题。

---

## 8. 窄屏故事矩阵

> **地位**：窄屏 / 双壳验收的**工作流规范**（叙事 + 强制口径）。布局细则仍以 `RESPONSIVE_LAYOUT.md` 为准；共享不变量落在 `SHARED_RESOURCES.md` §6。  
> **对称**：宽屏见 **§9**。原则共用——布局开关烟测 ≠ 完整用户故事。  
> **来源**：2026-07-25 窄屏连爆复盘（布局烟测通过、用户故事成片红）。  
> **一句话**：窄屏验收 = **完整用户故事矩阵**，不是「有没有 ActionBar / 有没有 ⋯」的壳切换烟测。

### 8.1 事故总判（2026-07-25）

近期验收把「窄屏」当成**布局开关烟测**（有没有 ActionBar / 有没有 ⋯），没有当成**完整用户故事矩阵**（Sit→Arrival→鞠躬开表、Honesty 桥接、点 ? 补救、叠层期间 chrome）。宽屏路径测得较满，窄屏只验了壳切换，所以一走故事就成片暴露。

### 8.2 流程根因（按权重）

1. **窄屏验收口径过窄（最大根因）**  
   场景 O / `RESPONSIVE_LAYOUT` 已知风险一类对照停在「375 → ActionBar + 抽屉」「≥480 → ⋯ 回来」，**没要求**在 375 上走通：Notice / Choose / 鞠躬后 Focusing HUD / Honesty 桥接顶栏 / 点 ? 补救。结果：宽屏人工可标「测试 OK」，窄屏仍是半成品验收。  
   （「宽屏测得较满」当时是**习惯与散落 TEST_TRACKER 行**，**不是**已写成的对称故事矩阵——见 §9。）

2. **新交互只验 Happy Path，没锁「邻接可点物」**  
   外侧取消 Notice/Choose 修过并测过「点空白 → 回 Idle」，但**已好清单 / 保护面缺了**：点 tip / 点气泡 ≠ 点空白。tip 落在选择框之上时，点击冒泡被当成外侧 →「点 hint 框面板也没了」。典型假修好：主路径绿，回流 / 邻接路径未锁。

3. **双壳（窄 park / 宽 park）缺少共享契约**  
   宽屏做了 park → tip remap 到 ⋯；窄屏有 remap 函数，但补救 ? 仍可能指到 park 掉的旧按钮坐标；Arrival / Honesty 叠层时 ActionBar / `#focus-hud` 被 suppress，却**没写清**「叠层期顶栏时间谁负责」。等于：壳换了，Hints / HUD 契约没同步升格成跨壳不变量。

3b. **把控件挪到新宿主后，e2e 仍只锁旧选择器（2026-07-26）**  
   L174 / W3 已验收「Arrival 开着时 ⚡ Quick Start 仍可见」。窄屏把三主钮搬到 `#ft-narrow-home-*` 后，`setSuppressed(true)` **整壳隐藏**连 Quick Start 球一起藏掉；而既有 e2e 仍只断言宽屏 dock `#quick-start-focus`（默认视口），**375 不红 → 假绿**。根因是：改宿主时未把「用户可见宿主」写进已好清单 / 未补窄屏回归锚。

3c. **并行分支丢已验收修复 + e2e 不锁视口（2026-07-26）**  
   `ca20d07`（鞠躬后 `ft-narrow-stage-companion`，三选一进视口）已在 `develop` / wide-idle 验收；`fix/scenario-o-375-chrome-layout` 从更早点分叉后**未 cherry-pick**，又叠 home 三球。用户侧表现为「鞠躬后没弹出三选一」（只剩 Sit/⚡/Honesty）。既有 A4 只断言 `.session-start-dock__panel` **属性可见**，park 下 DOM 可见但屏外仍**假绿**；含 `toBeInViewport` 的 375 e2e 只在 develop，本分支没有 → 丢修复不红。  
   **流程教训**：① 并行专题开工前对高风险契约（鞠躬→三选一 stage）做 merge-base / cherry-pick 核对；② 窄屏「可见」必须锁 **视口内**（`toBeInViewport` / stage class），禁止只锁 `hidden` 属性；③ 改 chrome 宿主时「已好清单」须显式含鞠躬后 Companion。

4. **自动化覆盖层与人工验收错位**  
   `test:smoke` / 多数 e2e 锁的是宽屏或「抽屉里有没有 Honesty」一类 DOM，**很少锁**：375 × Arrival tip 点击、375 × Choose 后 `#focus-hud`、375 × ? 补救锚点、375 × Arrival Breath 时 Sit 必须 `hidden`。于是：e2e 绿、宽屏 OK、窄屏故事红——符合「全绿 ≠ 观感/故事通过」，但流程上仍把窄屏当成「附带一眼」。

5. **「Arrival 开着藏 Sit」验收未在 375 回流钉死**  
   文档写过 Arrival 开着须藏 Sit，但 Breath（Inhale）仍见 Sit——说明只验了某一瞬间，或宽屏过了、**窄屏未作回流复测**。保护面写了，验收矩阵没落到 375。

6. **并行专题叠加，共享面滞后**  
   窄壳 → 宽屏 ⋯ → 外侧取消 → hint 补全，多专题串行/并行。每个专题的「已好清单」多写本专题，少写 Hints × 双壳、HUD × 叠层 × 窄 ActionBar。共享面变成最后才被窄屏故事打穿的债。

### 8.3 与回归锁的对照

| 原则 | 这次怎么被违背 |
|---|---|
| 修好 ≠ 只通 Happy Path | 外侧取消通了，tip 点击未测 |
| 已好清单 / 保护面 | 双壳、Hints、HUD 未列为跨任务不变量 |
| 单元 / e2e 绿 ≠ 可感知通过 | 缺 375×故事 断言与人工分列 |
| 一次一任务管范围，保护面管邻接 | 范围切对了，邻接复测（尤其 375）没跟上 |

### 8.4 工作流规范（强制 · 建议补进工作流落地）

以下四条自 2026-07-25 起视为本文件规范；Agent / 人工验收均须遵守。

#### N17 · 375 故事最小集（chrome 类任务默认步骤）

凡改动 **Idle chrome / Arrival / Honesty / Hints** 的任务，`TEST_TRACKER` 测试步骤**默认包含「375 故事最小集」**（DevTools **375×667**，`/?product=1`），不得只写「窄屏看一下壳」或只勾 §9 壳切换。

**375 故事最小集**（每条至少主路径；触及改动的子项须写明回流）：

| # | 故事 | 最低可见结果 |
|---|---|---|
| S1 | Sit → Notice（选择格可见；可外侧取消回 Idle） | 面板在；点空白取消后回 Idle |
| S2 | Notice → Breath → Choose → 鞠躬 → **Companion 三选一在视口** → 点选 → Focusing | 鞠躬后见 Here & Now / Offline / Flow（**非**直接 Focusing；窄屏须 `ft-narrow-stage-companion` / 面板 `toBeInViewport`）；点选后见 Focusing HUD |
| S3 | 点 **?** 补救 | tip 锚点正确（无乱指 park 掉的旧按钮）；可关 |
| S4 | Arrival / Honesty **叠层期间** chrome | 顶栏时间归属写死且可见约定成立；Sit 按契约显隐（见双壳不变量） |
| S5 |（若本任务触及）Honesty 桥接 / 回流再进 | 与宽屏门闩行为一致，无静默失败 |

壳切换烟测（375↔≥480 看 ActionBar / ⋯）**可以**保留，但**不替代**上表。

#### N18 · 「外侧取消」类修复须锁 tip 邻接

凡「点空白 / 外侧取消」类修复，必须追加回归（优先 e2e；确无法自动化 → `TEST_TRACKER` 永久人工锁路径）：

> **点 tip / hint 气泡 → 只关 tip，不关面板**（Notice / Choose / Companion / Honesty 等选择格仍在）。

禁止只验「点空白 → 回 Idle」就宣称外侧取消修好。保护面须显式写：点 tip ≠ 点空白。

#### N19 · 双壳共享契约（不变量落盘）

下列契约是**跨壳不变量**，须写在权威表里，**不是**各专题自己的实现细节：

| 契约 | 含义 | 权威落盘 |
|---|---|---|
| **Hints remap** | park 后 tip / ? 补救锚点必须 remap 到当前可见宿主（窄：ActionBar `?` 等；宽：⋯ 等），禁止仍指旧坐标 | `SHARED_RESOURCES.md` §6 + `RESPONSIVE_LAYOUT.md` |
| **Sit 显隐** | Arrival（含 Breath）开着时 Sit / 等价主 CTA 须按契约隐藏或不可点；NarrowIdleShell 与宽屏 dock **同一语义** | `SHARED_RESOURCES.md` §6 **机器块**（`arrival-sit-hidden` 等） |
| **Quick Start 显隐** | Arrival 全程 ⚡ 可见；窄屏宿主 `#ft-narrow-home-quickstart` | 同上（`arrival-quickstart-visible`） |
| **FocusHUD vs ActionBar** | Focusing / 叠层期：谁负责顶栏时间、何时 suppress ActionBar、何时露出 `#focus-hud`——宽/窄改一侧必须勾另一侧 | 同上 + `focusing-*` 行 |

宽屏或窄屏改一侧 chrome → 开工保护面与收尾复测**必须勾另一侧**（至少 375 故事最小集相关行 + 一侧 ≥480 对照）。

#### N20 · 关单话术（chrome 行 · 窄侧）

涉及 Idle chrome / Arrival / Honesty / Hints / dock / ActionBar 的 `TEST_TRACKER` 行：

- **禁止**仅凭「宽屏人工 OK」关单或改「已通过」。  
- 用户反馈 / 状态变更时须**注明「375 故事是否测过」**（测过哪些最小集行 / 未测则仍「待人工测试」或「有问题」）。  
- 可写：「宽屏 OK；**375 故事未测 → 仍待测**」——诚实半通过，禁止暗示整行已关。  
- 对称：仅「375 OK」亦不能单独关单——见 **§9 N24**。

### 8.5 收尾自检（触及窄屏 / chrome 时追加）

在 §3.3 通用门禁之外追加：

- [ ] `TEST_TRACKER` 步骤含 **375 故事最小集**（N17），非仅壳切换  
- [ ] 若为外侧取消类：已加「点 tip 只关 tip」回归（N18）  
- [ ] 双壳不变量已对照 `SHARED_RESOURCES` §6；改一侧已勾另一侧（N19）  
- [ ] 关单 / 状态文案未用「宽屏 OK」单独关闭 chrome 行（N20）  
- [ ] 若本任务亦动宽屏 chrome：已对照 **§9**（或注明宽屏故事未测）

### 8.6 跨视口可见性契约（Visibility Contract · N25）

> **地位**：结构性预防「只锁宽屏选择器 → 窄屏假绿」（2026-07-26 Quick Start 丢失根因）。  
> **SSOT**：`src/core/visibilityContractRegistry.js` → `SHARED_RESOURCES.md` §6 机器块。  
> **检测**：`npm run visibility:doc-check`（并入 `docs:check`）；改 suppress/hide → CI `npm run test:e2e:visibility`。

#### N25 · 「验收 OK」=「宽+窄自动化锁住」同任务发生（强制）

凡用户书面或人工验收某条**可见性**规则为 OK（某元素在某状态 × 某视口须可见/隐藏/不可点）：

1. **同一任务内**必须立刻：  
   - 在 `visibilityContractRegistry.js` 增/改对应行（宽屏 `wideSelector` + 窄屏 `narrowSelector`；`viewport: both` 时两者皆必填）；  
   - 补 **宽屏与窄屏** Playwright 锚点（或将该行标 `gap-*` 并在回复中明示「未锁视口」——**禁止**把未锁行写成 `locked`）；  
   - `npm run visibility:doc-sync`；  
   - 相关 e2e 进 `test:e2e:visibility` 派生列表（锚点文件自动收录）。  
2. **禁止**只把结论写进 `TEST_TRACKER`「用户反馈 / 已通过」却无 registry 行 + 双视口锚点——文字记录 ≠ 锁住。  
3. **禁止**「验收 OK」与「自动化锁住」之间留时间差（不可「下个任务再补 e2e」）。  
4. 改 `setSuppressed` / `hidden` / park / `is-arrival-quick` 等全局显隐开关时：本地与 CI 须跑 **整表** `test:e2e:visibility`，不得只跑本任务新增用例。

收尾自检追加：

- [ ] 本任务若有「人工验收 OK」的显隐结论 → registry 行 + 宽/窄锚点已同批落地（或诚实 `gap-*`）  
- [ ] 若改了 suppress/hide 面 → 已跑 `npm run test:e2e:visibility`

---

## 9. 宽屏故事矩阵

> **地位**：与 §8 **对称**的宽屏 / 桌面 chrome 验收规范。  
> **先前有无**：**没有**。仓库里最接近的是 `SCENARIO_TESTS.md`（视口未钉死的完整故事剧本）、`RESPONSIVE_LAYOUT.md` §五（功能对等双视口矩阵）、以及各 `TEST_TRACKER` 行里散落的「宽屏步骤」——**都不是**「宽屏 chrome 故事最小集」这种系统化强制口径。  
> **一句话**：宽屏验收 = **完整用户故事矩阵**，不是「有没有 ⋯ / 底栏清不清」的壳形态烟测；也不是「感觉测得比较满」。

### 9.1 为何需要对称（盲区评估）

「布局开关测过 ≠ 完整故事测过」是**通用原则**，不独属于窄屏。宽屏侧目前的支撑主要是：

| 已有 | 缺口 |
|---|---|
| `SCENARIO_TESTS` A–P 多在桌面默认视口走 | 未钉死「chrome 类任务默认必跑的宽屏最小集」 |
| `RESPONSIVE_LAYOUT` §6.2「≥900 主路径 + 回流」一行 | 未展开成状态串联 + 邻接可点物 |
| wide-idle e2e（Sit+⚡+⋯ 形态、Arrival 藏 Sit/⋯） | 锁的是**壳与代理入口**，不是 tip 邻接 / Honesty 桥接顶栏 / Breath 全程藏 Sit 等故事 |
| 人工「宽屏 P0 测 OK」口头习惯 | 关单时易被当成整行关闭证据，却未强制写「宽屏故事最小集测过哪些」 |

因此：**有必要**写 §9，避免下一轮只修宽屏清场 / Popover 时重演「壳绿、故事红」。

### 9.2 目标壳 vs 旧竖排 dock

| 壳 | 形态 | 本矩阵怎么用 |
|---|---|---|
| **目标壳**（产品意图 · **现行运行时**） | ≥480：`WideIdleMoreMenu`——常驻 **三球（Quick · Sit · Honesty）+ ⋯**；呼吸 / How / 提醒 / language 进 **向上 Popover**；Sit+⚡ 文案 pill 与 Honesty dock 入口 park；左下 `?` + 热力图保留 | 下表 **W1–W8** 按新壳测 |
| **目标壳（历史 · Sit+⚡+⋯）** | ≥480：常驻 Sit + ⚡ + ⋯；Honesty 曾在 ⋯ 内 | 仅对照旧 e2e / 截图；勿再当产品意图 |
| **旧竖排 dock**（清场未合入的工作区） | 底栏仍散落长文案次级钮 | **W1 / W4** 改为：各次级入口仍在底栏且**对应故事可走通**；**禁止**用「按钮都看得见」代替 W2/W3/W5/W6 |

分支未合入目标壳时，仍须跑故事最小集；只是 W1/W4 形态描述随壳变化。

> **人工验收提醒（强制）**：`feature/wide-idle-more-menu`（新宽屏 Popover / Sit+⚡+⋯）**准备合并进主开发线时**，才是 §9 **完整 W1–W8** 第一次被真正拿来验证的时机。那是一次**新的、独立的人工验收**，**禁止**与窄屏 375 chrome Bug 修复（§8 / 场景 O）的验收混在同一批关单话术里。Agent 在该合并 / Task 3 开工或验收回合须**明确提醒**用户。

### 9.3 工作流规范（强制）

#### N21 · ≥480 故事最小集（chrome 类任务默认步骤）

凡改动 **Idle chrome / Arrival / Honesty / Hints**（含宽屏 ⋯ / dock / ⚡）的任务，`TEST_TRACKER` 步骤**默认包含「宽屏故事最小集」**（建议 **≥900** 桌面或 DevTools **≥480**，`/?product=1`），不得只写「宽屏看一下清场」或只验「⋯ 在不在」。

**宽屏故事最小集**（目标壳表述；旧 dock 见 §9.2）：

| # | 故事 | 最低可见结果 |
|---|---|---|
| W1 | Idle 清场形态 | 常驻 **三球（Quick · Sit · Honesty）+ ⋯**；How / Sound FAB / 提醒**不在**底栏常驻簇（已 park）；左下 `?` + 热力图仍在 |
| W2 | Sit → Notice → Breath → Choose → 鞠躬 → Focusing | 左上 `#focus-hud` 进入 Focusing、计时走动；`#btn-focus` 呈 Rise |
| W3 | Arrival 全程（含 **Breath / Inhale**） | **Sit 与 ⋯ 隐藏**（或明确不可点）；**⚡ 仍可见**可 Quick Start；不得中途又露出可点 Sit。**窄屏**：用户可见宿主是 `#ft-narrow-home-quickstart`（勿只断言 dock 里已 park 的 `#quick-start-focus`） |
| W4 | ⋯ Popover 代理入口 | 打开 ⋯ → 至少抽测：**Honesty**（进补登/时长）、**How shall we sit?**（三选一）、**Sound**（**直接** Soundscape 选曲面，禁止只抬红色 FAB）、**提醒**（设置面板）——点选后 Popover 收起、真实面板出现 |
| W5 | 点 **?** 补救 / tip 锚点 | park 后 tip 须 remap 到可见宿主（常为 ⋯ 或仍可见的 `?`）；禁止乱指已 park 旧坐标 |
| W6 | 邻接可点物（外侧 / tip / Popover） | 见 **N22** |
| W7 | Focusing 期 chrome | **⋯ 隐藏**；Sound FAB 按契约回到可点位；`#focus-hud` 可读 |
| W8 |（若本任务触及）Honesty 桥接 / Rise 后再进 | 门闩与窄屏一致；无静默失败 |

「有没有 ⋯」「次级是否 park」类壳烟测**可以**保留，但**不替代**上表。

#### N22 · 宽屏邻接可点物回归（Popover + tip + 外侧）

宽屏特有叠层是 **⋯ 向上 Popover**；与 Arrival / Companion / Honesty 选择格共用「外侧取消」时，须显式锁邻接（优先 e2e；否则 `TEST_TRACKER` 人工锁路径）：

| 操作 | 必须结果 |
|---|---|
| Notice / Choose 打开时，点 **空白外侧** | 取消仪式回 Idle（不开表）；⚡ 仍可立刻开表 |
| 同上，点 **tip / hint 气泡** | **只关 tip，不关** Notice/Choose 面板 |
| ⋯ 菜单打开时，点菜单外空白 | **只关 Popover**，不误关无关的 Arrival / Honesty 面板（若当时未开则仅收菜单） |
| ⋯ 内点某一代理项 | 打开对应真实面板，且菜单关闭 |
| Companion 三选一打开时，点 tip | 只关 tip，不收起三选一（与 §8 N18 同族） |

禁止只验「点空白 → 回 Idle / 收菜单」就宣称外侧行为修好。

#### N23 · 双壳共享契约（改宽必须勾窄）

与 §8 N19 / `SHARED_RESOURCES.md` §6 同一张表。宽屏侧重提醒：

- **Hints remap**：次级 park 进 ⋯ 后，补救锚点不得仍指旧 How/Honesty/Sound 坐标  
- **Sit 显隐**：Arrival（含 Breath）开着 → Sit 藏；⋯ 亦 suppress（目标壳）；与窄屏抽屉主钮同语义  
- **FocusHUD vs 壳顶栏**：宽屏 Focusing 以 `#focus-hud` 为准；勿假设「没有 ActionBar 就可以不露计时」

改宽屏 chrome → 收尾至少勾 **§8 375 故事最小集**相关行（或注明窄屏未测）；改窄同理勾 §9。

#### N24 · 关单话术（chrome 行 · 宽侧）

- **禁止**仅凭「375 / 窄屏人工 OK」关单。  
- **禁止**仅凭「宽屏壳看起来清了 / ⋯ 在」关单。  
- 须注明「**宽屏故事是否测过**」（W1–W8 哪些 / 未测则仍待测）。  
- 可写：「375 OK；**宽屏故事未测 → 仍待测**」或「宽屏 W1–W4 OK；W5–W6 未测」。  
- 与 N20 合读：chrome 行关单需要**双视口故事**都有交代（测过或诚实未测），禁止单侧 OK 暗示整行关闭。

### 9.4 收尾自检（触及宽屏 / chrome 时追加）

- [ ] `TEST_TRACKER` 步骤含 **宽屏故事最小集**（N21），非仅清场/⋯ 烟测  
- [ ] Popover / tip / 外侧邻接已锁（N22）  
- [ ] 双壳不变量已勾窄侧或注明未测（N23）  
- [ ] 关单未用「单侧 OK」单独关闭 chrome 行（N24 + N20）
