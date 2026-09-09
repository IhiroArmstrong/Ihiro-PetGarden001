# COLLAB.md
# 禅境盆景项目 · 协作约定

**用途**：记录"我们怎么合作"的流程性共识，与产品设计文档（TASKS.md）、
执行任务书（Task NN Brief）严格分开，避免流程约定污染产品文档。

**更新频率**：极低。只有当协作方式本身发生变化时才更新这份文档。

---

## 一、角色分工

```
Claude（我）  → 产品经理 + 设计评审
  - 打磨产品设计细节、机制逻辑
  - 把产品需求转化为Cursor能直接执行的任务书（Task Brief）
  - Review Cursor产出的代码/效果，给出具体修改意见
  - 不直接写完整实现代码交付

Cursor        → 工程实现
  - 依据Task Brief在实际项目仓库里编写代码
  - 产出可运行的文件交给用户验收
```

---

## 二、三层文档结构

```
TASKS.md（主文档，稳定层）
  内容：产品该做什么、为什么这么设计、任务优先级与阶段划分
  更新时机：仅当"产品决策"本身变化时才更新，例如：
            新增/删除/合并任务、调整Phase顺序、产品设计哲学变化
  不更新的情况：协作流程调整、单个任务的实现细节确认

Task NN Brief（任务书，执行层，每任务一份）
  内容：该任务的具体规格——坐标、命名规范、验收清单等
        "Cursor写代码时才需要"的细节
  生命周期：任务验收通过后即结项，不需要长期维护
  命名建议：task{编号}-brief-{关键词}

COLLAB.md（本文档，协作层）
  内容：角色分工、文档更新规则等流程性共识
  更新时机：仅当协作方式本身改变时才更新
```

---

## 三、日常协作流程

```
1. 进入新任务前
   → Claude依据TASKS.md，撰写对应的Task NN Brief

2. Brief交付Cursor
   → 用户把Brief交给Cursor执行

3. Cursor产出代码/效果
   → 新增验收行走 `docs/tracker-entries/<分支名>.md`（UI →「待人工测试」；纯后端 →「仅单元测试覆盖」）。勿在 `TEST_TRACKER.md` 主表插行
   → 用户按 TEST_TRACKER（含碎片）验收；若有问题，反馈给Claude，对应行改「有问题」

4. Claude做设计评审
   → 给出具体修改意见（不是重写代码，而是指出"哪里需要怎么调整"）
   → 用户再交给Cursor修改；修复后行状态改回「待人工测试」等复测

5. 验收通过
   → 用户将 TEST_TRACKER 对应行标为「已通过」
   → 该任务的Brief结项，进入下一个任务
```

**TEST_TRACKER 约定**：权威路径 `focus-tiger/docs/TEST_TRACKER.md`。**新增行**写 `docs/tracker-entries/<分支名>.md`（见文首「新增行走碎片」）。**拼装触发**见同文「拼装触发」：功能 PR 禁止 `tracker:assemble`；批量人工测试前若有碎片须先独立 docs PR 拼装；下班前 Git 同步时若有任意碎片须另开拼装 PR（`tracker-eod-sync`）；满 5 个碎片 `tracker:check` WARN。Cursor 不得自行把「待人工测试」改成「已通过」；单元测试通过 ≠ 用户验收。用户书面测试意见只写进表格 **「用户反馈」列**，禁止混入「测试步骤」（见文首「用户测试反馈记入规则」，2026-07-19 起）。

**回归锁约定**：见 `.cursor/rules/focus-tiger-regression-lock.mdc`（门禁）与 `DEV_WORKFLOW_QUALITY.md`（叙事）；主题权威索引 `RULES_INDEX.md`。此处不复述。

**点击反馈约定（2026-08-14）**：含可点击交互的 Task Brief / PR 须回答「点击后 0–1 秒内用户看到什么」；设计静默须挂 `SILENT_BEHAVIORS.md` 的 `SB-xx`。全文见 `INTERACTION_FEEDBACK_PRINCIPLES.md`（`RULES_INDEX` → `interaction-feedback`）。

**功能冲突扫描约定（2026-08-16）**：实现前对照 `SCENARIO_TESTS.md` 做冲突扫描；有疑点须等用户拍板。全文见 `FEATURE_CONFLICT_REVIEW.md`（`RULES_INDEX` → `feature-conflict-review`）。

