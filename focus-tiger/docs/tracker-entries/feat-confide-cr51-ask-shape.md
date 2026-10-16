# feat-confide-cr51-ask-shape

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Confide 问法形状轴扩档（CR-51 运行时） | 纯后端 / 逻辑 | 仅单元测试覆盖 | 本条验收的是形状判定：要不要排在动机闸前；多一档「比一比」。不代表仓外未见批 v3 已跑。终端：`node --test src/core/confide/confideProductAskRole.test.js src/core/confide/confideProductKnowledgeSemantic.test.js`。关单仍须未见批 v3；本机 Electron 抽测只补 1–2 句手感。 | — | — | 合入后待未见批 v3。 | 无用户路径（判定在发送链；宽屏倾诉） | 2026-10-16 |
