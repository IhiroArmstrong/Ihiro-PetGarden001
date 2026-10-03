# feature/qinggong-card-faces

| 清供八件卡面换图 | UI可见 | 待人工测试 | **主路径（`http://127.0.0.1:5173/?product=1`）**：打开 Yin's Collections → 结缘页八行是器物图，不是色点。未结缘的图偏暗；结缘后全彩。点缩略图，同一面板里立刻出现大图和一句短文；Esc 先关掉大图，再按一次才关珍藏。价格仍是 24/48/36/60/18/30/72/360。自动化：`focusCoinsSurface.test.js`、`FocusCoinsPanelUI.test.js`。 | — | — | — | `http://127.0.0.1:5173/?product=1` · `#yin-coin-panel` · `[data-testid=yin-coin-curio-detail]` | 2026-10-03 |
