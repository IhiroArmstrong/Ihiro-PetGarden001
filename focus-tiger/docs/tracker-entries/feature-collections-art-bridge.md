# feature/collections-art-bridge

| 珍藏第一次得到后的艺术品入口 | UI可见 | 待人工测试 | **主路径**：`?product=1` 清空本机后打开阿寅的珍藏，结缘第一件器物。0–1 秒内成功卡出现，并有英文 “If you enjoy pieces like this…” 与 **Open Yin's Art Collection**。点按钮，珍藏收起，Yin's Art Collection 打开。再结缘第二件，成功卡不再带这句。**关掉**：点 Close，卡收起；再结缘也不再出现。**回流**：关掉珍藏再开，句子不挂在列表上。375 不挡 Sit。自动化：`collectionsArtBridgeGate.test.js` · `FocusCoinsPanelUI.test.js`。 | — | — | — | `?product=1` · `[data-testid=yin-coin-art-bridge]` | 2026-10-08 |
