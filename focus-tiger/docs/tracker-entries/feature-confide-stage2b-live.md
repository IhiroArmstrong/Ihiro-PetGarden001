# feature/confide-stage2b-live

| Confide Stage 2b 灰度 live（gray→功能桶） | 纯后端/逻辑 | 待人工测试 | **仅 Electron 宽屏**。合入后默认仍 shadow：不设变量时「有没有适合现在缓一缓的短练习？」「练完之后寅币去哪儿看」「最近老是想起以前」回复须与切前同类。本机灰度：主进程 `FT_CONFIDE_STAGE2B_ROUTING=live`（embedding ready）后，前两句离开观察翼，第三句仍观察翼。回滚：去掉该变量或 `FT_CONFIDE_SEMANTIC_ROUTING=shadow`。误拉原句记下后补负例 txt（日志后段只留 hash）。**不要**现在就设 live，等这条合入后再设。单测：`node --test src/core/confide/confideSemanticStage2b.test.js`。**本条验收的是** PO 本机打开 2b live 后实验室功能问能进功能链；**不代表**默认全用户 live。 | — | — | — | `confideSemanticStage2b.js` · `task-confide-stage2b-semantic-cutover.md` | 2026-10-13 |
