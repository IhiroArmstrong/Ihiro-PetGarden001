# feature/presence-signals-slice-0-1

| Presence Signals Slice 0–1 + 4 + 5 disclosure | UI可见 | 待人工测试 | **披露（首次）**：清 `focus-tiger.presence-signals-disclosure-seen.v1` → Sit → Arrival → Notice 任点 → 观察短句**下方**应见 `[data-testid=presence-signals-disclosure]`（约 2.4s 随 Notice 收起）→ 再走一遍 Arrival **不应**再出现。**入账**：`presence-signals.v1` 有 `arrival_notice`。**Confide**：≥3 次打卡问趋势 → `presence_facts`；&lt;3 insufficient。**负例**：抑郁+趋势问 → sad 语料。自动化：`presenceSignalsGate` · `confidePresenceFacts` · `presenceSignalsDisclosureGate` 单测。 | — | — | — | PR #435 · Brief `task-presence-signals-slice-0-1.md` | 2026-08-25 |
