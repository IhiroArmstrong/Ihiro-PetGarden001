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

### 开 PR 前 · `--base` 自查（硬性 · 2026-08-07）

> **本小节为 SSOT**（索引：`RULES_INDEX.md` → `git-pr-base-develop`）。教训：PR #164 漏写 `--base develop`，GitHub 默认打到 `main` 并被合入。

Agent 执行 `gh pr create`（或等价开 PR）**之前**必须确认：

1. **默认 base = `develop`**：日常 `feature/*` / `fix/*` / `docs/*` PR **必须**显式 `--base develop`（或 UI 选 `develop`）。  
2. **禁止默认打到 `main`**：除非用户**当回合书面**要求「开往 `main`」或「`develop` → `main` 发版 PR」。  
3. **开完立刻核对**：`gh pr view <n> --json baseRefName`（或 PR 页 base）须为预期；若误为 `main` → **立刻改 base 或关 PR 重开**，禁止带着错误 base 等 CI / 催合。

### 跨会话指令冲突处理（开 PR / 合并 / push 前）

> **本小节为 SSOT**（索引：`RULES_INDEX.md` → `git-cross-session`）。Agent **读不到**其他会话的对话原文；本条要求的是对 **仓库客观状态** 保持敏感。门禁文件只保留指针，勿在别处再抄全文。  
> 对话交接摘要（口令「生成交接」）见 [`.cursor/rules/focus-tiger-session-handoff.mdc`](.cursor/rules/focus-tiger-session-handoff.mdc)（`RULES_INDEX` → `session-handoff`）。**本条不管**交接模板，只管 push / 开 PR / 合 main 前查仓库客观状态。

1. **冷却后再查状态**：执行「开 PR」「合并进 `main`」「`git push` 到远程」等有一定不可逆性的操作前，若距上一次同类操作已超过约 **10–15 分钟**，须先核对仓库当前状态与最近的 commit / PR / CI 历史，确认没有更晚的、可能冲突的状态变化；**禁止**机械执行可能已过时的早期指令。  
2. **发现更晚活动 → 先问用户**：若同仓库已有更晚相关活动（例如已存在同方向 PR、远端 tip 已前进、CI 刚变红/变绿、其他分支上有更新的合并门禁相关提交），须 **先向用户确认**，不得按手头旧指令执行到底。  
3. **可查的客观信号（不依赖读其他会话）**：开放中的 PR、PR tip SHA、CI run 状态与时间、`git log` / `origin/*` 与本地 tip 对比、最近 push 时间戳等。

### 并行 Cursor 会话：必须用 git worktree 隔离写操作

> **本小节为 SSOT**（索引：`RULES_INDEX.md` → `git-parallel-worktree`）。「跨会话指令冲突」管的是 PR / push / 合 `main` 的冷静；**本条管的是文件系统隔离**。二者互补，不互相替代。

1. **并行写必须独立 worktree**：两个（及以上）Cursor Agent 会话若会同时改文件、`git commit`、或切分支，**禁止**共用同一份 checkout 目录。须用 `git worktree add` 为每个写会话挂独立工作目录（可共享同一 `.git` 历史），并在 Cursor 中分别打开对应目录。  
2. **只读可共用主仓**：仅查文档 / log / 状态、不写盘、不切分支的会话，可继续使用主仓库目录。  
3. **一 worktree ↔ 一分支 ↔ 一主任务**：新建任务默认 `git worktree add -b feature/<topic>|<fix>/<topic>|<chore>/<topic> <并列目录> <基线>`；基线通常为 `develop` tip，拆分/续作已有主题时用该主题分支 tip。目录与主仓**并列**（如 `../Zen-tiger-Pet-garden001-wt-<short>`），不要塞进主仓内部。  
3a. **合入受阻 / 多文件冲突**：涉及 merge 冲突、CI 红且预计 ≥3 文件或多轮试错时，**先**摘要冲突类型并问是否新开 worktree/分支；**禁止**在原共用目录反复本地长验证。本地最多 1 轮冒烟级自检，最终交给 push + CI（细则：`RULES_INDEX` → `agent-token-cost` 第 6 条）。  
4. **禁止两 worktree 同时检出同一分支**（Git 硬限制）；共享契约文件（如 `TEST_TRACKER.md` 已有行、`PROCESS.md`、locale 大文件）同一时间只允许一个会话改。**新增 TEST_TRACKER 行**改 `docs/tracker-entries/` 碎片，可并行。  
5. **合回主线**：功能分支经 PR 进入 `develop`——合入资格见下文「合入 develop：CI 绿即可合并」；研发自检 / 主干同步见「feature/fix 合入 develop：研发自检 + 主干同步」。`main` 仍只走 PR + 负责人网页合并（见合并门禁）。任务完成后默认 **push 旁支 + 开 PR**（见 `git-agent-commit`）；**禁止**直推 `develop`/`main`。  
6. **结束后清理（目录拆除 · 高风险 · 须口令）**：分支已合入且不再需要本地目录时，在主仓执行 `git worktree remove <path>`；目录已删则 `git worktree prune`。未合入、未推送的 commit 不得先 remove。  
   - **禁止** Agent 静默 `worktree remove` / 按「看起来没人用」推断拆盘。  
   - **口令**「请清理闲置 worktree」（或同等）：Agent **只读**跑 `cd focus-tiger && npm run check:worktree-hygiene`，把输出做成候选清单贴进「待你决定」；**仅** `propose_remove` 档可建议拆除；`report_only` / `primary` **只汇报、不提议**。  
   - **`propose_remove` 内容已合入判定（squash 友好）**：工作树干净 + 非当前 cwd + 锁可放行，且满足其一——① tip 已是 `origin/develop` 祖先；或 ② `git cherry origin/develop HEAD` **无** `+` 行（无独有补丁）。禁止仅用祖先检查（squash 合入会假阴性）。  
   - 清单须含 **最后一次 commit 时间**（与闲置天数），便于你决定是否还要留作对照。  
   - 你点名 path（或写「按清单清」/「按扩大清单清」= 只清当时 `propose_remove`）后，Agent 才可 `git worktree remove`；缺点名 = 不得拆除。  
   - **本机按清单清（同一分类器）**：口令之后在**主仓**跑 `cd <主仓>/focus-tiger && npm run worktree:hygiene-remove`（默认 dry-run）→ 确认清单后再 `npm run worktree:hygiene-remove -- --apply`。只拆当时 `propose_remove`；**不**删远端分支；**不**拆主仓 / `…-wt-develop-qa`。Finder 里看到的文件夹不算数——只认 `git worktree list`。  
   - **固定 QA 树拆除豁免**见下文 `qa-develop-worktree`（`…-wt-develop-qa` **不得** `propose_remove`）。  
   - 政策索引：`RULES_INDEX.md` → `git-worktree-hygiene`。与锁心跳/陈旧（下节 Prompt 3）**同原则、不同风险等级**：客观依据（脚本输出 / `last_heartbeat`）供判断；**不可逆拆盘必须人工确认**；可逆的锁接管见下节。  
