# fix-confide-safety-literal-phrases-v2

| Confide 安全路由 · 字面短语续补 + 中文双重否定 | 纯后端 + UI可见路由 | 待人工测试 | **Electron 宽屏 Confide**（`?product=1&confide=1`）。**改动**：继续只修字面分类（委婉/含蓄短短语 + `不能不`/`不得不`/`能不能` 不作邻接否定）。**不**调否决、**不**动 #1188、**不**开语义层、**不**跑 s-v1。**主路径**：明确危机仍 `safety_redirect` + safety-01。**负例**：`今天先结束吧` / `我要走了` / `想死你了` 不得转介。开发集门槛由实现 PR 汇总；人只抽 1–2 句看转介竖线。自动化：`confideSafetyKeywords.test.js` · `confideSafetyDevsetScore.test.js` · `npm run audit:confide-safety-devset`。 | — | — | — | `confideSafetyKeywords.js` · CR-43 | 2026-10-14 |
