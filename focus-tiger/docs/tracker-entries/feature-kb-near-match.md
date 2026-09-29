# feature/kb-near-match

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| 知识库近义匹配 + 练习问句不被坐一会儿抢走 | 纯后端 + UI文案 | 待人工测试 | **Electron 宽屏 Confide，embedding 已就绪。** ①「有没有适合现在坐一会儿的练习？」不得再是在场句 `Yin is still here…`。②「想看看之前做过的练习」→ Journey log 短答。③「想看看阿寅以前记下的东西」→ What Yin remembers 短答。④「想结束刚才的练习」「有没有让自己回到当下的练习？」「想找个短一点的专注练习」本刀仍可能是诚实空态，不得为了接住它们误答成别的功能。⑤「坐一会儿」（没有「练习」）仍是在场句。单测：`confideCompanionPresence.test.js` · `kbNearMatch.test.js`。 | 2026-09-30：7 句抽样里只有「想做一下呼吸练习」答对 | — | — | `kbNearMatch.js` · `confideCompanionPresence.js` · `ConfideToYinUI.js` | 2026-09-30 |
