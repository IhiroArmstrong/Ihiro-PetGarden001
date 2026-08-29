# RULES_INDEX.md — 规则主题权威索引（Single Source of Truth）

创建日期：2026-07-23  
目的：每个**规则主题**只指定**一份**权威文档；其它文档只能一句话引用并链接，禁止平行完整表述。  
冲突解法：**以本索引指定的 SSOT 为准**，**不以**「最后修改时间更晚的文档」为准。  
文末「修订记录」为**历史留痕**，**不要以其中任意一条作为当前生效依据**——当前条款只认各主题 SSOT 源文件。

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
| `git-worktree-hygiene` | 闲置 worktree 只读盘点 + 口令拆除（不可逆） | `WORKFLOW.md` | 并行 Cursor 会话：必须用 git worktree 隔离写操作 |
| `git-worktree-occupancy` | 工作树占用检测与 `.ft-session-lock`（一树一线） | `WORKFLOW.md` | 工作树占用检测与 `.ft-session-lock` |
| `git-feature-merge-preview` | feature/fix 合入 develop：研发自检 + 主干同步（非人工关单） | `WORKFLOW.md` | feature/fix 合入 develop：研发自检 + 主干同步 |
| `git-develop-small-pr-run-merge` | 合入 develop：CI 绿即可合并（人工测试非合入门闩） | `WORKFLOW.md` | 合入 develop：CI 绿即可合并 |
| `prod-worker-deploy` | 生产 Worker Redeploy 须明确「部署」口令 | `WORKFLOW.md` | 生产 Worker Redeploy |
| `git-pr-base-develop` | 开 PR 须确认 `--base`（默认 develop；禁默认打 main） | `WORKFLOW.md` | 开 PR 前 · `--base` 自查 |
| `git-branch-health` | 分支健康度（即时纪律 + 双周普查；非 CI 硬拦） | `focus-tiger/docs/PROCESS.md` | 分支健康度 |
| `regression-gate` | 交互修复完工门禁（主路径+回流、静默失败、冒烟、N14/N15…） | `.cursor/rules/focus-tiger-regression-lock.mdc` | 交互修复完工门禁 |
| `bug-close-s7` | Bug close（§7）五证 checklist | `.cursor/rules/focus-tiger-regression-lock.mdc` | AI 修复验收规范（Bug close · §7 · 强制） |
| `doc-code-contract` | 文档-代码结构性对齐（docs:check） | `focus-tiger/docs/DOC_CODE_CONTRACT.md` | DOC_CODE_CONTRACT.md |
| `rules-authority` | 规则主题权威索引（本机制） | `focus-tiger/docs/RULES_INDEX.md` | 规则主题 → 权威来源 |
| `browser-energy` | 预览浏览器与能耗（默认 Safari；硬禁 IDE Browser MCP；临时解禁有连续时长上限；进程收尾 / Cloud 独立会话提醒；用户侧 cd 路径口径） | `.cursor/rules/focus-tiger-browser-energy.mdc` | Focus Tiger · 预览浏览器与能耗 |
| `qa-develop-tip` | 人工验收只认 origin/develop tip | `focus-tiger/docs/TEST_TRACKER.md` | 人工验收唯一基线 |
| `qa-pass-coverage-split` | 标「已通过」须写清 e2e/人工各覆盖哪些场景 | `focus-tiger/docs/TEST_TRACKER.md` | 标「已通过」门禁 |
| `qa-batch-human-test` | 口令「批量人工测试」：按模块列出全部待人工测试项 | `focus-tiger/docs/TEST_TRACKER.md` | 批量人工测试 |
| `qa-develop-worktree` | 固定 develop 验收 worktree（关单 / 批量人工测试 · 5173 常驻） | `WORKFLOW.md` | 固定 develop 验收 worktree |
| `branch-freshness` | Agent 邀测 / 声称 develop 行为前须 check:branch-freshness | `.cursor/rules/focus-tiger-regression-lock.mdc` | 分支新鲜度（强制 · 验收 / 声称 develop 行为之前） |
| `release-blocker-ledger` | 缺陷分级 / open-blockers / 发布候选清算 | `focus-tiger/docs/TEST_TRACKER.md` | 缺陷分级与处理承诺 |
| `z-index-registry` | 产品 z-index 层叠登记 | `focus-tiger/docs/Z_INDEX.md` | Z_INDEX.md — 产品层叠登记 |
| `agent-token-cost` | Agent Token Cost（禁子 Agent / 禁轮询长 CI / 禁擅自全量 e2e） | `.cursor/rules/focus-tiger-agent-token-cost.mdc` | Focus Tiger · Agent Token Cost（控 Fast Request） |
| `e2e-local-budget` | 本地 e2e 硬顶（≤1 spec/次；全量/visibility/多文件禁本地；RUN_E2E_LOCAL 逃生口） | `.cursor/rules/testing-strategy.mdc` | 本地 e2e 硬顶（e2e-local-budget · 可执行） |
| `risk-mitigation-playbook` | 中高风险任务落地降险 Playbook | `focus-tiger/docs/RISK_MITIGATION_PLAYBOOK.md` | 触发条件 |
| `interaction-feedback` | 点击接收反馈 vs 结果反馈 vs 已知静默白名单 | `focus-tiger/docs/INTERACTION_FEEDBACK_PRINCIPLES.md` | 核心原则 |
| `recommend-most-reasonable` | 列多个方案时须同时给出「我认为最合理的」一项 | `.cursor/rules/focus-tiger-recommend-most-reasonable.mdc` | Focus Tiger · 给选项时必须给「最合理项」 |
| `session-handoff` | 会话交接（口令「生成交接」：结构化摘要给下一会话） | `.cursor/rules/focus-tiger-session-handoff.mdc` | Focus Tiger · 会话交接（Session Handoff） |
| `companion-debug` | 调试本地 AI companion（先定点、限日志、最多 3 轮、简单调试不升档） | `.cursor/rules/focus-tiger-companion-debug.mdc` | Focus Tiger · 调试本地 AI companion |
| `infra-snapshot` | 基础设施现状摘要（Worker/KV/entitlement/locale 等低频配置快照） | `focus-tiger/docs/INFRA_SNAPSHOT.md` | INFRA_SNAPSHOT — 基础设施现状摘要（非 SSOT） |
| `source-read-granularity` | 源码读取粒度（大文件先定位再片段读，控上下文 token） | `.cursor/rules/focus-tiger-source-read-granularity.mdc` | Focus Tiger · 源码读取粒度（控上下文 token · 按需层） |
| `feature-conflict-review` | 实现前功能冲突扫描（强度 / 语气 / 职责） | `focus-tiger/docs/FEATURE_CONFLICT_REVIEW.md` | 扫描三轴 |
| `background-network` | 非用户点击的网络请求（时机 / 写盘 / 慢网动效） | `focus-tiger/docs/BACKGROUND_NETWORK.md` | 实现前三问（强制） |