7. **能耗 ≠ 正确性**：worktree **隔离写盘**；同时开多个 worktree **窗口** + 多个**本地** Agent 仍会叠加本机 CPU/GPU（见 Process Explorer 的 Shared / extension-host）。并行任务优先：本地 ≤1–2 写会话，其余用 Cloud Agent；不用的窗口关掉。操作细则见 `focus-tiger/docs/PROCESS.md`「本地 Cursor 能耗」。  
8. **Cloud 旁支落到本机（禁止主仓 migrated checkout）**：Cursor Desktop「Apply / checkout migrated branch」会在**当前打开的目录**里 `git checkout` 那条 Cloud 旁支，并有短超时（本仓常见 `Checkout timed out after 120000ms`）。PNG 序列多时主仓 checkout 很容易超时；即使成功也会抢走主仓 / QA 树 / 正在出 5173 的检出。  
   - **禁止**：在主仓通用目录、固定 QA 树 `…-wt-develop-qa`、或任何正在跑 Vite / 被占用的 worktree 上点 Apply / 迁入 migrated branch。  
   - **要做**：`git fetch origin <branch>` → `git worktree add <并列目录>-wt-<short> origin/<branch>`，需要写盘时再在 Cursor 打开该目录。只读看 diff 用 GitHub / PR，不必落盘。  
   - **先查是否还该落**：PR 已关未合、behind `develop` 很大、或口径已被更新 PR 取代（例 2026-08-15 #297 Worker `8c649d12` 已被 `d0140328` 取代）→ **不要**再 checkout。看对话用 Cloud 网页。  
   - Agent **禁止**叫用户对本机主仓点「Open in Cursor / Apply」来接 Cloud 旁支。

### 工作树占用检测与 `.ft-session-lock`（强制）

> **本小节为 SSOT**（索引：`RULES_INDEX.md` → `git-worktree-occupancy`）。与「并行 worktree」互补：上节要求**物理隔离**；本条要求**同一 worktree 内同一时间只服务一条工作线**，并用锁文件 + **技术闸（pre-commit）** + 开工检测拦住误用。

#### 方案选择（Prompt 3 · 2026-08-11）

| 方案 | 覆盖面 | 成本 | 结论 |
|---|---|---|---|
| **A · husky pre-commit** | 拦住本机所有 `git commit`（含 Agent / 人手）；**不**拦住 Cursor Edit/Write 落盘 | 低（仓库已有 husky） | **采用** |
| **B · 写操作 wrapper** | 理论上可盖更多写路径，但本仓**无**统一写入口；Cursor 工具直接写盘，wrapper 形同虚设 | 高、覆盖仍不全 | 不采用为主闸 |

辅助：`npm run check:worktree-occupancy` / `session-lock:heartbeat`；Agent 规则仍要求写前读锁（Edit 不经 hook）。

1. **锁文件**：每个 worktree **根目录**放 `.ft-session-lock`（已在 `.gitignore`，**禁止** commit）。另写 **`.ft-session-identity`**（gitignore）标记「本会话」身份，供 pre-commit 区分自有锁 vs 外锁。JSON 字段：
   - **必填**：`task_id` · `session_label` · **`started_at`**（ISO）· **`last_heartbeat`**（ISO）· `updated_at`（ISO）· **`occupancy`** · `task`（**不得**用自然语言替代 `occupancy`）
   - **可选**：`pid` / `agent_note` / `pr` 等
