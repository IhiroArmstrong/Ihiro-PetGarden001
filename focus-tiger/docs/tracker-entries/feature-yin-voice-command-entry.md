# feature/yin-voice-command-entry

| T10 Yin 语音指令入口 | UI可见 | 待人工测试 | **仅 Electron 宽屏 + 英语界面。** 停掉旧的桌面预览后重新打开桌面版。打开倾诉，说或输入 `Hi Yin, please backup`。0–1 秒内应看到复述句，并听到它。复述念完后才开始约 10 秒。说 Yes 才会下载备份文件。不说话，应听到并看到超时句（中文界面是「没听到，这次先不备份」；英语界面是对应英文）。再说 `Hi Ian, please backup`，应仍当普通倾诉，不备份。说 `Hi Yin, please open the Journey Log` 只打开记录。说切换语言后 5 秒内说 Cancel 应切回。专注中按 Control+Shift+Y，说 I'm done 应结束这场坐；只说 Stop 不应结束。付款、恢复覆盖、清空记忆都不应被这句话执行。 | — | — | [task-yin-voice-command-entry.md](../task-briefs/task-yin-voice-command-entry.md) | 2026-10-17 |

