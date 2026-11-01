# 开发任务线 · GitHub Issue 对照表

> 由 2026-09-07 批量建库生成。草案 SSOT：[`task-lines-epic-draft.md`](./task-lines-epic-draft.md)。  
> **Epic 之间不设 `blocked by`。** 仅有的真先后：#638 blocked by 审计 #648；切片 #650 blocked by #649。  
> **#640（2026-09-10）**：意义层 SSOT `YIN_EVOLUTION.md`（莲花池降为 Visible Growth 切片，不另开 Epic）。P0 表面耦合 #643。

仓库：https://github.com/IhiroArmstrong/Ihiro-PetGarden001

## Epic（26，跳过已作废表行 #16）

| 表行 | slug | Issue | 标题 |
|---|---|---|---|
| 1 | `core-practice` | [#627](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/627) | Sit & Breath & Honesty 基础练习 |
| 2 | `rituals-custom-share` | [#628](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/628) | Rituals + 自定义 Ritual + 分享至 Circle |
| 3 | `social-circle` | [#629](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/629) | Social & Circle |
| 4 | `monetization-tiers` | [#630](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/630) | Support Yin & Stripe 支付完善/付费层级管理 |
| 5 | `mac-dmg-release` | [#631](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/631) | 苹果 DMG 发布准备 |
| 6 | `focus-coin-collections` | [#632](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/632) | Focus Coin & Collections |
| 7 | `five-moments-expansion` | [#633](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/633) | Five Moments 场景功能扩充 |
| 8 | `personalization-engine` | [#634](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/634) | Yin's Personalization Engine 算法层 |
| 9 | `local-ai-operating` | [#635](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/635) | Local AI Operating 层 |
| 10 | `reset-return` | [#636](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/636) | Ground Exercise & Reset and Return |
| 11 | `wisdom-pools` | [#637](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/637) | 金句库/三池 + 逐步接线 |
| 12 | `onboarding-goal-questions` | [#638](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/638) | Onboarding 提问 |
| 13 | `confide-ai-ritual` | [#639](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/639) | Confide 与 AI 仪式应用 |
| 14 | `yin-evolution` | [#640](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/640) | Yin Evolution |
| 15 | `i18n` | [#641](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/641) | 多语言 |
| 16 | — | 不建 | 已并入 #8 / #634 |
| 17 | `local-data-import-export` | [#642](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/642) | 本地数据导入导出 |
| 18 | `journey-log` | [#643](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/643) | Journey Log |
| 19 | `marketing-site` | [#644](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/644) | 市场官网 |
| 20 | `art-polish` | [#645](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/645) | 美术优化 |
| 21 | `anti-plagiarism-layer` | [#646](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/646) | 防剽窃层 |
| 22 | `phase1-a-b-c-testing` | [#647](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/647) | Local AI Phase 1A/1B/1C 验收 |
| 23 | `seasonal-theme-engine` | [#742](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/742) | 节日主题引擎（Seasonal Theme · B 轨全年氛围） |
| 24 | `soundscape` | [#792](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/792) | 音景（Soundscape · 曲库/上传/试听/音符） |
| 25 | `habitat-shell` | [#793](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/793) | 栖居壳层（Habitat Shell · 菜单/叠层/Esc/chrome） |
| 26 | `collection-value-behavioral-scarcity` | [#888](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/888) | Collection Value & Behavioral Scarcity · 数字资产原则 / 行为稀缺展示 |
| 27 | `product-knowledge-base` | [#933](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/933) | 产品知识库（条目生产 + Confide 检索/闸门） |

## Agent 扇出 · 补挂 Epic（2026-09-30 PO + 2026-10～11 Agents）

> **不是新 Epic**：下列是 Agent 会话里长出来的**任务扇出**（Brief / 实现 / 治理代号 T*）。PR 仍须 `Relates to` / `Closes` 指向**已有 Epic 或切片**；**禁止**为每一扇出再开 `type:epic`（2026-09-30 盘点 + PO 书面：不限时专注 → #627；语音/朗读 → #631；不新建 Epic 凑数）。

| 扇出（人话） | 主 Epic | 耦合 Epic / 切片 | 代表 Brief / 文档 | PR 引用习惯 |
|---|---|---|---|---|
| 人机共修（T56–T68 · 口径 / 接合账 / 纪念画） | [#627](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/627) | [#632](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/632) 画不出货架 · [#640](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/640) 可见生长 · [#643](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/643) 旅程面 | `CO_PRACTICE_POSITIONING.md` · `task-co-practice-*` | `Relates to #627`（运行时）+ 画 `Relates to #632` |
| 坐的配方（ritual-recipe A1–A4…） | [#627](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/627) | [#628](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/628) 仪式流 · [#792](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/792) 氛围曲 | `RITUAL_RECIPE_A1_SPEC.md` · `task-ritual-recipe-*` | `Relates to #627` |
| 陪伴契约（T55 · 字面检查） | 跨线 SSOT | [#627](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/627) 开口通道 · [#639](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/639) 不替代安全 | `COMPANION_CONTRACT.md` · `task-companion-contract.md` | 文档/脚本 PR `Relates to #627` |
| Yin 适应 / 小本子（T58） | [#634](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/634) | [#627](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/627) 时长 chip | `task-yin-adaptation-v1.md` | `Relates to #634` |
| 心念流 / Mindflow nebula（T66） | [#793](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/793) | [#639](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/639) 不读心 · 偏好 chrome | `task-mindflow-nebula-v0.md` · step2 Brief | `Relates to #793` |
| Help Center / 问卡 / 办理（T22–T34） | [#933](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/933) | [#639](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/639) 跳转 · [#793](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/793) 壳层 dock | `task-help-center-*` · `task-confide-help-center-*` | 检索 `Relates to #933`；Confide 跳转 `Relates to #639` |
| 产品知识库闸门 / 诚实空态（#934 等） | [#933](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/933) | [#639](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/639) | `task-confide-kb-routing-gate.md` · `product-knowledge-base.md` | 切片 `Closes #934` 类（非 Epic） |
| 语音 / 系统 TTS / 指令入口（T9 等） | [#631](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/631) | [#635](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/635) Operating · [#639](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/639) 不混倾诉 | `task-system-tts-v1.md` · `task-yin-voice-command-entry.md` | `Relates to #631` |
| 不限时专注 / Open-ended Sit | [#627](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/627) | — | develop 合入 PR 补挂（2026-09-30） | `Relates to #627` |
| 电脑版十二条（T38–T49 · chrome） | [#793](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/793) | [#631](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/631) 壳 · [#639](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/639) 倾诉 chrome | `GLOSSARY.md` 对照表 | 按实际改动的线 `Relates to` |
| 受限生成放行关卡（待治理代号） | [#627](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/627) | T55 契约检查器 · **不**扩 Confide 开放生成 | `task-constrained-generation-release-gates.md` | 文档 PR `Relates to #627` |
| 记住—响应读层（盘点 / Brief 旁支） | [#634](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/634) | [#627](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/627) 时长 · `ritual-recipe` 键 | `pref-state-read-inventory.md` · `task-yin-adaptation-v1.md` | 待治理 T 号登记后补 PR 引用 |
| T54 90 天实验 / 研究分享 | **非产品 Epic** | Privacy 开关已合 · 实验仍搁置 | `task-t54-*` · `GLOSSARY.md` | 流程/治理 PR 用 `type:process` 或文档；**不**新建 Epic |

## 审计与切片（真先后）

| 类型 | Issue | 标题 | 依赖 |
|---|---|---|---|
| 审计 | [#648](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/648) | 冷启动第一幕审计 | 挡住 #638 |
| 切片 | [#649](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/649) | Circle 可分享基建 | 父 #629；挡住 #650 |
| 切片 | [#650](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/650) | Ritual 分享到 Circle | 父 #628；blocked by #649 |
| 切片 | [#743](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/743) | Phase 4 · 感恩节氛围放出（US/CA） | 父 #742；波次 1 |
| 切片 | [#744](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/744) | Phase 4 · 万圣节氛围放出 | 父 #742；波次 1 |
| 切片 | [#745](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/745) | Phase 4 · 元旦与跨年氛围放出 | 父 #742；波次 1 |

## 防剽窃层 · 远程参数化 §6 切片（2026-09-18 回填）

> 父 Epic **#646**（防剽窃层）。Runtime/文档已合项 **CLOSED** 作看板索引；人工验收仍见 `TEST_TRACKER` 碎片。

| 类型 | Issue | 标题 | PR / 备注 | 父 Epic |
|---|---|---|---|---|
| 切片（文档 · CLOSED） | [#844](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/844) | 远程参数化候选全项目审计 | [#717](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/717) · `REMOTE_PARAM_CANDIDATES.md` | #646 |
| 切片（runtime · CLOSED） | [#845](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/845) | 品味权重 + Honesty 30 → `TASTE_LAYER_KV` | [#722](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/722) · binding [#724](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/724) · 生产分叉 [#788](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/788) | #646 |
| 切片（runtime · CLOSED） | [#846](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/846) | 莲花阶梯系数 → `GROWTH_METRICS_KV` | [#725](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/725) · 生产分叉 [#788](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/788) | #646 |
| 切片（文档 · CLOSED） | [#851](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/851) | 寅币日封顶经济评估 · Step D = A | [#784](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/784) · Brief `task-yin-coin-daily-cap-economy.md` | #646 |
| 切片（文档 · CLOSED） | [#852](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/852) | 远程参数化 §6 本批收口文档 | [#787](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/787) | #646 |
| 切片（infra 文档 · CLOSED） | [#853](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/853) | §6 KV 生产分叉部署记录 | [#788](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/788) · Worker `f0ddf1b4` | #646 |

## Local AI Phase 1 切片（2026-09-17 回填）

> 父 Epic **#639**（Confide 与 AI 仪式应用）· 验收轨 **#647**（Phase 1A/1B/1C 验收）。Runtime 已合项在 #639 下 **CLOSED** 作索引；开放 QA 在 #647。

| 类型 | Issue | 标题 | PR / 备注 | 父 Epic |
|---|---|---|---|---|
| 切片（runtime · CLOSED） | [#807](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/807) | Gate 0.2 · Read Hybrid L0 | [#472](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/472) · 关单 2026-09-01 | #639 |
| 切片（runtime · CLOSED） | [#808](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/808) | Phase 1A · Show memory CI-03 | [#506](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/506) | #639 |
| 切片（runtime · CLOSED） | [#809](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/809) | Phase 1B · Ask Journey/Presence | [#503](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/503) | #639 |
| 切片（runtime · CLOSED） | [#810](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/810) | Phase 1C · Reflection Companion lab | [#486](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/486) · [#507](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/507) | #639 |
| 切片（shipping · OPEN） | [#811](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/811) | Reflection Companion shipping | Brief `task-local-ai-reflection-companion-shipping.md` | #639 |
| 切片（验收 · OPEN） | [#812](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/812) | 验收 · Gate 0.2 Read Hybrid A/B/C | 关单 2026-09-01 | #647 |
| 切片（验收 · OPEN） | [#813](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/813) | 验收 · Phase 1A Show memory | 待人工 | #647 |
| 切片（验收 · OPEN） | [#814](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/814) | 验收 · Phase 1B Journey/Presence | 待人工 | #647 |
| 切片（验收 · OPEN） | [#815](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/815) | 验收 · Phase 1C Reflection lab 场景 AL | 待人工 | #647 |
| 切片（验收 · OPEN） | [#816](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/816) | 验收 · Reflection Companion shipping | 阻塞 PO Brief | #647 |

## 建库执行记录（2026-09-07）

| 步骤 | 结果 |
|---|---|
| `gh --version` | 2.96.0（≥ 2.94.0） |
| 24 个 label | 成功（`--force`） |
| 21 个 Epic | 全部 CREATE，无 SKIP、无失败 |
| 审计 + 两切片 + blocked-by / parent | CREATE #648–#650；#638 `--add-blocked-by` 648 |

## 建库执行记录（2026-09-13 · #23 节日主题）

| 步骤 | 结果 |
|---|---|
| label `line:seasonal-theme-engine` | CREATE（`--force`） |
| Epic #23 | CREATE [#742](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/742) |
| Phase 4 波次 1 切片 | CREATE [#743](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/743)–[#745](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/745)；parent #742 |

## 建库执行记录（2026-09-16 · #24 音景 + #25 栖居壳层）

| 步骤 | 结果 |
|---|---|
| label `line:soundscape` · `line:habitat-shell` · `type:process` | CREATE（`--force`） |
| Epic #24 / #25 | CREATE [#792](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/792) · [#793](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/793) |
| #773 改挂 `line:habitat-shell` | 移除 `line:core-practice` |
| Project 挂板 | #792 #793 加入 Focus Tiger 开发任务线看板 #1 |
| guard | `task-line-ref-check.yml` 认 `type:process` PR 豁免 + `Closes` 目标校验 |

## 建库执行记录（2026-09-17 · Local AI Phase 1 Epic 回填）

| 步骤 | 结果 |
|---|---|
| #639 子切片 | CREATE #807–#811（#807–#810 runtime 已 CLOSED；#811 shipping OPEN） |
| #647 验收切片 | CREATE #812–#816（#812 Gate 0.2 关单注记；#813–#815 待人工；#816 阻塞 shipping Brief） |
| Brief 骨架 | `task-briefs/task-local-ai-reflection-companion-shipping.md` |
| Epic 正文 | #639 · #647 更新「已知子任务/PR」 |

## 建库执行记录（2026-09-18 · #646 远程参数化 §6 切片回填）

| 步骤 | 结果 |
|---|---|
| #646 子切片（批 1） | CREATE #844–#846（文档 #717 · runtime #722 · runtime #725；均已 CLOSED） |
| Project 挂板 | #844–#846 加入 Focus Tiger 开发任务线看板 #1 |
| Epic 正文 | #646 更新「已知子任务/PR」 |
| PR 对照表 | [#848](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/848) 合 develop |

## 建库执行记录（2026-09-18 · #646 §6 切片补全）

| 步骤 | 结果 |
|---|---|
| #646 子切片（批 2） | CREATE #851–#853（文档 #784 · 文档 #787 · infra 文档 #788；均已 CLOSED） |
| Project 挂板 | #851–#853 加入 Focus Tiger 开发任务线看板 #1 |
| Epic 正文 | #646 更新「已知子任务/PR」 |

## 建库执行记录（2026-09-20 · #26 Collection Value & Behavioral Scarcity）

| 步骤 | 结果 |
|---|---|
| label `line:collection-value-behavioral-scarcity` | CREATE（`--force`） |
| Epic #26 | CREATE [#888](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/888) |
| Project 挂板 | #888 加入 Focus Tiger 开发任务线看板 #1 |
| 已合文档归属 | PR [#886](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/886) 原则 · PR [#887](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/887) 行为稀缺方案 |

## 建库执行记录（2026-09-22 · #27 产品知识库）

| 步骤 | 结果 |
|---|---|
| label `line:product-knowledge-base` | CREATE（`--force`） |
| Epic #27 | CREATE [#933](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/933) |
| Project 挂板 | #933 加入 Focus Tiger 开发任务线看板 #1 |
| 已合文档归属 | #918–#931 批次 · 检索 #924 · 闸门 Brief #925 |

## 对照表同步（2026-11-01 · Agent 扇出补挂）

| 步骤 | 结果 |
|---|---|
| 地面真相 | `gh issue list --label type:epic` → **26** 条（#627–#647、#742、#792、#793、#888、#933） |
| Project 挂板 | **26/26** Epic 已在 **Focus Tiger 开发任务线看板**（Project #1）；无漏挂 |
| 仓内对照表 | 补 **#933** 表行 + 上表「Agent 扇出 · 补挂 Epic」 |
| Epic 正文 | 未批量改 GitHub 正文；子任务仍以各 Epic「已知子任务/PR」+ 上表为准 |