<!-- rules-authority-index:end -->

### 主题说明（人工）

| topicId | 允许在别处写什么 | 禁止 |
|---|---|---|
| `git-branch-model` | 「分支职责见 `WORKFLOW.md`」 | 再抄一份五列表 |
| `git-merge-main` | 「合并 main 门禁见 `WORKFLOW.md`」 | 另造「须 N 人审批」等未立项条款；Agent 代点合并 |
| `git-semver-release` | 「SemVer / 稳定 tag 见 `WORKFLOW.md` 语义化版本节」 | 主张开发期就开长期 `release/*` 线；平行复述完整 MAJOR/MINOR/PATCH 表与发版 SOP |
| `git-agent-commit` | 「见 regression-lock「Commit 汇报与分支门禁」」（含自动 commit + **任务完成后默认 push 旁支/开 PR** + Git 同步分级汇总 + 下班前口令补漏 + **SCENARIO_TESTS 增量核对**） | 主张「先问再 commit」；主张**每次** push 须口头授权；完整抄门禁条文；**主张可直推 `develop`/`main`**；把 develop 与 feature/fix **并列**成同等可推目标；同步时只报「已 push」无 commit 列表 / 无高风险标注 / 无 PR；把「下班前 Git 同步」做成合并 main / 生产部署 / 推进无关 PR；**下班前同步却不更新 SCENARIO_TESTS** |
| `git-cross-session` | 「见 `WORKFLOW.md` 跨会话节」；对话交接摘要见 `session-handoff`，勿与本条混写 | 在 regression-lock 再写完整三步骤（门禁文件只保留一行指针）；把本条扩成交接模板 |
| `git-parallel-worktree` | 「并行写见 `WORKFLOW.md` 并行 worktree 节」；Cloud 旁支落本机见同节第 8 款（一行指针即可） | 主张同目录并行写可接受；主张可在主仓点 Cursor Apply / checkout migrated branch；在非 SSOT 复述完整 SOP |
| `git-worktree-occupancy` | 「占用检测 / `.ft-session-lock` 见 `WORKFLOW.md`」；`releasable` **仅**锁占用态，**≠** develop-integrity（见 `git-feature-merge-preview`）；会话结束 N14 须报锁态 | 主张可按 OS mtime / git log 推断占用态；缺 `occupancy` 仍凭旁证当成可接管；主张可静默 stash 别人的脏树；完整复述清锁 SOP；把锁 `releasable` 说成主干可发布；把「锁可自动接管」扩成可静默 `worktree remove` |
| `git-worktree-hygiene` | 「闲置 worktree 盘点 / 口令拆除见 `WORKFLOW.md` 结束后清理」；数据源 `check:worktree-hygiene`；本机按清单清见同节 `worktree:hygiene-remove`（默认 dry-run，`--apply` 只拆 `propose_remove`）；`propose_remove` = 干净+非 cwd+锁可放行+（祖先 **或** cherry 无独有补丁）；固定 QA 树豁免见 `qa-develop-worktree`；与 occupancy Prompt 3 同原则分风险 | 主张 Agent 可静默 `git worktree remove`；每回合默认问要不要清盘；无口令/无点名即拆除；把 hygiene 与锁陈旧自动接管混成同一宽松标准；仅用 tip 祖先判定已合入（忽略 squash）；把 `…-wt-develop-qa` 列入 `propose_remove`；用 Finder 文件夹列表代替 `git worktree list` |
| `git-feature-merge-preview` | 「合入前研发自检 / 主干同步 / **develop-integrity**（≠ session-lock `releasable`）见 `WORKFLOW.md`」；`TEST_TRACKER` / `COLLAB` / PR 模板可一行引用两层验收（CI 合入 vs tip 关单） | 主张须等用户 Safari 确认才可开 PR / 合 develop；把 develop-integrity 与 session-lock `releasable` 混为一谈；笼统「纯文档」跳过冒烟（未按运行时路径白/黑名单）；完整平行复述 rebase/`comm -12` SOP |
| `git-develop-small-pr-run-merge` | 「合入 develop：CI 绿即可合并见 `WORKFLOW.md`」（旧称文档/小 PR Run 合并；现含运行时 PR）；regression-lock / PROCESS / COLLAB / docs.mdc 可一行引用 | 把合 develop 默认改回「只请你上 GitHub 手合」或「等人工测完再合」；把本条扩成合 `main` 或生产部署；下班前口令顺手推进无关 PR |
| `prod-worker-deploy` | 「生产 Worker 须明确「部署」见 `WORKFLOW.md`」；cloud README 可一行引用 | 主张合入 develop / CI 绿即可 redeploy；把「同步」「发布」当成部署口令 |
| `git-pr-base-develop` | 「开 PR 须 `--base develop`；见 `WORKFLOW.md`」；PROCESS 血统检查可一行引用 | 主张可省略 `--base` 靠 GitHub 默认；日常 PR 默认可打 `main`；误开后仍等 CI 不立刻纠正 |
| `git-branch-health` | 「分支健康度见 `PROCESS.md`；`COLLAB` 可摘要」 | 主张把分支健康度普查勾成 develop Required / merge 硬拦；完整平行复述阈值表 |
| `regression-gate` / `bug-close-s7` | `DEV_WORKFLOW_QUALITY` 解释 why；`PROCESS` 一句话摘要 + 链接 | 在 COLLAB / docs.mdc 再写一整份 checklist |
| `doc-code-contract` | 在 ARCHITECTURE / TEST_TRACKER 链到本文 | 平行发明第二套 docs:check 语义 |
| `rules-authority` | 各处链到本索引 | 「以最后修改的文档为准」 |
| `browser-energy` | 「预览浏览器 / 进程收尾 / Cloud 独立会话 / 用户侧 `cd` 路径口径见 `focus-tiger-browser-energy.mdc`」 | 复述完整条款或具体分钟/时长数值；主张把内置 Browser 当默认预览 / 窄屏特例可开；绕过 IDE Browser 硬闸；违反 SSOT 连续开放上限 / 续开不清零 / 精确时间戳汇报；起过 Vite/Playwright 却不在「待你知道」提醒收尾；给用户 `npm run dev` 却写省略号 / 占位 `cd` 路径 |
| `agent-token-cost` | 「控 Fast Request / 禁子 Agent 见 `focus-tiger-agent-token-cost.mdc`」 | 复述完整条款；主张默认可并行 Task/explore；主张 Agent 可自行轮询全量 CI |
| `e2e-local-budget` | 「本地 e2e 硬顶见 `testing-strategy.mdc`；执行：`run-e2e-changed` / `e2e-ci-guard` / `gate-local-heavy-e2e`」；regression-lock / agent-token-cost / WORKFLOW 可一行引用 | 主张本地可一次跑多个 changed spec；主张无 override 可跑全量；平行写第二套数字（如「最多 2 次」） |
| `qa-develop-tip` | 「关单验收见 `TEST_TRACKER` 文首人工验收唯一基线」；可一句指向同文件「主干一次性关单验收」与 `KNOWN_RISKY_TEST_CHECKLIST` §0；`COLLAB` 可一行引用；须与 `git-feature-merge-preview` 两层验收并列理解；本机树见 `qa-develop-worktree` | 主张 feature/fix 试跑即正式关单验收；主张用过时 feature worktree / Support-only QA tree 代替当时 tip |
| `qa-develop-worktree` | 「固定 QA 树见 `WORKFLOW.md`」；合入后 `sync:qa-develop` + ①重启/硬刷新 ②一句变化；`TEST_TRACKER` / KnownRisky / regression-lock / browser-energy 可一行引用 | 主张在 QA 树开发/commit；主张每次新建 `…-wt-qa-develop-tip`；Cloud 假装已在 Mac pull；为收尾停掉 QA `:5173` Vite；主张 `5173` 正在测时抢端口或 `git switch` 正在出码的目录 |
| `qa-batch-human-test` | 「口令「批量人工测试」见 `TEST_TRACKER`」；PROCESS / COLLAB 可一行引用 | 让用户自己翻 PR 历史拼待测项；把清单当成已关单 |
| `qa-pass-coverage-split` | 「标已通过须覆盖分工见 `TEST_TRACKER`」；regression-lock / docs.mdc 可摘要硬拦 | 主张 e2e 绿即可关单；笼统「测试 OK→已通过」且不写 e2e/人工各覆盖哪些场景 |
| `branch-freshness` | 「邀测前 freshness 见 regression-lock「分支新鲜度」」 | 落后 >0 仍声称代表 develop / 正式邀测却不报落后数 |
| `release-blocker-ledger` | 「缺陷分级 / `check:open-blockers` 见 `TEST_TRACKER`；发版硬闸见 regression-lock「发布候选门禁」」 | 平行发明第二套逾期/分级口径；发版前省略 legacy 提醒；把漏标 `Fixes:` 的技术性补正当成产品向「降级放行」 |
| `z-index-registry` | 「层叠见 `Z_INDEX.md`」 | 平行另造第二份 z-index 分配表 |
| `risk-mitigation-playbook` | 「中高风险落地降险见 `RISK_MITIGATION_PLAYBOOK.md`」；`WORKFLOW` 可一行入口 | 把降险切片写成可跳过 Dispatcher / 可先挂产品钩子再补动画 / 可另造简化兜底；在非 SSOT 完整复述四件套+红线 |
| `interaction-feedback` | 「点击反馈见 `INTERACTION_FEEDBACK_PRINCIPLES.md`；已知静默见 `SILENT_BEHAVIORS.md`」；PR 模板 / Cursor 规则可引用 Q1–Q2；第三问见 `feature-conflict-review` | 把逻辑测绿当成点击可感知验收；把有意沉默留白不进白名单；在非 SSOT 复述六条全文 |
| `recommend-most-reasonable` | 「列多个方案须给最合理项见 `focus-tiger-recommend-most-reasonable.mdc`」；regression-lock / DEV_WORKFLOW_QUALITY / PROCESS / docs.mdc 可一行引用 | 主张列出选项即可、Agent 不必表态；完整复述条款；用本条代替用户拍板或代点 Merge |
| `session-handoff` | 「口令「生成交接」见 `focus-tiger-session-handoff.mdc`」；PROCESS / COLLAB / WORKFLOW 跨会话节 / docs.mdc / TEST_TRACKER 可一行引用 | 完整复述交接模板字段；主张交接摘要可代替人工关单 / 可跳过 push+PR；把本条与 `git-cross-session` 混成同一条 |
| `companion-debug` | 「调试本地 AI companion 见 `focus-tiger-companion-debug.mdc`」；实验室脚本路径/命名/已测候选见 `LAB_SCRIPT_CONVENTIONS.md`（勿复述路径表）；docs.mdc / PROCESS 可一行引用 | 复述完整条款或循环上限数字；主张可无范围「全面改善」；主张可读完整 `turns.jsonl` / 日志目录；把 `CompanionModePicker` / Idle PiP 误套成本条 |
| `source-read-granularity` | 「大文件片段读见 `focus-tiger-source-read-granularity.mdc`」；`agent-token-cost` §7 / `focus-tiger-core` 按需索引可一行引用 | 复述完整阈值表或流程；主张 ≥400 行源码默认可整文件 Read；平行写第二套行数门槛 |
| `infra-snapshot` | 「Worker/KV/entitlement 现状见 `INFRA_SNAPSHOT.md`」；`ENV_CONFIG` 只链规则；接云任务前可读摘要 | 在 `ENV_CONFIG` 再维护「仓库事实」大表；把 Secret 值写进摘要；未经「部署」口令更新 `prod_worker_version` |
| `feature-conflict-review` | 「实现前冲突扫描见 `FEATURE_CONFLICT_REVIEW.md`」；PR 第三问 / Cursor 规则 / `SCENARIO_TESTS` 文首可一行引用 | 发现冲突仍先实现再问；主张文档改动可跳过扫描后默认执行；在非 SSOT 复述三轴全文；与 `risk-mitigation-playbook` / 已好清单混成同一条 |
| `scenario-tests-eod-sync` | 「下班前 Git 同步须增量核对 `SCENARIO_TESTS.md` 见 regression-lock 第 7 条 / `PROCESS` Git 同步节奏」；`git-agent-commit` 可一行引用 | 下班前 sync 只 push 不更新场景剧本；整份重写 SCENARIO_TESTS；把 TEST_TRACKER 碎片复制进场景正文 |
| `background-network` | 「后台网络三问见 `BACKGROUND_NETWORK.md`」；PR 模板 / Cursor 规则可引用三问；PROCESS / Brief 可一行引用 | 主张请求快就可以和动效重叠；主张未变化也可无条件覆盖本地副本；只测请求成败当验收；在非 SSOT 复述三问全文 |

