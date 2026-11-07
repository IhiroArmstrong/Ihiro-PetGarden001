# tracker fragment · fix/t92-safety-help-line-10-04

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 备注 | 日期 |
|---|---|---|---|---|---|---|---|---|
| T92 · 安全回复写上求助资源（10-04） | UI可见 | 待人工测试 | **主路径**：Electron 宽屏或 Web `?product=1&confide=1` → 发明确危机句（如 `I don't want to live` / `我不想活了`）→ **0–1 秒内** `data-route=safety_redirect` · 棕色竖线 · 中文回复含 **「请您拨打本地求助热线」**（无各国具体号码）· 英文含 **local crisis helpline**。**回流**：关卡后再发危机句仍走 safety-01。自动化：`confideCorpus.test.js` · `confideReplyFlow.test.js` · `confideHelpEntry.test.js`。 | PO 2026-11-07：R2 锁定唯一求助句，不写过期热线清单 | — | 倾诉安全文案 · T92 | `fix/t92-safety-help-line-10-04` | 2026-11-07 |
