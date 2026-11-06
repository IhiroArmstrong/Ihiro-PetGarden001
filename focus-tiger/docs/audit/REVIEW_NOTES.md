# 入库异议与采纳记录（2026-11-06）

## 结论

PO 已**全部采纳** Cursor 与分析师对齐后的修订；定稿为 **[AUDIT_BASELINE.md](AUDIT_BASELINE.md) v1.1** 与 **`briefs/B1–B3`、`B4a`、`B4b`、`B5`、`B6`**。执行审计时**以 v1.1 为准**。模型与角色选择**不写进**基准。

## 异议条目 → v1.1 落点（速查）

| 条目 | 落点 |
|---|---|
| 过线看结果、C4/ADR/DORA 可选 | `AUDIT_BASELINE.md` §3.1 |
| B3 六类替代、具名仅作例子 | `briefs/B3-product-scenarios.md`，§4 |
| B4 拆分为 B4a + B4b；性能归第 0 轮 + B4a 解读 | `briefs/B4a-uiux-western.md`、`briefs/B4b-a11y-i18n.md`，`AUDIT_BASELINE.md` §3.4 维度 ⑧ |
| V1/V3/V4 收窄、V2 保持；改名迁移「像丢数据」→ P1 候选 | `AUDIT_BASELINE.md` §4；`briefs/B5-security-privacy-compliance.md` §4 |
| P0/P1 关联任务账、审计只读不开票 | `AUDIT_BASELINE.md` §1.6、§7 |
| 评分卡不写「可发布」类裁决 | `AUDIT_BASELINE.md` §1、§11 |
| 维度 11 「未建立」不参与过线；总分归一化 | `AUDIT_BASELINE.md` §3.3、§3.4 |
| 第 0 轮否决导向 + 密钥扫描 + 同意↔请求 + 危机测试摘录 | `AUDIT_BASELINE.md` §9；`facts/README.md` |
| **未检**独立于 0–4、覆盖率 | `AUDIT_BASELINE.md` §3.2 |
| 真人试用不挡 B5/B6 | `AUDIT_BASELINE.md` §9 |
| B5/B6 先核对 wellness / 非儿童可见声明 | `briefs/B5-security-privacy-compliance.md`、`briefs/B6-ai-quality-safety.md` §4 前置 |
| 删除 Brief 末尾「Cursor 建议」模型行 | 全部 Brief 已去除 |

## 原文草稿（归档）

以下为 2026-11-06 入库讨论时的异议正文，**已被上表吸收**；保留字迹便于追溯。

<details>
<summary>展开：Cursor 入库异议原文</summary>

分析师的总方向可以留下来：拆开审、凭证据、事实和推断分开、已有专项只查是否还有效、带否决项的隐私和陪伴安全先做、合规不要写成法律意见、危机用例不写方法、欧美体验结论要等人试用、这一次是基线而不是发布审批。

1. **过线用了这套仓库没采用的仪式** — 过线应改成：决策能不能在现有文档里追到、约束有没有自动化在守。C4 / ADR / DORA 可以当可选表达，不能当及格线。

2. **竞品名单和产品自己的替代清单不一致** — 对标框架应为 MVP 六类替代；具名应用可以当某一类里的例子。

3. **B4 一次塞进太多** — 体验与无障碍拆分；性能应先有数字再判。

4. **四条否决写得太粗** — V1 限于离机+无同意；V3 限于用户安装面可利用且无缓解；V4 与改名迁移区分；V2 保留。

5. **整改不该自动变成新的 Epic** — 任务账与治理登记；审计只读。

6. **评分卡自相矛盾** — 基线不写发布裁决。

7. **维度 11 空表逼不及格** — 未建立不参与过线。

8. **第 0 轮不要大而全** — 否决导向；网页分数仅宣传站。

9. **「没看到」≠「不稳」** — 引入未检。

10. **真人试用不挡 B5/B6**。

11. **先核对 wellness / 非儿童用户可见声明**。

</details>
