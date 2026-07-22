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

```bash
git checkout main
git pull origin main          # 若已与远程同步
git merge --no-ff develop -m "release: <简述本次稳定点>"
# 可选：打标签便于回滚
git tag -a v0.x.y -m "稳定发布点说明"
```

合并后 `main` 与 `develop` 可继续并行；`develop` **不要** 删除。

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

| 主题 | 文档 |
|---|---|
| 回归锁、交互修复完工门禁 | `focus-tiger/docs/DEV_WORKFLOW_QUALITY.md`、`.cursor/rules/focus-tiger-regression-lock.mdc` |
| 场景测试剧本 | `focus-tiger/docs/SCENARIO_TESTS.md` |
| 功能点验收表 | `focus-tiger/docs/TEST_TRACKER.md` |
| Task / 角色分工 | `focus-tiger/docs/PROCESS.md`、`focus-tiger/docs/COLLAB.md` |

---

## 快速对照

| 我想… | 做法 |
|---|---|
| 日常开发 | `git checkout develop` → `feature/…` 或直接 commit |
| 修 bug | 从 `develop` 切 `fix/…` |
| 纯文档更新 | 在 `develop` 或 `feature/…` 上改、跑 `docs:check`、**立刻 commit** |
| 发布稳定版 | 过门禁 → `main` ← merge `develop` → 可选 `git tag` |
| 稳定版紧急修 | 从 `main` 切 `hotfix/…` → 合并回 `main` + `develop` |
| 开发改坏了 | `develop` 上 revert / reset；**不要**先动 `main` |
| `main` 被误合并 | `main` 上 `git revert` 或 reset 到 tag |
