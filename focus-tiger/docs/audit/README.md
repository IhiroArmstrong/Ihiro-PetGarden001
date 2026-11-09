# Samatia 基线审计资料（2026-11-06）

用户可见产品名是 **Samatia**。仓库和内部文档仍叫 Focus Tiger。本目录是这次「完整基线审计」的资料正本。

状态：**基准 v1.1 已定稿（#1581 已合 develop）；第 0 轮事实底稿见 [facts/2026-11-06/](facts/2026-11-06/INDEX.md)。** B5（#1589）、B6（#1587）报告已合 develop（`findings/2026-11-07/`）。B2 测试发布首稿（部分）已合 **#1616**（`findings/2026-11-08/B2-testing-release-pm-findings.md`）。B3 产品场景首稿（部分 · 未打分）OPEN **#1638**（`findings/2026-11-09/B3-product-scenarios-findings.md`）。第 2 轮复核 Brief（**v1.2**）：[briefs/R2-cross-review-b5-b6.md](briefs/R2-cross-review-b5-b6.md)（PR **#1592**）。先读 [AUDIT_BASELINE.md](AUDIT_BASELINE.md)。历史讨论见 [REVIEW_NOTES.md](REVIEW_NOTES.md)。背景索引见 [CONTEXT.md](CONTEXT.md)。

**当前执行队列（v1.1）**：第 0 轮 → B5、B6（**已完成**）→ **[R2 第 2 轮交叉复核](briefs/R2-cross-review-b5-b6.md)**（独立会话）→ **B2/B3 首稿（部分）已登记** → 待开 **B1、B4a、B4b**；B3 缺口 = 安装包上五核心场景实机。V2 为当前唯一否决阻断项；低成本整改可与 R2 并行（见 R2 Brief §8）。

## 先读什么

| 文件 | 作用 |
|---|---|
| [CONTEXT.md](CONTEXT.md) | 背景、已有计划、已有知识的索引 |
| [AUDIT_BASELINE.md](AUDIT_BASELINE.md) | 评分基准 v1.1（未检、归一化分、否决收窄、无发布裁决） |
| [REVIEW_NOTES.md](REVIEW_NOTES.md) | 入库异议原文（已采纳；基准以 AUDIT_BASELINE 为准） |
| [briefs/](briefs/) | Task Brief：B1–B3、**B4a**、**B4b**、B5、B6、**[R2](briefs/R2-cross-review-b5-b6.md)** |

## 目录

| 路径 | 说明 |
|---|---|
| `AUDIT_BASELINE.md` | 基准 |
| `briefs/B1` … `B3`、`B4a`、`B4b`、`B5`、`B6`、`R2` | 分轮任务说明（R2 = 第 2 轮 B5/B6 交叉复核，**v1.2**） |
| `facts/<日期>/` | 第 0 轮事实底稿 |
| `findings/<日期>/` | 各任务报告、评分卡、风险登记、90 天计划 |
| `governance-drafts/` | 待治理会话落账的草稿（非 SSOT） |

## 原稿来源

分析师初稿曾放在主仓根目录的 `项目审计1106/`（未纳入 git）。**以本目录为 SSOT**。
