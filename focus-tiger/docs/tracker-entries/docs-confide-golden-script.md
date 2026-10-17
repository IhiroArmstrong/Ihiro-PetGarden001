# docs-confide-golden-script

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Confide 黄金脚本 v1（可见入库） | 纯文档 + 闸门单测 | 仅单元测试覆盖 | **无用户路径。** 本条验收的是句表已入库、CI 锁句数与通道、人工表与 JSON 同步。不代表现网每句已手测通过，也不代表发送链已改。终端：`node --test src/core/confide/confideGoldenScriptV1.test.js` + `npm run test:smoke`。人只在 Electron 宽屏抽 2026-10-15 那 11 句看「不得出现」。不要占 en/b-v6。 | — | — | — | [`CONFIDE_GOLDEN_SCRIPT.md`](../CONFIDE_GOLDEN_SCRIPT.md) · `fixtures/confide-golden-script-v1.json` | 2026-10-17 |