2. **心跳与陈旧锁**
   - **心跳写入**：创建锁时写 `started_at` = `last_heartbeat` = `updated_at`；会话中用 `npm run session-lock:heartbeat` 或 **pre-commit 成功路径**刷新 `last_heartbeat` / `updated_at`。
   - **陈旧阈值**：默认 **60 分钟**（`FT_SESSION_LOCK_STALE_MS` 可覆盖，毫秒）。依据：Agent 常因等人回复停 20–40 分钟，45 分钟易误判；60 分钟仍能在约 1 小时内清掉遗忘锁（例：2026-08-11 `pr238-conflicts`）。
   - **权威时间**：`last_heartbeat` → 缺则 `updated_at` → 再缺则 `started_at`；**禁止**用 OS mtime 判陈旧。
   - **陈旧 + 外锁**：新会话/pre-commit **可自动清除并接管**，但必须追加 **`.ft-session-lock.history.log`** 留痕（谁、何时、因 stale/releasable、清了哪个 `task_id`）。人工强制清**非陈旧**锁仍须口令「我确认要强制清除锁」，并写入 `focus-tiger/docs/ops/session-lock-clear-log.md`（可 commit）或 history.log。
   - **未陈旧外锁**：**禁止**清除或绕过；pre-commit **直接 reject**（报 `task_id` + heartbeat）。
3. **`occupancy` 占用态（强制 · 不以 mtime 为准）**
   | 值 | 含义 | 下一会话可否接管 |
   |---|---|---|
   | `active` | **仍在占用中** | **否**（除非已**陈旧**；非陈旧须强制清锁口令） |
   | `releasable` | **已完成待释放** | **可以**（须 history 留痕；不需要强制清锁口令） |

   > **词义澄清**：`releasable` **只**表示占用态，**不是** develop 可发布。主干合入见 **develop-integrity**（`git-feature-merge-preview`）。

   - **创建锁** → `occupancy: active`，写齐时间戳，并写 `.ft-session-identity`。
   - **会话中** → 保持 `active`，刷新 `last_heartbeat`。
   - **结束** → 删锁（优）或标 `releasable`。
   - **会话明显结束时的 N14 播报（强制）**：任务收尾 / 用户明确停止 / 本会话工作线已完时，「待你知道」**必须**写明锁的实际状态——`已删除` 或 `已标 releasable`（二选一写实，禁止笼统「收尾完成」带过）。**默认不要**在同一条里提议拆 worktree 目录（拆盘走口令「请清理闲置 worktree」，见上节第 6 款 / `git-worktree-hygiene`）。
   - **与拆盘 hygiene 对齐（Prompt 3 ↔ hygiene）**：锁陈旧判定与 worktree 候选清单都只提供**客观依据**（`last_heartbeat`+阈值 / `check:worktree-hygiene` 输出）。风险分档：**锁清除/接管 = 低风险可逆**（陈旧或 `releasable` 可自动接管 + history 留痕）；**`git worktree remove` = 高风险不可逆**（禁止静默；须口令 + 点名）。禁止把两套说成同一宽松标准。
   - **缺字段 / 非法 / 非 JSON**：未知占用；心跳已陈旧可按陈旧外锁，否则按非陈旧 `active`。
4. **禁止主仓 `develop` 直接检出写/commit（硬）**：任何写操作（含小文档）**一律不得**在主仓通用目录（路径名无 `…-wt-…`）且当前分支为 `develop` 时进行；必须先 `git worktree add …-wt-<topic>`。**取消**「小改动可在主仓顺手改」的隐性例外。技术闸：husky pre-commit 对此组合 **reject**（紧急：`FT_ALLOW_MAIN_DEVELOP_COMMIT=1`，须汇报说明）。
5. **写前检查（Agent 规则 + pre-commit）**：
   - **无锁** → 创建本任务锁 + identity；
   - **本会话**（identity / `FT_SESSION_TASK_ID` 匹配）→ 继续并刷新心跳；
   - **外锁 + releasable 或陈旧** → 可接管（history 留痕）；
   - **外锁 + 非陈旧** → **立刻停止**；pre-commit reject。
6. **开工额外检查**：
   1. 不明脏树 → 停手问用户；禁静默 stash/restore 别人的工作。
   2. 主仓通用目录 → **必须**独立 worktree（不再只是「建议」）；`develop` 上技术闸硬拦 commit。
   3. 非本会话 stash → 只读汇报；禁 pop/drop/再压。
7. **强制清锁（非陈旧）**：禁因「看起来过期」清非陈旧外锁；须「我确认要强制清除锁」。`releasable` / **已陈旧**走自动接管 + history。
8. **检测 / 技术闸**：
   - `npm run check:worktree-occupancy`（occupancy、heartbeat、stale、主仓 develop BLOCK）
   - `npm run check:worktree-hygiene`（**只读**全 worktree 候选清单；拆盘口令数据源；见 `git-worktree-hygiene`）
   - `npm run session-lock:heartbeat` / `session-lock:gate`
   - **husky** `.husky/pre-commit` → `gate-session-lock-precommit.js` 先于 `test:smoke`
9. **辅助闸（shell，可选）**：`beforeShellExecution` 可查锁。**不能**替代 Edit/Write 自觉 + pre-commit。**禁止**为实施本条改动 deny-subagent / gate-full-e2e / gate-destructive-shell。

### 固定 develop 验收 worktree（关单 / 批量人工测试）

