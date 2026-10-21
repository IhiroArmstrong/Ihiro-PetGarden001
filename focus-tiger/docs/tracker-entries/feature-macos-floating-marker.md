# feature/macos-floating-marker

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Mac 原生悬浮陪伴（托盘开关） | UI可见 | 待人工测试 | **仅 Mac Electron 壳。** 冷启动：托盘无贴边老虎；「显示悬浮陪伴」未勾、「全屏时隐藏」已勾。勾上显示 → 1 秒内右侧出现把手，悬停滑出老虎。点标记 → 主窗前置，浏览器输入焦点在点标记当下不被 helper 抢走。勾上全屏隐藏后把 Safari/Chrome 切原生全屏 → **标记须消失**；退出全屏可再出现。关掉显示 → 标记立刻没。**Web `:5173` 不得出现。** 自动化：`floatingMarkerPolicy.test.js`（默认关 + hide 时不得 `canJoinAllSpaces`）。**须人工锁路径**：真实全屏。阶段 1 用户书面：勾上全屏隐藏后浏览器全屏标记仍在（旧 Demo 留了 `canJoinAllSpaces`）。 | — | — | — | `focus-tiger/desktop/` · 托盘 · `task-macos-floating-marker.md` | 2026-10-21 |
