# docs-confide-generate-latency-rca

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Confide 宽屏 fallback generate 等待若干秒 | 纯后端/桌面 | 有问题 | Electron 宽屏 Confide ready → 发不会进规则桶的闲聊（如 `我想打游戏`）→ 看 Console `confide_share` 的 `dataSource`；corpus 应即时；generate 记秒表。对照 `turns.jsonl` 同轮是否先有 `read_hybrid_classify` 再 `l3_generate`。 | **2026-09-19 用户书面**：`我想打游戏` 答句挺好但等了若干秒；认为自动 Generate 不该再加拖延；质疑多轮会话仍未搞定反应时间。 | release-blocker | 根因已写入 ISSUE_LEDGER：#841 只埋点未砍串行 classify+generate；本回合不改 send。下一刀须 PO 解除补漏审计「禁改 mayUseConfideReadHybrid」后另开 Chat。 | `docs/confide-generate-latency-rca` | 2026-09-19 |