> **本小节为 SSOT**（索引：`RULES_INDEX.md` → `qa-develop-worktree`）。  
> 与「并行 worktree」互补：那些管 **feature/fix 开发隔离**；本条管 **已合入 `develop` 之后** 关单验收与批量人工测试用的 **固定本机树**。关单只认 tip 的规则仍见 `TEST_TRACKER.md`（`qa-develop-tip`）。  
> **feature/fix 各自 worktree 的开发流程不变。**

#### 用途与禁区

1. **只用于**关单级人工验收、口令「批量人工测试」、以及声称代表 `origin/develop` tip 的 Safari 预览。  
2. **不用于开发**：禁止在此树改产品代码、切 `feature/*` / `fix/*`、`git commit`。pre-commit 硬拦（`…-wt-develop-qa`）。开发仍走各自 `…-wt-<topic>`。  
3. **Git**：此树跟踪 `origin/develop` tip。默认 **detached 于 `origin/develop`**（不抢正在测的目录所占的 `develop`）。独占检出本地 `develop` 是可选项，且 **不得**在 `5173` 正在测时对正在出码的目录做 `git switch`。禁止两棵树同时检出 `develop`。

#### 固定路径与端口

- **目录 basename 必须以 `-wt-develop-qa` 结尾**（脚本识别）。默认与主仓并列：`<主仓绝对路径>-wt-develop-qa`。本机现用主仓即为：  
  `/Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001-wt-develop-qa`  
- 覆盖路径：环境变量 `FT_QA_DEVELOP_WORKTREE`（绝对路径）。  
- **Vite 端口固定 `5173`**：在该树 `focus-tiger/` 跑 `npm run dev:qa`（`--port 5173 --strictPort`）。关单 URL：`http://127.0.0.1:5173/?product=1`。  
- **5173 正在测 → 禁止切端口 / 改当前检出**：Safari 已开着 `http://127.0.0.1:5173` 做关单或批量测时，**不要**跑会停掉现有 Vite、`--strictPort` 抢 5173、或 `git switch` 正在出码的那个目录的命令。可另建 detached QA 目录并 `npm install`，**等这轮测完再切 5173**。  
- feature worktree 的 `npm run dev` **不得抢 5173**；QA 树常驻时其它 Vite 应落到 5174+。Agent **不得**为收尾停掉 QA 树 Vite（其它树仍须停；见 `browser-energy`）。  
- 闲置盘点：此树 **不得**列入 `propose_remove`。不要为此树写开发用 `.ft-session-lock`。

#### 一次性建树（本机 · 可复制）

**A. 只建目录（现在就能跑；不碰正在测的 5173）**

```bash
cd /Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001
git fetch origin develop
git worktree add --detach /Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001-wt-develop-qa origin/develop
cd /Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001-wt-develop-qa/focus-tiger
npm install
```

`--detach` **不**抢走 `develop` 分支，也 **不**改正在跑 Vite 的那个 checkout。**不要**在这一步 `npm run dev:qa`。

**B. 把 5173 切到 QA 树（仅当本轮 `http://127.0.0.1:5173` 测试已结束）**

先停掉当前占用 5173 的 Vite，再：

```bash
cd /Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001-wt-develop-qa/focus-tiger
npm run dev:qa
```

Safari 仍是 `http://127.0.0.1:5173/?product=1`。切完后硬刷新一次，确认 hash = 当时 `origin/develop` tip。  
废止每次新建 `…-wt-qa-develop-tip` 再拆掉的口径。禁止默认 `git switch --detach origin/main` 去给 QA 腾 `develop`——那会把正在测的目录换成别的代码。

#### 合入 develop 之后（强制）

任何 PR **已经合并进** `develop`（含本回合 `gh pr merge`、GitHub auto-merge 完成、或发现 `origin/develop` 已前进）后，Agent **必须**：

1. 跑 `cd focus-tiger && npm run sync:qa-develop`。  
   - **本机且 QA 树存在**：脚本在该目录执行 `git fetch` + **`git pull --ff-only origin develop`**（detached 则为 `git merge --ff-only origin/develop`）。脏树或无法快进则停手汇报，禁止 `reset --hard` 清别人的改动。  
   - **Cloud / 本机无此树**：脚本 **不得**假装已 pull；打印 `qa_worktree: ABSENT`，仍根据 `origin/develop` 的 diff 给出下面 ①②。  
2. 在用户可见回复（「待你知道」）**明确写出**：  
   - **① 是否需要重启 dev server**：依赖或构建配置改动（`package.json` / lockfile / `vite.config.*` / `index.html` / `.env*` 等，见脚本 `restart:` 行）→ **需要重启**（必要时先 `npm install`）；否则写 **硬刷新即可**。  
   - **② 一句这次合并带来什么变化**（脚本 `summary:` 行），方便知道该测什么。  
3. **禁止**用过时 feature worktree / 非 5173 端口冒充关单 tip。

### 长期并存功能分支的同步纪律

> **本小节为 SSOT**（索引：`RULES_INDEX.md` → `git-sibling-branch-sync`）。叙事与事故背景见 [`DEV_WORKFLOW_QUALITY.md`](focus-tiger/docs/DEV_WORKFLOW_QUALITY.md) §6.6；规范编号 **N17**。  
> 与「并行 Cursor 会话 / worktree」互补：**worktree 管隔离写盘**；本条管**长期并存姊妹分支的内容是否失步**。

