---
name: focus-tiger-ci-smoke-triage
description: >-
  Triages Focus Tiger PR CI and smoke failures before patching or rerunning.
  Use when the user says CI 红了, smoke 挂了, test:pr-smoke, Checks 不过, GitHub
  Actions 失败, or pastes a PR URL about a red check. Fetch logs with gh first;
  classify against PR_SMOKE_FAILURE_CLASSES; do not grep the product tree
  without a failure signal.
---

# Focus Tiger · CI / 冒烟红灯归类

用户**不必** `@` 文件。说「这个 PR CI 红了」并给 PR 号即可。

## 顺序（改代码 / 重跑之前）

1. 用 `gh` 取失败 check 名、失败用例、一行报错（用户没贴日志时更要先做这一步）。
2. 对照种类表归类，再决定：标已知基建 / 修本 PR / 最多重跑 1 次。
3. **禁止**无信号全仓 Grep。

条文 SSOT（只 Read，不在本文件复述）：

- [`focus-tiger/docs/PR_SMOKE_FAILURE_CLASSES.md`](../../../focus-tiger/docs/PR_SMOKE_FAILURE_CLASSES.md)
- [`.cursor/rules/focus-tiger-ci-failure-triage.mdc`](../../../.cursor/rules/focus-tiger-ci-failure-triage.mdc)
- [`.cursor/rules/focus-tiger-pr-smoke-gates.mdc`](../../../.cursor/rules/focus-tiger-pr-smoke-gates.mdc)

## 种类速记

| 种类 | 含义 | Agent |
|---|---|---|
| **1** | 菜单走完超时（已移出 Required 冒烟） | 标已知基建，不当本 PR 产品回归连补 |
| **2** | 语言包索引竞态 | 标 T11 / #1322，不当文档回归 |
| **3** | 菜单选择器命中两个节点 | 本 PR 测试债，同批修选择器 |
| **4** | 本 PR 语法 / 夹具 | 修这个 PR |
| 噪声 `Error: boom` | 模拟 PWA 失败 | 忽略 |

同一报错：自动重跑最多 **1** 次；同类代码补丁仍红 → **停下**请人决定。

## 请用户操作时

写「请你操作（大白话）」：点哪个 Checks、看哪一条 run、贴回 passed/failed。细则：`.cursor/rules/focus-tiger-user-action-steps.mdc`。
