# fix/mustard-seed-seal-375-compact

| 芥子须弥纪念印 · 375 紧凑布局 | UI可见 | 待人工测试 | **基线**：`fix/mustard-seed-seal-375-compact`（develop 上 Phase A+B 之后）。**主路径（375 · `?product=1`）**：`__mustardSeedSeal.open({ mode:'force' })` → 卡**无粗滚动条**；只见 locale 主语言诗 + 署名；**不见** `MUSTARD_SEED_SEAL_SAVE_NOTE` 段落；金章约 80px；**Save image** 与 **Continue** 首屏可点；遮罩可点关。**≥480**：双语主辅、save note、108px 章 — **与 Phase A/B 同**。**禁止**诗面改字。自动化：`MustardSeedSealCardUI.test.js`（窄屏 CSS 契约）。 | — | — | — | `?product=1` · `#mustard-seed-seal-card` · `__mustardSeedSeal` · 375 | 2026-09-07 |
