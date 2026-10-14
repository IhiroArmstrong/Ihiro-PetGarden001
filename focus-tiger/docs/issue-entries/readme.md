# 问题账本旁路（issue-entries）

功能 PR、文档 PR **不要改** [`ISSUE_LEDGER.md`](../ISSUE_LEDGER.md) 里已有行的长摘要。新的范围、PR、完成项写本目录一个新文件。

条文 SSOT：[`.cursor/rules/focus-tiger-issue-ledger.mdc`](../../../.cursor/rules/focus-tiger-issue-ledger.mdc)（`RULES_INDEX` → `issue-ledger`）。学 `task-entries/`，**不**学 TEST_TRACKER 拼装。

本轮**不做**拼装脚本。没拼之前以本目录文件为准。口令「核对问题清单」时总表 + 本目录一起读。

## 文件名

用当前功能/文档分支名，把 `/` 换成 `-`，全小写 kebab-case，后缀 `.md`。

| 分支 | 文件 |
|---|---|
| `docs/issue-entries-sidecar` | `docs-issue-entries-sidecar.md` |
| `fix/confide-mood-aside` | `fix-confide-mood-aside.md` |

本 `readme.md` 与 `_` 开头的文件不算旁路进度。

## 写什么

```markdown
---
ledger: 根因扇出 · Confide 把生活/情绪句判成产品问
kind: progress
status: 跟进中
updated: 2026-10-15
---

本支做了什么、还剩什么。不要回去改总表那一格。
```

- `ledger`：总表「问题描述」原句，或能对上的短名。
- `kind`：`progress`（本支进度）/ `note`（一句旁注）。
- `status`：`未跟进` / `跟进中` / `已解决`（本片口径；总表初值之后以旁路为准）。
- `updated`：`YYYY-MM-DD`。

同一账本行可以有多片（各 PR 各写各的）。不要几条 PR 去改同一份旁路文件，也不要改总表已有行。

## 不要做

- 不要在功能/文档 PR 里改 `ISSUE_LEDGER.md` 已有行（含「受影响项/范围」长格、改写问题描述、在总表追加完成项）。**新问题**才可以在总表**加一行**稳定摘要。
- 不要发明或运行拼装命令去改总表。
- 不要把账本进度写进 `docs/tracker-entries/`。
