# fix/language-panel-font · 2026-08-23

| Language 面板字体与全局 UI 统一 | UI可见 | 待人工测试 | **主路径（≥480 · `?product=1`）**：(1) 点右下地球或 ⋯/抽屉 Language → 面板标题「Language」、选项「English」「日本語」、按钮「Close」须与上方 Sanctuary marks / Support 等同为 **Nunito/无衬线**，**不得**再出现 Georgia/Times 衬线感；(2) 切换 ja/en 后字体仍一致。**375**：窄屏抽屉 Language 同验。**自动化**：`test:smoke` 绿；e2e `language-switch` 由 CI 锁功能。 | — | — | — | `http://127.0.0.1:5173/?product=1` · `#language-preference-panel` | 2026-08-23 |