**审批人数**：当前**没有**单独的「PR 须 N 人 approve」规则；合并 `main` 的人工闸门是 `WORKFLOW.md`「项目负责人本人在 GitHub 网页上执行」。若以后要加 branch protection 人数，只改 `WORKFLOW.md` 并更新本表。

---

## 承担「项目规则 / 流程规范」角色的文档清单

### A. 工作流 / 门禁 / Agent 行为（本索引主战场）

| 文档 | 角色 |
|---|---|
| [`WORKFLOW.md`](../../WORKFLOW.md)（仓库根） | **SSOT**：分支模型、合并 main、SemVer / 稳定 tag、跨会话冲突、并行 worktree、**固定 QA develop 树**、**合入 develop（CI 绿）**、**生产 Worker 部署口令** |
| [`.cursor/rules/focus-tiger-regression-lock.mdc`](../../.cursor/rules/focus-tiger-regression-lock.mdc) | **SSOT**：回归锁完工门禁、Commit 汇报、Bug close §7、**分支新鲜度**、**发布候选门禁**（open blockers）门禁条文 |
| [`.cursor/rules/focus-tiger-browser-energy.mdc`](../../.cursor/rules/focus-tiger-browser-energy.mdc) | **SSOT**：预览浏览器与能耗（默认 Safari；硬禁 IDE Browser MCP + hooks；临时解禁有连续时长上限；Vite/Playwright 收尾；Cloud 独立会话；用户侧 `cd`/`npm run dev` 路径口径） |
| [`.cursor/rules/focus-tiger-agent-token-cost.mdc`](../../.cursor/rules/focus-tiger-agent-token-cost.mdc) | **SSOT**：Agent Token Cost（禁子 Agent / 禁轮询长 CI / 禁擅自全量 e2e；hooks 硬闸） |
| [`.cursor/rules/focus-tiger-recommend-most-reasonable.mdc`](../../.cursor/rules/focus-tiger-recommend-most-reasonable.mdc) | **SSOT**：列多个方案时须同时给出「我认为最合理的」（`recommend-most-reasonable` / N14b） |
| [`.cursor/rules/focus-tiger-session-handoff.mdc`](../../.cursor/rules/focus-tiger-session-handoff.mdc) | **SSOT**：会话交接（口令「生成交接」；`session-handoff`） |
| [`.cursor/rules/focus-tiger-companion-debug.mdc`](../../.cursor/rules/focus-tiger-companion-debug.mdc) | **SSOT**：调试/优化桌面本地 AI companion（先定点、限日志、循环上限、简单调试不升档；`companion-debug`；**glob 注入，非 alwaysApply**） |
| [`.cursor/rules/focus-tiger-source-read-granularity.mdc`](../../.cursor/rules/focus-tiger-source-read-granularity.mdc) | **SSOT**：源码读取粒度（大文件先定位再片段读；`source-read-granularity`；**按需加载，非 alwaysApply**） |
| [`.cursor/rules/testing-strategy.mdc`](../../.cursor/rules/testing-strategy.mdc) | **SSOT**：本地 e2e 硬顶政策（`e2e-local-budget`；执行层：`run-e2e-changed` / `e2e-ci-guard` / `gate-local-heavy-e2e`） |
| [`.cursor/rules/focus-tiger-interaction-feedback.mdc`](../../.cursor/rules/focus-tiger-interaction-feedback.mdc) | Agent 摘要：可点击交互 PR 必答 0–1s / 沉默白名单（**非** SSOT；全文见 `INTERACTION_FEEDBACK_PRINCIPLES.md`；**glob 注入，非 alwaysApply**） |
| [`.cursor/rules/focus-tiger-feature-conflict-review.mdc`](../../.cursor/rules/focus-tiger-feature-conflict-review.mdc) | Agent 摘要：实现前冲突扫描（**非** SSOT；全文见 `FEATURE_CONFLICT_REVIEW.md`；**glob 注入，非 alwaysApply**） |
| [`.cursor/rules/focus-tiger-background-network.mdc`](../../.cursor/rules/focus-tiger-background-network.mdc) | Agent 摘要：非用户点击网络请求须答三问（**非** SSOT；全文见 `BACKGROUND_NETWORK.md`；**glob 注入，非 alwaysApply**） |
| [`.cursor/rules/focus-tiger-docs.mdc`](../../.cursor/rules/focus-tiger-docs.mdc) | Agent 摘要兜底（**非** SSOT；只摘要 + 指向权威） |
| [`DEV_WORKFLOW_QUALITY.md`](./DEV_WORKFLOW_QUALITY.md) | 质量工作流**叙事**（why/how）；门禁条文以 regression-lock 为准 |
| [`PROCESS.md`](./PROCESS.md) | 协作组织、进度速览、Git **操作节奏**摘要；政策指向 SSOT |
| [`COLLAB.md`](./COLLAB.md) | Task Brief / 角色协作约定；验收 tip 规则引用 `TEST_TRACKER` |
| [`DOC_CODE_CONTRACT.md`](./DOC_CODE_CONTRACT.md) | **SSOT**：文档↔代码结构对齐机制 |
| [`RISK_MITIGATION_PLAYBOOK.md`](./RISK_MITIGATION_PLAYBOOK.md) | **SSOT**：中高风险功能落地降险（四件套 + 架构红线；索引 `risk-mitigation-playbook`） |
| [`FEATURE_CONFLICT_REVIEW.md`](./FEATURE_CONFLICT_REVIEW.md) | **SSOT**：实现前功能冲突扫描（强度 / 语气 / 职责；索引 `feature-conflict-review`） |
| [`BACKGROUND_NETWORK.md`](./BACKGROUND_NETWORK.md) | **SSOT**：非用户点击的网络请求实现前三问（时机 / 写盘 / 慢网动效；索引 `background-network`） |
| **本文件 `RULES_INDEX.md`** | **SSOT**：规则主题 → 权威映射 + 检测入口 |
| [`TEST_TRACKER.md`](./TEST_TRACKER.md) | 验收表维护规则；**SSOT**：关单级人工验收只认 `origin/develop` tip；**SSOT**：标「已通过」覆盖分工（`qa-pass-coverage-split`）；**SSOT**：批量人工测试口令（`qa-batch-human-test`）；**SSOT**：缺陷分级与处理承诺（`release-blocker-ledger`） |
| [`COVERAGE_GAP_AUDIT.md`](./COVERAGE_GAP_AUDIT.md) | **SSOT**：功能模块 vs smoke/e2e 覆盖对照、永不自动化清单、unit\*→smoke 分类（§7）、Honesty/i18n 发布口径 |
| [`Z_INDEX.md`](./Z_INDEX.md) | **SSOT**：产品 z-index 层叠登记 |
| [`SCENARIO_TESTS.md`](./SCENARIO_TESTS.md) | 场景剧本权威 |
| `./scripts/git-sync-safe.sh`（仓库根） | 推送前体检脚本（非政策正文） |

