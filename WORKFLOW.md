# Git 分支与工作流

> **适用范围**：整个仓库（`focus-tiger/` 及根目录文档）。  
> **协作细则**（Task Brief、回归锁、文档同步）仍以 [`focus-tiger/docs/PROCESS.md`](focus-tiger/docs/PROCESS.md) 与 [`focus-tiger/docs/DEV_WORKFLOW_QUALITY.md`](focus-tiger/docs/DEV_WORKFLOW_QUALITY.md) 为准；本文只约定 **分支职责与合并门禁**。

---

## 分支模型

| 分支 | 含义 | 谁在上面改 |
|---|---|---|
| **`main`** | 已验证稳定、**可发布给用户** 的版本 | **禁止**日常直接提交；只接收经门禁的合并 |
| **`develop`** | 日常集成分支，当前默认工作分支 | 所有新功能、常规 bug 修复的起点 |
| **`feature/<简述>`** | 从 `develop` 切出，做单一功能或文档任务 | 开发完成后合并回 `develop` |
| **`fix/<简述>`** | 从 `develop` 切出，修非紧急缺陷 | 修完后合并回 `develop` |
| **`hotfix/<简述>`** | 从 **`main`** 切出，修线上/稳定版紧急问题 | 修完后 **同时** 合并进 `main` 与 `develop` |

```
main     ●────────●────────────────●  （仅稳定发布点）
              \              /
develop  ●─────●──●────●────●────●     （日常集成）
                \  /      \  /
feature/*        ●        ●
```

---

## 日常改动在哪个分支？

1. **默认**：在 **`develop`** 上工作，或从 `develop` 切 `feature/…` / `fix/…` 分支。  
2. **禁止**：直接向 **`main`** 提交（含「顺手改一行」）。  
3. **小步提交，但按逻辑完整改动切分**：功能/修复/文档更新在各自分支上本地 commit；每个 commit 对应一个完整改动单元，而不是按时间点零散提交。  
4. **完成且验证通过后立即 commit**：无论代码还是纯文档，只要本任务的校验已通过（如 `docs:check`、相关测试、自检清单），不得把改动带到下一个任务周期仍未 commit。  
5. **commit message 必须说明 what + why**：至少能看出「改了什么、为什么改」；禁止 `update docs`、`misc fix`、`wip` 这类无信息量 message。  
6. **克隆仓库后**建议执行一次：  
   `git checkout develop`  
   以免误在 `main` 上开发。

### Agent / 自动 commit、push、禁自动合 main

> **权威（SSOT）**：[`.cursor/rules/focus-tiger-regression-lock.mdc`](.cursor/rules/focus-tiger-regression-lock.mdc)「Commit 汇报与分支门禁」（含自动 commit、单笔汇报、**Git 同步分级汇总**、禁自动合 main）。本文**不**复述条款；主题索引见 [`focus-tiger/docs/RULES_INDEX.md`](focus-tiger/docs/RULES_INDEX.md) `git-agent-commit`。

### 跨会话指令冲突处理（开 PR / 合并 / push 前）

> **本小节为 SSOT**（索引：`RULES_INDEX.md` → `git-cross-session`）。Agent **读不到**其他会话的对话原文；本条要求的是对 **仓库客观状态** 保持敏感。门禁文件只保留指针，勿在别处再抄全文。

1. **冷却后再查状态**：执行「开 PR」「合并进 `main`」「`git push` 到远程」等有一定不可逆性的操作前，若距上一次同类操作已超过约 **10–15 分钟**，须先核对仓库当前状态与最近的 commit / PR / CI 历史，确认没有更晚的、可能冲突的状态变化；**禁止**机械执行可能已过时的早期指令。  
2. **发现更晚活动 → 先问用户**：若同仓库已有更晚相关活动（例如已存在同方向 PR、远端 tip 已前进、CI 刚变红/变绿、其他分支上有更新的合并门禁相关提交），须 **先向用户确认**，不得按手头旧指令执行到底。  
3. **可查的客观信号（不依赖读其他会话）**：开放中的 PR、PR tip SHA、CI run 状态与时间、`git log` / `origin/*` 与本地 tip 对比、最近 push 时间戳等。

### 并行 Cursor 会话：必须用 git worktree 隔离写操作

> **本小节为 SSOT**（索引：`RULES_INDEX.md` → `git-parallel-worktree`）。「跨会话指令冲突」管的是 PR / push / 合 `main` 的冷静；**本条管的是文件系统隔离**。二者互补，不互相替代。

