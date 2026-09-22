| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 相关文件 | 完成日期 |
|---|---|---|---|---|---|---|---|---|
| Confide generate 失败不得回落隐私套话 | UI可见 | 待人工测试 | **仅 Electron 宽屏 · Confide ready。** **主路径**：发「有点烦，不想练习」一类复合情绪句 → 若 generate/sanitize 失败须回落 **观察/陪伴语料**（如「听见了。寅安静地点头。」或「坐一会儿。茶还热着。」），**禁止** `fallback-02`「你说的，留在这里。」。**对照**：正常 corpus 检索仍可用 fallback-02；`备份从哪里进？` 仍 0003。**回流**：同面板再发一句复合情绪句，连续两次失败也不得隐私套话。自动化：`confideReplyFlow.test.js`「never privacy disclaimer」。 | 2026-09-22 分析师：复合句 generate 失败掉进隐私免责声明 | — | — | `confideReplyFlow.js` · `confideCorpus.js` | 2026-09-22 |
