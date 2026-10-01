# feature/journey-daily-card

| Journey 单日日记卡存图 | UI可见 | 待人工测试 | **主路径**：完成一次静坐后打开 Journey log，某一天坐席行上点 **Save image**。0–1 秒内按钮变成 Saving…，随后下载 `focus-tiger-daily-card-日期.png`（暖纸、分钟、一句；当日若已开过 Quiet Line 用那天的静语，否则用短句）。按钮变为 Saved。**失败**：按钮变为 Could not save，可再点。**回流**：关掉日志再开，行还在，按钮回到 Save image（刷新页面后）。点行文字本身不出另一张卡。375 不挡 Sit。免费，无付费墙。单测：`journeyDailyCard.test.js`。 | — | — | — | `?product=1` · `[data-testid=journey-log-save-daily-card]` | 2026-10-01 |
