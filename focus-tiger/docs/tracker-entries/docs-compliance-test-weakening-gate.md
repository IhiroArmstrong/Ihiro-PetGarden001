# docs/compliance-test-weakening-gate

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| COMPLIANCE 硬约束索引 + 测试弱化闸 | 纯逻辑 | 仅单元测试覆盖 | **无用户路径。** 本条验收的是：新增测试放行；断言净减少 / 新增 skip / 删测试文件须 ack；过短 ack 无效；纯重命名不误报；`@ts-ignore` 在注释行仍提示；脚本出错退出码 2。不代表产品 UI 有变化。终端：`cd focus-tiger && node --test scripts/check-test-weakening.test.js`。 | — | — | — | `focus-tiger/docs/COMPLIANCE.md` · `scripts/check-test-weakening.mjs` | 2026-11-24 |