1. **并行写必须独立 worktree**：两个（及以上）Cursor Agent 会话若会同时改文件、`git commit`、或切分支，**禁止**共用同一份 checkout 目录。须用 `git worktree add` 为每个写会话挂独立工作目录（可共享同一 `.git` 历史），并在 Cursor 中分别打开对应目录。  
2. **只读可共用主仓**：仅查文档 / log / 状态、不写盘、不切分支的会话，可继续使用主仓库目录。  
3. **一 worktree ↔ 一分支 ↔ 一主任务**：新建任务默认 `git worktree add -b feature/<topic>|<fix>/<topic>|<chore>/<topic> <并列目录> <基线>`；基线通常为 `develop` tip，拆分/续作已有主题时用该主题分支 tip。目录与主仓**并列**（如 `../Zen-tiger-Pet-garden001-wt-<short>`），不要塞进主仓内部。  
3a. **合入受阻 / 多文件冲突**：涉及 merge 冲突、CI 红且预计 ≥3 文件或多轮试错时，**先**摘要冲突类型并问是否新开 worktree/分支；**禁止**在原共用目录反复本地长验证。本地最多 1 轮冒烟级自检，最终交给 push + CI（细则：`RULES_INDEX` → `agent-token-cost` 第 6 条）。  
4. **禁止两 worktree 同时检出同一分支**（Git 硬限制）；共享契约文件（如 `TEST_TRACKER.md`、`PROCESS.md`、locale 大文件）同一时间只允许一个会话改。  
5. **合回主线**：功能分支经 PR（或团队约定的本地 merge）进入 `develop`——**须先满足**下文「feature/fix 合入 develop 前：worktree 预览确认」；`main` 仍只走 PR + 负责人网页合并（见合并门禁）。push 仍须用户明确授权。  
6. **结束后清理**：分支已合入且不再需要本地目录时，在主仓执行 `git worktree remove <path>`；目录已删则 `git worktree prune`。未合入、未推送的 commit 不得先 remove。  
7. **能耗 ≠ 正确性**：worktree **隔离写盘**；同时开多个 worktree **窗口** + 多个**本地** Agent 仍会叠加本机 CPU/GPU（见 Process Explorer 的 Shared / extension-host）。并行任务优先：本地 ≤1–2 写会话，其余用 Cloud Agent；不用的窗口关掉。操作细则见 `focus-tiger/docs/PROCESS.md`「本地 Cursor 能耗」。

### 工作树占用检测与 `.ft-session-lock`（强制）

> **本小节为 SSOT**（索引：`RULES_INDEX.md` → `git-worktree-occupancy`）。与「并行 worktree」互补：上节要求**物理隔离**；本条要求**同一 worktree 内同一时间只服务一条工作线**，并用锁文件 + 开工检测拦住误用。

1. **锁文件**：每个 worktree **根目录**放 `.ft-session-lock`（已在 `.gitignore`，**禁止** commit）。JSON 字段：
   - **必填**：`task_id`（任务/分支标识）· `session_label` · `started_at`（ISO）· `updated_at`（ISO）· **`occupancy`**（见下）· `task`（当前工作一句说明，**不得**用自然语言替代 `occupancy`）
   - **可选**：`pid` / `agent_note` / `pr` 等
2. **`occupancy` 占用态（强制 · 不以 mtime 为准）**：写锁或更新锁时**必须**写明机器可读占用态；**禁止**靠锁文件 mtime、`git log` 时间戳或其它旁证去猜测「还在干活还是忘了清锁」。
   | 值 | 含义 | 下一会话可否接管 |
   |---|---|---|
   | `active` | **仍在占用中** | **否**（别人的锁 → 停手汇报；清锁须强制清锁口令） |
   | `releasable` | **已完成待释放，可以被下一个任务接管** | **可以**（下一会话可删除/覆盖为己锁，**不需要**「我确认要强制清除锁」；仍须在汇报里写明接管了哪把锁） |

   > **词义澄清（强制）**：上表 `releasable` **只**表示 `.ft-session-lock` 的占用态（可被下一任务接管）。**不是**「`develop` 随时可发布 / 主干完整性」。主干合入纪律请用 **develop-integrity**，见下文「feature/fix 合入 develop 前：worktree 预览确认」（`RULES_INDEX` → `git-feature-merge-preview`）。口语勿把二者都叫 releasable。

   规则：
   - **创建锁** → `occupancy` 必须为 `active`，并写 `started_at` / `updated_at`。
   - **会话中更新** `task` / 进度说明 → 保持 `active`，并刷新 `updated_at`。
   - **本会话工作已结束**但暂时不删文件（交接、等用户拍板、会话中断前收尾）→ 须把 `occupancy` 改为 `releasable` 并刷新 `updated_at`；**更优默认仍是直接删锁**。
   - **缺字段 / 非法值 / 非 JSON**：视为**未知占用**，按 **`active` 同等严格**处理（停手汇报）；**禁止**因「mtime 很旧」自行当成 `releasable`。
   - `task` 只描述做什么；占用结论**只认** `occupancy` 字段。
