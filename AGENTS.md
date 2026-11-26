# Agent 入口（仓库根）

产品代码在 `focus-tiger/`。工作流 SSOT：`WORKFLOW.md`。规则索引：`focus-tiger/docs/RULES_INDEX.md`。

## 你怎么跟 Agent 说话（不用记 `@`）

**默认：说人话即可。** 不必粘贴 Plan/Build 模板，也不必自己选要 `@` 哪个文件——Agent 按口令去读规则、文档和脚本。

| 你可以说 | Agent 应去办 |
|---|---|
| 「继续 T98」「开工 Tn」「下一刀」 | 先跑开工预检（有没有 PR、合没合），再决定做不做 |
| 「这个 PR CI 红了」+ PR 号 | 先取失败日志并归类，再决定修或重跑 |
| 「先别改代码，只说方案」 | 只规划、不写产品代码（对应 Cursor 的 Plan） |
| 「按这个做 / 开旁支实现」 | 预检通过后再改代码（对应 Cursor 的 Build / Agent） |

可选加速（**不知道文件名就跳过**）：输入框打 `@`，再打文件名里几个字（例如 `preflight`、Brief 标题），点选即可。项目 Skill 在 [`.cursor/skills/`](.cursor/skills/)；目前两份：开工预检、CI 冒烟归类。**仍不必手动 `@` Skill**——描述里已写触发词，Agent 应自行加载。

## 任务状态的唯一真相（必读）

- 任务（Tn）是否已完成，**只看 git / GitHub 已合并 PR**，不看 [`GLOSSARY.md`](focus-tiger/docs/GLOSSARY.md) / [`SCHEDULING_GLOSSARY.md`](focus-tiger/docs/SCHEDULING_GLOSSARY.md) / TASKS / 队列文档 / 口令表。
- 收到任何「按 Tn 开工 / 第 N 刀 / 继续做 Tn」口令，先执行 `scripts/task-preflight.sh Tn`，
  已合并则**停止实现**，并在同一轮内顺手提交文档修正 PR。
- 详细规则见 `.cursor/rules/task-preflight.mdc`（条文 SSOT：`WORKFLOW.md` → `git-task-preflight`）。
- 实现类 PR 必须在同一个 PR 里更新文档状态（CI：`task-doc-sync` 强制检查）。
- 对照表（只写已合并 / 进行中 PR，不写「已完成」）：[`docs/STATUS.md`](docs/STATUS.md)，由 `scripts/gen-task-status.py` 生成。周巡检：`scripts/audit-task-docs.py`。
