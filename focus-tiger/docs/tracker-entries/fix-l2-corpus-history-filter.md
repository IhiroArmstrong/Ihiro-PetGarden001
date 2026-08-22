# tracker fragment · fix/l2-corpus-history-filter

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 备注 | 日期 |
|---|---|---|---|---|---|---|---|---|
| 桌面 L2：语料轮不进生成历史 | UI可见 | 待人工测试 | **仅 Electron 非低配宽屏。** **主路径**：Confide 同一面板先发危机句（如 `I don't want to live`）→ 见 `safety-01` 转介；**不关卡**，再发闲聊（`Whom do you like?` / `Do you eat anything?`）。**0–1 秒内**发送钮 disabled + 正在听；随后回复 **不得**再是转介全文（`too heavy to hold alone` / crisis line）。失败可见语料 fallback（`Heard. Yin nods quietly.` 等），禁止空白。**回流**：关卡重开后先闲聊（无危机史）仍可 generate。**窄/Web**：无 generate，本行不测。自动化：`desktopCompanionL2Route.test.js` 四条历史过滤。 | — | — | — | `#confide-to-yin-reply` · `historyForGeneratePrompt` | 2026-08-23 |