**共用机制核对约定（2026-09-09）**：新功能接入 overlayBusy / HUD 呼吸驱动 / 遮罩 dim 等共用机制时，Brief **禁止只打勾**。须写出可检查的核对结论句。清单在 `SHARED_RESOURCES.md` §4.1–4.2 与 `Z_INDEX.md`「Idle 常驻 chrome」。写法见下文「七」。
---

## 四、什么时候需要更新TASKS.md（判断标准）

问自己一个问题：**"这个变化，是不是改变了产品该长成什么样、或者该先做什么？"**

```
是 → 更新TASKS.md
     例：新增喂养机制、调整宽恕机制的缓冲天数、
        决定社交模块要不要提前

否 → 不更新TASKS.md，可能只需要更新对应的Task Brief，
     或者根本不需要落地成文档（口头/对话共识即可）
     例：角色分工确认、文件命名方式确认、
        某个任务内部的具体实现细节调整
```

---

## 五、并行 Agent 协作规则

> **SSOT**：并行 Cursor 写会话须用 git worktree 隔离 → 仓库根 [`WORKFLOW.md`](../../WORKFLOW.md)「并行 Cursor 会话：必须用 git worktree 隔离写操作」（`RULES_INDEX` → `git-parallel-worktree`）。本节为协作约定摘要，不另立平行规则。
>
> **由来（2026-07-27）**：两个并行 Cursor 会话在同一 worktree（`wt-docs-6.6`）上互不知情地各自推进，验证基线与实际 `develop` 状态对不上。以下规则用于物理隔离，避免再踩同一坑。

1. **单 worktree / 单分支单写者**：同一 worktree、同一分支，同一时间只能有一个 Agent/会话在写。并行开发必须开不同 worktree + 不同分支，禁止两个会话挤在同一 worktree 或同一分支上各干各的。
2. **开新会话前先查现场**：开始新的 Cursor 会话前，先跑 `git worktree list` 与 `git reflog`，确认没有其他会话正在同一 worktree/分支上进行中的工作。
3. **修复走短命分支 + PR**：修复类工作一律 `fix/*` 短命分支 + PR 合并进 `develop`，不直接在 `develop` 上改；合并后即删分支（删清单 = **PR head ∪ 正文 `Supersedes:` 旧支**，见下节）。
4. **验收结论须带三元组**：每条测试/验收结论必须注明 **commit hash + worktree 路径 + 本地端口**（例：`6545723 · …/wt-docs-6.6 · :5173`），禁止只说「在 develop 上测到……」。
5. **人工验收只认 `origin/develop` tip（强制）**：**SSOT** 见 [`TEST_TRACKER.md`](./TEST_TRACKER.md) 文首「人工验收唯一基线」。关单级结论若未报 hash、或 hash ≠ 当时 `origin/develop` tip → **无效**，须重新验证。feature/fix 试跑 ≠ 正式验收。  
6. **合入门闩 ≠ 关单（强制并列）**：合入 `develop` 看 **CI 绿**（`WORKFLOW.md` / `git-develop-small-pr-run-merge`）；关单只认 `origin/develop` tip 上的人工测试（`qa-develop-tip`），本机用固定 QA 树（`qa-develop-worktree`）。研发自检与主干同步见 `git-feature-merge-preview`。**禁止**因已合并而标「已通过 / 已修复」。批量测用口令「批量人工测试」。切会话用口令「生成交接」（见 `.cursor/rules/focus-tiger-session-handoff.mdc`；`RULES_INDEX` → `session-handoff`）。

### 分支寿命与健康度（摘要）

> **SSOT**：[`PROCESS.md`](./PROCESS.md)「分支健康度」。索引 `RULES_INDEX` → `git-branch-health`。

- **即时**：同主题优先刷新原分支；换名须 `Supersedes:` 并当日删旧 tip；合入后删 PR head ∪ Supersedes；开 PR 前做血统检查（勿把已重写残留的旧 tip 硬 merge 进 develop）。  
- **开分支前**：主题可能重叠时跑 `npm run check:all-branches-health -- --topic …`，命中则先问用户。  
- **例行（双周）**：`npm run check:all-branches-health`（提醒；**不**进 CI Required）。假 ahead、停更未 PR、空壳、疑似平行实现 → `needs_review`；有文档缺口则先 salvage 再归档。

