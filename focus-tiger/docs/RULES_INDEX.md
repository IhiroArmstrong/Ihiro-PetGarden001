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
| `git-semver-release` | 语义化版本与稳定发布点（tag，非 release 分支） | `WORKFLOW.md` | 语义化版本与稳定发布点 |
| `git-agent-commit` | Agent 自动 commit / 汇报 / Git 同步分级汇总 / push 与禁自动合 main | `.cursor/rules/focus-tiger-regression-lock.mdc` | Commit 汇报与分支门禁 |
| `git-cross-session` | 跨会话指令冲突处理（开 PR / 合并 / push 前） | `WORKFLOW.md` | 跨会话指令冲突处理 |
| `git-parallel-worktree` | 并行 Cursor 会话须用 git worktree 隔离写操作 | `WORKFLOW.md` | 并行 Cursor 会话：必须用 git worktree 隔离写操作 |
| `git-worktree-occupancy` | 工作树占用检测与 `.ft-session-lock`（一树一线） | `WORKFLOW.md` | 工作树占用检测与 `.ft-session-lock` |
| `git-feature-merge-preview` | feature/fix 合入 develop 前须 worktree 预览确认 | `WORKFLOW.md` | feature/fix 合入 develop 前：worktree 预览确认 |
| `git-branch-health` | 分支健康度（即时纪律 + 双周普查；非 CI 硬拦） | `focus-tiger/docs/PROCESS.md` | 分支健康度 |
| `regression-gate` | 交互修复完工门禁（主路径+回流、静默失败、冒烟、N14/N15…） | `.cursor/rules/focus-tiger-regression-lock.mdc` | 交互修复完工门禁 |
| `bug-close-s7` | Bug close（§7）五证 checklist | `.cursor/rules/focus-tiger-regression-lock.mdc` | AI 修复验收规范（Bug close · §7 · 强制） |
| `doc-code-contract` | 文档-代码结构性对齐（docs:check） | `focus-tiger/docs/DOC_CODE_CONTRACT.md` | DOC_CODE_CONTRACT.md |
| `rules-authority` | 规则主题权威索引（本机制） | `focus-tiger/docs/RULES_INDEX.md` | 规则主题 → 权威来源 |
| `browser-energy` | 预览浏览器与能耗（默认 Safari；硬禁 IDE Browser MCP；进程收尾 / Cloud 独立会话提醒） | `.cursor/rules/focus-tiger-browser-energy.mdc` | Focus Tiger · 预览浏览器与能耗 |
| `qa-develop-tip` | 人工验收只认 origin/develop tip | `focus-tiger/docs/TEST_TRACKER.md` | 人工验收唯一基线 |
| `qa-pass-coverage-split` | 标「已通过」须写清 e2e/人工各覆盖哪些场景 | `focus-tiger/docs/TEST_TRACKER.md` | 标「已通过」门禁 |
| `branch-freshness` | Agent 邀测 / 声称 develop 行为前须 check:branch-freshness | `.cursor/rules/focus-tiger-regression-lock.mdc` | 分支新鲜度（强制 · 验收 / 声称 develop 行为之前） |
| `release-blocker-ledger` | 缺陷分级 / open-blockers / 发布候选清算 | `focus-tiger/docs/TEST_TRACKER.md` | 缺陷分级与处理承诺 |
| `z-index-registry` | 产品 z-index 层叠登记 | `focus-tiger/docs/Z_INDEX.md` | Z_INDEX.md — 产品层叠登记 |
| `agent-token-cost` | Agent Token Cost（禁子 Agent / 禁轮询长 CI / 禁擅自全量 e2e） | `.cursor/rules/focus-tiger-agent-token-cost.mdc` | Focus Tiger · Agent Token Cost（控 Fast Request） |

<!-- rules-authority-index:end -->

### 主题说明（人工）