### B. 产品 / 设计 / 架构权威（语义 SSOT；一般不进 rules-authority 指纹检测）

| 文档 | 权威主题 |
|---|---|
| `PRODUCT_POSITIONING.md` | 品牌与产品战略 |
| `FROM_APP_TO_CULTURE.md` | **文化探索方向锁**（From App to Culture；验证框架；Slack 实验室 ≠ App 社交；无运行时；从属定位稿 + PRINCIPLES） |
| `MVP_PRODUCT_DEFINITION.md` | MVP 用户 / JTBD / 指标 / 付费假设 |
| `FREE_PAID_MATRIX.md` | 功能×免费/付费×接线差距对账（**方向锁 / SSOT**；从属 MVP §五） |
| `FOCUS_COINS.md` | 寅币（Focus Coins）+ Yin's Collections：隔离 B 轨、花园 vs 珍藏、清供 8、序列帧铁律（**方向锁 2026-08-20**；运行时见 Brief） |
| `INFRA_SNAPSHOT.md` | **基础设施现状摘要**（Worker/KV/entitlement/locale/CI 等低频配置；`infra-snapshot`）；非 SSOT，过期读源文件 |
| `ENV_CONFIG.md` | **环境密钥隔离规则**（客户端禁 Secret；dev/prod；CI Secrets 时机）；现状事实见 `INFRA_SNAPSHOT` |
| `PRODUCT_MOMENTS.md` | Five Moments |
| `CORE_LOOP.md` | 单次会话状态机叙事 |
| `ARRIVE_MOMENT_DESIGN.md` | Arrival 交互详规 |
| `LIGHT_PROGRESSION_DESIGN.md` | 光影渐进 |
| `PRINCIPLES.md` | 硬性红线（含经济可持续 / 非 MVP-only） |
| `INTERACTION_FEEDBACK_PRINCIPLES.md` | 点击接收反馈 vs 结果反馈 vs 已知静默（`interaction-feedback`） |
| `FEATURE_CONFLICT_REVIEW.md` | 实现前冲突扫描（`feature-conflict-review`）；对照剧本仍是 `SCENARIO_TESTS.md` |
| `SILENT_BEHAVIORS.md` | 设计上就该没反应的白名单（从属上条） |
| `ARCHITECTURE.md` | 模块边界 / 2D 主线 |
| `YIN_PERSONAL_MEMORY.md` | 阿寅个人记忆架构 V1（方向锁；≠ 练习云备份 / Journey Log / turns.jsonl） |
| `YIN_PERSONALIZATION_ENGINE.md` | Yin Personalization Engine V1（方向锁；L0/L1 本地运行时；L2 契约/Consent/身份/算法已拍、Worker 未开工；≠ 品味层 / Memory store / Qwen） |
| `CONFIDE_EXECUTABLE_INTENTS.md` | Confide 可执行意图白名单 V1（层 3 前规则路由；CI → Tool Registry；≠ 开放域 Agent） |
| `LOCAL_AI_SCENARIOS_V1.md` | 本地 AI 场景规划 V1（轨道 A/B/C；Tool Registry 演进；≠ Auto-Operating 入口） |
| `LOCAL_AI_OPERATING_LAYER.md` | Local AI Operating Layer 方向锁（Auto-Operating ≠ Confide；只设计无运行时；Backup/Update/MCP 不进 Confide V1） |
| `LOCAL_AI_SCENARIO_EXPANSION_REVIEW.md` | Local AI 扩场景会审输入（#462；已结案 → PO 决策） |
| `LOCAL_AI_SCENARIO_EXPANSION_DESIGNER_PRE_REVIEW.md` | 设计师预审（#475；已由 PO 决策 supersede） |
| `LOCAL_AI_SCENARIO_EXPANSION_PO_DECISION.md` | **产品负责人正式拍板**（2026-08-28；Phase 1 · 非自动 runtime） |
| `EMOTION_BIBLE.md` | 情绪 / 互动 |
| `SCENE_ANIMATION_WIRING.md` | 场景 → 动画接线（时刻 × 档位；v1 Slice A） |
| `FLOWER_BLOW_WELCOME_DESIGN.md` | Day1/久别吹花鼓励：策略 C、同日 XOR 欢迎池、观察式文案、分阶段落线（未接线前以本文为准） |
| `HINTS_WIRING.md` | 场景 → Hint 接线（时刻 × 互斥/门闩/批次；对标动画接线管法） |
| `CHARACTER_BIBLE.md` | 角色设定 |
| `DESIGN.md` | 产品语义与玩法 |
| `RESPONSIVE_LAYOUT.md` | 窄屏 / 移动布局 |
| `SHARED_RESOURCES.md` | 共享资源波及面 |
| `TODAY_PRACTICE_SEMANTICS_AUDIT.md` | **「今日算不算练过 / 已同坐」语义 SSOT**（完成账本 vs celebrated / Journey / DORMANT / 留存；新功能判断前先查） |
| `EDGE_CASES.md` | 边角观察册 |
| `RETENTION_FUNNEL.md` | 留存漏斗事件 |
| `MONETIZATION_INTENT_FUNNEL.md` | 付费意愿漏斗事件（本地） |
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
| 全量 e2e（夜间+手动） | `.github/workflows/focus-tiger-e2e-full.yml`（**`schedule` 读默认分支 YAML，现为 `develop`**；见 `ENV_CONFIG.md` §3） |
| 环境与密钥规则 | `docs/ENV_CONFIG.md` · 现状摘要 `docs/INFRA_SNAPSHOT.md` |

