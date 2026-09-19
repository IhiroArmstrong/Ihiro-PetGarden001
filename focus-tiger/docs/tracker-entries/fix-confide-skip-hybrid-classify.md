# fix-confide-skip-hybrid-classify

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Confide 宽屏 fallback 跳过明显非查询的 Hybrid 分类 | UI可见 | 有问题 | **主路径**：Electron 宽屏 Confide ready → `我想打游戏` → Console `dataSource: generate`，秒表应比合入前少约 1–1.5s（无 `read_hybrid_classify` 先行）。**回归（须逐条）**：`列出记忆` / `你还记得什么` / `我最近在忙什么` / `为什么开始做这件事` / `我练了多久` → 仍应走 Hybrid 分类（`turns.jsonl` 有 `read_hybrid_classify` 或对应工具答句），不得因跳过门闩漏工具。**对照**：`我想打人` 仍 corpus。自动化：`confideReadHybrid.test.js`「skips L0 classify only for clear non-query chitchat」。 | **2026-09-19 分析师书面**：批准跳过分类，合入前须覆盖列出记忆等 Hybrid 变体回归。**2026-09-19 用户书面**：`我想打游戏` 仍等约 3s（`generate`）；`列出记忆` 仍慢（真补漏 classify）；`我最近在忙什么` 实际是 `reflective_honesty` 不是 Hybrid。 | high | skip 门闩对闲聊生效，但 L3 仍 2–5s；正例句层序与 tracker「须走 Hybrid」不完全一致（忙什么先诚实桶）。关单不得标已通过。 | `fix/confide-skip-hybrid-classify` | 2026-09-19 |
