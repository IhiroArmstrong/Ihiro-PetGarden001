# feat/confide-semantic-crisis-layer

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Confide 语义危机层接到发送链 | UI可见 | 待人工测试 | **仅 Electron 宽屏 · embedding 已 ready。** **改动**：字面没拦住的明确自伤，够像人审短原型则走现网 safety-01；未就绪立刻字面。**主路径**：委婉自伤 → `data-route=safety_redirect` · 竖线 `#7a5340` · 不朗读。**对照**：`我想打人` 仍攻击；`想死你了` / `烦死了` / 想喝酒 不进热线。**回流**：关卡再开后再发。**冷启动**：embedding 未好时与切前字面相同。回滚：`FT_CONFIDE_SEMANTIC_CRISIS=off`。自动化：`confideSemanticCrisisLayer.test.js` · 泄漏扫描。开发集合计 ≥90% 须本机真 embedding（只打 id）。关单仍认 s-v1。 | — | — | — | Electron 宽屏 · Confide | 2026-10-14 |
