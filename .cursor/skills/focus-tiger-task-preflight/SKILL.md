---
name: focus-tiger-task-preflight
description: >-
  Runs Focus Tiger task preflight before implementing any Tn slice. Use when the
  user says 开工, 继续, 下一刀, 立刻开工, 按 Brief, 第 N 刀, or names a task like T98 / T54
  and wants implementation. Checks git/GitHub PRs first; does not trust TASKS or
  GLOSSARY as done/not-done. Stops if an OPEN or MERGED PR already covers the
  same slice.
---

# Focus Tiger · 任务开工预检

用户**不必** `@` 文件。本 Skill 在口令像「开工 T98」「继续 Tn」时由 Agent 自行加载。

## 硬闸（写 `src/` 或开旁支之前）

1. 跑：`bash scripts/task-preflight.sh <Tn>`
2. `gh pr list --state all`：同切片 **OPEN 或 MERGED 且有实质 commit** → 视为开发可能已完成，**禁止**当未开工重写。
3. 读命中 PR 的标题、描述、改动文件，判断**本次范围**是否已被覆盖（同一 Tn 常分多刀）。

条文 SSOT（只 Read，不在本文件复述）：

- [`.cursor/rules/task-preflight.mdc`](../../../.cursor/rules/task-preflight.mdc)
- [`.cursor/rules/focus-tiger-pr-next-step-gate.mdc`](../../../.cursor/rules/focus-tiger-pr-next-step-gate.mdc)
- [`WORKFLOW.md`](../../../WORKFLOW.md) → `git-task-preflight` / `git-pr-next-step-gate`

## 三种结论

| 结论 | 动作 |
|---|---|
| **A 已完成** | 不写产品代码；同一轮修过期文档并开 docs PR |
| **B 部分完成** | 第一行写「已完成部分 = #xxxx，本次只做 …」 |
| **C 无命中** | 才可开旁支实现；第一行写 develop 上无相关合并记录 |
| **OPEN PR 同内容** | 不得另开旁支；先报告接手或废弃 |

## 不要做

- 只读 Brief / PROCESS「下一步」就开工
- 因「还没合进 develop」当成没做过
- 把本 Skill 当产品功能说明（产品语义仍读 `focus-tiger/docs/`）
