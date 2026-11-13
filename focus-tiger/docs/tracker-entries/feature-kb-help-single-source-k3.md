# feature/kb-help-single-source-k3

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| 一份事实源第 3 刀 · 五个点名菜单短答/草稿 | UI可见 | 待人工测试 | **主路径（`?product=1` Idle）**：⋯ Help Center。能打开「Sit with a question」「Presence Field」；点开 0–1 秒内见入口说明。背景音乐篇须提到 Preferences → Sound。**不得**出现心念流 / 研究共修成稿主题。**回流**：关掉帮助中心再开，两篇仍在。**负例（仅 Electron 宽屏倾诉，入口开着时）**：问 Sit with a question / Presence Field / 智能场 → 走现网空态，不要新加「去帮助中心看看」。问 background music 仍是 0037。自动化：`kbHelpSingleSourceK3.test.js` · `helpCenterCatalog.test.js` · `npm run test:smoke`。 | — | — | — | `?product=1` · `[data-testid=idle-help-center]` · `[data-testid=help-center-topic-KB-FUNC-0040]` · `[data-testid=help-center-topic-KB-FUNC-0041]` | 2026-11-13 |
