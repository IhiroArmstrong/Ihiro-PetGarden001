# Agent 入口（仓库根）

产品代码在 `focus-tiger/`。工作流 SSOT：`WORKFLOW.md`。规则索引：`focus-tiger/docs/RULES_INDEX.md`。

## 任务状态的唯一真相（必读）

- 任务（Tn）是否已完成，**只看 git / GitHub 已合并 PR**，不看 [`GLOSSARY.md`](focus-tiger/docs/GLOSSARY.md) / [`SCHEDULING_GLOSSARY.md`](focus-tiger/docs/SCHEDULING_GLOSSARY.md) / TASKS / 队列文档 / 口令表。
- 收到任何「按 Tn 开工 / 第 N 刀 / 继续做 Tn」口令，先执行 `scripts/task-preflight.sh Tn`，
  已合并则**停止实现**，并在同一轮内顺手提交文档修正 PR。
- 详细规则见 `.cursor/rules/task-preflight.mdc`（条文 SSOT：`WORKFLOW.md` → `git-task-preflight`）。
- 实现类 PR 必须在同一个 PR 里更新文档状态（CI：`task-doc-sync` 强制检查）。
