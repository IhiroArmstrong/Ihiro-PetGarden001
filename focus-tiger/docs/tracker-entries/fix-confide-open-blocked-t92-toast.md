# tracker fragment · fix/confide-open-blocked-feedback

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 备注 | 日期 |
|---|---|---|---|---|---|---|---|---|
| Plan A 死路 · 倾诉不能开时仍见 T92 求助句 | UI可见 | 待人工测试 | **主路径 A（危机类）**：帮助中心危机问 / 语音危机转倾诉 / 倾诉入口被拒（默认 `safety`）→ **0–1 秒** `confide-open-blocked-safety-help` 含 T92 求助热线；不得无声。**主路径 B（公案支援）**：沉思问询防火墙 →「此刻很难独自撑住」→ 过渡卡 → 继续去倾诉 → 若 mount off：**0–1 秒** `confide-open-blocked-entitlement`、**不含** crisis helpline。**抛问页无「跟寅说说」**。**回流**：同路径再点仍出对应 toast。**自动化**：`confideOpenBlockedFeedback.test.js` · `confideOpenBlockedToast.test.js` · `confideOpenEntryRegistry.test.js` · `npm run test:smoke`。 | PO 2026-11-09 · T98 死路 · T79 支援分流 2026-11-15 | — | — | `confideOpenBlockedFeedback.js` · `confideOpenBlockedToast.js` · `ContemplativeInquiryUI.js` | 2026-11-15 |