1. **修复落地即对照姊妹线（B1）**：存在长期并存的功能分支（例：窄屏抽屉 vs 宽屏 More 菜单，同属 Idle chrome 响应式变体）时，任一分支有**修复性** commit 落地，Agent 须在同次收尾前检查：另一条（或多条）姊妹分支是否基于同一逻辑、是否需要合入同一修复。禁止等到用户再说「是不是又漏了」。  
2. **共享入口修复须写进汇报清单（B2）**：触及 Sound / Honesty / Companion / 其它 §2.3 高风险面共享入口的修复，收尾「待你决定 / 待你知道」须点名：还有哪些活跃分支可能基于同一套逻辑、是否也要修。禁止默认「这次只改了当前分支」。  
3. **合回单线 vs 继续并行 → 用户拍板（B3）**：若两条分支本质是同一功能的响应式变体，Agent 应**提出**评估合回 `develop`（或单 feature 线）+ 断点处理差异的选项，**不得**自行决定长期并行或擅自 merge 策略。  

**反面教材**：`feature/wide-idle-more-menu` 建在窄屏初版 tip 上、未跟随后续窄屏修复 → 宽屏复现已修 bug（2026-07-21）。

### 中高风险功能落地：先套降险 Playbook（引用）

> **政策 SSOT**：[`focus-tiger/docs/RISK_MITIGATION_PLAYBOOK.md`](focus-tiger/docs/RISK_MITIGATION_PLAYBOOK.md)（索引：`RULES_INDEX.md` → `risk-mitigation-playbook`）。  
> 实现前用户路径冲突扫描见 [`FEATURE_CONFLICT_REVIEW.md`](focus-tiger/docs/FEATURE_CONFLICT_REVIEW.md)（`feature-conflict-review`），先于本 playbook。  
> 本小节**只指路**，不复述四件套与架构红线全文。

当新功能会穿透 **≥2 个**核心面（EmotionController / Dispatcher / 状态机门闩 / 场景互斥 / 产品壳 UI / 多语言产品路径），或自评「整包一次落线风险中高」时：

1. Task Brief / 开工回复显式引用该 Playbook；  
2. 按「Lab 先行 → 切片可验收 → 优先级门闩 → Feature Flag 回退正式默认路径」落地；  
3. **禁止**把降险话术读成「可跳过 Dispatcher / 可先挂产品钩子再补动画 / 可另造简化兜底」。

与本文件其它节的关系：worktree / 合入前同步管**写盘与血统**；Playbook 管**架构纪律下的降险手法**——二者叠加。合入资格（CI 绿）见下一节 `git-develop-small-pr-run-merge`。

### feature/fix 合入 develop：研发自检 + 主干同步（非人工关单）

> **本小节为 SSOT**（索引：`RULES_INDEX.md` → `git-feature-merge-preview`）。  
> 与「并行 worktree / 占用锁」互补：那些管**写盘隔离**；本条管 **合进 `develop` 之前** Agent 须完成的**研发自检**与 **develop 血统同步**。  
> **人工测试不是合入门闩**（2026-08-14 拍板）：用户 Safari 预览 / TEST_TRACKER 关单与「能不能合进 `develop`」解耦。合入资格见下一节。与 `qa-develop-tip` **并列、不互相替代**——见下文「两层验收」。

#### 硬规则

1. **研发冒烟自检（非人工关单）**：`feature/*` / `fix/*`（及同类短命支）在 push / 开 PR 前，Agent 须按 regression-lock 跑完本地冒烟（`test:smoke` / `test:e2e:smoke` 或 `test:pr-smoke`，触及面按完工门禁）。这是**工程自检**，**不等**用户确认「测过了」才开 PR。  
2. **合入门闩 = CI 绿**：Required checks 通过即可合入 `develop`。**禁止**把「待人工测试」或「等你 Safari 预览」写成合入阻塞。关单级人工测试默认在合入之后、对 `origin/develop` tip 批量进行（见 `TEST_TRACKER` / `qa-batch-human-test`）。  
3. **推荐动作顺序**：旁支上完成改动 → 本地冒烟 → commit → **默认** push 旁支 + 开 `--base develop` 的 PR → CI 绿后合并（见下一节）。需要看产品壳时，Agent 仍可起 Vite 并给本地 URL（Safari），但**不**把「等你点确认」当成开 PR / 合入的前置。

#### 为什么（develop-integrity）

目标：**保护 `develop` 的主干完整性（develop-integrity）**——日常集成分支应保持 **CI 可绿、可继续开发、可开 PR 往 `main` 走**。完整性靠 **Required checks + 血统同步**，不靠「先等人工测完再合」。

人工测试仍有价值（观感、Safari、故事矩阵），但它是 **关单 / 「已修复」话术** 的门闩，不是合入 `develop` 的门闩。合入后若发现回归，用 `fix/*` + PR 修，而不是把未测代码长期堆在仅本地的旁支上。

> **词义澄清（强制）**：此处 **develop-integrity（主干完整性）≠** `.ft-session-lock` 的 `occupancy: "releasable"`（会话锁「可被下一任务接管」）。二者字面都可能被口语说成「releasable」，**禁止混用**：谈合入纪律用 **develop-integrity**；谈占用锁仍只用 `occupancy` 枚举值 `releasable`。

