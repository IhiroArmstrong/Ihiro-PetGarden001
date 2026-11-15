# docs/t100-generation-inventory

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| T100 PR-1 生成路径盘点 | 纯文档 | 仅单元测试覆盖 | 本条验收的是登记表和只报告脚本对得上代码，不代表输出闸已接上、也不代表用户看见的句子已经变了。`cd focus-tiger && npm run check:generation-gate` 应打印 `drift=0` 和 `cloud-llm-result=已查、无`。读 [`GENERATION_SURFACES.md`](../GENERATION_SURFACES.md)。不测界面。 | — | — | — | `focus-tiger/docs/GENERATION_SURFACES.md` | 2026-11-15 |
