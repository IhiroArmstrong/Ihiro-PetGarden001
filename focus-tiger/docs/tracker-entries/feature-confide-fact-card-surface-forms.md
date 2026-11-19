# feature-confide-fact-card-surface-forms

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Confide 事实卡多一句表面形式（0037/0038/0020） | 纯后端 + 目录 | 待人工测试 | **Electron 宽屏 Confide，embedding 已就绪。英文第一优先。倾诉开关仍关时本条只作研发自检。** 终端已锁：三张卡各 2 句事实键；短答不在短语里；给 keywords 加失败问法短语不变；可见开发集 0.80 应落卡不少于 5/8、无卡 2 条不得 ≥0.80。`node --test src/core/confide/kbNearMatch.test.js src/core/confide/confideProductAskRole.test.js` · 黄金脚本英文产品问 · `npm run test:smoke`。**人只补**：① Brief 未写过的英文背景音乐说法 → 0037。② 要不要打卡换说法 → 0038。③ 入口在哪 → 0020 不被 0038 抢。④ 吃饭闲聊不进诚实空态。**禁止**写「换说法已经接住」。关单仍须新封存 `sealed-v3`（或更新编号）按类 ≥85%。 | — | — | — | `kbNearMatch.js` · `productKnowledgeCatalog.json` · 宽屏 Confide | 2026-11-19 |
