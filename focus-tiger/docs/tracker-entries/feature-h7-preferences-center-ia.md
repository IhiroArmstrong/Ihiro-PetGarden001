# feature/h7-preferences-center-ia

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Preferences 分组中心（H7） | UI/交互 | 待人工测试 | **主路径（宽 ≥480 · `?product=1`）**：Idle → ⋯ → Preferences。**0–1 秒**见五块卡片（体验/练习/空间/设备/账户）。Help Center、Backup & restore、Practice Study、Subscription 都在账户块。How Yin may speak 有说明行。Sound 点开仍是声景面板。Keep in front（电脑版）是列表开关、不另弹卡。Practice 组列表底部不应再有大块空白。**窄屏**：抽屉同一分组。**回流**：关菜单再开，分组仍在。Support Yin 仍在右上。**自动化**：`preferencesCenterCatalog.test.js` · `idleChromeOrchestration.test.js` · `WideIdleMoreMenu.test.js` hug-height。 | — | — | — | `http://127.0.0.1:5173/?product=1` · `#ft-wide-more-menu` · `[data-testid=idle-help-center]` | 2026-11-17 |