| topicId | 允许在别处写什么 | 禁止 |
|---|---|---|
| `git-branch-model` | 「分支职责见 `WORKFLOW.md`」 | 再抄一份五列表 |
| `git-merge-main` | 「合并 main 门禁见 `WORKFLOW.md`」 | 另造「须 N 人审批」等未立项条款；Agent 代点合并 |
| `git-semver-release` | 「SemVer / 稳定 tag 见 `WORKFLOW.md` 语义化版本节」 | 主张开发期就开长期 `release/*` 线；平行复述完整 MAJOR/MINOR/PATCH 表与发版 SOP |
| `git-agent-commit` | 「见 regression-lock「Commit 汇报与分支门禁」」（含自动 commit + **Git 同步分级汇总** + 下班前口令第 7 条：只推非运行时） | 主张「先问再 commit」的平行口径；完整抄门禁条文；主张可以自动 push；同步时只报「已 push」无 commit 列表 / 无高风险标注；把「下班前 Git 同步」做成合并 main / 推进 PR；把业务代码/状态机/待确认 diff **默认一并 flush**；下班汇总不标「有/无业务逻辑改动」 |
| `git-cross-session` | 「见 `WORKFLOW.md` 跨会话节」 | 在 regression-lock 再写完整三步骤（门禁文件只保留一行指针） |
| `git-parallel-worktree` | 「并行写见 `WORKFLOW.md` 并行 worktree 节」 | 主张同目录并行写可接受；在非 SSOT 复述完整 SOP |
| `git-worktree-occupancy` | 「占用检测 / `.ft-session-lock` 见 `WORKFLOW.md`」 | 主张可按时间戳 / mtime / git log 推断占用态或自动清别人的锁；缺 `occupancy` 仍凭旁证当成可接管；主张可静默 stash 别人的脏树；完整复述清锁 SOP |
| `git-feature-merge-preview` | 「合前预览 / develop-integrity 见 `WORKFLOW.md`」；`TEST_TRACKER` / `COLLAB` / PR 模板可一行引用两层验收 | 主张合入主干后再做首次预览；把 `qa-develop-tip` 读成可替代合前预览；把 develop-integrity 与 session-lock `releasable` 混为一谈；完整平行复述 rebase/`comm -12` SOP |
| `git-branch-health` | 「分支健康度见 `PROCESS.md`；`COLLAB` 可摘要」 | 主张把分支健康度普查勾成 develop Required / merge 硬拦；完整平行复述阈值表 |
| `regression-gate` / `bug-close-s7` | `DEV_WORKFLOW_QUALITY` 解释 why；`PROCESS` 一句话摘要 + 链接 | 在 COLLAB / docs.mdc 再写一整份 checklist |
| `doc-code-contract` | 在 ARCHITECTURE / TEST_TRACKER 链到本文 | 平行发明第二套 docs:check 语义 |
| `rules-authority` | 各处链到本索引 | 「以最后修改的文档为准」 |
| `browser-energy` | 「预览浏览器 / 进程收尾 / Cloud 独立会话见 `focus-tiger-browser-energy.mdc`」 | 复述完整条款；主张把内置 Browser 当默认预览 / 窄屏特例可开；绕过 `deny-ide-browser-mcp` 硬闸；起过 Vite/Playwright 却不在「待你知道」提醒收尾 |
| `agent-token-cost` | 「控 Fast Request / 禁子 Agent 见 `focus-tiger-agent-token-cost.mdc`」 | 复述完整条款；主张默认可并行 Task/explore；主张 Agent 可自行轮询全量 CI |
| `qa-develop-tip` | 「关单验收见 `TEST_TRACKER` 文首人工验收唯一基线」；`COLLAB` 可一行引用；须与 `git-feature-merge-preview` 两层验收并列理解 | 主张 feature/fix 试跑即正式关单验收；主张「关单只认 tip」=「应先合再测」 |
| `qa-pass-coverage-split` | 「标已通过须覆盖分工见 `TEST_TRACKER`」；regression-lock / docs.mdc 可摘要硬拦 | 主张 e2e 绿即可关单；笼统「测试 OK→已通过」且不写 e2e/人工各覆盖哪些场景 |
| `branch-freshness` | 「邀测前 freshness 见 regression-lock「分支新鲜度」」 | 落后 >0 仍声称代表 develop / 正式邀测却不报落后数 |
| `release-blocker-ledger` | 「缺陷分级 / `check:open-blockers` 见 `TEST_TRACKER`；发版硬闸见 regression-lock「发布候选门禁」」 | 平行发明第二套逾期/分级口径；发版前省略 legacy 提醒；把漏标 `Fixes:` 的技术性补正当成产品向「降级放行」 |
| `z-index-registry` | 「层叠见 `Z_INDEX.md`」 | 平行另造第二份 z-index 分配表 |

**审批人数**：当前**没有**单独的「PR 须 N 人 approve」规则；合并 `main` 的人工闸门是 `WORKFLOW.md`「项目负责人本人在 GitHub 网页上执行」。若以后要加 branch protection 人数，只改 `WORKFLOW.md` 并更新本表。

---

## 承担「项目规则 / 流程规范」角色的文档清单

### A. 工作流 / 门禁 / Agent 行为（本索引主战场）

