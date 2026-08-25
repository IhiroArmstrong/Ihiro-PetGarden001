# tracker fragment · feature-overlay-slot-arbitration-pr2

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地路径 / 备注 | 日期 |
|---|---|---|---|---|---|---|---|---|
| Overlay slot arbitration PR-2（接线 + C1–C3 busy + 首卡队列） | UI可见 | 待人工测试 | **主路径**：`?product=1` 冷启动 Idle → 吹花气泡消失后 Compass 首卡仍按序出现（不与 flower 叠）。**C1**：完成 score≥21 会话 → 芥子印卡开时 ⋯/Sit 应 suppress（与 Reflection 同级 postSession）。**C2**：Honesty 呼吸/时长面板开时 contextual tea bubble 不出。**C3**：Compass / 芥子印开时 in-app reminder banner 不出。**回流**：Wellness 首卡关后 Compass 首卡；Rise→Idle 首卡不重入已 seen。**375**：首卡不挡 Sit。自动化：`overlaySlotArbitration.test.js` + `sessionChromeSync.test.js`（mustard postSession）。 | — | — | — | `main.js` · `sessionChromeSync.js` | 2026-08-25 |