3. **写前检查（主闸 = Agent 规则）**：在本 worktree 内**写文件**或执行 `git commit` / `checkout` / `stash` / `pull` / `worktree` 变更前，须先读 `.ft-session-lock`：
   - **不存在** → 创建本任务锁（`occupancy: active`），再工作；
   - **存在且是本会话的**（`task_id` / `session_label` 一致）→ 继续（保持/刷新 `active`）；
   - **存在、别人的、且 `occupancy` 为 `releasable`** → 可接管：删除或覆盖为本任务锁，汇报原锁摘要后继续；
   - **存在、别人的、且 `occupancy` 为 `active` / 缺失 / 非法** → **立刻停止**，向用户报告锁全文（含 `occupancy`），**不做任何修改**（含禁止「顺手 stash 别人的脏树」）。可附 mtime 作参考，但**不得**据此自行清锁或接管。
4. **开工额外检查（三条硬规则）**：
   1. 若 `git status` 有未提交改动，且**不是本会话本轮产生的** → 先停再问用户；禁止静默 `git stash` / `git checkout --` / `git restore` 清掉别人的工作。
   2. 预计会跑验证或产生 git 写操作的任务，若当前是**主仓通用目录**（非专属 `…-wt-<topic>`）→ 须**主动建议**独立 worktree，不得默认在主仓开干。
   3. 若 `git stash list` 已有条目且**不是本会话刚创建的** → 只读汇报；**禁止**对非本会话创建的 stash 做 `pop` / `drop` / 再压一层。
5. **任务结束**：commit 完成或用户明确停止时，**只删除本会话创建的锁**。若因故保留锁文件，须先把 `occupancy` 标为 `releasable`（见上）。
6. **强制清锁（僵锁）**：**禁止** Agent 因「锁看起来过期 / 几小时前 / 看起来没人在用 / mtime 很旧」自动删除**别人的 `active`（或未知）**锁。清这类锁须用户当回合写出明确授权，且**必须包含**「我确认要强制清除锁」（或 `I confirm force-clearing the lock`）。模糊的「清一下」「把锁删了」**不构成**授权。`releasable` 不走本条（见第 2–3 款接管规则）。
7. **检测脚本**：`cd focus-tiger && npm run check:worktree-occupancy`（只读报告：锁内容、**解析后的 `occupancy`**、脏树、stash 层数、是否主仓目录）。Agent 开工前应跑；脚本 **exit 0** = 无阻挡性占用信号（无锁，或仅 `releasable` 且工作树干净）；发现 **`active` / 未知占用** 或不明脏树时 exit **2**，由规则强制停手（`releasable` 单独提示可接管，不因锁本身 exit 2）。
8. **辅助闸（shell，可选后续）**：`beforeShellExecution` 可对 `git checkout|stash|commit|pull|worktree` 查锁并 deny/ask（与现有 destructive / full-e2e 闸同链、只读失败即 deny）。辅助闸**不能**替代主闸（Edit/Write 不经 shell）。**禁止**为实施本条而改动 deny-subagent / gate-full-e2e / gate-destructive-shell 的现有逻辑。


### 长期并存功能分支的同步纪律

> **本小节为 SSOT**（索引：`RULES_INDEX.md` → `git-sibling-branch-sync`）。叙事与事故背景见 [`DEV_WORKFLOW_QUALITY.md`](focus-tiger/docs/DEV_WORKFLOW_QUALITY.md) §6.6；规范编号 **N17**。  
> 与「并行 Cursor 会话 / worktree」互补：**worktree 管隔离写盘**；本条管**长期并存姊妹分支的内容是否失步**。

1. **修复落地即对照姊妹线（B1）**：存在长期并存的功能分支（例：窄屏抽屉 vs 宽屏 More 菜单，同属 Idle chrome 响应式变体）时，任一分支有**修复性** commit 落地，Agent 须在同次收尾前检查：另一条（或多条）姊妹分支是否基于同一逻辑、是否需要合入同一修复。禁止等到用户再说「是不是又漏了」。  
2. **共享入口修复须写进汇报清单（B2）**：触及 Sound / Honesty / Companion / 其它 §2.3 高风险面共享入口的修复，收尾「待你决定 / 待你知道」须点名：还有哪些活跃分支可能基于同一套逻辑、是否也要修。禁止默认「这次只改了当前分支」。  
3. **合回单线 vs 继续并行 → 用户拍板（B3）**：若两条分支本质是同一功能的响应式变体，Agent 应**提出**评估合回 `develop`（或单 feature 线）+ 断点处理差异的选项，**不得**自行决定长期并行或擅自 merge 策略。  

