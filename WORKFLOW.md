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
4. **禁止两 worktree 同时检出同一分支**（Git 硬限制）；共享契约文件（如 `TEST_TRACKER.md`、`PROCESS.md`、locale 大文件）同一时间只允许一个会话改。  
5. **合回主线**：功能分支经 PR（或团队约定的本地 merge）进入 `develop`；`main` 仍只走 PR + 负责人网页合并（见上文合并门禁）。push 仍须用户明确授权。  
6. **结束后清理**：分支已合入且不再需要本地目录时，在主仓执行 `git worktree remove <path>`；目录已删则 `git worktree prune`。未合入、未推送的 commit 不得先 remove。  
7. **能耗 ≠ 正确性**：worktree **隔离写盘**；同时开多个 worktree **窗口** + 多个**本地** Agent 仍会叠加本机 CPU/GPU（见 Process Explorer 的 Shared / extension-host）。并行任务优先：本地 ≤1–2 写会话，其余用 Cloud Agent；不用的窗口关掉。操作细则见 `focus-tiger/docs/PROCESS.md`「本地 Cursor 能耗」。

### 工作树占用检测与 `.ft-session-lock`（强制）

> **本小节为 SSOT**（索引：`RULES_INDEX.md` → `git-worktree-occupancy`）。与「并行 worktree」互补：上节要求**物理隔离**；本条要求**同一 worktree 内同一时间只服务一条工作线**，并用锁文件 + 开工检测拦住误用。

1. **锁文件**：每个 worktree **根目录**放 `.ft-session-lock`（已在 `.gitignore`，**禁止** commit）。建议 JSON 字段：`task_id`（任务/分支标识）· `session_label` · `started_at`（ISO）· 可选 `pid` / `agent_note`。
2. **写前检查（主闸 = Agent 规则）**：在本 worktree 内**写文件**或执行 `git commit` / `checkout` / `stash` / `pull` / `worktree` 变更前，须先读 `.ft-session-lock`：
   - **不存在** → 创建本任务锁，再工作；
   - **存在且是本会话的**（`task_id` / `session_label` 一致）→ 继续；
   - **存在但是别人的** → **立刻停止**，向用户报告锁全文，**不做任何修改**（含禁止「顺手 stash 别人的脏树」）。
3. **开工额外检查（三条硬规则）**：
   1. 若 `git status` 有未提交改动，且**不是本会话本轮产生的** → 先停再问用户；禁止静默 `git stash` / `git checkout --` / `git restore` 清掉别人的工作。
   2. 预计会跑验证或产生 git 写操作的任务，若当前是**主仓通用目录**（非专属 `…-wt-<topic>`）→ 须**主动建议**独立 worktree，不得默认在主仓开干。
   3. 若 `git stash list` 已有条目且**不是本会话刚创建的** → 只读汇报；**禁止**对非本会话创建的 stash 做 `pop` / `drop` / 再压一层。
4. **任务结束**：commit 完成或用户明确停止时，**只删除本会话创建的锁**。
5. **强制清锁（僵锁）**：**禁止** Agent 因「锁看起来过期 / 几小时前 / 看起来没人在用」自动删除**别人的**锁。清锁须用户当回合写出明确授权，且**必须包含**「我确认要强制清除锁」（或 `I confirm force-clearing the lock`）。模糊的「清一下」「把锁删了」**不构成**授权。
6. **检测脚本**：`cd focus-tiger && npm run check:worktree-occupancy`（只读报告：锁内容、脏树、stash 层数、是否主仓目录）。Agent 开工前应跑；脚本 **exit 0 仅表示报告成功**，发现别人的锁或不明脏树时 exit **2**，由规则强制停手。
7. **辅助闸（shell，可选后续）**：`beforeShellExecution` 可对 `git checkout|stash|commit|pull|worktree` 查锁并 deny/ask（与现有 destructive / full-e2e 闸同链、只读失败即 deny）。辅助闸**不能**替代主闸（Edit/Write 不经 shell）。**禁止**为实施本条而改动 deny-subagent / gate-full-e2e / gate-destructive-shell 的现有逻辑。


### 长期并存功能分支的同步纪律

> **本小节为 SSOT**（索引：`RULES_INDEX.md` → `git-sibling-branch-sync`）。叙事与事故背景见 [`DEV_WORKFLOW_QUALITY.md`](focus-tiger/docs/DEV_WORKFLOW_QUALITY.md) §6.6；规范编号 **N17**。  
> 与「并行 Cursor 会话 / worktree」互补：**worktree 管隔离写盘**；本条管**长期并存姊妹分支的内容是否失步**。

1. **修复落地即对照姊妹线（B1）**：存在长期并存的功能分支（例：窄屏抽屉 vs 宽屏 More 菜单，同属 Idle chrome 响应式变体）时，任一分支有**修复性** commit 落地，Agent 须在同次收尾前检查：另一条（或多条）姊妹分支是否基于同一逻辑、是否需要合入同一修复。禁止等到用户再说「是不是又漏了」。  
2. **共享入口修复须写进汇报清单（B2）**：触及 Sound / Honesty / Companion / 其它 §2.3 高风险面共享入口的修复，收尾「待你决定 / 待你知道」须点名：还有哪些活跃分支可能基于同一套逻辑、是否也要修。禁止默认「这次只改了当前分支」。  
3. **合回单线 vs 继续并行 → 用户拍板（B3）**：若两条分支本质是同一功能的响应式变体，Agent 应**提出**评估合回 `develop`（或单 feature 线）+ 断点处理差异的选项，**不得**自行决定长期并行或擅自 merge 策略。  

**反面教材**：`feature/wide-idle-more-menu` 建在窄屏初版 tip 上、未跟随后续窄屏修复 → 宽屏复现已修 bug（2026-07-21）。

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

1. 先过「合并 `develop` → `main`」门禁（见上节）；由**项目负责人**在 GitHub 完成合入（或明确授权本地 merge）。  
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
