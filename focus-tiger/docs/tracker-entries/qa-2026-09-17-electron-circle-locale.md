# Tracker fragment · qa/2026-09-17-electron-circle-locale

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 分支 | 日期 |
|---|---|---|---|---|---|---|---|---|
| 2026-09-17 5173 Electron 壳测试：圈子闪动/拷贝无提示、日语金句汉语、收藏叠层、坐中文案框 | UI可见 | 有问题 | 复测须：Electron+Safari 两人同一六位码；Copy 后 1 秒内须见拷贝完成；Leave 后再加入须稳定显示已加入；日语 Reflection 金句与芥子印卡正文须为日语。测固定 QA 树 5173。 | 2026-09-17 用户书面：图1 坐中两框不像统一风格；图2 日语出现汉语金句；芥子印卡日语壳里正文仍汉语；图3 已结缘新框挡住 Support/音乐；图4 Copy 无「已拷贝」；图5 Safari Start a circle 只有等待光标；图6 Leave 闪动后再加入界面仍像未加入；My Circle 未见 leave-a-trace。人数 1↔2 久闪。乱点须可失败退出。 | release-blocker | 先修圈子成员态轮询/refresh 互踩（与 ISSUE_LEDGER 扇出同行）；日语普查与收藏错开另刀。禁止在本碎片标已通过。 | `qa/2026-09-17-electron-circle-locale` | 2026-09-17 |
