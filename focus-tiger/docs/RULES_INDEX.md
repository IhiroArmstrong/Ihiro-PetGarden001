# RULES_INDEX.md — 规则主题权威索引（Single Source of Truth）

创建日期：2026-07-23  
目的：每个**规则主题**只指定**一份**权威文档；其它文档只能一句话引用并链接，禁止平行完整表述。  
冲突解法：**以本索引指定的 SSOT 为准**，**不以**「最后修改时间更晚的文档」为准。

检测命令（进 `docs:check` / CI）：

```bash
cd focus-tiger && npm run rules:doc-check
# 刷新下方机器块：
cd focus-tiger && npm run rules:doc-sync
```

真源 registry：`focus-tiger/scripts/rules-authority-registry.js`。

---

## 原则

1. **一主题一权威**：新增或修改流程/门禁规则时，先查本表，只改对应 SSOT。  
2. **引用不复述**：非 SSOT 需要提到同一规则时，写「见 `…` §…」+ 链接即可，不要再抄一遍条款。  
3. **门禁 vs 叙事（有意分层，仍只有一处「规范性条款」）**：  
   - **强制门禁条文**（Agent alwaysApply 须遵守的 checklist / 禁止项）→ 多为 `.cursor/rules/focus-tiger-regression-lock.mdc`  
   - **为什么 / 怎么做** 的展开 → `DEV_WORKFLOW_QUALITY.md`  
   - 叙事文档可以解释，但**不得**写出与门禁矛盾的完整平行条款；检测脚本会抓「矛盾短语」与「指纹级复述」。  
4. **产品语义权威**（情绪 / 架构 / 原则等）仍见表外「产品与设计权威」；本文件聚焦**工作流 / Git / 回归锁 / 文档契约**类易冲突规则。

---

## 规则主题 → 权威来源

<!-- rules-authority-index:begin -->

> **机器块 · 勿手改**。真源：`scripts/rules-authority-registry.js`。刷新：`npm run rules:doc-sync`。

| 原则 | 每个规则主题只有一份权威来源；其它文档只引用不复述；冲突以 SSOT 为准，不以 mtime 为准。 |
| 检测 | `npm run docs:check`（含本检查） |

| topicId | 主题 | 权威文档 (SSOT) | 权威章节 |
|---|---|---|---|
| `git-branch-model` | 分支模型（main / develop / feature / fix / hotfix） | `WORKFLOW.md` | 分支模型 |
| `git-merge-main` | 合并 develop → main 的门禁与谁点合并 | `WORKFLOW.md` | 何时可以把 `develop` 合并进 `main`？ |
| `git-agent-commit` | Agent 自动 commit / 汇报 / Git 同步分级汇总 / push 与禁自动合 main | `.cursor/rules/focus-tiger-regression-lock.mdc` | Commit 汇报与分支门禁 |
| `git-cross-session` | 跨会话指令冲突处理（开 PR / 合并 / push 前） | `WORKFLOW.md` | 跨会话指令冲突处理 |
| `git-parallel-worktree` | 并行 Cursor 会话须用 git worktree 隔离写操作 | `WORKFLOW.md` | 并行 Cursor 会话：必须用 git worktree 隔离写操作 |
| `regression-gate` | 交互修复完工门禁（主路径+回流、静默失败、冒烟、N14/N15…） | `.cursor/rules/focus-tiger-regression-lock.mdc` | 交互修复完工门禁 |
| `bug-close-s7` | Bug close（§7）五证 checklist | `.cursor/rules/focus-tiger-regression-lock.mdc` | AI 修复验收规范（Bug close · §7 · 强制） |
| `doc-code-contract` | 文档-代码结构性对齐（docs:check） | `focus-tiger/docs/DOC_CODE_CONTRACT.md` | DOC_CODE_CONTRACT.md |
| `rules-authority` | 规则主题权威索引（本机制） | `focus-tiger/docs/RULES_INDEX.md` | 规则主题 → 权威来源 |

<!-- rules-authority-index:end -->

### 主题说明（人工）

| topicId | 允许在别处写什么 | 禁止 |
|---|---|---|
| `git-branch-model` | 「分支职责见 `WORKFLOW.md`」 | 再抄一份五列表 |
| `git-merge-main` | 「合并 main 门禁见 `WORKFLOW.md`」 | 另造「须 N 人审批」等未立项条款；Agent 代点合并 |
| `git-agent-commit` | 「见 regression-lock「Commit 汇报与分支门禁」」（含自动 commit + **Git 同步分级汇总**） | 主张「先问再 commit」的平行口径；完整抄门禁条文；主张可以自动 push；同步时只报「已 push」无 commit 列表 / 无高风险标注 |
| `git-cross-session` | 「见 `WORKFLOW.md` 跨会话节」 | 在 regression-lock 再写完整三步骤（门禁文件只保留一行指针） |
| `git-parallel-worktree` | 「并行写见 `WORKFLOW.md` 并行 worktree 节」 | 主张同目录并行写可接受；在非 SSOT 复述完整 SOP |
| `regression-gate` / `bug-close-s7` | `DEV_WORKFLOW_QUALITY` 解释 why；`PROCESS` 一句话摘要 + 链接 | 在 COLLAB / docs.mdc 再写一整份 checklist |
| `doc-code-contract` | 在 ARCHITECTURE / TEST_TRACKER 链到本文 | 平行发明第二套 docs:check 语义 |
| `rules-authority` | 各处链到本索引 | 「以最后修改的文档为准」 |

