# Task Brief · PR #2：`develop` → `main` 冲突解完并合并

**日期**：2026-08-01  
**状态**：冲突已清 · **待合 main**（#70 已合 develop；PR #2 = MERGEABLE；behind main=0；**仍须五条件 + 你下令**）  
**PR**：[#2](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/2)（`develop` → `main`）  
**分支建议**：独立 worktree + `chore/resolve-pr2-develop-main`（或在 PR 头上直接解冲突；**禁止**在主仓通用目录硬刚）  
**权威**：仓库根 `WORKFLOW.md`（合并 `main` 门禁）· `PROCESS.md`「下一步 · PR #2」· regression-lock（禁止自动合 `main`）

---

## 背景（2026-08-01 摸底）

- GitHub：`mergeable=CONFLICTING` / `mergeStateStatus=DIRTY`。  
- 规模表象：`main...develop` 约 **364 commits / ~197 files**（ahead），`develop` **behind `main` ~10**（含 PR #63 已把 Plan A e2e-full 合进 `main`）。  
- **真实内容冲突极少**：在干净探测 worktree 上对 `origin/main` ← `origin/develop` 做 `--no-commit` merge，**仅 2 个文件**冲突：
  1. `.cursor/hooks.json`（content）— `main` 缺 `subagentStart` deny 与 full-e2e shell gate 等 develop 侧护栏块。  
  2. `.github/workflows/focus-tiger-e2e-full.yml`（add/add）— `main` 已有 Plan A（#63）；`develop` 同路径另有演进，须人工择一或合并分片口径。  
- 其余大 diff 多为可自动合并的超前提交，**不等于** 197 处手工冲突。

---

## 范围（本任务必做）

1. **专属 worktree** 自 `origin/main`（或 PR #2 头）检出；写 `.ft-session-lock`。  
2. **解上述 2 文件冲突**（优先保留 develop 护栏钩子 + `main` 上已验证的 e2e-full Plan A；冲突细节以开工当日 tip 为准，再跑一次 dry-merge 核对）。  
3. **把 `main` 上仅有的 ~10 commits 合入/变基进 PR 头**，使 PR 不再 `behind` / `DIRTY`。  
4. 推 PR 头（须用户授权 push）→ 等 **Required checks** 绿 → **仅在用户明确下令后** 网页或 `gh pr merge` 合入 `main`（Agent **禁止**自动合 `main`）。  
5. 合并后按 `PROCESS`：立刻排期「降低 visibility CI flaky 率」（可同周另 Brief）。

## 不在范围

- 不借本任务重写产品运行时 / 状态机。  
- 不本地全量 `test:e2e`（全量交 CI / `RUN_E2E_LOCAL`）；本地最多 `test:pr-smoke` 等价自检 1 轮。  
- 不顺便合并其它开放 PR。  
- 不把「冲突已解」写成产品验收通过。

---

## 验收口径

| 项 | 标准 |
|---|---|
| 冲突 | PR #2 `mergeable=MERGEABLE`（或 GitHub 显示可合） |
| CI | PR 头 Required checks 绿（至少既有 doc-contract / 相关 workflow；以当时 protection 为准） |
| 合入 | **仅**你口头/书面下令后执行；回报 merge commit + `main` tip |
| 文档 | `PROCESS`「下一步 · PR #2」改为已合 / 指向 flaky 后续；本 Brief 状态 → 已完成 |

---

## 合 main 口令（冲突阶段已完成）

冲突解完已合 `develop`（#70）。合 `main` 须：**五条件清单过关** + 你明确口令「批准合 PR #2 进 main」。Agent **禁止**代合。

---

## 进度（2026-08-01 开工）

- Worktree：`Zen-tiger-Pet-garden001-wt-pr2-resolve` · 分支 `chore/resolve-pr2-develop-main`。  
- 已 `merge origin/main` 进本分支；`behind main = 0`。  
- 真冲突仅 `.cursor/hooks.json` → **取 develop（ours）完整护栏**；`e2e-full.yml` 两边已一致。  
- 本地验证：`origin/main` ← tip → **0 conflict files**。

## 进度（2026-08-02 · #70 已合）

- [#70](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/70) 已合 `develop`（`dce954d`）。  
- PR #2：`mergeable=MERGEABLE`；`develop` behind main = 0。  
- Resolve worktree / 本地 `chore/resolve-pr2-develop-main` **已拆除**。  
- **仍禁止**未过五条件、未经你下令就合 `main`。
