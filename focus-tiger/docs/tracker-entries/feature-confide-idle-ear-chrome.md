# feature/confide-idle-ear-chrome

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Idle 倾听耳第二入口（向阿寅倾诉） | UI可见 | 待人工测试 | **主路径（宽屏 ≥480 · Electron 非低配，或 Web `?product=1&confide=1`）**：Idle → 左上角白底耳朵钮 `#confide-ear-chrome` → **0–1 秒内**钮按压缩 + `#confide-to-yin-card` 淡入；标题为「向阿寅倾诉」/ Confide to Yin。**窄屏 ≤479**：顶栏 ActionBar 在 `?` 右侧见 `#ft-narrow-confide-btn`（宽屏左上耳须消失）；点开同一张卡。**菜单仍在**：⋯ / 抽屉「向阿寅倾诉」仍可开同一卡。**回流**：Close / Esc 关卡后再点耳；Sit→⚡→Rise→Skip Reflection 回 Idle 后耳须仍在（闸开时）；Focusing / Arrival / Reflection 开着耳须隐藏，点阿寅仍是 Recover / 摸头不是倾诉。**闸关（Web 默认无 `?confide=1`）**：耳与菜单行都不见。**375**：耳在 ActionBar 内，不挡 Sit / 三球。**分列观感**：①耳钮按下即缩；②卡 220ms 淡入；③Focusing 无耳。自动化：`shouldShowConfideEarChrome` + `ConfideEarChromeUI.test.js` + NarrowIdleShell 契约。完整用户链路无新 e2e（须人工）。 | — | — | — | `http://127.0.0.1:5173/?product=1&confide=1` · `#confide-ear-chrome` · `#ft-narrow-confide-btn` | 2026-08-22 |
