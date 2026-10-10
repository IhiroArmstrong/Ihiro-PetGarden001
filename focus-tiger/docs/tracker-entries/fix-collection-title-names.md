# fix/collection-title-names

| 珍藏称号名与桌上青瓷分开 | UI可见 | 待人工测试 | **主路径**：`?product=1` → Yin's Collections → **结缘**页仍见 Celadon cong vessel / 青瓷琮式尊、Celadon garlic-mouth vase / 青瓷蒜头长颈瓶，不改成座右小碑。打开 **Companion titles**：三条是 Desk-side stele / Returned celadon vial / Long sitter（中文：座右小碑 / 归来青瓷小瓶 / 久坐的人；日文：座右の小碑 / 帰りの青磁小瓶 / 長く坐った人）。称号页不再出现青瓷琮式瓶或蒜头瓶的名字。已结缘、佩戴中的状态还在。**回流**：关面板再开，两页名字不变。自动化：`collectionsTitles.test.js`。 | — | — | — | `?product=1` · `[data-testid=yin-coin-titles-list]` · `[data-testid=yin-coin-tabpane-bond]` | 2026-10-11 |
