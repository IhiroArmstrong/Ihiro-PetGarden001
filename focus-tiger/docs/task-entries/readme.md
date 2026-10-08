# 任务状态片

功能 PR、部署记录 PR **不要改** `TASKS.md` 里已有的段落。新状态写本目录的一个新文件。

这是为了不再让每笔 PR 都改同一份总表。测试记录已经用 `docs/tracker-entries/` 这样做。

## 写什么

| 情况 | 做法 |
|---|---|
| 新任务的进度（已合、进行中、下一刀） | 新建 `kind: feature` 的文件，`id` 用任务短名 |
| 已部署、已备份、已回滚 | **另开**一个 `kind: deploy` 的新文件，不要回去改功能那一片，也不要改 `TASKS.md` 里的旧行 |
| 一句旁注 | `kind: note` |

同一个 `id` 只能有一片 `feature`。部署可以有多片，因为那是事后才知道的事实。

## 文件名

小写 kebab-case，后缀 `.md`。`readme.md` 和 `_` 开头的文件不会被拼进去。

## 格式

```markdown
---
id: art-limited-set
kind: feature
status: 已合 #1099
updated: 2026-10-08
---

五件作为一套售卖。
```

`updated` 写 `YYYY-MM-DD`。`status` 一行。

## 不要做

- 不要在功能 PR 里改 `TASKS.md`。检查会失败。
- 不要在功能 PR 里跑 `npm run tasks:assemble`。拼装会改总表，又和别人撞上。
- 不要把「已部署」写进功能那一片。部署用新的 `kind: deploy` 文件。

## 拼装

总表底部的机器块可以稍后由**只改** `TASKS.md` 的文档 PR 更新：

```bash
cd focus-tiger && npm run tasks:check
cd focus-tiger && npm run tasks:assemble
```

没拼之前，以本目录的文件为准。检查不因为「还没拼」而失败。
