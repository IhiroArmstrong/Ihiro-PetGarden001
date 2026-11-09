# Samatia 基线审计资料（2026-11-06）

用户可见产品名是 **Samatia**。仓库和内部文档仍叫 Focus Tiger。本目录是这次「完整基线审计」的资料正本。

状态：**基准 v1.1 已定稿（#1581 已合 develop）；第 0 轮事实底稿见 [facts/2026-11-06/](facts/2026-11-06/INDEX.md)。** B5（#1589）、B6（#1587）、R2（#1592 Brief + 报告）、B2（#1616）、B3（#1638）、B1（#1640）首稿均已合 develop。各轮 PR、截至 SHA、队列：**只认 [findings/README.md](findings/README.md) 看板**（审计 PR 须同批更新）。先读 [AUDIT_BASELINE.md](AUDIT_BASELINE.md)。历史讨论见 [REVIEW_NOTES.md](REVIEW_NOTES.md)。背景索引见 [CONTEXT.md](CONTEXT.md)。

**当前执行队列（v1.1）**：见看板「队列」表。待开：**B4a、B4b**；B3 缺口 = 安装包五核心场景实机；B1 跟进：小修 #1643、守门 #1647、reset+6 核对已落盘；余下工具取证（见看板）。V2 为当前唯一否决阻断项（见 [RISK_REGISTER.md](RISK_REGISTER.md) **V-02**，证据仍在 B6/R2）。

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
| [`findings/README.md`](findings/README.md) | **审计状态看板**（PR、SHA、队列 SSOT） |
| `findings/<日期>/` | 各任务报告、评分卡、90 天计划 |
| [`RISK_REGISTER.md`](RISK_REGISTER.md) | 组织级风险登记册（v1.1） |
| `governance-drafts/` | 待治理会话落账的草稿（非 SSOT） |

## 原稿来源

分析师初稿曾放在主仓根目录的 `项目审计1106/`（未纳入 git）。**以本目录为 SSOT**。
