# feature/confide-en-restore-ja-off

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| 首发倾诉：英文恢复入口、日语界面关闭 | UI可见 | 待人工测试 | **主路径（英文 Idle）**：打开产品（无需 `?confide=1`）→ ⋯ / 抽屉见「向阿寅倾诉」→ 宽屏左上耳或窄屏顶栏耳可见 → 点开 **0–1 秒内** `#confide-to-yin-card` 淡入；快捷键 Meta/Ctrl+E 同样打开。**日语**：Language 切到日本語 → **0–1 秒内** 耳消失、菜单行没有倾诉；若卡已开则关闭。再切回 English，Idle 下入口回来。**回流**：关卡后再开；Sit→Rise 回 Idle 英文耳仍在。**对照**：Focusing 无耳。终端已锁：`confideUserVisibilityGate.test.js`（英开/日关、harness 不能在日语打开）。人只补观感与切语言。 | — | — | — | `http://127.0.0.1:5173/?product=1` · `#confide-ear-chrome` · `#ft-narrow-confide-btn` · `#confide-to-yin-card` | 2026-11-14 |