**审批人数**：当前**没有**单独的「PR 须 N 人 approve」规则；合并 `main` 的人工闸门是 `WORKFLOW.md`「项目负责人本人在 GitHub 网页上执行」。若以后要加 branch protection 人数，只改 `WORKFLOW.md` 并更新本表。

---

## 承担「项目规则 / 流程规范」角色的文档清单

### A. 工作流 / 门禁 / Agent 行为（本索引主战场）

| 文档 | 角色 |
|---|---|
| [`WORKFLOW.md`](../../WORKFLOW.md)（仓库根） | **SSOT**：分支模型、合并 main、跨会话冲突、并行 worktree |
| [`.cursor/rules/focus-tiger-regression-lock.mdc`](../../.cursor/rules/focus-tiger-regression-lock.mdc) | **SSOT**：回归锁完工门禁、Commit 汇报、Bug close §7 门禁条文 |
| [`.cursor/rules/focus-tiger-docs.mdc`](../../.cursor/rules/focus-tiger-docs.mdc) | Agent 摘要兜底（**非** SSOT；只摘要 + 指向权威） |
| [`DEV_WORKFLOW_QUALITY.md`](./DEV_WORKFLOW_QUALITY.md) | 质量工作流**叙事**（why/how）；门禁条文以 regression-lock 为准 |
| [`PROCESS.md`](./PROCESS.md) | 协作组织、进度速览、Git **操作节奏**摘要；政策指向 SSOT |
| [`COLLAB.md`](./COLLAB.md) | Task Brief / 角色协作约定 |
| [`DOC_CODE_CONTRACT.md`](./DOC_CODE_CONTRACT.md) | **SSOT**：文档↔代码结构对齐机制 |
| **本文件 `RULES_INDEX.md`** | **SSOT**：规则主题 → 权威映射 + 检测入口 |
| [`TEST_TRACKER.md`](./TEST_TRACKER.md) | 验收表维护规则（产品验收，非 Git 政策） |
| [`SCENARIO_TESTS.md`](./SCENARIO_TESTS.md) | 场景剧本权威 |
| `./scripts/git-sync-safe.sh`（仓库根） | 推送前体检脚本（非政策正文） |

### B. 产品 / 设计 / 架构权威（语义 SSOT；一般不进 rules-authority 指纹检测）

| 文档 | 权威主题 |
|---|---|
| `PRODUCT_POSITIONING.md` | 品牌与产品战略 |
| `MVP_PRODUCT_DEFINITION.md` | MVP 用户 / JTBD / 指标 |
| `PRODUCT_MOMENTS.md` | Five Moments |
| `CORE_LOOP.md` | 单次会话状态机叙事 |
| `ARRIVE_MOMENT_DESIGN.md` | Arrival 交互详规 |
| `LIGHT_PROGRESSION_DESIGN.md` | 光影渐进 |
| `PRINCIPLES.md` | 硬性红线 |
| `ARCHITECTURE.md` | 模块边界 / 2D 主线 |
| `EMOTION_BIBLE.md` | 情绪 / 互动 |
| `CHARACTER_BIBLE.md` | 角色设定 |
| `DESIGN.md` | 产品语义与玩法 |
| `RESPONSIVE_LAYOUT.md` | 窄屏 / 移动布局 |
| `SHARED_RESOURCES.md` | 共享资源波及面 |
| `EDGE_CASES.md` | 边角观察册 |
| `RETENTION_FUNNEL.md` | 留存漏斗事件 |
| `ONBOARDING_HINTS.md` / `HONESTY_BRIDGE_CTA.md` 等 | 对应功能详规 |
| `TASKS.md` | 任务序列（排期，非门禁） |

仓库根若干同名文件（如 `SCENARIO_TESTS.md`）仅为**指针**，权威在 `focus-tiger/docs/`。

### C. 检测与 CI

| 机制 | 命令 / 路径 |
|---|---|
| 统一入口 | `cd focus-tiger && npm run docs:check` |
| 本机制 | `rules-authority-doc-check.js` ← registry |
| 文档-代码 | `gate` / `hints` / `state` 三类 `*-doc-check.js` |
| CI | `.github/workflows/focus-tiger-doc-contract-check.yml` |

---

## 新增规则时怎么做

1. 在 `RULE_AUTHORITY_TOPICS`（registry）增加一行：`id` / `ssotPath` / `ssotSection` / 必含断言 / 禁止矛盾短语 / 复述指纹。  
2. **只在 SSOT 文件**写完整条款。  
3. `npm run rules:doc-sync` 刷新本页机器块。  
4. 其它文档若需提及 → 一行引用。  
5. `npm run docs:check` 须绿。

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-07-23 | 初版：盘点规则文档、指定主题 SSOT、接入 `rules:doc-check`，收敛 commit/跨会话等平行复述 |
| 2026-07-23 | 补强 `git-agent-commit`：Git 同步 / 批量 push 须「分级汇总」（commit 列表 + 高风险单独标注）；与 Cursor user rule 对齐方向 |
| 2026-07-23 | 新增 `git-parallel-worktree`：并行 Cursor 写会话须 `git worktree` 隔离；SSOT 在 `WORKFLOW.md` |