| 文档 | 角色 |
|---|---|
| [`WORKFLOW.md`](../../WORKFLOW.md)（仓库根） | **SSOT**：分支模型、合并 main、SemVer / 稳定 tag、跨会话冲突、并行 worktree、**合入 develop 前预览确认** |
| [`.cursor/rules/focus-tiger-regression-lock.mdc`](../../.cursor/rules/focus-tiger-regression-lock.mdc) | **SSOT**：回归锁完工门禁、Commit 汇报、Bug close §7、**分支新鲜度**、**发布候选门禁**（open blockers）门禁条文 |
| [`.cursor/rules/focus-tiger-browser-energy.mdc`](../../.cursor/rules/focus-tiger-browser-energy.mdc) | **SSOT**：预览浏览器与能耗（默认 Safari；硬禁 IDE Browser MCP + hooks；Vite/Playwright 收尾提醒；Cloud 独立会话提醒） |
| [`.cursor/rules/focus-tiger-agent-token-cost.mdc`](../../.cursor/rules/focus-tiger-agent-token-cost.mdc) | **SSOT**：Agent Token Cost（禁子 Agent / 禁轮询长 CI / 禁擅自全量 e2e；hooks 硬闸） |
| [`.cursor/rules/focus-tiger-docs.mdc`](../../.cursor/rules/focus-tiger-docs.mdc) | Agent 摘要兜底（**非** SSOT；只摘要 + 指向权威） |
| [`DEV_WORKFLOW_QUALITY.md`](./DEV_WORKFLOW_QUALITY.md) | 质量工作流**叙事**（why/how）；门禁条文以 regression-lock 为准 |
| [`PROCESS.md`](./PROCESS.md) | 协作组织、进度速览、Git **操作节奏**摘要；政策指向 SSOT |
| [`COLLAB.md`](./COLLAB.md) | Task Brief / 角色协作约定；验收 tip 规则引用 `TEST_TRACKER` |
| [`DOC_CODE_CONTRACT.md`](./DOC_CODE_CONTRACT.md) | **SSOT**：文档↔代码结构对齐机制 |
| **本文件 `RULES_INDEX.md`** | **SSOT**：规则主题 → 权威映射 + 检测入口 |
| [`TEST_TRACKER.md`](./TEST_TRACKER.md) | 验收表维护规则；**SSOT**：关单级人工验收只认 `origin/develop` tip；**SSOT**：标「已通过」覆盖分工（`qa-pass-coverage-split`）；**SSOT**：缺陷分级与处理承诺（`release-blocker-ledger`） |
| [`COVERAGE_GAP_AUDIT.md`](./COVERAGE_GAP_AUDIT.md) | **SSOT**：功能模块 vs smoke/e2e 覆盖对照、永不自动化清单、unit\*→smoke 分类（§7）、Honesty/i18n 发布口径 |
| [`Z_INDEX.md`](./Z_INDEX.md) | **SSOT**：产品 z-index 层叠登记 |
| [`SCENARIO_TESTS.md`](./SCENARIO_TESTS.md) | 场景剧本权威 |
| `./scripts/git-sync-safe.sh`（仓库根） | 推送前体检脚本（非政策正文） |

### B. 产品 / 设计 / 架构权威（语义 SSOT；一般不进 rules-authority 指纹检测）

| 文档 | 权威主题 |
|---|---|
| `PRODUCT_POSITIONING.md` | 品牌与产品战略 |
| `MVP_PRODUCT_DEFINITION.md` | MVP 用户 / JTBD / 指标 |
| `ENV_CONFIG.md` | 环境配置与密钥隔离（客户端禁 Secret；dev/prod；CI Secrets 时机） |
| `PRODUCT_MOMENTS.md` | Five Moments |
| `CORE_LOOP.md` | 单次会话状态机叙事 |
| `ARRIVE_MOMENT_DESIGN.md` | Arrival 交互详规 |
| `LIGHT_PROGRESSION_DESIGN.md` | 光影渐进 |
| `PRINCIPLES.md` | 硬性红线 |
| `ARCHITECTURE.md` | 模块边界 / 2D 主线 |
| `EMOTION_BIBLE.md` | 情绪 / 互动 |
| `SCENE_ANIMATION_WIRING.md` | 场景 → 动画接线（时刻 × 档位；v1 Slice A） |
| `HINTS_WIRING.md` | 场景 → Hint 接线（时刻 × 互斥/门闩/批次；对标动画接线管法） |
| `CHARACTER_BIBLE.md` | 角色设定 |
| `DESIGN.md` | 产品语义与玩法 |
| `RESPONSIVE_LAYOUT.md` | 窄屏 / 移动布局 |
| `SHARED_RESOURCES.md` | 共享资源波及面 |
| `EDGE_CASES.md` | 边角观察册 |
| `RETENTION_FUNNEL.md` | 留存漏斗事件 |
| `ONBOARDING_HINTS.md` / `HONESTY_BRIDGE_CTA.md` 等 | 对应功能详规（Hints 文案/tier；接线见 `HINTS_WIRING.md`） |
| `TASKS.md` | 任务序列（排期，非门禁） |

仓库根若干同名文件（如 `SCENARIO_TESTS.md`）仅为**指针**，权威在 `focus-tiger/docs/`。