**反面教材**：`feature/wide-idle-more-menu` 建在窄屏初版 tip 上、未跟随后续窄屏修复 → 宽屏复现已修 bug（2026-07-21）。

### feature/fix 合入 develop 前：worktree 预览确认（强制）

> **本小节为 SSOT**（索引：`RULES_INDEX.md` → `git-feature-merge-preview`）。  
> 与「并行 worktree / 占用锁」互补：那些管**写盘隔离**；本条管 **合进 `develop` 之前**须在隔离分支上测过、确认没问题。  
> 与 `qa-develop-tip`（关单只认 `origin/develop` tip）**并列、不互相替代**——见下文「两层验收」。

#### 硬规则

1. **先测后合**：`feature/*` / `fix/*`（及同类短命支）须在其 **worktree / 分支 tip** 上完成预览或等价自检，**用户（或任务书指定验收人）确认没问题之后**，再开 PR / 合并进 `develop`。  
2. **禁止先合再测当默认路径**：不得把「先 merge 进 develop，再在 develop 上才第一次给人预览」当成常规流程。  
3. **推荐动作顺序**：在 feature worktree 起 Vite（或等价预览）→ 提供本地 URL（Safari）→ 确认 → **再**决定 push / 开 PR / 合入。Agent **不得**在未经确认时擅自合并进 `develop`。

#### 为什么（develop-integrity）

目标：**保护 `develop` 的主干完整性（develop-integrity）**——日常集成分支应尽量保持可继续开发、可开 PR 往 `main` 走的状态，不把「未在隔离支上确认过」的改动默认冲进主干。

| 先合再测的代价 | 先测后合 |
|---|---|
| `develop` 上出现坏 commit → 往往要 revert；并行分支（例：同时存活的 hints 簇）若已基于坏 tip 继续开发，revert 会牵连它们 | 最坏是本 feature 分支作废或重开，**对 `develop` 零影响** |
| 他人（或下次新 worktree）从 `develop` 切出即带着坑 | 隔离性价值：坑留在短命支上 |

> **词义澄清（强制）**：此处 **develop-integrity（主干完整性）≠** `.ft-session-lock` 的 `occupancy: "releasable"`（会话锁「可被下一任务接管」）。二者字面都可能被口语说成「releasable」，**禁止混用**：谈合入纪律用 **develop-integrity**；谈占用锁仍只用 `occupancy` 枚举值 `releasable`。

#### 两层验收（必须并列理解）

| 层 | 何时 | 基线 | 作用 |
|---|---|---|---|
| **合前预览确认**（本条） | **合并进 `develop` 之前** | 当前 `feature/*` / `fix/*` worktree tip + 端口 | 决定「能不能合进主干」；失败 → 不合 / 继续修 |
| **关单级人工验收**（`qa-develop-tip`） | **已合入 `develop` 之后** | **仅**当时 `origin/develop` tip | 决定 TEST_TRACKER 能否标「已通过」/ 关闭「有问题」 |

**禁止**把「关单只认 develop tip」读成「所以应该先合再测才算正式」。合前预览是 **合入门闩**；合后 tip 验收是 **关单门闩**。feature 上的试跑仍 **不得**单独当作关单证据（见 `TEST_TRACKER.md`）。

#### 合入前是否须同步（rebase/merge）`develop`——可执行判断

worktree 在**切出那一刻**已含当时 `develop` 的全量内容；之后 `develop` 若前进，本支**不会**自动跟上。是否须在合入前 `rebase`/`merge` `origin/develop` 并**重测**，用命令判定——**禁止**仅靠「我觉得改动挺小」跳过。

在功能分支 tip 上执行（先 `git fetch origin develop`）：

```bash
# A = 本支相对 merge-base 改过的文件
git diff --name-only origin/develop...HEAD | sort -u > /tmp/ft-ours.txt
# B = develop 上本支尚未包含的提交所改文件（develop 相对 merge-base）
git diff --name-only HEAD...origin/develop | sort -u > /tmp/ft-theirs.txt

echo "--- commits on develop not in HEAD ---"
git log --oneline HEAD..origin/develop

echo "--- overlapping files (if any) ---"
comm -12 /tmp/ft-ours.txt /tmp/ft-theirs.txt
```