---

## 新增规则时怎么做

1. 在 `RULE_AUTHORITY_TOPICS`（registry）增加一行：`id` / `ssotPath` / `ssotSection` / 必含断言 / 禁止矛盾短语 / 复述指纹。  
2. **只在 SSOT 文件**写完整条款。  
3. `npm run rules:doc-sync` 刷新本页机器块。  
4. 其它文档若需提及 → 一行引用。  
5. `npm run docs:check` 须绿。

---

## 修订记录

> **本日志为历史记录**，当前生效规则请查阅各主题 **SSOT 源文件**（见上方索引表），**不要以本日志任意一条历史记录作为当前依据。**

| 日期 | 说明 |
|---|---|
| 2026-08-27 | 新增 `LOCAL_AI_OPERATING_LAYER.md`：Auto-Operating ≠ Confide；只设计无运行时 |
| 2026-08-26 | 新增 `scenario-tests-eod-sync`：口令「请安排下班前的 Git 同步」须先增量核对并更新 `SCENARIO_TESTS.md`（文首日期 + 升格场景；勿整份重写）。SSOT regression-lock 第 7 条 + `PROCESS` Git 同步节奏 step 0。本次升格 **AF–AK**（Presence / Yin Memory / Overlay / Backup / Newsletter / PiP gate） |
| 2026-08-24 | L0 实验室脚本约定 `LAB_SCRIPT_CONVENTIONS.md`（只指路：路径 / 调用 / 命名 / 陷阱 / 候选索引）。PROCESS 文首 + `companion-debug` 可检索。不锁生产默认 |
| 2026-08-24 | 第一批 alwaysApply 收窄：`companion-debug` / `background-network` / `interaction-feedback` / `feature-conflict-review` 四份 Cursor 规则改为 `alwaysApply: false` + globs（打开匹配路径时注入）。regression-lock / docs 拆分另任务 |
| 2026-08-23 | 新增 `companion-debug`：调试/优化桌面本地 AI companion 须先定点、限读最近一条日志、测试循环有上限、简单调试不升 High/Max。SSOT `.cursor/rules/focus-tiger-companion-debug.mdc`。不覆盖 `CompanionModePicker` / Idle PiP |
| 2026-08-22 | 新增 `background-network`：非用户点击的网络请求实现前须答时机 / 写盘 / 慢网动效三问；SSOT `BACKGROUND_NETWORK.md`；现网触点审计 + 三条修复任务只立项不修运行时 |
| 2026-08-20 | `git-worktree-hygiene`：本机按清单清收成 `npm run worktree:hygiene-remove`（dry-run / `--apply` 只拆 `propose_remove`）；仍须口令；不删远端分支；不拆主仓 / `…-wt-develop-qa` |
| 2026-08-20 | 新增 `session-handoff`：口令「生成交接」+ 阶段性任务后输出结构化交接摘要；SSOT `.cursor/rules/focus-tiger-session-handoff.mdc`；与「批量人工测试」同级；不改变 push/PR / 合 develop / 人工关单 |
| 2026-08-16 | 新增 `feature-conflict-review`：实现前对照 `SCENARIO_TESTS.md` 扫强度错位 / 人设语气 / 职责重叠；有冲突须等用户拍板（优先于默认执行）；SSOT `FEATURE_CONFLICT_REVIEW.md`；PR 三问 Q3；Cursor 规则 + `SCENARIO_TESTS` 文首索引 |
| 2026-08-15 | 扩展 `git-parallel-worktree`：Cloud 旁支落到本机须 `worktree add`，禁止主仓 Apply / checkout migrated branch（超时 + 抢 5173/主仓检出）。SSOT `WORKFLOW.md` 并行 worktree 第 8 款 |
| 2026-08-15 | 新增 `qa-develop-worktree`：固定 `…-wt-develop-qa` 关单/批量测树、Vite `:5173` 常驻；合入 develop 后 `npm run sync:qa-develop` 并汇报是否重启 + 一句变化；feature 开发树不变。SSOT `WORKFLOW.md` |
| 2026-08-14 | GitHub 默认分支改为 `develop`：`schedule` 读默认分支 YAML（现为 `develop`），不必再为 cron 把 workflow 同步到 `main`；见 `ENV_CONFIG.md` §3 |
| 2026-08-14 | 新增 `recommend-most-reasonable`：列 ≥2 个开放方案时须同时给出「我认为最合理的」；SSOT `.cursor/rules/focus-tiger-recommend-most-reasonable.mdc`；N14b |
| 2026-08-14 | 统一 Git/验收五档：任务完成后默认 push 旁支+开 PR（本机=Cloud）；合入 develop = CI 绿（`git-develop-small-pr-run-merge` 扩到运行时 PR）；人工测试与合入解耦；新增 `qa-batch-human-test`、`prod-worker-deploy`；§7「已修复」仍须人工测 |
| 2026-08-14 | 新增 `interaction-feedback`：点击接收反馈 ≠ 结果反馈；已知静默白名单 `SILENT_BEHAVIORS.md`；SSOT `INTERACTION_FEEDBACK_PRINCIPLES.md`；PR 模板 + Cursor 规则两问 |
| 2026-08-11 | 扩展 `git-worktree-hygiene`：`propose_remove` 接受 `git cherry origin/develop HEAD` 无独有补丁（squash 友好），不再仅靠 tip 祖先检查 |
| 2026-08-11 | 新增 `git-worktree-hygiene`：口令「请清理闲置 worktree」+ 只读 `check:worktree-hygiene`（含最后 commit 时间）；N14 会话结束须报锁态；与 occupancy Prompt 3 对齐「客观依据 + 不可逆须人工确认」 |
| 2026-08-11 | 强化 `git-worktree-occupancy`：`last_heartbeat` + 默认 60m 陈旧阈值（`FT_SESSION_LOCK_STALE_MS`）；陈旧/releasable 可接管须 history 留痕；husky pre-commit `gate-session-lock-precommit`；**禁止主仓 develop 检出写/commit** |
| 2026-08-27 | 新增 `source-read-granularity`：大源码文件（≥400 行）先 Grep 定位再片段 Read；SSOT 在 `focus-tiger-source-read-granularity.mdc`；`agent-token-cost` §7 交叉引用 |
| 2026-08-11 | 新增 docs 数值复述一致性门禁：`check-docs-consistency.js` 并入 `docs:check` / `test:smoke`；首条 claim=`browser-energy-duration`（下游复述 SSOT 连续开放时长数字须红；回归见 `check-docs-consistency.test.js`）；PR 模板补 `.cursor/rules/*.mdc` 强制项 |
| 2026-08-11 | 定稿 `browser-energy` 临时解禁路径：连续开放时长上限 + 续开不清零 + 精确时间戳汇报；下游文档（含 PROCESS）**禁止复述具体分钟数**，只指针引用 SSOT（`focus-tiger-browser-energy.mdc`） |
| 2026-08-08 | 审计笔记：2026-08-01 六笔（含 `92effa4` Frozen）曾临时卸保护直推 `develop`；记入 `DEVELOP_DEBT_INVENTORY` §0.1；支撑同日 `git-agent-commit` 禁直推口径（#190） |
| 2026-08-08 | 修正 `git-agent-commit` 下班前口令：禁止直推 `develop`/`main`；同步=旁支 push + 开/更新 base=develop PR；废止「可推 develop/feature/fix」并列写法（regression-lock 第 5–7 条） |
| 2026-08-08 | `qa-develop-tip`：允许引用 `TEST_TRACKER`「主干一次性关单验收」+ KnownRisky §0；禁止 Support-only / 过时 worktree 冒充 tip |
| 2026-08-08 | 扩展 `browser-energy`：用户可见的 `cd` + `npm run dev`（及等价预览命令）须写可直接复制的绝对路径，禁止省略号/占位路径（用户拍板强制） |
| 2026-08-07 | 新增 `git-pr-base-develop`：开 PR 须显式 `--base develop`；发版备忘 main 已提前含 #164（见 `WORKFLOW.md`） |
| 2026-08-06 | 新增 `e2e-local-budget`：本地 e2e 硬顶 1 spec/次；`run-e2e-changed` + `e2e-ci-guard` + `gate-local-heavy-e2e`（deny）；修正 WORKFLOW/PROCESS「临时本机全量」为已废止/CI 收口 |
| 2026-08-06 | 新增 `risk-mitigation-playbook`：中高风险功能落地降险 Playbook（四件套 + 架构红线 + 落地清单）；SSOT 在 `RISK_MITIGATION_PLAYBOOK.md`；`WORKFLOW` 仅入口引用 |
| 2026-08-04 | 新增 `git-develop-small-pr-run-merge`：develop 文档/小 PR 在 CI 绿后默认弹 Cursor Run 合并；SSOT 在 `WORKFLOW.md`；与合 `main` / 运行时大 PR / 下班前口令区分 |
| 2026-08-03 | 新增 `git-feature-merge-preview`：合入 develop 前须 worktree 预览确认；develop-integrity ≠ session-lock `releasable`；可执行 rebase 交集判定（`comm -12`）；两层验收与 `qa-develop-tip` 并列；SSOT 在 `WORKFLOW.md`；PR 模板 checkbox |
| 2026-08-02 | 新增 `qa-pass-coverage-split`：标「已通过」须写清 e2e/自动化已锁 vs 人工已覆盖场景（防记入≠验证到位）；SSOT 在 `TEST_TRACKER`；regression-lock 摘要硬拦 |
| 2026-08-02 | 扩展 `git-worktree-occupancy`：`.ft-session-lock` 必填 `occupancy`（`active` / `releasable`），不以 mtime 猜占用；检测脚本解析并区分 exit；SSOT 在 `WORKFLOW.md` |
| 2026-08-02 | 新增 `release-blocker-ledger`：缺陷分级 + `check:open-blockers`；发版硬闸在 regression-lock「发布候选门禁」；SSOT 记录格式在 `TEST_TRACKER` |
| 2026-08-01 | 新增 `git-branch-health`：分支健康度即时纪律 + `check:all-branches-health` 双周普查（非 CI Required）；SSOT 在 `PROCESS.md` |
| 2026-07-31 | 收紧 `browser-energy`：**取消窄屏/口头开 IDE Browser 特例**；改为默认硬禁——`deny-ide-browser-mcp` 一律 deny `cursor-ide-browser`（`beforeMCPExecution` + `preToolUse`）；窄屏验收改 Safari 响应式 / Playwright（不再以「窄屏特例」开内置 Browser） |
| 2026-07-31 | 扩展 `agent-token-cost`：CI 红 / 多文件冲突本地验证预算（先摘要、问新 worktree、本地最多 1 轮、最终 push+CI）；`WORKFLOW` 并行 worktree 补 3a 短引用 |
| 2026-07-30 | 新增 `git-worktree-occupancy`：`.ft-session-lock` + 开工三条硬规则 + `check:worktree-occupancy`；SSOT 在 `WORKFLOW.md` |
| 2026-07-29 | 新增 `qa-develop-tip`（关单验收只认 `origin/develop` tip）、`branch-freshness`（邀测前 `check:branch-freshness`）、`z-index-registry`（`Z_INDEX.md`） |
| 2026-07-29 | 收窄「请安排下班前的 Git 同步」：默认可推仅非运行时（文档/规则/脚本注释）；业务代码·状态机·待确认 diff 单独列出不 flush；汇总须标有无业务逻辑改动（regression-lock 第 7 条） |
| 2026-07-29 | 新增 `agent-token-cost`：禁子 Agent / 禁轮询长 CI / 禁擅自全量 e2e（SSOT：`focus-tiger-agent-token-cost.mdc` + hooks） |
| 2026-07-26 | 扩展 `browser-energy`：Vite/Playwright 进程收尾提醒 + Cloud「独立会话」提醒（用户拍板养成习惯） |
| 2026-07-25 | **[已废止，见 SSOT 当前条文]** 新增 `browser-energy`：默认 Safari 预览；Cursor 内置 Browser 仅窄屏特例且最长 10 分钟（该「窄屏特例 + 数值复述」口径已由 2026-07-31 硬禁取代；时长细则以 `focus-tiger-browser-energy.mdc` 当前正文为准，勿以本条为现依据） |
| 2026-07-23 | 固定口令「请安排下班前的 Git 同步」语义：只 push `develop`/`feature`/`fix` + 分级汇总；不合并 main、不推进 PR（见 regression-lock 第 7 条） |
| 2026-07-23 | 新增 `git-parallel-worktree`：并行 Cursor 写会话须 `git worktree` 隔离；SSOT 在 `WORKFLOW.md` |
| 2026-07-23 | 补强 `git-agent-commit`：Git 同步 / 批量 push 须「分级汇总」（commit 列表 + 高风险单独标注）；与 Cursor user rule 对齐方向 |
| 2026-07-23 | 初版：盘点规则文档、指定主题 SSOT、接入 `rules:doc-check`，收敛 commit/跨会话等平行复述 |
