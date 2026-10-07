# feature/art-collection-chosen-piece-card

| 艺术品收藏卡存图 | UI可见 | 待人工测试 | **主路径**：打开 Yin's Art Collection。一件**这一次登录里已经买下**的画上点 **Save image**（未买下的只有购买）。0–1 秒内按钮变成 Saving…，随后下载 `focus-tiger-art-piece-<id>.png`（预览图、作品名、购买确认日、一句「这是我选的一件」；没有确认日就写已在手头，不编日期，不写累计分钟）。按钮变为 Saved。**失败**：按钮变为 Could not save，可再点。**未拥有**：该张没有 Save image。**回流**：关掉面板再开，按钮回到 Save image。375 不挡 Sit。存图不再收费。单测：`artChosenPieceCard.test.js` · `ArtCollectionPanelUI.test.js` · `yinArtCollection.test.js`。 | — | — | — | `[data-testid=art-collection-save-celadon-taotie-gu]` | 2026-10-08 |
