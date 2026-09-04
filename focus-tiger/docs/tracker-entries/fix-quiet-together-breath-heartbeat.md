| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 访问路径 | 日期 |
|---|---|---|---|---|---|---|---|---|
| Quiet Together · Breath / RitualFlow 计入同坐 | UI可见 | 待人工测试 | **主路径**：标签 A `?product=1` 左球 Breath practice → 选 1 分 chip → 保持呼吸 ≥5s；标签 B（Electron Idle）硬刷新等 5s → DevTools `peekLanternPresence()` 应 `{ ok: true, sitting: ≥1 }` 且 B 见金点。**本窗**：A 呼吸中不得见自家灯火（与 Focusing 一致）。**回流**：A Leave → `sitting` 回落；再 Sit Focusing 仍计 1 人。**RitualFlow**：付费仪式 breath 步同样计 1、结束 leave。自动化：`quietTogetherBreathHeartbeatWiring.test.js`。 | — | — | — | `?product=1&microRitualMs=2800` · 双标签 | 2026-09-04 |
