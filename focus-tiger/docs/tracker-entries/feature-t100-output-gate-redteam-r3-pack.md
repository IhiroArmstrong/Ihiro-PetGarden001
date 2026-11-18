# feature/t100-output-gate-redteam-r3-pack

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| T100 第 3 轮题集入仓 | 纯后端 | 仅单元测试覆盖 | 本条验收的是封存题集入仓和字段对齐，**不是**闸已被验证，也不是第 3 轮已经跑完。`cd focus-tiger && node --test src/core/outputGate/outputGateRedteam.test.js`。sha256 须为 `12c97f70e8f4b3f5c02910d7fe1d7a41dfe988425471f75218bb53fa69717ee8`。主题 120、备用 20、多轮 6。题面与封存文件一致。不测界面。 | — | — | — | `focus-tiger/src/core/outputGate/outputGateRedteamPrompts.v3.json` | 2026-11-18 |
