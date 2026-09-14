# feature/calm-action-transition

| C5 · Transition Moment（Compass 入口 + CAW-T whisper · S21） | UI可见 | 待人工测试 | **主路径**：`?product=1` Idle → ⋯ **The 5 Moments** → **Transition** 芯片 → 0–1s 阿寅旁 CAW-T 轻提示 + 合十 → ~8s 自动消失或点提示关。**回流**：连续两次不得连出同句。**保护面**：提示开着仍可摸头 / Sit；Confide/Journey 开时不得开；`MOMENT_WHISPER_TRANSITION` 仍不 play。 | — | — | — | `TransitionMomentUI.js` · `CalmActionTransitionStore.js` | 2026-09-14 |
| C5.1 · Compass Transition 芯片 → Transition Moment whisper | UI可见 | 待人工测试 | 同 C5 主路径。**对照**：Work Transition 仪式独立。**不开** Whisper `transition` 键。自动化：`e2e/calm-action-transition.spec.js`。 | — | — | — | `fiveMomentsCompassGate.js` · `main.js` | 2026-09-14 |
