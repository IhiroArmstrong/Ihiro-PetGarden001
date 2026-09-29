# feature/voice-input-level-meter

| Voice Input · listening bars follow the real microphone | UI可见 | 待人工测试 | **不要用 5173。** 停掉旧的 `desktop:dev`，在本旁支 `cd focus-tiger && npm run desktop:dev`（宽屏 Electron）→ 开倾诉 → 点 Speak to type。0–1 秒内应看到 Listening…、Stop，以及 Stop 旁三条棕色短条，先贴在底部。不说话时条子保持贴底，不要自己上下跳。说一句英语时条子升高，安静后又落下。点 Stop 后条子消失，字进输入框。Arrival 手写和 Reflection 同一颗按钮同样有条子。Web 与窄屏仍没有麦克风。单测：`voiceLevelMeter.test.js` · `speechProvider.test.js` | — | — | — | Electron 宽屏 Confide / Arrival 手写 / Reflection。Brief [task-voice-input-v1.md](../task-briefs/task-voice-input-v1.md)「听的时候音量条」 | 2026-09-29 |
