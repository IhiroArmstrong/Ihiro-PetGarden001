# fix/yin-coin-curio-detail

| 珍藏点开原图 | UI可见 | 待人工测试 | **主路径**：`?product=1` → Yin's Collections → 结缘页点一件器物的小图。0–1 秒内同一面板盖上大图、名字和一句短文，底部没有 undefined。点 Close 或按 Esc，大图收起，列表滚动条回来，能滚到下面的器物。再点另一件小图，仍出现大图。点 Save image 只下载凭证，不把列表卡死。**回流**：关掉珍藏再开，滚动正常，底部仍没有 undefined。自动化：`FocusCoinsPanelUI.test.js`（原图层先创建再挂上）。 | — | — | — | `?product=1` · `#yin-coin-panel` · `[data-testid=yin-coin-curio-detail]` | 2026-10-11 |
