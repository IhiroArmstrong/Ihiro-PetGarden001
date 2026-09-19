# docs-hybrid-gapfill-audit-aggression-zh

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Read Hybrid 补漏率审计（#841 后 jsonl） | 纯后端/文档 | 有问题 | develop tip 宽屏 Confide 按 `read-hybrid-gapfill-rate-audit.md` §5 聊 ≥15 闲聊 + 5 正例门闩句；跑 `npm run audit:read-hybrid-gapfill` 抽 tool≠none / 假补漏 / 真补漏。第一轮 17 句（无 text）仅旁证 7%。 | **2026-09-19 用户书面**（5173 Electron · tip `db670f9`）：第一句「列出记忆」等若干秒才列出；「忙什么」诚实桶不列已有记忆；「忙啥」同义却变答且又慢；「为什么开始做这件事」约 4s 后点头语料；「练了多久」快但与 Journey Log 对不上；闲聊幼虎句不靠谱。审计：analyzed 3、真补漏 1=`列出记忆`。 | release-blocker | 根因已记 ISSUE_LEDGER 扇出（未跟进）；本回合不改 send。下一刀建议：`列出记忆` 进 memory_list 正则；`忙啥` 并入诚实桶；忙什么是否改列须 PO 拍。 | `docs/read-hybrid-gapfill-rate-audit.md` · `npm run audit:read-hybrid-gapfill` | 2026-09-19 |
| P0 中文攻击他人 Brief | 纯后端/文档 | 仅单元测试覆盖 | 无运行时。Brief `task-confide-aggression-zh-p0.md`；实现须口令开工。关单级中文句测仍走 develop tip Electron。 | — | — | 文档登记；无需缺陷处理 | `docs/task-briefs/task-confide-aggression-zh-p0.md` | 2026-09-18 |
