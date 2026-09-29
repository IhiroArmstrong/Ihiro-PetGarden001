# feature/open-ended-focus-slice2

| Open-ended focus Slice 2（90 分钟 / 3 小时温和提示） | UI可见 | 待人工测试 | **仅 Electron / macOS DMG**，且本场是 Open-ended。坐到专注中满 90 分钟 → 左上 HUD 下见一句「可以继续坐，也可以随时起身」（`#open-ended-nudge`）。点 **继续坐 / Stay** → 句子消失，计时不停。再坐到 3 小时 → 另一句，同样一次。点 **以后不再提示** → 句子消失，且下一场不再出。固定 25 分钟 chip 全程不该看见这句。觉察卡若同时在底部，两句不叠在同一位置。自动化：`openEndedFocus.test.js` · `openEndedNudgePreference.test.js`。 | — | — | Web 不要求出现此句 | Electron DMG · `?product=1` · `#open-ended-nudge` · Brief [task-open-ended-focus.md](../task-briefs/task-open-ended-focus.md) | 2026-09-29 |