#### 两层验收（必须并列理解）

| 层 | 何时 | 基线 | 作用 |
|---|---|---|---|
| **合入门闩**（CI + 本条同步判定） | **合并进 `develop` 时** | PR head；Required checks 全绿 | 决定「能不能合进主干」；**不等**人工测试 |
| **关单级人工验收**（`qa-develop-tip`） | **已合入 `develop` 之后**（可批量） | **仅**当时 `origin/develop` tip | 决定 TEST_TRACKER 能否标「已通过」/ 关闭「有问题」；决定能否声称「已修复」 |

关单只认 develop tip，因此 **关单级人工测试的默认路径就是先合再测**。feature 上的试跑仍 **不得**单独当作关单证据（见 `TEST_TRACKER.md`）。**禁止**把「已合入 develop」写成「已验证 / 已修复」。

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
| **可直接推进合入流程**（就同步而言） | `git log -1 HEAD..origin/develop` **为空**（develop 无本支缺少的提交） | 无需为「跟上 develop」而 rebase；仍须完成本条的研发冒烟自检 |
| **必须先 rebase/merge 再重测** | develop 有本支缺少的提交（上表 log **非空**），**且** `comm -12` 输出 **非空**（文件有交集） | 在本 worktree `rebase` 或 `merge origin/develop` → 解决冲突 → **重新**本地冒烟 → 再开 PR / 合入 |
| **建议仍 rebase（非文件硬拦）** | develop 前进但文件无交集 | 不强制为文件重叠；若分支**存活较久**或触及共享契约大文件，仍建议合入前同步一次并快测 |

辅助对照（可读性，不替代上面的交集判定）：

```bash
git log origin/develop..HEAD --stat    # 本支将带进 develop 的变更
git log HEAD..origin/develop --stat  # develop 上多出来、本支还没有的变更
```

#### 预览豁免（严格 · 防滥用）

可勾选「跳过 Vite/产品壳预览」（Agent **不必**为文档 PR 起开发服务器）**当且仅当**同时满足：

1. 对 `origin/develop...HEAD` 做 `git diff --name-only`，**每一个**改动路径都**不**落在下列**运行时路径**（命中任一 → **整 PR 不得豁免 Vite 自检**，即使同批还有 `.md`）：
   - `focus-tiger/src/**`
   - `focus-tiger/public/**`
   - `focus-tiger/e2e/**`
   - `focus-tiger/index.html`（及会进 Vite 入口的其它产品 HTML）
   - 任意 `*.vue`；以及 `focus-tiger/src` 下的 `*.css` / `*.html`（已含于 `src/**`）
2. **禁止**仅凭「文件后缀是 `.md`」「PR 标题写了 docs」「改的是脚本注释」自称豁免。  
3. **允许**出现在豁免 PR 里的典型路径：`**/*.md` / `**/*.mdc`、仓库根 `WORKFLOW.md`、`.github/**`（模板/workflow 文案）、`focus-tiger/docs/**`、以及**不进产品 Vite 打包**的门禁/检测脚本（如 `focus-tiger/scripts/rules-authority-registry.js`、`docs-check` 相关）。若脚本改动会改变**产品运行时行为** → 仍不得豁免。  
4. 豁免时仍须勾选并写清理由；仍须跑本条的 **develop 同步判定**（文件重叠则先 rebase）。  
5. **豁免 Vite ≠ 豁免合入**：文档/规则 PR 同样在 CI 绿后按下一节合并；人工测试仍不阻塞合入。

#### 与 PR 模板

开向 `develop` 的 PR 须勾选模板中研发自检 / 主干同步项（见 `.github/PULL_REQUEST_TEMPLATE.md`）。人工测试勾选**不是**合入前提。

### 合入 develop：CI 绿即可合并（默认习惯 · 2026-08-14）

> **本小节为 SSOT**（索引：`RULES_INDEX.md` → `git-develop-small-pr-run-merge`）。  
> 旧称「文档/小 PR：CI 绿后弹 Run 合并」。2026-08-14 拍板：**所有**合入 `develop` 的 PR（含运行时 / 产品逻辑）在 CI 绿后即可合并（习惯用语：CI 绿后弹 Run 合并）；**不等**人工测试通过。Cursor 弹出 **Run** 只是终端/hook 确认，**不是**「再等你测完」。

#### 适用范围（须同时满足）

1. **base = `develop`**（**不是**合进 `main`）。  
2. **本回合已开出的 PR**（Agent 刚创建或用户明确要推进的同一 PR），或任务收尾时该旁支已有 open PR。  
3. Required checks 已绿，或尚未绿时启用一次 auto-merge（见下）。  
4. **push / 开 PR 本身**：任务完成后**默认允许**（见 `git-agent-commit`）；本条不要求再等一次口头授权。

#### 默认收尾动作（强制）

在已 push 且 PR 已开之后，Agent **须**走合并收尾，**禁止**默认只写「请你上 GitHub 合并」就结束（除非下方「不适用」）：

