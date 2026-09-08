# feature/calm-action-recover-runtime

| Calm Action Recover 运行时（C1） | UI可见 | 待人工测试 | **主路径**：`?product=1&sessionMinutes=1` → Sit/Skip Arrival → Focusing → 点 Tiger Anchor（`active-recover-hit`）→ 观察式 toast 仍出 + 底部 **Calm Action** 卡（`calm-action-recover-card`）约 0.4s 后出现；点卡可关。**回流**：同 session 第二次 Recover（冷却 3min 后）仍同一句（session 锁）。**保护面**：Re-focus toast / Rise / Honesty 门闩不变。e2e：`e2e/calm-action-recover.spec.js`。Brief `task-calm-action-recover-runtime.md` · roadmap C1。 | — | — | — | `CalmActionRecoverStore.js` · `CalmActionRecoverCardUI.js` · `content/calm-action-wisdom/*` | 2026-09-07 |