| 判定 | 条件 | 动作 |
|---|---|---|
| **可直接推进合入流程**（就同步而言） | `git log -1 HEAD..origin/develop` **为空**（develop 无本支缺少的提交） | 无需为「跟上 develop」而 rebase；仍须完成本条的预览确认 |
| **必须先 rebase/merge 再重测** | develop 有本支缺少的提交（上表 log **非空**），**且** `comm -12` 输出 **非空**（文件有交集） | 在本 worktree `rebase` 或 `merge origin/develop` → 解决冲突 → **重新**预览/冒烟 → 再开 PR / 合入 |
| **建议仍 rebase（非文件硬拦）** | develop 前进但文件无交集 | 不强制为文件重叠；若分支**存活较久**或触及共享契约大文件，仍建议合入前同步一次并快测 |

辅助对照（可读性，不替代上面的交集判定）：

```bash
git log origin/develop..HEAD --stat    # 本支将带进 develop 的变更
git log HEAD..origin/develop --stat  # develop 上多出来、本支还没有的变更
```

#### 预览豁免（严格 · 防滥用）

可勾选「跳过 Vite/产品壳预览」**当且仅当**同时满足：

1. 对 `origin/develop...HEAD` 做 `git diff --name-only`，**每一个**改动路径都**不**落在下列**运行时路径**（命中任一 → **整 PR 不得豁免**，即使同批还有 `.md`）：
   - `focus-tiger/src/**`
   - `focus-tiger/public/**`
   - `focus-tiger/e2e/**`
   - `focus-tiger/index.html`（及会进 Vite 入口的其它产品 HTML）
   - 任意 `*.vue`；以及 `focus-tiger/src` 下的 `*.css` / `*.html`（已含于 `src/**`）
2. **禁止**仅凭「文件后缀是 `.md`」「PR 标题写了 docs」「改的是脚本注释」自称豁免。  
3. **允许**出现在豁免 PR 里的典型路径：`**/*.md` / `**/*.mdc`、仓库根 `WORKFLOW.md`、`.github/**`（模板/workflow 文案）、`focus-tiger/docs/**`、以及**不进产品 Vite 打包**的门禁/检测脚本（如 `focus-tiger/scripts/rules-authority-registry.js`、`docs-check` 相关）。若脚本改动会改变**产品运行时行为** → 仍不得豁免。  
4. 豁免时仍须勾选并写清理由；仍须跑本条的 **develop 同步判定**（文件重叠则先 rebase）。

#### 与 PR 模板

开向 `develop` 的 PR 须勾选模板中合前预览项（见 `.github/PULL_REQUEST_TEMPLATE.md`）。未勾且不满足上节豁免 → 审查时应拦回补做。

### develop 文档 / 小 PR：CI 绿后弹 Run 合并（默认习惯 · 2026-08-04）

> **本小节为 SSOT**（索引：`RULES_INDEX.md` → `git-develop-small-pr-run-merge`）。  
> 用户拍板：对 **合入 `develop` 的文档/小 PR**，默认不再停在「请你去 GitHub 手点 Merge」；改为 Agent 在 CI 绿后发起合并命令，由你点 Cursor 弹出的 **Run**（Auto-review）完成授权。

#### 适用范围（须同时满足）

1. **base = `develop`**（**不是**合进 `main`）。  
2. **文档 / 小 PR**：相对 `origin/develop...HEAD` 的改动路径全部满足上文「预览豁免」的非运行时条件（无 `focus-tiger/src/**`、`public/**`、`e2e/**` 等运行时路径）。典型：`*.md` / `*.mdc`、`WORKFLOW.md`、`.github/**` 文案、`focus-tiger/docs/**`、纯门禁/检测脚本（不改产品运行时）。  
3. **本回合已开出的 PR**（Agent 刚 `gh pr create` 或用户明确要推进的同一文档/小 PR）。  
4. **push / 开 PR 本身仍须你当回合授权**（本条不授权静默 push）。

#### 默认收尾动作（强制）

在已 push 且 PR 已开之后，Agent **须**走合并收尾，**禁止**默认只写「请你上 GitHub 合并」就结束（除非下方「不适用」）：

1. **查一次** Required checks（`pre-merge with develop`、`test:pr-smoke` 等；`gh pr checks` / `gh pr view --json statusCheckRollup`）。  
2. **已全绿** → 立刻执行 `gh pr merge <n> --merge`（或团队当时约定的 merge 方式）。若 Cursor Auto-review 弹出 **Run** → 等你点 Run；点过即视为本 PR 合并授权。  
3. **尚未绿** → **只做一次** `gh pr merge <n> --auto --merge`（启用 GitHub auto-merge），汇报 PR URL +「等 CI 绿后自动合 / 或你再点一次 Run」；**禁止**在本回合轮询长 CI（见 `agent-token-cost`）。  
4. 合并成功后汇报：**PR 号**、**merge commit 短 hash**、**`origin/develop` tip**。

