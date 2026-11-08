# tracker fragment · fix/t91-safety-latch-until-app-exit

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 备注 | 日期 |
|---|---|---|---|---|---|---|---|---|
| T91 补 · 安全后锁生成直到退出应用 | UI可见 | 待人工测试 | **主路径**：Electron Confide 发危机句 → 固定安全句 → 再发非危机兜底句 → **不得** `source=generate`。**回流**：关掉倾诉面板再打开 → 再发非危机兜底句仍不得 generate。**解除**：完全退出应用再开 → 未走安全路由前可以 generate。自动化：`confideSafetyGenerateLatch.test.js`。 | PO/分析师 2026-11-08：会话=退出应用前；关面板解锁等于没锁 | — | 叠在缩窄窗口 #1612 | `fix/t91-safety-latch-until-app-exit` | 2026-11-08 |
