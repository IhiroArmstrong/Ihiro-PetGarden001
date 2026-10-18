# feat-confide-t17-fact-card-rank-margin

| Confide T17 事实卡 rank+margin 判定一刀 | 纯后端/发送链 | 待人工测试 | **主路径**：Electron 英文产品问 paraphrase（黄金脚本 product_short 句）在 embedding ready 时应念短答而非诚实空态；**无卡**英文情绪句不得误接卡（T17 门闩：`semanticIsProduct` + lead ≥0.05）。**自动化**：`node --test src/core/confide/kbNearMatch.test.js` · `confideFactFirstSpeak.test.js` · `confideGoldenScriptV1.test.js` · `npm run test:smoke`。 | — | — | 未验证桌面 embedding | `resolveConfideFactFirstSpeak` · `decideKbNearMatch` | 2026-10-18 |
