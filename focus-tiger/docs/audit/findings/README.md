# 审计状态看板（SSOT）

用户可见产品名 **Samatia**；仓库标识仍为 Focus Tiger。

## 维护规则（强制）

每一份**入库 develop 的审计 PR**（新报告、小修、证据重扫）必须在同 PR 内更新本文件：

1. 表内对应行的 **PR #**、**状态**、**develop 截至 SHA**（`git rev-parse origin/develop` 或证据 JSON 的 `gitSha`）。
2. 若重跑取证，在「备注」写证据路径与是否改分/改定级。
3. 队列「待开」行随进度删减或移到上表。

报告正文仍在 `findings/<日期>/`；索引与队列**只认本页**（[`audit/README.md`](../README.md) 队列段落随本页同步，不得与之矛盾）。

---

## 截至 develop

| 字段 | 值 |
|---|---|
| **截至 SHA** | `5ee23bc`（Merge **#1643** → develop；扫描取证仍为 `d54f11a` 见 JSON `gitSha`） |
| **看板最后更新** | 2026-11-09 · #1643 合入后 |
| **基准文档** | [`AUDIT_BASELINE.md`](../AUDIT_BASELINE.md) v1.1 |
| **否决阻断（现状）** | V2 仍见 B6/R2；发布裁决不在此目录 |

---

## 维度与报告

| 维度 | 报告文件 | 检状态 / 得分 | PR | 状态 | 备注 |
|---:|---|---|---:|---|---|
| ①② | [`2026-11-09/B1-architecture-code-findings.md`](2026-11-09/B1-architecture-code-findings.md) | 部分已检 · ①② 各 **2** | #1640 首稿；小修 **#1643**（含 #1644 叠并） | **MERGED** | 取证 `gitSha`=`d54f11a`；1-01/1-02 **P2**；1-06/1-07 见 [`ARBITRATION_PRECEDENCE.md`](../../ARBITRATION_PRECEDENCE.md) |
| ③④ | [`2026-11-08/B2-testing-release-pm-findings.md`](2026-11-08/B2-testing-release-pm-findings.md) | 部分 | #1616 | **MERGED** | |
| ⑤ | [`2026-11-09/B3-product-scenarios-findings.md`](2026-11-09/B3-product-scenarios-findings.md) | 部分 · **未打分** | #1638 | **MERGED** | 缺口：安装包五核心场景实机 |
| ⑥ | `B4a-uiux-western-findings.md` | — | — | **未开始** | Brief 已有 |
| ⑦ | `B4b-a11y-i18n-findings.md` | — | — | **未开始** | Brief 已有 |
| ⑨⑩ | [`2026-11-07/R2-cross-review-b5-b6-findings.md`](2026-11-07/R2-cross-review-b5-b6-findings.md) 等 | R2 已检；R2-lite 补记见 `2026-11-08/` | #1592 Brief；复核多篇 | **MERGED** | ⑨ **2** · ⑩ **1**（R2 报告内） |
| 安全/AI | `2026-11-07/B5-*.md`、`B6-*.md` | B5/B6 各轮 | #1589 · #1587 | **MERGED** | 本轮 B1 不重判 V1–V4 |
| ⑪ | [`RISK_REGISTER.md`](../RISK_REGISTER.md) | **未建立** | — | 未开始 | 另会话；字段见 PO 批示 |

第 0 轮事实：[`facts/2026-11-06/`](../facts/2026-11-06/INDEX.md)（备份覆盖当时 **31 / 99**；现 develop **31 / 105** 见 B1 §2.4 **待核对**）。

---

## 队列（建议顺序 · 非 SSOT 排期）

与 PO 2026-11-09 一致；**发布关键路径**（Plan A Brief、公证、T97/T93/T95）在其它 Chat 优先于 B1 卫生项。

| 顺序 | 工作 | 类型 |
|---:|---|---|
| ✓ | B1 小修 + 看板 + cloud/仲裁文档 | **#1643** / #1644→旁支已叠入 |
| — | import 环 / core→ui / `main.js` 守门（对比 develop 基线） | ci · 另 PR |
| — | reset +6 钥匙 vs export 核对 | 只读 · 新会话 |
| — | `RISK_REGISTER.md` 首版 | docs · 新会话 |
| — | B4a / B4b | 审计轮次 |
| — | B1 工具取证（体积、重复、复杂度等） | facts 目录 |

只读审计：**不在此目录改产品代码**。
