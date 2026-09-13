# 开发任务线 · GitHub Issue 对照表

> 由 2026-09-07 批量建库生成。草案 SSOT：[`task-lines-epic-draft.md`](./task-lines-epic-draft.md)。  
> **Epic 之间不设 `blocked by`。** 仅有的真先后：#638 blocked by 审计 #648；切片 #650 blocked by #649。  
> **#640（2026-09-10）**：意义层 SSOT `YIN_EVOLUTION.md`（莲花池降为 Visible Growth 切片，不另开 Epic）。P0 表面耦合 #643。

仓库：https://github.com/IhiroArmstrong/Ihiro-PetGarden001

## Epic（22，跳过已作废表行 #16）

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

## 审计与切片（真先后）

| 类型 | Issue | 标题 | 依赖 |
|---|---|---|---|
| 审计 | [#648](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/648) | 冷启动第一幕审计 | 挡住 #638 |
| 切片 | [#649](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/649) | Circle 可分享基建 | 父 #629；挡住 #650 |
| 切片 | [#650](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/650) | Ritual 分享到 Circle | 父 #628；blocked by #649 |
| 切片 | [#743](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/743) | Phase 4 · 感恩节氛围放出（US/CA） | 父 #742；波次 1 |
| 切片 | [#744](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/744) | Phase 4 · 万圣节氛围放出 | 父 #742；波次 1 |
| 切片 | [#745](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/745) | Phase 4 · 元旦与跨年氛围放出 | 父 #742；波次 1 |

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
