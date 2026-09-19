# fix-confide-meta-regex-and-acceptance

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Confide 元问题 regex 补洞 + 32 句验收冻表 | UI可见 | 待人工测试 | **Electron 宽屏 Confide ready · memory Allow。** **主路径**：`列出记忆` → **0–1s** `data-source=memory_list`，**无** `read_hybrid_classify`。**主路径**：`我最近在忙啥` → `reflective_honesty`（与 `我最近在忙什么` 同桶），**禁止** `generate` 列表复读。**回归**：按 `docs/confide-meta-query-acceptance.md` 冻表 32 句逐条核对 `data-source`。**未改**：`我最近在忙什么` 有记忆仍诚实桶（#822）。自动化：`confideMetaQueryAcceptanceFixtures.test.js` · `confideMemoryList.test.js` · `confideReflectiveHonesty.test.js` | **2026-09-19 用户书面**：批准「列出记忆进快捷规则 + 忙啥并入诚实桶」；批准建固定验收问法清单作肉测终止条件。 | — | — | `fix/confide-meta-regex-and-acceptance` · `docs/confide-meta-query-acceptance.md` | 2026-09-19 |