1. **查一次** Required checks（`pre-merge with develop`、`test:pr-smoke` 等；`gh pr checks` / `gh pr view --json statusCheckRollup`）。  
2. **已全绿** → 立刻执行 `gh pr merge <n> --merge`（或团队当时约定的 merge 方式 / Cloud 侧等价合并工具）。若 Cursor Auto-review 弹出 **Run** → 点 Run 即执行，**不要**改口成「等人工测完再合」。  
3. **尚未绿** → **只做一次** `gh pr merge <n> --auto --merge`（启用 GitHub auto-merge），汇报 PR URL +「等 CI 绿后自动合」；**禁止**在本回合轮询长 CI（见 `agent-token-cost`）。  
4. 合并成功后汇报：**PR 号**、**merge commit 短 hash**、**`origin/develop` tip**。并写明：TEST_TRACKER 相关行仍是「待人工测试」——**已合入 ≠ 已验证**。  
5. 合并成功后跑 `npm run sync:qa-develop`（见 `qa-develop-worktree`），并在「待你知道」写清脚本的 **① `restart:`（是否须重启 QA Vite）** 与 **② `summary:`（一句变化）**。Cloud 无 QA 树时仍须汇报 ①②，并注明 `qa_worktree: ABSENT`。

#### 不适用（仍须你明确下令，或停手汇报）

- 合进 **`main`**（永远须你明确下令；见 `git-merge-main`）。  
- **生产 Worker Redeploy**（永远须你明确说「部署」；见 `prod-worker-deploy`）。  
- 「请安排下班前的 Git 同步」口令：**仍不**顺手推进**无关** PR（见 regression-lock 第 7 条）；本条只管本回合刚开/正在收尾的 develop PR。  
- 检查红 / 冲突 / 不可 MERGEABLE → 停手汇报，不硬合。

#### 与「谁点了合并」

`gh` 使用你的登录态；GitHub `mergedBy` 仍是你。Cursor **Run** = 批准 Agent 代跑合并命令，**不是**另发一套 Agent 特权，也**不是**人工测试关单。

---

## 何时可以把 `develop` 合并进 `main`？

`main` 代表「可以交给用户」的快照。合并前须 **全部满足**：

### 发版核对备忘 · `main` 已提前含 #164（2026-08-07）

