# feature/ics-reminder-export

| 提醒设置添加到日历 | UI可见 | 待人工测试 | **主路径**：产品壳 Idle → ⋯ / 抽屉「什么时候提醒你」→ 勾选开启提醒 → 选每日或工作日（只影响文件）→ 点「添加到日历」→ **0–1 秒内**见「正在准备文件」并开始下载 `.ics`。诚实句须在，禁止「同步」。**回流**：关面板再开，钮仍在；关掉提醒后钮禁用。**自动化**：单测生成字符串；e2e `in-app-reminder.spec.js` 禁用+下载。**仍须人工**：把文件导入 Apple / Google / Outlook 看墙钟与是否重复；点事件 URL 回 App。场景配方：`resetScenario` 后走场景 P。 | — | — | — | `?product=1` · `#reminder-preference-ics-export` | 2026-11-11 |
