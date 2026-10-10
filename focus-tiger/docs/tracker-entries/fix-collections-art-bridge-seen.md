# fix/collections-art-bridge-seen

| 珍藏已有藏品时的艺术品入口 | UI可见 | 待人工测试 | **主路径**：这台设备还没看过那句，且结缘页已有至少一件藏品。打开 Yin's Collections。0–1 秒内标题下面出现 “If you enjoy pieces like this…”、**Open Yin's Art Collection** 和 **Close**，不用滚到列表底。点 Open，珍藏收起，Yin's Art Collection 打开。再开珍藏，这句不再出现。**没看见不算看过**：句子若在可视区域外，关掉再开仍应出现。**没有藏品**：不出现这句。**已看过**：再结缘也不再出现。375 不挡 Sit。自动化：`collectionsArtBridgeGate.test.js` · `FocusCoinsPanelUI.test.js`。 | — | — | — | `?product=1` · `[data-testid=yin-coin-art-bridge]` | 2026-10-11 |
