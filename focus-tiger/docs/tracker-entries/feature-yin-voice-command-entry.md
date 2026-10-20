# feature/yin-voice-command-entry

| T10 Yin 语音指令入口 | UI可见 | 待人工测试 | **仅 Electron 宽屏。** 停掉旧预览后重开桌面版 → 倾诉 → `Hi Yin, please backup`（可说可打字）。复述念完后见 `[data-testid=confide-operating-confirm-listen]`（听 Yes/Cancel + 音量条）约 10 秒。说或打字 **Yes** / **Yeah** / **Yes please** / **OK** → 应下载备份。沉默或听不清 → 「没听到…」且空麦时括号里应有 capture 诊断。`Hi Ian, please backup` 仍当倾诉。Journey Log / 切语言 / 专注 Control+Shift+Y + I'm done 同 Brief。 | 备份确认说了 Yes 仍报没听到 | — | 确认窗可见反馈 + 放宽 Yes + MISSED 诊断 | [task-yin-voice-command-entry.md](../task-briefs/task-yin-voice-command-entry.md) | 2026-10-20 |
