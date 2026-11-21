# 伤害他人专用四句 · 书面风险接受

**日期**：2026-11-21  
**性质**：书面风险接受。本刀**不改**四句正文。  
**挂钩**：[恢复专用池 Brief](../../../task-briefs/task-restore-aggression-dedicated-pool.md) §4 · [只读核对](./noticing-aggression-pool-source.md) · [开门门禁 v2](../../first-package-open-gate-v2.md) §5

人话：这四句是专门接「想伤害别人」的旧稿，不是觉察一句通用库。通用禁词检查不得拿它们当失败理由去改字。独立安全审稿人只读这一遍，把残余风险记在本页。12 月 5 日开门补审仍按原计划，不提前改句。

---

## 1. 点头条件（仍有效）

| # | 条件 | 本刀 |
|---|---|---|
| ① | 觉察一句通用禁词 / 输出闸 G3 目录 **不扫** 专用四句 | `lintNoticingFixedLibrary` 跳过 `aggression-01`–`04`；单测锁「若拿去 lint 会红，但默认库不含它们」 |
| ② | 安全审稿人对四句 **只读一遍**，记入本页；实现刀 **不改字** | 正文仍是现网 draft |

已废：「先不合 #1828」。#1828 / #1830 已合。跟进只裁中档关心夹带。

---

## 2. 四句（只读 · 不改）

| id | 角色 | en |
|---|---|---|
| `aggression-02` | 首选 | Something's really gotten to you. |
| `aggression-01` | 备选 | That sounds like a lot of anger to carry. |
| `aggression-03` | 备选 | That's a heavy thing to be sitting with. |
| `aggression-04` | 仅在场 | Yin isn't going anywhere. |

中 / 日文以 [`confideCorpus.js`](../../../../src/core/confide/confideCorpus.js) 为准，本页不复述以免漂移。

已知会撞通用禁词（故必须豁免，而不是改稿）：`aggression-01` 英文 `sounds like`、中文「听起来」。点名怒气不是默认觉察调性，允许留在专用池。

---

## 3. 残余风险（接受）

| 风险 | 等级 | 为何接受 |
|---|---|---|
| `01` 读成贴标签 / 诊断怒气 | 中 | Brief 已写：不是默认调性，允许留池；不为本刀过 lint 改字 |
| 四句仍为 `review: draft` | 低 | 本刀禁止只因 draft 改抽 A/B；标 `ok` 另审 |
| 独立安全审「只读一遍」尚未由审稿人在本页签名 | 中 | PO 已锁范围；审稿人读完后在 §4 补一行日期。12/5 补审仍覆盖本池 |

不接受：把四句并进 A/B lint 后为了绿灯改字；把伤害他人改回通用接住句。

---

## 4. 审稿人签名位

独立安全审稿人：只对照 AE 3b / 第 7 项，读上表四句各语种现网正文 **一遍**。

- 姓名 / 日期：_待填_  
- 结论：接受现网 draft / 退回（退回须另 Brief，本刀仍不改字）

---

## 5. 不在本刀

夹具程序、0.78、分类器、G1–G4 判定改写、中档关心 live。
