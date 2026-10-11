# fix/lanterns-above-arrive-glass

| 灯火短句不被 Arrive 毛玻璃糊住 | UI可见 | 待人工测试 | **主路径**：`?product=1` 硬刷新，圈内有人在坐、远处也有人在坐 → 左下见黄灯、蓝灯和 “Someone from your circle is sitting”。打开 Arrive 的 Notice 卡片后，这三样仍清楚，短句是深色字、浅色小胶囊，不被卡片毛玻璃糊住。点灯无反应；点 Notice 仍可选。**回流**：进入专注后灯和短句消失；起来后再出现，Notice 再开时仍然清楚。**375**：灯和短句不挡住底部主按钮。 | **2026-10-11 用户书面**：someone from your circle is sitting 以及蓝色、黄色两个灯笼都被毛玻璃遮住了。 | — | — | `http://127.0.0.1:5173/?product=1` | 2026-10-11 |