> **事件**：PR [#164](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/164)（Reflection 共鸣）误以 **`main`** 为 base 合入（tip `30ef3c9`）。日常仍以 **`develop`** 为准；**`main` 先不动**，等下次正式发版再做正规 `develop` → `main`。纠正落地见合入 `develop` 的 #175（及后续 tip）。

**下次 `develop` → `main` 发版时**：Reflection 共鸣相关路径（如 `reflectionEchoCopy.js` / `TigerReflectionMoment` 共鸣接线 / 对应 locale `REFLECTION_ECHO_*`）在 diff 里可能显示 **「无变化」或几乎无 diff**——这是 **预期**：`main` 已含该批内容，**不是**漏合并。禁止为此重复排查「是否忘了合」。其余 develop 独有提交仍须正常进 main。

### 自动化门禁（在 `focus-tiger/` 目录执行）

```bash
cd focus-tiger
npm run test:smoke       # 控制器 / 门闩逻辑冒烟（本地）
npm run test:e2e:smoke   # Playwright 轻量壳冒烟（本地允许）
# 全量 npm run test:e2e / visibility：仅 CI（focus-tiger-e2e-full.yml 等），
# 或 RUN_E2E_LOCAL=true；见 RULES_INDEX → e2e-local-budget
```

`test:smoke` + `test:e2e:smoke`（或 CI 上的 `test:pr-smoke` / 全量 workflow）须 **绿**。  
注意：**绿 ≠ 序列观感通过**（Idle 不闪等仍须人工，见 `DEV_WORKFLOW_QUALITY.md` §6.1）。合并 `main` 前的全量 e2e 证据以 **CI run** 为准，禁止默认本机手跑全量。

### 场景与人工验收

按 [`focus-tiger/docs/SCENARIO_TESTS.md`](focus-tiger/docs/SCENARIO_TESTS.md) 走完本次改动涉及的 **场景故事**（建议产品壳 `http://localhost:5173/?product=1`）。  
涉及功能在 [`focus-tiger/docs/TEST_TRACKER.md`](focus-tiger/docs/TEST_TRACKER.md) 中：

- 无「有问题」未关闭项  
- 本次相关行已标为「待人工测试」并完成复测，或已书面确认通过  
- 发版前另跑 `npm run check:open-blockers -- --release-gate`（见 regression-lock「发布候选门禁」/ `RULES_INDEX` → `release-blocker-ledger`）；逾期 `release-blocker` 硬拦；`legacy-unclassified` 仅提醒不硬拦  


### 回归与文档

- 无 **已知回归**（含门闩静默失败、已验收观感被改坏）  
- 触及行为/情绪/架构时，权威 md 已与代码同批更新（N15）  
- 合并前在旁支（`feature/*` / `fix/*` / `docs/*` 等）上完成 **本地 commit** 并 **push 旁支** + PR（`--base develop`）；且这些 commit 已按**逻辑完整改动**组织、message 可读；**禁止**直推 `develop`/`main`（见 regression-lock 第 5–7 条）  

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

## 生产 Worker Redeploy（须明确「部署」）

> **本小节为 SSOT**（索引：`RULES_INDEX.md` → `prod-worker-deploy`）。  
> 2026-08-14 拍板：push / 开 PR / 合入 `develop` 的门槛放宽之后，**本关不变**。这是唯一真正接触生产环境 / 真实用户流量的动作。

### 硬规则

1. **默认禁止**：Agent **不得**在任务收尾、CI 绿、合入 `develop`、或「Git 同步」时顺手执行生产 Redeploy（含 `cd focus-tiger/cloud && npm run deploy`、`wrangler deploy`、Cloudflare 控制台等价操作、GitHub Actions 里指向生产 Worker 的 deploy）。  
2. **口令**：仅当你**当回合书面**明确说「部署」/「redeploy」/「部署生产 Worker」时，才可执行。含糊的「同步」「上线」「发布」「合进去了」**都不算**。  
3. **与合 `main` 分开**：合并 `develop` → `main`（`git-merge-main`）**也不**自动授权 Worker deploy；两边都要各自的明确指令。  
4. **汇报**：若执行了部署，须写清 Worker 名、环境（生产）、版本/部署 id（若有）、以及「未部署」时不得假装已对真实用户生效。

命令与密钥细节见 [`focus-tiger/cloud/README.md`](focus-tiger/cloud/README.md)；本节只管**何时允许执行**。

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

1. **`test:smoke` + 轻量/CI e2e 是否绿**（本地 `test:e2e:smoke` 或 CI `pr-smoke` / 全量 workflow；**不是**默认本机全量 `npm run test:e2e`）  
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

### CI 与本地 e2e 边界（现状）

- **PR→develop**：`pr-smoke.yml`（`test:smoke` + `test:e2e:smoke` + build）为轻量门闩。  
- **全量 e2e**：`focus-tiger-e2e-full.yml`（schedule + `workflow_dispatch`）；**禁止**默认本机 `npm run test:e2e`。  
- **本地 Agent**：仅 `test:smoke` / `test:e2e:smoke` / `test:e2e:changed -- <单个 spec>`；多文件与全量见 `RULES_INDEX` → `e2e-local-budget`（`RUN_E2E_LOCAL=true` 逃生口会打警告）。  
- 历史「临时接受本机全量」门槛（PR #2）**已废止**；细节见 `PROCESS.md` Backlog「CI 全量…」已落地节。

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
| 分支 / 合并 main / SemVer 与稳定 tag / 跨会话冲突 / 并行 worktree / 姊妹分支同步 / **固定 QA develop 树** | **本文** `WORKFLOW.md`（见 [`RULES_INDEX.md`](focus-tiger/docs/RULES_INDEX.md)） |
| Agent commit / 汇报 / push / 禁自动合 main | [`.cursor/rules/focus-tiger-regression-lock.mdc`](.cursor/rules/focus-tiger-regression-lock.mdc)「Commit 汇报与分支门禁」 |
| 回归锁完工门禁、Bug close §7 | 同上 regression-lock；叙事见 [`DEV_WORKFLOW_QUALITY.md`](focus-tiger/docs/DEV_WORKFLOW_QUALITY.md) |
| 中高风险功能落地降险（四件套 + 架构红线） | [`RISK_MITIGATION_PLAYBOOK.md`](focus-tiger/docs/RISK_MITIGATION_PLAYBOOK.md)（本文仅入口引用） |
| 实现前功能冲突扫描 | [`FEATURE_CONFLICT_REVIEW.md`](focus-tiger/docs/FEATURE_CONFLICT_REVIEW.md)（`feature-conflict-review`） |
| 场景测试剧本 | `focus-tiger/docs/SCENARIO_TESTS.md` |
| 功能点验收表 | `focus-tiger/docs/TEST_TRACKER.md` |
| Task / 角色分工 | `focus-tiger/docs/PROCESS.md`、`focus-tiger/docs/COLLAB.md` |

---

## 快速对照

| 我想… | 做法 |
|---|---|
| 日常开发 | `git checkout develop` → `feature/…` 或直接 commit |
| 开第二个写会话 | `git worktree add -b feature/… ../…-wt-… develop`（见「并行 Cursor 会话」） |
| 把 Cloud 旁支落到本机 | `git fetch` + `git worktree add …-wt-… origin/<branch>`；禁止主仓 Apply / migrated checkout（见「并行 Cursor 会话」第 8 款） |
| 关单 / 批量人工测试 | 固定 QA 树 `…-wt-develop-qa` · `:5173`；合入后 `npm run sync:qa-develop`（见 `qa-develop-worktree`） |
| 修 bug（且有姊妹功能分支） | 修完后对照姊妹线是否需同修；写入「待你决定 / 待你知道」（见「长期并存功能分支的同步纪律」） |
| 修 bug | 从 `develop` 切 `fix/…` |
| 纯文档更新 | 在 `develop` 或 `feature/…` 上改、跑 `docs:check`、**立刻 commit** |
| 中高风险新功能落地 | 先扫 `FEATURE_CONFLICT_REVIEW.md`，再读 `RISK_MITIGATION_PLAYBOOK.md`（见上「中高风险功能落地」）；Lab → 切片 → 门闩 → flag |
| 发布稳定版 | 过门禁 → `main` ← merge `develop` → **annotated tag** `vX.Y.Z`（首稳 = `v1.0.0`；**不**切 `release/*`） |
| 稳定版紧急修 | 从 `main` 切 `hotfix/…` → 合并回 `main` + `develop` |
| 开发改坏了 | `develop` 上 revert / reset；**不要**先动 `main` |
| `main` 被误合并 | `main` 上 `git revert` 或 reset 到 tag |
