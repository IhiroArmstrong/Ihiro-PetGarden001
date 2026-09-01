# Task Brief · TEST_TRACKER 碎片拼装触发（#366 后续）

> **状态（2026-08-20）**：#366 已合 `origin/develop`。本 Brief 只定**何时**跑 `tracker:assemble`，不把碎片模式铺到 `PROCESS.md` / `RULES_INDEX.md`。  
> **权威 SSOT**：`TEST_TRACKER.md`「拼装触发」。本文件是操作备忘，防止「下一步再拼装」没人记得触发。

## 目标

试点已落地：功能 PR **只加** `docs/tracker-entries/<分支>.md`，**不要**往主表插行，**不要**顺手 assemble 再提交本体。

缺的是触发条件。若不写死，碎片会越积越多，批量人工测试每次都要临时合并读多个文件。

## 拍板（本轮）

| 项 | 口径 |
|---|---|
| **P0** | 口令「批量人工测试」/「给我待测清单」：若除 readme / `_` 外仍有碎片 → **先**独立 `docs/*` PR 跑 `npm run tracker:assemble` 并提交机器块，**再**出清单 |
| **P1** | 口令「请安排下班前的 Git 同步」：若除 readme / `_` 外仍有**任意**碎片（≥1）→ **须**另开独立 `docs/*` PR 跑 `npm run tracker:assemble` 并提交机器块 |
| **P2** | 待拼碎片文件数 **≥ 5** → `tracker:check` **WARN**（仍绿）；提示已错过当日下班前拼装 |
| **不做** | 每周五定时（Agent 无 cron） |
| **CI** | `docs:check` **不因未拼装而红**；`tracker:check` 在 ≥5 时 **WARN**（仍绿） |
| **功能 PR** | 禁止 assemble |
| **本轮不删碎片** | assemble 只写入机器块；`tracker-entries/` 瘦身（consume-on-assemble）另议 |

## 明确不做（本 Brief）

- 不把碎片模式推广到 `PROCESS.md` / `RULES_INDEX.md`（试点先跑几周）
- 不在功能 PR 里拼装
- 不把「未拼装」做成 `docs:check` 红灯
- 不实现 consume-on-assemble（拼装后删/挪碎片）——那是目录真正变干净的下一步，单独拍板

## 验收

- 文首「拼装触发」+「批量人工测试」第 0 步与本表一致
- `tracker:check`：4 个碎片不 WARN，5 个 WARN、仍 exit 0
- 本 PR **只加碎片、不跑 assemble 提交本体**
