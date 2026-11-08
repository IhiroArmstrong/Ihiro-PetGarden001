# tracker fragment · fix/t92-safety-emergency-second-sentence

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 备注 | 日期 |
|---|---|---|---|---|---|---|---|---|
| T92 补 · 第二句紧急电话（三语、不写号码） | UI可见 | 待人工测试 | **主路径**：危机句 → safety-01 中文含 **当地紧急电话**、英文 **local emergency number**、日文 **救急電話**；仍含第一句本地热线。**禁止**出现 911/110/988 等具体号码。**回流**：帮助入口面板（若开）同一段文案。自动化：`confideCorpus.test.js` · `confideHelpEntry.test.js`。 | 分析师 2026-11-08：第二句紧急电话、不写号码、三种语言 | — | 不替代顾问核实地区资源 | `fix/t92-safety-emergency-second-sentence` | 2026-11-08 |