#### 不适用（仍「通知你合并」或等你点名）

- 合进 **`main`**（永远须你明确下令；见 `git-merge-main`）。  
- **运行时 / 产品逻辑** PR（命中预览豁免黑名单任一路径）——默认仍「通知你合并」；除非你当回合写明「合理则办 / 请合 / CI 绿了就合」。  
- 「请安排下班前的 Git 同步」口令：**仍不**顺手推进无关 PR（见 regression-lock 第 7 条）；本条只管本回合文档/小 PR 的收尾。  
- 检查红 / 冲突 / 不可 MERGEABLE → 停手汇报，不硬合。

#### 与「谁点了合并」

`gh` 使用你的登录态；GitHub `mergedBy` 仍是你。Cursor **Run** = 批准 Agent 代跑合并命令，**不是**另发一套 Agent 特权。

---

## 何时可以把 `develop` 合并进 `main`？

`main` 代表「可以交给用户」的快照。合并前须 **全部满足**：

### 自动化门禁（在 `focus-tiger/` 目录执行）

```bash
cd focus-tiger
npm run test:smoke    # 控制器 / 门闩逻辑冒烟
npm run test:e2e      # Playwright 产品壳 DOM 冒烟
```

二者须 **全绿**。注意：**全绿 ≠ 序列观感通过**（Idle 不闪等仍须人工，见 `DEV_WORKFLOW_QUALITY.md` §6.1）。

### 场景与人工验收

按 [`focus-tiger/docs/SCENARIO_TESTS.md`](focus-tiger/docs/SCENARIO_TESTS.md) 走完本次改动涉及的 **场景故事**（建议产品壳 `http://localhost:5173/?product=1`）。  
涉及功能在 [`focus-tiger/docs/TEST_TRACKER.md`](focus-tiger/docs/TEST_TRACKER.md) 中：

- 无「有问题」未关闭项  
- 本次相关行已标为「待人工测试」并完成复测，或已书面确认通过  
- 发版前另跑 `npm run check:open-blockers -- --release-gate`（见 regression-lock「发布候选门禁」/ `RULES_INDEX` → `release-blocker-ledger`）；逾期 `release-blocker` 硬拦；`legacy-unclassified` 仅提醒不硬拦  


### 回归与文档

- 无 **已知回归**（含门闩静默失败、已验收观感被改坏）  
- 触及行为/情绪/架构时，权威 md 已与代码同批更新（N15）  
- 合并前在 `develop` / `feature/*` / `fix/*` 上完成 **本地 commit**；且这些 commit 已按**逻辑完整改动**组织、message 可读；`git push` 仍须团队约定后执行  

### 推荐合并步骤

> **注意**：若 GitHub 已对 `main` 开启 **branch protection**（禁止直接 push、要求 PR），下方本地 `git merge --no-ff` **不能**代替「经 PR 合入」；应开 PR：`develop` → `main`，通过检查后再合并。未开保护时，本地 merge + `git push origin main` 仍可用，但须用户明确指令（见上节第 3 条）。

```bash
# 无 branch protection 时（须用户明确授权合并进 main）
git checkout main
git pull origin main          # 若已与远程同步
git merge --no-ff develop -m "release: <简述本次稳定点>"
# 稳定版须打 annotated tag（见「语义化版本与稳定发布点」）
git tag -a vX.Y.Z -m "稳定发布点说明"
```

合并后 `main` 与 `develop` 可继续并行；`develop` **不要** 删除。

---

## 语义化版本与稳定发布点

> **本小节为 SSOT**（索引：`RULES_INDEX.md` → `git-semver-release`）。其它文档只引用，勿平行复述完整条款。

### 拍板（2026-07-30）

