# feature/collection-earned-piece-card

| 珍藏单件凭证卡存图 | UI可见 | 待人工测试 | **主路径**：`?product=1` 打开阿寅的珍藏，结缘页里一件**已经得到**的清供上点 **Save image**。0–1 秒内按钮变成 Saving…，随后下载 `focus-tiger-collection-piece-<id>.png`（器物、累计分钟、一句；新兑换的写得到的日子，更早拥有且没有日子的写 Already in the collection / すでに蒐集のなかにあります，不编日期）。按钮变为 Saved。**失败**：按钮变为 Could not save，可再点。**未拥有**：该行没有 Save image。**回流**：关掉抽屉再开，按钮回到 Save image。375 不挡 Sit。免费，无付费墙。单测：`collectionPieceCard.test.js` · `focusCoinsRedeem.test.js`。 | — | — | — | `?product=1` · `[data-testid=yin-coin-save-piece]` | 2026-10-07 |
