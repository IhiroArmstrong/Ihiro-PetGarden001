# feature/voice-command-duration-rules

| Voice command duration rules (say a sentence → how long to sit) | 仅单元测试覆盖 | 仅单元测试覆盖 | 本条验收的是英语句子如何判断坐多久，不代表画面上已有麦克风或已能开口开始专注。`cd focus-tiger && node --test src/core/voiceCommandDuration.test.js`：25 分钟、一小时、番茄钟、没说时长则追问、不限时、90 分钟、无关句不执行、Stop/Cancel 不支持、超过 24 小时拒绝。 | — | — | — | 无画面。规则见 [task-voice-command-routing.md](../task-briefs/task-voice-command-routing.md) | 2026-09-29 |
