# feature/c2-focus-hud-idle-calm

| FocusHUD · Idle 默认态变轻（C.2） | UI可见 | 待人工测试 | **主路径**：`?product=1` Idle → 左上 `#focus-hud` 只见 Calm 状态名 + 半透明计时 + 金环；**今日同坐条默认收起**（鼠标悬停整张 Calm 卡才展开）；**近日同坐 7 点环明显变淡**。**Focusing**：Sit/Quick 开表后条 + 环 + 计时全显、**不裁切**。**375**：HUD 不挡右上 mute。**回流**：Rise 回 Idle 条再收起；悬停金环/条/环仍出 tip（同现网）。自动化：`e2e/focus-hud-idle-calm.spec.js` + `focus-hud-hover.spec.js`。 | — | — | — | `#focus-hud` · `/?product=1` · 375×667 | 2026-09-13 |
