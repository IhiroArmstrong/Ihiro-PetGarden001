# fix/voice-undo-toast-hit

| Voice command · 隐藏撤销条不得挡住旁边的点击 | UI可见 | 待人工测试 | **主路径**：微仪式打开后点 Leave，0–1 秒内仪式关掉，不记账。藏着的撤销条不得挡住这一下。**回流**：语音开表后撤销条出现的约 5 秒内，Undo 仍可点，点完回到时长面板；条消失后再点旁边按钮须能点到。单测：`VoiceCommandUndoToast.test.js`。visibility 微仪式分片锁 Leave 点击。 | — | — | — | `?product=1` 微仪式 Leave；Electron 宽屏语音 Undo | 2026-09-29 |
