# feature-t101-global-sit-hotkey

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| T101 全局开坐快捷键 | UI可见 | 待人工测试 | **仅 Electron Mac。** 主路径：应用在后台或托盘 → 按默认 Command+Control+Shift+S → 0–1 秒内走与点 Sit 同类开坐（本场 5 分钟）。Preferences → Sit shortcut 可改键；Control+Option 与 Control-Shift-Y 须拒绝。忙则轻提示。网页无此行。**禁止**把本旁支合进 12/8 首包前的 develop。 | — | — | — | `npm run desktop:dev` · `#global-sit-hotkey-preference` | 2026-11-24 |
