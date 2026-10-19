# fix/confide-object-normalize-redirect-tts

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| T29 对象归一 + 跳转句朗读 + 只倾听 | UI / 文案 / 发送链 | 待人工测试 | **自动化已锁：** 目录名词空格/连字符/复数变体对象闸为真；`Where can I click to back up the data?` 在问卡可点桩下跳转；`his it` 不命中 `sit`；英文 38 句情绪闲聊 + gs-h01–h11 非跳转行跳转次数 0；`shouldSpeakConfideReply('help_center_redirect')` 为真，危机三路由仍假。终端：`cd focus-tiger && node --test src/core/confide/confideObjectNormalize.test.js src/core/confide/confideProductObject.test.js src/core/confide/confideGoldenScriptV1.test.js src/core/systemTtsBridge.test.js src/core/helpCenterAskSearch.test.js && npm run test:smoke`。**人补（Mac Electron 宽屏）：** 听一句备份跳转句被念出；听一句危机句仍静音；不问卡执行备份。Web / 窄屏只看跳转句文字、不念。合入后 10/24 再跑英文 60 + 安全回归。 | — | — | — | 宽屏 Electron `?product=1&confide=1` | 2026-10-20 |
