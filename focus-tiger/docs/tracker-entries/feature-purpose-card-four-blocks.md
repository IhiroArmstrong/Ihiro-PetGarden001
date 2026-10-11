# feature/purpose-card-four-blocks

| 问号简介卡四层排版 | UI可见 | 待人工测试 | **主路径**：`?product=1` Idle 点「?」→ **0–1 秒内**见四块：品牌理念（正文不再斜体）、三行带箭头的列表（Help Center、免责摘要 + Medical disclaimer、Privacy）、版权三行、居中 Got it。点 Medical disclaimer → 现有免责全文（含 diagnose/treat/cure/prevent）。点 Privacy → 隐私页；点空白两张一起关。点 Help Center → 目录出现，不和简介卡叠两层。**Web / Safari 不见**桌面内存块。**Electron**：内存说明仍在理念和列表之间。**375**：可滚、可关。**回流**：Rise 后再点 ? 仍是四块。句子不改。自动化：`privacyNoticeCopy.test.js` 结构契约。 | — | — | — | `http://127.0.0.1:5173/?product=1` · `#onboarding-app-purpose` · Brief `task-purpose-card-four-blocks.md` | 2026-10-11 |