- **方案**：遵循 [SemVer 2.0.0](https://semver.org/)：`MAJOR.MINOR.PATCH`。  
- **稳定版标记**：**在 `main` 上打 annotated Git tag**（形如 `v1.0.0`），**不**在开发阶段切 `release/1.0`（或同类）长期分支。  
- **为何用 tag、不用 release 分支**：当前是单线演进（`develop` → `main`）；tag 轻量、可回滚定位、不增加并行合流成本。仅当未来需要**同时维护多条已发布大版本**（例：给 1.x 打补丁的同时 `develop` 已在做 2.x）时，再开 `release/<major>.<minor>`；届时须书面更新本节，不得默默开支。

### 版本号含义（产品向）

| 位 | 何时递增 | 例 |
|---|---|---|
| **MAJOR** | 对用户或本地数据有破坏性变化（须迁移/清空、去掉已依赖能力、协议不兼容） | `1.0.0` → `2.0.0` |
| **MINOR** | 稳定线上新增用户可感知能力，且向后兼容 | `1.0.0` → `1.1.0` |
| **PATCH** | 稳定线上 bug 修复 / 文案与观感打磨，无破坏、无新能力承诺 | `1.0.0` → `1.0.1` |

### 首个稳定版与 pre-1.0

- **第一个交给用户的稳定版** = **`v1.0.0`**（annotated tag 打在对应 `main` tip）。  
- **`v1.0.0` 之前**：日常开发在 `develop`；若偶有 `develop`→`main` 的工程性合并，**可不打用户向稳定 tag**，或仅用 `v0.x.y` 作内部里程碑（`0.x` = 尚未承诺稳定对外）。`focus-tiger/package.json` 的 `"version"` 在首个稳定版前可保持 `0.0.0` / `0.x.y`。  
- **打出 `v1.0.0` 起**：每次稳定发布须同步把 `focus-tiger/package.json` 的 `"version"` 写成**去掉 `v` 前缀**的同号（例 tag `v1.0.1` ↔ `"1.0.1"`），与 tag **同批**进该次发布相关 commit / PR（禁止只改一边）。

### 发版操作要点

1. 先过「合并 `develop` → `main`」门禁（见上节）；由**项目负责人**在 GitHub 完成合入（或明确授权本地 merge）。打 tag 前须已跑 `check:open-blockers -- --release-gate`（见 regression-lock「发布候选门禁」）。
2. 在**已合入的 `main` tip**上打 annotated tag 并 push tag（须用户明确授权 push；Agent **禁止**擅自 `git tag` / `git push --tags` / 开 `release/*`）：
   ```bash
   git checkout main && git pull origin main
   git tag -a vX.Y.Z -m "<一句话：本版稳定点>"
   git push origin vX.Y.Z
   ```  
3. **禁止**用轻量 tag（`git tag vX.Y.Z` 无 `-a`）充当稳定版；**禁止**把稳定 tag 打在未合入 `main` 的 `develop` / feature tip 上。  
4. 稳定版紧急修复仍走 `hotfix/*` → `main` + `develop`；修完后按 PATCH（或必要时 MINOR）再打新 tag。

---

## 合并 main 前的日常检查清单

每次看到一个 PR 准备合并进 `main` 之前，项目负责人会依次确认：

1. **`test:smoke` + `test:e2e` 是否全绿**  
2. **CI 是否有环境配置问题导致的误报**（而非真实业务失败）  
3. **这次改动是否涉及状态机 / 门闩 / 跨模块逻辑 / 主观体验**（观感、动画、文案语气等）——如果是，要求走完 [`focus-tiger/docs/SCENARIO_TESTS.md`](focus-tiger/docs/SCENARIO_TESTS.md) 里相关场景的人工验收  
4. **[`TEST_TRACKER.md`](focus-tiger/docs/TEST_TRACKER.md) 里是否有和这次改动直接相关、且仍标「有问题」的未关闭项**——如果有，需要先关闭或明确记录为「已知问题，不影响此次合并」  
5. **负责人自己是否清楚这次改动具体是什么、为什么改**

**量级裁剪**：

- **小范围改动**（如文案、样式微调、无状态逻辑变化的单点 bug 修复）：第 3、4 条可以从简甚至跳过。  
- **涉及状态 / 跨模块 / 用户可感知体验的改动**：第 3、4 条必须完整走完。

### Agent 职责（自查汇报，不代替合并）

每次有 PR 准备合并进 `main`，Agent 须先按本清单自查一遍，并向用户汇报：

- 这次改动属于哪个量级（小范围 vs 状态/跨模块/可感知体验）  
- 5 条里哪些已满足、哪些还需要用户确认  

**最终点击合并的动作，始终由项目负责人本人在 GitHub 网页上执行**；Agent 不得代为合并进 `main`。

### 临时门槛与后续 CI（PR #2 起）

- **临时**：在「CI 全量 smoke + e2e」落地前，合并进 `main` 可接受 **本机** `npm run test:smoke` + `npm run test:e2e` 全绿，加上现有 CI **`focus-tiger doc-contract check`** 绿（见 `PROCESS.md` 合并门禁拍板）。  
- **后续**：须另开 PR 把完整 `test:smoke` / `test:e2e` 纳入 GitHub Actions；目标与范围见 `PROCESS.md` Backlog「CI 全量 test:smoke + test:e2e」。**禁止**把「长期只靠本机手跑」当成常态。

---

## 「改坏了什么」如何快速恢复？

按严重程度选择：

### A. 只在 `develop` / 功能分支上改坏（`main` 仍干净）

**首选**：在坏提交之上修正，或 `git revert <坏提交>`，不要动 `main`。

```bash
git checkout develop
git log --oneline -5          # 找到坏提交
git revert <commit-hash>      # 安全：新增反向提交，保留历史
# 或尚未 push 时：git reset --hard <好提交>  （仅本地、且确认无人基于坏提交工作）
```

需要丢弃整个功能分支时：切回 `develop`，删除 `feature/…` 即可，`main` 不受影响。

### B. 错误合并进了 `main`（稳定版被污染）

**首选 `git revert`（保留历史、适合已 push 的情况）**：

```bash
git checkout main
git revert -m 1 <merge-commit-hash>   # 撤销一次 merge
# 修好后把同样修复 cherry-pick / 合并回 develop，避免分叉再次踩坑
git checkout develop
git cherry-pick <修复提交>
```

**回退到上一个已知好标签/提交（仅本地或团队一致同意、且可 force-push 时）**：

```bash
git checkout main
git log --oneline              # 或 git tag -l
git reset --hard v0.x.y        # 或具体 commit
# 若已推远程且必须对齐：须团队同意后再 git push --force-with-lease
```

### C. 工作区未提交就乱了

```bash
git stash push -m "wip"
git checkout develop
git pull
# 需要时再 git stash pop
```

或丢弃未提交改动（**不可恢复**）：

```bash
git checkout -- <文件>
git restore .
```

### D. 紧急线上修复（`main` 已发布且必须立刻修）

```bash
git checkout main
git checkout -b hotfix/<简述>
# 修 + 测 + commit
git checkout main && git merge --no-ff hotfix/<简述>
git checkout develop && git merge --no-ff hotfix/<简述>
```

### 原则

- **保护 `main`**：恢复优先用 `revert`，慎用 `reset --hard` + force push。  
- **修完记得同步 `develop`**，避免下次发布把旧 bug 带回来。  
- 素材与大文件勿进 Git；本地 zip 源文件见根目录 `.gitignore`。

---

## 与现有流程的关系

| 主题 | 权威（SSOT） |
|---|---|
| 分支 / 合并 main / SemVer 与稳定 tag / 跨会话冲突 / 并行 worktree / 姊妹分支同步 | **本文** `WORKFLOW.md`（见 [`RULES_INDEX.md`](focus-tiger/docs/RULES_INDEX.md)） |
| Agent commit / 汇报 / push / 禁自动合 main | [`.cursor/rules/focus-tiger-regression-lock.mdc`](.cursor/rules/focus-tiger-regression-lock.mdc)「Commit 汇报与分支门禁」 |
| 回归锁完工门禁、Bug close §7 | 同上 regression-lock；叙事见 [`DEV_WORKFLOW_QUALITY.md`](focus-tiger/docs/DEV_WORKFLOW_QUALITY.md) |
| 场景测试剧本 | `focus-tiger/docs/SCENARIO_TESTS.md` |
| 功能点验收表 | `focus-tiger/docs/TEST_TRACKER.md` |
| Task / 角色分工 | `focus-tiger/docs/PROCESS.md`、`focus-tiger/docs/COLLAB.md` |

---

## 快速对照

| 我想… | 做法 |
|---|---|
| 日常开发 | `git checkout develop` → `feature/…` 或直接 commit |
| 开第二个写会话 | `git worktree add -b feature/… ../…-wt-… develop`（见「并行 Cursor 会话」） |
| 修 bug（且有姊妹功能分支） | 修完后对照姊妹线是否需同修；写入「待你决定 / 待你知道」（见「长期并存功能分支的同步纪律」） |
| 修 bug | 从 `develop` 切 `fix/…` |
| 纯文档更新 | 在 `develop` 或 `feature/…` 上改、跑 `docs:check`、**立刻 commit** |
| 发布稳定版 | 过门禁 → `main` ← merge `develop` → **annotated tag** `vX.Y.Z`（首稳 = `v1.0.0`；**不**切 `release/*`） |
| 稳定版紧急修 | 从 `main` 切 `hotfix/…` → 合并回 `main` + `develop` |
| 开发改坏了 | `develop` 上 revert / reset；**不要**先动 `main` |
| `main` 被误合并 | `main` 上 `git revert` 或 reset 到 tag |