---

## 六、Agent / Cursor · Git 同步约定（2026-07-27 · 2026-08-08 修订）

一批修复或任务在本地 **commit 验证通过后**，Agent **默认立即 push** 到**当前短命旁支**（`feature/*` / `fix/*` / `docs/*` 等），并开/更新 **base=`develop`** 的 PR；**不要**在仅本地存在的旁支上积攒多笔未推送 commit。

**禁止**直推 `origin/develop` / `origin/main`（受保护；只能经 PR 合入）。勿把「push 到 develop」写成默认同步目标。

**原因**：另一 Agent 或协作者可能基于较早快照合并同名分支（例：`fix/scenario-o-375-chrome-layout` 合并到 `726fc28` 时，遗漏了其后两笔仅存在于 reflog 的 commit），导致修复丢失、需 cherry-pick 补救。

| 动作 | 约定 |
|---|---|
| 本地 `git commit` | 验证通过后执行（见 `focus-tiger-regression-lock.mdc`）；可在旁支或本地 develop 上 commit，但**进远端主干必须经 PR** |
| `git push` | 任务完成后**默认** push 当前旁支并确保有 `--base develop` 的 PR；**禁止**直推 `origin/develop` / `origin/main` |
| 合入 `develop` | **仅经 PR**；**CI 绿即可合**（含运行时 PR）；见 `WORKFLOW.md` / `git-develop-small-pr-run-merge`；**不等**人工测试 |
| 生产 Worker | 须明确「部署」；见 `prod-worker-deploy` |
| 多 Agent 并行 | 开工前对齐远端旁支 tip；完工后 push 旁支，减少「已合并但缺 commit」窗口 |

细则与半自动脚本见 `PROCESS.md`「Git 同步」与 `DEV_WORKFLOW_QUALITY.md` §8。

---

## 七、Task Brief · 共用机制核对（强制写出结论句）

> **目的**：共用机制上的漏接 / 误伤，不是缺清单，是 Brief 只要求「已核对」却不留下可检查的文字。本条约束**写法**；三张清单本身不在本文复述。

触及下列任一者时，Brief 必须有一小节 **「共用机制核对」**（不触及则写一句跳过理由，不得省略该节）：

1. **overlayBusy / 叠层忙碌门闩** → 对照 `SHARED_RESOURCES.md` §4.1  
2. **HUD 呼吸 / 计时驱动** → 对照 `SHARED_RESOURCES.md` §4.2  
3. **z-index / overlay 遮罩 dim** → 对照 `Z_INDEX.md`「Idle 常驻 chrome（遮罩 dim 消费者）」

**合格**：每条写出**一句结论**，点名清单里的具体项，并写清「不受影响」或「需要联动」。

例：

- `本次改动涉及 z≥17 遮罩，核对后确认 Support FAB / Ambient 音符 / 倾听耳（z=24）须走 overlayBackdrop idle-chrome dim，不得只盖低于 17 的背景。`
- `本次新增 overlay 状态 \`fooOpen\`：默认计入 sceneAnim overlayBusy；核对后确认切语问候不得被它挡住（须在问候路径排除，类比 languageOpen）。`
- `本次新增带 breath 步的流程：核对 HUD 呼吸驱动者表后，须在主循环 \`overlayBreathing\` 接线，并验证左上角从 00:00 走动。`

**不合格（视为未做核对）**：

- 只有 `☑ 已核对 z-index 消费者清单`
- 「已对照三处打勾」但没有点名任何消费者
- 把「我这条新功能能跑通」写成核对结论

不触及三处时允许的跳过句（仍须出现在 Brief）：`本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩，三处核对跳过。`

运行时字段（如 registry 的 `busyGateExceptions`）**本约定不要求同 PR 改 JS**；先把结论写进 Brief。清单漏项则先补 `SHARED_RESOURCES` / `Z_INDEX` 再实现。

---
*版本：1.8 · 2026-09-09 Brief 共用机制核对须写结论句；CI 绿合 develop；人工测试事后批量*