### C. 检测与 CI

| 机制 | 命令 / 路径 |
|---|---|
| 统一入口 | `cd focus-tiger && npm run docs:check` |
| 本机制 | `rules-authority-doc-check.js` ← registry |
| 文档-代码 | `gate` / `hints` / `state` 三类 `*-doc-check.js` |
| CI | `.github/workflows/focus-tiger-doc-contract-check.yml` |
| PR 轻量冒烟 | `.github/workflows/pr-smoke.yml`（Required on `develop`） |
| 全量 e2e（夜间+手动） | `.github/workflows/focus-tiger-e2e-full.yml`（**`schedule` 读 `main` YAML**；见 `ENV_CONFIG.md` §3） |
| 环境与密钥 | `docs/ENV_CONFIG.md` |

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
| 2026-08-03 | 新增 `git-feature-merge-preview`：合入 develop 前须 worktree 预览确认；develop-integrity ≠ session-lock `releasable`；可执行 rebase 交集判定（`comm -12`）；两层验收与 `qa-develop-tip` 并列；SSOT 在 `WORKFLOW.md`；PR 模板 checkbox |
| 2026-08-02 | 新增 `qa-pass-coverage-split`：标「已通过」须写清 e2e/自动化已锁 vs 人工已覆盖场景（防记入≠验证到位）；SSOT 在 `TEST_TRACKER`；regression-lock 摘要硬拦 |
| 2026-08-02 | 扩展 `git-worktree-occupancy`：`.ft-session-lock` 必填 `occupancy`（`active` / `releasable`），不以 mtime 猜占用；检测脚本解析并区分 exit；SSOT 在 `WORKFLOW.md` |
| 2026-08-02 | 新增 `release-blocker-ledger`：缺陷分级 + `check:open-blockers`；发版硬闸在 regression-lock「发布候选门禁」；SSOT 记录格式在 `TEST_TRACKER` |
| 2026-08-01 | 新增 `git-branch-health`：分支健康度即时纪律 + `check:all-branches-health` 双周普查（非 CI Required）；SSOT 在 `PROCESS.md` |
| 2026-07-31 | 扩展 `agent-token-cost`：CI 红 / 多文件冲突本地验证预算（先摘要、问新 worktree、本地最多 1 轮、最终 push+CI）；`WORKFLOW` 并行 worktree 补 3a 短引用 |
| 2026-07-30 | 新增 `git-worktree-occupancy`：`.ft-session-lock` + 开工三条硬规则 + `check:worktree-occupancy`；SSOT 在 `WORKFLOW.md` |
| 2026-07-23 | 初版：盘点规则文档、指定主题 SSOT、接入 `rules:doc-check`，收敛 commit/跨会话等平行复述 |
| 2026-07-23 | 补强 `git-agent-commit`：Git 同步 / 批量 push 须「分级汇总」（commit 列表 + 高风险单独标注）；与 Cursor user rule 对齐方向 |
| 2026-07-23 | 新增 `git-parallel-worktree`：并行 Cursor 写会话须 `git worktree` 隔离；SSOT 在 `WORKFLOW.md` |
| 2026-07-23 | 固定口令「请安排下班前的 Git 同步」语义：只 push `develop`/`feature`/`fix` + 分级汇总；不合并 main、不推进 PR（见 regression-lock 第 7 条） |
| 2026-07-25 | 新增 `browser-energy`：默认 Safari 预览；Cursor 内置 Browser 仅窄屏特例且最长 10 分钟（SSOT：`focus-tiger-browser-energy.mdc`） |
| 2026-07-26 | 扩展 `browser-energy`：Vite/Playwright 进程收尾提醒 + Cloud「独立会话」提醒（用户拍板养成习惯） |
| 2026-07-29 | 新增 `qa-develop-tip`（关单验收只认 `origin/develop` tip）、`branch-freshness`（邀测前 `check:branch-freshness`）、`z-index-registry`（`Z_INDEX.md`） |
| 2026-07-29 | 收窄「请安排下班前的 Git 同步」：默认可推仅非运行时（文档/规则/脚本注释）；业务代码·状态机·待确认 diff 单独列出不 flush；汇总须标有无业务逻辑改动（regression-lock 第 7 条） |
| 2026-07-29 | 新增 `agent-token-cost`：禁子 Agent / 禁轮询长 CI / 禁擅自全量 e2e（SSOT：`focus-tiger-agent-token-cost.mdc` + hooks） |
| 2026-07-31 | 收紧 `browser-energy`：取消窄屏/口头特例；`deny-ide-browser-mcp` 硬禁 `cursor-ide-browser`（`beforeMCPExecution` + `preToolUse`）；窄屏改 Safari 响应式 / Playwright |
