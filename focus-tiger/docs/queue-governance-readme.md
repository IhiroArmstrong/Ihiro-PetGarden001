# 队列文档治理（防 PR 冲突）

> 索引：`RULES_INDEX.md` → `queue-governance` · 门禁：`npm run queue:check`（并入 `docs:check`）  
> 配套：[`CONFIDE_WORKING_AGREEMENT.md`](./CONFIDE_WORKING_AGREEMENT.md) §3 · [`TEST_TRACKER.md`](./TEST_TRACKER.md)「拼装触发」

## 热点文件（全队账本）

并行功能 PR **禁止**改动下列文件（CI 会红）：

| 文件 | 用途 |
|---|---|
| [`GLOSSARY.md`](./GLOSSARY.md) | T 代号、风险、代号对照 |
| [`SCHEDULING_GLOSSARY.md`](./SCHEDULING_GLOSSARY.md) §1 | **队列行 SSOT**（P1/P2/槽位） |
| [`CONFIDE_NOW.md`](./CONFIDE_NOW.md) | 倾诉现行一页 |
| [`CONFIDE_REVIEW_ONE_PAGER.md`](./CONFIDE_REVIEW_ONE_PAGER.md) | 复核一页纸 |

修订历史写在 [`GLOSSARY_CHANGELOG.md`](./GLOSSARY_CHANGELOG.md) / [`SCHEDULING_CHANGELOG.md`](./SCHEDULING_CHANGELOG.md)，**不要**再在主文件末尾堆 changelog 表。

## 实现会话（功能 / fix 旁支）

1. **只读**上表；列队前 `Read` `GLOSSARY.md` + `SCHEDULING_GLOSSARY.md` §1，**不要 commit 改动**。  
2. 关单时在 **PR 描述**写：T 号、状态、PR 号、是否已合 develop——不要顺手「同步术语表」。  
3. 新 T 号、改槽位、改 Confide 日历：登记到 PO / 治理会话，由 **独立 `docs/*` PR** 更新热点（可打 `type:process`）。

## 治理 PR（允许改热点）

- **仅**改热点 + 本 readme + changelog + 相关规则/脚本/WORKFLOW 的 PR 可以通过 `queue:check`。与队列同批登记 **T56** 时，允许同 PR 改 `CO_PRACTICE_POSITIONING.md`、`PRODUCT_POSITIONING.md`、`COMPANION_CONTRACT.md`；登记 **T61** 时允许同 PR 改 [`late-night-behavior-inventory.md`](./late-night-behavior-inventory.md) 与对应 task-entries / Brief 骨架；登记 **T63** 时允许同 PR 改契约面 Brief / task-entries 与 `CO_PRACTICE_POSITIONING.md`（见 `check-queue-governance-docs.js` 白名单）。  
- `docs:check` 会按当天日期重写 [`kb-live-gap-audit.md`](./kb-live-gap-audit.md) 机器块日期；该文件允许与治理 PR 同批，避免挡队列更新。  
- 合并前：`git fetch origin develop && git merge origin/develop`，一次性对齐语义（T 已合 / 立即做 / 旁支保留行）。  
- 队列行：**先改 `SCHEDULING_GLOSSARY.md` §1**，再在同 PR 同步 `GLOSSARY.md`「当前任务」表（含风险列）。
- **电脑版十二条对照**（`GLOSSARY.md` 专节，对照号 1–12）：只许改状态 / 执行序附注，**禁止删行或把 12 行缩成更少**。T38–T49 对应该 12 行。

## 批量消冲突（develop 刚合入队列变更后）

```bash
cd focus-tiger && ./scripts/batch-merge-develop-open-prs.sh
```

脚本会对 `mergeable=CONFLICTING` 的 open PR 尝试 `merge origin/develop`；若仍有 `GLOSSARY` / `SCHEDULING` / `CONFIDE_*` 冲突，会 **中止** 并列出分支，须按治理 PR 口径手工对齐后 push。

## 观察期后的下一步（未实施）

若治理 PR 本身仍频繁冲突，再评估 `glossary-entries/` 碎片 + `glossary:assemble`（仿 `tracker-entries/`）。当前以 **纪律 + `queue:check`** 为主。
