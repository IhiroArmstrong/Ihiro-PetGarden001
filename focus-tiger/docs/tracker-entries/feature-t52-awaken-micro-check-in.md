# feature/t52-awaken-micro-check-in

| 功能 | 类型 | 状态 | 测试说明 | 用户反馈 | 严重度 | 处理承诺 | 分支/锚点 | 更新 |
|---|---|---|---|---|---|---|---|---|
| T52 觉照微打卡 | UI可见 | 待人工测试 | **主路径**：`?product=1&sessionMinutes=1` → Sit → Rise → Reflection 内见 `#awaken-check-in` 三钮（顺/乱/倦 或 en 文案）→ 点一项后条消失 → **Skip all / Continue 仍可点**。中途：Focusing 暂停/加 5 分钟可出顶栏微打卡（与 T51 邀请互斥；日中途 ≤4）。e2e：`e2e/awaken-check-in.spec.js`。 | — | — | — | `#awaken-check-in` · `window.__awakenCheckIn` | 2026-10-25 |
