# feature/t76-help-sit-aliases

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| T76 B2 帮助中心静修别名 | UI可见 | 待人工测试 | **终端已覆盖**：问卡检索 `zazen` / `meditation` / `mindfulness` / `坐禅` / `瞑想` 必出 EDU-0003 + FUNC-0001；EDU-0003 短答含 quiet sit / no voice guidance，不含 generic meditation class。`helpCenterAskSearch.test.js` + `confideProductKnowledge.test.js` + e2e `help-center-quiet-sit-aliases.spec.js`。**人只补**：Safari 宽屏 `?product=1` → 问号右边 Help Center → 搜 `zazen` → 0–1 秒内见同坐卡；点开正文是「无语音指导的默坐」，不是「我们没有冥想」。回流：再搜 `backup` 仍出备份卡。 | — | — | — | `http://127.0.0.1:5173/?product=1` · `[data-testid=help-center-ask-input]` | 2026-11-03 |
