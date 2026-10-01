# feature-collections-behavioral-scarcity

| Collections 行为稀缺 V1 · 修行纪念分区 | UI可见 | 待人工测试 | **主路径**：`?product=1` → Idle → Yin's Collections → 清供列表**下方**见 **修行纪念 / Practice memorials** 分区（4 行：芥子 score 门槛 + 600/3000/10800 分钟印）。已解锁行见本机说明句；未解锁行见观察句「尚未在本机走过」，**无**进度条/全球名次/可点按钮。**不得**出现在「案上陪伴」清供行内。**locale**：en/zh/ja 分区标题与说明随语言切换。**回流**：关面板再开分区仍在；结缘/挥手与改前一致。**关闸**：`?focusCoins=0` 菜单行隐藏时整面板不可达（与改前一致）。自动化：`collectionsBehavioralScarcity.test.js` · `FocusCoinsPanelUI.test.js` · `audit:practice-coverage`。 | — | — | — | `?product=1` · `#yin-coin-panel` · `data-testid=yin-coin-memorial-*` | 2026-09-20 |
