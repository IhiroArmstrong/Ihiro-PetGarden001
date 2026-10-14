# fix-confide-safety-literal-cjk-negation

| Confide 安全路由第一步 · 字面分类 + 中文邻接否定 | 纯后端 + UI可见路由 | 待人工测试 | **Electron 宽屏 Confide**（`?product=1&confide=1`）。**改动**：安全层补中文紧邻否定 + 明确危机短语，并排除口语对象用法（`想死你了` / `你去死吧` / `想让这个问题永远消失`；`烦死了` 本就不中）。**不**调否决 margin、**不**动 #1188。**主路径**：`我不想活了` / `想死` / `去死` 仍转介。**负例**：上列口语四句不得转介。发布：s-v1 过关前不得向真实用户发布。自动化：`confideSafetyKeywords.test.js` · `confideSafetyDevsetScore.test.js` · `npm run audit:confide-safety-devset`。 | — | — | — | `confideSafetyKeywords.js` · CR-43 | 2026-10-14 |
