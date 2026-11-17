# feature/t100-output-gate-wire

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| T100 PR-3 生成路径过闸 | UI可见 | 待人工测试 | **主路径**：Electron 宽屏英文 Chat with Yin，发一句会走本地生成的闲聊 → 气泡是过闸后的短句，不是半句流出。**对照**：界面改成中文后再发闲聊 → 尚未开放句，不是模型原文。**回流**：关卡再开再发。自动化：`outputGate.test.js` · `wireGenerate.test.js` · `npm run check:generation-gate`。 | — | — | — | Electron 宽屏 `?product=1&confide=1` | 2026-11-16 |
