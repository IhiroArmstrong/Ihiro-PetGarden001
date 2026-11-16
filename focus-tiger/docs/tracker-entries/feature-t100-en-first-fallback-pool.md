# feature/t100-en-first-fallback-pool

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| T100 首发只英语 + 回落池 6 句 | 纯后端 | 仅单元测试覆盖 | 本条验收的是闸仍未接到画面。`cd focus-tiger && node --test src/core/outputGate/outputGate.test.js`：用户语言不是英语（含中文、日文界面）走尚未开放句；英语用户看到模型吐韩语时走中性回落，不提日语未开放。回落池每语至少 6 句且自检不拦。不测界面。 | — | — | — | `focus-tiger/src/core/outputGate/outputGate.js` | 2026-11-16 |
