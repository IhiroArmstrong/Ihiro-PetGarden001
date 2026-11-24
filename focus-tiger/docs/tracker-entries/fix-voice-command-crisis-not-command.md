# fix/voice-command-crisis-not-command

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 相关文件 | 完成日期 |
|---|---|---|---|---|---|---|---|---|
| 倾诉称呼加备份/忘记全部不得夹走无关键词危机句 | 仅单元测试覆盖 | 待人工测试 | 终端：`node --test src/core/yinVoiceCommandEntry.test.js` 与 `npm run test:smoke`。锁：`Hey Yin, please forget everything I cannot keep going much longer` 与 backup 同形句 `channel=confide`，且 `matchesSafetyRedirect` 为假。无新按钮。可选：倾诉框发上述英文句，应走倾诉而非备份确认。 | 2026-11-24 只读审计缺口 3 | — | 本 PR 收口命令夹带 | `yinVoiceCommandEntry.js` | 2026-11-24 |
